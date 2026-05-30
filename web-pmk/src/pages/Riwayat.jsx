import { useState, useEffect } from 'react';

function Riwayat() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/riwayat')   // ganti dengan URL ngrok/Render kalian
      .then(res => res.json())
      .then(json => {
        setData(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Memuat riwayat...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Riwayat Prediksi</h2>
      {data.length === 0 ? (
        <p>Belum ada data prediksi.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th>ID</th>
              <th>Waktu</th>
              <th>Suhu (°C)</th>
              <th>Nafsu Makan</th>
              <th>Pincang</th>
              <th>Luka Mulut</th>
              <th>Hasil</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id} style={{ background: row.hasil === 'Positif' ? '#ffe0e0' : '#e0ffe0' }}>
                <td>{row.id}</td>
                <td>{row.waktu}</td>
                <td>{row.suhu_tubuh}</td>
                <td>{row.nafsu_makan}</td>
                <td>{row.pincang}</td>
                <td>{row.luka_mulut}</td>
                <td><strong>{row.hasil}</strong></td>
                <td>{row.confidence}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Riwayat;