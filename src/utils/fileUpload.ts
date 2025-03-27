import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { Request } from 'express'
import CustomError from '../../errors'
import { env } from 'process'

// File upload options interface
export interface FileUploadOptions {
  directory: string // Subdirectory inside uploads
  fieldName: string // Form field name
  maxSize?: number // Maximum file size in bytes
  fileTypes?: string[] // Allowed MIME types
  filename?: string // Custom filename (optional, will generate UUID if not provided)
}

const defaultOptions: Partial<FileUploadOptions> = {
  maxSize: 5 * 1024 * 1024, // 5MB
  fileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}

// Create upload directory if it doesn't exist
const createUploadDir = (dirPath: string): void => {
  const fullPath = path.join(__dirname, '../../', dirPath)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
  }
}

export const deleteFile = (filePath: string): void => {
  if (!filePath) return

  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(__dirname, '../../', filePath)

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath)
  }
}

export const configureFileUpload = (options: FileUploadOptions) => {
  // Merge with defaults
  const config = { ...defaultOptions, ...options }

  // Create upload directory path
  const uploadDir = `public/uploads/${config.directory}`
  createUploadDir(uploadDir)

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(__dirname, '../../', uploadDir))
    },
    filename: (_req, file, cb) => {
      const filename =
        config.filename || `${uuidv4()}${path.extname(file.originalname)}`
      cb(null, filename)
    },
  })

  const fileFilter = (
    _req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    // Check file type if allowed types are specified
    if (config.fileTypes && config.fileTypes.length > 0) {
      if (config.fileTypes.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(
          new Error(
            `Invalid file type. Allowed types: ${config.fileTypes.join(', ')}`
          )
        )
      }
    } else {
      cb(null, true)
    }
  }

  return multer({
    storage,
    limits: {
      fileSize: config.maxSize,
    },
    fileFilter,
  }).single(config.fieldName)
}

export const handleFileUpload = (
  req: Request,
  options: FileUploadOptions
): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const upload = configureFileUpload(options)

    upload(req, req, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return reject(
              new CustomError.BadRequestError(
                `File too large. Maximum size is ${
                  options.maxSize! / (1024 * 1024)
                }MB.`
              )
            )
          }
          return reject(
            new CustomError.BadRequestError(`Upload error: ${err.message}`)
          )
        }
        return reject(err)
      }

      if (!req.file) {
        return resolve(null) // No file uploaded
      }

      // Return the path relative to project root
      const filePath = `public/uploads/${options.directory}/${req.file.filename}`
      resolve(filePath)
    })
  })
}

// Get public URL for a file
export const getPublicUrl = (filePath: string, req?: Request): string => {
  if (!filePath) return ''
  if (filePath.startsWith('http')) return filePath
  const baseUrl = `${req?.protocol || 'http'}://${
    req?.get('host') || `localhost:${env.PORT}`
  }`
  return `${baseUrl}/${filePath.replace(/^public\//, '')}`
}

// Helper function to handle common file update scenario
export const handleFileUpdate = async (
  req: Request,
  options: FileUploadOptions,
  currentFilePath: string | null | undefined
): Promise<{ filePath: string | null; fileUrl: string | null }> => {
  const newFilePath = await handleFileUpload(req, options)

  if (newFilePath && currentFilePath) {
    deleteFile(currentFilePath)
  }

  const fileUrl = newFilePath ? getPublicUrl(newFilePath, req) : null

  return { filePath: newFilePath, fileUrl }
}
