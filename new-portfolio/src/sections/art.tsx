interface ArtPiece {
  src: string;
  title: string;
  medium?: string;
}

const PIECES: ArtPiece[] = [
  { src:'/art/piece1.jpg', title: 'Nostalgia',   medium: 'colored pencil' },
  { src:'/art/piece2.jpg', title: 'Memory Project',   medium: 'colored pencil' },
  { src:'/art/piece3.jpg', title: 'Mom', medium: 'crayon' },
  { src:'/art/piece4.jpg', title: 'Love',  medium: 'marker' },
  { src:'/art/piece5.jpg', title: 'Fairytale Romance',  medium: 'charcoal' },
];

export default function art() {
  return (
    <div>
      <h1 className="section-title">art</h1>
      <p className="section-subtitle">things i've made</p>
      <div className="divider" />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '1rem',
        }}
      >
        {PIECES.map(piece => (
          <div key={piece.title}>
            <img
              src={piece.src}
              alt={piece.title}
              style={{ width: '100%', borderRadius: 10, display: 'block' }}
            />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '0.3rem', textAlign: 'center' }}>
              {piece.title} {piece.medium && `· ${piece.medium}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}