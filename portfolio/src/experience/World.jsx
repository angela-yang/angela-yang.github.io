import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'

function Particles({ count = 80 }) {
  const mesh = useRef()

  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 20  // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * 40  // y 
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10  // z
  }

  useFrame((state) => {
    // Particle movement
    const pos = mesh.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      pos.array[i * 3 + 1] += 0.005
      if (pos.array[i * 3 + 1] > 20) pos.array[i * 3 + 1] = -20
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#4ecdc4" size={0.05} transparent opacity={0.6} />
    </points>
  )
}

function CameraRig() {
  const { camera } = useThree()
  const targetY = useRef(0)

  useFrame(() => {
    camera.position.y += (targetY.current - camera.position.y) * 0.05
  })

  const attached = useRef(false)
  if (!attached.current) {
    attached.current = true
    window.addEventListener('wheel', (e) => {
      targetY.current = Math.min(0, Math.max(-30, targetY.current - e.deltaY * 0.01))
    })
  }

  return null
}

export default function World() {
  return (
    <>
      <fog attach="fog" args={['#0a1628', 8, 35]} />

      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 5]} intensity={1.5} color="#4ecdc4" />
      <pointLight position={[0, -10, 3]} intensity={0.8} color="#1a9e8f" />
      <pointLight position={[0, -25, 3]} intensity={0.6} color="#f4c542" />

      <Particles />
      <CameraRig />
    </>
  )
}