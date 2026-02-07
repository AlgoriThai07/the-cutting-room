import type { RecapEntry } from '@/types/index.ts'

export const RECAP_SECTIONS: readonly RecapEntry[] = [
  {
    heading: 'Begin Your Track',
    body: 'Every week starts with a single moment. A photo. A thought. The first node in your personal narrative chain.',
  },
  {
    heading: 'Moments Connect',
    body: 'Each new post links to the last, forming a thread. Not a feed \u2014 a sequence. Your week takes shape one node at a time.',
  },
  {
    heading: 'Parallel Lives',
    body: 'The system finds others sharing similar experiences. Strangers on parallel paths, their stories quietly echoing yours.',
  },
  {
    heading: 'Patterns Emerge',
    body: 'Recurring imagery, shifting moods, behavioral motifs \u2014 the system begins to see the story you didn\u2019t know you were telling.',
  },
  {
    heading: 'Your Weekly Story',
    body: 'At the end of the week, the cutting room assembles your narrative. Not a diary you wrote, but a story the system wrote about you.',
  },
] as const
