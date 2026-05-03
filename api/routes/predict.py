from flask import Blueprint, request, jsonify
from services.data_service import get_sensor_data
from services.ml_service import predict_beehive

predict_bp = Blueprint("predict", __name__)

@predict_bp.route("/predict", methods=["GET", "POST"])
def predict():

    # -------------------------
    # 🎤 FILE UPLOAD (existing)
    # -------------------------
    if request.method == "POST":
        file = request.files.get("file")

        if not file:
            return jsonify({"error": "No file"}), 400

        # your existing audio prediction logic here
        return jsonify({
            "prediction": "queen_present",
            "confidence": 92
        })

    # -------------------------
    # 📡 LIVE ML FROM FIREBASE
    # -------------------------
    sensor = get_sensor_data()

    humidity = sensor.get("humidity", 0)
    sound = sensor.get("sound", 0)

    # temporary values
    temp = 34
    outside = 30

    result = predict_beehive(temp, humidity, sound, outside)

    return jsonify({
        "humidity": humidity,
        "sound": sound,
        "prediction": result
    })