from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from io import BytesIO
import pickle
import pandas as pd
import sqlite3
import datetime

app = Flask(__name__)
CORS(app)

# Bypass ngrok browser warning
@app.after_request
def add_ngrok_header(response):
    response.headers['ngrok-skip-browser-warning'] = 'true'
    return response

# ── Custom objects (harus didefinisikan sebelum load model) ───────────────────
@tf.keras.utils.register_keras_serializable()
class FeatureGatingLayer(tf.keras.layers.Layer):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def build(self, input_shape):
        n = input_shape[-1]
        self.gate = self.add_weight(shape=(n,), name="gate_weights", initializer="ones", trainable=True)
        super().build(input_shape)

    def call(self, x):
        return x * tf.nn.sigmoid(self.gate)

    def get_config(self):
        return super().get_config()


@tf.keras.utils.register_keras_serializable()
class WeightedBCELoss(tf.keras.losses.Loss):
    def __init__(self, pos_weight=3.6, **kwargs):
        super().__init__(**kwargs)
        self.pos_weight = pos_weight

    def call(self, y_true, y_pred):
        y_pred  = tf.clip_by_value(y_pred, 1e-7, 1 - 1e-7)
        weights = y_true * self.pos_weight + (1 - y_true)
        bce     = -y_true * tf.math.log(y_pred) - (1 - y_true) * tf.math.log(1 - y_pred)
        return tf.reduce_mean(weights * bce)

    def get_config(self):
        cfg = super().get_config()
        cfg["pos_weight"] = self.pos_weight
        return cfg


CUSTOM_OBJECTS = {"FeatureGatingLayer": FeatureGatingLayer, "WeightedBCELoss": WeightedBCELoss}

# ── Load model & artefak ───────────────────────────────────────────────────────
cnn_model = tf.keras.models.load_model("fmd_cnn_best_model.h5")
ann_model = tf.keras.models.load_model("model_pmk_ann.h5", custom_objects=CUSTOM_OBJECTS)

with open('kolom_fitur_pmk.pkl', 'rb') as f:
    kolom_fitur = pickle.load(f)

# Load best threshold dari hasil tuning (default 0.5 kalau file belum ada)
try:
    with open('best_threshold.pkl', 'rb') as f:
        best_threshold = pickle.load(f)
    print(f'Best threshold loaded: {best_threshold:.2f}')
except FileNotFoundError:
    best_threshold = 0.5
    print('best_threshold.pkl tidak ditemukan, pakai default 0.5')

# ── Scaling constants ──────────────────────────────────────────────────────────
AGE_MEAN,  AGE_STD  = 7.99606449,  4.30423675
TEMP_MEAN, TEMP_STD = 102.27233719, 1.40455944

# ── Adapter: camelCase frontend → nama kolom CSV ───────────────────────────────
FIELD_MAP = {
    'age':                      'Age',
    'temperature':              'Temperature',
    'blistersOnGums':           'blisters on gums',
    'blistersOnMouth':          'blisters on mouth',
    'blistersOnTongue':         'blisters on tongue',
    'soresOnGums':              'sores on gums',
    'soresOnMouth':             'sores on mouth',
    'soresOnTongue':            'sores on tongue',
    'blistersOnHooves':         'blisters on hooves',
    'soresOnHooves':            'sores on hooves',
    'difficultyWalking':        'difficulty walking',
    'lameness':                 'lameness',
    'cracklingSound':           'crackling sound',
    'lossOfAppetite':           'loss of appetite',
    'fatigue':                  'fatigue',
    'depression':               'depression',
    'chills':                   'chills',
    'sweats':                   'sweats',
    'shortnessOfBreath':        'shortness of breath',
    'chestDiscomfort':          'chest discomfort',
    'painlessLumps':            'painless lumps',
    'swellingInNeck':           'swelling in neck',
    'swellingInAbdomen':        'swelling in abdomen',
    'swellingInLimb':           'swelling in limb',
    'swellingInExtremities':    'swelling in extremities',
    'swellingInMuscle':         'swelling in muscle',
}

BOOLEAN_KEYS = [k for k in FIELD_MAP if k not in ('age', 'temperature')]

def build_ann_input(form):
    row = {col: 0.0 for col in kolom_fitur}
    for fe_key, csv_col in FIELD_MAP.items():
        try:
            row[csv_col] = float(form.get(fe_key, '0'))
        except (ValueError, TypeError):
            row[csv_col] = 0.0

    row['Temperature'] = row['Temperature'] * 9/5 + 32

    df = pd.DataFrame([row]).reindex(columns=kolom_fitur, fill_value=0.0)
    df['Age']         = (df['Age']         - AGE_MEAN)  / AGE_STD
    df['Temperature'] = (df['Temperature'] - TEMP_MEAN) / TEMP_STD
    return df

