"use server"

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerActionClient({ cookies: () => cookieStore })
}

// ============================================
// SIGN UP - Registro de usuario
// ============================================
export async function signUp(formData) {
  const email = formData.get('email')?.toLowerCase().trim()
  const password = formData.get('password')
  const fullName = formData.get('fullName')?.trim()
  const career = formData.get('career')

  // Validaciones
  if (!email || !password || !fullName || !career) {
    return { error: 'Todos los campos son requeridos' }
  }

  if (!email.endsWith('@epn.edu.ec')) {
    return { error: 'Solo se permiten correos institucionales @epn.edu.ec' }
  }

  if (password.length < 9) {
    return { error: 'La contraseña debe tener al menos 9 caracteres' }
  }

  if (!/[A-Z]/.test(password)) {
    return { error: 'La contraseña debe contener al menos una mayúscula' }
  }

  if (!/[a-z]/.test(password)) {
    return { error: 'La contraseña debe contener al menos una minúscula' }
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { error: 'La contraseña debe contener al menos un carácter especial' }
  }

  try {
    const supabase = await getSupabase()
    
    // Crear usuario con Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          career: career
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    })

    if (error) {
      // Error específico si el usuario ya existe
      if (error.message.includes('already registered')) {
        return { error: 'Este correo ya está registrado' }
      }
      return { error: error.message }
    }

    return {
      success: true,
      message: 'Te enviamos un correo de confirmación. Revisa tu bandeja de entrada.'
    }
  } catch (error) {
    console.error('Error en signUp:', error)
    return { error: 'Error al crear la cuenta. Intenta nuevamente.' }
  }
}

// ============================================
// LOGIN - Iniciar sesión
// ============================================
export async function login(formData) {
  const email = formData.get('email')?.toLowerCase().trim()
  const password = formData.get('password')

  if (!email || !password) {
    return { error: 'Email y contraseña son requeridos' }
  }

  try {
    const supabase = await getSupabase()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Correo o contraseña incorrectos' }
      }
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Por favor confirma tu correo antes de iniciar sesión' }
      }
      return { error: error.message }
    }

    // Verificar que el email esté confirmado
    if (data.user && !data.user.email_confirmed_at) {
      return { error: 'Por favor confirma tu correo antes de iniciar sesión' }
    }

    // Revalidar las rutas para actualizar el estado de auth
    revalidatePath('/', 'layout')
    
    return { success: true }
  } catch (error) {
    console.error('Error en login:', error)
    return { error: 'Error al iniciar sesión. Intenta nuevamente.' }
  }
}

// ============================================
// LOGOUT - Cerrar sesión
// ============================================
export async function logout() {
  const supabase = await getSupabase()
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error al cerrar sesión:', error)
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

// ============================================
// GET USER - Obtener usuario actual
// ============================================
export async function getUser() {
  try {
    const supabase = await getSupabase()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Obtener perfil completo
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      ...user,
      profile
    }
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    return null
  }
}

// ============================================
// RESEND CONFIRMATION - Reenviar email de confirmación
// ============================================
export async function resendConfirmationEmail(email) {
  if (!email) {
    return { error: 'Email es requerido' }
  }

  try {
    const supabase = await getSupabase()
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    })

    if (error) {
      return { error: error.message }
    }

    return { 
      success: true,
      message: 'Correo de confirmación reenviado. Revisa tu bandeja de entrada.'
    }
  } catch (error) {
    console.error('Error reenviando correo:', error)
    return { error: 'Error al reenviar el correo. Intenta nuevamente.' }
  }
}