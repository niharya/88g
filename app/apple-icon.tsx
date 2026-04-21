import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <svg width="140" height="140" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M40 30L50 0L60 30L90 40L60 50L50 100L40 50L10 40L40 30Z"
            fill="#0477C5"
          />
        </svg>
      </div>
    ),
    size,
  )
}
