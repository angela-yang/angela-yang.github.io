import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'

const C = {
  light: '#BE9DB5',
  lightpink: '#A984A0',
  pink: '#AA6787',
  lightpurple: '#7879AA',
  purple: '#504F8C',
  darkpurple: '#3A396E',
  accent: '#FF606A',
  accent1: '#FF896D',
  accent2: '#FFCE82',
}

// -- Particles --------------------
function Particles({ count = 200 }) {
  const ref = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 20   // x
      arr[i * 3 + 1] = (Math.random() - 0.5) * 80   // y
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10   // z
    }
    return arr
  }, [])

  useFrame(() => {
    const pos = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += 0.003
      if (pos[i * 3 + 1] > 40) pos[i * 3 + 1] = -40
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={C.lavender} size={0.06} transparent opacity={0.6} />
    </points>
  )
}

// -- Camera --------------------
function CameraRig({ targetDepth, onDepthChange }) {
  const { camera } = useThree()

  useFrame(() => {
    camera.position.y += (targetDepth - camera.position.y) * 0.06  // was 0.03 — snappier
    onDepthChange(camera.position.y)
  })

  return null
}

// -- ABOUT -----------------------------
function AboutZone({ y }) {
  const group = useRef()
  const ringRef = useRef()
  const cubeRefs = useRef([])

  const cubes = [
    { pos: [-2.5, 0.3, 0.0], scale: 0.35 },
    { pos: [ 2.5, 0.1, -0.2], scale: 0.3 },
    { pos: [-1.8, -1.0, 0.5], scale: 0.25 },
    { pos: [ 1.8, -0.8, 0.3], scale: 0.28 },
  ]

  useFrame((state) => {
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.004
      ringRef.current.rotation.x += 0.002
    }
    cubeRefs.current.forEach((ref, i) => {
      if (!ref) return
      ref.rotation.x += 0.005
      ref.rotation.y += 0.007
      ref.position.y = cubes[i].pos[1] + Math.sin(state.clock.elapsedTime * 0.5 + i * 1.2) * 0.12
    })
  })

  return (
    <group ref={group} position={[0, y, 0]}>
      <Html center position={[0, 2.2, 0]}>
        <div style={{ textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <h2 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '2.2rem',
            color: C.lightpink,
            margin: 0,
            letterSpacing: '0.15em',
            textShadow: `0 0 30px ${C.lightpink}88`,
          }}>
            About Me
          </h2>
          <p style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: '1.5rem',
            color: C.lightpink,
            margin: '1.0rem 0 0',
            opacity: 0.7,
            letterSpacing: '0.1em',
          }}>
            CS @ UW · 4.0 GPA · Designer · Builder
          </p>
        </div>
      </Html>

      <mesh ref={ringRef} position={[0, 0, 0]}>
        <torusGeometry args={[0.9, 0.06, 26, 60]} />
        <meshStandardMaterial
          color={C.lightpink}
          emissive={C.lightpink}
          emissiveIntensity={0.6}
          transparent
          opacity={0.9}
        />
      </mesh>

      {cubes.map((cfg, i) => (
        <mesh
          key={i}
          ref={(el) => (cubeRefs.current[i] = el)}
          position={cfg.pos}
          scale={cfg.scale}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={C.lightpink}
            emissive={C.lightpink}
            emissiveIntensity={0.3}
            wireframe={i % 2 === 0}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  )
}

// -- PROJECT -----------------------------
const PROJECTS = [
  { title: 'UW Pawprint', desc: 'Course + housing reviews for UW students.', url: 'https://uw-pawprint.vercel.app/', img: '/projects/pawprint.png' },
  { title: 'CSEED Buildspace', desc: 'CSEED project showcase site as Design Engineer.', url: 'https://cseed-buildspace.vercel.app/', img: '/projects/buildspace.png' },
  { title: 'My Art Shop', desc: 'E-commerce site for my artwork.', url: 'https://tangierine.vercel.app', img: '/projects/tangierine.png' },
  { title: 'Paint-A-Hike', desc: 'Draw a sketch, find your real hike.', url: 'https://github.com/angela-yang/Dubhacks-25', img: '/projects/paint.png' },
  { title: 'Air Quality Health', desc: 'Simple way to track air quality and learn its health implications', url: 'https://devpost.com/software/air-quality-health', img: '/projects/aqi.png' },
  { title: 'Bear Go Brr', desc: 'Reduce carbon footprint with a pet bear.', url: 'https://github.com/angela-yang/Penguins', img: '/projects/bear.png' },
  { title: 'Crane Game', desc: 'Find ten cranes in the dark.', url: 'https://angela-yang.github.io/crane-game/', img: '/projects/crane.png' },
]

const orbs = [
  [ -2.5, 0.5, 0.5, 0.55 ],
  [ 2.2, 0.8, -0.3, 0.6 ],
  [ 0.2, -0.6, 1.0, 0.5 ],
  [ -2.0, -0.8, -0.8, 0.5 ],
  [ 2.8, -0.2, 0.2, 0.45 ],
  [ -3.0, 0.0, -0.5, 0.45 ],
]

function ProjectsZone({ y, activeProject, onProjectClick }) {
  const groupRef = useRef()
  const meshRefs = useRef([])

  useFrame((state) => {
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const isActive = activeProject === i

      mesh.rotation.y += isActive ? 0.02 : 0.004
      mesh.rotation.x += isActive ? 0.01 : 0.002

      if (!isActive) {
        mesh.position.y = orbs[i][1] + Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.15
      }
    })
  })

  return (
    <group position={[0, y, 0]}>
      {activeProject === null && (
        <Html center position={[0, 2.5, 0]}>
          <div style={{ textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            <h2 style={{ 
              fontFamily: 'Cinzel, serif', 
              fontSize: '2.2rem', 
              color: C.pink, 
              margin: 0, 
              letterSpacing: '0.15em', 
              textShadow: `0 0 30px ${C.pink}88` 
            }}>
              Projects
            </h2>
            <p style={{ 
              fontFamily: 'Nunito, sans-serif', 
              fontSize: '1.5rem', 
              color: C.pink, 
              margin: '1.0rem 0 0', 
              opacity: 0.7, 
              letterSpacing: '0.1em' 
            }}>
              click an orb to explore
            </p>
          </div>
        </Html>
      )}

      {/* Active project */}
      {activeProject !== null && (
        <Html center position={[0, 0.2, 3]}>
          <div style={{
            width: '320px',
            background: '#aa67879d',
            borderRadius: '20px',
            padding: '1.5rem',
            fontFamily: 'Nunito, sans-serif',
            color: 'white',
            pointerEvents: 'all',
          }}>
            <img
              src={PROJECTS[activeProject].img}
              alt={PROJECTS[activeProject].title}
              style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem', display: 'block' }}
            />
            <h3 style={{ 
              fontFamily: 'Cinzel, serif', 
              color: 'white', 
              margin: '0 0 0.5rem', 
              fontSize: '1.1rem' 
            }}>
              {PROJECTS[activeProject].title}
            </h3>
            <p style={{ 
              fontSize: '0.875rem', 
              opacity: 0.75, 
              margin: '0 0 1rem', 
              lineHeight: 1.5 
            }}>
              {PROJECTS[activeProject].desc}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <a
                href={PROJECTS[activeProject].url}
                target="_blank"
                rel="noreferrer"
                style={{ 
                  color: 'white', 
                  fontSize: '0.8rem', 
                  border: `1px solid ${C.light}`, 
                  padding: '0.3rem 0.9rem', 
                  borderRadius: '999px', 
                  textDecoration: 'none' 
                }}
              >
                View →
              </a>
              <button
                onClick={() => onProjectClick(null)}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                close ✕
              </button>
            </div>
          </div>
        </Html>
      )}

      {/* Orbs */}
      <group ref={groupRef}>
        {orbs.map(([x, oy, z, scale], i) => {
          const isActive = activeProject === i
          return (
            <mesh
              key={i}
              ref={(el) => (meshRefs.current[i] = el)}
              position={isActive ? [0, 0, 2] : [x, oy, z]}
              scale={isActive ? scale * 4.5 : scale}
              onClick={() => onProjectClick(isActive ? null : i)}
              onPointerOver={() => { document.body.style.cursor = 'pointer' }}
              onPointerOut={() =>  { document.body.style.cursor = 'default'  }}
            >
              <icosahedronGeometry args={[1, 1]} />
              <meshStandardMaterial
                color={isActive ? C.lightpink : C.pink}
                emissive={C.pink}
                emissiveIntensity={isActive ? 0.9 : 0.4}
                wireframe={i % 2 === 0}
                transparent
                opacity={isActive ? 1 : 0.85}
              />
            </mesh>
          )
        })}
      </group>
    </group>
  )
}

// -- ART -----------------------------
function ArtZone({ y }) {
  const frames = useRef([])

  const frameConfigs = [
    { pos: [-2.2, 0.3, 0.0], rot: [0.1, 0.3, 0.05] },
    { pos: [ 0.0, 0.0, 0.5], rot: [0.0, 0.0, 0.0] },
    { pos: [ 2.2, 0.3, -0.2], rot: [0.1, -0.3, 0.05] },
    { pos: [-1.0, -1.2, 0.3], rot: [0.2, 0.1, 0.08] },
    { pos: [ 1.2, -1.1, -0.1], rot: [0.1, -0.1, 0.06] },
  ]

  useFrame((state) => {
    frames.current.forEach((ref, i) => {
      if (!ref) return
      ref.rotation.y = frameConfigs[i].rot[1] + Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.08
      ref.position.y = frameConfigs[i].pos[1] + Math.sin(state.clock.elapsedTime * 0.4 + i * 1.3) * 0.1
    })
  })

  return (
    <group position={[0, y, 0]}>
      <Html center position={[0, 2.2, 0]}>
        <div style={{ textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <h2 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '2.2rem',
            color: C.lightpurple,
            margin: 0,
            letterSpacing: '0.15em',
            textShadow: `0 0 30px ${C.lightpurple}88`,
          }}>
            Art Gallery
          </h2>
          <p style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: '1.5rem',
            color: C.lightpurple,
            margin: '1.0rem 0 1.0rem',
            opacity: 0.7,
            letterSpacing: '0.1em',
          }}>
            illustrations · paintings · digital
          </p>
        </div>
      </Html>

      {frameConfigs.map((cfg, i) => (
        <mesh
          key={i}
          ref={(el) => (frames.current[i] = el)}
          position={cfg.pos}
          rotation={cfg.rot}
        >
          <planeGeometry args={[1.1, 1.4]} />
          <meshStandardMaterial
            color={C.lightpurple}
            emissive={C.lightpurple}
            emissiveIntensity={0.15}
            transparent
            opacity={0.25}
            side={2}
          />
        </mesh>
      ))}

      {frameConfigs.map((cfg, i) => (
        <mesh
          key={`border-${i}`}
          position={cfg.pos}
          rotation={cfg.rot}
        >
          <planeGeometry args={[1.15, 1.45]} />
          <meshStandardMaterial
            color={C.pink}
            wireframe
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}

// -- CONTACT -----------------------------
function ContactZone({ y }) {
  const bottle = useRef()
  const rings = useRef([])

  useFrame((state) => {
    if (bottle.current) {
      bottle.current.rotation.y += 0.005
      bottle.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15
    }
    rings.current.forEach((ring, i) => {
      if (!ring) return
      ring.rotation.z += 0.003 * (i % 2 === 0 ? 1 : -1)
      ring.rotation.x += 0.002
    })
  })

  return (
    <group position={[0, y, 0]}>
      <Html center position={[0, 2.2, 0]}>
        <div style={{ textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <h2 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '2.2rem',
            color: C.purple,
            margin: 0,
            letterSpacing: '0.15em',
            textShadow: `0 0 30px ${C.purple}88`,
          }}>
            Contact
          </h2>
          <p style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: '1.5rem',
            color: C.purple,
            margin: '1.0rem 0 2.5rem',
            opacity: 0.7,
            letterSpacing: '0.1em',
          }}>
            angelay2@uw.edu
          </p>
        </div>
      </Html>

      {[1.0, 1.5, 2.0].map((radius, i) => (
        <mesh
          key={i}
          ref={(el) => (rings.current[i] = el)}
          position={[0, 0, 0]}
          rotation={[Math.PI / 3 + i * 0.4, 0, i * 0.5]}
        >
          <torusGeometry args={[radius, 0.02, 15, 40]} />
          <meshStandardMaterial
            color={C.purple}
            emissive={C.purple}
            emissiveIntensity={0.5}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

export const ZONES = [
  { y: 0, color: C.light, title: 'Angela Yang', subtitle: 'CS @ UW · Designer · Builder · Artist' },
  { y: -10, color: C.lightpink, title: 'About', subtitle: 'Who I am' },
  { y: -20, color: C.pink, title: 'Projects', subtitle: 'Things I have built' },
  { y: -30, color: C.lightpurple, title: 'Art Gallery', subtitle: 'Things I have drawn' },
  { y: -40, color: C.purple, title: 'Contact', subtitle: 'Say hello' },
]

export default function World({ targetDepth, onDepthChange, activeProject, onProjectClick }) {
  return (
    <>
      <fog attach="fog" args={['#050508', 10, 45]} />

      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 5]} intensity={1.5} color={C.light} />
      <pointLight position={[0, -8, 5]} intensity={1.0} color={C.lightpink} />
      <pointLight position={[0, -16, 5]} intensity={1.0} color={C.pink} />
      <pointLight position={[0, -24, 5]} intensity={0.8} color={C.lightpurple} />
      <pointLight position={[0, -32, 5]} intensity={0.8} color={C.purple} />

      <Particles />
      <CameraRig targetDepth={targetDepth} onDepthChange={onDepthChange} />

      <AboutZone y={-10}  />
      <ProjectsZone y={-20} activeProject={activeProject} onProjectClick={onProjectClick} />
      <ArtZone y={-30} />
      <ContactZone y={-40} />
    </>
  )
}