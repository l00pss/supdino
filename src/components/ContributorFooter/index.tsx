import React from 'react';

interface Contributor {
  name: string;
  role: string;
  avatar: string;
  github?: string;
  linkedin?: string;
  website?: string;
}

const contributors: Contributor[] = [
  {
    name: 'Vugar Mammadli',
    role: 'Founder & Lead Developer',
    avatar: 'https://github.com/l00pss.png',
    github: 'https://github.com/l00pss',
    linkedin: 'https://linkedin.com/in/vuqar-mammadli',
    website: 'https://buymeacoffee.com/l00pss'
  },
  // Add more contributors here as the project grows
];

const ContributorFooter: React.FC = () => {
  return (
    <section style={{
      backgroundColor: 'var(--ifm-background-surface-color)',
      borderTop: '1px solid var(--ifm-color-emphasis-300)',
      padding: '3rem 0',
      marginTop: '2rem'
    }}>
      <div className="container">
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--ifm-color-emphasis-800)',
            marginBottom: '0.5rem'
          }}>
            Built with ❤️ by
          </h3>
          <p style={{
            color: 'var(--ifm-color-emphasis-600)',
            fontSize: '1rem',
            margin: 0
          }}>
            Passionate developers creating quality educational content
          </p>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem'
        }}>
          {contributors.map((contributor, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '1.5rem',
                borderRadius: '12px',
                backgroundColor: 'var(--ifm-background-color)',
                border: '1px solid var(--ifm-color-emphasis-300)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                maxWidth: '200px',
                minWidth: '180px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                e.currentTarget.style.borderColor = 'var(--ifm-color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-300)';
              }}
            >
              <img
                src={contributor.avatar}
                alt={contributor.name}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  marginBottom: '1rem',
                  border: '3px solid var(--ifm-color-primary)',
                  objectFit: 'cover'
                }}
              />
              <h4 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: 'var(--ifm-color-emphasis-800)',
                margin: '0 0 0.25rem 0'
              }}>
                {contributor.name}
              </h4>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--ifm-color-primary)',
                fontWeight: '500',
                margin: '0 0 1rem 0'
              }}>
                {contributor.role}
              </p>

              <div style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'center'
              }}>
                {contributor.github && (
                  <a
                    href={contributor.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--ifm-color-emphasis-200)',
                      color: 'var(--ifm-color-emphasis-700)',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--ifm-color-primary)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-200)';
                      e.currentTarget.style.color = 'var(--ifm-color-emphasis-700)';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                )}

                {contributor.linkedin && (
                  <a
                    href={contributor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--ifm-color-emphasis-200)',
                      color: 'var(--ifm-color-emphasis-700)',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0077B5';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-200)';
                      e.currentTarget.style.color = 'var(--ifm-color-emphasis-700)';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}

                {contributor.website && (
                  <a
                    href={contributor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--ifm-color-emphasis-200)',
                      color: 'var(--ifm-color-emphasis-700)',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFDD00';
                      e.currentTarget.style.color = '#000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--ifm-color-emphasis-200)';
                      e.currentTarget.style.color = 'var(--ifm-color-emphasis-700)';
                    }}
                  >
                    ☕
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: 'var(--ifm-color-emphasis-100)',
          borderRadius: '8px',
          border: '1px solid var(--ifm-color-emphasis-200)'
        }}>
          <p style={{
            color: 'var(--ifm-color-emphasis-700)',
            fontSize: '0.9rem',
            margin: '0 0 0.5rem 0'
          }}>
            Want to contribute to The8ArmsHub?
          </p>
          <a
            href="https://github.com/l00pss/the8armshub"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--ifm-color-primary)',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            Join our community on GitHub →
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContributorFooter;
