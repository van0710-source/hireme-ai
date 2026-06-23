'use client'
// components/PdfUploader.tsx

import { useRef, useState } from 'react'

interface Props {
  onExtracted: (text: string) => void
}

export default function PdfUploader({ onExtracted }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleFile(file: File) {
    if (!file || file.type !== 'application/pdf') {
      setStatus('error')
      setErrorMsg('Please upload a PDF file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatus('error')
      setErrorMsg('PDF must be under 10 MB.')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      const pdfjsLib = await import('pdfjs-dist')
      // Use local worker instead of CDN
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      let fullText = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items
          .map((item: unknown) => {
            const it = item as { str?: string }
            return it.str ?? ''
          })
          .join(' ')
        fullText += pageText + '\n'
      }

      const cleaned = fullText.replace(/\s{3,}/g, '\n').trim()

      if (!cleaned || cleaned.length < 50) {
        setStatus('error')
        setErrorMsg(
          "Looks like this PDF is image-based and can't be read automatically. Please copy your resume text from Word or Google Docs and paste it below."
        )
        return
      }

      onExtracted(cleaned)
      setStatus('done')
    } catch (err) {
      console.error('[PdfUploader] parse error:', err)
      setStatus('error')
      setErrorMsg(
        "Looks like this PDF is image-based and can't be read automatically. Please copy your resume text from Word or Google Docs and paste it below."
      )
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="mb-4">
      <label
        htmlFor="pdf-upload"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center transition-colors hover:border-orange-300 hover:bg-orange-50"
      >
        {status === 'loading' ? (
          <>
            <span className="text-2xl animate-pulse">📄</span>
            <p className="mt-2 text-sm text-gray-500">Reading your PDF…</p>
          </>
        ) : status === 'done' ? (
          <>
            <span className="text-2xl">✅</span>
            <p className="mt-2 text-sm text-gray-600 font-medium">Resume extracted!</p>
            <p className="text-xs text-gray-400 mt-0.5">Click to upload a different file</p>
          </>
        ) : (
          <>
            <span className="text-2xl">📄</span>
            <p className="mt-2 text-sm font-medium text-gray-700">Upload PDF resume</p>
            <p className="text-xs text-gray-400 mt-0.5">Drag & drop or click · Max 10 MB</p>
          </>
        )}
        <input
          ref={inputRef}
          id="pdf-upload"
          type="file"
          accept=".pdf,application/pdf"
          className="sr-only"
          onChange={handleChange}
        />
      </label>

      {/* Persistent hint */}
      {status !== 'error' && (
        <p className="mt-1.5 text-xs text-gray-400 text-center">
          Text-based PDFs only · Scanned images not supported ·{' '}
          <span className="text-gray-500">paste plain text instead if unsure</span>
        </p>
      )}

      {/* Error message */}
      {status === 'error' && (
        <p className="mt-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-sm text-amber-700">
          {errorMsg}
        </p>
      )}
    </div>
  )
}