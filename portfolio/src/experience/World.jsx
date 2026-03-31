import { useRef, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'
import * as THREE from 'three'

const C = {
  light: '#BE9DB5',
  lightpink: '#A984A0',
  pink: '#AA6787',
  lightpurple: '#787caa',
  purple: '#4f598c',
  darkpurple: '#39446e',
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
      arr[i * 3] = (Math.random() - 0.5) * 20
      arr[i * 3 + 1] = (Math.random() - 0.5) * 80
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10
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
      <pointsMaterial color={C.light} size={0.06} transparent opacity={0.6} />
    </points>
  )
}

// -- Light rays but i didnt like (might add back later) -----------------
function LightRays() {
  const groupRef = useRef()
  const raysRef = useRef([])

  const rays = [
    { x: 3.3, rotZ: -0.08, w: 0.4, h: 5.5, op: 0.04 },
    { x: 3.8, rotZ: -0.15, w: 0.2, h: 5.5, op: 0.06 },
    { x: 4.7, rotZ: -0.15, w: 0.5, h: 5.8, op: 0.07 },
    { x: 5.5, rotZ: -0.25, w: 0.35, h: 6, op: 0.05 },
    { x: 6.3, rotZ: -0.28, w: 0.35, h: 6.1, op: 0.04 },
    { x: 7.2, rotZ: -0.36, w: 0.3, h: 5.8, op: 0.03 },
    { x: 8.0, rotZ: -0.45, w: 0.25, h: 5.5, op: 0.03 },
  ]

  useFrame((state) => {
    const t = state.clock.elapsedTime
    raysRef.current.forEach((ray, i) => {
      if (!ray) return
      ray.material.opacity = rays[i].op + Math.sin(t * 0.6 + i * 0.8) * 0.02
      ray.rotation.z = rays[i].rotZ + Math.sin(t * 0.3 + i * 0.5) * 0.01
    })
  })

  return (
    <group position={[0, 2, -3]}>
      {rays.map((ray, i) => (
        <mesh
          key={i}
          ref={el => raysRef.current[i] = el}
          position={[ray.x, 7 - ray.h, 0]}
          rotation={[0, 0, ray.rotZ]}
        >
          <cylinderGeometry args={[ray.w, ray.w * 0.1, ray.h, 6, 1, true]} />
          <meshBasicMaterial
            color="#a8c8ff"
            transparent
            opacity={ray.op}
            side={2}
            depthWrite={false}
          />
        </mesh>
      ))}

      {[0, 1, 2].map(i => (
        <RippleRing key={i} delay={i * 1.5} radius={1.5 + i * 0.8} y={0.5} />
      ))}
    </group>
  )
}

function RippleRing({ delay, radius, y }) {
  const ref = useRef()

  useFrame((state) => {
    if (!ref.current) return
    const t = ((state.clock.elapsedTime + delay) % 3) / 3 // 0 to 1 looping every 3s
    ref.current.scale.setScalar(0.3 + t * 1.4)
    ref.current.material.opacity = (1 - t) * 0.12
  })

  return (
    <mesh ref={ref} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.9, radius, 48]} />
      <meshBasicMaterial color="#c0d8ff" transparent opacity={0.1} depthWrite={false} side={2} />
    </mesh>
  )
}

