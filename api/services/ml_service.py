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

def calculate_risk(temp, humidity, sound_energy, outside):
    score = 0

    if temp < 32:
        score += (32 - temp) * 3
    elif temp > 36:
        score += (temp - 36) * 4

    if humidity < 50:
        score += (50 - humidity) * 1.5
    elif humidity > 75:
        score += (humidity - 75) * 1.5

    if sound_energy > 0.6:
        score += (sound_energy - 0.6) * 100
    elif sound_energy < 0.3:
        score += (0.3 - sound_energy) * 80

    if outside > 34:
        score += (outside - 34) * 2

    return round(min(score, 100), 2)


def get_reasons(temp, humidity, sound, risk):
    reasons = []

    if temp > 36:
        reasons.append("High temperature detected")

    if humidity > 75:
        reasons.append("High humidity level")

    if sound > 0.7:
        reasons.append("High bee activity")

    if risk > 60:
        reasons.append("Multiple stress conditions")

    if not reasons:
        reasons.append("All conditions optimal")

    return reasons


def predict_beehive(temp, humidity, sound, outside):

    sound_energy = sound * 0.9

    X = np.array([[temp, humidity, sound, sound_energy, outside]])

    health = le_health.inverse_transform(model_health.predict(X))[0]
    activity = le_activity.inverse_transform(model_activity.predict(X))[0]
    swarm = le_swarm.inverse_transform(model_swarm.predict(X))[0]

    risk = calculate_risk(temp, humidity, sound_energy, outside)
    reasons = get_reasons(temp, humidity, sound, risk)

    return {
        "health": health,
        "activity": activity,
        "swarm": swarm,
        "risk": risk,
        "reasons": reasons
    }