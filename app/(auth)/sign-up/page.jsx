'use client'

import { resendConfirmationEmail, signUp } from '@/lib/actions'
import Link from 'next/link'
import { useState } from 'react'

const CARRERAS = [
  'Ingeniería en Sistemas',
  'Ingeniería Civil',
  'Ingeniería Eléctrica',
  'Ingeniería Electrónica',
  'Ingeniería Mecánica',
  'Ingeniería Química',
  'Ingeniería Industrial',
  'Ingeniería en Telecomunicaciones',
  'Ingeniería Geológica',
  'Ingeniería Ambiental',
  'Física',
  'Matemática',
  'Otra'
]

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState(null)
  const [lastResendTime, setLastResendTime] = useState(null)
  const [resendCount, setResendCount] = useState(0)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)

  async function handleSubmit(formData) {
    setLoading(true)
    setError(null)

    const email = formData.get('email')
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    const result = await signUp(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Guardar email para poder reenviar
    setUserEmail(email)
    setSuccess(true)
    setLoading(false)
  }

  async function handleResendEmail() {
    // Verificar límite de intentos (máximo 5 reenvíos)
    if (resendCount >= 5) {
      setResendMessage({ type: 'error', text: 'Has alcanzado el límite de reenvíos. Por favor contacta a soporte.' })
      return
    }

    // Verificar cooldown de 1 minuto
    if (lastResendTime) {
      const timeSinceLastResend = Date.now() - lastResendTime
      const cooldownTime = 60 * 1000 // 1 minuto
      
      if (timeSinceLastResend < cooldownTime) {
        const secondsRemaining = Math.ceil((cooldownTime - timeSinceLastResend) / 1000)
        setResendMessage({ 
          type: 'error', 
          text: `Debes esperar ${secondsRemaining} segundos antes de reenviar el correo.` 
        })
        return
      }
    }

    setResendLoading(true)
    setResendMessage(null)

    const result = await resendConfirmationEmail(userEmail)

    if (result.error) {
      setResendMessage({ type: 'error', text: result.error })
    } else {
      setResendMessage({ type: 'success', text: '✅ Correo reenviado exitosamente' })
      setLastResendTime(Date.now())
      setResendCount(resendCount + 1)
      
      // Iniciar contador de cooldown
      const interval = setInterval(() => {
        const elapsed = Date.now() - Date.now()
        const remaining = Math.max(0, 60 - Math.floor(elapsed / 60000))
        setCooldownRemaining(remaining)
        if (remaining === 0) clearInterval(interval)
      }, 1000)
    }

    setResendLoading(false)
  }

  // Pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Casi listo! 📧
          </h2>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 text-left">
            <p className="text-blue-900 mb-2">
              <strong>Te enviamos un correo de confirmación.</strong>
            </p>
            <p className="text-blue-800 text-sm">
              Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
            </p>
          </div>

          {/* Mensaje de reenvío */}
          {resendMessage && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              resendMessage.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {resendMessage.text}
            </div>
          )}

          <div className="space-y-3 text-sm text-gray-600 text-left bg-gray-50 p-4 rounded-lg mb-4">
            <p>💡 <strong>Tip:</strong> Si no lo ves, revisa tu carpeta de spam</p>
            <p>⏱️ El enlace expira en 1 hora (3600 segundos)</p>
            <p>📧 Correo enviado a: <strong className="text-gray-900">{userEmail}</strong></p>
            {resendCount > 0 && (
              <p>🔄 Reenvíos: {resendCount}/5</p>
            )}
          </div>

          {/* Botón para reenviar correo */}
          <button
            onClick={handleResendEmail}
            disabled={resendLoading || resendCount >= 5 || (lastResendTime && (Date.now() - lastResendTime) < 60 * 1000)}
            className="w-full mb-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition border border-gray-300"
          >
            {resendLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Reenviando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                ¿No llegó? Reenviar correo
              </span>
            )}
          </button>

          <Link
            href="/login"
            className="inline-block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Ir al Login
          </Link>
        </div>
      </div>
    )
  }

  // Formulario de registro
  return (
    <div className="min-h-screen flex">
      {/* Lado izquierdo - Imagen */}
      <div className="hidden lg:block lg:w-3/5 relative overflow-hidden bg-linear-to-br from-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-linear-to-br from-blue-600/40 to-purple-600/40 z-10"></div>
        <img 
          src="/library.jpg" 
          alt="Biblioteca EPN" 
          className="object-cover w-full h-full opacity-60"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center p-12 text-white">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4">EPNDocs</h1>
            <p className="text-2xl font-light">De politécnicos para politécnicos</p>
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="w-full lg:w-2/5 flex items-center justify-center bg-white px-6 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Crear cuenta
            </h2>
            <p className="text-gray-600">
              Comparte y accede a material académico
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Juan Pérez López"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo institucional *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="nombre.apellido@epn.edu.ec"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="career" className="block text-sm font-medium text-gray-700 mb-2">
              Carrera *
            </label>
            <select
              id="career"
              name="career"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white"
            >
              <option value="">Selecciona tu carrera</option>
              {CARRERAS.map((carrera) => (
                <option key={carrera} value={carrera}>
                  {carrera}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 9 caracteres"
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar contraseña *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repite tu contraseña"
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creando cuenta...
              </span>
            ) : (
              'Crear cuenta'
            )}
          </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}