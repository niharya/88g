import svgPaths from './paths'
import { imgGroup, imgGroup1, imgGroup2, imgGroup3 } from './masks'

function CardEffects() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 15.8,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 9.478,
        alignItems: 'flex-start',
        width: 205.36,
      }}
    >
      <div
        style={{
          backgroundColor: '#ab32df',
          display: 'flex',
          alignItems: 'center',
          padding: 9.478,
          borderRadius: 24,
          flexShrink: 0,
          width: 205.36,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-rr-playpen), cursive',
            fontWeight: 600,
            color: '#ffefab',
            fontSize: 14.22,
            lineHeight: '14.218px',
            whiteSpace: 'nowrap',
            wordBreak: 'break-word',
            margin: 0,
          }}
        >
          Attack Nullified
        </p>
      </div>
      <div
        style={{
          backgroundColor: '#efac55',
          display: 'flex',
          gap: 9.478,
          alignItems: 'center',
          padding: '4.74px 9.478px',
          borderRadius: 24,
          flexShrink: 0,
          color: '#201e4e',
          width: 205.36,
          wordBreak: 'break-word',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-rr-playpen), cursive',
            fontWeight: 700,
            fontSize: 15.8,
            lineHeight: 'normal',
            whiteSpace: 'nowrap',
            margin: 0,
          }}
        >
          4
        </p>
        <div
          style={{
            fontFamily: 'var(--font-rr-playpen), cursive',
            fontWeight: 600,
            fontSize: 14.22,
            lineHeight: '14.218px',
            width: 141.24,
          }}
        >
          Damage to Self
        </div>
      </div>
    </div>
  )
}

function CardHeader() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 15.8,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 9.478,
        alignItems: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: '#43408c',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.58,
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6.318px 7.898px 4.74px 7.898px',
          borderRadius: 24,
          flexShrink: 0,
        }}
      >
        <div style={{ height: 15.8, width: 11.848, position: 'relative' }}>
          <svg
            style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }}
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 5.92383 7.89844"
          >
            <path d={svgPaths.pa26db00} fill="#FFEFAB" />
          </svg>
        </div>
        <p
          style={{
            fontFamily: 'var(--font-rr-playpen), cursive',
            fontWeight: 400,
            height: 20.54,
            lineHeight: 'normal',
            color: '#ffefab',
            fontSize: 15.8,
            width: 11.058,
            margin: 0,
            wordBreak: 'break-word',
          }}
        >
          2
        </p>
      </div>
      <div style={{ height: 48.97, width: 168.24, position: 'relative' }}>
        <p
          style={{
            fontFamily: 'var(--font-rr-playpen), cursive',
            fontWeight: 600,
            position: 'absolute',
            inset: 0,
            lineHeight: 'normal',
            color: '#d1f3ff',
            fontSize: 15.8,
            margin: 0,
            wordBreak: 'break-word',
          }}
        >
          Peace Treaty
        </p>
      </div>
    </div>
  )
}

