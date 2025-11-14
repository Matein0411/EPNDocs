"use client"

import { useState } from 'react'
import { resendEmailConfirmation, signUp } from "../actions/auth"

const CAREERS = [
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    career: '',
    password: '',
    confirmPassword: ''
  })

  function handleInputChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('email', formData.email)
      formDataToSend.append('password', formData.password)
      formDataToSend.append('full_name', formData.fullName)
      formDataToSend.append('career', formData.career)

      const result = await signUp({ formData: formDataToSend })
      
      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      if (result.success) {
        setUserEmail(formData.email)
        setSuccess(true)
      }
    } catch (err) {
      setError(err.message || 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  async function handleResendEmail() {
    if (resendCount >= 5) {
      setResendMessage({ 
        type: 'error', 
        text: 'You have reached the limit. Please contact our support team.' 
      })
      return
    }

    if (lastResendTime) {
      const timeSinceLastResend = Date.now() - lastResendTime
      const cooldownTime = 60 * 1000
      
      if (timeSinceLastResend < cooldownTime) {
        const secondsRemaining = Math.ceil((cooldownTime - timeSinceLastResend) / 1000)
        setResendMessage({ 
          type: 'error', 
          text: `Please wait ${secondsRemaining} seconds before resending.` 
        })
        return
      }
    }

    setResendLoading(true)
    setResendMessage(null)

    try {
      const result = await resendEmailConfirmation(userEmail)
      
      if (result.error) {
        setResendMessage({ type: 'error', text: result.error })
      } else if (result.success) {
        setResendMessage({ type: 'success', text: result.message })
        setLastResendTime(Date.now())
        setResendCount(resendCount + 1)
      }
    } catch (err) {
      setResendMessage({ type: 'error', text: 'Failed to resend email. Please try again.' })
    } finally {
      setResendLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-slate-200">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Almost done! 📧
          </h2>
          
          <p className="text-slate-600 mb-6">
            We've sent a confirmation email to verify your account
          </p>

          {resendMessage && (
            <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${
              resendMessage.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {resendMessage.text}
            </div>
          )}

          <div className="space-y-2 text-sm text-slate-600 text-left bg-slate-50 p-4 rounded-xl mb-6 border border-slate-200">
            <p className="flex items-center gap-2">
              <span>💡</span>
              <span>Check your spam folder if you don't see it</span>
            </p>
            <p className="flex items-center gap-2">
              <span>⏱️</span>
              <span>Link expires in 1 hour</span>
            </p>
            <p className="flex items-center gap-2">
              <span>📧</span>
              <span className="font-medium text-slate-900">{userEmail}</span>
            </p>
            {resendCount > 0 && (
              <p className="flex items-center gap-2">
                <span>🔄</span>
                <span>Resends: {resendCount}/5</span>
              </p>
            )}
          </div>

          <button
            onClick={handleResendEmail}
            disabled={resendLoading || resendCount >= 5 || (lastResendTime && (Date.now() - lastResendTime) < 60 * 1000)}
            className="w-full mb-3 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed transition border border-slate-300"
          >
            {resendLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Resending...
              </span>
            ) : (
              'Resend Email'
            )}
          </button>
          <a href="/login" className='w-full bg-slate-800 text-white py-3 rounded-xl font-semibold hover:bg-slate-900 transition block text-center'>
        Go to Login
          </a>
        </div>
      </div>
    )
  }

return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 relative">
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet" />
      
      {/* Top/Left Panel - Decorative */}
      <div className="w-full h-[18vh] lg:h-auto lg:w-[52%] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 relative overflow-hidden rounded-b-[3rem] lg:rounded-b-none lg:rounded-r-[3rem]">
        {/* Background Image - Only on desktop */}
        <div 
          className="hidden lg:block absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: 'url(/library.jpg)',
            filter: 'blur(4px)'
          }}
        ></div>
        
        {/* Decorative circles */}
        <div className="absolute top-10 left-10 lg:top-20 lg:left-20 w-48 h-48 lg:w-64 lg:h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 lg:bottom-20 lg:right-20 w-64 h-64 lg:w-96 lg:h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col justify-between w-full h-full p-8 lg:p-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/favicon.ico" alt="EPNDocs Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Main Content - Only on desktop */}
          <div className="hidden lg:block">
            <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
              Bienvenido a<br />
              <span className="text-6xl bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                EPNDocs
              </span>
            </h1>
            <p className="text-slate-300 text-lg font-medium">
              Tu plataforma de documentos colaborativos
            </p>
          </div>

          {/* Spacer */}
          <div className="h-20 hidden lg:block"></div>
        </div>
      </div>

      {/* Owl - Between panels */}
      <div className="absolute left-1/2 top-[18vh] lg:top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="text-center">
          <img 
            src="/buho.png" 
            alt="Owl mascot" 
            className="w-64 h-64 lg:w-128 lg:h-128 object-contain drop-shadow-2xl transform hover:scale-110 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Bottom/Right Panel - Form */}
      <div className="w-full flex-1 lg:w-[48%] flex items-center justify-center bg-white rounded-t-[3rem] lg:rounded-t-none lg:rounded-l-none pt-20 lg:pt-0">
        <div className="max-w-md w-full px-8 lg:px-12 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900">
              Create Account
            </h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Juan Pérez López"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition bg-white text-slate-600"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="first.last@epn.edu.ec"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition bg-white text-slate-600"
              />
            </div>

            <div>
              <label htmlFor="career" className="block text-sm font-medium text-slate-700 mb-1.5">
                Career
              </label>
              <select
                id="career"
                name="career"
                value={formData.career}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition bg-white text-slate-600"
              >
                <option value="">Select your career</option>
                {CAREERS.map((career) => (
                  <option key={career} value={career}>
                    {career}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 9 characters"
                  required
                  minLength={9}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition bg-white text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Repeat your password"
                  required
                  minLength={9}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition bg-white text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed transition mt-6 shadow-lg shadow-slate-800/20 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-slate-900 font-semibold hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
)}