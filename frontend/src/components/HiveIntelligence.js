import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/firebase';
import { ref, set } from 'firebase/database';
import { API_BASE_URL } from "../config";

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

  const [isStreaming, setIsStreaming] = useState(false);
  const streamIntervalRef = useRef(null);

  useEffect(() => {
    if (liveInsideSound > 0 && !isStreaming) fetchLivelyPrediction();
  }, [timestamp]);

  const fetchLivelyPrediction = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/predict-hive-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soundInside: liveInsideSound, temperature: temp }),
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
      const res = await fetch("/api/predict-hive-intelligence", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      setManualData(result);
    } catch (err) { setError("Deep Analysis failed."); }
    finally { setLoading(false); }
  };

  // --- LIVE MIC STREAM FOR QUEEN STATE ---
  const startLiveMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsStreaming(true);
      
      const recordAndSend = () => {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];
        mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const formData = new FormData();
          formData.append('file', audioBlob, 'live_queen.wav');
          try {
            const res = await fetch("/api/predict-hive-intelligence", { method: "POST", body: formData });
            const result = await res.json();
            setPredictionData(result);
          } catch (err) { console.error("Mic Stream Error:", err); }
        };
        mediaRecorder.start();
        setTimeout(() => { if (mediaRecorder.state === 'recording') mediaRecorder.stop(); }, 3000);
      };

      recordAndSend();
      streamIntervalRef.current = setInterval(recordAndSend, 3500);
    } catch (err) {
      alert("Microphone access denied!");
    }
  };

  const stopLiveMic = () => {
    setIsStreaming(false);
    clearInterval(streamIntervalRef.current);
  };

  useEffect(() => {
    return () => clearInterval(streamIntervalRef.current);
  }, []);

  const manualConf = getConfidence(manualData);

  return (
    <div style={styles.card} className="bee-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ ...styles.title, margin: 0 }}><span>🧠</span> Hive Brain Intelligence</h3>
        <button 
          onClick={isStreaming ? stopLiveMic : startLiveMic}
          style={{
            ...styles.btn, 
            backgroundColor: isStreaming ? '#ff4d4d' : '#ffb300',
            color: isStreaming ? '#fff' : '#000'
          }}
        >
          {isStreaming ? '🛑 Stop Mic' : '🎙️ Start Live Mic'}
        </button>
      </div>
      
      {/* 1. TOP BANNER - Dark Gold Theme */}
      <div style={{
        ...styles.statusBanner, 
        backgroundColor: liveInsideSound <= 0 ? "rgba(255,255,255,0.03)" : "rgba(255, 179, 0, 0.05)",
        borderColor: liveInsideSound <= 0 ? "#333" : "rgba(255, 179, 0, 0.3)"
      }}>
        <span style={styles.label}>QUEEN STATE DETECTION</span>
        {liveInsideSound <= 0 ? (
          <h2 style={{ color: "#666", margin: "10px 0" }}>🔇 Sensors Offline</h2>
        ) : (
          <h2 style={{ color: '#ffb300', margin: "10px 0", textShadow: '0 0 15px rgba(255,179,0,0.3)' }}>
            {getResultText(predictionData)}
          </h2>
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
              <span style={{color: '#fff'}}>Manual Report: <strong style={{color: '#ffb300'}}>{getResultText(manualData)}</strong></span>
              <span style={{...styles.badge, backgroundColor: getConfidenceColor(manualConf)}}>
                {manualConf}% Accurate
              </span>
          </div>

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
  card: { padding: '24px', marginTop: '20px' },
  title: { margin: 0, fontSize: '0.8rem', color: '#ffcc00', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' },
  statusBanner: { padding: '25px', borderRadius: '15px', textAlign: 'center', marginBottom: '25px', border: '1px solid', transition: 'all 0.3s ease' },
  label: { fontSize: '0.6rem', fontWeight: '800', color: '#666', letterSpacing: '2px' },
  confText: { fontSize: '0.65rem', color: '#444', marginTop: '5px', fontWeight: '800', fontFamily: 'var(--font-digital)' },
  labSection: { marginTop: '20px' },
  subHeader: { fontSize: '0.7rem', color: '#444', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' },
  actionRow: { display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' },
  fileInput: { fontSize: '0.7rem', color: '#666', flex: 1, minWidth: '150px' },
  reportCard: { 
    marginTop: '25px', 
    padding: '20px', 
    borderRadius: '15px', 
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255, 204, 0, 0.1)'
  },
  reportHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  badge: { color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '900', fontFamily: 'var(--font-digital)' },
  progressContainer: { height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' },
  progressBar: { height: '100%', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' },
  metricGrid: { display: 'flex', gap: '15px' },
  metricItem: { flex: 1, background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' },
  miniLabel: { fontSize: '0.55rem', color: '#555', fontWeight: '800', display: 'block', marginBottom: '5px', letterSpacing: '1px' },
  value: { fontSize: '1rem', fontWeight: '700', color: '#eee', fontFamily: 'var(--font-digital)' }
};

export default HiveIntelligence;