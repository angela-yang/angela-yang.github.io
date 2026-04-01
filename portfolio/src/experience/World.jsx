import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { Html, useTexture, useGLTF, shaderMaterial, useAnimations, Clone} from '@react-three/drei'
import { FaLinkedin, FaGithub } from 'react-icons/fa'
import { IoDocumentSharp } from 'react-icons/io5'
import { IoMdMail } from 'react-icons/io'
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
      <pointsMaterial color={C.light} size={0.06} transparent opacity={0.6} depthWrite={false}/>
    </points>
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

function Jellyfish({
  position = [0, 0, 0],
  scale = 1.0,
  speed = 0.6,
  phase = 0,
  color = C.lightpink,
}) {
  const groupRef = useRef()
  const { scene } = useGLTF('/models/jellyfish3.glb')

  const currentRotY = useRef(0)
  const glowIntensity = useRef(0.4)
  const targetGlow = useRef(0.4)
  const squishRef = useRef({ active: false, t: 0 })
  const materialsRef = useRef([])

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true)
    materialsRef.current = []
    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone()
        child.material.emissive = new THREE.Color(color)
        child.material.emissiveIntensity = 0.4
        child.material.needsUpdate = true
        materialsRef.current.push(child.material)
      }
    })
    return clone
  }, [scene, color])

  useEffect(() => {
  clonedScene.traverse((child) => {
    if (child.isMesh) {
      child.frustumCulled = false
      if (!child.material.isMeshStandardMaterial) {
        const old = child.material
        child.material = new THREE.MeshStandardMaterial({
          color: old.color ?? new THREE.Color(color),
          transparent: true,
          opacity: old.opacity ?? 1,
          depthWrite: false, 
        })
      }
      child.material.emissive = new THREE.Color(color)
      child.material.emissiveIntensity = 0.6
      child.material.depthWrite = false 
      child.material.needsUpdate = true
      materialsRef.current.push(child.material)
    }
  })
}, [clonedScene, color])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    groupRef.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * speed + phase) * 0.3

    currentRotY.current += 0.004
    groupRef.current.rotation.y = currentRotY.current

    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4 + phase) * 0.05

    if (squishRef.current.active) {
      squishRef.current.t += delta * 8
      const t = squishRef.current.t
      const squish = 1 - Math.sin(t) * 0.4 * Math.exp(-t * 0.8)
      groupRef.current.scale.y = squish * scale
      if (t > Math.PI) {
        squishRef.current.active = false
        squishRef.current.t = 0
        groupRef.current.scale.y = scale
      }
    }

    glowIntensity.current += (targetGlow.current - glowIntensity.current) * 0.08
    materialsRef.current.forEach(mat => {
      mat.emissiveIntensity = glowIntensity.current
    })
  })

  const handlePointerEnter = (e) => {
    e.stopPropagation()
    targetGlow.current = 1.5
    document.body.style.cursor = 'pointer'
  }

  const handlePointerLeave = () => {
    targetGlow.current = 0.4
    document.body.style.cursor = 'default'
  }

  const handleClick = (e) => {
    e.stopPropagation()
    squishRef.current.active = true
    squishRef.current.t = 0
  }

  return (
    <group
      ref={groupRef}
      position={position}
      scale={[scale, scale, scale]}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      <primitive object={clonedScene} />
    </group>
  )
}

useGLTF.preload('/models/jellyfish3.glb')

