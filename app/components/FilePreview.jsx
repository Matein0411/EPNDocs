"use client"

import { useMemo, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

// Configurar worker de PDF.js con versión específica
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function FilePreview({ fileUrl, fileName }) {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [error, setError] = useState(null)

  const fileExtension = fileName?.split('.').pop()?.toLowerCase()
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)
  const isPdf = fileExtension === 'pdf'

  // Memoizar configuraciones para evitar re-renders
  const fileConfig = useMemo(() => fileUrl, [fileUrl])
  
  const pdfOptions = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
  }), [])

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
    setError(null)
  }

  function onDocumentLoadError(error) {
    setError(`No se pudo cargar el PDF: ${error.message || 'Error desconocido'}`)
  }

  if (isImage) {
    return (
      <div className="flex flex-col items-center bg-slate-50 rounded-lg p-4">
        <div className="relative w-full max-w-4xl">
          <img 
            src={fileUrl} 
            alt={fileName}
            className="w-full h-auto rounded-lg shadow-lg"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>
      </div>
    )
  }

  if (isPdf) {
    return (
      <div className="flex flex-col items-center bg-slate-50 rounded-lg p-2 sm:p-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 bg-white px-3 sm:px-4 py-3 sm:py-2 rounded-lg shadow-sm w-full sm:w-auto">
          {/* Pagination */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
              disabled={pageNumber <= 1}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm sm:text-base"
            >
              ←
            </button>
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
              Página {pageNumber} de {numPages || '...'}
            </span>
            <button
              onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages || 1))}
              disabled={pageNumber >= (numPages || 1)}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm sm:text-base"
            >
              →
            </button>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-2 sm:border-l sm:pl-4">
            <button
              onClick={() => setScale(prev => Math.max(prev - 0.2, 0.5))}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded text-sm sm:text-base"
            >
              -
            </button>
            <span className="text-xs sm:text-sm font-medium">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(prev => Math.min(prev + 0.2, 2.0))}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 rounded text-sm sm:text-base"
            >
              +
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="bg-white rounded-lg shadow-lg overflow-auto max-h-[60vh] sm:max-h-[70vh] w-full">
          {error ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="text-red-600 mb-4">{error}</div>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Abrir PDF en nueva pestaña
              </a>
            </div>
          ) : (
            <Document
              file={fileConfig}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              options={pdfOptions}
              loading={
                <div className="flex items-center justify-center p-12">
                  <div className="text-slate-600">Cargando PDF...</div>
                </div>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading={
                  <div className="flex items-center justify-center p-12">
                    <div className="text-slate-600">Cargando página...</div>
                  </div>
                }
              />
            </Document>
          )}
        </div>
      </div>
    )
  }

  // Para otros tipos de archivo
  return (
    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg p-12">
      <svg
        className="w-16 h-16 text-slate-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
      <p className="text-slate-600 mb-4">Vista previa no disponible para este tipo de archivo</p>
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-lg font-medium transition"
      >
        Descargar archivo
      </a>
    </div>
  )
}
