import { FaGithub, FaLinkedin, FaEnvelope, FaFileAlt } from 'react-icons/fa';
import { IconType } from 'react-icons';

interface Link {
  label: string;
  icon: IconType;
  href: string;
}

const LINKS: Link[] = [
  { label: 'GitHub', icon: FaGithub, href: 'https://github.com/angela-yang' },
  { label: 'LinkedIn', icon: FaLinkedin, href: 'https://linkedin.com/in/angelaxqy' },
  { label: 'Email', icon: FaEnvelope, href: 'mailto:angelay2@uw.edu' },
  { label: 'Resume', icon: FaFileAlt, href: '/resume.pdf' },
];

export default function contact() {
  return (
    <div>
      <h1 className="section-title">say hi 👋</h1>
      <p className="section-subtitle">let's connect</p>
      <div className="divider" />

      <p className="body-text" style={{ marginBottom: '1.5rem' }}>
        i'm always open to new opportunities, collaborations, or just a friendly chat.
        feel free to reach out!
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {LINKS.map(link => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'var(--bg-light)',
                borderRadius: 10,
                border: '1px solid #ffffff10',
                textDecoration: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent)';
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = '#ffffff10';
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
              }}
            >
              <Icon size={18} />
              {link.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}