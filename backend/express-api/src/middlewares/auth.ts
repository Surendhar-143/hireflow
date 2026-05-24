import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'
import { prisma } from '../lib/prisma'
import { AppError } from '../errors/AppError'
import { config } from '../config'
import { logger } from '../utils/logger'

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No authorization token provided', 401)
    }

    const token = authHeader.split(' ')[1]

    // Handle Mock Authentication in non-production environments
    if (config.NODE_ENV !== 'production' && token.startsWith('mock-')) {
      let email = 'mock.user@hireflow.dev'
      let name = 'Mock User'
      let role = 'candidate'
      let onboardingCompleted = false

      if (token.includes('candidate')) {
        email = 'mock.candidate@hireflow.dev'
        name = 'Mock Candidate'
        role = 'candidate'
        onboardingCompleted = true
      } else if (token.includes('recruiter')) {
        email = 'mock.recruiter@hireflow.dev'
        name = 'Mock Recruiter'
        role = 'recruiter'
        onboardingCompleted = true
      }

      // Check if mock user already exists
      let dbUser = await prisma.user.findUnique({
        where: { email },
        include: {
          candidateProfile: true,
          recruiterProfile: true,
        },
      })

      // If mock user doesn't exist, create it and seed the profile
      if (!dbUser) {
        logger.info({ email, role }, 'Creating and seeding mock user in database')
        dbUser = await prisma.user.create({
          data: {
            email,
            name,
            role,
            onboardingCompleted,
          },
          include: {
            candidateProfile: true,
            recruiterProfile: true,
          },
        })

        // Seed Candidate or Recruiter profiles
        if (role === 'candidate') {
          await prisma.candidateProfile.create({
            data: {
              userId: dbUser.id,
              headline: 'Full-Stack Software Engineer',
              bio: 'Experienced developer specializing in React and Node.js.',
              location: 'Remote',
              skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
              experience: [
                {
                  id: 'exp-mock-1',
                  title: 'Senior Engineer',
                  company: 'Acme Corp',
                  startDate: '2023-01-01',
                  current: true,
                  skills: ['React', 'Node.js'],
                },
              ],
              education: [
                {
                  id: 'edu-mock-1',
                  institution: 'Stanford University',
                  degree: 'Bachelor of Science',
                  field: 'Computer Science',
                  startYear: 2018,
                  endYear: 2022,
                  current: false,
                },
              ],
              profileCompletionScore: 85,
            },
          })
        } else if (role === 'recruiter') {
          // Find or create a mock company to link the recruiter to
          let company = await prisma.company.findFirst({
            where: { slug: 'mock-tech-corp' },
          })

          if (!company) {
            company = await prisma.company.create({
              data: {
                name: 'Mock Tech Corp',
                slug: 'mock-tech-corp',
                industry: 'Software Engineering',
                size: 'medium',
                verified: true,
                description: 'A cutting-edge tech startup building great products.',
                website: 'https://mocktechcorp.com',
                location: 'San Francisco, CA',
              },
            })
          }

          await prisma.recruiterProfile.create({
            data: {
              userId: dbUser.id,
              companyId: company.id,
              title: 'Head of Talent',
              bio: 'Looking for great engineers to join our growing team.',
            },
          })
        }

        // Re-query to get the populated profiles
        dbUser = await prisma.user.findUnique({
          where: { email },
          include: {
            candidateProfile: true,
            recruiterProfile: true,
          },
        }) as any
      }

      req.user = dbUser!
      return next()
    }

    // Call Supabase to verify JWT and retrieve Supabase User details
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token)
    if (error || !supabaseUser) {
      throw new AppError('Invalid or expired authentication token', 401)
    }

    // Look up matching user in our local PostgreSQL database
    let dbUser = await prisma.user.findUnique({
      where: { email: supabaseUser.email },
      include: {
        candidateProfile: true,
        recruiterProfile: true,
      },
    })

    // If User is not in our database yet (signed up via Supabase, first API request)
    if (!dbUser) {
      logger.info({ email: supabaseUser.email }, 'Syncing new authenticated Supabase user to PostgreSQL')
      
      const role = supabaseUser.user_metadata?.default_role || 'candidate'
      const name = supabaseUser.user_metadata?.full_name || supabaseUser.email!.split('@')[0]

      if (role === 'recruiter') {
        dbUser = await prisma.$transaction(async (tx) => {
          const u = await tx.user.create({
            data: {
              id: supabaseUser.id,
              email: supabaseUser.email!,
              name,
              role: 'recruiter',
              onboardingCompleted: true,
            },
          })

          // Find or create a default company for the recruiter
          let company = await tx.company.findFirst({
            where: { slug: 'my-tech-company' },
          })

          if (!company) {
            company = await tx.company.create({
              data: {
                name: 'My Tech Company',
                slug: 'my-tech-company',
                industry: 'Technology',
                size: 'small',
                location: 'Remote',
              },
            })
          }

          await tx.recruiterProfile.create({
            data: {
              userId: u.id,
              companyId: company.id,
              title: 'Recruiter',
              bio: '',
            },
          })

          return tx.user.findUnique({
            where: { id: u.id },
            include: {
              candidateProfile: true,
              recruiterProfile: true,
            },
          }) as any
        })
      } else {
        dbUser = await prisma.user.create({
          data: {
            id: supabaseUser.id, // Synchronize Supabase Auth UUID to local DB
            email: supabaseUser.email!,
            name,
            role: 'candidate', // Default fallback role
            onboardingCompleted: false,
          },
          include: {
            candidateProfile: true,
            recruiterProfile: true,
          },
        })
      }
    }

    if (!dbUser) {
      throw new AppError('Authentication failed: user profile not found', 401)
    }

    req.user = dbUser
    next()
  } catch (error) {
    next(error)
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401))
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: Insufficient permissions', 403))
    }

    next()
  }
}

export function requireOnboarded(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError('Authentication required', 401))
  }

  if (!req.user.onboardingCompleted) {
    return next(new AppError('Forbidden: Please complete onboarding first', 403))
  }

  next()
}
