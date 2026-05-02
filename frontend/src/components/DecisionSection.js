import React from 'react';

const DecisionSection = ({ aiData }) => {
  // 1. Loading State
  if (!aiData || !aiData.status) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner"></div>
        <h3 style={{marginTop: '15px', color: '#636e72'}}>🧠 AI Engine Initializing...</h3>
        <p style={{fontSize: '0.8rem', color: '#b2bec3'}}>Crunching sensor data for risks and forecasts.</p>
      </div>
    );
  }

  // 2. Main Component Return
  return (
    <div style={styles.container}>
      {/* KPI Header Row - Professional Metrics */}
      <div style={styles.kpiRow}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Hive Health</span>
          <h2 style={{...styles.kpiValue, color: aiData.status.health === 'Healthy' ? '#00b894' : '#d63031'}}>
            {aiData.status.health}
          </h2>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Activity</span>
          <h2 style={{...styles.kpiValue, color: '#2d3436'}}>{aiData.status.activity}</h2>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Swarming Risk</span>
          <h2 style={{...styles.kpiValue, color: aiData.status.swarm === 'Low' ? '#00b894' : '#d63031'}}>
            {aiData.status.swarm}
          </h2>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Risk %</span>
          <h2 style={{...styles.kpiValue, color: '#2d3436'}}>{aiData.risk_score}%</h2>
        </div>
      </div>

      {/* 3. Risk Level Section (Progress Bar) */}
      <div style={styles.riskContainer}>
        <h3 style={styles.subHeader}>🔥 Risk Level</h3>
        <div style={styles.progressBarBg}>
          <div style={{
            ...styles.progressBarFill,
            width: `${aiData.risk_score}%`,
            backgroundColor: aiData.risk_score > 60 ? '#d63031' : aiData.risk_score > 30 ? '#fdcb6e' : '#00b894'
          }} />
        </div>

        {/* Status Alert Box */}
        <div style={{
          ...styles.statusAlert,
          backgroundColor: aiData.risk_score > 60 ? 'rgba(214, 48, 49, 0.1)' : 'rgba(0, 184, 148, 0.1)',
          color: aiData.risk_score > 60 ? '#d63031' : '#00b894',
          border: `1px solid ${aiData.risk_score > 60 ? '#d63031' : '#00b894'}`
        }}>
          {aiData.risk_score < 25 ? "✔ Hive is stable" : aiData.risk_score < 60 ? "⚠ Moderate stress detected" : "✖ CRITICAL: Action Required"}
        </div>
      </div>

      {/* 4. Explanation Section */}
      <div style={styles.explanationSection}>
        <h3 style={styles.subHeader}>🧠 Explanation</h3>
        <ul style={styles.reasonList}>
          {aiData.reasons.map((r, i) => (
            <li key={i} style={styles.reasonItem}>• {r}</li>
          ))}
        </ul>
      </div>

      {/* 5. LSTM Forecast Bar */}
      <div style={styles.forecastSection}>
        <h4 style={styles.cardLabel}>📈 LSTM Temperature Projection (Next 5 Hours)</h4>
        <div style={styles.forecastFlex}>
          {aiData.forecast_data.map((temp, i) => (
            <div key={i} style={styles.forecastBox}>
              <div style={styles.hourLabel}>+{i + 1}h</div>
              <div style={styles.tempValue}>{temp}°C</div>
              <div style={{...styles.trendLine, height: `${(temp / 45) * 100}%`}}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 6. Professional Styles Object
const styles = {
  container: {
    background: '#ffffff',
    borderRadius: '15px',
    padding: '25px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    fontFamily: 'inherit'
  },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
    marginBottom: '30px',
    borderBottom: '1px solid #eee',
    paddingBottom: '20px'
  },
  kpiCard: { textAlign: 'left' },
  kpiLabel: { fontSize: '0.8rem', color: '#636e72', fontWeight: '500' },
  kpiValue: { fontSize: '1.5rem', fontWeight: '700', margin: '5px 0' },
  riskContainer: { marginBottom: '25px' },
  subHeader: { fontSize: '1.1rem', marginBottom: '15px', color: '#2d3436' },
  progressBarBg: { height: '12px', background: '#f1f2f6', borderRadius: '10px', overflow: 'hidden', marginBottom: '15px' },
  progressBarFill: { height: '100%', transition: 'width 0.5s ease-in-out' },
  statusAlert: { padding: '12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', textAlign: 'center' },
  explanationSection: { marginBottom: '30px' },
  reasonList: { listStyle: 'none', padding: 0 },
  reasonItem: { fontSize: '0.9rem', color: '#2d3436', marginBottom: '8px', paddingLeft: '5px' },
  forecastSection: { background: '#f8f9fa', padding: '15px', borderRadius: '12px' },
  cardLabel: { fontSize: '0.85rem', color: '#636e72', marginBottom: '15px' },
  forecastFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '60px' },
  forecastBox: { textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  hourLabel: { fontSize: '0.7rem', color: '#b2bec3' },
  tempValue: { fontSize: '0.8rem', fontWeight: 'bold', color: '#0984e3' },
  trendLine: { width: '4px', backgroundColor: '#74b9ff', borderRadius: '2px', marginTop: '5px' },
  loadingContainer: { padding: '50px', textAlign: 'center', background: '#fff', borderRadius: '15px' }
};

export default DecisionSection;