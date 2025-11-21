"use client"

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { uploadDocument } from './actions/upload'
import { RESOURCE_TYPES, SEMESTERS, CAREERS } from './constants'

const resourceOptions = RESOURCE_TYPES
const semesterOptions = SEMESTERS
const careerOptions = CAREERS

export default function UserUploadPage() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const resourceList = useMemo(() => resourceOptions, [])
  const semesterList = useMemo(() => semesterOptions, [])
  const careerList = useMemo(() => careerOptions, [])

  async function handleUpload(formData) {
    setUploading(true)
    setError(null)
    setSuccess(null)

    const result = await uploadDocument(formData)

    if (result?.error) {
      setError(result.error)
      setUploading(false)
      return
    }

    setSuccess({
      message: result.message,
      url: result.url,
      title: result.title,
      meta: {
        subject: result.subject,
        resourceType: result.resourceType,
        semester: result.semester,
        career: result.career
      }
    })
    setUploading(false)
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet" />

      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-5 md:px-10 py-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center overflow-hidden shadow">
            <img src="/favicon.ico" alt="EPNDocs Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">EPNDocs</p>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Subir archivo</h1>
           
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition shadow-sm"
          >
            Volver al dashboard
          </Link>
        </div>
      </header>

      <main className="px-5 md:px-10 pb-12">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500 font-semibold">Formulario</p>
              <h2 className="text-2xl font-bold text-slate-900">Detalle del documento</h2>
              <p className="text-sm text-slate-600">Agrega materia, tipo, semestre y archivo.</p>
            </div>
            <Link
              href="/user"
              className="inline-flex items-center gap-2 text-sm text-slate-700 font-semibold hover:text-slate-900"
            >
              
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm space-y-1">
              <p className="font-semibold">{success.message}</p>
              <p className="text-emerald-700 break-all">{success.title}{success.url ? ` -> ${success.url}` : ''}</p>
              <p className="text-emerald-700">
                {success.meta.subject} | {success.meta.resourceType} | {success.meta.semester} | {success.meta.career}
              </p>
            </div>
          )}

          <form action={handleUpload} className="space-y-5" encType="multipart/form-data">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700">Tipo de recurso</label>
                <select
                  name="resourceType"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition bg-white text-slate-700"
                  defaultValue=""
                >
                  <option value="" disabled>Apunte, Prueba, Resumen, etc.</option>
                  {resourceList.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Carrera</label>
                <select
                  name="career"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition bg-white text-slate-700"
                  defaultValue=""
                >
                  <option value="" disabled>Selecciona la carrera</option>
                  {careerList.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Materia</label>
                <input
                  name="subject"
                  type="text"
                  placeholder="Ej. Calidad de Software"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition bg-white text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Semestre</label>
                <select
                  name="semester"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition bg-white text-slate-700"
                  defaultValue=""
                >
                  <option value="" disabled>Selecciona el semestre</option>
                  {semesterList.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Titulo (opcional)</label>
              <input
                name="title"
                type="text"
                placeholder="Ej. Informe de laboratorio 1"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition bg-white text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Descripcion (opcional)</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Detalles, temas cubiertos, profesor, etc."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition bg-white text-slate-700 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Archivo</label>
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-300 rounded-2xl px-6 py-8 bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
                <input
                  name="file"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                  className="hidden"
                  required
                  disabled={uploading}
                />
                <svg className="w-10 h-10 text-slate-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                </svg>
                <p className="text-slate-900 font-semibold">Selecciona o arrastra un archivo</p>
                <p className="text-sm text-slate-500">PDF, DOCX, PPTX, TXT, PNG, JPG. Max 20MB.</p>
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-slate-800 text-white py-3.5 rounded-xl font-semibold hover:bg-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed transition shadow-lg shadow-slate-800/15 cursor-pointer"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Subiendo...
                </span>
              ) : (
                'Subir documento'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
