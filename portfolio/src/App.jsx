import { useState, useCallback, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import World, { ZONES } from './experience/World'
import HUD from './components/HUD'

const ZONE_DEPTHS = [0, -10, -20, -27, -34, -40]

const PROJECTS = [
  { title: 'UW Pawprint', desc: 'Course + housing reviews for UW students.', url: 'https://uw-pawprint.vercel.app/', img: '/projects/pawprint.png', bubble: '/projects/bubble1.png', tags: ['React', 'Next.js', 'Supabase', 'Python'] },
  { title: 'CSEED Buildspace', desc: 'Club showcase site as Design Engineer.', url: 'https://cseed-buildspace.vercel.app/', img: '/projects/buildspace.png', bubble: '/projects/bubble2.png', tags: ['React', 'Next.js', 'TailwindCSS'] },
  { title: 'Tangierine', desc: 'E-commerce site for my artwork.', url: 'https://tangierine.vercel.app', img: '/projects/tangierine.png', bubble: '/projects/bubble3.png', tags: ['React', 'Next.js', 'Stripe', 'Supabase'] },
  { title: 'Paint-A-Hike', desc: 'Draw a sketch, find your real hike.', url: 'https://github.com/angela-yang/Dubhacks-25', img: '/projects/paint.png', bubble: '/projects/bubble4.png', tags: ['Next.js', 'Python', 'TailwindCSS'] },
  { title: 'Air Quality Health', desc: 'Track air quality + personalized health tips.', url: 'https://devpost.com/software/air-quality-health', img: '/projects/aqi.png', bubble: '/projects/bubble5.png', tags: ['HTML', 'CSS', 'JavaScript'] },
  { title: 'Bear Go Brr', desc: 'Adopt a polar bear, reduce your carbon footprint.', url: 'https://github.com/angela-yang/Penguins', img: '/projects/bear.png', bubble: '/projects/bubble6.png', tags: ['HTML', 'CSS', 'JavaScript', 'Python'] },
  { title: 'Crane Game', desc: 'Find ten paper cranes in the dark.', url: 'https://angela-yang.github.io/crane-game/', img: '/projects/crane.png', bubble: '/projects/bubble7.png', tags: ['p5.js', 'HTML', 'CSS'] },
]

function lerpColor(a, b, t) {
  const ah = a.replace('#',''), bh = b.replace('#','')
  const ar = parseInt(ah.slice(0,2),16), ag = parseInt(ah.slice(2,4),16), ab = parseInt(ah.slice(4,6),16)
  const br = parseInt(bh.slice(0,2),16), bg = parseInt(bh.slice(2,4),16), bb = parseInt(bh.slice(4,6),16)
  return `rgb(${Math.round(ar+(br-ar)*t)},${Math.round(ag+(bg-ag)*t)},${Math.round(ab+(bb-ab)*t)})`
}

const isMobile = () => window.innerWidth < 768 || 'ontouchstart' in window

export default function App() {
  const [targetDepth, setTargetDepth] = useState(0)
  const [cameraY, setCameraY] = useState(0)
  const [activeProject, setActiveProject] = useState(null)
  const [mobile, setMobile] = useState(isMobile())

  const rawDepth = useRef(0)
  const isScrolling = useRef(false)
  const scrollTimer = useRef(null)
  const rafRef = useRef(null)
  const lockScroll = useRef(false)

  const activeProjectRef  = useRef(null)
  useEffect(() => { activeProjectRef.current = activeProject }, [activeProject])

  const modalOpenDepth = useRef(null)

  const handleDepthChange = useCallback((y) => setCameraY(y), [])

  useEffect(() => {
    const onResize = () => setMobile(isMobile())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const tick = () => {
      const nearest = ZONE_DEPTHS.reduce((a, b) =>
        Math.abs(b - rawDepth.current) < Math.abs(a - rawDepth.current) ? b : a
      )
      const dist = nearest - rawDepth.current
      const strength = isScrolling.current ? 0.001 : 0.007
      rawDepth.current += dist * strength
      setTargetDepth(rawDepth.current)

      if (modalOpenDepth.current !== null && activeProjectRef.current !== null) {
        if (Math.abs(rawDepth.current - modalOpenDepth.current) > 1.5) {
          setActiveProject(null)
          modalOpenDepth.current = null
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    const markScrolling = () => {
      isScrolling.current = true
      clearTimeout(scrollTimer.current)
      scrollTimer.current = setTimeout(() => { isScrolling.current = false }, 200)
    }

    const onWheel = (e) => {
      if (lockScroll.current) return
      markScrolling()
      rawDepth.current = Math.max(-40, Math.min(0, rawDepth.current - e.deltaY * 0.006))
    }

    let touchStartY = 0, touchStartX = 0, axisLocked = null

    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
      touchStartX = e.touches[0].clientX
      axisLocked  = null
      isScrolling.current = true
      clearTimeout(scrollTimer.current)
    }

    const onTouchMove = (e) => {
      if (lockScroll.current) return
      const dy = touchStartY - e.touches[0].clientY
      const dx = touchStartX - e.touches[0].clientX
      if (!axisLocked && (Math.abs(dx) > 8 || Math.abs(dy) > 8))
        axisLocked = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'
      if (axisLocked !== 'vertical') return
      markScrolling()
      touchStartY = e.touches[0].clientY
      rawDepth.current = Math.max(-40, Math.min(0, rawDepth.current - dy * 0.022))
    }

    const onTouchEnd = () => {
      scrollTimer.current = setTimeout(() => { isScrolling.current = false }, 200)
      axisLocked = null
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const handleProjectClick = (index) => {
    setActiveProject(index)
    modalOpenDepth.current = rawDepth.current
  }

  const t = Math.min(1, Math.abs(cameraY) / 32)
  const bgColor = lerpColor('#1f2f41', '#12141b', t)

  return (
    <div style={{
      width: '100vw', height: '100vh',
      position: 'relative',
      background: bgColor,
      overflow: 'hidden',
      transition: 'background 0.1s',
      touchAction: 'none',
    }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: mobile ? 75 : 60, near: 0.01, far: 1000 }}
        gl={{ antialias: true }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <World
          targetDepth={targetDepth}
          onDepthChange={handleDepthChange}
          activeProject={activeProject}
          onProjectClick={handleProjectClick}
          onFilmstripFocus={(active) => { lockScroll.current = active }}
          mobile={mobile}
        />
        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={0.6} luminanceSmoothing={0.9} mipmapBlur radius={0.8} />
        </EffectComposer>
      </Canvas>

      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <HUD
          zones={ZONES}
          cameraY={cameraY}
          onNavigate={(y) => { rawDepth.current = y; setTargetDepth(y) }}
          mobile={mobile}
        />
      </div>

      {activeProject !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'all' }}>
          <ProjectModal
            project={PROJECTS[activeProject]}
            onClose={() => setActiveProject(null)}
            mobile={mobile}
          />
        </div>
      )}
    </div>
  )
}

function ProjectModal({ project, onClose, mobile }) {
  if (!project) return null

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        zIndex: 99999,
        background: 'rgba(4, 4, 14, 0.35)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem', boxSizing: 'border-box',
        animation: 'backdropIn 0.25s ease forwards',
      }}
    >
      <style>{`
        @keyframes backdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: mobile ? '400px' : '560px',
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          overflow: 'hidden',
          animation: 'cardIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '14px', right: '14px', zIndex: 10,
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseOut={e  => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        >✕</button>

        <img
          src={project.img}
          alt={project.title}
          style={{
            width: '100%', aspectRatio: '16/9',
            objectFit: 'cover', display: 'block',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        />

        <div style={{ padding: mobile ? '1.2rem 1.4rem 1.5rem' : '1.4rem 1.8rem 1.8rem' }}>
          <h2 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: mobile ? '1.2rem' : '1.5rem',
            color: 'rgba(255,255,255,0.92)',
            letterSpacing: '0.1em',
            margin: '0 0 0.45rem',
          }}>
            {project.title}
          </h2>

          <p style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: mobile ? '0.9rem' : '1.0rem',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.65,
            margin: '0 0 1rem',
          }}>
            {project.desc}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '1.2rem' }}>
            {project.tags.map(tag => (
              <span key={tag} style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.45)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '999px',
                padding: '2px 9px',
                letterSpacing: '0.04em',
              }}>
                {tag}
              </span>
            ))}
          </div>

          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontFamily: 'Nunito, sans-serif',
              fontSize: '0.84rem',
              color: 'rgba(255,255,255,0.85)',
              textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '999px',
              padding: '0.38rem 1rem',
              background: 'rgba(255,255,255,0.06)',
              letterSpacing: '0.06em',
              transition: 'background 0.18s, border-color 0.18s',
            }}
            onMouseOver={e => { e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.3)' }}
            onMouseOut={e  => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.18)' }}
          >
            View project →
          </a>
        </div>
      </div>
    </div>
  )
}