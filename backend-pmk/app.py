from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import numpy as np
import tensorflow as tf
import os # Tambahkan library os untuk membaca port dari server cloud

app = Flask(__name__)
CORS(app)

print("Memuat model dan dependencies...")
kolom_fitur = joblib.load('kolom_fitur_pmk.pkl')
scaler = joblib.load('scaler_pmk.pkl')
model_ann = tf.keras.models.load_model('model_pmk_ann.h5')

fitur_numerik = scaler.feature_names_in_ 
print("Sistem AI Siap!")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # --- 1. MENANGKAP GAMBAR UNTUK CNN ---
        file_foto = request.files.get('foto')
        if file_foto:
            print(f"GAMBAR DITERIMA DARI WEB: {file_foto.filename}")

        # --- 2. MENANGKAP DATA GEJALA UNTUK ANN ---
        suhu = request.form.get('suhuTubuh', 38.0, type=float)
        nafsu_makan = request.form.get('nafsuMakan', 'Normal')
        pincang = request.form.get('pincang', 'Tidak')
        luka_mulut = request.form.get('lukaMulut', 'Tidak')

        input_data = {fitur: 0.0 for fitur in kolom_fitur}
        
        input_data['Age'] = 24.0 
        input_data['Temperature'] = suhu
        
        if nafsu_makan == 'Menurun':
            input_data['loss of appetite'] = 1.0
        if pincang == 'Ya':
            input_data['lameness'] = 1.0
            input_data['difficulty walking'] = 1.0
        if luka_mulut == 'Ya':
            input_data['blisters on mouth'] = 1.0
            input_data['sores on mouth'] = 1.0

        df_input = pd.DataFrame([input_data], columns=kolom_fitur)
        df_input[fitur_numerik] = scaler.transform(df_input[fitur_numerik])
        
        prediksi = model_ann.predict(df_input.values.astype(np.float32))
        confidence_score = float(prediksi[0][0])
        
        status = "Positif" if confidence_score > 0.5 else "Negatif"
        
        return jsonify({
            "status": "success",
            "hasil_diagnosis": status,
            "confidence_score_ann": round(confidence_score * 100, 2)
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # --- KODE YANG DIPERBARUI UNTUK CLOUD ---
    # Mengambil port dari environment Render, atau gunakan 5000 jika di lokal
    port = int(os.environ.get("PORT", 5000))
    # host='0.0.0.0' wajib agar server cloud bisa mengekspos API ini ke publik
    app.run(host="0.0.0.0", port=port)