// StayingAnchored — port of original StayingAnchored.js
// Source-locked: 10-col grid, irregular photo placement, two prose blocks.
// Images in source were placeholders; preserved exactly with corrected path.

const Photo = ({ className, url }: { className?: string; url: string }) => (
  <div className={`sa__photo ${className ?? ''}`}>
    <img
      src={url}
      alt=""
      className="sa__photo-img"
      draggable={false}
    />
  </div>
)

export default function StayingAnchored() {
  return (
    <div className="sa">
      <h2 className="sa__lead t-h1">
        By year two, almost everyone I&apos;d started with had left.
      </h2>
      <div className="sa__grid">
        <Photo className="sa__photo--a" url="/images/biconomy/demos/game.png" />
        <Photo className="sa__photo--b" url="/images/biconomy/demos/game.png" />
        <Photo className="sa__photo--c" url="/images/biconomy/demos/game.png" />
        <Photo className="sa__photo--d" url="/images/biconomy/demos/game.png" />

        <p className="sa__prose-1 t-p2">
          To stay centered, I kept my own documentation: decision logs, PM
          notes, founder goals, working styles. It became the best way to keep
          the threads connected.
        </p>

        <Photo className="sa__photo--e" url="/images/biconomy/demos/game.png" />
        <p className="sa__prose-2 t-p2">
          Outside the company, I tracked what was happening in web3, read the
          EIPs that mattered and translated the useful ones into features.
          <br /><br />
          Also, attended a few events and befriended some blockchain devs. The
          conversations with them informed some of the decisions on navigation
          and flow.
        </p>
        <Photo className="sa__photo--f" url="/images/biconomy/demos/game.png" />
        <Photo className="sa__photo--g" url="/images/biconomy/demos/game.png" />
      </div>
    </div>
  )
}
