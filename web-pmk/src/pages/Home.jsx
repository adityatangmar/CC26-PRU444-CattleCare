import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAF8',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>

      {/* NAVBAR */}
      <nav style={{
        background: '#1B4332',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32,
            background: '#4ADE80',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🐄</div>
          <span style={{
            color: '#fff',
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: '-0.3px',
          }}>CattleCare</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { label: 'Deteksi', to: '/deteksi' },
            { label: 'Riwayat', to: '/riwayat' },
          ].map(item => (
            <Link key={item.to} to={item.to} style={{
              color: 'rgba(255,255,255,0.75)',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              padding: '6px 14px',
              borderRadius: 8,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* HERO */}
        <div style={{
          background: '#1B4332',
          borderRadius: 20,
          padding: '48px 40px',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* decorative circles */}
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 220, height: 220,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -40, left: 20,
            width: 160, height: 160,
            background: 'rgba(74,222,128,0.06)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }} />

          <span style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.13)',
            color: '#86EFAC',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '5px 12px',
            borderRadius: 20,
            marginBottom: 20,
          }}>AI Kesehatan Hewan</span>

          <h1 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            color: '#fff',
            fontSize: 'clamp(26px, 5vw, 36px)',
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: '-0.5px',
            margin: '0 0 14px',
          }}>
            Deteksi <em style={{ fontStyle: 'italic', color: '#86EFAC' }}>PMK</em> pada Sapi<br />
            Lebih Cepat, Lebih Akurat
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.72)',
            fontSize: 15,
            lineHeight: 1.7,
            margin: '0 0 32px',
            maxWidth: 420,
          }}>
            Sistem AI multimodal yang menggabungkan analisis gambar (CNN) dan data gejala klinis (ANN) untuk diagnosis PMK yang andal.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/deteksi" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              height: 48,
              padding: '0 24px',
              background: '#fff',
              color: '#1B4332',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
              transition: 'background 0.15s, transform 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F0FDF4'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <span>🔍</span> Mulai Deteksi
            </Link>
            <Link to="/riwayat" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              height: 48,
              padding: '0 24px',
              background: 'transparent',
              color: '#fff',
              border: '1.5px solid rgba(255,255,255,0.3)',
              borderRadius: 12,
              fontWeight: 500,
              fontSize: 15,
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span>📋</span> Lihat Riwayat
            </Link>
          </div>
        </div>

        {/* FEATURE CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 28,
        }}>
          {[
            { icon: '🖼️', title: 'Analisis Visual', desc: 'Model CNN mendeteksi gejala dari foto mulut & kuku sapi.' },
            { icon: '🧬', title: 'Data Klinis', desc: 'Model ANN menganalisis suhu, nafsu makan, dan gejala lainnya.' },
            { icon: '🔗', title: 'Late Fusion', desc: 'Kedua model digabung untuk hasil diagnosis yang lebih akurat.' },
          ].map(f => (
            <div key={f.title} style={{
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 12,
              padding: 20,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                width: 40, height: 40,
                background: '#F0FDF4',
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
                marginBottom: 12,
              }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* INFO BANNER */}
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#92400E', marginBottom: 2 }}>Disclaimer</div>
            <div style={{ fontSize: 12, color: '#78350F', lineHeight: 1.6 }}>
              Hasil diagnosis ini bersifat pendukung keputusan. Tetap konsultasikan ke dokter hewan untuk penanganan lebih lanjut.
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,400&display=swap');
        @media (max-width: 480px) {
          nav a { display: none; }
        }
      `}</style>
    </div>
  );
}

export default Home;
