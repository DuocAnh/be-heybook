import fs from 'fs'
import path from 'path'
import { env } from '~/config/environment'

/**
 * Provider for handling local file uploads and deletions.
 * Files are saved under `public/images/<folderName>`.
 * Returns full URL paths for direct use in <img> src.
 */
const BASE_UPLOAD_DIR = path.resolve(__dirname, '..', '..', 'public', 'images')
const BASE_URL = env.BASE_URL || 'http://localhost:3000'

/**
 * Uploads a file buffer to local storage under public/images.
 * @param fileBuffer - The file data as a Buffer.
 * @param folderName - Subdirectory under the public/images directory.
 * @param originalName - Original filename (to preserve extension).
 * @returns An object containing the saved file's disk path, public URL, and filename.
 */
export async function uploadImage(fileBuffer, folderName, originalName) {
  // Ensure the target folder exists under public/images
  const targetDir = path.join(BASE_UPLOAD_DIR, folderName)
  fs.mkdirSync(targetDir, { recursive: true })

  // Generate a unique filename preserving extension
  const ext = path.extname(originalName)
  const baseName = path.basename(originalName, ext)
  const filename = `${Date.now()}-${baseName}${ext}`

  // Absolute disk path
  const fullPath = path.join(targetDir, filename)

  // Write the file buffer to disk
  await fs.promises.writeFile(fullPath, fileBuffer)

  // Construct public URL for <img src>
  const fileUrl = `${BASE_URL}/images/${folderName}/${filename}`

  return { filename, fullPath, fileUrl }
}

/**
 * Deletes a file from local storage given its public URL.
 * @param fileUrl - Full public URL of the uploaded file.
 */
export async function deleteImage(fileUrl) {
  try {
    const urlPath = new URL(fileUrl).pathname
    const relative = urlPath.replace(/^\/images\//, '')
    const fullPath = path.join(BASE_UPLOAD_DIR, relative)
    await fs.promises.unlink(fullPath)
  } catch (err) {
    console.warn(`Failed to delete file from ${fileUrl}:`, err)
  }
}

export const UploadImageProvider = {
  uploadImage,
  deleteImage
}
