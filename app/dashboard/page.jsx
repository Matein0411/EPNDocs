"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getAllDocuments, getUserProfile } from '../(user)/actions/upload'
import { RESOURCE_TYPES, SEMESTERS } from '../(user)/constants'
import Header from '../components/header'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [documents, setDocuments] = useState([])
  const [filteredDocs, setFilteredDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    resourceType: '',
    semester: '',
    subject: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    filterDocuments()
  }, [filters, documents])

  const fetchData = async () => {
    try {
      const [userResult, docsResult] = await Promise.all([
        getUserProfile(),
        getAllDocuments()
      ])

      if (userResult.error) {
        router.push('/login')
        return
      }

      setUser(userResult.user)
      setDocuments(docsResult.documents || [])
      setFilteredDocs(docsResult.documents || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const filterDocuments = () => {
    let filtered = [...documents]

    if (filters.search) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        doc.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
        doc.description?.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.resourceType) {
      filtered = filtered.filter(doc => doc.resource_type === filters.resourceType)
    }

    if (filters.semester) {
      filtered = filtered.filter(doc => doc.semester === filters.semester)
    }

    if (filters.subject) {
      filtered = filtered.filter(doc =>
        doc.subject.toLowerCase().includes(filters.subject.toLowerCase())
      )
    }

    setFilteredDocs(filtered)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      resourceType: '',
      semester: '',
      subject: ''
    })
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

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-white border-r border-slate-200 transition-all duration-300 overflow-hidden sticky top-16 h-[calc(100vh-4rem)]`}
        >
          <div className="p-6">
            {/* User Profile */}
            <div className="flex flex-col items-center mb-6">
              <Image
                src={user?.avatar_url || '/8.png'}
                alt={user?.name || 'User'}
                width={80}
                height={80}
                className="rounded-full w-20 h-20 object-cover border-2 border-slate-200 mb-3"
              />
              <h3 className="font-bold text-slate-900 text-center">{user?.name}</h3>
              <p className="text-sm text-slate-600 text-center mt-1">{user?.career}</p>
            </div>

            {/* Upload Button */}
            <Link
              href="/upload"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition duration-200 shadow-md hover:shadow-lg mb-6"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Subir Documento
            </Link>

            {/* Navigation */}
            <nav className="space-y-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-900 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Inicio
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Mi Perfil
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mb-4 p-2 rounded-lg hover:bg-slate-200 transition"
          >
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Filtros</h2>
              <button
                onClick={clearFilters}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium"
              >
                Limpiar filtros
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Buscar por título o materia..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none"
              />

              <select
                value={filters.resourceType}
                onChange={(e) => handleFilterChange('resourceType', e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none"
              >
                <option value="">Todos los tipos</option>
                {RESOURCE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={filters.semester}
                onChange={(e) => handleFilterChange('semester', e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none"
              >
                <option value="">Todos los semestres</option>
                {SEMESTERS.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Filtrar por materia..."
                value={filters.subject}
                onChange={(e) => handleFilterChange('subject', e.target.value)}
                className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none"
              />
            </div>

            <p className="text-sm text-slate-600 mt-4">
              Mostrando {filteredDocs.length} de {documents.length} documentos
            </p>
          </div>

          {/* Documents Grid - Scrollable */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Documentos Disponibles</h2>
            
            {filteredDocs.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="flex gap-4 pb-4" style={{ minWidth: 'min-content' }}>
                  {filteredDocs.map((doc) => (
                    <Link
                      key={doc.id}
                      href={`/document/${doc.id}`}
                      className="shrink-0 w-72 bg-slate-50 rounded-lg shadow hover:shadow-md transition p-4 border border-slate-200 hover:border-slate-300 group"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 group-hover:bg-slate-100 transition shadow-sm">
                          <svg
                            className="w-7 h-7 text-slate-700"
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
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 truncate group-hover:text-slate-700 transition">
                            {doc.title}
                          </h3>
                          <p className="text-sm text-slate-600 font-medium mt-1">{doc.subject}</p>
                        </div>
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

                      {doc.profiles && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
                          <Image
                            src={doc.profiles.avatar_url || '/8.png'}
                            alt={doc.profiles.full_name}
                            width={24}
                            height={24}
                            className="rounded-full w-6 h-6 object-cover"
                          />
                          <span className="text-xs text-slate-600 font-medium truncate">
                            {doc.profiles.full_name}
                          </span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-slate-300 mx-auto mb-4"
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
                <p className="text-slate-600 font-medium">No se encontraron documentos</p>
                <p className="text-slate-500 text-sm mt-1">Intenta ajustar los filtros</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
