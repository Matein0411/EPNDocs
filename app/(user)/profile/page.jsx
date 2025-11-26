// app/(user)/profile/page.jsx
'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '../../components/header'
import { getUserProfile } from '../actions/upload'

const DocumentThumbnail = dynamic(() => import('../../components/DocumentThumbnail'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 bg-slate-100 rounded-t-lg animate-pulse" />
  ),
})

export default function UserProfile() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const result = await getUserProfile()
      if (result.error) {
        router.push('/login')
        return
      }
      setUser(result.user)
      setUploads(result.uploads || [])
    } catch (error) {
      console.error('Error fetching user data:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-600">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Profile Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-6">
            <Image
              src="/8.png"
              alt={user?.name || 'Profile'}
              width={100}
              height={100}
              className="rounded-full w-24 h-24 object-cover border-2 border-slate-200"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">{user?.name}</h1>
              <p className="text-slate-600 mt-2 flex items-center gap-2 font-medium">
                <svg
                  className="w-4 h-4 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                {user?.career || 'Carrera no especificada'}
              </p>
              <p className="text-slate-500 text-sm mt-2">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Mis Documentos</h2>
          <Link
            href="/upload"
            className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition duration-200 shadow-md hover:shadow-lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Subir documento
          </Link>
        </div>

        {/* Documents Grid */}
        {uploads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {uploads.map((doc) => (
              <Link
                key={doc.id}
                href={`/document/${doc.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-all p-4 border border-slate-200 hover:border-slate-300 group"
              >
                {/* Thumbnail */}
                <div className="w-full h-48 mb-3 rounded-lg overflow-hidden bg-slate-100">
                  <DocumentThumbnail fileUrl={doc.file_url} filePath={doc.file_path} />
                </div>

                {/* Title and Subject */}
                <div className="mb-3">
                  <h3 className="font-bold text-slate-900 truncate group-hover:text-slate-700 transition mb-1">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-slate-600 font-medium">{doc.subject}</p>
                </div>

                {doc.description && (
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {doc.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className="text-xs text-slate-500 font-medium">
                    {doc.resource_type}
                  </span>
                  <span className="text-xs text-slate-500">
                    {doc.semester}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <svg
              className="w-12 h-12 text-slate-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-slate-600 font-medium mb-3">
              Aún no has subido documentos
            </p>
            <p className="text-slate-500 mb-4">
              Comparte tus notas y apuntes con otros estudiantes
            </p>
            <Link
              href="/upload"
              className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium transition duration-200 inline-block"
            >
              Subir mi primer documento
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}