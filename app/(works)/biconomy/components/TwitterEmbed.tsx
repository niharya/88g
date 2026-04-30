'use client'

// TwitterEmbed — static custom card.
// Original Twitter widget is replaced because the iframe hides follow button,
// reply thread, and styling behind Twitter's own sandbox. This card surfaces
// only: handle row + tweet body + timestamp, with the whole card linking out
// to the thread on X. Bird icon is the original Twitter mark (not the X logo).
//
// Tweet copy is authored here, not fetched, so threads stay legible even if
// X is geoblocked or the widget script is unreachable.

type TweetProps = {
  tweetId: string
  className?: string
  author?: string
  handle?: string
  avatarSrc?: string
  body: string
  timestamp: string // human-readable, e.g. "9:14 AM · Aug 5, 2022"
}

function TwitterBird({ className }: { className?: string }) {
  // The original (pre-2023) Twitter bird, not the X mark.
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      className={className}
    >
      <path
        fill="currentColor"
        d="M23.643 4.937c-.835.37-1.732.62-2.675.733a4.67 4.67 0 0 0 2.048-2.578 9.3 9.3 0 0 1-2.958 1.13 4.66 4.66 0 0 0-7.938 4.25 13.229 13.229 0 0 1-9.602-4.868 4.66 4.66 0 0 0 1.442 6.22 4.647 4.647 0 0 1-2.11-.583v.06a4.66 4.66 0 0 0 3.737 4.568 4.692 4.692 0 0 1-2.104.08 4.661 4.661 0 0 0 4.352 3.234 9.348 9.348 0 0 1-5.786 1.995 9.5 9.5 0 0 1-1.112-.065 13.175 13.175 0 0 0 7.14 2.093c8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602a9.47 9.47 0 0 0 2.323-2.41z"
      />
    </svg>
  )
}

export default function TwitterEmbed({
  tweetId,
  className,
  author = 'Biconomy Experience',
  handle = 'BiconomyX',
  avatarSrc = '/images/biconomy/api/biconomyx-pp.webp',
  body,
  timestamp,
}: TweetProps) {
  if (!tweetId) return null
  const tweetUrl = `https://twitter.com/i/status/${tweetId}`

  return (
    <a
      href={tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`tweet-card${className ? ` ${className}` : ''}`}
    >
      <header className="tweet-card__header">
        <div className="tweet-card__identity">
          <div className="tweet-card__avatar" aria-hidden="true">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" />
            ) : (
              <span className="tweet-card__avatar-letter">{author.charAt(0)}</span>
            )}
          </div>
          <div className="tweet-card__names">
            <span className="tweet-card__name t-h5">{author}</span>
            <span className="tweet-card__handle t-p4">@{handle}</span>
          </div>
        </div>
        <TwitterBird className="tweet-card__bird" />
      </header>
      <p className="tweet-card__body t-p3">{body}</p>
      <time className="tweet-card__timestamp t-p4">{timestamp}</time>
    </a>
  )
}
