import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'https://storm-audacious-catfish.ngrok-free.dev'; // ganti dengan URL ngrok aktif

const styles = {
  page: {
    minHeight: '100vh',
    background: '#FAFAF8',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  nav: {
    background: '#1B4332',
    padding: '0 24px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navBrand: {
    display: 'flex', alignItems: 'center', gap: 10,
    textDecoration: 'none',
  },
  navLogo: {
    width: 32, height: 32,
    background: '#4ADE80', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18,
  },
  navTitle: {
    color: '#fff', fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px',
  },
  container: {
    maxWidth: 640,
    margin: '0 auto',
    padding: '32px 20px 80px',
  },
  pageHeader: {
    marginBottom: 24,
  },
  pageTitle: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 26,
    fontWeight: 600,
    color: '#111827',
    letterSpacing: '-0.3px',
    margin: '0 0 4px',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    margin: 0,
  },
  card: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid rgba(0,0,0,0.06)',
    padding: 24,
    marginBottom: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  sectionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#1B4332',
    marginBottom: 16,
  },
  sectionLabelLine: {
    flex: 1,
    height: 1,
    background: '#E5E7EB',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: '#374151',
  },
  input: {
    width: '100%',
    height: 44,
    padding: '0 14px',
    border: '1.5px solid #D1D5DB',
    borderRadius: 8,
    fontFamily: "'DM Sans', system-ui",
    fontSize: 15,
    color: '#111827',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  select: {
    width: '100%',
    height: 44,
    padding: '0 40px 0 14px',
    border: '1.5px solid #D1D5DB',
    borderRadius: 8,
    fontFamily: "'DM Sans', system-ui",
    fontSize: 15,
    color: '#111827',
    background: '#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'8\' viewBox=\'0 0 12 8\'%3E%3Cpath d=\'M1 1l5 5 5-5\' stroke=\'%236b7280\' stroke-width=\'1.5\' fill=\'none\' stroke-linecap=\'round\'/%3E%3C/svg%3E") no-repeat right 14px center',
    outline: 'none',
    appearance: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  fileInput: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #BBF7D0',
    borderRadius: 8,
    fontFamily: "'DM Sans', system-ui",
    fontSize: 13,
    color: '#374151',
    background: '#F0FDF4',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  fileHint: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    height: 52,
    background: '#1B4332',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontFamily: "'DM Sans', system-ui",
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.15s, transform 0.1s',
    letterSpacing: '0.01em',
  },
};