# ── Database ───────────────────────────────────────────────────────────────────
DB_PATH = 'riwayat_pmk.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS riwayat (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            tanggal          TEXT    NOT NULL,
            hasil_prediksi   TEXT    NOT NULL,
            confidence_score REAL    NOT NULL,
            cnn_prob_sakit   REAL    NOT NULL,
            ann_prob_sakit   REAL    NOT NULL,
            suhu_input       REAL,
            age_input        REAL,
            jumlah_gejala    INTEGER
        )
    ''')
    conn.commit()
    conn.close()

init_db()

def simpan_riwayat(hasil, confidence, cnn_prob, ann_prob, suhu, age, jumlah_gejala):
    conn = sqlite3.connect(DB_PATH)
    conn.execute('''
        INSERT INTO riwayat (tanggal,hasil_prediksi,confidence_score,cnn_prob_sakit,ann_prob_sakit,suhu_input,age_input,jumlah_gejala)
        VALUES (?,?,?,?,?,?,?,?)
    ''', (datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'), hasil, confidence, cnn_prob, ann_prob, suhu, age, jumlah_gejala))
    conn.commit()
    conn.close()

# ── POST /predict ──────────────────────────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict_pmk():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Tidak ada file gambar yang diunggah'}), 400

        file = request.files['file']

        # CNN — label: 0=Sakit, 1=Sehat → balik
        img       = image.load_img(BytesIO(file.read()), target_size=(224, 224))
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        cnn_raw        = float(cnn_model.predict(img_array)[0][0])
        cnn_prob_sakit = 1.0 - cnn_raw

        # ANN — label: 1=Sakit, 0=Sehat → tidak dibalik
        df_input       = build_ann_input(request.form)
        ann_raw        = float(ann_model.predict(df_input)[0][0])
        ann_prob_sakit = ann_raw

        # Late fusion — ANN sebagai penentu utama, CNN sebagai bobot tambahan
        # ANN punya range sempit (~0.47-0.54), CNN punya range lebar (0-1)
        # Normalisasi ANN ke range 0-1 relatif terhadap threshold
        ann_normalized = (ann_prob_sakit - 0.47) / (0.54 - 0.47)
        ann_normalized = float(np.clip(ann_normalized, 0.0, 1.0))
        # Weighted fusion: ANN 70%, CNN 30%
        skor_akhir   = (ann_normalized * 0.7) + (cnn_prob_sakit * 0.3)
        status_akhir = 'Terindikasi PMK' if ann_prob_sakit >= best_threshold else 'Sapi Sehat'

        jumlah_gejala = sum(1 for k in BOOLEAN_KEYS if request.form.get(k, '0') == '1')
        suhu_input    = float(request.form.get('temperature', 0))
        age_input     = float(request.form.get('age', 0))

        simpan_riwayat(status_akhir, round(skor_akhir*100,2),
                       round(cnn_prob_sakit*100,2), round(ann_prob_sakit*100,2),
                       suhu_input, age_input, jumlah_gejala)

        return jsonify({
            'status':           'success',
            'hasil_prediksi':   status_akhir,
            'confidence_score': round(skor_akhir * 100, 2),
            'detail': {
                'cnn_prob_sakit': round(cnn_prob_sakit * 100, 2),
                'ann_prob_sakit': round(ann_prob_sakit * 100, 2),
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ── GET /riwayat ───────────────────────────────────────────────────────────────
@app.route('/riwayat', methods=['GET'])
def get_riwayat():
    try:
        conn   = sqlite3.connect(DB_PATH)
        cursor = conn.execute('''
            SELECT id,tanggal,hasil_prediksi,confidence_score,
                   cnn_prob_sakit,ann_prob_sakit,suhu_input,age_input,jumlah_gejala
            FROM riwayat ORDER BY id DESC LIMIT 50
        ''')
        rows = cursor.fetchall()
        conn.close()
        data = [{'id':r[0],'tanggal':r[1],'hasil_prediksi':r[2],'confidence_score':r[3],
                 'cnn_prob_sakit':r[4],'ann_prob_sakit':r[5],'suhu_input':r[6],
                 'age_input':r[7],'jumlah_gejala':r[8]} for r in rows]
        return jsonify({'status': 'success', 'data': data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ── DELETE /riwayat/<id> ───────────────────────────────────────────────────────
@app.route('/riwayat/<int:id>', methods=['DELETE'])
def delete_riwayat(id):
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.execute('DELETE FROM riwayat WHERE id = ?', (id,))
        conn.commit(); conn.close()
        return jsonify({'status': 'success', 'message': f'Riwayat #{id} dihapus'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)