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
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      let fullText = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items
          .map((item: unknown) => {
            const it = item as { str?: string; hasEOL?: boolean }
            return it.str ?? ''
          })
          .join(' ')
        fullText += pageText + '\n'
      }

      const cleaned = fullText.replace(/\s{3,}/g, '\n').trim()

      if (!cleaned || cleaned.length < 50) {
        setStatus('error')
        setErrorMsg(
          'Could not extract text from this PDF. It may be a scanned image. Please paste your resume as text instead.'
        )
        return
      }

      onExtracted(cleaned)
      setStatus('done')
    } catch (err) {
      console.error('[PdfUploader] parse error:', err)
      setStatus('error')
      setErrorMsg('Failed to read the PDF. Please try a different file or paste your resume as text.')
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
    <div className="mb-3">
      <label
        htmlFor="pdf-upload"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center transition-colors hover:border-orange-300 hover:bg-orange-50"
      >
        {status === 'loading' ? (
          <>
            <span className="text-2xl animate-spin">⏳</span>
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

      {status === 'error' && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errorMsg}</p>
      )}
    </div>
  )
}