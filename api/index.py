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
    print("[OK] LSTM model loaded successfully")
except Exception as e:
    lstm_model = None
    scaler = None
    lstm_available = False
    print(f"[WARN] LSTM model failed to load: {e}")

# Load the sound model
sound_model = joblib.load(os.path.join(MODEL_PATH, "insect_classifier_model_large.pkl"))

# Load the 3rd model and its specific scaler
mega_model = joblib.load(os.path.join(MODEL_PATH, "bee_model.pkl"))
mega_scaler = joblib.load(os.path.join(MODEL_PATH, "bee_scaler.pkl"))


# ---------------------------------------------------------
# 2. HELPER: dB Normalizer
# ---------------------------------------------------------
def db_to_normalized(db_val):
    """
    Converts a raw dB reading from the INMP441 sensor into a [0.0, 1.0]
    normalized sound energy value that matches ML model training data.
    Mapping: 30 dB -> 0.0  |  65 dB -> 0.5  |  100 dB -> 1.0
    """
    return round(max(0.0, min(1.0, (float(db_val) - 30.0) / 70.0)), 4)

# ---------------------------------------------------------
# 3. ADVANCED LOGIC FUNCTIONS
# ---------------------------------------------------------
def calculate_advanced_risk(temp, humidity, sound_norm, outside):
    """
    Calculates a mathematical risk score based on biological thresholds.
    sound_norm must be a normalized [0.0, 1.0] value.
    """
    score = 0
    # Temperature Stress
    if temp < 32: score += (32 - temp) * 3
    elif temp > 36: score += (temp - 36) * 4

    # Humidity Stress
    if humidity < 50: score += (50 - humidity) * 1.5
    elif humidity > 75: score += (humidity - 75) * 1.5

    # Sound Anomaly Logic (expects normalized 0-1)
    sound_energy = sound_norm * 0.9
    if sound_energy > 0.6: score += (sound_energy - 0.6) * 100
    elif sound_energy < 0.3: score += (0.3 - sound_energy) * 80

    # Environmental Impact
    if outside > 34: score += (outside - 34) * 2

    return round(min(score, 100), 2)

# ---------------------------------------------------------
# 3. API ENDPOINT
# ---------------------------------------------------------

@app.route('/api/predict-advanced', methods=['POST'])
def predict_advanced():

    try:
        data = request.json
        # Pull real-time data from React/Firebase
        t = float(data.get('tempInside', 35))
        h = float(data.get('humInside', 60))
        raw_db = float(data.get('soundInside', 50))  # Raw dB from INMP441
        o = float(data.get('tempOutside', 30))
        v = float(data.get('vibration', 20))

        # BUG 1 FIX: Normalize raw dB to [0.0, 1.0] before feeding ML models
        # INMP441 sends values like 45 dB, 72 dB — models trained on 0-1 scale
        s_norm = db_to_normalized(raw_db)
        sound_energy = s_norm * 0.9

        # 1. Biological Expert Rules (Replacing broken ML Models)
        # Health Logic
        if t < 33 or t > 37 or h < 45 or h > 75:
            health = "Warning"
            if t > 39 or t < 30: health = "Critical"
        else:
            health = "Normal"
            
        # Activity Logic
        if raw_db > 65 or v > 40:
            activity = "High"
        elif raw_db > 45 or v > 20:
            activity = "Normal"
        else:
            activity = "Low"
            
        # Swarm Logic
        if t >= 34 and t <= 36 and raw_db > 70 and v > 50:
            swarm = "High"
        elif raw_db > 60:
            swarm = "Medium"
        else:
            swarm = "Low"

        # 2. Advanced Risk Logic — BUG 7 FIX: pass normalized sound, not raw dB
        risk_score = calculate_advanced_risk(t, h, s_norm, o)
        
        # 3. Dynamic Reasoning
        reasons = []
        if t > 36: reasons.append("High internal temperature detected")
        if h > 75: reasons.append("High humidity level (Potential mold risk)")
        if s_norm > 0.7: reasons.append(f"Acoustic Anomaly: High activity detected ({raw_db:.1f} dB)")
        if risk_score > 60: reasons.append("Multiple stress conditions detected")
        if not reasons: reasons.append("All conditions optimal")

        # 4. LSTM Forecast (Temp only) - 5 Days Prediction
        forecast_points = []
        if lstm_available:
            curr_input = np.array([[t]])
            for i in range(1, 121):  # 120 hours = 5 days
                scaled = scaler.transform(curr_input).reshape(1, 1, 1)
                pred = lstm_model.predict(scaled, verbose=0)
                val = float(scaler.inverse_transform(pred)[0][0])
                
                # Save data point every 24 hours (1 day)
                if i % 24 == 0:
                    forecast_points.append({
                        "day": f"Day {i // 24}",
                        "temp": round(val, 2)
                    })
                
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
    
import tempfile

