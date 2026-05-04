import { useEffect, useState } from "react";
import { db } from "./services/firebase";
import { ref, onValue } from "firebase/database";
import "./App.css"; // Ensure you have the CSS file created!




// Import your modular components
import Cards from "./components/Cards";
import Charts from "./components/Charts";
import QueenSection from "./components/QueenSection";
import ChatbotSection from "./components/ChatbotSection";
import DecisionSection from "./components/DecisionSection";
import SoundAnalysisSection from './components/SoundAnalysisSection';
import ExternalSoundSection from './components/ExternalSoundSection';
import HiveIntelligence from './components/HiveIntelligence';
import HiveDecisionSupport from './components/HiveDecisionSupport';
import HiveKnowledgeBot from './components/HiveKnowledgeBot';
import ExternalHub from './components/ExternalHub';

function App() {
  // --- States ---
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [aiData, setAiData] = useState(null);  
  const [file, setFile] = useState(null);
  const [queenResult, setQueenResult] = useState(null);
  const [soundPrediction, setSoundPrediction] = useState(null);
  const [hiveAnalysis, setHiveAnalysis] = useState(null);

  // --- 1. Firebase Listener ---
  useEffect(() => {
    const hiveRef = ref(db, "hive/live");
    const unsubscribe = onValue(hiveRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) return;

      const formatted = {
        tempInside: val.temp1 ?? 0,
        tempOutside: val.temp2 ?? 0,
        humInside: val.hum1 ?? 0,
        humOutside: val.hum2 ?? 0,
        soundInside: val.soundDB1 ?? 0,
        soundOutside: val.soundDB2 ?? 0,
        vibration: val.activityLevel ?? 0,
        timestamp: val.timestamp || new Date().toISOString()
      };

      setData(formatted);
      setHistory((prev) => [
        ...prev.slice(-19),
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temp: formatted.tempInside
        }
      ]);
    }, (error) => {
      console.error("Firebase Connection Error:", error);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. Integrated Advanced ML API Call ---
  useEffect(() => {
    if (!data) return;

    fetch("/api/predict-advanced", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tempInside: data.tempInside,
        humInside: data.humInside,
        soundInside: data.soundInside,
        tempOutside: data.tempOutside,
        vibration: data.vibration || 0
      })
    })
    .then(res => res.json())
    .then(res => setAiData(res))
    .catch(err => console.error("AI Sync Error:", err));

    fetch("/api/predict-external-threat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        soundOutside: data.soundOutside,
        vibration: data.vibration 
      })
    })
    .then(res => res.json())
    .then(res => setSoundPrediction(res))
    .catch(err => console.error("Sound Prediction Error:", err));
  }, [data?.timestamp]);

  // --- 3. Hive Intelligence Auto-Predict ---
  useEffect(() => {
    if (!data || !data.soundInside) return;

    const autoPredictHiveStatus = async () => {
      try {
        const response = await fetch("/api/predict-hive-intelligence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            soundInside: data.soundInside,
            temperature: data.tempInside,
            vibration: data.vibration
          }),
        });
        const result = await response.json();
        setHiveAnalysis({
          ...result,
          queen_status: result.prediction,
          lastSync: new Date().toLocaleTimeString()
        });
      } catch (err) {
        console.error("Lively Prediction Error:", err);
      }
    };
    const timeoutId = setTimeout(autoPredictHiveStatus, 1000);
    return () => clearTimeout(timeoutId);
  }, [data?.soundInside, data?.tempInside]);

  // --- Render ---
  if (!data) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <h2>📡 Connecting to Hive Intelligence...</h2>
        <p>Awaiting real-time sensor data</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* 1. SIDE NAVIGATION DOCK */}
      <div className="side-dock">
        <div className="dock-icon" title="Monitor">📊</div>
        <div className="dock-icon" title="AI Chat">🤖</div>
        <div className="dock-icon" title="External Hub">🌐</div>
        <div className="dock-icon" title="Alerts">🚨</div>
      </div>

      {/* 2. CINEMATIC HEADER */}
      <header className="app-header">
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h1 style={{ margin: 0, fontSize: '1rem', letterSpacing: '4px', opacity: 0.6 }}>
            BEENET <span style={{fontWeight: 200}}>AI COMMAND</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
           <a href="https://bee-monitor.onrender.com/" target="_blank" rel="noopener noreferrer" className="portalBtn" style={{ padding: '10px 24px', fontSize: '0.7rem' }}>
             PRO NODE HUB ↗
           </a>
           <div className="live-value-gold" style={{ fontSize: '0.8rem' }}>{new Date().toLocaleTimeString()}</div>
        </div>
      </header>

      {/* 3. IMMERSIVE HERO SECTION */}
      <div className="hero-section">
        <div className="bee-card hero-main-card">
          <div>
            <span className="status-badge" style={{ color: '#38a169' }}>● REAL-TIME ANALYSIS ACTIVE</span>
            <h1 style={{ fontSize: '3rem', marginTop: '20px', marginBottom: '10px' }}>HIVE CORE <span style={{fontWeight: 200}}>HEALTH</span></h1>
            <p style={{ color: '#888', maxWidth: '400px' }}>Our Neural Network is currently processing acoustic signatures from Node 01. Queen vibration is stable.</p>
          </div>
          
          <div className="hero-stats">
            <div className="hero-stat-item">
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#666', letterSpacing: '2px' }}>RISK INDEX</p>
              <h2 className="live-value-gold">{aiData?.risk_percent || "0"}%</h2>
            </div>
            <div className="hero-stat-item" style={{ borderLeft: '1px solid #333', paddingLeft: '40px' }}>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#666', letterSpacing: '2px' }}>QUEEN STATUS</p>
              <h2 style={{ fontSize: '2rem', color: '#fff', marginTop: '10px' }}>{hiveAnalysis?.queen_status || "Stable"}</h2>
            </div>
          </div>
        </div>

        <div className="bee-card" style={{ padding: '30px' }}>
           <h3 style={{ fontSize: '0.8rem', color: '#666' }}>Acoustic Spectrum</h3>
           <HiveIntelligence 
             liveInsideSound={data?.soundInside} 
             temp={data?.tempInside} 
             timestamp={data?.timestamp}
           />
        </div>
      </div>

      {/* 4. THE BENTO GRID */}
      <div className="bento-grid">
        {/* Sensor Cards (Mapped to Bento) */}
        <div className="span-2"><Cards data={data} /></div>
        
        <div className="bee-card span-2" style={{ padding: '25px' }}>
           <h3 style={{ fontSize: '0.8rem', color: '#666', marginBottom: '20px' }}>7-Day Forecast Projection</h3>
           <DecisionSection aiData={aiData} />
        </div>

        <div className="bee-card span-3" style={{ padding: '25px' }}>
           <h3 style={{ fontSize: '0.8rem', color: '#666', marginBottom: '20px' }}>Frequency & Humidity Historicals</h3>
           <Charts history={history} />
        </div>

        <div className="bee-card row-2" style={{ padding: '25px' }}>
           <ExternalSoundSection outsideSound={data.soundOutside} soundPrediction={soundPrediction} />
        </div>

        <div className="span-2"><SoundAnalysisSection /></div>
        
        <div className="bee-card" style={{ padding: '25px' }}>
           <h3 style={{ fontSize: '0.8rem', color: '#666' }}>External Node</h3>
           <a href="https://bee-monitor.onrender.com/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
             <div style={{ height: '150px', background: 'rgba(255,179,0,0.05)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px', border: '1px dashed #444' }}>
               <span style={{ color: '#ffb300' }}>Open Hub ↗</span>
             </div>
           </a>
        </div>
      </div>

      {/* 5. BOTTOM UTILITIES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
         <HiveKnowledgeBot data={data} aiData={aiData} />
         <ExternalHub />
      </div>
    </div>
  );
}

export default App;