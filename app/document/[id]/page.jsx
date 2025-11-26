"use client"

import { getAllDocuments } from '@/app/(user)/actions/upload'
import Header from '@/app/components/header'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Cargar FilePreview solo en el cliente para evitar errores de SSR
const FilePreview = dynamic(() => import('@/app/components/FilePreview'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-12 bg-slate-50 rounded-lg">
      <div className="text-slate-600">Cargando visor...</div>
    </div>
  ),
})

export default function DocumentViewPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocument()
  }, [params.id])

  const fetchDocument = async () => {
    try {
      const result = await getAllDocuments()
      if (result.error) {
        router.push('/dashboard')
        return
      }

      const doc = result.documents?.find(d => d.id === params.id)
      if (!doc) {
        router.push('/dashboard')
        return
      }

      setDocument(doc)
    } catch (error) {
      console.error('Error fetching document:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-600">Cargando documento...</div>
        </div>
      </div>
    )
  }

  if (!document) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb / Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al Dashboard
        </Link>

        {/* Document Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{document.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="font-semibold">{document.subject}</span>
                </span>
                <span>•</span>
                <span>{document.resource_type}</span>
                <span>•</span>
                <span>{document.semester}</span>
              </div>

              {document.description && (
                <p className="mt-4 text-slate-700">{document.description}</p>
              )}

              {document.profiles && (
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200">
                  <Image
                    src={document.profiles.avatar_url || '/8.png'}
                    alt={document.profiles.full_name}
                    width={40}
                    height={40}
                    className="rounded-full w-10 h-10 object-cover"
                  />
                  <div>
                    <p className="text-sm text-slate-500">Subido por</p>
                    <p className="font-medium text-slate-900">{document.profiles.full_name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Download Button */}
            <a
              href={document.file_url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition duration-200 shadow-md hover:shadow-lg shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar
            </a>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <FilePreview 
            fileUrl={document.file_url} 
            fileName={document.file_path ? document.file_path.split('/').pop() : document.file_url.split('/').pop()}
          />
        </div>
      </div>
    </div>
  )
}
