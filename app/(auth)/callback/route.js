import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies() // Agregar await
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      await supabase.auth.exchangeCodeForSession(code)
      
      // Redirigir al dashboard con parámetro de éxito
      return NextResponse.redirect(`${requestUrl.origin}/login?verified=true`)
    } catch (error) {
      console.error('Error en auth callback:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/login`)
}