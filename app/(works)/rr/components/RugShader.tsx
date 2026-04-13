'use client'

// RugShader — Balatro-style animated paint background for /rr Cards section
//
// Direct GLSL port of the Balatro background shader (localthunk / Shadertoy XXtBRr).
// Three stages: pixelize+center → polar spin vortex → 5-pass paint distortion → 3-color blend.
//
// Tuned for /rr:
//   - Deep forest green / rich green / smoky purple palette (matching green-grain.png ref)
//   - Very slow drift (SPIN_SPEED 0.4 vs original 7.0)
//   - Renders at half-res, upscaled — the pixel snap aesthetic absorbs it
//
// Mounts inside the cards canvas, position absolute behind grid + noise.

import { useEffect, useRef } from 'react'

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG = `
precision mediump float;
uniform float u_time;
uniform vec2  u_res;

// ── Palette (green-grain.png reference) ──
#define COLOUR_1 vec4(0.04, 0.24, 0.07, 1.0)    // deep forest green
#define COLOUR_2 vec4(0.055, 0.48, 0.12, 1.0)    // rich mid green
#define COLOUR_3 vec4(0.165, 0.055, 0.19, 1.0)   // smoky purple-black

// ── Behaviour ──
#define SPIN_ROTATION  -2.0
#define SPIN_SPEED      3.0    // moderate drift (original: 7.0)
#define SPIN_AMOUNT     0.25
#define SPIN_EASE       1.0
#define CONTRAST        3.0    // slightly softer than original 3.5
#define LIGHTING        0.4
#define PIXEL_FILTER  4000.0   // higher = finer grain (745 = chunky Balatro, 4000 = near-smooth)
#define OFFSET vec2(0.0)

vec4 effect(vec2 screenSize, vec2 screen_coords) {
    // Stage 1 — Pixelize + center
    float pixel_size = length(screenSize) / PIXEL_FILTER;
    vec2 uv = (floor(screen_coords * (1.0 / pixel_size)) * pixel_size
               - 0.5 * screenSize) / length(screenSize) - OFFSET;
    float uv_len = length(uv);

    // Stage 2 — Polar spin (vortex)
    float speed = SPIN_ROTATION * SPIN_EASE * 0.2 + 302.2;
    float new_pixel_angle = atan(uv.y, uv.x)
        + speed
        - SPIN_EASE * 20.0 * (SPIN_AMOUNT * uv_len + (1.0 - SPIN_AMOUNT));
    vec2 mid = (screenSize / length(screenSize)) / 2.0;
    uv = vec2(
        uv_len * cos(new_pixel_angle) + mid.x,
        uv_len * sin(new_pixel_angle) + mid.y
    ) - mid;

    // Stage 3 — 5-pass paint distortion
    uv *= 30.0;
    float spd = u_time * SPIN_SPEED;
    vec2 uv2 = vec2(uv.x + uv.y);

    for (int i = 0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv  += 0.5 * vec2(
            cos(5.1123314 + 0.353 * uv2.y + spd * 0.131121),
            sin(uv2.x - 0.113 * spd)
        );
        uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
    }

    // Stage 4 — 3-color blend + lighting
    float contrast_mod = 0.25 * CONTRAST + 0.5 * SPIN_AMOUNT + 1.2;
    float paint_res = min(2.0, max(0.0, length(uv) * 0.035 * contrast_mod));
    float c1p = max(0.0, 1.0 - contrast_mod * abs(1.0 - paint_res));
    float c2p = max(0.0, 1.0 - contrast_mod * abs(paint_res));
    float c3p = 1.0 - min(1.0, c1p + c2p);
    float light = (LIGHTING - 0.2) * max(c1p * 5.0 - 4.0, 0.0)
                + LIGHTING * max(c2p * 5.0 - 4.0, 0.0);

    return (0.3 / CONTRAST) * COLOUR_1
         + (1.0 - 0.3 / CONTRAST) * (
               COLOUR_1 * c1p
             + COLOUR_2 * c2p
             + vec4(c3p * COLOUR_3.rgb, c3p * COLOUR_1.a)
           )
         + light;
}

void main() {
    gl_FragColor = effect(u_res, gl_FragCoord.xy);
}
`

function createShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error('RugShader compile:', gl.getShaderInfoLog(s))
    gl.deleteShader(s)
    return null
  }
  return s
}

export default function RugShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Full resolution — match parent container
    const parent = canvas.parentElement
    const rect = parent ? parent.getBoundingClientRect() : { width: 1440, height: 900 }
    const dpr = Math.min(window.devicePixelRatio, 2)
    const W = Math.round(rect.width * dpr)
    const H = Math.round(rect.height * dpr)
    canvas.width = W
    canvas.height = H

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
    if (!gl) { console.error('RugShader: no WebGL'); return }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERT)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return

    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('RugShader link:', gl.getProgramInfoLog(prog))
      return
    }
    gl.useProgram(prog)

    // Full-screen quad
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    // Uniforms
    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes = gl.getUniformLocation(prog, 'u_res')
    gl.uniform2f(uRes, W, H)
    gl.viewport(0, 0, W, H)

    // Animation loop
    let running = true
    const t0 = performance.now()
    let raf = 0

    function draw() {
      if (!running) return
      const t = (performance.now() - t0) * 0.001
      gl!.uniform1f(uTime, t)
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    // Pause when tab is hidden
    const onVis = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(raf) }
      else { running = true; raf = requestAnimationFrame(draw) }
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="rr-rug-shader"
      aria-hidden="true"
    />
  )
}
