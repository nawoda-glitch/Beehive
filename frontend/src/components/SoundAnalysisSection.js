import React, { useState } from 'react';

const SoundAnalysisSection = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch("http://localhost:5000/predict-sound", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Audio analysis failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.header}>🎙️ Acoustic Bio-Acoustics Analysis</h3>
      <p style={styles.subtext}>Upload hive audio to detect predators or colony activity.</p>
      
      <input 
        type="file" 
        accept="audio/*" 
        onChange={(e) => setFile(e.target.files[0])} 
        style={styles.input}
      />
      
      <button onClick={handleUpload} disabled={loading} style={styles.button}>
        {loading ? "Analyzing Waves..." : "Analyze Sound Pattern"}
      </button>

      {result && (
        <div style={{...styles.resultBox, borderColor: result.status === 'danger' ? '#d63031' : '#00b894'}}>
          <div style={styles.label}>Detection: <strong>{result.label.toUpperCase()}</strong></div>
          <div style={styles.confidence}>Confidence: {result.confidence}%</div>
          {result.label === 'Hornets' && <div style={styles.alert}>🚨 IMMEDIATE THREAT DETECTED</div>}
        </div>
      )}
    </div>
  );
};

const styles = {
  card: { background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginTop: '20px' },
  header: { margin: '0 0 10px 0', fontSize: '1.2rem' },
  subtext: { color: '#636e72', fontSize: '0.85rem', marginBottom: '20px' },
  input: { marginBottom: '15px', display: 'block' },
  button: { background: '#0984e3', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
  resultBox: { marginTop: '20px', padding: '15px', borderRadius: '10px', borderLeft: '5px solid' },
  alert: { color: '#d63031', fontWeight: 'bold', marginTop: '10px' }
};

export default SoundAnalysisSection;