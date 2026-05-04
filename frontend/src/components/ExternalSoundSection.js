import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from "../config";

const ExternalSoundSection = ({ outsideSound, soundPrediction: externalPrediction }) => {
  const [file, setFile] = useState(null);
  const [manualPrediction, setManualPrediction] = useState(null);
  const [liveStreamPrediction, setLiveStreamPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamIntervalRef = useRef(null);

  // We use the live stream prediction if active, otherwise fallback to the scalar prediction (or 'Scanning...')
  const activeLivePrediction = isStreaming ? liveStreamPrediction : externalPrediction;

  // Live prediction logic
  const isLiveHornet = activeLivePrediction?.detection === "Hornets" || activeLivePrediction?.label === "Hornets";
  const liveDetectionText = activeLivePrediction?.detection || activeLivePrediction?.label || "Scanning...";
  const liveConfidenceVal = activeLivePrediction?.confidence || 0;

  // Manual prediction logic
  const isManualHornet = manualPrediction?.detection === "Hornets" || manualPrediction?.label === "Hornets";
  const manualDetectionText = manualPrediction?.detection || manualPrediction?.label || "Awaiting File...";
  const manualConfidenceVal = manualPrediction?.confidence || 0;

  const analyzeExternalSound = async () => {
    if (!file) return alert("Please select a .wav file first!");
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch("/api/predict-sound", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      setManualPrediction(result);
    } catch (err) { 
      setError("Analysis failed."); 
      console.error(err);
    } finally { 
      setLoading(false); 
    }
  };

  // --- LIVE AUDIO STREAM SIMULATION ---
  const startLiveAudioStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsStreaming(true);
      
      const recordAndSend = () => {
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];
        
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const formData = new FormData();
          formData.append('file', audioBlob, 'live_stream.wav');
          
          try {
            const res = await fetch("/api/predict-sound", {
              method: "POST",
              body: formData,
            });
            const result = await res.json();
            setLiveStreamPrediction(result);
          } catch (err) {
            console.error("Live Stream API Error:", err);
          }
        };
        
        mediaRecorder.start();
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') mediaRecorder.stop();
        }, 3000); // Record for 3 seconds
      };
      
      // Start the first recording immediately, then loop every 3.5 seconds
      recordAndSend();
      streamIntervalRef.current = setInterval(recordAndSend, 3500);

    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Please allow microphone access to simulate live audio monitoring.");
    }
  };

  const stopLiveAudioStream = () => {
    setIsStreaming(false);
    clearInterval(streamIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    // Stop all microphone tracks
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      stream.getTracks().forEach(track => track.stop());
    }).catch(e => console.error(e));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(streamIntervalRef.current);
    };
  }, []);

  // Helper to render prediction boxes
  const renderPredictionBox = (title, text, confidence, isHornet, isActive) => (
    <div style={{
      ...styles.predictionBox, 
      backgroundColor: isActive ? (isHornet ? 'rgba(229, 62, 62, 0.1)' : 'rgba(56, 161, 105, 0.05)') : 'rgba(255,255,255,0.01)',
      borderColor: isActive ? (isHornet ? '#e53e3e' : '#38a169') : 'rgba(255,255,255,0.05)',
      color: isActive ? (isHornet ? '#ff4d4d' : '#38a169') : '#555',
      minHeight: '140px'
    }}>
      <span style={styles.label}>{title}</span>
      <h2 style={{ 
        color: 'inherit',
        fontSize: '1.2rem',
        margin: '12px 0',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        wordBreak: 'break-word',
        lineHeight: '1.2',
        fontFamily: 'var(--font-digital)'
      }}>
        {text}
      </h2>
      {isActive && (
        <span style={{
           background: 'rgba(0,0,0,0.5)',
           padding: '4px 12px',
           borderRadius: '4px',
           fontSize: '0.65rem',
           color: '#fff',
           fontWeight: 'bold',
           fontFamily: 'var(--font-digital)',
           border: '1px solid rgba(255,255,255,0.1)'
        }}>
           CONFIDENCE: {confidence}%
        </span>
      )}
    </div>
  );

  return (
    <div style={styles.card} className="bee-card">
      <div style={styles.header}>
        <span style={styles.icon}>🛰️</span>
        <h3 style={styles.title}>External Acoustic Hornets Monitor</h3>
        
        <button 
          onClick={isStreaming ? stopLiveAudioStream : startLiveAudioStream}
          className="portalBtn"
          style={{
            marginLeft: 'auto',
            padding: '6px 15px',
            fontSize: '0.6rem',
            background: isStreaming ? '#fff' : 'var(--byte-gold)',
            color: '#000'
          }}
        >
          {isStreaming ? 'STOP LIVE STREAM' : 'START LIVE MIC STREAM'}
        </button>
      </div>
      
      <div style={styles.mainGrid}>
        <div style={styles.statBox}>
          <span style={styles.label}>OUTSIDE AMBIENT SOUND</span>
          <h2 className="live-value-gold" style={{ fontSize: '2.2rem', margin: '10px 0' }}>{outsideSound || 0} <small style={{fontSize: '1rem'}}>dB</small></h2>
        </div>

        {renderPredictionBox("LIVE CLASSIFICATION", liveDetectionText, liveConfidenceVal, isLiveHornet, true)}
        {renderPredictionBox("MANUAL CLASSIFICATION", manualDetectionText, manualConfidenceVal, isManualHornet, !!manualPrediction)}
      </div>

      <div style={styles.uploadSection}>
        <h4 style={styles.subHeader}>🔍 Manual Threat Analysis</h4>
        <div style={styles.actionRow}>
          <input type="file" accept=".wav" onChange={(e) => setFile(e.target.files[0])} style={styles.fileInput} />
          <button onClick={analyzeExternalSound} disabled={loading} className="portalBtn" style={{ padding: '8px 16px', fontSize: '0.7rem' }}>
            {loading ? "PROCESSING..." : "ANALYZE AUDIO"}
          </button>
          {manualPrediction && (
            <button onClick={() => setManualPrediction(null)} style={styles.clearBtn}>
              CLEAR
            </button>
          )}
        </div>
      </div>

      {(isLiveHornet || isManualHornet) && (
        <div style={styles.alarm} className="predator-alarm">
          ⚠️ ALERT: Hornets detected outside the hive!
        </div>
      )}
    </div>
  );
};

