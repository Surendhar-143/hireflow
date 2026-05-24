import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'
import { sendSuccess } from '../utils/response'
import { AppError } from '../errors/AppError'
import { prisma } from '../lib/prisma'

export class UploadController {
  async getSignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileName, fileType, bucket } = req.body

      if (!fileName || !fileType || !bucket) {
        throw new AppError('fileName, fileType, and bucket are required', 400)
      }

      const allowedBuckets = ['resumes', 'logos', 'covers']
      if (!allowedBuckets.includes(bucket)) {
        throw new AppError('Invalid upload bucket', 400)
      }

      // Enforce file validations
      if (bucket === 'resumes' && fileType !== 'application/pdf') {
        throw new AppError('Resumes bucket only accepts PDF files', 400)
      }

      const imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      if ((bucket === 'logos' || bucket === 'covers') && !imageTypes.includes(fileType)) {
        throw new AppError('Images bucket only accepts standard image formats', 400)
      }

      // Sanitize file name and prepend time marker to avoid collisions
      const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
      const path = `${Date.now()}-${cleanFileName}`

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(path)

      if (error) {
        throw new AppError(`Supabase Storage error: ${error.message}`, 500)
      }

      return sendSuccess(
        res,
        {
          uploadUrl: data.signedUrl,
          path,
          token: data.token,
          publicUrl: supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl,
        },
        'Signed upload URL generated'
      )
    } catch (error) {
      next(error)
    }
  }

  async getSignedReadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { path, bucket } = req.query as { path: string; bucket: string }

      if (!path || !bucket) {
        throw new AppError('path and bucket are required', 400)
      }

      const allowedBuckets = ['resumes', 'logos', 'covers']
      if (!allowedBuckets.includes(bucket)) {
        throw new AppError('Invalid bucket name', 400)
      }

      // Secure bucket access checks:
      // If the bucket is 'resumes', only let the owning candidate, platform admins, or recruiters with active company applications access it.
      if (bucket === 'resumes' && req.user?.role !== 'admin') {
        if (req.user?.role === 'candidate') {
          const profile = req.user.candidateProfile
          const resumePath = profile?.resumeUrl || ''
          if (!resumePath.includes(path)) {
            throw new AppError('Forbidden: You can only access your own resume', 403)
          }
        } else if (req.user?.role === 'recruiter') {
          const companyId = req.user.recruiterProfile?.companyId
          if (!companyId) {
            throw new AppError('Forbidden: Recruiter organization required', 403)
          }
          
          // Check if this resume belongs to a candidate who has applied to a job of this recruiter's company
          const application = await prisma.application.findFirst({
            where: {
              resumeUrl: { contains: path },
              job: { companyId }
            }
          })

          const candidateProfile = await prisma.candidateProfile.findFirst({
            where: {
              resumeUrl: { contains: path }
            }
          })

          if (!application && (!candidateProfile || !(await prisma.application.findFirst({
            where: {
              candidateId: candidateProfile.id,
              job: { companyId }
            }
          })))) {
            throw new AppError('Forbidden: Candidate has not applied to your company', 403)
          }
        }
      }

      // Generate signed read URL for 15 minutes
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 15 * 60)

      if (error) {
        throw new AppError(`Supabase Storage error: ${error.message}`, 500)
      }

      return sendSuccess(res, { signedUrl: data.signedUrl }, 'Signed read URL retrieved')
    } catch (error) {
      next(error)
    }
  }
}
export default UploadController
