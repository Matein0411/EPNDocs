"use client"

import { useMemo, useRef, useState } from 'react'
import { RESOURCE_TYPES, SEMESTERS } from '../constants'
import { uploadDocument } from '../actions/upload'

const resourceOptions = RESOURCE_TYPES
const semesterOptions = SEMESTERS

export default function UserUploadPage() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  
  const fileInputRef = useRef(null)

  const resourceList = useMemo(() => resourceOptions, [])
  const semesterList = useMemo(() => semesterOptions, [])

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      setSuccess(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleUpload(formData) {
    setUploading(true)
    setError(null)
    setSuccess(false)

    const result = await uploadDocument(formData)

    if (result?.error) {
      setError(result.error)
      setUploading(false)
      return
    }

    setSuccess(true)
    setUploading(false)
    removeFile()
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="flex items-center justify-center gap-3 px-5 md:px-10 py-4 border-b border-slate-200 bg-slate-200">
        <div className="w-11 h-11 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center overflow-hidden shadow">
          <img src="/favicon.ico" alt="EPNDocs Logo" className="w-full h-full object-contain" />
        </div>
           <a href="/dashboard"><h1 className='font-bold leading-light text-xl'>EPNDocs</h1></a>
      </header>

      <main className="px-5 md:px-10 pb-12 mt-6">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Detalles del documento</h2>
            <p className="text-sm text-slate-600">Agrega materia, tipo, semestre y archivo.</p>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm font-semibold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Documento subido exitosamente
            </div>
          )}

          <form action={handleUpload} className="space-y-5">
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Archivo</label>

              <input
                ref={fileInputRef}
                name="file"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                className="hidden"
                onChange={handleFileChange}
                required 
              />

              {!selectedFile ? (
                <div 
                  onClick={triggerFileInput}
                  className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-300 rounded-2xl px-6 py-8 bg-slate-50 hover:bg-slate-100 cursor-pointer transition"
                >
                  <svg className="w-10 h-10 text-slate-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m7-7H5" />
                  </svg>
                  <p className="text-slate-900 font-semibold">Selecciona o arrastra un archivo</p>
                  <p className="text-sm text-slate-500">PDF, DOCX, PPTX, TXT, PNG, JPG. Max 20MB.</p>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full border border-slate-300 rounded-2xl p-4 bg-slate-50">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm flex-shrink-0">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{formatSize(selectedFile.size)}</p>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={removeFile}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
                    title="Quitar archivo"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
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
              {/* <div className="space-y-2">
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
              </div> */}
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

            <button
              type="submit"
              disabled={uploading || !selectedFile}
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