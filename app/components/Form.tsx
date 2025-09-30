// FileUpload.jsx
import React, { useRef, useState } from 'react'
import { Upload, Trash2, Camera, AlertCircle } from 'lucide-react'
import { Button } from '@/app/components/ui/button'

export function InputField({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  error = '',
}: {
  label: string
  value: string | number
  onChange: (value: any) => void
  type?: string
  required?: boolean
  placeholder?: string
  error?: string
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1 text-neutral-900 dark:text-neutral-100">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
        required={required}
        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-neutral-800 font-light text-neutral-900 dark:text-neutral-100 ${
          error
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-red-500'
            : 'border-neutral-300 dark:border-neutral-600 focus:border-blue-500 focus:ring-blue-500'
        } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-colors placeholder-neutral-500 dark:placeholder-neutral-400`}
      />
      {error && (
        <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  options = [],
  required = false,
  error = '',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  required?: boolean
  error?: string
}) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1 text-neutral-900 dark:text-neutral-100">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-neutral-800 font-light text-neutral-900 dark:text-neutral-100 ${
          error
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:border-red-500 focus:ring-red-500'
            : 'border-neutral-300 dark:border-neutral-600 focus:border-blue-500 focus:ring-blue-500'
        } focus:outline-none focus:ring-2 focus:ring-opacity-20 transition-colors`}
      >
        <option value="" className="text-neutral-500 dark:text-neutral-400">
          Sélectionner...
        </option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value} className="text-neutral-900 dark:text-neutral-100">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  )
}

export function FileUpload({
  label,
  file,
  onChange,
  aspectRatio = 'aspect-square',
  required = false,
  error = '',
}: {
  label: string
  file: string
  onChange: (file: string) => void
  aspectRatio?: string
  required?: boolean
  error?: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          onChange(e.target?.result as string)
        }
        reader.readAsDataURL(selectedFile)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onChange(e.target?.result as string)
      }
      reader.readAsDataURL(droppedFile)
    }
  }

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-200
          ${
            error
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : file
                  ? 'border-green-500 dark:border-green-400'
                  : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
          }
          ${aspectRatio} flex items-center justify-center cursor-pointer
          group overflow-hidden bg-white dark:bg-neutral-800
        `}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

        {file ? (
          <>
            <img
              src={file}
              alt="Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                  className="bg-white/90 dark:bg-neutral-700/90 backdrop-blur-sm"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={removeImage}
                  className="bg-white/90 dark:bg-neutral-700/90 backdrop-blur-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-4">
            <div className="mx-auto w-10 h-10 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mb-2 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-600 transition-colors">
              <Upload className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Cliquer ou glisser-déposer</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">PNG, JPG, JPEG (max. 5MB)</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  )
}
