import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
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
    camera.position.y += (targetDepth - camera.position.y) * 0.08 
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
    { pos: [-2.6, 0.4, 0.2], size: 0.5 },
    { pos: [2.6, 0.6, -0.3], size: 0.4 },
    { pos: [-1.8, -1.0, 0.5], size: 0.3 },
    { pos: [2.0, -0.9, 0.4], size: 0.35 },
    { pos: [0.8, 0.8, -0.5], size: 0.22 },
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
      <Jellyfish position={[4.0, 3.0, -0.5]} scale={0.4} phase={0} speed={0.6} color={C.pink} />
      <Jellyfish position={[-4.0, -1.5, -1.0]} scale={0.4} phase={1.5} speed={0.5} color={C.lightpurple} />
      <Jellyfish position={[3.0, -4.5, -1.5]} scale={0.4} phase={1.5} speed={0.5} color={C.lightpink} />
      <Html center position={[0, mobile ? 2.8 : 2.2, 0]} transform={false}>
        <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
          <h2 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: mobile ? '2.0rem' : '2.2rem',
            color: C.lightpink, margin: 0, letterSpacing: '0.15em',
          }}>
            About Me
          </h2>
          <p style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: mobile ? '1.2rem' : '1.5rem',
            color: C.lightpink, margin: '0.8rem 0 0', opacity: 0.85, letterSpacing: '0.08em',
          }}>
            Hi I'm Angela! Welcome to my website :)
          </p>
          <p style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: mobile ? '1.2rem' : '1.5rem',
            color: C.lightpink, margin: '0.7rem 0 0', opacity: 0.85,
            whiteSpace: 'normal',
            width: mobile ? '78vw' : '50vw',
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
          width: mobile ? '65vw' : '22vw',
          height: mobile ? '65vw' : '22vw',
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
  { x: -1.8, y: 0.5, z: 2.0, size: 220 },
  { x: 1.5, y: 0.8, z: 2.6, size: 215 },
  { x: -0.2, y: -0.5, z: 2.5, size: 210 },
  { x: 0.6, y: 0.6, z: 1.5, size: 180 },
  { x: -1.6, y: -0.7, z: 2.0, size: 165 },
  { x: 1.5, y: -0.8, z: 2.0, size: 158 },
  { x: -0.9, y: 1.0, z: 1.0, size: 140 },
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

function ProjectBubble({ cfg, index, project, onClick }) {
  const bobRef = useRef()
  const colors = [C.lightpink, C.pink, C.lightpurple, C.purple, C.light, C.lightpink, C.pink]
  const color  = colors[index % colors.length]
 
  useFrame((state) => {
    if (!bobRef.current) return
    bobRef.current.position.y = cfg.y + Math.sin(state.clock.elapsedTime * 0.45 + index * 1.1) * 0.12
  })
 
  return (
    <group ref={bobRef} position={[cfg.x, cfg.y, cfg.z]}>
      <Html center occlude={false}>
        <div
          onClick={() => onClick(index)}
          style={{ 
            cursor:'pointer', 
            userSelect:'none', 
            textAlign:'center', 
            width:`${cfg.size}px`, 
            WebkitTapHighlightColor:'transparent', 
            transition:'transform 0.2s' 
          }}
          onMouseEnter={e => e.currentTarget.style.transform='scale(1.06)'}
          onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
        >
          <img src={project.bubble} alt={project.title}
            style={{ 
              width:'80%', 
              aspectRatio:'1', 
              objectFit:'cover', 
              display:'block', 
              margin:'0 auto', 
              pointerEvents:'none' 
            }} 
          />
          <div style={{ 
            marginTop:'7px', 
            fontFamily:'Nunito, sans-serif', 
            fontSize:`${Math.max(9, cfg.size * 0.12)}px`, 
            color, letterSpacing:'0.06em', 
            whiteSpace:'nowrap' 
          }}>
            {project.title}
          </div>
        </div>
      </Html>
    </group>
  )
}

