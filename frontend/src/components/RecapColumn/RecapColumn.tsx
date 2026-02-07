import { memo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useScrollStore } from '@/store/scrollStore.ts'
import { RECAP_SECTIONS } from '@/data/recapContent.ts'

const RecapColumn = memo(function RecapColumn() {
  const activeSectionIndex = useScrollStore(
    (state) => state.activeSectionIndex,
  )
  const section = RECAP_SECTIONS[activeSectionIndex]

  return (
    <div className="max-w-md w-full">
      {/* Section indicator dots */}
      <div className="flex gap-2 mb-8">
        {RECAP_SECTIONS.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              i === activeSectionIndex
                ? 'bg-ink'
                : 'bg-warm-gray-dark'
            }`}
          />
        ))}
      </div>

      {/* Recap text with crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSectionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <h2 className="font-hand text-ink fs-xl leading-tight">
            {section.heading}
          </h2>
          <p className="text-ink-light mt-6 leading-relaxed fs-base">
            {section.body}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Decorative element */}
      <div className="mt-10 w-16 h-px bg-warm-gray-dark" />
      <p className="mt-4 text-ink-muted fs-xs font-hand">
        {activeSectionIndex + 1} / {RECAP_SECTIONS.length}
      </p>
    </div>
  )
})

export default RecapColumn
