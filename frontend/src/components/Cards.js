import React from 'react';

const Card = ({ title, value, isGold }) => (
  <div 
    className={`bee-card ${isGold ? 'gold-glow' : ''}`} // Add this line
    style={{
      /* Keep your existing inline styles, CSS will override the background */
      padding: "20px", borderRadius: "12px",
      minWidth: "160px", flex: "1", textAlign: "center"
    }}
  >
    <h4 style={{ margin: 0, opacity: 0.7, fontSize: "0.8rem", textTransform: 'uppercase' }}>{title}</h4>
    <h2 style={{ margin: "10px 0 0 0" }}>{value}</h2>
  </div>
);

const Cards = ({ data }) => {
  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", 
      gap: "20px",
      maxWidth: "1200px",
      margin: "0 auto"
    }}>
      {/* Temperature Group */}
      <Card title="Temp Inside" value={`${data.tempInside}°C`} icon="🌡️" isGold={true} />
      <Card title="Temp Outside" value={`${data.tempOutside}°C`} icon="☁️" isGold={false} />

      {/* Humidity Group */}
      <Card title="Hum Inside" value={`${data.humInside}%`} icon="💧" isGold={true} />
      <Card title="Hum Outside" value={`${data.humOutside}%`} icon="🌊" isGold={false} />

      {/* Sound Group */}
      <Card title="Sound Inside" value={`${data.soundInside} dB`} icon="🐝" isGold={true} />
      <Card title="Sound Outside" value={`${data.soundOutside} dB`} isGold={false} />
    </div>
  );
};

export default Cards;