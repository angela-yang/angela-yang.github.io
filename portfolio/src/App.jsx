import { useState, useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import World, { ZONES } from './experience/World'
import HUD from './components/HUD'
import * as THREE from 'three'

function lerpColor(a, b, t) {
  const ah = a.replace('#', '')
  const bh = b.replace('#', '')
  const ar = parseInt(ah.slice(0, 2), 16), ag = parseInt(ah.slice(2, 4), 16), ab = parseInt(ah.slice(4, 6), 16)
  const br = parseInt(bh.slice(0, 2), 16), bg = parseInt(bh.slice(2, 4), 16), bb = parseInt(bh.slice(4, 6), 16)
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const b2 = Math.round(ab + (bb - ab) * t)
  return `rgb(${r},${g},${b2})`
}

const isMobile = () => window.innerWidth < 768 || ('ontouchstart' in window)

export default function App() {
  const [targetDepth, setTargetDepth] = useState(0)
  const [cameraY, setCameraY] = useState(0)
  const [activeProject, setActiveProject] = useState(null)
  const [mobile, setMobile] = useState(isMobile())

  const handleDepthChange = useCallback((y) => setCameraY(y), [])

  useEffect(() => {
    const onResize = () => setMobile(isMobile())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // -- Desktop (wheel scroll) ----------------------------------
  useEffect(() => {
    if (mobile) return
    const onWheel = (e) => {
      setTargetDepth((prev) => Math.max(-40, Math.min(0, prev - e.deltaY * 0.008)))
    }
    window.addEventListener('wheel', onWheel)
    return () => window.removeEventListener('wheel', onWheel)
  }, [mobile])

  // -- Mobile (touch scroll) ------------------------------------
  const touchStartY = useRef(null)
  const touchLastY  = useRef(null)
  const velocity    = useRef(0)
  const rafRef      = useRef(null)

  useEffect(() => {
    if (!mobile) return

    const onTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY
      touchLastY.current  = e.touches[0].clientY
      velocity.current = 0
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }

    const onTouchMove = (e) => {
      if (touchLastY.current === null) return
      e.preventDefault()
      const dy = touchLastY.current - e.touches[0].clientY
      touchLastY.current = e.touches[0].clientY
      velocity.current = dy

      setTargetDepth((prev) => Math.max(-40, Math.min(0, prev - dy * 0.022)))
    }

    const onTouchEnd = () => {
      const coast = () => {
        if (Math.abs(velocity.current) < 0.3) return
        velocity.current *= 0.92
        setTargetDepth((prev) => Math.max(-40, Math.min(0, prev - velocity.current * 0.022)))
        rafRef.current = requestAnimationFrame(coast)
      }
      rafRef.current = requestAnimationFrame(coast)
      touchLastY.current = null
    }

    window.addEventListener('touchstart', onTouchStart, { passive: false })
    window.addEventListener('touchmove',  onTouchMove,  { passive: false })
    window.addEventListener('touchend',   onTouchEnd)

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove',  onTouchMove)
      window.removeEventListener('touchend',   onTouchEnd)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [mobile])

  const t = Math.min(1, Math.abs(cameraY) / 32)
  const bgColor = lerpColor('#1f2f41', '#12141b', t)

  const fov = mobile ? 75 : 60

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      background: bgColor,
      overflow: 'hidden',
      transition: 'background 0.1s',
      touchAction: 'none',
    }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60, near: 0.01, far: 1000 }}
        gl={{ antialias: true, sortObjects: true }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        onPointerMissed={() => {}}
      >
        <World
          targetDepth={targetDepth}
          onDepthChange={handleDepthChange}
          activeProject={activeProject}
          onProjectClick={setActiveProject}
          mobile={mobile}
        />
        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.6} 
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={0.8}
          />
        </EffectComposer>
      </Canvas>

      <div id="hud" style={{
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
      }}>
        <HUD
          zones={ZONES}
          cameraY={cameraY}
          onNavigate={setTargetDepth}
          expandedProject={activeProject}
          onCloseProject={() => setActiveProject(null)}
          mobile={mobile}
        />
      </div>
    </div>
  )
}