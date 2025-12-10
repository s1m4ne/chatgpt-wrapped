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
          relative border-2 border-dashed rounded-xl p-12 text-center
          transition-all duration-200 cursor-pointer
          ${
            isDragging
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
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
          <div className="text-5xl">
            {isDragging ? '📂' : '📁'}
          </div>
          <div>
            <p className="text-lg font-medium text-gray-200">
              {isDragging ? 'ドロップしてアップロード' : 'conversations.json をドラッグ&ドロップ'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              または<span className="text-purple-400 underline">クリックしてファイルを選択</span>
            </p>
          </div>
          <p className="text-xs text-gray-500">
            最大ファイルサイズ: {maxSizeMB}MB
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}
