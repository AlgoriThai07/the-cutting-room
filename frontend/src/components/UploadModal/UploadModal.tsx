import { useRef, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { useTrackStore } from '@/store/trackStore.ts'
interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
} as const

const panelVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
} as const

function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [caption, setCaption] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  const createItem = useTrackStore((s) => s.createItem)
  const isLoading = useTrackStore((s) => s.isLoading)

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      setFileName(file.name)
      const url = URL.createObjectURL(file)
      setPreview(url)
    },
    [],
  )

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && !isLoading) onClose()
    },
    [onClose, isLoading],
  )

  const handleSave = useCallback(async () => {
    if (!fileInputRef.current?.files?.[0]) return

    const file = fileInputRef.current.files[0]
    const formData = new FormData()

    // Structure expected by backend:
    // flattened: file in 'image', data JSON string in 'data'
    // or grouped fields. The current backend (itemController.js:205) supports 'data' field JSON or direct body fields.
    // Let's use direct fields for file + JSON data string for metadata as that's robust

    // Actually looking at backend: 
    // const files = req.files || [];
    // if (req.body.data) ... JSON.parse(req.body.data)

    formData.append('image', file)
    formData.append('data', JSON.stringify({
      content_type: 'image',
      caption: caption,
      description: '', // Optional
    }))

    const success = await createItem(formData)

    if (success) {
      onClose()
      setFileName('')
      setCaption('')
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
    } else {
      alert('Failed to upload. Please try again.')
    }
  }, [onClose, preview, caption, createItem])

  const handleCancel = useCallback(() => {
    onClose()
    setFileName('')
    setCaption('')
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
  }, [onClose, preview])

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="upload-modal-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          aria-modal="true"
          role="dialog"
          aria-label="Upload photo"
        >
          <motion.div
            className="upload-modal-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Photo upload section */}
            <div className="upload-modal-section">
              <h3 className="upload-modal-label font-hand">Your photo:</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="upload-modal-file-input"
                onChange={handleFileChange}
              />
              <button
                type="button"
                className="upload-modal-upload-link font-hand"
                onClick={handleUploadClick}
              >
                &bull; Upload
              </button>
              {preview ? (
                <div className="upload-modal-preview">
                  <img src={preview} alt={fileName} draggable={false} />
                </div>
              ) : null}
              {fileName ? (
                <p className="upload-modal-filename">{fileName}</p>
              ) : null}
            </div>

            {/* Caption input section */}
            <div className="upload-modal-section">
              <h3 className="upload-modal-label font-hand">
                Caption: <span className="upload-modal-hint">(2-3 sentence max)</span>
              </h3>
              <textarea
                className="upload-modal-textarea font-body"
                rows={4}
                placeholder="Write a short caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>

            {/* Footer actions */}
            <div className="upload-modal-footer">
              <button
                type="button"
                className="upload-modal-btn font-hand"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="upload-modal-btn upload-modal-btn-save font-hand"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default UploadModal