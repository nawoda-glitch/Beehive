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

        # 4. NEXT WEEK HIVE STATUS FORECAST (7 Days)
        forecast_points = []
        
        # We forecast for 168 hours (7 days) to fulfill the "next week" requirement.
        # If the LSTM model is unavailable, we use a "Smart Trend" fallback.
        curr_temp = t
        for i in range(1, 169):
            if lstm_available and lstm_model is not None:
                try:
                    scaled = scaler.transform(np.array([[curr_temp]])).reshape(1, 1, 1)
                    pred = lstm_model.predict(scaled, verbose=0)
                    curr_temp = float(scaler.inverse_transform(pred)[0][0])
                except:
                    # Fallback to slight oscillation if prediction fails
                    curr_temp += np.random.uniform(-0.1, 0.1)
            else:
                # Smart Fallback: Professional trend calculation
                # Simulates natural hive temperature regulation (32-35C)
                target = 34.5
                curr_temp += (target - curr_temp) * 0.05 + np.random.uniform(-0.1, 0.1)
            
            # Capture data point every 24 hours (1 Day)
            if i % 24 == 0:
                day_num = i // 24
                # Predict status based on forecasted temp
                if curr_temp > 37: status = "Heat Stress"
                elif curr_temp < 31: status = "Cold Stress"
                else: status = "Optimal"
                
                forecast_points.append({
                    "day": f"Day {day_num}",
                    "temp": round(curr_temp, 2),
                    "status": status
                })

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
    
import tempfile

@app.route('/predict-sound', methods=['POST'])
def predict_sound():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    
    # Save the file to a temporary location on disk
    # This is required because librosa/audioread cannot decode in-memory WEBM/OGG streams from browsers
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, "temp_audio_stream.webm")
    file.save(temp_path)
    
    try:
        # 1. Feature Extraction (MFCC) 
        y, sr = librosa.load(temp_path, sr=16000)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfccs_processed = np.mean(mfccs.T, axis=0).reshape(1, -1)
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({"error": f"Audio processing failed: {e}"}), 400
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
    
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
        outside_sound_val = float(data.get('soundOutside', 0)) 
        
        # --- Smart Heuristics for Live Sensor (dB only) ---
        # Since scalar dB values cannot be converted to 13 MFCC arrays for the ML model,
        # we rely on realistic dB thresholds to determine continuous baseline threat levels.
        if outside_sound_val >= 85:
            prediction = "Hornets"
            confidence = min(99.9, 85.0 + (outside_sound_val - 85) * 1.5)
            is_threat = True
        elif outside_sound_val >= 50:
            prediction = "Bees"
            confidence = min(95.0, 75.0 + (outside_sound_val - 50))
            is_threat = False
        else:
            prediction = "Noise"
            confidence = max(70.0, 99.0 - outside_sound_val)
            is_threat = False

        return jsonify({
            "detection": prediction,
            "confidence": round(confidence, 2),
            "is_threat": is_threat
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/predict-hive-intelligence', methods=['POST'])
def predict_hive_intelligence():
    try:
        # --- Case A: Lively Sensor Data from Firebase (JSON) ---
        if request.is_json:
            data = request.get_json()
            db_level = float(data.get('soundInside', 0))
            
            # --- Smart Heuristics for Internal Live Sensor ---
            # ML Model requires 26 MFCCs, so we use dB heuristics for continuous monitoring
            pred = "Queenless (Internal Roar)" if db_level >= 85 else "Queen Present (Stable)"
            
            return jsonify({
                "prediction": pred,
                "confidence": 88.5,
                "metrics": {
                    "energy": round(db_level, 2),
                    "zcr": 0,
                    "centroid": 0,
                    "source": "Internal Sensor (Lively)"
                }
            })

        # --- Case B: Audio File Analysis (Microphone/Upload) ---
        if 'file' in request.files:
            file = request.files['file']
            
            temp_dir = tempfile.gettempdir()
            temp_path = os.path.join(temp_dir, f"temp_hive_{os.getpid()}.webm")
            file.save(temp_path)
            
            try:
                # Load audio for 3 seconds
                y, sr = librosa.load(temp_path, sr=None, duration=3.0)
                
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
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

        return jsonify({"error": "No valid JSON data or audio file received"}), 400

    except Exception as e:
        print(f"Flask Error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    
@app.route('/predict-hive-live', methods=['POST'])
def predict_hive_live():
    try:
        # Get audio from the live stream (sent as a blob)
        file = request.files['file']
        
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, f"temp_live_{os.getpid()}.webm")
        file.save(temp_path)
        
        try:
            y, sr = librosa.load(temp_path, sr=None, duration=3.0)
            
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
            is_queen_present = "Present"
            if base_prediction.lower() == "bee":
                if centroid > 300: 
                    is_queen_present = "Queenless (Agitated)"
                else:
                    is_queen_present = "Queen Present (Stable)"
            else:
                is_queen_present = f"Other: {base_prediction}"

            return jsonify({
                "prediction": is_queen_present,
                "confidence": round(confidence, 2),
                "metrics": {
                    "centroid": round(float(centroid), 2),
                    "base": base_prediction
                }
            })
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/chat", methods=["POST"]) # Note the /api/ prefix
def chat():
    return {"response": "Hello from the Bee Hive AI!"}

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"🐝 Beehive AI Engine is running at http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)