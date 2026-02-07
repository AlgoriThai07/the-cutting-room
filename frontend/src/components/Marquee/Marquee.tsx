const MARQUEE_TEXT =
  'an interactive storytelling application where users build a weekly chain of posts called a Track.'

/* ── Hoisted static elements (rendering-hoist-jsx) ── */

const scissorsSvg = (
  <img src="/scissors.svg" width="60" height="50" alt="" aria-hidden="true" />
)

const marqueeGroup = (
  <div className="marquee-group" aria-hidden="true">
    <span className="marquee-text fs-s">{MARQUEE_TEXT}</span>
    <span className="marquee-separator">&bull;</span>
    <span className="marquee-text fs-s">{MARQUEE_TEXT}</span>
    <span className="marquee-separator">&bull;</span>
    <span className="marquee-text fs-s">{MARQUEE_TEXT}</span>
    <span className="marquee-separator">&bull;</span>
    <span className="marquee-text fs-s">{MARQUEE_TEXT}</span>
    <span className="marquee-separator">&bull;</span>
  </div>
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
        {marqueeGroup}
        {marqueeGroup}
      </div>
    </div>
  )
}

export default Marquee
