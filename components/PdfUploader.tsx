'use client';

import { useRef, useState, useCallback } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_PAGES = 20;

type ErrorKind = 'invalid_type' | 'too_large' | 'too_many_pages' | 'no_text' | 'parse_failed' | null;

interface PdfUploaderProps {
  orUploadLabel: string;
  uploadLimitLabel: string;
  dragHint: string;
  parsing: string;
  errorInvalidType: string;
  errorTooLarge: string;
  errorNoText: string;
  errorParseFailed: string;
  onTextExtracted: (text: string) => void;
  onDragActiveChange?: (active: boolean) => void;
}

export default function PdfUploader({
  orUploadLabel,
  uploadLimitLabel,
  dragHint,
  parsing,
  errorInvalidType,
  errorTooLarge,
  errorNoText,
  errorParseFailed,
  onTextExtracted,
  onDragActiveChange,
}: PdfUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [errorKind, setErrorKind] = useState<ErrorKind>(null);
  const [isDragging, setIsDragging] = useState(false);

  const setDragging = useCallback(
    (active: boolean) => {
      setIsDragging(active);
      onDragActiveChange?.(active);
    },
    [onDragActiveChange]
  );

  const errorMessage = (() => {
    switch (errorKind) {
      case 'invalid_type':
        return errorInvalidType;
      case 'too_large':
      case 'too_many_pages':
        return errorTooLarge;
      case 'no_text':
        return errorNoText;
      case 'parse_failed':
        return errorParseFailed;
      default:
        return '';
    }
  })();

  const handleFile = async (file: File) => {
    setErrorKind(null);

    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setErrorKind('invalid_type');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorKind('too_large');
      return;
    }

    setLoading(true);

    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      if (pdf.numPages > MAX_PAGES) {
        setErrorKind('too_many_pages');
        return;
      }

      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ');
        pages.push(pageText);
      }

      const text = pages.join('\n\n').trim();
      if (!text) {
        setErrorKind('no_text');
        return;
      }

      onTextExtracted(text);
      setErrorKind(null);
    } catch (err) {
      console.error('[pdf] parse error:', err);
      setErrorKind('parse_failed');
    } finally {
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div className="flex shrink-0 flex-col items-center justify-center sm:w-36 md:w-40">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-3 py-5 text-center transition-all ${
          isDragging
            ? 'border-orange-400 bg-orange-50 scale-[1.02]'
            : 'border-stone-200 bg-stone-50/80 hover:border-orange-300 hover:bg-orange-50/50'
        } disabled:opacity-50`}
      >
        <span className="mb-2 text-2xl">{loading ? '⏳' : '📄'}</span>
        <span className="text-xs font-medium text-stone-700">
          {loading ? parsing : orUploadLabel}
        </span>
        <span className="mt-1 text-[10px] leading-tight text-stone-400">{uploadLimitLabel}</span>
        <span className="mt-2 text-[10px] text-stone-400">{dragHint}</span>
      </button>
      {errorMessage && (
        <p className="mt-2 text-center text-[11px] leading-snug text-red-600">{errorMessage}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,application/x-pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}
