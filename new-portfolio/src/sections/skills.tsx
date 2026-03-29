const SKILLS: { category: string; emoji: string; items: string[] }[] = [
  {
    category: 'languages',
    emoji: '💬',
    items: ['Python', 'TypeScript', 'JavaScript', 'Java', 'C++'],
  },
  {
    category: 'frontend',
    emoji: '🖥️',
    items: ['React', 'Next.js', 'HTML/CSS', 'Tailwind'],
  },
  {
    category: 'tools',
    emoji: '🛠',
    items: ['Git', 'Figma', 'VS Code', 'Blender'],
  },
  {
    category: 'soft skills',
    emoji: '✨',
    items: ['design thinking', 'teamwork', 'communication', 'creativity'],
  },
];

export default function skills() {
  return (
    <div>
      <h1 className="section-title">skills</h1>
      <p className="section-subtitle">what i work with</p>
      <div className="divider" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {SKILLS.map(group => (
          <div
            key={group.category}
            style={{
              background: 'var(--bg-light)',
              borderRadius: 12,
              padding: '1rem',
              border: '1px solid #ffffff10',
            }}
          >
            <p style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {group.emoji} {group.category}
            </p>
            <div>
              {group.items.map(skill => (
                <span className="chip" key={skill}>{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}