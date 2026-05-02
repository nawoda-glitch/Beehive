import React from 'react';

const Card = ({ title, value, color }) => (
  <div style={{
    background: color, color: "white", padding: "20px", borderRadius: "12px",
    minWidth: "160px", flex: "1", textAlign: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  }}>
    <h4 style={{ margin: 0, opacity: 0.9, fontSize: "0.9rem" }}>{title}</h4>
    <h2 style={{ margin: "10px 0 0 0" }}>{value}</h2>
  </div>
);

const Cards = ({ data }) => {
  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
      gap: "15px", 
      marginBottom: "30px" 
    }}>
      {/* Temperature Group */}
      <Card title="Temp Inside" value={`${data.tempInside}°C`} color="#ff6b6b" />
      <Card title="Temp Outside" value={`${data.tempOutside}°C`} color="#ffa94d" />

      {/* Humidity Group */}
      <Card title="Hum Inside" value={`${data.humInside}%`} color="#4dabf7" />
      <Card title="Hum Outside" value={`${data.humOutside}%`} color="#74c0fc" />

      {/* Sound Group */}
      <Card title="Sound Inside" value={`${data.soundInside} dB`} color="#845ef7" />
      <Card title="Sound Outside" value={`${data.soundOutside} dB`} color="#9775fa" />
    </div>
  );
};

export default Cards;