import { useRef } from 'react'
import { useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import { AnimatePresence, motion } from 'framer-motion'
import CardImage from './CardImage.tsx'
import { CARD_IMAGES } from '@/data/cardImages.ts'
import { useScrollStore } from '@/store/scrollStore.ts'
import { RECAP_SECTIONS } from '@/data/recapContent.ts'

function useCardTransforms(
  scrollYProgress: MotionValue<number>,
  entryStart: number,
  entryEnd: number,
  exitStart: number,
  exitEnd: number,
) {
  const scale = useTransform(
    scrollYProgress,
    [entryStart, entryEnd, exitStart, exitEnd],
    [0.7, 1.0, 1.0, 0.92],
  )
  const rotate = useTransform(
    scrollYProgress,
    [entryStart, entryEnd, exitStart, exitEnd],
    [-8, 0, 0, 2],
  )
  const x = useTransform(
    scrollYProgress,
    [entryStart, entryEnd, entryEnd, exitEnd],
    [-30, 0, 0, 0],
  )
  const y = useTransform(
    scrollYProgress,
    [entryStart, entryEnd, exitStart, exitEnd],
    [120, 0, 0, -80],
  )
  const fadeIn = entryStart + (entryEnd - entryStart) * 0.75
  const opacity = useTransform(
    scrollYProgress,
    [entryStart, fadeIn, exitStart, exitEnd],
    [0, 1, 1, 0.6],
  )

  return { scale, rotate, x, y, opacity }
}

function CardStack() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Card 1: enters section 1, visible section 2, exits section 3
  const card1 = useCardTransforms(scrollYProgress, 0.0, 0.2, 0.4, 0.6)
  // Card 2: enters section 2, visible section 3, exits section 4
  const card2 = useCardTransforms(scrollYProgress, 0.2, 0.4, 0.6, 0.8)
  // Card 3: enters section 3, visible section 4, exits section 5
  const card3 = useCardTransforms(scrollYProgress, 0.4, 0.6, 0.8, 1.0)

  const setActiveSectionIndex = useScrollStore(
    (state) => state.setActiveSectionIndex,
  )

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const sectionIndex = Math.min(Math.floor(latest * 5), 4)
    const currentIndex = useScrollStore.getState().activeSectionIndex
    if (sectionIndex !== currentIndex) {
      setActiveSectionIndex(sectionIndex)
    }
  })

  const cards = [
    { transforms: card1, zIndex: 1, image: CARD_IMAGES[0] },
    { transforms: card2, zIndex: 2, image: CARD_IMAGES[1] },
    { transforms: card3, zIndex: 3, image: CARD_IMAGES[2] },
  ]

  return (
    <div ref={containerRef} className="relative" style={{ height: '500vh' }}>
      {/* Sticky container for visible cards */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {cards.map((card, i) => (
          <CardImage
            key={i}
            src={card.image.src}
            alt={card.image.alt}
            style={card.transforms}
            zIndex={card.zIndex}
          />
        ))}
      </div>

      {/* Mobile-only inline recap */}
      <MobileRecapOverlay />
    </div>
  )
}

function MobileRecapOverlay() {
  const activeSectionIndex = useScrollStore(
    (state) => state.activeSectionIndex,
  )
  const section = RECAP_SECTIONS[activeSectionIndex]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 p-6 bg-cream/90 backdrop-blur-sm border-t border-warm-gray z-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSectionIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <h3 className="font-hand fs-m text-ink">{section.heading}</h3>
          <p className="text-ink-light fs-xs mt-1 leading-relaxed">
            {section.body}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default CardStack
