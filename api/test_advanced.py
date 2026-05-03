import joblib
import numpy as np
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model')
model_health = joblib.load(os.path.join(MODEL_PATH, "model_health.pkl"))
model_activity = joblib.load(os.path.join(MODEL_PATH, "model_activity.pkl"))
model_swarm = joblib.load(os.path.join(MODEL_PATH, "model_swarm.pkl"))
le_health = joblib.load(os.path.join(MODEL_PATH, "le_health.pkl"))
le_activity = joblib.load(os.path.join(MODEL_PATH, "le_activity.pkl"))
le_swarm = joblib.load(os.path.join(MODEL_PATH, "le_swarm.pkl"))

def test_engine(t, h, raw_db, o):
    sound_energy = raw_db * 0.9
    features = np.array([[t, h, raw_db, sound_energy, o]])
    
    health = le_health.inverse_transform([model_health.predict(features)[0]])[0]
    activity = le_activity.inverse_transform([model_activity.predict(features)[0]])[0]
    swarm = le_swarm.inverse_transform([model_swarm.predict(features)[0]])[0]
    
    print(f"T:{t} H:{h} DB:{raw_db} -> Health: {health}, Activity: {activity}, Swarm: {swarm}")

test_engine(35, 60, 50, 30) # Default normal
test_engine(38, 80, 80, 35) # Hot & loud
test_engine(30, 40, 35, 25) # Cold & quiet
