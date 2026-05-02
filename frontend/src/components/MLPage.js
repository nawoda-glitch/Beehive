import React, { useEffect, useState } from "react";
import { getPrediction } from "../services/api";

function MLPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getPrediction().then(res => setData(res));
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h2>🐝 AI Prediction Dashboard</h2>

      <h3>📊 Sensor Data</h3>
      <p>Humidity: {data.humidity}</p>
      <p>Sound: {data.sound}</p>
      <p>Vibration: {data.vibration}</p>

      <h3>🤖 ML Output</h3>
      <p>Health: {data.prediction.health}</p>
      <p>Activity: {data.prediction.activity}</p>
      <p>Swarm: {data.prediction.swarm}</p>
      <p>Risk: {data.prediction.risk}%</p>
    </div>
  );
}

export default MLPage;