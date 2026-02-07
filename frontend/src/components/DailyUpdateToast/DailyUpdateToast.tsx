import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DailyUpdateToastProps {
  show: boolean
}

const toastVariants = {
  hidden: { opacity: 0, x: 60, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1 },
} as const

function DailyUpdateToast({ show }: DailyUpdateToastProps) {
  const [visible, setVisible] = useState(show)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [show])

  const handleDismiss = useCallback(() => setVisible(false), [])

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="toast-container"
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="toast-panel">
            <button
              type="button"
              className="toast-close"
              onClick={handleDismiss}
              aria-label="Dismiss"
            >
              &times;
            </button>
            <h4 className="toast-title font-hand fs-s">Daily update!</h4>
            <p className="toast-body fs-xs">
              3 friends posted new content today. Check the Cutting Room for fresh stories.
            </p>
            <span className="toast-time fs-xs">Updated 15 min ago</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default DailyUpdateToast
