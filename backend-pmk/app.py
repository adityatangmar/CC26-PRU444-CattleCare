from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import numpy as np
import tensorflow as tf
import os
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ============================================================
# SETUP DATABASE SQLite
# ============================================================
def init_db():
    """Buat tabel riwayat_prediksi kalau belum ada."""
    conn = sqlite3.connect('cattlecare.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS riwayat_prediksi (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            suhu_tubuh  REAL,
            nafsu_makan TEXT,
            pincang     TEXT,
            luka_mulut  TEXT,
            hasil       TEXT,
            confidence  REAL,
            waktu       TEXT
        )
    ''')
    conn.commit()
    conn.close()
    print("Database siap!")

def simpan_ke_db(suhu, nafsu_makan, pincang, luka_mulut, hasil, confidence):
    """Simpan satu baris hasil prediksi ke database."""
    conn = sqlite3.connect('cattlecare.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO riwayat_prediksi
            (suhu_tubuh, nafsu_makan, pincang, luka_mulut, hasil, confidence, waktu)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (suhu, nafsu_makan, pincang, luka_mulut, hasil, confidence,
          datetime.now().strftime('%Y-%m-%d %H:%M:%S')))
    conn.commit()
    conn.close()

# ============================================================
# LOAD MODEL AI
# ============================================================
print("Memuat model dan dependencies...")
kolom_fitur = joblib.load('kolom_fitur_pmk.pkl')
scaler      = joblib.load('scaler_pmk.pkl')
model_ann   = tf.keras.models.load_model('model_pmk_ann.h5')
fitur_numerik = scaler.feature_names_in_
print("Sistem AI Siap!")

# Inisialisasi database saat server pertama kali nyala
init_db()

# ============================================================
# ENDPOINT 1 — POST /predict  (prediksi + simpan ke DB)
# ============================================================
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Tangkap foto (untuk CNN nanti)
        file_foto = request.files.get('foto')
        if file_foto:
            print(f"GAMBAR DITERIMA: {file_foto.filename}")

        # Tangkap data gejala
        suhu        = request.form.get('suhuTubuh',   38.0,     type=float)
        nafsu_makan = request.form.get('nafsuMakan',  'Normal')
        pincang     = request.form.get('pincang',     'Tidak')
        luka_mulut  = request.form.get('lukaMulut',   'Tidak')

        # Bangun input untuk model ANN
        input_data = {fitur: 0.0 for fitur in kolom_fitur}
        input_data['Age']         = 24.0
        input_data['Temperature'] = suhu

        if nafsu_makan == 'Menurun':
            input_data['loss of appetite'] = 1.0
        if pincang == 'Ya':
            input_data['lameness']          = 1.0
            input_data['difficulty walking'] = 1.0
        if luka_mulut == 'Ya':
            input_data['blisters on mouth'] = 1.0
            input_data['sores on mouth']    = 1.0

        df_input = pd.DataFrame([input_data], columns=kolom_fitur)
        df_input[fitur_numerik] = scaler.transform(df_input[fitur_numerik])

        prediksi         = model_ann.predict(df_input.values.astype(np.float32))
        confidence_score = float(prediksi[0][0])
        status           = "Positif" if confidence_score > 0.5 else "Negatif"

        # ✅ SIMPAN KE DATABASE
        simpan_ke_db(suhu, nafsu_makan, pincang, luka_mulut, status, round(confidence_score * 100, 2))

        return jsonify({
            "status":               "success",
            "hasil_diagnosis":      status,
            "confidence_score_ann": round(confidence_score * 100, 2)
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500


# ============================================================
# ENDPOINT 2 — GET /riwayat  (ambil semua riwayat prediksi)
# ============================================================
@app.route('/riwayat', methods=['GET'])
def riwayat():
    try:
        conn   = sqlite3.connect('cattlecare.db')
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM riwayat_prediksi ORDER BY id DESC')
        rows   = cursor.fetchall()
        conn.close()

        kolom = ['id', 'suhu_tubuh', 'nafsu_makan', 'pincang',
                 'luka_mulut', 'hasil', 'confidence', 'waktu']

        data = [dict(zip(kolom, row)) for row in rows]
        return jsonify({"status": "success", "data": data})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ============================================================
# JALANKAN SERVER
# ============================================================
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)