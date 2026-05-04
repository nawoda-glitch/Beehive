import React from 'react';

const Card = ({ title, value, icon, isGold }) => (
  <div className={`bee-card ${isGold ? 'gold-glow' : ''}`}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <h4 style={{ margin: 0, opacity: 0.6, fontSize: "0.7rem", letterSpacing: '1px' }}>{title}</h4>
      <span style={{ fontSize: '1.2rem', opacity: 0.8 }}>{icon}</span>
    </div>
    <div className="live-value-gold" style={{ marginTop: '10px', fontSize: '2rem' }}>{value}</div>
  </div>
);

const Cards = ({ data }) => {
  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
      gap: "20px",
      marginBottom: "30px"
    }}>
      <Card title="Temp Inside" value={`${data.tempInside}°C`} icon="🌡️" isGold={true} />
      <Card title="Temp Outside" value={`${data.tempOutside}°C`} icon="☁️" isGold={false} />
      <Card title="Hum Inside" value={`${data.humInside}%`} icon="💧" isGold={true} />
      <Card title="Hum Outside" value={`${data.humOutside}%`} icon="🌊" isGold={false} />
      <Card title="Sound Inside" value={`${data.soundInside} dB`} icon="🐝" isGold={true} />
      <Card title="Sound Outside" value={`${data.soundOutside} dB`} icon="🛡️" isGold={false} />
    </div>
  );
};

export default Cards;