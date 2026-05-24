import { User, CandidateProfile, RecruiterProfile } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: User & {
        candidateProfile?: CandidateProfile | null
        recruiterProfile?: RecruiterProfile | null
      }
    }
  }
}
