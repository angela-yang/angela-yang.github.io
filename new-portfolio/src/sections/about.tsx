export default function about() {
  return (
    <div>
      <h1 className="section-title">about</h1>
      <p className="section-subtitle">Hi, I'm Angela Yang!</p>
      <div className="divider" />

      <img
        src="/me.jpg"
        alt="angela yang"
        style={{
          width: '100%',
          maxWidth: 260,
          borderRadius: 12,
          display: 'block',
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 24px var(--shadow)',
        }}
      />

      <p className="body-text">
        I'm a CS student at UW who loves building
        things at the intersection of code and creativity. When I'm not
        coding, I'm probably drawing, crocheting little whales, or playing tennis.
      </p>
    </div>
  );
}