import { supabase } from './supabaseClient'

const CLOUD = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim()
const PRESET = (import.meta.env.VITE_CLOUDINARY_PRESET || '').trim()

// Resize to max 1200px and convert to WebP (about 100-200 KB per photo)
async function compress(file, maxSize = 1200, quality = 0.82) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
  if (!blob) throw new Error('Could not process this image.')
  return blob
}

export async function uploadImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.')
  if (file.size > 20 * 1024 * 1024) throw new Error('Image is too large (max 20 MB).')

  const blob = await compress(file)

  // Option 1: Cloudinary (big free storage)
  if (CLOUD && PRESET) {
    const body = new FormData()
    body.append('file', blob)
    body.append('upload_preset', PRESET)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
      method: 'POST',
      body,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || 'Cloudinary upload failed.')

    // f_auto,q_auto = smallest format and quality automatically
    return data.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_1200/')
  }

  // Option 2: Supabase Storage (fallback)
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`
  const { error } = await supabase.storage
    .from('products')
    .upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000' })
  if (error) throw error

  return supabase.storage.from('products').getPublicUrl(path).data.publicUrl
}