@app.route('/api/predict-sound', methods=['POST'])
def predict_sound():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    
    # Save the file to a temporary location on disk with a unique name
    temp_fd, temp_path = tempfile.mkstemp(suffix=".webm")
    os.close(temp_fd) # Close file descriptor as librosa will open it
    file.save(temp_path)
    
    try:
        # 1. Feature Extraction (MFCC & Centroid) 
        y, sr = librosa.load(temp_path, sr=16000)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfccs_processed = np.mean(mfccs.T, axis=0).reshape(1, -1)
        centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
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
    
    # 3. Confidence & Biological Gate Logic for Hornets
    if prediction == "Hornets":
        if confidence < 85.0:
            prediction = "noise"  # Downgrade to noise if not highly confident
        elif centroid > 500:
            prediction = "noise"  # High pitch (like human voice/feedback) is not a hornet
    
    result = {
        "label": prediction,
        "confidence": round(confidence, 2),
        "status": "danger" if prediction == "Hornets" else "success" if prediction == "Bees" else "info"
    }
    
    return jsonify(result)

@app.route('/api/predict-external-threat', methods=['POST'])
def predict_external_threat():
    """
    FIX: The live sensor only provides a dB scalar. We cannot classify insects 
    using only dB. We now map the dB to a general environmental state to prevent
    fake Hornet alarms during panel presentations.
    """
    try:
        data = request.json
        outside_sound_val = float(data.get('soundOutside', 0))
        vibration = float(data.get('vibration', 0))
        s_norm = db_to_normalized(outside_sound_val)

        # Smart Realtime Detection using dB + Vibration
        if outside_sound_val > 75 and vibration > 50:
            prediction = "Hornets"
            is_threat = True
            confidence = min(80 + (outside_sound_val - 75) + (vibration - 50), 99.0)
        elif outside_sound_val > 45 and vibration > 20:
            prediction = "Bees"
            is_threat = False
            confidence = 85.0
        elif outside_sound_val > 75:
            prediction = "Ambient Noise"
            is_threat = False
            confidence = 90.0
        else:
            prediction = "Quiet"
            is_threat = False
            confidence = min((1.0 - s_norm) * 95, 95.0)

        return jsonify({
            "detection": prediction,
            "confidence": round(confidence, 2),
            "is_threat": is_threat,
            "db_level": outside_sound_val,
            "normalized": s_norm,
            "source": "Sensor Estimate (dB-based)"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/predict-hive-intelligence', methods=['POST'])
def predict_hive_intelligence():
    try:
        # --- Case A: Live Sensor Data from Firebase (JSON) ---
        # BUG 3 FIX: Use normalized dB, dynamic confidence, and temperature co-factor.
        # Cannot run MFCC analysis on scalar values, so we use biologically-calibrated
        # thresholds with confidence based on distance from decision boundary.
        if request.is_json:
            import math
            data = request.get_json()
            db_level = float(data.get('soundInside', 0))
            temp = float(data.get('temperature', 35))
            s_norm = db_to_normalized(db_level)

            # Queen detection: queenless hives roar louder (high dB = high s_norm)
            # Decision boundary at ~0.65 normalized (~75 dB)
            # Confidence = how far from boundary (0.5 = boundary = 50% conf)
            boundary = 0.65
            distance = abs(s_norm - boundary)
            base_confidence = 50.0 + (distance / 0.35) * 45.0  # scales 50%->95%
            
            # Temperature co-factor: stressed colony (temp > 36) increases queenless signal
            if temp > 36.5 and s_norm > 0.55:
                base_confidence = min(base_confidence + 5.0, 97.0)

            if s_norm >= boundary:
                pred = "Queenless (Internal Roar)"
            else:
                pred = "Queen Present (Stable)"

            return jsonify({
                "prediction": pred,
                "confidence": round(min(base_confidence, 97.0), 2),
                "metrics": {
                    "energy": round(db_level, 2),
                    "zcr": 0,
                    "centroid": 0,
                    "source": "Internal Sensor (Live dB)"
                }
            })

        # --- Case B: Audio File Analysis (Microphone/Upload) ---
        # This handles the 3.0s .wav samples for deep AI classification
        if 'file' in request.files:
            file = request.files['file']
            
            # Save the file to a temporary location on disk
            temp_fd, temp_path = tempfile.mkstemp(suffix=".webm")
            os.close(temp_fd)
            file.save(temp_path)
            
            try:
                # Load audio for 3 seconds
                y, sr = librosa.load(temp_path, sr=None, duration=3.0)
            except Exception as e:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                return jsonify({"error": f"Internal audio processing failed: {e}"}), 400
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            
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
    
    
@app.route('/api/predict-hive-live', methods=['POST'])
def predict_hive_live():
    try:
        # BUG 4 FIX: Save to tempfile before loading — librosa cannot directly
        # open a Flask FileStorage object on Windows (no file path available).
        file = request.files['file']
        temp_fd, temp_path = tempfile.mkstemp(suffix=".webm")
        os.close(temp_fd)
        file.save(temp_path)

        try:
            y, sr = librosa.load(temp_path, sr=None, duration=3.0)
        except Exception as e:
            if os.path.exists(temp_path): os.remove(temp_path)
            return jsonify({"error": f"Audio load failed: {e}"}), 400
        finally:
            if os.path.exists(temp_path): os.remove(temp_path)
        
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
    print(f"[BEE] Beehive AI Engine is running at http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)