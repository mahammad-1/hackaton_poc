import { useEffect, useRef } from 'react'
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Color,
  InstancedMesh,
  MathUtils,
  MeshPhysicalMaterial,
  Object3D,
  PerspectiveCamera,
  Plane,
  PMREMGenerator,
  PointLight,
  Raycaster,
  Scene,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const TMP = new Object3D()

export default function BallpitBackground({
  className = '',
  count = 200,
  followCursor = true,
  colors = ['#111111', '#a3a3a3', '#f5f5f5'],
  gravity = 0,
  friction = 0.995,
  wallBounce = 0.95,
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return undefined

    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new Scene()
    const camera = new PerspectiveCamera(45, 1, 0.1, 120)
    camera.position.set(0, 0, 20)
    camera.lookAt(0, 0, 0)

    const pmrem = new PMREMGenerator(renderer)
    const envMap = pmrem.fromScene(new RoomEnvironment()).texture
    const material = new MeshPhysicalMaterial({
      envMap,
      metalness: 0.5,
      roughness: 0.5,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      transparent: true,
      opacity: 0.98,
    })
    const geometry = new SphereGeometry(1, 28, 28)
    const mesh = new InstancedMesh(geometry, material, count)
    scene.add(mesh)

    const ambientLight = new AmbientLight(0xffffff, 1)
    const pointLight = new PointLight(new Color(colors[2] || colors[1] || colors[0]), 170)
    scene.add(ambientLight, pointLight)

    const radius = new Float32Array(count)
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)

    radius[0] = 1
    positions[0] = 0
    positions[1] = 0
    positions[2] = 0
    for (let i = 1; i < count; i += 1) {
      const b = i * 3
      positions[b] = MathUtils.randFloatSpread(10)
      positions[b + 1] = MathUtils.randFloatSpread(10)
      positions[b + 2] = MathUtils.randFloatSpread(4)
      radius[i] = MathUtils.randFloat(0.5, 1)
      velocities[b] = MathUtils.randFloatSpread(0.12)
      velocities[b + 1] = MathUtils.randFloatSpread(0.12)
      velocities[b + 2] = MathUtils.randFloatSpread(0.08)
    }

    const c0 = new Color(colors[0])
    const c1 = new Color(colors[1] || colors[0])
    const c2 = new Color(colors[2] || colors[1] || colors[0])
    for (let i = 0; i < count; i += 1) {
      const t = i / Math.max(count - 1, 1)
      const c = t < 0.5 ? c0.clone().lerp(c1, t * 2) : c1.clone().lerp(c2, (t - 0.5) * 2)
      mesh.setColorAt(i, c)
    }
    mesh.instanceColor.needsUpdate = true

    const raycaster = new Raycaster()
    const plane = new Plane(new Vector3(0, 0, 1), 0)
    const pointer = new Vector2(0, 0)
    const center = new Vector3(0, 0, 0)
    const intersection = new Vector3(0, 0, 0)
    let controlSphere0 = false

    const getWorldBounds = () => {
      const fovRad = (camera.fov * Math.PI) / 180
      const worldHeight = 2 * Math.tan(fovRad / 2) * camera.position.length()
      const worldWidth = worldHeight * camera.aspect
      return { maxX: worldWidth / 2, maxY: worldHeight / 2, maxZ: 2 }
    }

    let bounds = { maxX: 5, maxY: 5, maxZ: 2 }
    const resize = () => {
      const w = parent.offsetWidth
      const h = parent.offsetHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      bounds = getWorldBounds()
    }

    const onPointerMove = (e) => {
      if (!followCursor) return
      const rect = canvas.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      camera.getWorldDirection(plane.normal)
      if (raycaster.ray.intersectPlane(plane, intersection)) {
        center.copy(intersection)
        controlSphere0 = true
      }
    }

    const onPointerLeave = () => {
      controlSphere0 = false
    }

    if (followCursor) {
      window.addEventListener('pointermove', onPointerMove)
      canvas.addEventListener('pointerleave', onPointerLeave)
    }
    window.addEventListener('resize', resize)
    resize()

    let lastTime = performance.now()
    let rafId = 0
    const deltaVec = new Vector3()
    const pA = new Vector3()
    const pB = new Vector3()
    const vA = new Vector3()
    const vB = new Vector3()

    const animate = () => {
      const now = performance.now()
      const dt = Math.min((now - lastTime) / 1000, 0.03)
      lastTime = now

      if (controlSphere0) {
        pA.fromArray(positions, 0).lerp(center, 0.1).toArray(positions, 0)
        velocities[0] = 0
        velocities[1] = 0
        velocities[2] = 0
      }

      const start = controlSphere0 ? 1 : 0

      for (let i = start; i < count; i += 1) {
        const b = i * 3
        velocities[b + 1] -= dt * gravity * radius[i]
        velocities[b] *= friction
        velocities[b + 1] *= friction
        velocities[b + 2] *= friction

        const speed = Math.hypot(velocities[b], velocities[b + 1], velocities[b + 2])
        if (speed > 0.15) {
          const k = 0.15 / speed
          velocities[b] *= k
          velocities[b + 1] *= k
          velocities[b + 2] *= k
        }

        positions[b] += velocities[b]
        positions[b + 1] += velocities[b + 1]
        positions[b + 2] += velocities[b + 2]
      }

      for (let i = start; i < count; i += 1) {
        const bi = i * 3
        pA.fromArray(positions, bi)
        vA.fromArray(velocities, bi)
        const rA = radius[i]

        for (let j = i + 1; j < count; j += 1) {
          const bj = j * 3
          pB.fromArray(positions, bj)
          vB.fromArray(velocities, bj)
          const rB = radius[j]
          deltaVec.copy(pB).sub(pA)
          const dist = deltaVec.length() || 0.0001
          const minDist = rA + rB
          if (dist < minDist) {
            const overlap = minDist - dist
            const correction = deltaVec.normalize().multiplyScalar(overlap * 0.5)
            pA.sub(correction)
            pB.add(correction)
            vA.sub(correction.clone().multiplyScalar(Math.max(vA.length(), 1)))
            vB.add(correction.clone().multiplyScalar(Math.max(vB.length(), 1)))
            pA.toArray(positions, bi)
            pB.toArray(positions, bj)
            vA.toArray(velocities, bi)
            vB.toArray(velocities, bj)
          }
        }

        if (controlSphere0) {
          pB.fromArray(positions, 0)
          deltaVec.copy(pB).sub(pA)
          const d = deltaVec.length() || 0.0001
          const sumR = rA + radius[0]
          if (d < sumR) {
            const corr = deltaVec.normalize().multiplyScalar(sumR - d)
            pA.sub(corr)
            vA.sub(corr.clone().multiplyScalar(Math.max(vA.length(), 2)))
          }
        }

        if (Math.abs(pA.x) + rA > bounds.maxX) {
          pA.x = Math.sign(pA.x) * (bounds.maxX - rA)
          vA.x = -vA.x * wallBounce
        }
        if (pA.y - rA < -bounds.maxY) {
          pA.y = -bounds.maxY + rA
          vA.y = -vA.y * wallBounce
        }
        if (Math.abs(pA.y) + rA > bounds.maxY) {
          pA.y = Math.sign(pA.y) * (bounds.maxY - rA)
          vA.y = -vA.y * wallBounce
        }
        if (Math.abs(pA.z) + rA > bounds.maxZ) {
          pA.z = Math.sign(pA.z) * (bounds.maxZ - rA)
          vA.z = -vA.z * wallBounce
        }

        pA.toArray(positions, bi)
        vA.toArray(velocities, bi)
      }

      for (let i = 0; i < count; i += 1) {
        const b = i * 3
        TMP.position.set(positions[b], positions[b + 1], positions[b + 2])
        TMP.scale.setScalar(i === 0 ? 0 : radius[i])
        TMP.updateMatrix()
        mesh.setMatrixAt(i, TMP.matrix)
      }
      pointLight.position.set(positions[0], positions[1], positions[2])
      mesh.instanceMatrix.needsUpdate = true
      renderer.render(scene, camera)
      rafId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(rafId)
      if (followCursor) {
        window.removeEventListener('pointermove', onPointerMove)
        canvas.removeEventListener('pointerleave', onPointerLeave)
      }
      window.removeEventListener('resize', resize)
      geometry.dispose()
      material.dispose()
      envMap.dispose()
      pmrem.dispose()
      renderer.dispose()
    }
  }, [count, followCursor, gravity, friction, wallBounce, colors])

  return <canvas ref={canvasRef} className={`w-full h-full ${className}`} />
}
