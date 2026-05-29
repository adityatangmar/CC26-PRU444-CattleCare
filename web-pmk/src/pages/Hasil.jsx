import { useLocation, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Perbaikan Bug Icon Leaflet ---
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

// Membuat Icon khusus untuk lokasi user (Warna Merah/Oranye) agar berbeda dengan klinik
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function Hasil() {
  const location = useLocation();
  const statusPMK = location.state?.statusPMK || "Tidak Ada Data";
  const akurasi = location.state?.akurasi || 0;

  // State untuk menyimpan koordinat
  const [lokasiPengguna, setLokasiPengguna] = useState(null);
  const [lokasiKlinik, setLokasiKlinik] = useState(null);
  const [statusLokasi, setStatusLokasi] = useState("Meminta akses lokasi GPS...");

  useEffect(() => {
    // Hanya cari lokasi jika sapi terindikasi positif
    if (statusPMK === "Positif") {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            setLokasiPengguna([lat, lng]);
            
            // Simulasi AI mencari klinik terdekat: 
            // Kita geser koordinat sedikit (sekitar 500m - 1km dari user)
            setLokasiKlinik([lat + 0.005, lng + 0.005]); 
            setStatusLokasi("Lokasi ditemukan!");
          },
          (error) => {
            console.error("Error Geolocation:", error);
            // Fallback (Titik cadangan jika user menolak akses GPS: Area Pamulang)
            setLokasiPengguna([-6.3416, 106.7381]);
            setLokasiKlinik([-6.3380, 106.7400]);
            setStatusLokasi("Akses GPS ditolak. Menampilkan rekomendasi default.");
          }
        );
      } else {
        setStatusLokasi("Browser Anda tidak mendukung fitur lokasi GPS.");
      }
    }
  }, [statusPMK]);

  return (
    <div className="app-container">
      <div className="card">
        <h2>Hasil Diagnosis AI</h2>
        
        <div style={{ 
          padding: '20px', 
          borderRadius: '8px', 
          backgroundColor: statusPMK === "Positif" ? '#fee2e2' : '#dcfce7',
          border: statusPMK === "Positif" ? '2px solid #ef4444' : '2px solid #22c55e'
        }}>
          <h3 style={{ margin: 0, color: statusPMK === "Positif" ? '#991b1b' : '#166534', fontSize: '1.5rem' }}>
            Status: {statusPMK}
          </h3>
          
          <p style={{ marginTop: '10px', fontSize: '1.1rem' }}>
            Tingkat Keyakinan AI: <strong>{akurasi}%</strong>
          </p>

          {statusPMK === "Positif" ? (
            <p style={{ marginTop: '10px' }}>
              <strong>Peringatan!</strong> Sistem mendeteksi gejala yang mengarah pada PMK. Segera hubungi layanan kesehatan hewan terdekat.
            </p>
          ) : (
            <p style={{ marginTop: '10px' }}>
              Sapi dalam kondisi sehat dan tidak menunjukkan gejala PMK yang signifikan. Tetap jaga kebersihan kandang.
            </p>
          )}
        </div>

        {/* PETA HANYA MUNCUL JIKA STATUS POSITIF DAN LOKASI SUDAH DIDAPAT */}
        {statusPMK === "Positif" && (
          <div style={{ marginTop: '30px' }}>
            <h3>Pemetaan Layanan Kesehatan Hewan:</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{statusLokasi}</p>
            
            {lokasiPengguna && lokasiKlinik && (
              <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ccc', marginTop: '10px' }}>
                <MapContainer center={lokasiPengguna} zoom={14} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Pin Lokasi Peternak (Oranye) */}
                  <Marker position={lokasiPengguna} icon={userIcon}>
                    <Popup><strong>Lokasi Anda (Peternakan)</strong></Popup>
                  </Marker>

                  {/* Pin Lokasi Klinik Hewan (Biru Bawaan Leaflet) */}
                  <Marker position={lokasiKlinik}>
                    <Popup>
                      <strong>Klinik Hewan Terdekat</strong><br />
                      Tim medis siap menangani kasus PMK.
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
          </div>
        )}

        <Link to="/">
          <button className="btn-primary" style={{ marginTop: '20px' }}>
            Kembali ke Beranda
          </button>
        </Link>
      </div>
    </div>
  );
}

export default Hasil;