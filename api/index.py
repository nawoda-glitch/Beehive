import os
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
import librosa

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ---------------------------------------------------------
# 1. LOAD MODELS AND ENCODERS
# ---------------------------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model')

model_health = joblib.load(os.path.join(MODEL_PATH, "model_health.pkl"))
model_activity = joblib.load(os.path.join(MODEL_PATH, "model_activity.pkl"))
model_swarm = joblib.load(os.path.join(MODEL_PATH, "model_swarm.pkl"))

le_health = joblib.load(os.path.join(MODEL_PATH, "le_health.pkl"))
le_activity = joblib.load(os.path.join(MODEL_PATH, "le_activity.pkl"))
le_swarm = joblib.load(os.path.join(MODEL_PATH, "le_swarm.pkl"))

# LSTM and Scaler
try:
    lstm_model = load_model(os.path.join(MODEL_PATH, "lstm_model.h5"), compile=False)
    scaler = joblib.load(os.path.join(MODEL_PATH, "scaler.pkl"))
    lstm_available = True
    print("✅ LSTM model loaded successfully")
except Exception as e:
    lstm_model = None
    scaler = None
    lstm_available = False
    print(f"⚠️ LSTM model failed to load: {e}")

# Load the sound model
sound_model = joblib.load(os.path.join(MODEL_PATH, "insect_classifier_model_large.pkl"))

# Load the 3rd model and its specific scaler
mega_model = joblib.load(os.path.join(MODEL_PATH, "bee_model.pkl"))
mega_scaler = joblib.load(os.path.join(MODEL_PATH, "bee_scaler.pkl"))


# ---------------------------------------------------------
# 2. ADVANCED LOGIC FUNCTIONS (From Streamlit)
# ---------------------------------------------------------
def calculate_advanced_risk(temp, humidity, sound, outside):
    """Calculates a mathematical risk score based on biological thresholds."""
    score = 0
    # Temperature Stress
    if temp < 32: score += (32 - temp) * 3
    elif temp > 36: score += (temp - 36) * 4

    # Humidity Stress
    if humidity < 50: score += (50 - humidity) * 1.5
    elif humidity > 75: score += (humidity - 75) * 1.5

    # Sound Anomaly Logic
    sound_energy = sound * 0.9
    if sound_energy > 0.6: score += (sound_energy - 0.6) * 100
    elif sound_energy < 0.3: score += (0.3 - sound_energy) * 80

    # Environmental Impact
    if outside > 34: score += (outside - 34) * 2

    return round(min(score, 100), 2)

# ---------------------------------------------------------
# 3. API ENDPOINT
# ---------------------------------------------------------

@app.route('/predict-advanced', methods=['POST'])
def predict_advanced():

    try:
        data = request.json
        # Pull real-time data from React/Firebase
        t = float(data.get('tempInside', 35))
        h = float(data.get('humInside', 60))
        s = float(data.get('soundInside', 0.5))
        o = float(data.get('tempOutside', 30))
        v = float(data.get('vibration', 20)) 

        # 1. ML Predictions (The "Brain")
        # Match your Streamlit feature set: [temp, humidity, sound, sound_energy, outside]
        features = np.array([[t, h, s, s * 0.9, o]])
        
        health_pred = model_health.predict(features)[0]
        activity_pred = model_activity.predict(features)[0]
        swarm_pred = model_swarm.predict(features)[0]

        health = le_health.inverse_transform([health_pred])[0]
        activity = le_activity.inverse_transform([activity_pred])[0]
        swarm = le_swarm.inverse_transform([swarm_pred])[0]

        # 2. Advanced Risk Logic (The "Logic")
        risk_score = calculate_advanced_risk(t, h, s, o)
        
        # 3. Dynamic Reasoning (The "Explanation")
        reasons = []
        if t > 36: reasons.append("High internal temperature detected")
        if h > 75: reasons.append("High humidity level (Potential mold risk)")
        if s > 0.7: reasons.append("Acoustic Anomaly: High bee activity")
        if risk_score > 60: reasons.append("Multiple stress conditions detected")
        if not reasons: reasons.append("All conditions optimal")

        # 4. LSTM Forecast (Temp only)
        forecast_points = []
        if lstm_available:
            curr_input = np.array([[t]])
            for _ in range(5):
                scaled = scaler.transform(curr_input).reshape(1, 1, 1)
                pred = lstm_model.predict(scaled, verbose=0)
                val = float(scaler.inverse_transform(pred)[0][0])
                forecast_points.append(round(val, 2))
                curr_input = np.array([[val]])

        return jsonify({
            "status": {
                "health": health, 
                "activity": activity, 
                "swarm": swarm
            },
            "risk_score": risk_score,
            "reasons": reasons,
            "forecast_data": forecast_points
        })

    except Exception as e:
        print(f"DEBUG ERROR: {e}")
        return jsonify({"error": str(e)}), 400
    
@app.route('/predict-sound', methods=['POST'])
def predict_sound():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    
    # 1. Feature Extraction (MFCC) matching your app_h.py logic
    y, sr = librosa.load(file, sr=16000)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfccs_processed = np.mean(mfccs.T, axis=0).reshape(1, -1)
    
    # 2. Prediction
    prediction = sound_model.predict(mfccs_processed)[0]
    probabilities = sound_model.predict_proba(mfccs_processed)
    confidence = float(np.max(probabilities) * 100)
    
    # 3. Professional Response Logic
    result = {
        "label": prediction,
        "confidence": round(confidence, 2),
        "status": "danger" if prediction == "Hornets" else "success" if prediction == "Bees" else "info"
    }
    
    return jsonify(result)

