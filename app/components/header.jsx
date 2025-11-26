// app/components/Header.jsx
"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { logout } from '../(auth)/actions/auth'

export default function Header() {
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const result = await logout()
      if (result.success) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const handleProfileClick = () => {
    router.push('/profile')
    setShowDropdown(false)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y marca */}
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition">
            <img src="/favicon.ico" alt="EPNDocs Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg text-slate-900 hidden sm:inline">EPNDocs</span>
          </Link>

          {/* Botón de perfil con dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 hover:bg-slate-50 p-2 rounded-lg transition duration-200"
            >
              <Image
                src="/8.png"
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full w-8 h-8 object-cover border border-slate-200"
              />
              <svg
                className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={handleProfileClick}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition duration-200 flex items-center gap-3 text-slate-700 font-medium border-b border-slate-100"
                >
                  <svg
                    className="w-4 h-4 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Mi Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 transition duration-200 flex items-center gap-3 font-medium"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}