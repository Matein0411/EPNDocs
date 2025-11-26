"use client"

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function DocumentThumbnail({ fileUrl, filePath }) {
  const [error, setError] = useState(false)
  
  const fileExtension = (filePath || fileUrl)?.split('.').pop()?.toLowerCase()
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)
  const isPdf = fileExtension === 'pdf'

  if (error || (!isImage && !isPdf)) {
    return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-slate-400"
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
    )
  }

  if (isImage) {
    return (
      <img
        src={fileUrl}
        alt={filePath || 'Document'}
        className="w-full h-full object-cover bg-slate-100"
        onError={() => setError(true)}
      />
    )
  }

  if (isPdf) {
    return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center overflow-hidden">
        <Document
          file={fileUrl}
          onLoadError={() => setError(true)}
          loading={
            <div className="flex items-center justify-center w-full h-full">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            </div>
          }
        >
          <Page
            pageNumber={1}
            height={192}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            loading={null}
          />
        </Document>
      </div>
    )
  }

  return null
}