// -- ABOUT -----------------------------
function AboutZone({ y, mobile }) {
  const group = useRef()
  const bubbleRefs = useRef([])

  const bubbles = [
    { pos: [-2.8, 0.4, 0.2], size: 0.5 },
    { pos: [2.6, 0.6, -0.3], size: 0.4 },
    { pos: [-1.8, -1.0, 0.5], size: 0.3 },
    { pos: [2.0, -0.9, 0.4], size: 0.35 },
    { pos: [0.8, 1.0, -0.5], size: 0.22 },
    { pos: [-0.6, -1.6, 0.3], size: 0.18 },
  ]

  useFrame((state) => {
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1

    bubbleRefs.current.forEach((ref, i) => {
      if (!ref) return
      ref.position.y = bubbles[i].pos[1] + Math.sin(state.clock.elapsedTime * 0.5 + i * 1.1) * 0.15
      ref.position.x = bubbles[i].pos[0] + Math.sin(state.clock.elapsedTime * 0.3 + i * 0.8) * 0.05
    })
  })

  return (
    <group ref={group} position={[0, y, 0]}>
      <Jellyfish position={[4.0, 3.0, -0.5]} scale={0.4} phase={0} speed={0.6} color={C.purple} />
      <Jellyfish position={[-4.0, -1.5, -1.0]} scale={0.4} phase={1.5} speed={0.5} color={C.lightpurple} />
      <Jellyfish position={[3.0, -4.5, -1.5]} scale={0.4} phase={1.5} speed={0.5} color={C.pink} />
      <Html center position={[0, mobile ? 2.8 : 2.2, 0]} transform={false}>
        <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
          <h2 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: mobile ? '1.5rem' : '2.2rem',
            color: C.lightpink, margin: 0, letterSpacing: '0.15em',
          }}>
            About Me
          </h2>
          <p style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: mobile ? '0.9rem' : '1.5rem',
            color: C.lightpink, margin: '0.8rem 0 0', opacity: 0.7, letterSpacing: '0.08em',
          }}>
            Hi I'm Angela! Welcome to my website :)
          </p>
          <p style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: mobile ? '0.8rem' : '1.5rem',
            color: C.lightpink, margin: '0.7rem 0 0', opacity: 0.7,
            whiteSpace: 'normal',
            width: mobile ? '78vw' : '62vw',
            lineHeight: 1.6,
          }}>
            I'm pursuing a B.S. in Computer Science at the University of Washington, and
            I love building things at the intersection of code and creativity. When I'm not
            coding, I'm probably drawing, crocheting little whales, or playing tennis.
          </p>
        </div>
      </Html>

      <Html center position={[0, -0.3, 0]} transform={false}>
        <div style={{
          width: mobile ? '40vw' : '22vw',
          height: mobile ? '40vw' : '22vw',
          borderRadius: '50%',
          overflow: 'hidden',
          border: `2px solid ${C.lightpink}66`,
          pointerEvents: 'none',
        }}>
          <img src="/me.jpg" alt="Angela" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </Html>

      {bubbles.map((b, i) => (
        <group
          key={i}
          ref={el => bubbleRefs.current[i] = el}
          position={b.pos}
        >
          <mesh>
            <sphereGeometry args={[b.size, 32, 32]} />
            <meshStandardMaterial
              color={C.lightpink}
              emissive={C.lightpink}
              emissiveIntensity={0.3}
              transparent
              opacity={0.06}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          <mesh>
            <sphereGeometry args={[b.size, 16, 16]} />
            <meshStandardMaterial
              color={C.light}
              emissive={C.light}
              emissiveIntensity={0.8}
              wireframe
              transparent
              opacity={0.35}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// -- PROJECTS -----------------------------
const PROJECTS = [
  { title: 'UW Pawprint', desc: 'Course + housing reviews for UW students.', url: 'https://uw-pawprint.vercel.app/', img: '/projects/pawprint.png', bubble: '/projects/bubble1.png', tags: ['React', 'Next.js', 'Supabase', 'Python'] },
  { title: 'CSEED Buildspace', desc: 'Club showcase site as Design Engineer.', url: 'https://cseed-buildspace.vercel.app/', img: '/projects/buildspace.png', bubble: '/projects/bubble2.png', tags: ['React', 'Next.js', 'TailwindCSS'] },
  { title: 'Tangierine', desc: 'E-commerce site for my artwork.', url: 'https://tangierine.vercel.app', img: '/projects/tangierine.png', bubble: '/projects/bubble3.png', tags: ['React', 'Next.js', 'Stripe', 'Supabase'] },
  { title: 'Paint-A-Hike', desc: 'Draw a sketch, find your real hike.', url: 'https://github.com/angela-yang/Dubhacks-25', img: '/projects/paint.png', bubble: '/projects/bubble4.png', tags: ['Next.js', 'Python', 'TailwindCSS'] },
  { title: 'Air Quality Health', desc: 'Track air quality + personalized health tips.', url: 'https://devpost.com/software/air-quality-health', img: '/projects/aqi.png', bubble: '/projects/bubble5.png', tags: ['HTML', 'CSS', 'JavaScript'] },
  { title: 'Bear Go Brr', desc: 'Adopt a polar bear, reduce your carbon footprint.', url: 'https://github.com/angela-yang/Penguins', img: '/projects/bear.png', bubble: '/projects/bubble6.png', tags: ['HTML', 'CSS', 'JavaScript', 'Python'] },
  { title: 'Crane Game', desc: 'Find ten paper cranes in the dark.', url: 'https://angela-yang.github.io/crane-game/', img: '/projects/crane.png', bubble: '/projects/bubble7.png', tags: ['p5.js', 'HTML', 'CSS'] },
]

const BUBBLE_CONFIGS_DESKTOP = [
  { x: -1.5, y: 0.5, z: 2.0, size: 120 },
  { x: 1.2, y: 0.8, z: 2.6, size: 115 },
  { x: -0.2, y: -0.3, z: 2.5, size: 125 },
  { x: 0.6, y: 0.6, z: 1.5, size: 100 },
  { x: -1.6, y: -0.7, z: 2.0, size: 95 },
  { x: 1.5, y: -0.6, z: 2.0, size: 88 },
  { x: -0.5, y: 1.0, z: 1.0, size: 90 },
]

const BUBBLE_CONFIGS_MOBILE = [
  { x: -0.6, y: 0.5, z: 2.5, size: 78 },
  { x: 0.7, y: 0.8, z: 2.8, size: 75 },
  { x: 0.0, y: -0.2, z: 2.6, size: 82 },
  { x: 0.5, y: 0.5, z: 2.0, size: 66 },
  { x: -0.8, y: -0.6, z: 2.2, size: 62 },
  { x: 0.9, y: -0.5, z: 2.1, size: 60 },
  { x: -0.3, y: 0.9, z: 1.6, size: 58 },
]

function ProjectBubble({ cfg, index, project, isActive, onClick, mobile }) {
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

  const handleClick = () => { setExpanded(true);  onClick(index) }
  const handleClose = () => { setExpanded(false); onClick(null)  }

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
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <img src={project.bubble} alt={project.title}
              style={{ width: '80%', aspectRatio: '1', objectFit: 'cover', display: 'block', margin: '0 auto' }} />
            <div style={{
              marginTop: '7px',
              fontFamily: 'Nunito, sans-serif',
              fontSize: `${Math.max(9, SIZE * 0.12)}px`,
              color, letterSpacing: '0.06em', whiteSpace: 'nowrap',
            }}>
              {project.title}
            </div>
          </div>
        </Html>
      </group>

      {expanded && (
        <group position={[0, 0, 2.8]}>
          <Html>
            <div onClick={handleClose} style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 9999, pointerEvents: 'all' }} />

            <div style={{
              position: 'fixed', top: '50%', left: '50%',
              zIndex: 10000, pointerEvents: 'all',
              animation: 'bubbleDropFlip 0.55s cubic-bezier(0.34, 1.2, 0.64, 1) forwards',
            }}>
              <div style={{
                width: mobile ? 'min(88vw, 380px)' : '45vw',
                height: mobile ? 'min(88vw, 380px)' : '45vw',
                borderRadius: mobile ? '2rem' : '50%',
                background: C.purple,
                opacity: 0.97,
                border: '5px solid rgba(255,255,255,0.3)',
                boxShadow: `0 0 80px ${color}44, inset 0 0 60px ${color}11`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: mobile ? '1.4rem' : '3rem',
                boxSizing: 'border-box', textAlign: 'center', overflow: 'hidden',
              }}>
                <img src={project.img} alt={project.title}
                  style={{ 
                    width: '75%', 
                    aspectRatio: '16/9', 
                    objectFit: 'cover', 
                    borderRadius: '5px', 
                    border: `1px solid ${color}66`, 
                    marginBottom: '0.5rem', 
                    flexShrink: 0 
                  }} 
                />

                <h3 style={{ 
                  fontFamily: 'Cinzel, serif', 
                  color: 'white', 
                  fontSize: mobile ? '1.05rem' : '1.8rem', 
                  letterSpacing: '0.1em', 
                  margin: '0 0 0.2rem' 
                }}>
                  {project.title}
                </h3>

                <p style={{ 
                  fontFamily: 'Nunito, sans-serif', 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: mobile ? '0.78rem' : '1.2rem', 
                  lineHeight: 1.5, 
                  margin: '0 0 0.4rem' 
                }}>
                  {project.desc}
                </p>

                {project.tags && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    {project.tags.map(tag => (
                      <span key={tag} style={{ 
                        fontFamily: 'Nunito, sans-serif', 
                        fontSize: mobile ? '0.68rem' : '1.2rem', 
                        color: 'rgba(255,255,255,0.6)', 
                        background: '#ffffff2a', 
                        border: '1px solid #ffffff6a', 
                        borderRadius: '999px', 
                        padding: '2px 7px' 
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <a href={project.url} target="_blank" rel="noreferrer"
                  style={{ 
                    color: 'white', 
                    fontSize: mobile ? '0.78rem' : '1.2rem', 
                    border: `1px solid ${color}99`, 
                    padding: '0.25rem 0.9rem', 
                    borderRadius: '999px', 
                    textDecoration: 'none', 
                    fontFamily: 'Nunito, sans-serif', 
                    background: `${color}33` 
                  }}
                >
                  View Project →
                </a>

                <button onClick={handleClose}
                  style={{ 
                    position: 'absolute', 
                    top: mobile ? '12px' : '78px', 
                    right: mobile ? '12px' : '78px', 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    background: 'rgba(255,255,255,0.15)', 
                    border: '1px solid rgba(255,255,255,0.4)', 
                    color: 'white', 
                    fontSize: '0.9rem', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                  ✕
                </button>
              </div>
            </div>

            <style>{`
              @keyframes bubbleDropFlip {
                0% { transform: translate(-50%, -140%) scale(0.4) rotateY(90deg); opacity: 0; }
                60% { transform: translate(-50%, -50%) scale(1.05) rotateY(0deg); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1) rotateY(0deg); opacity: 1; }
              }
            `}</style>
          </Html>
        </group>
      )}
    </>
  )
}

function ProjectsZone({ y, activeProject, onProjectClick, mobile }) {
  const configs = mobile ? BUBBLE_CONFIGS_MOBILE : BUBBLE_CONFIGS_DESKTOP
  return (
    <group position={[0, y, 0]}>
      <Html center position={[0, 2.5, 0]}>
        <div style={{ textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <h2 style={{ 
            fontFamily: 'Cinzel, serif', 
            fontSize: mobile ? '1.5rem' : '2.2rem', 
            color: C.pink, 
            margin: 0, 
            letterSpacing: '0.15em' 
          }}>
            Projects
          </h2>
          <p style={{ 
            fontFamily: 'Nunito, sans-serif', 
            fontSize: mobile ? '0.9rem' : '1.5rem', 
            color: C.pink, margin: '1.0rem 0 0', 
            opacity: 0.7, 
            letterSpacing: '0.1em' 
          }}>
            tap a bubble to explore
          </p>
        </div>
      </Html>
      {PROJECTS.map((project, i) => (
        <ProjectBubble key={i} cfg={configs[i]} index={i} project={project} isActive={activeProject === i} onClick={onProjectClick} mobile={mobile} />
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

const FRAME_CONFIGS_DESKTOP = [
  { pos: [-2.2, 0.3, 0.0], rot: [0.1, 0.3, 0.05] },
  { pos: [0.0, 0.0, 0.5], rot: [0.0, 0.0, 0.00] },
  { pos: [2.2, 0.3, -0.2], rot: [0.1, -0.3, 0.05] },
  { pos: [-1.0, -1.2, 0.3], rot: [0.2, 0.1, 0.08] },
  { pos: [1.2, -1.1, -0.1], rot: [0.1, -0.1, 0.06] },
]

const FRAME_CONFIGS_MOBILE = [
  { pos: [-0.9, 0.3, 0.2], rot: [0.05, 0.18, 0.03] },
  { pos: [0.0, 0.0, 0.5], rot: [0.0, 0.0, 0.0 ] },
  { pos: [0.9, 0.3, -0.1], rot: [0.05, -0.18, 0.03] },
  { pos: [-0.5, -1.0, 0.2], rot: [0.1, 0.1, 0.05] },
  { pos: [0.6, -0.9, 0.0], rot: [0.05, -0.1, 0.04] },
]

function ArtFrame({ index, totalCount, artwork, floatConfig, isGallery, activeIndex, onFrameClick }) {
  const meshRef = useRef()
  const texture = useTexture(artwork.img)

  const getGalleryTransform = (i) => {
    const ANGLE_STEP = (2 * Math.PI) / totalCount
    let d = ((i - activeIndex) % totalCount + totalCount) % totalCount
    if (d > totalCount / 2) d -= totalCount
    const angle = d * ANGLE_STEP
    return { x: 0, y: 0, z: 3.5 * Math.cos(angle) - 0.9, rotY: -angle }
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
      meshRef.current.position.y += (t.y - meshRef.current.position.y)  * 0.08
      meshRef.current.position.z += (t.z - meshRef.current.position.z)  * 0.08
      meshRef.current.rotation.y += (t.rotY - meshRef.current.rotation.y)  * 0.08
      meshRef.current.rotation.x += (0 - meshRef.current.rotation.x)  * 0.08
      meshRef.current.rotation.z += (0 - meshRef.current.rotation.z)  * 0.08
    }
  })

  return (
    <mesh ref={meshRef} position={floatConfig.pos} rotation={floatConfig.rot}
      onClick={() => onFrameClick(index)}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}>
      <planeGeometry args={[1.1, 1.1 / 0.8]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  )
}

function ArtZone({ y, mobile }) {
  const [galleryMode, setGalleryMode] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const { camera } = useThree()
  const targetCamZ = useRef(5)

  useEffect(() => {
    const onKey = (e) => {
      if (!galleryMode) return
      if (e.key === 'ArrowLeft')  setActiveIndex(i => (i - 1 + ARTWORKS.length) % ARTWORKS.length)
      if (e.key === 'ArrowRight') setActiveIndex(i => (i + 1) % ARTWORKS.length)
      if (e.key === 'Escape')     exitGallery()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [galleryMode])

  useFrame(() => { camera.position.z += (targetCamZ.current - camera.position.z) * 0.05 })

  const enterGallery = (i) => { setActiveIndex(i); setGalleryMode(true);  targetCamZ.current = 6 }
  const exitGallery  = ()  => { setGalleryMode(false); targetCamZ.current = 5 }
  const prev = () => setActiveIndex(i => (i - 1 + ARTWORKS.length) % ARTWORKS.length)
  const next = () => setActiveIndex(i => (i + 1) % ARTWORKS.length)

  const frameConfigs = mobile ? FRAME_CONFIGS_MOBILE : FRAME_CONFIGS_DESKTOP

  const btnStyle = {
    background: 'none', border: `1px solid ${C.lightpurple}88`, color: C.lightpurple,
    borderRadius: '50%', width: mobile ? '36px' : '44px', height: mobile ? '36px' : '44px',
    fontSize: mobile ? '1.1rem' : '1.4rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    WebkitTapHighlightColor: 'transparent',
  }

  return (
    <group position={[0, y, 0]}>
      <Html center position={[0, 2.2, 0]}>
        <div style={{ textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: mobile ? '1.5rem' : '2.2rem', color: C.lightpurple, margin: 0, letterSpacing: '0.15em' }}>Art Gallery</h2>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: mobile ? '0.9rem' : '1.5rem', color: C.lightpurple, margin: '1.0rem 0 1.0rem', opacity: 0.7, letterSpacing: '0.1em' }}>
            {galleryMode ? 'use arrows to explore' : 'tap a painting to view'}
          </p>
        </div>
      </Html>

      {ARTWORKS.map((artwork, i) => (
        <ArtFrame key={i} index={i} totalCount={ARTWORKS.length} artwork={artwork}
          floatConfig={frameConfigs[i % frameConfigs.length]}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontFamily: 'Nunito, sans-serif', pointerEvents: 'all' }}>
              <button onClick={prev} style={btnStyle}>‹</button>
              <div style={{ textAlign: 'center', minWidth: mobile ? '44vw' : '30vw' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: mobile ? '1rem' : '1.5rem', color: C.light, letterSpacing: '0.1em', marginBottom: '4px' }}>{ARTWORKS[activeIndex].title}</div>
                <div style={{ fontSize: mobile ? '0.8rem' : '1.2rem', color: C.lightpurple, opacity: 0.7 }}>{ARTWORKS[activeIndex].desc}</div>
                <div style={{ marginTop: '6px', fontSize: mobile ? '0.75rem' : '1.0rem', color: C.lightpurple, opacity: 0.5 }}>{activeIndex + 1} / {ARTWORKS.length}</div>
              </div>
              <button onClick={next} style={btnStyle}>›</button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
              <button onClick={exitGallery} style={{ background: 'none', border: 'none', color: C.lightpurple, opacity: 0.5, fontSize: mobile ? '0.8rem' : '1.0rem', cursor: 'pointer', letterSpacing: '0.1em', fontFamily: 'Nunito, sans-serif' }}>✕ close gallery</button>
            </div>
          </Html>
          <Html center position={[0, -3.2, 0]}>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', pointerEvents: 'all' }}>
              {ARTWORKS.map((_, i) => (
                <div key={i} onClick={() => setActiveIndex(i)} style={{ width: i === activeIndex ? '20px' : '8px', height: '8px', borderRadius: '4px', background: i === activeIndex ? C.lightpurple : `${C.lightpurple}44`, cursor: 'pointer', transition: 'all 0.3s ease' }} />
              ))}
            </div>
          </Html>
        </>
      )}
    </group>
  )
}

// -- CONTACT -----------------------------
function ContactZone({ y, mobile }) {
  const rings = useRef([])

  useFrame(() => {
    rings.current.forEach((ring, i) => {
      if (!ring) return
      ring.rotation.z += 0.003 * (i % 2 === 0 ? 1 : -1)
      ring.rotation.x += 0.002
    })
  })

  const links = [
    { icon: <FaLinkedin size={mobile ? 22 : 28} />, label: 'LinkedIn', href: 'https://linkedin.com/in/angelaxy', color: C.lightpurple },
    { icon: <FaGithub size={mobile ? 22 : 28} />, label: 'GitHub', href: 'https://github.com/angela-yang', color: C.light },
    { icon: <IoMdMail size={mobile ? 22 : 28} />, label: 'Email', href: 'mailto:angelay2@uw.edu', color: C.lightpink },
    { icon: <IoDocumentSharp size={mobile ? 22 : 28} />, label: 'Resume',   href: '/resume.pdf', color: C.pink },
  ]

  return (
    <group position={[0, y, 0]}>
      <Html center position={[0, 2.2, 0]}>
        <div style={{ textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <h2 style={{ 
            fontFamily: 'Cinzel, serif', 
            fontSize: mobile ? '1.5rem' : '2.2rem', 
            color: C.purple, margin: 0, 
            letterSpacing: '0.15em' 
          }}>
            Contact
          </h2>
          <p style={{ 
            fontFamily: 'Nunito, sans-serif', 
            fontSize: mobile ? '0.9rem' : '1.2rem', 
            color: C.purple, margin: '0.8rem 0 0', 
            opacity: 0.7, 
            letterSpacing: '0.1em' 
          }}>
            let's build something together
          </p>
        </div>
      </Html>

      <Html center position={[0, 0, 0]}>
        <div style={{ display: 'flex', gap: mobile ? '1.2rem' : '2rem', alignItems: 'center', pointerEvents: 'all', flexWrap: 'wrap', justifyContent: 'center', maxWidth: mobile ? '72vw' : 'none' }}>
          {links.map((link) => (
            <a key={link.label} href={link.href}
              target={link.href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer"
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '6px', color: link.color, 
                textDecoration: 'none', 
                transition: 'transform 0.2s, opacity 0.2s', 
                opacity: 0.8, 
                WebkitTapHighlightColor: 'transparent' 
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.1)'; e.currentTarget.style.opacity = '1' }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.opacity = '0.8' }}
              onTouchStart={e => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.opacity = '1' }}
              onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '0.8' }}>
              {link.icon}
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: mobile ? '0.6rem' : '0.72rem', letterSpacing: '0.1em', color: link.color }}>{link.label.toUpperCase()}</span>
            </a>
          ))}
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

export default function World({ targetDepth, onDepthChange, activeProject, onProjectClick, mobile }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 5]} intensity={1.5} color={C.light} />
      <pointLight position={[0, -10, 5]} intensity={1.0} color={C.lightpink} />
      <pointLight position={[0, -20, 5]} intensity={1.0} color={C.pink} />
      <pointLight position={[0, -30, 5]} intensity={0.8} color={C.lightpurple} />
      <pointLight position={[0, -40, 5]} intensity={0.8} color={C.purple} />

      <Particles />
      <CameraRig targetDepth={targetDepth} onDepthChange={onDepthChange} />

      <AboutZone y={-10.7} mobile={mobile} />
      <ProjectsZone y={-20.5} activeProject={activeProject} onProjectClick={onProjectClick} mobile={mobile} />
      <ArtZone y={-30.5} mobile={mobile} />
      <ContactZone  y={-40.5} mobile={mobile} />
    </>
  )
}