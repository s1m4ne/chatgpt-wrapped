import { useState, useCallback, type DragEvent, type ChangeEvent } from 'react'

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  maxSizeMB?: number
  accept?: string
}

const MAX_FILE_SIZE_MB = 100

export function FileUploader({
  onFileSelect,
  maxSizeMB = MAX_FILE_SIZE_MB,
  accept = '.json',
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = useCallback(
    (file: File): string | null => {
      const maxBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxBytes) {
        return `ファイルサイズが大きすぎます（最大${maxSizeMB}MB）`
      }
      if (!file.name.endsWith('.json')) {
        return 'JSONファイルを選択してください'
      }
      return null
    },
    [maxSizeMB]
  )

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      setError(null)
      onFileSelect(file)
    },
    [validateFile, onFileSelect]
  )

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile]
  )

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile]
  )

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative pixel-box p-8 sm:p-12 text-center cursor-pointer
          transition-all duration-100
          ${
            isDragging
              ? 'border-nes-cyan bg-nes-cyan/10'
              : 'border-gray-600 hover:border-nes-purple hover:bg-nes-purple/5'
          }
        `}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-4">
          {/* Pixel art folder icon */}
          <div className="text-4xl" style={{ imageRendering: 'pixelated' }}>
            {isDragging ? (
              <span className="nes-cyan">[OPEN]</span>
            ) : (
              <span className="text-gray-400">[FILE]</span>
            )}
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-200">
              {isDragging ? '&gt; DROP HERE!' : '&gt; conversations.json'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {isDragging ? '' : '&gt; DRAG & DROP or CLICK'}
            </p>
          </div>
          <p className="text-xs text-gray-600">
            MAX: {maxSizeMB}MB
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 pixel-box border-red-500 bg-red-500/10">
          <p className="nes-red text-xs">&gt; ERROR: {error}</p>
        </div>
      )}
    </div>
  )
}
