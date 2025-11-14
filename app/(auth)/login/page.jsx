'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { login } from "../actions/auth"

function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
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

    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-8 relative overflow-hidden">
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet" />
      
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-slate-700/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-slate-800/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 relative z-10">
        {/* Owl mascot - top right corner */}
        <div className="absolute -top-12 -right-8 sm:-top-16 sm:-right-12">
          <img 
            src="/buho.png" 
            alt="Owl mascot" 
            className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-xl transform hover:scale-110 transition-transform duration-300"
          />
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden">
            <img src="/favicon.ico" alt="EPNDocs Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-600">
            Log in to EPNDocs
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-800 text-sm">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your-email@epn.edu.ec"
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition bg-white text-slate-700"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition bg-white text-slate-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed transition shadow-lg shadow-slate-800/20 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging in...
              </span>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-slate-900 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

// Componente principal exportado con Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}