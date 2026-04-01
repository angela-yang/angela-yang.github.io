const NAV_LABELS = ['Intro', 'About', 'Projects', 'Art', 'Contact']
const NAV_COLORS = ['#BE9DB5', '#A984A0', '#AA6787', '#787caa', '#4f598c']
import { FaLinkedin, FaGithub } from 'react-icons/fa'
import { IoDocumentSharp } from 'react-icons/io5'
import { IoMdMail } from 'react-icons/io'

const SOCIAL_LINKS = [
  { icon: <FaLinkedin size={24} />, href: 'https://linkedin.com/in/angelaxy', color: '#787caa' },
  { icon: <FaGithub size={24} />, href: 'https://github.com/angela-yang', color: '#BE9DB5' },
  { icon: <IoMdMail size={24} />, href: 'mailto:angelay2@uw.edu', color: '#A984A0' },
  { icon: <IoDocumentSharp size={24} />, href: '/resume.pdf', color: '#AA6787' },
]

export default function HUD({ zones, cameraY, onNavigate, mobile }) {
  const progress = Math.min(1, Math.abs(cameraY) / 24)
  const heroTranslateY = progress * -120
  const heroOpacity = 1 - progress * 5
  const depthMeters = Math.round(Math.abs(cameraY) * 10)

  const activeZone = zones.reduce((closest, zone) =>
    Math.abs(zone.y - cameraY) < Math.abs(closest.y - cameraY) ? zone : closest
  , zones[0])
  const activeIndex = zones.indexOf(activeZone)

  return (
    <>
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: `translate(-50%, calc(-50% + ${heroTranslateY}px))`,
        textAlign: 'center',
        opacity: Math.max(0, heroOpacity),
        transition: 'opacity 0.1s',
        pointerEvents: 'none',
        width: '90vw',
      }}>
        <h1 style={{
          fontFamily: 'Cinzel, serif',
          fontSize: mobile ? '2.2rem' : '4rem',
          color: '#e3ddee',
          letterSpacing: '0.1em',
          margin: 0,
        }}>
          Angela Yang
        </h1>
        <p style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: mobile ? '0.9rem' : '1.5rem',
          color: '#BE9DB5',
          marginTop: '0.5rem',
          letterSpacing: mobile ? '0.08em' : '0.2em',
        }}>
          CS @ UW · Developer · Builder · Artist
        </p>
        <p style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: mobile ? '0.75rem' : '1.0rem',
          color: '#cfc6e1a4',
          marginTop: '1rem',
          letterSpacing: '0.15em',
        }}>
          {mobile ? 'swipe to dive ↓' : 'scroll to dive ↓'}
        </p>
      </div>

      {/* -- Top nav --------------------- */}
      <nav style={{
        position: 'absolute',
        top: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: mobile ? '0.35rem' : '1.2rem',
        pointerEvents: 'all',
      }}>
        {zones.map((zone, i) => (
          <button
            key={i}
            onClick={() => onNavigate(zone.y)}
            style={{
              background: activeIndex === i ? `${NAV_COLORS[i]}40` : 'none',
              border: `1px solid ${NAV_COLORS[i]}`,
              color: NAV_COLORS[i],
              fontFamily: 'Nunito, sans-serif',
              fontSize: mobile ? '0.6rem' : '1.0rem',
              letterSpacing: mobile ? '0.05em' : '0.15em',
              padding: mobile ? '0.2rem 0.45rem' : '0.4rem 1.1rem',
              borderRadius: '999px',
              cursor: 'pointer',
              opacity: activeIndex === i ? 1 : 0.6,
              transition: 'opacity 0.3s, background 0.3s',
              whiteSpace: 'nowrap',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {NAV_LABELS[i].toUpperCase()}
          </button>
        ))}
      </nav>

      {/* -- Depth meter ------------------------- */}
      <div style={{
        position: 'absolute',
        right: mobile ? '0.6rem' : '2rem',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        pointerEvents: 'none',
      }}>
        <div style={{
          width: '2px',
          height: mobile ? '90px' : '160px',
          background: '#cfc6e1aa',
          borderRadius: '999px',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            top: `${progress * 100}%`,
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: mobile ? '6px' : '8px',
            height: mobile ? '6px' : '8px',
            borderRadius: '50%',
            background: NAV_COLORS[activeIndex],
            boxShadow: `0 0 8px ${NAV_COLORS[activeIndex]}`,
            transition: 'top 0.1s, background 0.3s',
          }} />
        </div>
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '1.0rem',
          color: '#a984a0ba',
          letterSpacing: '0.1em',
          width: '2.8rem',
          textAlign: 'center',
        }}>
          {depthMeters}m
        </span>
      </div>

      {/* -- Social links ---------------------- */}
      {mobile ? (
        <div style={{
          position: 'absolute',
          bottom: '1.2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '1.8rem',
          pointerEvents: 'all',
          zIndex: 20,
        }}>
          {SOCIAL_LINKS.map((item, i) => (
            <a
              key={i}
              href={item.href}
              target={item.href.startsWith('mailto') ? undefined : '_blank'}
              rel="noreferrer"
              style={{
                color: item.color,
                opacity: 0.6,
                display: 'flex',
                alignItems: 'center',
                WebkitTapHighlightColor: 'transparent',
                transition: 'opacity 0.15s, transform 0.15s',
              }}
              onTouchStart={e => { e.currentTarget.style.opacity = '1';   e.currentTarget.style.transform = 'scale(1.2)' }}
              onTouchEnd={e   => { e.currentTarget.style.opacity = '0.6'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              {item.icon}
            </a>
          ))}
        </div>
      ) : (
        <div style={{
          position: 'absolute',
          left: '1.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.4rem',
          pointerEvents: 'all',
          zIndex: 20,
        }}>
          {SOCIAL_LINKS.map((item, i) => (
            <a
              key={i}
              href={item.href}
              target={item.href.startsWith('mailto') ? undefined : '_blank'}
              rel="noreferrer"
              style={{
                color: item.color,
                opacity: 0.5,
                transition: 'opacity 0.2s, transform 0.2s',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseOver={e => { e.currentTarget.style.opacity = '1';   e.currentTarget.style.transform = 'scale(1.2)' }}
              onMouseOut={e  => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.transform = 'scale(1)' }}
            >
              {item.icon}
            </a>
          ))}
          <div style={{ width: '1px', height: '60px', background: '#787caa8f' }} />
        </div>
      )}
    </>
  )
}