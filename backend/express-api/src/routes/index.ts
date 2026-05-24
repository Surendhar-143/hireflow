import { Router } from 'express'
import { sendSuccess } from '../utils/response'
import { companyRouter } from './company.routes'
import { jobRouter } from './job.routes'
import { searchRouter } from './search.routes'
import { applicationRouter } from './application.routes'
import { uploadRouter } from './upload.routes'
import { recruiterRouter } from './recruiter.routes'
import { candidateRouter } from './candidate.routes'
import { notificationRouter } from './notification.routes'
import { aiRouter } from './ai.routes'
import { authRouter } from './auth.routes'
import { adminRouter } from './admin.routes'

export const apiRouter = Router()

// Health Check
apiRouter.get('/health', (req, res) => {
  return sendSuccess(
    res,
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'express-api-gateway',
      version: '1.0.0',
    },
    'Gateway operational'
  )
})

// Sub-routes mounting
apiRouter.use('/auth', authRouter)
apiRouter.use('/companies', companyRouter)
apiRouter.use('/jobs', jobRouter)
apiRouter.use('/search', searchRouter)
apiRouter.use('/applications', applicationRouter)
apiRouter.use('/uploads', uploadRouter)
apiRouter.use('/recruiter', recruiterRouter)
apiRouter.use('/candidates', candidateRouter)
apiRouter.use('/notifications', notificationRouter)
apiRouter.use('/ai', aiRouter)
apiRouter.use('/admin', adminRouter)

export default apiRouter