// -- Camera --------------------
function CameraRig({ targetDepth, onDepthChange }) {
  const { camera } = useThree()

  useFrame(() => {
    camera.position.y += (targetDepth - camera.position.y) * 0.06
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
            Hi I'm Angela! Welcome to my website :)
          </p>
          <p style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: '1.5rem',
            color: C.lightpink,
            margin: '1.0rem 0 0',
            opacity: 0.7,
            letterSpacing: '0.1em',
            whiteSpace: 'wrap',
            width: '60vw',
          }}>
            I'm pursuing a B.S. in Computer Science at the University of Washington, and 
            I love building things at the intersection of code and creativity. When I'm not 
            coding, I'm probably drawing, crocheting little whales, or playing tennis.
          </p>
        </div>
      </Html>
      
      <Html center position={[0, 0, 0]}>
        <div style={{
          width: '30vw',
          height: '30vw',
          marginTop: '20vh',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: `0 0 30px ${C.lightpink}44`,
          pointerEvents: 'none',
        }}>
          <img
            src="/me.jpg"
            alt="Angela"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </Html>

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

// -- PROJECTS -----------------------------]
const PROJECTS = [
  { title: 'UW Pawprint', desc: 'Course + housing reviews for UW students.', url: 'https://uw-pawprint.vercel.app/', img: '/projects/pawprint.png', bubble: '/projects/bubble1.png', tags: ['React', 'Next.js', 'Supabase', 'Python'] },
  { title: 'CSEED Buildspace', desc: 'Club showcase site as Design Engineer.', url: 'https://cseed-buildspace.vercel.app/', img: '/projects/buildspace.png', bubble: '/projects/bubble2.png', tags: ['React', 'Next.js', 'TailwindCSS'] },
  { title: 'Tangierine', desc: 'E-commerce site for my artwork.', url: 'https://tangierine.vercel.app', img: '/projects/tangierine.png', bubble: '/projects/bubble3.png', tags: ['React', 'Next.js', 'Stripe', 'Supabase'] },
  { title: 'Paint-A-Hike', desc: 'Draw a sketch, find your real hike.', url: 'https://github.com/angela-yang/Dubhacks-25', img: '/projects/paint.png', bubble: '/projects/bubble4.png', tags: ['Next.js', 'Python', 'TailwindCSS'] },
  { title: 'Air Quality Health', desc: 'Track air quality + personalized health tips.', url: 'https://devpost.com/software/air-quality-health', img: '/projects/aqi.png', bubble: '/projects/bubble5.png', tags: ['HTML', 'CSS', 'JavaScript'] },
  { title: 'Bear Go Brr', desc: 'Adopt a polar bear, reduce your carbon footprint.', url: 'https://github.com/angela-yang/Penguins', img: '/projects/bear.png', bubble: '/projects/bubble6.png', tags: ['HTML', 'CSS', 'JavaScript', 'Python'] },
  { title: 'Crane Game', desc: 'Find ten paper cranes in the dark.', url: 'https://angela-yang.github.io/crane-game/', img: '/projects/crane.png', bubble: '/projects/bubble7.png', tags: ['p5.js', 'HTML', 'CSS'] },
]

const BUBBLE_CONFIGS = [
  { x: -1.5, y: 0.5, z: 2.0, size: 120 },
  { x: 1.2, y: 0.8, z: 2.6, size: 115 },
  { x: -0.2, y: -0.3, z: 2.5, size: 125 },
  { x: 0.6, y: 0.4, z: 1.5, size: 100 },
  { x: -1.6, y: -0.7, z: 2.0, size: 95 },
  { x: 1.5, y: -0.6, z: 2.0, size: 88 },
  { x: -0.5, y: 1.0, z: 1.0, size: 90 },
]

function ProjectBubble({ cfg, index, project, isActive, onClick }) {
  const [expanded, setExpanded] = useState(false)
  const bobRef = useRef()

  const depthT = (cfg.z + 2) / 4
  const opacity = 0.45 + depthT * 0.55
  const scale = 0.65 + depthT * 0.55
  const colors = [C.lightpink, C.pink, C.lightpurple, C.purple, C.light, C.lightpink, C.pink]
  const color = colors[index % colors.length]
  const SIZE = cfg.size

  useFrame((state) => {
    if (!bobRef.current || expanded) return
    bobRef.current.position.y = cfg.y + Math.sin(state.clock.elapsedTime * 0.45 + index * 1.1) * 0.18
  })

  const handleClick = () => { setExpanded(true); onClick(index) }
  const handleClose = () => { setExpanded(false); onClick(null) }

  return (
    <>
      <group ref={bobRef} position={[cfg.x, cfg.y, cfg.z]}>
        <Html center distanceFactor={8 - cfg.z * 1.2} occlude={false}>
          <div
            onClick={handleClick}
            style={{
              opacity: expanded ? 0 : opacity,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              transition: 'opacity 0.2s',
              pointerEvents: expanded ? 'none' : 'all',
              cursor: 'pointer',
              userSelect: 'none',
              textAlign: 'center',
              width: `${SIZE}px`,
            }}
          >
            <img
              src={project.bubble}
              alt={project.title}
              style={{
                width: '80%', 
                aspectRatio: '1',
                objectFit: 'cover', 
                display: 'block', 
                margin: '0 auto',
              }}
            />
            <div style={{
              marginTop: '7px',
              fontFamily: 'Nunito, sans-serif',
              fontSize: `${Math.max(10, SIZE * 0.13)}px`,
              color, 
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}>
              {project.title}
            </div>
          </div>
        </Html>
      </group>

      {expanded && (
        <group position={[0, 0, 2.8]}>
          <Html>
            <div
              onClick={handleClose}
              style={{
                position: 'fixed', 
                inset: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                pointerEvents: 'all',
              }}
            />

            <div style={{
              position: 'fixed',
              top: '50%', left: '50%',
              zIndex: 1000,
              pointerEvents: 'all',
              animation: 'bubbleDropFlip 0.55s cubic-bezier(0.34, 1.2, 0.64, 1) forwards',
            }}>
              <div style={{
                width: '45vw', height: '45vw',
                borderRadius: '50%',
                background: C.purple,
                opacity: 0.95,
                border: `5px solid rgba(255,255,255,0.3)`,
                boxShadow: `0 0 80px ${color}44, inset 0 0 60px ${color}11`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '3rem', boxSizing: 'border-box',
                textAlign: 'center', overflow: 'hidden',
              }}>
                <img
                  src={project.img}
                  alt={project.title}
                  style={{
                    width: '75%', aspectRatio: '16/9',
                    objectFit: 'cover', borderRadius: '5px',
                    border: `1px solid ${color}66`,
                    marginBottom: '0.6rem', flexShrink: 0,
                  }}
                />

                <h3 style={{
                  fontFamily: 'Cinzel, serif', color: 'white',
                  fontSize: '1.8rem', letterSpacing: '0.1em', margin: '0 0 0.25rem',
                }}>
                  {project.title}
                </h3>

                <p style={{
                  fontFamily: 'Nunito, sans-serif',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '1.2rem', lineHeight: 1.5, margin: '0 0 0.5rem',
                }}>
                  {project.desc}
                </p>

                {project.tags && (
                  <div style={{
                    display: 'flex', flexWrap: 'wrap',
                    gap: '4px', justifyContent: 'center', marginBottom: '0.55rem',
                  }}>
                    {project.tags.map(tag => (
                      <span key={tag} style={{
                        fontFamily: 'Nunito, sans-serif', 
                        fontSize: '1.2rem',
                        color: 'rgba(255,255,255,0.6)',
                        background: "#ffffff2a",
                        border: `1px solid #ffffff6a`,
                        borderRadius: '999px', 
                        padding: '2px 8px',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <a
                  href={project.url} target="_blank" rel="noreferrer"
                  style={{
                    color: 'white', fontSize: '1.2rem',
                    border: `1px solid ${color}99`,
                    padding: '0.28rem 1rem', borderRadius: '999px',
                    textDecoration: 'none', fontFamily: 'Nunito, sans-serif',
                    background: `${color}33`,
                  }}
                >
                  View Project →
                </a>

                <button
                  onClick={handleClose}
                  style={{
                    position: 'absolute', top: '78px', right: '78px',
                    width: '32px', height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.4)',
                    color: 'white',
                    fontSize: '1.2rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <style>{`
              @keyframes bubbleDropFlip {
                0%   { transform: translate(-50%, -140%) scale(0.4) rotateY(90deg); opacity: 0; }
                60%  { transform: translate(-50%, -50%) scale(1.05) rotateY(0deg);  opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1)    rotateY(0deg);  opacity: 1; }
              }
            `}</style>
          </Html>
        </group>
      )}
    </>
  )
}

function ProjectsZone({ y, activeProject, onProjectClick }) {
  return (
    <group position={[0, y, 0]}>
      <Html center position={[0, 2.5, 0]}>
        <div style={{ textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <h2 style={{ 
            fontFamily: 'Cinzel, serif', 
            fontSize: '2.2rem', 
            color: C.pink, 
            margin: 0, 
            letterSpacing: '0.15em',
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
            tap a bubble to explore
          </p>
        </div>
      </Html>
      {PROJECTS.map((project, i) => (
        <ProjectBubble key={i} cfg={BUBBLE_CONFIGS[i]} index={i} project={project} isActive={activeProject === i} onClick={onProjectClick} />
      ))}
    </group>
  )
}

// -- ART -----------------------------
const ARTWORKS = [
  { title: 'Nostalgia', img: '/art/piece1.jpg', desc: 'Colored Pencil' },
  { title: 'Memory Project', img: '/art/piece2.jpg', desc: 'Colored Pencil' },
  { title: 'Parental Love', img: '/art/piece3.jpg', desc: 'Crayon' },
  { title: 'Love', img: '/art/piece4.jpg', desc: 'Marker' },
  { title: 'Fairytale Love', img: '/art/piece5.jpg', desc: 'Charcoal' },
]

const FRAME_CONFIGS = [
  { pos: [-2.2, 0.3, 0.0], rot: [0.1, 0.3, 0.05] },
  { pos: [0.0, 0.0, 0.5], rot: [0.0, 0.0, 0.00] },
  { pos: [2.2, 0.3, -0.2], rot: [0.1, -0.3, 0.05] },
  { pos: [-1.0, -1.2, 0.3], rot: [0.2, 0.1, 0.08] },
  { pos: [1.2, -1.1, -0.1], rot: [0.1, -0.1, 0.06] },
]

function ArtFrame({ index, totalCount, artwork, floatConfig, isGallery, activeIndex, onFrameClick }) {
  const meshRef = useRef()
  const texture = useTexture(artwork.img)

  const getGalleryTransform = (i) => {
    const ANGLE_STEP = (2 * Math.PI) / totalCount
    let d = ((i - activeIndex) % totalCount + totalCount) % totalCount
    if (d > totalCount / 2) d -= totalCount
    const angle = d * ANGLE_STEP
    return {
      x: 0, y: 0,
      z: 3.5 * Math.cos(angle) - 0.9,
      rotY: -angle
    }
  }

  useFrame((state) => {
    if (!meshRef.current) return
    if (!isGallery) {
      meshRef.current.position.set(...floatConfig.pos)
      meshRef.current.position.y = floatConfig.pos[1] + Math.sin(state.clock.elapsedTime * 0.4 + index * 1.3) * 0.1
      meshRef.current.rotation.set(...floatConfig.rot)
      meshRef.current.rotation.y = floatConfig.rot[1] + Math.sin(state.clock.elapsedTime * 0.3 + index) * 0.08
      meshRef.current.scale.setScalar(1)
    } else {
      const t = getGalleryTransform(index)
      meshRef.current.position.x = (t.x + meshRef.current.position.x)
      meshRef.current.position.y += (t.y - meshRef.current.position.y) * 0.08
      meshRef.current.position.z += (t.z - meshRef.current.position.z) * 0.08
      meshRef.current.rotation.y += (t.rotY - meshRef.current.rotation.y) * 0.08
      meshRef.current.rotation.x += (0 - meshRef.current.rotation.x) * 0.08
      meshRef.current.rotation.z += (0 - meshRef.current.rotation.z) * 0.08
    }
  })

  return (
    <>
      <mesh ref={meshRef} position={floatConfig.pos} rotation={floatConfig.rot}
        onClick={() => onFrameClick(index)}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={()  => { document.body.style.cursor = 'default'  }}>
        <planeGeometry args={[1.1, 1.1 / 0.8]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

function ArtZone({ y }) {
  const [galleryMode, setGalleryMode] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const { camera } = useThree()
  const targetCamZ = useRef(5)

  useFrame(() => { camera.position.z += (targetCamZ.current - camera.position.z) * 0.05 })

  const enterGallery = (i) => { setActiveIndex(i); setGalleryMode(true);  targetCamZ.current = 6 }
  const exitGallery  = ()  => { setGalleryMode(false); targetCamZ.current = 5 }
  const prev = () => setActiveIndex(i => (i - 1 + ARTWORKS.length) % ARTWORKS.length)
  const next = () => setActiveIndex(i => (i + 1) % ARTWORKS.length)

  const btnStyle = { background: 'none', border: `1px solid ${C.lightpurple}88`, color: C.lightpurple, borderRadius: '50%', width: '44px', height: '44px', fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }

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
          }}>
            Art Gallery
          </h2>
          <p style={{ 
            fontFamily: 'Nunito, sans-serif', 
            fontSize: '1.5rem', 
            color: C.lightpurple, 
            margin: '1.0rem 0 1.0rem', 
            opacity: 0.7, 
            letterSpacing: '0.1em' 
          }}>
            {galleryMode ? 'click arrows to explore' : 'illustrations · paintings · digital'}
          </p>
        </div>
      </Html>

      {ARTWORKS.map((artwork, i) => (
        <ArtFrame key={i} index={i} totalCount={ARTWORKS.length} artwork={artwork}
          floatConfig={FRAME_CONFIGS[i % FRAME_CONFIGS.length]}
          isGallery={galleryMode} activeIndex={activeIndex}
          onFrameClick={(idx) => {
            if (!galleryMode) enterGallery(idx)
            else if (idx === activeIndex) exitGallery()
            else setActiveIndex(idx)
          }} />
      ))}

      {galleryMode && (
        <>
          <Html center position={[0, -2.2, 0]}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontFamily: 'Nunito, sans-serif', pointerEvents: 'all' }}>
              <button onClick={prev} style={btnStyle}>‹</button>
              <div style={{ textAlign: 'center', minWidth: '30vw' }}>
                <div style={{ 
                  fontFamily: 'Cinzel, serif', 
                  fontSize: '1.5rem', 
                  color: C.light, 
                  letterSpacing: '0.1em', 
                  marginBottom: '4px' 
                }}>
                  {ARTWORKS[activeIndex].title}
                </div>
                <div style={{ 
                  fontSize: '1.2rem', 
                  color: C.lightpurple, 
                  opacity: 0.7 
                }}>
                  {ARTWORKS[activeIndex].desc}
                </div>
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '1.0rem', 
                  color: C.lightpurple,
                  opacity: 0.5 
                }}>
                  {activeIndex + 1} / {ARTWORKS.length}
                </div>
              </div>
              <button onClick={next} style={btnStyle}>›</button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button onClick={exitGallery} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: C.lightpurple, 
                  opacity: 0.5, 
                  fontSize: '1.0rem', 
                  cursor: 'pointer', 
                  letterSpacing: '0.1em', 
                  fontFamily: 'Nunito, sans-serif' 
                }}
              >
                ✕ close gallery
              </button>
            </div>
          </Html>
          <Html center position={[0, -3.2, 0]}>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', pointerEvents: 'all' }}>
              {ARTWORKS.map((_, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveIndex(i)} 
                  style={{ 
                    width: i === activeIndex ? '20px' : '8px', 
                    height: '8px', 
                    borderRadius: '4px', 
                    background: i === activeIndex ? C.lightpurple : `${C.lightpurple}44`, 
                    cursor: 'pointer', 
                    transition: 'all 0.3s ease' 
                  }} 
                />
              ))}
            </div>
          </Html>
        </>
      )}
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
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '2.2rem', color: C.purple, margin: 0, letterSpacing: '0.15em', textShadow: `0 0 30px ${C.purple}88` }}>Contact</h2>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '1.5rem', color: C.purple, margin: '1.0rem 0 2.5rem', opacity: 0.7, letterSpacing: '0.1em' }}>angelay2@uw.edu</p>
        </div>
      </Html>

      {[1.0, 1.5, 2.0].map((radius, i) => (
        <mesh key={i} ref={(el) => (rings.current[i] = el)} position={[0, 0, 0]} rotation={[Math.PI / 3 + i * 0.4, 0, i * 0.5]}>
          <torusGeometry args={[radius, 0.02, 15, 40]} />
          <meshStandardMaterial color={C.purple} emissive={C.purple} emissiveIntensity={0.5} transparent opacity={0.4} />
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
      <pointLight position={[0, -10, 5]} intensity={1.0} color={C.lightpink} />
      <pointLight position={[0, -20, 5]} intensity={1.0} color={C.pink} />
      <pointLight position={[0, -30, 5]} intensity={0.8} color={C.lightpurple} />
      <pointLight position={[0, -40, 5]} intensity={0.8} color={C.purple} />

      <Particles />
      <CameraRig targetDepth={targetDepth} onDepthChange={onDepthChange} />

      <AboutZone y={-10} />
      <ProjectsZone y={-20} activeProject={activeProject} onProjectClick={onProjectClick} />
      <ArtZone y={-30} />
      <ContactZone y={-40} />
    </>
  )
}