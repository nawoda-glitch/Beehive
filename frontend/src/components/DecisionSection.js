import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const DecisionSection = ({ aiData }) => {
  // 1. Loading State - Updated for Dark Theme
  if (!aiData || !aiData.status) {
    return (
      <div style={styles.loadingContainer} className="bee-card">
        <div className="spinner"></div>
        <h3 style={{marginTop: '15px', color: '#ffb300'}}>🧠 AI Engine Initializing...</h3>
        <p style={{fontSize: '0.8rem', color: '#666'}}>Crunching sensor data for risks and forecasts.</p>
      </div>
    );
  }

  return (
    <div style={styles.container} className="bee-card">
      {/* KPI Header Row */}
      <div style={styles.kpiRow}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Hive Health</span>
          <h2 style={{...styles.kpiValue, color: aiData.status.health === 'Healthy' ? '#ffb300' : '#ff4d4d'}}>
            {aiData.status.health}
          </h2>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Activity</span>
          <h2 style={{...styles.kpiValue, color: '#fff'}}>{aiData.status.activity}</h2>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Swarming Risk</span>
          <h2 style={{...styles.kpiValue, color: aiData.status.swarm === 'Low' ? '#ffb300' : '#ff4d4d'}}>
            {aiData.status.swarm}
          </h2>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Risk %</span>
          <h2 style={{...styles.kpiValue, color: '#fff'}}>{aiData.risk_score}%</h2>
        </div>
      </div>

      {/* 3. Risk Level Section */}
      <div style={styles.riskContainer}>
        <h3 style={styles.subHeader}>🔥 Risk Level Analysis</h3>
        <div style={styles.progressBarBg}>
          <div style={{
            ...styles.progressBarFill,
            width: `${aiData.risk_score}%`,
            backgroundColor: aiData.risk_score > 60 ? '#ff4d4d' : aiData.risk_score > 30 ? '#ffb300' : '#ffb300',
            boxShadow: aiData.risk_score > 60 ? '0 0 15px #ff4d4d' : '0 0 15px #ffb300'
          }} />
        </div>

        <div style={{
          ...styles.statusAlert,
          backgroundColor: aiData.risk_score > 60 ? 'rgba(255, 77, 77, 0.1)' : 'rgba(255, 179, 0, 0.1)',
          color: aiData.risk_score > 60 ? '#ff4d4d' : '#ffb300',
          borderColor: aiData.risk_score > 60 ? '#ff4d4d' : '#ffb300'
        }}>
          {aiData.risk_score < 25 ? "✔ Hive is stable" : aiData.risk_score < 60 ? "⚠ Moderate stress detected" : "✖ CRITICAL: Action Required"}
        </div>
      </div>

      {/* 4. Explanation Section */}
      <div style={styles.explanationSection}>
        <h3 style={styles.subHeader}>🧠 Intelligence Insights</h3>
        <ul style={styles.reasonList}>
          {aiData.reasons.map((r, i) => (
            <li key={i} style={styles.reasonItem}>• {r}</li>
          ))}
        </ul>
      </div>

      {/* 5. Smart Recommendations */}
      <div style={styles.actionPlanSection}>
        <h3 style={styles.subHeader}>🛠️ AI-Driven Action Plan</h3>
        <div style={styles.recommendationCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '1.5rem' }}>
              {aiData.risk_score > 60 ? '🚨' : aiData.status.health !== 'Healthy' ? '💊' : '✅'}
            </span>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>
                {aiData.risk_score > 60 ? "CRITICAL INTERVENTION" : "PREVENTATIVE CARE"}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#888' }}>
                {aiData.risk_score > 60 
                  ? "Neural patterns suggest extreme stress. Check for predators or Varroa immediately." 
                  : aiData.status.health !== 'Healthy' 
                    ? "Sub-optimal health detected. Recommend organic treatment or ventilation check."
                    : "No immediate action required. Maintain current environmental monitoring."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. LSTM Forecast Graph (7 Days) */}
      <div style={styles.forecastSection}>
        <h4 style={styles.cardLabel}>📈 NEXT WEEK HIVE STATUS PROJECTION (7 DAYS)</h4>
        
        {!aiData.forecast_data || aiData.forecast_data.length === 0 ? (
           <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '0.8rem' }}>
             LSTM Forecast Model is currently analyzing historical data...
           </div>
        ) : (
          <div style={{ width: '100%', height: '180px', marginTop: '15px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aiData.forecast_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#666" 
                  fontSize={11} 
                  tickMargin={10} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#666" 
                  fontSize={11} 
                  domain={['auto', 'auto']} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(val) => `${val}°C`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#222', borderColor: '#444', borderRadius: '8px' }}
                  itemStyle={{ color: '#ffb300' }}
                  formatter={(value, name, props) => {
                    if (name === 'temp') return [`${value}°C (${props.payload.status})`, 'Projection'];
                    return [value, name];
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#ffb300" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#ffb300', stroke: '#222', strokeWidth: 2 }} 
                  activeDot={{ r: 6, fill: '#ff4d4d' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'rgba(30, 30, 30, 0.8)',
    borderRadius: '16px',
    padding: '25px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(12px)',
    marginTop: '20px'
  },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '15px',
    marginBottom: '30px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '20px'
  },
  kpiCard: { textAlign: 'left' },
  kpiLabel: { fontSize: '0.7rem', color: '#888', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' },
  kpiValue: { fontSize: '1.6rem', fontWeight: '800', margin: '8px 0' },
  riskContainer: { marginBottom: '25px' },
  subHeader: { fontSize: '0.9rem', marginBottom: '15px', color: '#fff', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 'bold' },
  progressBarBg: { height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', marginBottom: '15px' },
  progressBarFill: { height: '100%', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' },
  statusAlert: { padding: '12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center', border: '1px solid' },
  explanationSection: { marginBottom: '30px' },
  reasonList: { listStyle: 'none', padding: 0 },
  reasonItem: { fontSize: '0.9rem', color: '#ccc', marginBottom: '10px', paddingLeft: '5px', borderLeft: '2px solid rgba(255,179,0,0.3)' },
  forecastSection: { background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' },
  actionPlanSection: { marginBottom: '25px' },
  recommendationCard: { 
    background: 'linear-gradient(to right, rgba(255,179,0,0.05), transparent)', 
    padding: '15px', 
    borderRadius: '12px', 
    border: '1px solid rgba(255,179,0,0.2)' 
  },
  cardLabel: { fontSize: '0.75rem', color: '#666', marginBottom: '20px', textTransform: 'uppercase', fontWeight: 'bold' },
  forecastFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '80px' },
  forecastBox: { textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  hourLabel: { fontSize: '0.65rem', color: '#555', marginBottom: '5px' },
  tempValue: { fontSize: '0.8rem', fontWeight: 'bold', color: '#eee' },
  trendLine: { width: '6px', borderRadius: '3px 3px 0 0', marginTop: '10px', transition: 'height 0.5s ease' },
  loadingContainer: { padding: '50px', textAlign: 'center', background: 'rgba(30, 30, 30, 0.8)', borderRadius: '16px' }
};

export default DecisionSection;