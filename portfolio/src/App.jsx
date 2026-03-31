import { useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import World, { ZONES } from './experience/World'
import HUD from './components/HUD'

function lerpColor(a, b, t) {
  const ah = a.replace('#','')
  const bh = b.replace('#','')
  const ar = parseInt(ah.slice(0,2),16), ag = parseInt(ah.slice(2,4),16), ab = parseInt(ah.slice(4,6),16)
  const br = parseInt(bh.slice(0,2),16), bg = parseInt(bh.slice(2,4),16), bb = parseInt(bh.slice(4,6),16)
  const r = Math.round(ar + (br-ar)*t)
  const g = Math.round(ag + (bg-ag)*t)
  const b2 = Math.round(ab + (bb-ab)*t)
  return `rgb(${r},${g},${b2})`
}

export default function App() {
  const [targetDepth, setTargetDepth] = useState(0)
  const [cameraY, setCameraY] = useState(0)

  const handleDepthChange = useCallback((y) => setCameraY(y), [])

  useEffect(() => {
    const onWheel = (e) => {
      setTargetDepth((prev) =>
        Math.max(-40, Math.min(0, prev - e.deltaY * 0.008))
      )
    }
    window.addEventListener('wheel', onWheel)
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  const t = Math.min(1, Math.abs(cameraY) / 32)
  const bgColor = lerpColor('#17162a', '#050508', t)

  const [activeProject, setActiveProject] = useState(null)

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      background: bgColor, 
      overflow: 'hidden',
      transition: 'background 0.1s',
    }}>
      <Canvas
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }}
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true }}
      >
        <World 
          targetDepth={targetDepth}
          onDepthChange={handleDepthChange}
          activeProject={activeProject}
          onProjectClick={setActiveProject} 
        />
      </Canvas>

      <div id="hud" style={{
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
      }}>
        <HUD zones={ZONES} cameraY={cameraY} onNavigate={setTargetDepth} />
      </div>
    </div>
  )
}