from flask import Blueprint, request, jsonify
from services.data_service import get_sensor_data
from services.ml_service import predict_beehive

chatbot_bp = Blueprint("chatbot", __name__)

@chatbot_bp.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        user_message = data.get("message", "").lower()

        # ✅ GET REAL DATA FROM FIREBASE
        sensor_data = get_sensor_data()

        humidity = sensor_data.get("humidity", 0)
        sound = sensor_data.get("sound", 0)
        vibration = int(sensor_data.get("vibration", 0))

        # ⚠️ Your Firebase doesn't have temperature → use safe defaults
        temperature = 34
        outside_temp = 30

        # 🤖 ML PREDICTION
        ml_result = predict_beehive(temperature, humidity, sound, outside_temp)

        reply = ""

        # -----------------------------
        # 🧠 RULE-BASED DECISION SYSTEM
        # -----------------------------

        # Humidity
        if humidity > 75:
            reply += "⚠ High humidity detected. Risk of fermentation.\n"
        elif humidity < 40:
            reply += "⚠ Low humidity may affect colony health.\n"
        else:
            reply += "✅ Humidity level is normal.\n"

        # Sound
        if sound < 0.2:
            reply += "⚠ Low bee activity detected.\n"
        elif sound > 0.8:
            reply += "⚠ High agitation detected. Possible disturbance.\n"
        else:
            reply += "✅ Bee activity is normal.\n"

        # Vibration
        if vibration == 1:
            reply += "🚨 Vibration detected! Possible intrusion or disturbance.\n"
        else:
            reply += "✅ No abnormal vibration detected.\n"

        # -----------------------------
        # 📊 CURRENT DATA
        # -----------------------------
        reply += "\n📊 Current Data:"
        reply += f"\n💧 Humidity: {humidity}%"
        reply += f"\n🔊 Sound Level: {sound}"
        reply += f"\n📳 Vibration: {vibration}"

        # -----------------------------
        # 🤖 ML OUTPUT (VERY IMPORTANT)
        # -----------------------------
        reply += "\n\n🤖 AI Prediction:"
        reply += f"\n🐝 Health: {ml_result['health']}"
        reply += f"\n📊 Activity: {ml_result['activity']}"
        reply += f"\n🌪 Swarming Risk: {ml_result['swarm']}"
        reply += f"\n🔥 Risk Level: {ml_result['risk']}%"

        # -----------------------------
        # 🤖 USER INTENT HANDLING
        # -----------------------------

        if "safe" in user_message:
            if ml_result["risk"] > 60 or vibration == 1:
                reply += "\n🚨 Overall: Hive is NOT safe. Immediate action required."
            else:
                reply += "\n✅ Overall: Hive condition is stable."

        elif "humidity" in user_message:
            reply += f"\n💧 Current humidity is {humidity}%."

        elif "sound" in user_message:
            reply += f"\n🔊 Current sound level is {sound}."

        elif "vibration" in user_message:
            reply += f"\n📳 Vibration status: {vibration}"

        elif "recommend" in user_message or "what should i do" in user_message:
            if ml_result["risk"] > 70:
                reply += "\n💡 Recommendation: Immediate inspection required. Reduce stress conditions."
            elif humidity > 75:
                reply += "\n💡 Recommendation: Improve ventilation to reduce moisture."
            elif vibration == 1:
                reply += "\n💡 Recommendation: Check for predators or external disturbance."
            elif sound < 0.2:
                reply += "\n💡 Recommendation: Inspect hive for queen issues or inactivity."
            else:
                reply += "\n💡 Hive conditions are stable. Maintain current setup."

        else:
            reply += "\n💡 Ask about hive safety, humidity, sound, or recommendations."

        return jsonify({"reply": reply})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"reply": f"Error: {str(e)}"}), 500