function Deteksi() {
  const [isLoading, setIsLoading] = useState(false);
  const [fotoName, setFotoName] = useState('');
  const [fotoPreview, setFotoPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    foto: null,
    suhuTubuh: '',
    nafsuMakan: 'Normal',
    pincang: 'Tidak',
    lukaMulut: 'Tidak',
    vaksinasi: 'Belum'
  });

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setFormData(prev => ({ ...prev, foto: file }));
    setFotoName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setFotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const dataKirim = new FormData();
    dataKirim.append('suhuTubuh', formData.suhuTubuh);
    dataKirim.append('nafsuMakan', formData.nafsuMakan);
    dataKirim.append('pincang', formData.pincang);
    dataKirim.append('lukaMulut', formData.lukaMulut);
    dataKirim.append('foto', formData.foto);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: dataKirim,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Backend error: ${errorData.message}`);
      }

      const result = await response.json();
      navigate('/hasil', {
        state: {
          statusPMK: result.hasil_diagnosis,
          akurasi: result.confidence_score_ann
        }
      });

    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* NAVBAR */}
      <nav style={styles.nav}>
        <Link to="/" style={styles.navBrand}>
          <div style={styles.navLogo}>🐄</div>
          <span style={styles.navTitle}>CattleCare</span>
        </Link>
        <div style={{ display: 'flex', gap: 4 }}>
          {[{ label: 'Beranda', to: '/' }, { label: 'Riwayat', to: '/riwayat' }].map(item => (
            <Link key={item.to} to={item.to} style={{
              color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
              fontSize: 14, fontWeight: 500, padding: '6px 14px', borderRadius: 8,
            }}>{item.label}</Link>
          ))}
        </div>
      </nav>

      <div style={styles.container}>

        {/* PAGE HEADER */}
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Deteksi Gejala PMK</h1>
          <p style={styles.pageSubtitle}>Lengkapi data visual dan klinis berikut untuk hasil analisis terbaik.</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* CNN CARD */}
          <div style={styles.card}>
            <div style={styles.sectionLabel}>
              <span>Model CNN - Data Visual</span>
              <div style={styles.sectionLabelLine} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Foto Area Mulut / Kuku Sapi</label>

              {/* Hidden real input */}
              <input
                type="file"
                accept="image/*"
                required
                id="foto-input"
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])}
              />

              {/* Drag & Drop Zone */}
              <div
                onClick={() => document.getElementById('foto-input').click()}
                onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${isDragging ? '#1B4332' : fotoPreview ? '#BBF7D0' : '#D1D5DB'}`,
                  borderRadius: 12,
                  background: isDragging ? '#F0FDF4' : fotoPreview ? '#F0FDF4' : '#FAFAF8',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, background 0.2s',
                  overflow: 'hidden',
                  minHeight: 140,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {fotoPreview ? (
                  /* Preview state */
                  <div style={{ width: '100%', position: 'relative' }}>
                    <img
                      src={fotoPreview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        maxHeight: 220,
                        objectFit: 'cover',
                        display: 'block',
                        borderRadius: 10,
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 8, left: 8, right: 8,
                      background: 'rgba(0,0,0,0.55)',
                      backdropFilter: 'blur(6px)',
                      borderRadius: 8,
                      padding: '6px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14 }}>✅</span>
                        <span style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>{fotoName}</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>Klik untuk ganti</span>
                    </div>
                  </div>
                ) : (
                  /* Empty state */
                  <div style={{ textAlign: 'center', padding: '28px 24px' }}>
                    <div style={{
                      width: 52, height: 52,
                      background: isDragging ? '#BBF7D0' : '#E5E7EB',
                      borderRadius: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 14px',
                      fontSize: 24,
                      transition: 'background 0.2s',
                    }}>
                      🖼️
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: isDragging ? '#1B4332' : '#374151', marginBottom: 4 }}>
                      {isDragging ? 'Lepaskan foto di sini' : 'Drag & drop foto, atau klik untuk pilih'}
                    </div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>
                      JPG, PNG, WEBP hingga 10MB
                    </div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      marginTop: 14,
                      height: 34, padding: '0 16px',
                      background: '#fff',
                      border: '1.5px solid #D1D5DB',
                      borderRadius: 8,
                      fontSize: 13, fontWeight: 500, color: '#374151',
                    }}>
                      📁 Pilih File
                    </div>
                  </div>
                )}
              </div>

              <div style={styles.fileHint}>Pastikan foto jelas dan fokus pada area mulut atau kuku yang bergejala.</div>
            </div>
          </div>

          {/* ANN CARD */}
          <div style={styles.card}>
            <div style={styles.sectionLabel}>
              <span>Model ANN - Data Klinis</span>
              <div style={styles.sectionLabelLine} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Suhu Tubuh (°C)</label>
              <input
                type="number"
                step="0.1"
                min="35"
                max="43"
                name="suhuTubuh"
                value={formData.suhuTubuh}
                onChange={handleChange}
                required
                placeholder="Contoh: 38.5"
                style={styles.input}
                onFocus={e => { e.target.style.borderColor = '#1B4332'; e.target.style.boxShadow = '0 0 0 3px rgba(27,67,50,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
              />
              <div style={styles.fileHint}>Suhu normal sapi: 38.0 - 39.5°C</div>
            </div>

            <div style={styles.formGrid}>
              {[
                { name: 'nafsuMakan', label: 'Nafsu Makan', options: [['Normal', 'Normal'], ['Menurun', 'Menurun / Hilang']] },
                { name: 'pincang', label: 'Sapi Terlihat Pincang?', options: [['Tidak', 'Tidak'], ['Ya', 'Ya']] },
                { name: 'lukaMulut', label: 'Luka / Lepuh di Mulut?', options: [['Tidak', 'Tidak'], ['Ya', 'Ya']] },
                { name: 'vaksinasi', label: 'Riwayat Vaksinasi PMK', options: [['Belum', 'Belum Pernah'], ['Sudah', 'Sudah Divaksin']] },
              ].map(field => (
                <div key={field.name} style={styles.formGroup}>
                  <label style={styles.label}>{field.label}</label>
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    style={styles.select}
                    onFocus={e => { e.target.style.borderColor = '#1B4332'; e.target.style.boxShadow = '0 0 0 3px rgba(27,67,50,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                  >
                    {field.options.map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.submitBtn,
              background: isLoading ? '#D1D5DB' : '#1B4332',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => !isLoading && (e.currentTarget.style.background = '#15532e')}
            onMouseLeave={e => !isLoading && (e.currentTarget.style.background = '#1B4332')}
            onMouseDown={e => !isLoading && (e.currentTarget.style.transform = 'scale(0.99)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isLoading ? (
              <>
                <span style={{
                  width: 18, height: 18,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                  display: 'inline-block',
                }} />
                AI Sedang Menganalisis...
              </>
            ) : (
              <><span>🔬</span> Analisis Sekarang</>
            )}
          </button>

        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 500px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default Deteksi;
