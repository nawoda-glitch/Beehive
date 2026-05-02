import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { ref, set } from 'firebase/database';

const HiveIntelligence = ({ liveInsideSound, temp, timestamp }) => {
  const [predictionData, setPredictionData] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [file, setFile] = useState(null);
  const [manualData, setManualData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- DATA NORMALIZERS ---
  const getResultText = (data) => data?.prediction || data?.label || data?.status || "Awaiting Data";
  const getConfidence = (data) => parseFloat(data?.confidence || data?.accuracy || 0);

  // --- STYLING LOGIC ---
  const getConfidenceColor = (val) => {
    if (val > 80) return '#38a169'; // Green
    if (val > 50) return '#ecc94b'; // Yellow
    return '#e53e3e'; // Red
  };

  useEffect(() => {
    if (liveInsideSound > 0) fetchLivelyPrediction();
  }, [timestamp]);

  const fetchLivelyPrediction = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("http://localhost:5000/predict-hive-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sound_level: liveInsideSound, temperature: temp }),
      });
      const result = await res.json();
      setPredictionData(result);
    } catch (err) { console.error("Sync Error:", err); }
    finally { setIsSyncing(false); }
  };

  const analyzeHive = async () => {
    if (!file) return alert("Please select a .wav file first!");
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch("http://localhost:5000/predict-hive-intelligence", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      setManualData(result);
    } catch (err) { setError("Deep Analysis failed."); }
    finally { setLoading(false); }
  };

  const manualConf = getConfidence(manualData);

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>🧠 Hive Brain</h3>
      
      {/* 1. TOP BANNER (As seen in image_892196.png) */}
      <div style={{
        ...styles.statusBanner, 
        backgroundColor: liveInsideSound <= 0 ? "#f7f7f7" : (manualConf > 70 ? "#e6fffa" : "#fff5f5")
      }}>
        <span style={styles.label}>QUEEN STATE DETECTION</span>
        {liveInsideSound <= 0 ? (
          <h2 style={{ color: "#636e72" }}>🔇 Sensors Offline</h2>
        ) : (
          <h2 style={{ color: '#2d3436' }}>{getResultText(predictionData)}</h2>
        )}
        <p style={styles.confText}>Confidence: {getConfidence(predictionData)}%</p>
      </div>

      {/* 2. LABORATORY ANALYSIS SECTION */}
      <div style={styles.labSection}>
        <h4 style={styles.subHeader}>🔬 Laboratory Analysis</h4>
        <div style={styles.actionRow}>
          <input type="file" accept=".wav" onChange={(e) => setFile(e.target.files[0])} style={styles.fileInput} />
          <button onClick={analyzeHive} disabled={loading} style={styles.btn}>
            {loading ? "⚙️ Processing..." : "Analyze File"}
          </button>
        </div>
      </div>

      {/* 3. PROFESSIONAL DATA GRAPH & REPORT */}
      {manualData && (
        <div style={styles.reportCard}>
          <div style={styles.reportHeader}>
             <span>Manual Report: <strong>{getResultText(manualData)}</strong></span>
             <span style={{...styles.badge, backgroundColor: getConfidenceColor(manualConf)}}>
               {manualConf}% Accurate
             </span>
          </div>

          {/* Confidence Progress Bar */}
          <div style={styles.progressContainer}>
            <div style={{...styles.progressBar, width: `${manualConf}%`, backgroundColor: getConfidenceColor(manualConf)}} />
          </div>

          <div style={styles.metricGrid}>
             <div style={styles.metricItem}>
               <span style={styles.miniLabel}>FREQUENCY CENTROID</span>
               <div style={styles.value}>{Math.round(manualData.metrics?.centroid || 0)} Hz</div>
             </div>
             <div style={styles.metricItem}>
               <span style={styles.miniLabel}>ENERGY LEVEL</span>
               <div style={styles.value}>{(manualData.metrics?.energy || 0).toFixed(4)}</div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: { background: '#fff', padding: '25px', borderRadius: '15px', border: '1px solid #e1e4e8', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', maxWidth: '600px' },
  title: { margin: '0 0 20px 0', fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' },
  statusBanner: { padding: '30px', borderRadius: '12px', textAlign: 'center', marginBottom: '25px', border: '1px solid #eee' },
  label: { fontSize: '0.7rem', fontWeight: '800', color: '#a0aec0', letterSpacing: '1px' },
  confText: { fontSize: '0.85rem', color: '#718096', marginTop: '10px' },
  labSection: { marginBottom: '20px' },
  subHeader: { fontSize: '1rem', color: '#2d3436', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' },
  actionRow: { display: 'flex', gap: '10px', alignItems: 'center', background: '#f8f9fa', padding: '10px', borderRadius: '8px' },
  fileInput: { fontSize: '0.8rem' },
  btn: { background: '#ffa500', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' },
  
  // Professional Report Styling
  reportCard: { marginTop: '20px', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #3182ce', background: '#f0f7ff' },
  reportHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', fontSize: '1rem' },
  badge: { color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' },
  progressContainer: { height: '8px', background: '#e2e8f0', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' },
  progressBar: { height: '100%', transition: 'width 1s ease-in-out' },
  metricGrid: { display: 'flex', gap: '15px' },
  metricItem: { flex: 1, background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' },
  miniLabel: { fontSize: '0.6rem', color: '#a0aec0', fontWeight: 'bold', display: 'block', marginBottom: '5px' },
  value: { fontSize: '1.1rem', fontWeight: '700', color: '#2d3436' }
};

export default HiveIntelligence;