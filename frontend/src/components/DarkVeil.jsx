import { useRef, useEffect } from 'react'
import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl'
import './DarkVeil.css'

const vertex = `
attribute vec2 position;
void main(){gl_Position=vec4(position,0.0,1.0);}
`

const fragment = `
#ifdef GL_ES
precision lowp float;
#endif
uniform vec2 uResolution;
uniform float uTime;
uniform float uHueShift;
uniform float uNoise;
uniform float uScan;
uniform float uScanFreq;
uniform float uWarp;

mat3 rgb2yiq=mat3(0.299,0.587,0.114,0.596,-0.274,-0.322,0.211,-0.523,0.312);
mat3 yiq2rgb=mat3(1.0,0.956,0.621,1.0,-0.272,-0.647,1.0,-1.106,1.703);

float rand(vec2 c){return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453);}

vec3 hueShiftRGB(vec3 col,float deg){
  vec3 yiq=rgb2yiq*col;
  float rad=radians(deg);
  float c=cos(rad),s=sin(rad);
  vec3 yiqShift=vec3(yiq.x,yiq.y*c-yiq.z*s,yiq.y*s+yiq.z*c);
  return clamp(yiq2rgb*yiqShift,0.0,1.0);
}

void main(){
  vec2 uv=gl_FragCoord.xy/uResolution.xy*2.0-1.0;
  uv.y*=-1.0;
  uv+=uWarp*vec2(sin(uv.y*6.283+uTime*0.5),cos(uv.x*6.283+uTime*0.5))*0.05;

  float base = 0.5 + 0.5 * sin((uv.x + uv.y) * 2.2 + uTime * 0.4);
  float cloud = 0.5 + 0.5 * sin(uv.x * 7.0 - uTime * 0.7) * cos(uv.y * 6.0 + uTime * 0.6);
  vec3 col = mix(vec3(0.04, 0.05, 0.07), vec3(0.16, 0.18, 0.24), base * 0.65 + cloud * 0.35);

  col = hueShiftRGB(col, uHueShift);

  float scanline = sin(gl_FragCoord.y * uScanFreq) * 0.5 + 0.5;
  col *= 1.0 - (scanline * scanline) * uScan;
  col += (rand(gl_FragCoord.xy + uTime) - 0.5) * uNoise;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`

export default function DarkVeil({
  hueShift = 0,
  noiseIntensity = 0,
  scanlineIntensity = 0,
  speed = 0.5,
  scanlineFrequency = 0,
  warpAmount = 0.08,
  resolutionScale = 1,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return undefined

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      canvas,
      alpha: true,
    })
    const gl = renderer.gl
    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Vec2() },
        uHueShift: { value: hueShift },
        uNoise: { value: noiseIntensity },
        uScan: { value: scanlineIntensity },
        uScanFreq: { value: scanlineFrequency },
        uWarp: { value: warpAmount },
      },
    })
    const mesh = new Mesh(gl, { geometry, program })

    const resize = () => {
      const w = parent.clientWidth
      const h = parent.clientHeight
      renderer.setSize(w * resolutionScale, h * resolutionScale)
      program.uniforms.uResolution.value.set(w, h)
    }

    window.addEventListener('resize', resize)
    resize()

    const start = performance.now()
    let frame = 0
    const loop = () => {
      program.uniforms.uTime.value = ((performance.now() - start) / 1000) * speed
      program.uniforms.uHueShift.value = hueShift
      program.uniforms.uNoise.value = noiseIntensity
      program.uniforms.uScan.value = scanlineIntensity
      program.uniforms.uScanFreq.value = scanlineFrequency
      program.uniforms.uWarp.value = warpAmount
      renderer.render({ scene: mesh })
      frame = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [hueShift, noiseIntensity, scanlineIntensity, speed, scanlineFrequency, warpAmount, resolutionScale])

  return <canvas ref={ref} className="darkveil-canvas" />
}