function ProjectsZone({ y, onProjectClick, mobile }) {
  const configs = mobile ? BUBBLE_CONFIGS_MOBILE : BUBBLE_CONFIGS_DESKTOP
  return (
    <group position={[0, y, 0]}>
      <Html center position={[0, 2.5, 0]}>
        <div style={{ textAlign: 'center', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <h2 style={{ 
            fontFamily: 'Cinzel, serif', 
            fontSize: mobile ? '2.0rem' : '2.2rem', 
            color: C.pink, 
            margin: 0, 
            letterSpacing: '0.15em' 
          }}>
            Projects
          </h2>
          <p style={{ 
            fontFamily: 'Nunito, sans-serif', 
            fontSize: mobile ? '1.2rem' : '1.5rem', 
            color: C.pink, margin: '1rem 0 0', opacity: 0.7, 
            letterSpacing: '0.1em' 
          }}>
            tap a bubble to explore
          </p>
        </div>
      </Html>
      {PROJECTS.map((project, i) => (
        <ProjectBubble key={i} cfg={configs[i]} index={i} project={project} onClick={onProjectClick} mobile={mobile} />
      ))}
    </group>
  )
}

// -- Art -------------------------------------
const ARTWORKS = [
  { title: 'Nostalgia', img: '/art/piece1.jpg', desc: 'Colored Pencil' },
  { title: 'Memory Project', img: '/art/piece2.jpg', desc: 'Colored Pencil' },
  { title: 'Parental Love', img: '/art/piece3.jpg', desc: 'Crayon' },
  { title: 'Love', img: '/art/piece4.jpg', desc: 'Marker' },
  { title: 'Fairytale Love', img: '/art/piece5.jpg', desc: 'Charcoal' },
]

function ArtZone({ y, mobile, onFilmstripFocus }) {
  const { camera } = useThree()
  const targetCamZ = useRef(6) 
  const [active, setActive] = useState(0)
  const stripRef = useRef(null)
  const dragStart = useRef(null)
  const dragScroll = useRef(0)
  const isDragging = useRef(false)
 
  useFrame(() => {
    camera.position.z += (targetCamZ.current - camera.position.z) * 0.05
  })
 
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  setActive(i => Math.max(0, i-1))
      if (e.key === 'ArrowRight') setActive(i => Math.min(ARTWORKS.length-1, i+1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
 
  useEffect(() => {
    if (!stripRef.current) return
    const strip = stripRef.current
    const card  = strip.children[active]
    if (!card) return
    strip.scrollTo({ left: card.offsetLeft - strip.offsetWidth/2 + card.offsetWidth/2, behavior: 'smooth' })
  }, [active])
 
  const CARD_W = mobile ? '72vw' : '320px'
 
  return (
    <group position={[0, y, 0]}>
      <Html center position={[0, 2.2, 0]}>
        <div style={{ textAlign:'center', pointerEvents:'none', whiteSpace:'nowrap' }}>
          <h2 style={{ fontFamily:'Cinzel, serif', fontSize:mobile?'1.5rem':'2.2rem', color:C.lightpurple, margin:0, letterSpacing:'0.15em' }}>Art Gallery</h2>
          <p style={{ fontFamily:'Nunito, sans-serif', fontSize:mobile?'0.9rem':'1.5rem', color:C.lightpurple, margin:'1rem 0 0', opacity:0.7, letterSpacing:'0.1em' }}>
            drag to browse · click to focus
          </p>
        </div>
      </Html>
 
      <Html center position={[0, -0.5, 0]} transform={false}>
        <div style={{ width:'100vw', pointerEvents:'all' }}>
          <style>{`
            .art-strip {
              display: flex;
              gap: ${mobile ? '14px' : '20px'};
              overflow-x: scroll;
              scroll-snap-type: x mandatory;
              padding: ${mobile ? '10px 24px 10px' : '14px 48px 14px'};
              scrollbar-width: none;
              -ms-overflow-style: none;
              cursor: grab;
              user-select: none;
            }
            .art-strip::-webkit-scrollbar { display: none; }
            .art-strip.dragging { cursor: grabbing; }
            .art-card {
              flex-shrink: 0;
              width: ${CARD_W};
              scroll-snap-align: center;
              border-radius: 10px;
              overflow: hidden;
              border: 1px solid rgba(120,121,170,0.15);
              background: rgba(12,8,24,0.7);
              transition: transform 0.35s cubic-bezier(0.22,1,0.36,1),
                          opacity  0.35s ease,
                          border-color 0.35s ease,
                          box-shadow 0.35s ease;
            }
            .art-card.active {
              border-color: rgba(120,121,170,0.5);
              box-shadow: 0 0 40px rgba(120,121,170,0.18);
              transform: scale(1.04);
              opacity: 1;
            }
            .art-card:not(.active) {
              transform: scale(0.92);
              opacity: 0.45;
            }
            .art-card img {
              width: 100%;
              aspect-ratio: 3/4;
              object-fit: cover;
              display: block;
              pointer-events: none;
            }
            .art-card-info {
              padding: ${mobile ? '9px 12px 11px' : '11px 16px 14px'};
            }
            .art-card-title {
              font-family: Cinzel, serif;
              font-size: ${mobile ? '0.82rem' : '0.95rem'};
              color: #e3ddee;
              letter-spacing: 0.08em;
              margin: 0 0 2px;
            }
            .art-card-desc {
              font-family: Nunito, sans-serif;
              font-size: ${mobile ? '0.7rem' : '0.78rem'};
              color: rgba(120,121,170,0.65);
              letter-spacing: 0.04em;
            }
          `}</style>
 
          <div
            ref={stripRef}
            className="art-strip"
            onMouseEnter={() => onFilmstripFocus(true)}
            onMouseLeave={() => {
              onFilmstripFocus(false)
              if (isDragging.current) {
                isDragging.current = false
                dragStart.current  = null
                stripRef.current?.classList.remove('dragging')
              }
            }}
            onMouseDown={e => {
              isDragging.current = true
              dragStart.current  = e.clientX
              dragScroll.current = stripRef.current.scrollLeft
              stripRef.current.classList.add('dragging')
            }}
            onMouseMove={e => {
              if (!isDragging.current) return
              stripRef.current.scrollLeft = dragScroll.current - (e.clientX - dragStart.current)
            }}
            onMouseUp={e => {
              if (!isDragging.current) return
              const dx = e.clientX - dragStart.current
              if (Math.abs(dx) > 30) dx < 0 ? setActive(i => Math.min(ARTWORKS.length-1,i+1)) : setActive(i => Math.max(0,i-1))
              isDragging.current = false
              dragStart.current  = null
              stripRef.current?.classList.remove('dragging')
            }}
            onTouchStart={e => {
              dragStart.current  = e.touches[0].clientX
              dragScroll.current = stripRef.current.scrollLeft
            }}
            onTouchMove={e => {
              const dx = e.touches[0].clientX - dragStart.current
              onFilmstripFocus(Math.abs(dx) > 12)
            }}
            onTouchEnd={e => {
              onFilmstripFocus(false)
              dragStart.current = null
            }}
            onScroll={() => {
              if (!stripRef.current) return
              const strip  = stripRef.current
              const center = strip.scrollLeft + strip.offsetWidth/2
              let closest  = 0, minDist = Infinity
              Array.from(strip.children).forEach((card, i) => {
                const dist = Math.abs(card.offsetLeft + card.offsetWidth/2 - center)
                if (dist < minDist) { minDist = dist; closest = i }
              })
              setActive(closest)
            }}
          >
            {ARTWORKS.map((art, i) => (
              <div
                key={i}
                className={`art-card${i===active?' active':''}`}
                onClick={() => setActive(i)}
              >
                <img src={art.img} alt={art.title} draggable={false} />
                <div className="art-card-info">
                  <div className="art-card-title">{art.title}</div>
                  <div className="art-card-desc">{art.desc}</div>
                </div>
              </div>
            ))}
          </div>
 
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'1rem', marginTop:'10px' }}>
            <button
              onClick={() => setActive(i => Math.max(0,i-1))}
              disabled={active===0}
              style={{ background:'none', border:`1px solid ${C.lightpurple}55`, color:C.lightpurple, borderRadius:'50%', width:mobile?'30px':'36px', height:mobile?'30px':'36px', fontSize:'1rem', cursor:active===0?'default':'pointer', opacity:active===0?0.25:0.8, display:'flex', alignItems:'center', justifyContent:'center', transition:'opacity 0.2s', WebkitTapHighlightColor:'transparent' }}
            >‹</button>
 
            <div style={{ display:'flex', gap:'5px' }}>
              {ARTWORKS.map((_,i) => (
                <div key={i} onClick={() => setActive(i)}
                  style={{ width:i===active?'16px':'5px', height:'5px', borderRadius:'3px', background:i===active?C.lightpurple:`${C.lightpurple}33`, cursor:'pointer', transition:'all 0.3s ease' }} />
              ))}
            </div>
 
            <button
              onClick={() => setActive(i => Math.min(ARTWORKS.length-1,i+1))}
              disabled={active===ARTWORKS.length-1}
              style={{ background:'none', border:`1px solid ${C.lightpurple}55`, color:C.lightpurple, borderRadius:'50%', width:mobile?'30px':'36px', height:mobile?'30px':'36px', fontSize:'1rem', cursor:active===ARTWORKS.length-1?'default':'pointer', opacity:active===ARTWORKS.length-1?0.25:0.8, display:'flex', alignItems:'center', justifyContent:'center', transition:'opacity 0.2s', WebkitTapHighlightColor:'transparent' }}
            >›</button>
          </div>
        </div>
      </Html>
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

export default function World({ targetDepth, onDepthChange, activeProject, onProjectClick, onFilmstripFocus, mobile }) {
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
      <ProjectsZone y={-20.5} onProjectClick={onProjectClick} mobile={mobile} />
      <ArtZone y={-30.5} mobile={mobile} onFilmstripFocus={onFilmstripFocus} />
      <ContactZone y={-40.5} mobile={mobile} />
    </>
  )
}