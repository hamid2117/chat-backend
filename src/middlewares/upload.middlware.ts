import { Request, Response, NextFunction } from 'express'
import { configureFileUpload, FileUploadOptions } from '../utils/fileUpload'

export const uploadMiddleware = (options: FileUploadOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const upload = configureFileUpload(options)

    upload(req, res, (err) => {
      if (err) {
        return next(err)
      }

      if (req.file) {
        const relativePath = `public/uploads/${options.directory}/${req.file.filename}`
        req.filePath = relativePath
      }

      next()
    })
  }
}
