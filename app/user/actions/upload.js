"use server"

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { RESOURCE_TYPES, SEMESTERS, CAREERS } from '../constants'

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
  const file = formData.get('file')
  const title = (formData.get('title') || '').toString().trim()
  const description = (formData.get('description') || '').toString().trim()
  const subject = (formData.get('subject') || '').toString().trim()
  const resourceType = (formData.get('resourceType') || '').toString()
  const semester = (formData.get('semester') || '').toString()
  const career = (formData.get('career') || '').toString()

  if (!file || typeof file === 'string') {
    return { error: 'Debes seleccionar un archivo' }
  }

  if (!subject) {
    return { error: 'Ingresa la materia' }
  }

  if (!resourceType || !RESOURCE_TYPES.includes(resourceType)) {
    return { error: 'Selecciona el tipo de recurso' }
  }

  if (!semester || !SEMESTERS.includes(semester)) {
    return { error: 'Selecciona el semestre' }
  }

  if (!career || !CAREERS.includes(career)) {
    return { error: 'Selecciona la carrera' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: 'El archivo supera el limite de 20MB' }
  }

  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Tipo de archivo no permitido' }
  }

  try {
    const supabase = await getSupabase()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: 'No autenticado' }
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const sanitizedName = file.name.replace(/\s+/g, '-')
    const safeSubject = subject.replace(/\s+/g, '-')
    const safeType = resourceType.replace(/\s+/g, '-')
    const safeCareer = career.replace(/\s+/g, '-')
    const path = `user-uploads/${user.id}/${safeCareer}/${safeSubject}/${safeType}/${Date.now()}-${sanitizedName}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(path, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false
      })

    if (uploadError) {
      return { error: uploadError.message }
    }

    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(path)

    revalidatePath('/user')

    return {
      success: true,
      message: 'Documento subido correctamente',
      url: publicUrlData?.publicUrl,
      path,
      title: title || file.name,
      description,
      subject,
      resourceType,
      semester,
      career
    }
  } catch (error) {
    return { error: error.message || 'Error subiendo el archivo' }
  }
}
