
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'

export default function UploadZone({ onUpload }) {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true)
    for (const file of acceptedFiles) {
      await onUpload(file)
    }
    setUploading(false)
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
    }
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-3 text-gray-400" size={32} />
      {uploading ? (
        <p className="text-blue-600 font-medium">Processing with AI...</p>
      ) : isDragActive ? (
        <p className="text-blue-600 font-medium">Drop it here!</p>
      ) : (
        <>
          <p className="text-gray-600 font-medium">Drag & drop files here</p>
          <p className="text-gray-400 text-sm mt-1">Supports .txt, .pdf</p>
        </>
      )}
    </div>
  )
}