import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Sistem Deteksi PMK pada Sapi</h1>
      <p>Penyakit Mulut dan Kuku (PMK) sangat menular. Lakukan deteksi dini di sini.</p>
      {/* Tombol untuk pindah ke halaman deteksi */}
      <Link to="/deteksi">
        <button style={{ padding: '10px 20px', cursor: 'pointer' }}>Mulai Deteksi</button>
      </Link>
      <Link to="/riwayat">
        <button style={{ padding: '10px 20px', cursor: 'pointer', marginLeft: '10px' }}>Riwayat Prediksi</button>
      </Link>
    </div>
  );
}

export default Home;