const styles = {
  card: { padding: '24px', marginTop: '20px' },
  header: { display: 'flex', alignItems: 'center', marginBottom: '25px' },
  icon: { marginRight: '10px', fontSize: '1.4rem' },
  title: { fontSize: '0.8rem', fontWeight: '800', color: '#ffcc00', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 },
  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' },
  statBox: { 
    padding: '20px', 
    background: 'rgba(255, 255, 255, 0.02)', 
    borderRadius: '15px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  label: { fontSize: '0.6rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' },
  predictionBox: { 
    padding: '20px', 
    borderRadius: '15px', 
    border: '1px solid', 
    textAlign: 'center', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  alarm: { 
    marginTop: '25px', 
    padding: '15px', 
    background: '#e53e3e', 
    color: '#fff', 
    borderRadius: '12px', 
    textAlign: 'center', 
    fontWeight: '900',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  uploadSection: { marginTop: '30px' },
  subHeader: { fontSize: '0.7rem', color: '#444', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' },
  actionRow: { display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' },
  fileInput: { fontSize: '0.7rem', color: '#666', flex: 1, minWidth: '200px' },
  clearBtn: {
    background: 'transparent',
    color: '#555',
    border: '1px solid #333',
    padding: '8px 16px',
    borderRadius: '5px',
    fontSize: '0.65rem',
    cursor: 'pointer',
    fontWeight: '800',
    textTransform: 'uppercase'
  }
};

export default ExternalSoundSection;