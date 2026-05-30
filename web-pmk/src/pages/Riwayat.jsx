import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000'; // ganti dengan URL ngrok/Render aktif

function Riwayat() {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const fetchRiwayat = () => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/riwayat`)
      .then(res => {
        if (!res.ok) throw new Error('Gagal mengambil data dari server');
        return res.json();
      })
      .then(json => { setData(json.data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => { fetchRiwayat(); }, []);

  const total   = data.length;
  const positif = data.filter(d => d.hasil === 'Positif').length;
  const negatif = data.filter(d => d.hasil === 'Negatif').length;

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      <nav style={{ background: '#1B4332', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: '#4ADE80', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🐄</div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>CattleCare</span>
        </Link>
        <div style={{ display: 'flex', gap: 4 }}>
          {[{ label: 'Beranda', to: '/' }, { label: 'Deteksi', to: '/deteksi' }].map(item => (
            <Link key={item.to} to={item.to} style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '6px 14px', borderRadius: 8 }}>{item.label}</Link>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 80px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 26, fontWeight: 600, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.3px' }}>Riwayat Prediksi</h1>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Semua hasil deteksi PMK yang pernah dilakukan.</p>
          </div>
          <button onClick={fetchRiwayat} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 40, padding: '0 16px', background: '#1B4332', color: '#fff', border: 'none', borderRadius: 8, fontFamily: "'DM Sans', system-ui", fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            ↻ Refresh
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Prediksi', value: total, color: '#111827', bg: '#F9FAFB', border: 'rgba(0,0,0,0.06)' },
            { label: 'Positif PMK', value: positif, color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
            { label: 'Negatif PMK', value: negatif, color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 32, fontWeight: 600, color: s.color, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
            <div>Memuat data...</div>
          </div>
        ) : error ? (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 600, color: '#DC2626', marginBottom: 4 }}>Koneksi Gagal</div>
              <div style={{ fontSize: 13, color: '#991B1B' }}>{error}. Pastikan backend sudah berjalan.</div>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Belum ada data prediksi</div>
            <div style={{ fontSize: 13 }}>Lakukan deteksi pertama kamu di halaman Deteksi.</div>
            <Link to="/deteksi" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, height: 40, padding: '0 20px', background: '#1B4332', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>🔍 Mulai Deteksi</Link>
          </div>
        ) : (
          <div style={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  {['ID', 'Waktu', 'Suhu (°C)', 'Nafsu Makan', 'Pincang', 'Luka Mulut', 'Hasil', 'Confidence'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6B7280', borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAF8', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td style={{ padding: '12px 16px', color: '#9CA3AF' }}>#{row.id}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', color: '#374151' }}>{row.waktu}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{row.suhu_tubuh}°</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{row.nafsu_makan}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{row.pincang}</td>
                    <td style={{ padding: '12px 16px', color: '#374151' }}>{row.luka_mulut}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: row.hasil === 'Positif' ? '#FEF2F2' : '#F0FDF4', color: row.hasil === 'Positif' ? '#DC2626' : '#16A34A' }}>
                        {row.hasil === 'Positif' ? '⚠️' : '✅'} {row.hasil}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 56, height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${row.confidence}%`, height: '100%', background: row.hasil === 'Positif' ? '#DC2626' : '#16A34A', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{row.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600&display=swap');
      `}</style>
    </div>
  );
}

export default Riwayat;
