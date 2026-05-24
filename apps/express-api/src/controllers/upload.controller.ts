import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'
import { sendSuccess } from '../utils/response'
import { AppError } from '../errors/AppError'

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
}
export default UploadController
