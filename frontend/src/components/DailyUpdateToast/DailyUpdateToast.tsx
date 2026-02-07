import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotificationStore } from '@/store/notificationStore'

interface DailyUpdateToastProps {
  show: boolean
}

const toastVariants = {
  hidden: { opacity: 0, x: 60, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1 },
} as const

function DailyUpdateToast({ show }: DailyUpdateToastProps) {
  const notifications = useNotificationStore(s => s.notifications)
  const unreadCount = useNotificationStore(s => s.unreadCount)
  const markAsRead = useNotificationStore(s => s.markAsRead)

  const [latestNotification, setLatestNotification] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  // Update visible notification when new unread ones arrive
  useEffect(() => {
    if (show && unreadCount > 0 && notifications.length > 0) {
      // Find the most recent unread notification
      const newest = notifications.find(n => !n.read)
      if (newest) {
        setLatestNotification(newest)
        setVisible(true)
      }
    }
  }, [show, unreadCount, notifications])

  const handleDismiss = useCallback(async () => {
    if (latestNotification) {
      // Mark as read and hide
      await markAsRead(latestNotification._id)
      setVisible(false)
    } else {
      setVisible(false)
    }
  }, [latestNotification, markAsRead])

  if (!latestNotification) return null

  // Format message based on type
  let title = 'New Notification'
  let body = ''

  if (latestNotification.type === 'like') {
    title = 'New Like'
    body = `${latestNotification.from_user_id?.username || 'Someone'} liked your node: "${latestNotification.node_id?.recap_sentence?.substring(0, 30)}..."`
  } else if (latestNotification.type === 'friend_request') {
    title = 'Friend Request'
    body = `${latestNotification.from_user_id?.username || 'Someone'} sent you a friend request.`
  } else if (latestNotification.type === 'friend_accepted') {
    title = 'Friend Request Accepted'
    body = `${latestNotification.from_user_id?.username || 'Someone'} accepted your friend request.`
  }

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
            <h4 className="toast-title font-hand fs-s">{title}</h4>
            <p className="toast-body fs-xs">
              {body}
            </p>
            <span className="toast-time fs-xs">Just now</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default DailyUpdateToast
