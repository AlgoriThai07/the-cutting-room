import type { CardEntry } from '@/types/index.ts'

export const CARD_IMAGES: readonly CardEntry[] = [
  {
    src: '/images/placeholder-1.svg',
    alt: 'A moment captured \u2014 the beginning of your weekly track',
  },
  {
    src: '/images/placeholder-2.svg',
    alt: 'Connected nodes forming a personal narrative chain',
  },
  {
    src: '/images/placeholder-3.svg',
    alt: 'Parallel stories weaving into a collective experience',
  },
] as const
