import { useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import World, { ZONES } from './experience/World'
import HUD from './components/HUD'

export default function App() {
  const [targetDepth, setTargetDepth] = useState(0)
  const [cameraY, setCameraY] = useState(0)

  const handleDepthChange = useCallback((y) => setCameraY(y), [])

  useEffect(() => {
    const onWheel = (e) => {
      setTargetDepth((prev) =>
        Math.max(-40, Math.min(0, prev - e.deltaY * 0.02))
      )
    }
    window.addEventListener('wheel', onWheel)
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      background: '#101023',
      overflow: 'hidden',
    }}>
      <Canvas
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
        camera={{ position: [0, 0, 8], fov: 80 }}
        gl={{ antialias: true }}
      >
        <World targetDepth={targetDepth} onDepthChange={handleDepthChange} />
      </Canvas>

      <div id="hud" style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}>
        <HUD zones={ZONES} cameraY={cameraY} onNavigate={setTargetDepth} />
      </div>
    </div>
  )
}