const MARQUEE_TEXT =
  'an interactive storytelling application where users build a weekly chain of posts called a Track.'

/* ── Hoisted static elements (rendering-hoist-jsx) ── */

const scissorsSvg = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="18" cy="18" r="8" stroke="#f5f5f0" strokeWidth="2" fill="none" />
    <circle cx="18" cy="46" r="8" stroke="#f5f5f0" strokeWidth="2" fill="none" />
    <line x1="24" y1="14" x2="52" y2="40" stroke="#f5f5f0" strokeWidth="2" />
    <line x1="24" y1="50" x2="52" y2="24" stroke="#f5f5f0" strokeWidth="2" />
  </svg>
)

const separator = (
  <span className="marquee-separator" aria-hidden="true">
    &bull;
  </span>
)

function Marquee() {
  return (
    <div
      className="marquee-banner"
      aria-label="Scrolling banner: an interactive storytelling application where users build a weekly chain of posts called a Track."
      role="marquee"
    >
      <div className="marquee-scissors" aria-hidden="true">
        {scissorsSvg}
      </div>

      <div className="marquee-track">
        <span className="marquee-text fs-s">{MARQUEE_TEXT}</span>
        {separator}
        <span className="marquee-text fs-s">{MARQUEE_TEXT}</span>
        {separator}
        <span className="marquee-text fs-s">{MARQUEE_TEXT}</span>
        {separator}
        <span className="marquee-text fs-s">{MARQUEE_TEXT}</span>
        {separator}
        <span className="marquee-text fs-s">{MARQUEE_TEXT}</span>
        {separator}
        <span className="marquee-text fs-s">{MARQUEE_TEXT}</span>
        {separator}
        <span className="marquee-text fs-s">{MARQUEE_TEXT}</span>
        {separator}
        <span className="marquee-text fs-s">{MARQUEE_TEXT}</span>
        {separator}
      </div>
    </div>
  )
}

export default Marquee
