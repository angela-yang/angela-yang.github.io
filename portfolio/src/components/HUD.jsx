export default function HUD() {
  return (
    <>
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      }}>
        <h1 style={{ fontFamily: 'Cinzel', fontSize: '3rem', color: 'var(--aqua)', letterSpacing: '0.1em' }}>
          Angela Yang
        </h1>
        <p style={{ fontFamily: 'Nunito', fontSize: '1rem', color: 'var(--foam)', marginTop: '0.5rem', letterSpacing: '0.2em' }}>
          CS @ UW · Designer · Builder
        </p>
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'absolute',
        bottom: '2rem', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: '2rem',
        pointerEvents: 'all',
      }}>
        {['About', 'Projects', 'Art', 'Contact'].map(label => (
          <button
            key={label}
            style={{
              background: 'none',
              border: '1px solid var(--aqua)',
              color: 'var(--aqua)',
              fontFamily: 'Nunito',
              fontSize: '0.85rem',
              letterSpacing: '0.15em',
              padding: '0.5rem 1.25rem',
              borderRadius: '999px',
              cursor: 'pointer',
            }}
          >
            {label.toUpperCase()}
          </button>
        ))}
      </nav>
    </>
  )
}