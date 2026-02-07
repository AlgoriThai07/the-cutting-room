export interface CollageItem {
  id: string
  type: 'image' | 'empty'
  src?: string
  alt?: string
  caption?: string
}

/** Left sub-column items (taller column — drives the parallax scroll) */
export const COLLAGE_LEFT_ITEMS: readonly CollageItem[] = [
  {
    id: 'left-01',
    type: 'image',
    src: 'https://picsum.photos/seed/cut-l1/420/320',
    alt: 'A fleeting moment caught in natural light',
    caption: 'Light fragments',
  },
  {
    id: 'left-02',
    type: 'image',
    src: 'https://picsum.photos/seed/cut-l2/420/560',
    alt: 'Layers of meaning in everyday scenes',
    caption: 'Layered passage',
  },
  {
    id: 'left-03',
    type: 'image',
    src: 'https://picsum.photos/seed/cut-l3/420/340',
    alt: 'Where light meets shadow',
    caption: 'Threshold',
  },
  {
    id: 'left-04',
    type: 'empty',
  },
  {
    id: 'left-05',
    type: 'image',
    src: 'https://picsum.photos/seed/cut-l5/420/400',
    alt: 'A thread running through the week',
    caption: 'Connection',
  },
  {
    id: 'left-06',
    type: 'image',
    src: 'https://picsum.photos/seed/cut-l6/420/300',
    alt: 'Patterns you never planned to create',
    caption: 'Unplanned pattern',
  },
  {
    id: 'left-07',
    type: 'image',
    src: 'https://picsum.photos/seed/cut-l7/420/450',
    alt: 'Reflected surfaces tell their own stories',
    caption: 'Mirror world',
  },
  {
    id: 'left-08',
    type: 'image',
    src: 'https://picsum.photos/seed/cut-l8/420/320',
    alt: 'Finding rhythm in repetition',
    caption: 'Cadence',
  },
  {
    id: 'left-09',
    type: 'image',
    src: 'https://picsum.photos/seed/cut-l9/420/380',
    alt: 'The space between moments',
    caption: 'Intervals',
  },
  {
    id: 'left-10',
    type: 'image',
    src: 'https://picsum.photos/seed/cut-l10/420/310',
    alt: 'Colors that shift with the hour',
    caption: 'Time palette',
  },
] as const

/** Right sub-column items (shorter column — gets parallax-translated) */
export const COLLAGE_RIGHT_ITEMS: readonly CollageItem[] = [
  {
    id: 'right-01',
    type: 'image',
    src: 'https://picsum.photos/seed/cut-r1/420/400',
    alt: 'Doors left ajar',
    caption: 'Open endings',
  },
  {
    id: 'right-02',
    type: 'image',
    src: 'https://picsum.photos/seed/cut-r2/420/320',
    alt: 'Morning uncertainty in the sky',
    caption: 'Ambiguity',
  },
  {
    id: 'right-03',
    type: 'image',
    src: 'https://picsum.photos/seed/cut-r3/420/350',
    alt: 'Glass surfaces showing the world back',
    caption: 'Reflection',
  },
  {
    id: 'right-04',
    type: 'image',
    src: 'https://picsum.photos/seed/cut-r4/420/280',
    alt: 'What you noticed this week',
    caption: 'Attention',
  },
  {
    id: 'right-05',
    type: 'empty',
  },
  {
    id: 'right-06',
    type: 'image',
    src: 'https://picsum.photos/seed/cut-r6/420/380',
    alt: 'Between seasons and routines',
    caption: 'Liminality',
  },
  {
    id: 'right-07',
    type: 'image',
    src: 'https://picsum.photos/seed/cut-r7/420/310',
    alt: 'Convergence of parallel paths',
    caption: 'Intersect',
  },
] as const

export const STORYLINE_CONTENT = {
  pinnedSentence:
    'Lately, the light leaves the frame before it has fully arrived...',
  paragraphs: [
    'The images from this week trace an arc you did not intend. There is a recurring motif of doors left ajar, of thresholds neither crossed nor abandoned. The palette drifts between warm ambers and cold blues, as if the camera itself cannot decide which season it inhabits.',
    'In the second photograph, the angle of shadow suggests late afternoon, but the sky carries the uncertainty of morning. This contradiction echoes through the rest of the sequence, each frame adding its own small disagreement with the one before it.',
    'The system detected parallel patterns among three other users this week. All of you photographed reflections, water, glass, and surfaces that show the world back to itself. Whether this convergence means anything remains for you to decide.',
    'By the fifth node, a story began to emerge: not of events, but of attention. What you noticed this week reveals more than what you did. The narrative is in the looking, not the living.',
    'The cutting room suggests your weekly theme is liminality, the state of being between. Between seasons, between routines, between the person you were Monday and the person you became by Friday. This is your track. This is your story.',
    'Consider how the third and seventh images share the same color temperature, a warm amber that appears in the upper-left corner of both frames. This is a pattern the algorithm surfaced, but you created it unconsciously, pointing your lens toward the same frequency of light on different days.',
    'There is a tension running through the collection that resists easy resolution. Some images lean toward stillness, others toward motion caught mid-stride. The cutting room does not resolve this tension. It arranges it, holds it, and lets the viewer sit somewhere between.',
    'Other users whose timelines overlapped with yours this week reported a similar restlessness in their frames. The city, the light, the season, something was pulling attention toward edges and boundaries. Your collage captures that pull with unusual clarity.',
  ],
} as const
