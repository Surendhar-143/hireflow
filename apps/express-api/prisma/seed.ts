import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clean existing data to avoid unique constraint violations
  console.log('🧹 Cleaning existing tables...')
  await prisma.notification.deleteMany()
  await prisma.savedJob.deleteMany()
  await prisma.recommendation.deleteMany()
  await prisma.jobAnalytics.deleteMany()
  await prisma.companyAnalytics.deleteMany()
  await prisma.candidateActivity.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.applicationEvent.deleteMany()
  await prisma.application.deleteMany()
  await prisma.job.deleteMany()
  await prisma.recruiterProfile.deleteMany()
  await prisma.candidateProfile.deleteMany()
  await prisma.company.deleteMany()
  await prisma.user.deleteMany()

  // 1. Seed Core Companies
  console.log('🏢 Seeding companies...')
  const companies = [
    {
      name: 'Stripe',
      slug: 'stripe',
      industry: 'Financial Technology',
      size: 'enterprise',
      verified: true,
      description: 'Stripe is a financial infrastructure platform for the internet. Millions of companies—from the world’s largest enterprises to the most ambitious startups—use Stripe to accept payments, grow their revenue, and accelerate new business opportunities.',
      website: 'https://stripe.com',
      location: 'San Francisco, CA',
      techStack: ['Ruby', 'Go', 'React', 'TypeScript', 'Java'],
    },
    {
      name: 'Linear',
      slug: 'linear',
      industry: 'Software Tools',
      size: 'small',
      verified: true,
      description: 'Linear helps software teams streamline projects, tasks, bugs, and product roadmaps. It’s built for high-performance teams and is designed to feel elegant, fast, and responsive.',
      website: 'https://linear.app',
      location: 'Remote / San Francisco',
      techStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'GraphQL'],
    },
    {
      name: 'Notion',
      slug: 'notion',
      industry: 'Productivity Software',
      size: 'medium',
      verified: true,
      description: 'Notion is a single space where you can think, write, and plan. Capture thoughts, manage projects, or even run an entire company—and customize it exactly the way you want.',
      website: 'https://notion.so',
      location: 'San Francisco, CA',
      techStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
    },
  ]

  const seededCompanies = []
  for (const c of companies) {
    const comp = await prisma.company.create({ data: c })
    seededCompanies.push(comp)
  }

  const stripe = seededCompanies.find((c) => c.slug === 'stripe')!
  const linear = seededCompanies.find((c) => c.slug === 'linear')!
  const notion = seededCompanies.find((c) => c.slug === 'notion')!

  // 2. Seed Jobs
  console.log('💼 Seeding jobs...')
  const jobs = [
    {
      title: 'Senior React Developer',
      slug: 'senior-react-developer-linear',
      companyId: linear.id,
      description: 'We are looking for an exceptional Senior React Developer to join our core product team. You will lead the development of high-performance frontend interfaces, collaborate closely with design to craft fluid micro-interactions, and optimize app bundle sizes to keep the application feeling instant.',
      requirements: [
        '5+ years of software engineering experience focusing on React.',
        'Expert understanding of state management tools and react reconciliation.',
        'Strong design sensibilities and experience building smooth UI micro-animations.',
      ],
      benefits: [
        'Competitive salary and equity options.',
        'Fully remote working environment with home office stipend.',
        'Comprehensive premium health, dental, and vision insurance.',
      ],
      skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Zustand', 'Framer Motion'],
      type: 'full-time',
      workMode: 'remote',
      experienceLevel: 'senior',
      salaryMin: 140000,
      salaryMax: 180000,
      location: 'Remote (US/Europe)',
      featured: true,
    },
    {
      title: 'Staff Full-Stack Software Engineer',
      slug: 'staff-fullstack-engineer-notion',
      companyId: notion.id,
      description: 'Notion is seeking a Staff Full-Stack Engineer to architect collaborative product features. You will design real-time synchronization mechanics, manage database scaling patterns, and write clean, modular APIs in Node.js and TypeScript.',
      requirements: [
        '8+ years of experience building scalable backend APIs and interactive frontends.',
        'Deep knowledge of relational database architectures and query optimization passes.',
        'Experience leading teams and establishing engineering contribution guidelines.',
      ],
      benefits: [
        'Generous compensation packages including stock option awards.',
        'Uncapped paid time off and quarterly health grants.',
        'Catered lunches and collaborative workspaces in downtown SF.',
      ],
      skills: ['Node.js', 'TypeScript', 'React', 'PostgreSQL', 'Prisma', 'Redis'],
      type: 'full-time',
      workMode: 'hybrid',
      experienceLevel: 'lead',
      salaryMin: 180000,
      salaryMax: 240000,
      location: 'San Francisco, CA',
      featured: true,
    },
    {
      title: 'Platform Infrastructure Engineer',
      slug: 'platform-infrastructure-engineer-stripe',
      companyId: stripe.id,
      description: 'Join the Stripe platform engineering team to build stable foundation layers. You will manage high-throughput services, configure robust retry-and-timeout patterns, write automated pipeline checks, and maintain reliable developer SDK endpoints.',
      requirements: [
        '4+ years of experience focusing on backend infrastructure or cloud architectures.',
        'Experience with container orchestrations (Docker, Kubernetes) and CI/CD tools.',
        'Solid programming skills in Go or Ruby.',
      ],
      benefits: [
        'Premium base salary and stock units.',
        'Wellness stipends and learning development budget.',
        'Excellent family-friendly benefits and parent leaves.',
      ],
      skills: ['Go', 'Docker', 'Kubernetes', 'AWS', 'Ruby', 'CI/CD'],
      type: 'full-time',
      workMode: 'onsite',
      experienceLevel: 'mid',
      salaryMin: 130000,
      salaryMax: 165000,
      location: 'San Francisco, CA',
      featured: false,
    },
  ]

  for (const j of jobs) {
    await prisma.job.create({ data: j })
  }

  // 3. Seed Mock Users
  console.log('👤 Seeding users and profiles...')

  // Seed Mock Recruiter
  const recruiterUser = await prisma.user.create({
    data: {
      email: 'mock.recruiter@hireflow.dev',
      name: 'Sarah Recruiter',
      role: 'recruiter',
      onboardingCompleted: true,
      recruiterProfile: {
        create: {
          companyId: notion.id,
          title: 'Senior Talent Partner',
          bio: 'Passionate about matching great talent with Notion engineering teams.',
        },
      },
    },
    include: {
      recruiterProfile: true,
    },
  })

  // Seed Mock Candidate
  const candidateUser = await prisma.user.create({
    data: {
      email: 'mock.candidate@hireflow.dev',
      name: 'Alex Candidate',
      role: 'candidate',
      onboardingCompleted: true,
      candidateProfile: {
        create: {
          headline: 'Product-Focused Full-Stack Developer',
          bio: 'Self-motivated engineer specializing in building high-performance, accessible, and delightful React apps.',
          location: 'New York, NY',
          skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'CSS'],
          openToWork: true,
          expectedSalaryMin: 120000,
          expectedSalaryMax: 160000,
          profileCompletionScore: 90,
          experience: [
            {
              id: 'exp-seed-1',
              title: 'Software Engineer',
              company: 'Vercel',
              startDate: '2022-06-01',
              current: true,
              description: 'Developed developer experience components and deployment interfaces.',
              skills: ['React', 'TypeScript'],
            },
          ],
          education: [
            {
              id: 'edu-seed-1',
              institution: 'New York University',
              degree: 'Bachelor of Science',
              field: 'Computer Science',
              startYear: 2018,
              endYear: 2022,
              current: false,
            },
          ],
        },
      },
    },
    include: {
      candidateProfile: true,
    },
  })

  // 4. Seed Applications & Relational Events
  console.log('📝 Seeding applications and workflow events...')
  const seededJobs = await prisma.job.findMany()
  const reactJob = seededJobs.find((j) => j.slug === 'senior-react-developer-linear')!
  const staffJob = seededJobs.find((j) => j.slug === 'staff-fullstack-engineer-notion')!

  const application = await prisma.application.create({
    data: {
      jobId: reactJob.id,
      candidateId: candidateUser.candidateProfile!.id,
      status: 'interview',
      coverLetter: 'I am extremely excited about the Senior React Developer role at Linear. I have extensive experience building premium interfaces and micro-interactions.',
      resumeUrl: 'https://hireflow.dev/resumes/alex-candidate.pdf',
      aiScore: 88.5,
      events: {
        createMany: {
          data: [
            {
              status: 'applied',
              note: 'Application submitted via HireFlow.',
              actor: 'candidate',
              createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            },
            {
              status: 'screening',
              note: 'Resume matches initial requirements. Moving to screening.',
              actor: 'recruiter',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
            {
              status: 'interview',
              note: 'First round technical interview scheduled for tomorrow.',
              actor: 'recruiter',
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            },
          ],
        },
      },
    },
  })

  await prisma.job.update({
    where: { id: reactJob.id },
    data: { applicantCount: { increment: 1 } },
  })

  // 5. Seed Saved Jobs
  console.log('⭐️ Seeding saved jobs...')
  await prisma.savedJob.create({
    data: {
      candidateId: candidateUser.candidateProfile!.id,
      jobId: staffJob.id,
    },
  })

  // 6. Seed Notifications
  console.log('🔔 Seeding notifications...')
  await prisma.notification.createMany({
    data: [
      {
        userId: candidateUser.id,
        title: 'Interview Scheduled',
        message: 'Your interview for the Senior React Developer role at Linear has been scheduled.',
        type: 'application_status',
        read: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: candidateUser.id,
        title: 'New Recommendation Alert',
        message: 'We found a new job that matches your profile: Staff Full-Stack Software Engineer at Notion.',
        type: 'recommendation',
        read: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: recruiterUser.id,
        title: 'New Application Received',
        message: 'Alex Candidate has applied for the Senior React Developer role at Linear.',
        type: 'application_status',
        read: false,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    ],
  })

  // 7. Seed Job Analytics
  console.log('📊 Seeding job analytics...')
  const infraJob = seededJobs.find((j) => j.slug === 'platform-infrastructure-engineer-stripe')!
  await prisma.jobAnalytics.createMany({
    data: [
      {
        jobId: reactJob.id,
        viewCount: 150,
        applicantCount: 1,
        conversionRate: 1 / 150,
      },
      {
        jobId: staffJob.id,
        viewCount: 320,
        applicantCount: 0,
        conversionRate: 0.0,
      },
      {
        jobId: infraJob.id,
        viewCount: 95,
        applicantCount: 0,
        conversionRate: 0.0,
      },
    ],
  })

  // 8. Seed Company Analytics
  console.log('🏢 Seeding company analytics...')
  await prisma.companyAnalytics.createMany({
    data: [
      {
        companyId: linear.id,
        totalJobs: 1,
        activeJobs: 1,
        totalApplications: 1,
        averageConversion: 1 / 150,
      },
      {
        companyId: notion.id,
        totalJobs: 1,
        activeJobs: 1,
        totalApplications: 0,
        averageConversion: 0.0,
      },
      {
        companyId: stripe.id,
        totalJobs: 1,
        activeJobs: 1,
        totalApplications: 0,
        averageConversion: 0.0,
      },
    ],
  })

  // 9. Seed Candidate Activity
  console.log('🏃‍♂️ Seeding candidate activities...')
  await prisma.candidateActivity.create({
    data: {
      candidateId: candidateUser.candidateProfile!.id,
      jobsSavedCount: 1,
      appsSubmitted: 1,
      lastActiveAt: new Date(),
    },
  })

  // 10. Seed AI Match Recommendations
  console.log('🤖 Seeding candidate recommendations...')
  await prisma.recommendation.createMany({
    data: [
      {
        candidateId: candidateUser.candidateProfile!.id,
        jobId: reactJob.id,
        overallScore: 88.5,
        skillsScore: 90.0,
        experienceScore: 85.0,
        descriptionScore: 88.0,
        status: 'applied',
      },
      {
        candidateId: candidateUser.candidateProfile!.id,
        jobId: staffJob.id,
        overallScore: 82.3,
        skillsScore: 80.0,
        experienceScore: 78.0,
        descriptionScore: 85.0,
        status: 'suggested',
      },
      {
        candidateId: candidateUser.candidateProfile!.id,
        jobId: infraJob.id,
        overallScore: 45.2,
        skillsScore: 30.0,
        experienceScore: 60.0,
        descriptionScore: 50.0,
        status: 'suggested',
      },
    ],
  })

  // 11. Seed Audit Logs
  console.log('🛡️ Seeding audit logs...')
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: candidateUser.id,
        action: 'auth.onboard',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        resourceType: 'User',
        resourceId: candidateUser.id,
        payload: { role: 'candidate' },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        actorId: recruiterUser.id,
        action: 'auth.onboard',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        resourceType: 'User',
        resourceId: recruiterUser.id,
        payload: { role: 'recruiter' },
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        actorId: candidateUser.id,
        action: 'application.submit',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        resourceType: 'Application',
        resourceId: application.id,
        payload: { jobId: reactJob.id },
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    ],
  })

  console.log('✅ Database seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
