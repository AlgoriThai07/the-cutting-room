import { memo } from 'react'
import { motion } from 'framer-motion'
import type { CardImageProps } from '@/types/index.ts'

const CardImage = memo(function CardImage({
  src,
  alt,
  style,
  zIndex,
}: CardImageProps) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center p-8"
      style={{
        scale: style.scale,
        rotate: style.rotate,
        x: style.x,
        y: style.y,
        opacity: style.opacity,
        zIndex,
      }}
    >
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-lg bg-cream-dark">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto object-cover"
          loading="lazy"
          draggable={false}
        />
      </div>
    </motion.div>
  )
})

export default CardImage
