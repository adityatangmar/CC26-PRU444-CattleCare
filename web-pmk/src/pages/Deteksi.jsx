import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Deteksi() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    foto: null,
    suhuTubuh: '',
    nafsuMakan: 'Normal',
    pincang: 'Tidak',
    lukaMulut: 'Tidak',
    vaksinasi: 'Belum'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitAsli = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Bungkus data dari state React ke dalam FormData 
    const dataKirim = new FormData();
    dataKirim.append('suhuTubuh', formData.suhuTubuh);
    dataKirim.append('nafsuMakan', formData.nafsuMakan);
    dataKirim.append('pincang', formData.pincang);
    dataKirim.append('lukaMulut', formData.lukaMulut);
    
    // Saat model CNN sudah diintegrasikan, fotonya akan dikirim dengan cara ini:
    dataKirim.append('foto', formData.foto);

    try {
      // 2. Tembak API Backend Flask 
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: dataKirim,
      });

      // --- KODE YANG DIPERBARUI UNTUK MELACAK ERROR ---
      if (!response.ok) {
        // Jika statusnya 500 (error), baca pesan dari Flask
        const errorData = await response.json();
        throw new Error(`Backend AI membalas dengan error: ${errorData.message}`);
      }
      // ------------------------------------------------

      const result = await response.json();
      
      navigate('/hasil', { 
        state: { 
          statusPMK: result.hasil_diagnosis,
          akurasi: result.confidence_score_ann 
        } 
      });

    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      // Sekarang alert akan menampilkan pesan error yang spesifik!
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h2>Form Deteksi Gejala PMK</h2>
        <p>Lengkapi data visual dan klinis di bawah ini untuk akurasi maksimal.</p>
        
        <form onSubmit={handleSubmitAsli} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h4>Data Visual (Model CNN)</h4>
            <label>Unggah Foto Area Mulut/Kuku Sapi: </label>
            <input 
              type="file" 
              accept="image/*" 
              required 
              onChange={(e) => setFormData(prev => ({ ...prev, foto: e.target.files[0] }))}
            />
          </div>

          <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4>Data Klinis (Model ANN)</h4>
            
            <div>
              <label>Suhu Tubuh (°C): </label>
              <input type="number" step="0.1" name="suhuTubuh" value={formData.suhuTubuh} onChange={handleChange} required placeholder="Contoh: 38.5" />
            </div>

            <div>
              <label>Nafsu Makan: </label>
              <select name="nafsuMakan" value={formData.nafsuMakan} onChange={handleChange}>
                <option value="Normal">Normal</option>
                <option value="Menurun">Menurun/Hilang</option>
              </select>
            </div>

            <div>
              <label>Sapi Terlihat Pincang?: </label>
              <select name="pincang" value={formData.pincang} onChange={handleChange}>
                <option value="Tidak">Tidak</option>
                <option value="Ya">Ya</option>
              </select>
            </div>

            <div>
              <label>Ada Luka/Lepuh di Mulut?: </label>
              <select name="lukaMulut" value={formData.lukaMulut} onChange={handleChange}>
                <option value="Tidak">Tidak</option>
                <option value="Ya">Ya</option>
              </select>
            </div>

            <div>
              <label>Riwayat Vaksinasi PMK: </label>
              <select name="vaksinasi" value={formData.vaksinasi} onChange={handleChange}>
                <option value="Belum">Belum Pernah</option>
                <option value="Sudah">Sudah</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "AI Sedang Menganalisis..." : "Analisis Sekarang"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Deteksi;