function Illustration() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 80.56,
        left: '50%',
        transform: 'translateX(-50%)',
        height: 144.04,
        width: 121.04,
      }}
    >
      <div
        style={{
          position: 'absolute',
          height: 144.04,
          width: 121.04,
          left: 0,
          top: 0,
          overflow: 'hidden',
        }}
      >
        {/* Main character body */}
        <div
          style={{
            position: 'absolute',
            inset: '0.94% 0.85% 0.91% 3.61%',
            maskImage: `url("${imgGroup}")`,
            WebkitMaskImage: `url("${imgGroup}")`,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: '-1.54px -0.296px',
            WebkitMaskPosition: '-1.54px -0.296px',
            maskSize: '118.114px 142.234px',
            WebkitMaskSize: '118.114px 142.234px',
          }}
        >
          <svg
            style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }}
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 57.8203 70.6866"
          >
            <g>
              <path d={svgPaths.p1cdb4300} fill="#F7F3DA" />
              <path d={svgPaths.p16f63300} fill="#2C5D49" />
              <path d={svgPaths.p67139f0} fill="#CA6A32" />
              <path d={svgPaths.p37f83c00} fill="#393939" />
              <path d={svgPaths.pd3e2a00} fill="#393939" />
              <path d={svgPaths.p39ea5400} fill="#393939" />
              <path d={svgPaths.p83f8200} fill="#393939" />
              <path d={svgPaths.pad35200} fill="#1B1A1A" />
              <path d={svgPaths.p3cc046f1} fill="#1B1A1A" />
              <path d={svgPaths.pfa4b3c0} fill="#1B1A1A" />
              <path d={svgPaths.p1093ba00} fill="#1B1A1A" />
              <path d={svgPaths.p21b3db80} fill="#1B1A1A" />
              <path d={svgPaths.p2a468180} fill="#1B1A1A" />
              <path d={svgPaths.p11026e70} fill="#1B1A1A" />
              <path d={svgPaths.p3ed8f080} fill="#969696" />
              <path d={svgPaths.p7149c80} fill="#969696" />
              <path d={svgPaths.p8941570} fill="#969696" />
              <path d={svgPaths.p236b0d40} fill="#969696" />
              <path d={svgPaths.pfd7380} fill="#F7F3DA" />
              <path d={svgPaths.p3b1f9100} fill="#2C5D49" />
              <path d={svgPaths.p22e6ea00} fill="#2C5D49" />
              <path d={svgPaths.p35500750} fill="#2C5D49" />
              <path d={svgPaths.p9607d72} fill="#2C5D49" />
              <path d={svgPaths.p7d0dc00} fill="#2C5D49" />
              <path d={svgPaths.p2e10dc00} fill="#CA6A32" />
              <path d={svgPaths.pd4dfaf0} fill="#393939" />
              <path d={svgPaths.p1133b980} fill="#393939" />
              <path d={svgPaths.p9509400} fill="#393939" />
              <path d={svgPaths.p21e1fa00} fill="#393939" />
              <path d={svgPaths.p1b362210} fill="#1B1A1A" />
              <path d={svgPaths.p3c448e00} fill="#1B1A1A" />
              <path d={svgPaths.p24814c00} fill="#1B1A1A" />
              <path d={svgPaths.p2fa60780} fill="#1B1A1A" />
              <path d={svgPaths.p13016900} fill="#1B1A1A" />
              <path d={svgPaths.p33aec780} fill="#1B1A1A" />
              <path d={svgPaths.p166fd480} fill="#1B1A1A" />
              <path d={svgPaths.p3ef4f872} fill="#969696" />
              <path d={svgPaths.p154f8480} fill="#969696" />
              <path d={svgPaths.p30daa532} fill="#969696" />
              <path d={svgPaths.pbfe4a80} fill="#969696" />
              <path d={svgPaths.p13897900} fill="#393939" />
              <path d={svgPaths.p2273d00} fill="#1B1A1A" />
              <path d={svgPaths.p2a73cb00} fill="#1B1A1A" />
              <path d={svgPaths.p1ec87880} fill="#1B1A1A" />
              <path d={svgPaths.p339fab00} fill="#AC6A49" />
              <path d={svgPaths.p26b8ea00} fill="#AC6A49" />
              <path d={svgPaths.p7276080} fill="#D09476" />
              <path d={svgPaths.p12e4e600} fill="#D09476" />
              <path d={svgPaths.p283174f2} fill="#D09476" />
              <path d={svgPaths.p2e5d7c00} fill="#D09476" />
              <path d={svgPaths.p2c484d80} fill="#D09476" />
              <path d={svgPaths.p1c81c800} fill="#D09476" />
              <path d={svgPaths.p3d824900} fill="#D09476" />
              <path d={svgPaths.p3ee0ea80} fill="#D09476" />
              <path d={svgPaths.pb1e2c00} fill="#D09476" />
              <path d={svgPaths.p3a73f100} fill="#D09476" />
              <path d={svgPaths.p261a1f00} fill="#D09476" />
              <path d={svgPaths.p9b58200} fill="#D09476" />
              <path d={svgPaths.p11a4dc72} fill="#A9958B" />
              <path d={svgPaths.p1f8fa600} fill="#A9958B" />
              <path d={svgPaths.p2ee59080} fill="#ACCCCE" opacity="0.58" />
              <path d={svgPaths.p1a10d680} fill="#ACCCCE" opacity="0.58" />
              <path d={svgPaths.p3393a300} fill="#CBE8EA" opacity="0.58" />
              <path d={svgPaths.p2c330700} fill="#CBE8EA" opacity="0.58" />
              <path d={svgPaths.p25c18c80} fill="#CBE8EA" opacity="0.58" />
              <path d={svgPaths.p18374200} fill="#CBE8EA" opacity="0.58" />
            </g>
          </svg>
        </div>

        {/* Fire/flame element */}
        <div
          style={{
            position: 'absolute',
            inset: '33.78% 21.66% 25.19% 20.46%',
            maskImage: `url("${imgGroup1}")`,
            WebkitMaskImage: `url("${imgGroup1}")`,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: '-0.266px -0.234px',
            WebkitMaskPosition: '-0.266px -0.234px',
            maskSize: '70.722px 59.846px',
            WebkitMaskSize: '70.722px 59.846px',
          }}
        >
          <svg
            style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }}
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 35.0267 29.549"
          >
            <g>
              <path d={svgPaths.p30ef0400} fill="#C4461A" />
              <path d={svgPaths.pf16300} fill="#C4461A" />
              <path d={svgPaths.p3b784e00} fill="#C4461A" />
              <path d={svgPaths.p28977e00} fill="#C4461A" />
              <path d={svgPaths.pc697000} fill="#C4461A" />
              <path d={svgPaths.p2e0eda00} fill="#C4461A" />
              <path d={svgPaths.p3fb334f0} fill="#C4461A" />
              <path d={svgPaths.p3b81e200} fill="#C4461A" />
              <path d={svgPaths.p297f0700} fill="#C4461A" />
              <path d={svgPaths.p673b680} fill="#C4461A" />
              <path d={svgPaths.p5802280} fill="#C4461A" />
              <path d={svgPaths.p11cf9700} fill="#C4461A" />
              <path d={svgPaths.p25638300} fill="#C4461A" />
              <path d={svgPaths.p30f946f0} fill="#C4461A" />
            </g>
          </svg>
        </div>

        {/* Shadow/overlay top */}
        <div
          style={{
            position: 'absolute',
            inset: '0.49% 7.05% 43.16% 10.76%',
            maskImage: `url("${imgGroup2}")`,
            WebkitMaskImage: `url("${imgGroup2}")`,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: '-0.32px -0.704px',
            WebkitMaskPosition: '-0.32px -0.704px',
            maskSize: '100.112px 82.126px',
            WebkitMaskSize: '100.112px 82.126px',
          }}
        >
          <svg
            style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }}
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 49.742 40.5848"
          >
            <g>
              <path d={svgPaths.p27bcb100} fill="black" />
              <path d={svgPaths.p3e78e80} fill="black" />
              <path d={svgPaths.pde08e00} fill="black" />
              <path d={svgPaths.pfb2a980} fill="black" />
              <path d={svgPaths.p2f335480} fill="black" />
              <path d={svgPaths.p3620b200} fill="black" />
              <path d={svgPaths.pf8e45a0} fill="black" />
              <path d={svgPaths.p12deadf0} fill="black" />
              <path d={svgPaths.p36aead00} fill="black" />
              <path d={svgPaths.p2d38e880} fill="black" />
              <path d={svgPaths.p304fa080} fill="black" />
              <path d={svgPaths.p114d1d00} fill="black" />
              <path d={svgPaths.p7c95680} fill="black" />
              <path d={svgPaths.p24b96b00} fill="black" />
              <path d={svgPaths.pc368500} fill="black" />
              <path d={svgPaths.p494d180} fill="black" />
              <path d={svgPaths.p12456600} fill="black" />
              <path d={svgPaths.p2e362480} fill="black" />
              <path d={svgPaths.p3cc89f00} fill="black" />
              <path d={svgPaths.p1d397000} fill="black" />
              <path d={svgPaths.p4dc5cc0} fill="black" />
              <path d={svgPaths.p111b0700} fill="black" />
              <path d={svgPaths.p14873900} fill="black" />
              <path d={svgPaths.p18783e00} fill="black" />
              <path d={svgPaths.p330d8a80} fill="black" />
              <path d={svgPaths.p212e99c0} fill="black" />
              <path d={svgPaths.p2ef1f100} fill="black" />
              <path d={svgPaths.p21fcee00} fill="black" />
              <path d={svgPaths.p2bcb1780} fill="black" />
              <path d={svgPaths.p3bf92f80} fill="black" />
              <path d={svgPaths.p27be1300} fill="black" />
              <path d={svgPaths.p355e2840} fill="black" />
              <path d={svgPaths.p3e4a9780} fill="black" />
              <path d={svgPaths.p27766080} fill="black" />
              <path d={svgPaths.p38461980} fill="black" />
              <path d={svgPaths.p372db00} fill="black" />
              <path d={svgPaths.p3f852200} fill="black" />
              <path d={svgPaths.p9110900} fill="black" />
              <path d={svgPaths.pacb280} fill="black" />
              <path d={svgPaths.p140ad680} fill="black" />
              <path d={svgPaths.p2b9a6000} fill="black" />
              <path d={svgPaths.pef78180} fill="black" />
              <path d={svgPaths.p16428cf0} fill="black" />
              <path d={svgPaths.p35825300} fill="black" />
              <path d={svgPaths.p2e52cc80} fill="black" />
              <path d={svgPaths.p35b6cd80} fill="black" />
            </g>
          </svg>
        </div>

        {/* Shadow/overlay bottom */}
        <div
          style={{
            position: 'absolute',
            inset: '7.11% 0.42% 0.36% 3.21%',
            maskImage: `url("${imgGroup3}")`,
            WebkitMaskImage: `url("${imgGroup3}")`,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: '-3.89px -0.266px',
            WebkitMaskPosition: '-3.89px -0.266px',
            maskSize: '121.046px 134.062px',
            WebkitMaskSize: '121.046px 134.062px',
          }}
        >
          <svg
            style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' }}
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 58.3223 66.6284"
          >
            <g>
              <path d={svgPaths.pb45b0b0} fill="black" />
              <path d={svgPaths.p3798d740} fill="black" />
              <path d={svgPaths.p2b30f4c0} fill="black" />
              <path d={svgPaths.p707e280} fill="black" />
              <path d={svgPaths.p30f83200} fill="black" />
              <path d={svgPaths.pfec3b00} fill="black" />
              <path d={svgPaths.p20670600} fill="black" />
              <path d={svgPaths.p16aa5d30} fill="black" />
              <path d={svgPaths.p344bc380} fill="black" />
              <path d={svgPaths.p6ec8100} fill="black" />
              <path d={svgPaths.p3cf31000} fill="black" />
              <path d={svgPaths.p254ae8f0} fill="black" />
              <path d={svgPaths.p1c649580} fill="black" />
              <path d={svgPaths.p3416bac0} fill="black" />
              <path d={svgPaths.p179e5f00} fill="black" />
              <path d={svgPaths.p22744000} fill="black" />
              <path d={svgPaths.p26983500} fill="black" />
              <path d={svgPaths.p2490d600} fill="black" />
              <path d={svgPaths.p5e18380} fill="black" />
              <path d={svgPaths.p1291e500} fill="black" />
              <path d={svgPaths.p1dbde480} fill="black" />
              <path d={svgPaths.pb092000} fill="black" />
              <path d={svgPaths.p16be9c80} fill="black" />
              <path d={svgPaths.p382bb880} fill="black" />
              <path d={svgPaths.p17fbba70} fill="black" />
              <path d={svgPaths.p1dfe7800} fill="black" />
              <path d={svgPaths.p1c89fbc0} fill="black" />
              <path d={svgPaths.p68af480} fill="black" />
              <path d={svgPaths.p175d7c00} fill="black" />
              <path d={svgPaths.p2c3c2980} fill="black" />
              <path d={svgPaths.p1e3ddb00} fill="black" />
              <path d={svgPaths.p3111de80} fill="black" />
              <path d={svgPaths.p1ec2ed00} fill="black" />
              <path d={svgPaths.p2471c700} fill="black" />
              <path d={svgPaths.p37203f80} fill="black" />
              <path d={svgPaths.p319d5f00} fill="black" />
              <path d={svgPaths.p3f58f80} fill="black" />
              <path d={svgPaths.p2a908170} fill="black" />
              <path d={svgPaths.p1f17cc00} fill="black" />
              <path d={svgPaths.p9a93780} fill="black" />
              <path d={svgPaths.p7b9da00} fill="black" />
              <path d={svgPaths.p38bea700} fill="black" />
              <path d={svgPaths.p3abf9f00} fill="black" />
              <path d={svgPaths.p3df53500} fill="black" />
              <path d={svgPaths.p30849e00} fill="black" />
              <path d={svgPaths.p28e0f340} fill="black" />
              <path d={svgPaths.p1a4b7fc0} fill="black" />
              <path d={svgPaths.p18346e80} fill="black" />
              <path d={svgPaths.p1a959400} fill="black" />
              <path d={svgPaths.p18458700} fill="black" />
              <path d={svgPaths.p33191000} fill="black" />
              <path d={svgPaths.p3570e980} fill="black" />
              <path d={svgPaths.p1e881980} fill="black" />
              <path d={svgPaths.p34685400} fill="black" />
              <path d={svgPaths.p2c3c180} fill="black" />
              <path d={svgPaths.p3c6a2500} fill="black" />
              <path d={svgPaths.p37fdbd00} fill="black" />
              <path d={svgPaths.p34455280} fill="black" />
              <path d={svgPaths.p394dee00} fill="black" />
              <path d={svgPaths.p2252c000} fill="black" />
              <path d={svgPaths.p274cf800} fill="black" />
              <path d={svgPaths.p12d7e500} fill="black" />
              <path d={svgPaths.p3194c280} fill="black" />
              <path d={svgPaths.p33514b80} fill="black" />
              <path d={svgPaths.p1a4910b0} fill="black" />
              <path d={svgPaths.p8c7e000} fill="black" />
              <path d={svgPaths.p39155680} fill="black" />
              <path d={svgPaths.p24f4800} fill="black" />
              <path d={svgPaths.p3b1ab000} fill="black" />
              <path d={svgPaths.p61ce200} fill="black" />
              <path d={svgPaths.p309f4300} fill="black" />
              <path d={svgPaths.p2fb04a00} fill="black" />
              <path d={svgPaths.p39ed8f80} fill="black" />
              <path d={svgPaths.p31c87b00} fill="black" />
              <path d={svgPaths.p39083f80} fill="black" />
              <path d={svgPaths.p325b7080} fill="black" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}

export function PeaceTreatyCard() {
  return (
    <div style={{ position: 'relative', height: 355.43, width: 236.954 }}>
      <div
        style={{
          position: 'absolute',
          backgroundColor: '#201e4e',
          border: '6.318px solid #ffefab',
          height: 355.43,
          left: 0,
          borderRadius: 22.116,
          top: 0,
          width: 236.954,
          boxSizing: 'border-box',
        }}
      />
      <CardEffects />
      <CardHeader />
      <Illustration />
    </div>
  )
}
