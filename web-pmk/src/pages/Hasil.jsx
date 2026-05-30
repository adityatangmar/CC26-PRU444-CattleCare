import { useLocation, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

function Hasil() {
  const location = useLocation();
  const statusPMK = location.state?.statusPMK || 'Tidak Ada Data';
  const akurasi = location.state?.akurasi || 0;

  const [lokasiPengguna, setLokasiPengguna] = useState(null);
  const [lokasiKlinik, setLokasiKlinik] = useState(null);
  const [statusLokasi, setStatusLokasi] = useState('Meminta akses lokasi GPS...');

  const isPositif = statusPMK === 'Positif';

  useEffect(() => {
    if (isPositif) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            setLokasiPengguna([coords.latitude, coords.longitude]);
            setLokasiKlinik([coords.latitude + 0.005, coords.longitude + 0.005]);
            setStatusLokasi('Lokasi ditemukan!');
          },
          () => {
            setLokasiPengguna([-6.3416, 106.7381]);
            setLokasiKlinik([-6.3380, 106.7400]);
            setStatusLokasi('Akses GPS ditolak. Menampilkan rekomendasi default.');
          }
        );
      }
    }
  }, [isPositif]);

  // Confidence bar color
  const confColor = isPositif ? '#DC2626' : '#16A34A';
  const confBg = isPositif ? '#FEF2F2' : '#F0FDF4';
  const confBorder = isPositif ? '#FECACA' : '#BBF7D0';

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
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, background: '#4ADE80', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🐄</div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>CattleCare</span>
        </Link>
        <div style={{ display: 'flex', gap: 4 }}>
          {[{ label: 'Deteksi Lagi', to: '/deteksi' }, { label: 'Riwayat', to: '/riwayat' }].map(item => (
            <Link key={item.to} to={item.to} style={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '6px 14px', borderRadius: 8 }}>{item.label}</Link>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* PAGE HEADER */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 26, fontWeight: 600, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            Hasil Diagnosis AI
          </h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>
            Berdasarkan analisis gambar dan data gejala klinis yang diberikan.
          </p>
        </div>

        {/* RESULT BOX */}
        <div style={{
          background: confBg,
          border: `1.5px solid ${confBorder}`,
          borderRadius: 16,
          padding: 28,
          marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 36 }}>{isPositif ? '⚠️' : '✅'}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: confColor, marginBottom: 2 }}>
                Status Diagnosis
              </div>
              <div style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 28,
                fontWeight: 600,
                color: confColor,
                lineHeight: 1.1,
              }}>
                {isPositif ? 'Terindikasi PMK' : 'Tidak Terdeteksi PMK'}
              </div>
            </div>
          </div>

          {/* Confidence */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#374151' }}>
              <span style={{ fontWeight: 500 }}>Tingkat Keyakinan AI</span>
              <span style={{ fontWeight: 700, color: confColor }}>{akurasi}%</span>
            </div>
            <div style={{ height: 8, background: 'rgba(0,0,0,0.06)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                width: `${akurasi}%`,
                height: '100%',
                background: confColor,
                borderRadius: 4,
                transition: 'width 0.6s ease',
              }} />
            </div>
          </div>

          {/* Message */}
          <div style={{
            background: 'rgba(255,255,255,0.6)',
            borderRadius: 10,
            padding: '12px 16px',
            fontSize: 14,
            lineHeight: 1.6,
            color: '#374151',
          }}>
            {isPositif ? (
              <>
                <strong style={{ color: confColor }}>Perhatian!</strong> Sistem mendeteksi gejala yang mengarah pada PMK.
                Segera isolasi sapi dan hubungi dokter hewan terdekat untuk penanganan lebih lanjut.
              </>
            ) : (
              <>
                <strong style={{ color: '#166534' }}>Kabar Baik!</strong> Sapi tidak menunjukkan gejala PMK yang signifikan.
                Tetap pantau kondisi sapi dan jaga kebersihan kandang secara rutin.
              </>
            )}
          </div>
        </div>

        {/* INFO CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: isPositif ? '1fr 1fr' : '1fr', gap: 12, marginBottom: 20 }}>
          {isPositif && (
            <div style={{
              background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 8 }}>
                Tindakan Segera
              </div>
              {[
                '🔒 Isolasi sapi yang terinfeksi',
                '📞 Hubungi dokter hewan',
                '🧼 Disinfeksi kandang',
                '📋 Laporkan ke Dinas Peternakan',
              ].map(tip => (
                <div key={tip} style={{ fontSize: 13, color: '#374151', padding: '4px 0', borderBottom: '1px solid #F3F4F6' }}>
                  {tip}
                </div>
              ))}
            </div>
          )}
          <div style={{
            background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#6B7280', marginBottom: 8 }}>
              Detail Prediksi
            </div>
            {[
              ['Model', 'ANN (Data Klinis)'],
              ['Status', statusPMK],
              ['Confidence', `${akurasi}%`],
            ].map(([key, val]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#374151', padding: '5px 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ color: '#6B7280' }}>{key}</span>
                <span style={{ fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MAP */}
        {isPositif && (
          <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, padding: 20, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 2 }}>Layanan Kesehatan Hewan Terdekat</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{statusLokasi}</div>
            </div>
            {lokasiPengguna && lokasiKlinik && (
              <div style={{ height: 360, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                <MapContainer center={lokasiPengguna} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker position={lokasiPengguna} icon={userIcon}>
                    <Popup><strong>Lokasi Peternakan Anda</strong></Popup>
                  </Marker>
                  <Marker position={lokasiKlinik}>
                    <Popup><strong>Klinik Hewan Terdekat</strong><br />Tim medis siap menangani kasus PMK.</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
          </div>
        )}

        {/* ACTIONS */}
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/deteksi" style={{
            flex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            height: 48,
            background: '#1B4332',
            color: '#fff',
            borderRadius: 12,
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
          }}>
            🔍 Deteksi Lagi
          </Link>
          <Link to="/riwayat" style={{
            flex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            height: 48,
            background: '#fff',
            color: '#1B4332',
            border: '1.5px solid #BBF7D0',
            borderRadius: 12,
            fontWeight: 500,
            fontSize: 15,
            textDecoration: 'none',
          }}>
            📋 Lihat Riwayat
          </Link>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,600&display=swap');
        @media (max-width: 500px) {
          .result-info-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export default Hasil;
