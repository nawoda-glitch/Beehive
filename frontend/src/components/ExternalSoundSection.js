import React from 'react';

const ExternalSoundSection = ({ outsideSound, soundPrediction }) => {
  const isHornet = soundPrediction?.detection === "Hornets";

  return (
    <div style={styles.card} className="bee-card">
      <div style={styles.header}>
        <span style={styles.icon}>📡</span>
        <h3 style={styles.title}>External Acoustic Hornets Monitor</h3>
      </div>
      
      <div style={styles.mainGrid}>
        {/* Real-time Value Display */}
        <div style={styles.statBox}>
          <span style={styles.label}>Outside Ambient Sound</span>
          <h2 style={styles.value}>{outsideSound || 0} dB</h2>
        </div>

        {/* AI Prediction Display */}
        <div style={{
          ...styles.predictionBox, 
          backgroundColor: isHornet ? 'rgba(229, 62, 62, 0.1)' : 'rgba(255, 179, 0, 0.05)',
          borderColor: isHornet ? '#ff4d4d' : '#ffb300'
        }}>
          <span style={styles.label}>AI Classification</span>
          <h3 style={{ 
            color: isHornet ? '#ff4d4d' : '#ffb300', 
            margin: '5px 0',
            textShadow: isHornet ? '0 0 10px rgba(255, 77, 77, 0.5)' : 'none'
          }}>
            {soundPrediction?.detection || "Scanning..."}
          </h3>
          <p style={styles.confidence}>Confidence: {soundPrediction?.confidence || 0}%</p>
        </div>
      </div>

      {isHornet && (
        <div style={styles.alarm} className="predator-alarm">
          ⚠️ ALERT: Hornets detected outside the hive!
        </div>
      )}
    </div>
  );
};

const styles = {
  card: { 
    background: 'rgba(30, 30, 30, 0.8)', 
    padding: '24px', 
    borderRadius: '16px', 
    marginTop: '20px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)'
  },
  header: { display: 'flex', alignItems: 'center', marginBottom: '20px' },
  icon: { marginRight: '10px', fontSize: '1.4rem' },
  title: { fontSize: '0.9rem', fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 },
  mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  statBox: { 
    padding: '15px', 
    background: 'rgba(255, 255, 255, 0.03)', 
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  label: { fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' },
  value: { margin: '8px 0', fontSize: '1.8rem', color: '#fff', fontWeight: 'bold' },
  predictionBox: { padding: '15px', borderRadius: '12px', border: '1px solid', textAlign: 'center', transition: 'all 0.3s ease' },
  confidence: { fontSize: '0.75rem', color: '#666', margin: 0 },
  alarm: { 
    marginTop: '20px', 
    padding: '12px', 
    background: '#e53e3e', 
    color: '#fff', 
    borderRadius: '10px', 
    textAlign: 'center', 
    fontWeight: 'bold',
    boxShadow: '0 0 20px rgba(229, 62, 62, 0.4)'
  }
};

export default ExternalSoundSection;