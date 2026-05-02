import requests

FIREBASE_URL = "https://bee-live-fdc15-default-rtdb.asia-southeast1.firebasedatabase.app/.json"

def get_sensor_data():
    try:
        res = requests.get(FIREBASE_URL)
        data = res.json()

        return {
            "humidity": data.get("inside_humidity", 0),
            "sound": data.get("inside_sound", 0),
            "vibration": int(data.get("vibration", 0)),
            
            # fake for now
            "temperature": 34,
            "outside_temp": data.get("outside_humidity", 30)
        }

    except Exception as e:
        print("Firebase error:", e)
        return {}