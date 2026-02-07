import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocialStore } from '@/store/socialStore.ts'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

interface NotificationPopoverProps {
    isOpen: boolean
    onClose: () => void
}

function NotificationPopover({ isOpen, onClose }: NotificationPopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null)
    const notifications = useSocialStore((s) => s.notifications)
    const markRead = useSocialStore((s) => s.markRead)
    const markAllRead = useSocialStore((s) => s.markAllRead)
    const acceptFriendRequest = useSocialStore((s) => s.acceptFriendRequest)

    const rejectFriendRequest = useSocialStore((s) => s.rejectFriendRequest)
    const deleteNotification = useSocialStore((s) => s.deleteNotification)

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
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

    const handleAccept = async (userId: string, notifId: string) => {
        const success = await acceptFriendRequest(userId)
        if (success) {
            await deleteNotification(notifId)
        }
    }

    const handleReject = async (userId: string, notifId: string) => {
        const success = await rejectFriendRequest(userId)
        if (success) {
            await deleteNotification(notifId)
        }
    }

    const handleMarkRead = async (e: React.MouseEvent, notifId: string) => {
        e.preventDefault()
        e.stopPropagation()
        await markRead(notifId)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="notification-popover"
                    ref={popoverRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="notif-header">
                        <h3 className="font-hand">Notifications</h3>
                        {notifications.length > 0 && (
                            <button className="fs-xs" onClick={() => markAllRead()}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notif-list">
                        {notifications.length === 0 ? (
                            <div className="notif-empty fs-s">No notifications</div>
                        ) : (
                            notifications.map((notif: any) => (
                                <div
                                    key={notif._id}
                                    className={`notif-item ${!notif.read ? 'unread' : ''}`}
                                    onClick={() => !notif.read && markRead(notif._id)}
                                >
                                    <img
                                        src={notif.from_user_id?.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${notif.from_user_id?.username}`}
                                        alt="Avatar"
                                        className="notif-avatar"
                                    />
                                    <div className="notif-content">
                                        <p className="notif-text">
                                            <span className="font-bold">{notif.from_user_id?.username}</span>{' '}
                                            {notif.type === 'like' && 'liked your post'}
                                            {notif.type === 'friend_request' && 'sent you a friend request'}
                                            {notif.type === 'friend_accepted' && 'accepted your friend request'}
                                        </p>
                                        <span className="notif-time">{formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}</span>

                                        {notif.type === 'friend_request' && (
                                            <div className="notif-actions">
                                                <button
                                                    className="btn-gradient btn-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.nativeEvent.stopImmediatePropagation();
                                                        handleAccept(notif.from_user_id._id, notif._id);
                                                    }}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    className="btn-outline btn-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.nativeEvent.stopImmediatePropagation();
                                                        handleReject(notif.from_user_id._id, notif._id);
                                                    }}
                                                >
                                                    Reject
                                                </button>
                                                <Link
                                                    to={`/friends?find=${notif.from_user_id.email}`}
                                                    className="btn-outline btn-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.nativeEvent.stopImmediatePropagation();
                                                        // Close popover when navigating
                                                        onClose();
                                                    }}
                                                >
                                                    View Profile
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                    {!notif.read && (
                                        <button
                                            className="notif-dot"
                                            title="Mark as read"
                                            onClick={(e) => handleMarkRead(e, notif._id)}
                                        />
                                    )}
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
