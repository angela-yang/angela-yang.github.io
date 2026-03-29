interface Project {
  name: string;
  description: string;
  tags: string[];
  link?: string;
}

const PROJECTS: Project[] = [
  {
    name: 'UW Pawprint',
    description: 'A hub of UW course, professor, and housing reviews for students. Allows students to leave reviews, showing the review for the course as a whole and for the individual professors teaching the course. Allows housing reviews + roommate listings.',
    tags: ['React', 'Next.js', 'Supabase', 'TypeScript', 'Python'],
    link: 'https://uw-pawprint.vercel.app/',
  },
  {
    name: 'CSEED Buildspace',
    description: 'A project as CSEED\'s design engineer - a website to showcase and promote Buildspace, showing past cohorts\' projects, and representing the club.',
    tags: ['React', 'Next.js', 'Tailwind'],
    link: 'https://cseed-buildspace.vercel.app/',
  },
  {
    name: 'Tangierine',
    description: 'This project was created to market my artwork. The website is designed like a physical shop to make the shopping experience more exciting and interactive.',
    tags: ['Next.js', 'Tailwind', 'Supabase', 'Stripe'],
    link: 'https://tangierine.vercel.app',
  },
];

export default function projects() {
  return (
    <div>
      <h1 className="section-title">projects</h1>
      <p className="section-subtitle">things i've built</p>
      <div className="divider" />

      {PROJECTS.map(p => (
        <div className="project-card" key={p.name}>
          <h3>{p.name}</h3>
          <p className="body-text" style={{ marginBottom: '0.6rem' }}>{p.description}</p>
          <div>
            {p.tags.map(t => <span className="chip" key={t}>{t}</span>)}
          </div>
          {p.link && (
            <a
              href={p.link}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-block', marginTop: '0.6rem', fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none' }}
            >
              view project!
            </a>
          )}
        </div>
      ))}
    </div>
  );
}