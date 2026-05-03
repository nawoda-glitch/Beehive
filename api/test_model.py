import joblib
import numpy as np
import os
import librosa

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model')
sound_model = joblib.load(os.path.join(MODEL_PATH, "insect_classifier_model_large.pkl"))

print("Model classes:", sound_model.classes_)

def predict_audio(y, sr):
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfccs_processed = np.mean(mfccs.T, axis=0).reshape(1, -1)
    pred = sound_model.predict(mfccs_processed)[0]
    proba = sound_model.predict_proba(mfccs_processed)
    return pred, proba

# Test 1: Random noise
y_noise = np.random.randn(16000 * 3)
pred, proba = predict_audio(y_noise, 16000)
print(f"Noise prediction: {pred}, proba: {proba}")

# Test 2: Low frequency tone (150 Hz - Bee like)
t = np.linspace(0, 3, 16000 * 3)
y_low = np.sin(2 * np.pi * 150 * t)
pred, proba = predict_audio(y_low, 16000)
print(f"Low tone (150Hz) prediction: {pred}, proba: {proba}")

# Test 3: Mid frequency tone (300 Hz - Agitated)
y_mid = np.sin(2 * np.pi * 300 * t)
pred, proba = predict_audio(y_mid, 16000)
print(f"Mid tone (300Hz) prediction: {pred}, proba: {proba}")

# Test 4: High frequency noise / static
y_high = np.sin(2 * np.pi * 2000 * t) + np.random.randn(16000 * 3)*0.1
pred, proba = predict_audio(y_high, 16000)
print(f"High tone (2000Hz) prediction: {pred}, proba: {proba}")
