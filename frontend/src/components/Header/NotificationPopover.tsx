import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useSocialStore } from '@/store/socialStore.ts'

interface NotificationPopoverProps {
    isOpen: boolean
    onClose: () => void
}

function NotificationPopover({ isOpen, onClose }: NotificationPopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null)

    const notifications = useSocialStore((s) => s.notifications)
    const fetchNotifications = useSocialStore((s) => s.fetchNotifications)
    const markRead = useSocialStore((s) => s.markRead)
    const markAllRead = useSocialStore((s) => s.markAllRead)
    const acceptFriendRequest = useSocialStore((s) => s.acceptFriendRequest)

    useEffect(() => {
        if (isOpen) {
            fetchNotifications()
        }
    }, [isOpen, fetchNotifications])

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    const handleMarkAllRead = async () => {
        await markAllRead()
    }

    const handleAccept = async (userId: string, notifId: string) => {
        await acceptFriendRequest(userId)
        await markRead(notifId)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={popoverRef}
                    className="notification-popover"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="notif-header">
                        <h3 className="font-hand">Notifications</h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="btn-text fs-xs"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notif-list">
                        {notifications.length === 0 ? (
                            <p className="notif-empty fs-s">No notifications yet.</p>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    className={`notif-item ${!notif.read ? 'unread' : ''}`}
                                    onClick={() => !notif.read && markRead(notif._id)}
                                >
                                    <img
                                        src={notif.from_user_id.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${notif.from_user_id.username}`}
                                        alt={notif.from_user_id.username}
                                        className="notif-avatar"
                                    />
                                    <div className="notif-content">
                                        <p className="notif-text fs-s">
                                            <span className="font-bold">{notif.from_user_id.username}</span>
                                            {notif.type === 'friend_request' && ' sent you a friend request.'}
                                            {notif.type === 'friend_accepted' && ' accepted your friend request.'}
                                            {notif.type === 'like' && ' liked your story.'}
                                        </p>
                                        <span className="notif-time fs-xs">
                                            {new Date(notif.created_at).toLocaleDateString()}
                                        </span>

                                        {notif.type === 'friend_request' && (
                                            <div className="notif-actions">
                                                <button
                                                    className="btn-xs btn-gradient"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleAccept(notif.from_user_id._id, notif._id)
                                                    }}
                                                >
                                                    Accept
                                                </button>
                                                <Link
                                                    to={`/profile/${notif.from_user_id._id}`}
                                                    className="btn-xs btn-outline"
                                                    onClick={() => onClose()}
                                                >
                                                    View Profile
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                    {!notif.read && <div className="notif-dot" />}
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default NotificationPopover
