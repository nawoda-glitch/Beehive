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
      backgroundColor: isActive ? (isHornet ? 'rgba(229, 62, 62, 0.15)' : 'rgba(56, 161, 105, 0.1)') : 'rgba(255,255,255,0.02)',
      borderColor: isActive ? (isHornet ? '#ff4d4d' : '#38a169') : '#333',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <span style={styles.label}>{title}</span>
      <h2 style={{ 
        color: isActive ? (isHornet ? '#ff4d4d' : '#38a169') : '#666', 
        fontSize: '1.6rem',
        margin: '10px 0',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        textShadow: isActive ? (isHornet ? '0 0 15px rgba(255, 77, 77, 0.6)' : '0 0 15px rgba(56, 161, 105, 0.4)') : 'none'
      }}>
        {text}
      </h2>
      {isActive && (
        <span style={{
           background: 'rgba(0,0,0,0.3)',
           padding: '4px 10px',
           borderRadius: '12px',
           fontSize: '0.8rem',
           color: '#fff',
           fontWeight: 'bold'
        }}>
           Confidence: {confidence}%
        </span>
      )}
    </div>
  );

  return (
    <div style={styles.card} className="bee-card">
      <div style={styles.header}>
        <span style={styles.icon}>📡</span>
        <h3 style={styles.title}>External Acoustic Hornets Monitor</h3>
        
        {/* Live Audio Stream Button */}
        <button 
          onClick={isStreaming ? stopLiveAudioStream : startLiveAudioStream}
          style={{
            ...styles.btn, 
            marginLeft: 'auto',
            backgroundColor: isStreaming ? '#ffb300' : '#e53e3e',
            animation: isStreaming ? 'pulse 2s infinite' : 'none'
          }}
        >
          {isStreaming ? '🛑 Stop Live Mic Stream' : '🎙️ Start Live Mic Stream'}
        </button>
      </div>
      
      <div style={styles.mainGrid}>
        {/* Real-time Value Display */}
        <div style={styles.statBox}>
          <span style={styles.label}>Outside Ambient Sound</span>
          <h2 style={styles.value}>{outsideSound || 0} dB</h2>
          {isStreaming && <span style={{color: '#ffb300', fontSize: '0.7rem'}}>Streaming Live Audio...</span>}
        </div>

        {/* AI Prediction Display - LIVE */}
        <div style={{ position: 'relative' }}>
          {renderPredictionBox("Live Classification", liveDetectionText, liveConfidenceVal, isLiveHornet, true)}
          {isStreaming && (
            <div style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#ffb300',
              boxShadow: '0 0 10px #ffb300',
              animation: 'pulse 1.5s infinite'
            }} />
          )}
        </div>

        {/* AI Prediction Display - MANUAL */}
        {renderPredictionBox("Manual Classification", manualDetectionText, manualConfidenceVal, isManualHornet, !!manualPrediction)}
      </div>

      {error && <div style={{ color: '#ff4d4d', fontSize: '0.8rem', marginTop: '10px', textAlign: 'center' }}>{error}</div>}


      {/* Manual File Upload Section */}
      <div style={styles.uploadSection}>
        <h4 style={styles.subHeader}>🔍 Manual Threat Analysis</h4>
        <div style={styles.actionRow}>
          <input type="file" accept=".wav" onChange={(e) => setFile(e.target.files[0])} style={styles.fileInput} />
          <button onClick={analyzeExternalSound} disabled={loading} style={styles.btn}>
            {loading ? "⚙️ Processing..." : "Analyze Audio"}
          </button>
          {manualPrediction && (
            <button onClick={() => setManualPrediction(null)} style={styles.clearBtn}>
              Clear Result
            </button>
          )}
        </div>
        {error && <p style={{color: '#ff4d4d', fontSize: '0.8rem', marginTop: '5px'}}>{error}</p>}
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
  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' },
  statBox: { 
    padding: '15px', 
    background: 'rgba(255, 255, 255, 0.03)', 
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
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
  },
  uploadSection: { marginTop: '20px' },
  subHeader: { fontSize: '0.8rem', color: '#aaa', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' },
  actionRow: { display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' },
  fileInput: { fontSize: '0.8rem', color: '#ccc' },
  btn: { 
    background: '#e53e3e', 
    color: '#fff', 
    border: 'none', 
    padding: '8px 16px', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: '800', 
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    transition: '0.2s',
    boxShadow: '0 4px 15px rgba(229, 62, 62, 0.2)'
  },
  clearBtn: {
    background: 'transparent',
    color: '#aaa',
    border: '1px solid #555',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  }
};

export default ExternalSoundSection;