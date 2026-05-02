import React from 'react';

const ExternalSoundSection = ({ outsideSound, soundPrediction }) => {
  const isHornet = soundPrediction?.detection === "Hornets";

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.icon}>📡</span>
        <h3 style={styles.title}>External Acoustic Monitor</h3>
      </div>
      
      <div style={styles.mainGrid}>
        {/* Real-time Value Display */}
        <div style={styles.statBox}>
          <span style={styles.label}>Outside Ambient Sound</span>
          <h2 style={styles.value}>{outsideSound} dB</h2>
        </div>

        {/* AI Prediction Display */}
        <div style={{
          ...styles.predictionBox, 
          backgroundColor: isHornet ? '#fff5f5' : '#f0fff4',
          borderColor: isHornet ? '#fc8181' : '#68d391'
        }}>
          <span style={styles.label}>AI Classification (Outside)</span>
          <h3 style={{ color: isHornet ? '#e53e3e' : '#38a169', margin: '5px 0' }}>
            {soundPrediction?.detection || "Scanning..."}
          </h3>
          <p style={styles.confidence}>Confidence: {soundPrediction?.confidence || 0}%</p>
        </div>
      </div>

      {isHornet && (
        <div style={styles.alarm}>
          ⚠️ ALERT: Predator detected outside the hive!
        </div>
      )}
    </div>
  );
};

const styles = {
  card: { background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: '20px' },
  header: { display: 'flex', alignItems: 'center', marginBottom: '15px' },
  icon: { marginRight: '10px', fontSize: '1.2rem' },
  title: { fontSize: '1rem', fontWeight: '700', margin: 0 },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  statBox: { padding: '15px', background: '#f7fafc', borderRadius: '10px' },
  label: { fontSize: '0.75rem', color: '#718096', textTransform: 'uppercase' },
  value: { margin: '5px 0', fontSize: '1.5rem' },
  predictionBox: { padding: '15px', borderRadius: '10px', border: '1px solid', textAlign: 'center' },
  confidence: { fontSize: '0.8rem', color: '#4a5568', margin: 0 },
  alarm: { marginTop: '15px', padding: '10px', background: '#e53e3e', color: '#fff', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', animation: 'pulse 2s infinite' }
};

export default ExternalSoundSection;