import { Canvas } from '@react-three/fiber'
import World from './experience/World'
import HUD from './components/HUD'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>

      <Canvas
        style={{ position: 'absolute', top: 0, left: 0 }}
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true }}
      >
        <World />
      </Canvas>

      <div id="hud">
        <HUD />
      </div>

    </div>
  )
}