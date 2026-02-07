export interface CollageItem {
  id: string
  type: 'image' | 'empty'
  src?: string
  alt?: string
  caption?: string
}

export interface StorylineContent {
  pinnedSentence: string
  paragraphs: readonly string[]
}

export interface RecapEntry {
  heading: string
  body: string
}

export interface CardEntry {
  src: string
  alt: string
}

export interface CardImageProps {
  src: string
  alt: string
  style: {
    scale: import('framer-motion').MotionValue<number>
    rotate: import('framer-motion').MotionValue<number>
    x: import('framer-motion').MotionValue<number>
    y: import('framer-motion').MotionValue<number>
    opacity: import('framer-motion').MotionValue<number>
  }
  zIndex: number
}

export interface User {
  id: string
  username: string
  displayName: string
  avatar: string
  bio: string
  tracksCount: number
  friendsCount: number
}

export interface TrackNode {
  id: string
  src: string
  alt: string
  caption: string
  date: string
}

export interface Track {
  id: string
  ownerId: string
  ownerName: string
  ownerAvatar: string
  title: string
  weekLabel: string
  status: 'active' | 'completed'
  nodes: TrackNode[]
  narrative: string[]
  pinnedSentence: string
  communityReflection?: string
  upvotes: number
  downvotes: number
  commentsCount: number
  createdAt: string
}

export interface Friend {
  id: string
  username: string
  displayName: string
  avatar: string
  bio: string
  tracksCount: number
}

export interface Comment {
  id: string
  userId: string
  username: string
  avatar: string
  text: string
  timestamp: string
}
