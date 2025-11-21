"use server"

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { RESOURCE_TYPES, SEMESTERS } from '../constants'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/png',
  'image/jpeg'
]

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerActionClient({
    cookies: () => cookieStore
  })
}

export async function uploadDocument(formData) {
  // 1. Extracción de datos (Igual que antes)
  const file = formData.get('file')
  const title = (formData.get('title') || '').toString().trim()
  const description = (formData.get('description') || '').toString().trim()
  const subject = (formData.get('subject') || '').toString().trim()
  const resourceType = (formData.get('resourceType') || '').toString()
  const semester = (formData.get('semester') || '').toString()
  // const career = (formData.get('career') || '').toString()

  // 2. Validaciones (Igual que antes)
  if (!file || typeof file === 'string') return { error: 'Tienes que seleccionar un archivo' }
  if (!subject) return { error: 'Tienes que ingresar la materia' }
  if (!resourceType || !RESOURCE_TYPES.includes(resourceType)) return { error: 'Tienes que seleccionar el tipo de recurso' }
  if (!semester || !SEMESTERS.includes(semester)) return { error: 'Tienes que seleccionar el semestre' }
  // if (!career || !CAREERS.includes(career)) return { error: 'Tienes que seleccionar la carrera' }
  if (file.size > MAX_FILE_SIZE) return { error: 'El archivo excede el límite de 20MB' }
  if (file.type && !ALLOWED_TYPES.includes(file.type)) return { error: 'Tipo de archivo no permitido' }

  try {
    const supabase = await getSupabase()
    
    // 3. Verificar Usuario
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return { error: 'No autenticado' }

    // 4. Prepare upload to Storage
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Clean strings for file path
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase()
    // const safeCareer = career.replace(/\s+/g, '-').toLowerCase()
    const safeSubject = subject.replace(/\s+/g, '-').toLowerCase()
    
    // Path: user-uploads/user_id/career/subject/timestamp-name
    const path = `user-uploads/${user.id}/${safeSubject}/${Date.now()}-${sanitizedName}`

    // 5. UPLOAD TO STORAGE
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(path, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false
      })

    if (uploadError) return { error: `Error subiendo archivo: ${uploadError.message}` }

    // 6. Obtener URL Pública
    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(path)

    // 7. INSERTAR EN BASE DE DATOS
    const { error: dbError } = await supabase
      .from('documents') 
      .insert({
        title: title || file.name,
        description: description || null,
        subject,
        resource_type: resourceType, 
        semester,
        file_path: path,
        file_url: publicUrlData.publicUrl,
        user_id: user.id
      })

    if (dbError) {
      console.error('Error DB:', dbError)
      return { error: 'El archivo se subió, pero falló al guardar los datos.' }
    }

    revalidatePath('/user')
    
    return {
      success: true,
      message: 'Documento subido y registrado correctamente',
      // url: publicUrlData?.publicUrl,
      // title: title || file.name,
      // subject, 
      // resourceType,
      // semester,
    }

  } catch (error) {
    console.error(error)
    return { error: error.message || 'Error procesando la solicitud' }
  }
}