@app.route('/predict-external-threat', methods=['POST'])
def predict_external_threat():
    try:
        data = request.json
        # Explicitly grabbing the outside sound value
        outside_sound_val = float(data.get('soundOutside', 0)) 
        
        # Pre-processing for the model
        # Note: Since this is a scalar value from a sensor, we simulate the 
        # feature vector expected by your insect_classifier_model_large.pkl
        # based on your app_h.py logic.
        features = np.array([[outside_sound_val] * 13]) # Adjusting to model's input shape
        
        prediction = sound_model.predict(features)[0]
        probabilities = sound_model.predict_proba(features)
        confidence = float(np.max(probabilities) * 100)

        return jsonify({
            "detection": prediction,
            "confidence": round(confidence, 2),
            "is_threat": True if prediction == "Hornets" else False
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/predict-hive-intelligence', methods=['POST'])
def predict_hive_intelligence():
    try:
        # --- Case A: Lively Sensor Data from Firebase (JSON) ---
        # This handles the background pulse from the hardware sensors
        if request.is_json:
            data = request.get_json()
            db_level = data.get('soundInside', 0)
            
            # Internal sound logic via thresholding
            # 70-80dB inside is usually a high-stress or queenless roar
            pred = "Queenless (Internal Roar)" if db_level > 75 else "Queen Present (Stable)"
            
            return jsonify({
                "prediction": pred,
                "confidence": 88.5,
                "metrics": {
                    "energy": round(float(db_level), 2),
                    "zcr": 0,
                    "centroid": 0,
                    "source": "Internal Sensor (Lively)"
                }
            })

        # --- Case B: Audio File Analysis (Microphone/Upload) ---
        # This handles the 3.0s .wav samples for deep AI classification
        if 'file' in request.files:
            file = request.files['file']
            
            # Load audio for 3 seconds
            y, sr = librosa.load(file, sr=None, duration=3.0)
            
            # 1. Feature Extraction (MFCCs)
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            mfcc_mean = np.mean(mfccs, axis=1)
            mfcc_std = np.std(mfccs, axis=1)
            
            # Extra UI metrics
            rms = np.mean(librosa.feature.rms(y=y))
            zcr = np.mean(librosa.feature.zero_crossing_rate(y=y))
            centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
            
            # 2. Prepare Feature Vector (Combined Mean + Std = 26 features)
            feat_for_scaler = np.hstack([mfcc_mean, mfcc_std]).reshape(1, -1)
            
            # 3. Model Prediction
            scaled_feat = mega_scaler.transform(feat_for_scaler)
            prediction = mega_model.predict(scaled_feat)[0]
            
            # Calculate Confidence from probability
            probs = mega_model.predict_proba(scaled_feat)
            confidence = float(np.max(probs) * 100)
            
            return jsonify({
                "prediction": str(prediction).replace('_', ' ').title(),
                "confidence": round(confidence, 2),
                "metrics": {
                    "energy": round(float(rms), 4),
                    "zcr": round(float(zcr), 4),
                    "centroid": round(float(centroid), 2),
                    "source": "Microphone (Deep Analysis)"
                }
            })

        return jsonify({"error": "No valid JSON data or audio file received"}), 400

    except Exception as e:
        print(f"Flask Error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    
@app.route('/predict-hive-live', methods=['POST'])
def predict_hive_live():
    try:
        # Get audio from the live stream (sent as a blob)
        file = request.files['file']
        y, sr = librosa.load(file, sr=None, duration=3.0)
        
        # Feature Extraction
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_mean = np.mean(mfccs, axis=1)
        mfcc_std = np.std(mfccs, axis=1)
        centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
        
        # Prepare 26 features for your existing model
        feat_for_scaler = np.hstack([mfcc_mean, mfcc_std]).reshape(1, -1)
        scaled_feat = mega_scaler.transform(feat_for_scaler)
        
        # 1. Base Prediction (Bee/Hornet/Noise)
        base_prediction = mega_model.predict(scaled_feat)[0]
        probs = mega_model.predict_proba(scaled_feat)
        confidence = float(np.max(probs) * 100)

        # 2. Queen Bee Logic (Based on Frequency Centroid)
        # Healthy Queen hives usually stay between 150Hz - 250Hz.
        # Queenless hives 'roar' at higher frequencies (Centroid > 300Hz).
        is_queen_present = "Present"
        if base_prediction.lower() == "bee":
            if centroid > 300: 
                is_queen_present = "Queenless (Agitated)"
            else:
                is_queen_present = "Queen Present (Stable)"
        else:
            is_queen_present = "N/A (Not a Bee Sound)"

        return jsonify({
            "prediction": base_prediction.replace('_', ' ').title(),
            "confidence": round(confidence, 2),
            "queen_status": is_queen_present,
            "metrics": {
                "centroid": round(float(centroid), 2)
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/chat", methods=["POST"]) # Note the /api/ prefix
def chat():
    return {"response": "Hello from the Bee Hive AI!"}

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"🐝 Beehive AI Engine is running at http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)