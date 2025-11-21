"use client"

import Link from 'next/link';
import { logout } from '../(auth)/actions/auth';

export default function WorkingPage() {

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-200 px-4 relative overflow-hidden">
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet" />
      
      {/* Decorative background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-slate-700/5 rounded-full blur-3xl animate-pulse"></div>
      
      <div className="text-center relative z-10 max-w-2xl">
        {/* Worker Owl */}
        <div className="mb-8 relative">
          <img 
            src="/worker_buho.png" 
            alt="Working owl" 
            className="w-64 h-64 mx-auto object-contain drop-shadow-2xl"
          />
        </div>

        {/* Logo badge */}
        <div className="inline-block mb-6">
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/favicon.ico" alt="EPNDocs Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-slate-900">EPNDocs</span>
          </div>
        </div>

        {/* Main message */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-4">
          We're Working On This
        </h1>
        
        <p className="text-xl text-slate-600 mb-8">
          Our owl team is building something amazing for you
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-3 h-3 bg-slate-800 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-slate-700 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-slate-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Info card */}
        <div className="inline-block bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
          <p className="text-slate-700 text-sm">
            <span className="font-semibold">Coming soon:</span> Dashboard, document sharing, and more!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            href="/upload"
            className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-slate-800/20"
          >
            Subir archivos
          </Link>
          <form action={logout}>
            <button 
              type="submit"
              className="bg-white hover:bg-slate-50 text-slate-800 px-6 py-3 rounded-xl font-semibold transition shadow-lg border border-slate-200 cursor-pointer"
            >
              Log Out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
