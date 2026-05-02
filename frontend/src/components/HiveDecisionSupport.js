import React from 'react';

const HiveDecisionSupport = ({ liveData, mlData }) => {
  // Extracting all variables for the Decision Matrix
  const temp = liveData?.tempInside || 0;
  const soundDb = liveData?.soundInside || 0;
  const centroid = mlData?.metrics?.centroid || 0;
  const prediction = mlData?.prediction || "No Data";

  const generateDecision = () => {
    // 1. Critical Emergency Logic
    if (prediction.includes("Queenless") && soundDb > 75) {
      return {
        status: "EMERGENCY",
        title: "Queenless Roar Confirmed",
        recommendation: "Introduce a new mated Queen or a Queen cell within 24 hours to prevent colony collapse.",
        color: "#e53e3e",
        icon: "🚨"
      };
    }

    // 2. Swarm Risk Logic (High Frequency + Noise)
    if (centroid > 250 && soundDb > 65) {
      return {
        status: "WARNING",
        title: "High Swarm Probability",
        recommendation: "Colony is agitated with high frequency vibration. Inspect for swarm cells and consider a split.",
        color: "#dd6b20",
        icon: "🐝"
      };
    }

    // 3. Thermal Stress Logic
    if (temp > 38) {
      return {
        status: "CAUTION",
        title: "Thermal Overload",
        recommendation: "Hive temperature is dangerously high. Ensure ventilation is clear and provide a water source nearby.",
        color: "#d69e2e",
        icon: "🔥"
      };
    }

    // 4. Healthy State
    if (soundDb > 0 && prediction.includes("Present")) {
      return {
        status: "OPTIMAL",
        title: "Healthy Colony Dynamics",
        recommendation: "Colony is stable. No manual intervention required. Schedule routine inspection in 7 days.",
        color: "#38a169",
        icon: "✅"
      };
    }

    return {
      status: "AWAITING DATA",
      title: "Initializing Decision Matrix",
      recommendation: "Feed live sensor data and run a Deep Analysis to generate a decision.",
      color: "#718096",
      icon: "⏳"
    };
  };

  const decision = generateDecision();

  return (
    <div style={{...styles.container, borderColor: decision.color}}>
      <div style={styles.header}>
        <span style={styles.icon}>{decision.icon}</span>
        <div>
          <h3 style={{...styles.statusText, color: decision.color}}>{decision.status}</h3>
          <h4 style={styles.titleText}>{decision.title}</h4>
        </div>
      </div>

      <div style={styles.dataStrip}>
        <div style={styles.dataItem}>Temp: <strong>{temp}°C</strong></div>
        <div style={styles.dataItem}>Audio: <strong>{soundDb} dB</strong></div>
        <div style={styles.dataItem}>Freq: <strong>{centroid.toFixed(0)} Hz</strong></div>
      </div>

      <div style={styles.recommendationBox}>
        <p style={styles.label}>RECOMMENDED ACTION PLAN</p>
        <p style={styles.recText}>{decision.recommendation}</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    borderLeft: '8px solid',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    margin: '20px 0'
  },
  header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
  icon: { fontSize: '2.5rem' },
  statusText: { margin: 0, fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1.5px' },
  titleText: { margin: 0, fontSize: '1.3rem', color: '#2d3748' },
  dataStrip: { 
    display: 'flex', 
    gap: '15px', 
    background: '#f7fafc', 
    padding: '10px', 
    borderRadius: '8px',
    marginBottom: '20px'
  },
  dataItem: { fontSize: '0.8rem', color: '#4a5568' },
  recommendationBox: { background: '#fff', border: '1px solid #edf2f7', padding: '15px', borderRadius: '10px' },
  label: { fontSize: '0.6rem', fontWeight: '800', color: '#a0aec0', margin: '0 0 8px 0' },
  recText: { fontSize: '0.95rem', color: '#2d3748', margin: 0, lineHeight: '1.5', fontWeight: '500' }
};

export default HiveDecisionSupport;