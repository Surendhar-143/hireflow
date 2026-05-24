import { httpPost } from '@/api/http'
import type { ApiResponse } from '@hireflow/types'

export interface SignedUrlResponse {
  uploadUrl: string
  path: string
  token: string
  publicUrl: string
}

export const uploadApi = {
  /**
   * Generates a signed upload URL for Supabase storage.
   */
  getSignedUrl: async (
    fileName: string,
    fileType: string,
    bucket: 'resumes' | 'logos' | 'covers'
  ): Promise<SignedUrlResponse> => {
    const res = await httpPost<ApiResponse<SignedUrlResponse>>('/uploads/sign', {
      fileName,
      fileType,
      bucket,
    })
    return res.data
  },

  /**
   * Uploads a file directly to Supabase using a signed URL.
   */
  uploadFile: async (
    file: File,
    bucket: 'resumes' | 'logos' | 'covers',
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    // 1. Get signed URL
    const signRes = await uploadApi.getSignedUrl(file.name, file.type, bucket)
    
    // 2. Perform direct binary upload to Supabase endpoint using PUT
    // We use XMLHttpRequest for fine-grained progress tracking
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', signRes.uploadUrl, true)
      xhr.setRequestHeader('Content-Type', file.type)

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)
            onProgress(percent)
          }
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(signRes.publicUrl)
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }

      xhr.onerror = () => {
        reject(new Error('Network error during file upload'))
      }

      xhr.send(file)
    })
  },
}
