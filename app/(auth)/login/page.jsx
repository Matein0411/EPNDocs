'use client'

import { login, resendConfirmationEmail } from '@/lib/actions'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

// Componente separado que usa useSearchParams
function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showResend, setShowResend] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      setSuccess('¡Cuenta verificada! Ya puedes iniciar sesión')
    }

    checkSession()
  }, [searchParams])

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push('/dashboard')
    }
  }

  async function handleSubmit(formData) {
    setLoading(true)
    setError(null)
    setSuccess(null)

    const email = formData.get('email')
    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      
      if (result.error.includes('confirma tu correo')) {
        setShowResend(true)
        setResendEmail(email)
      }
      
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleResendEmail() {
    if (!resendEmail) return
    
    setResendLoading(true)
    setError(null)
    setSuccess(null)

    const result = await resendConfirmationEmail(resendEmail)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(result.message)
      setShowResend(false)
    }

    setResendLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido de nuevo
          </h1>
          <p className="text-gray-600">
            Inicia sesión en EPNDocs
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {showResend && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
            <p className="text-yellow-800 text-sm mb-3">
              ¿No recibiste el correo de confirmación?
            </p>
            <button
              onClick={handleResendEmail}
              disabled={resendLoading}
              className="w-full px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 disabled:bg-yellow-300 disabled:cursor-not-allowed transition"
            >
              {resendLoading ? 'Reenviando...' : 'Reenviar correo de confirmación'}
            </button>
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu-correo@epn.edu.ec"
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// Componente principal exportado con Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}