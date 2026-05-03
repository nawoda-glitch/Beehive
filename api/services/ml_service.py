import joblib
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# Load models
model_health = joblib.load(os.path.join(BASE_DIR, "model", "model_health.pkl"))
model_activity = joblib.load(os.path.join(BASE_DIR, "model", "model_activity.pkl"))
model_swarm = joblib.load(os.path.join(BASE_DIR, "model", "model_swarm.pkl"))

le_health = joblib.load(os.path.join(BASE_DIR, "model", "le_health.pkl"))
le_activity = joblib.load(os.path.join(BASE_DIR, "model", "le_activity.pkl"))
le_swarm = joblib.load(os.path.join(BASE_DIR, "model", "le_swarm.pkl"))

def db_to_normalized(db_val):
    """
    Converts raw dB (INMP441) to normalized [0.0, 1.0] sound energy.
    30 dB -> 0.0  |  65 dB -> 0.5  |  100 dB -> 1.0
    """
    return round(max(0.0, min(1.0, (float(db_val) - 30.0) / 70.0)), 4)

def calculate_risk(temp, humidity, sound_norm, outside):
    """sound_norm must be a pre-normalized [0.0, 1.0] value."""
    score = 0

    if temp < 32:
        score += (32 - temp) * 3
    elif temp > 36:
        score += (temp - 36) * 4

    if humidity < 50:
        score += (50 - humidity) * 1.5
    elif humidity > 75:
        score += (humidity - 75) * 1.5

    if sound_norm > 0.6:
        score += (sound_norm - 0.6) * 100
    elif sound_norm < 0.3:
        score += (0.3 - sound_norm) * 80

    if outside > 34:
        score += (outside - 34) * 2

    return round(min(score, 100), 2)


def get_reasons(temp, humidity, sound_norm, risk):
    reasons = []

    if temp > 36:
        reasons.append("High temperature detected")

    if humidity > 75:
        reasons.append("High humidity level")

    if sound_norm > 0.7:
        reasons.append("High bee activity")

    if risk > 60:
        reasons.append("Multiple stress conditions")

    if not reasons:
        reasons.append("All conditions optimal")

    return reasons


def predict_beehive(temp, humidity, sound_db, outside):
    """sound_db is the raw dB value from the INMP441 sensor."""
    # Normalize raw dB to [0.0, 1.0] before feeding ML models
    sound_norm = db_to_normalized(sound_db)
    sound_energy = sound_norm * 0.9

    X = np.array([[temp, humidity, sound_norm, sound_energy, outside]])

    health = le_health.inverse_transform(model_health.predict(X))[0]
    activity = le_activity.inverse_transform(model_activity.predict(X))[0]
    swarm = le_swarm.inverse_transform(model_swarm.predict(X))[0]

    risk = calculate_risk(temp, humidity, sound_norm, outside)
    reasons = get_reasons(temp, humidity, sound_norm, risk)

    return {
        "health": health,
        "activity": activity,
        "swarm": swarm,
        "risk": risk,
        "reasons": reasons
    }