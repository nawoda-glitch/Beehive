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

    fetch("http://localhost:5000/predict-advanced", {
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

    fetch("http://localhost:5000/predict-external-threat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soundOutside: data.soundOutside })
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
        const response = await fetch("http://localhost:5000/predict-hive-intelligence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sound_level: data.soundInside,
            temperature: data.tempInside,
            vibration: data.vibration
          }),
        });
        const result = await response.json();
        setHiveAnalysis({
          ...result,
          queen_status: result.metrics?.centroid > 300 ? "Queenless Roar" : "Queen Present",
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
      {/* PROFESSIONAL HEADER */}
      <header className="app-header">
        <div>
          <h1 style={{ margin: 0 }}>🐝 Hive Intelligence <span style={{fontWeight: 300}}>Dashboard</span></h1>
          <small style={{ color: '#888' }}>
             Node: HIVE_LIVE_01 | 🛰️ Live Sync: {new Date(data.timestamp).toLocaleTimeString()}
          </small>
        </div>
        <div className="status-badge" style={{ color: '#38a169', fontWeight: 'bold' }}>● System Online</div>
      </header>
      
      {/* 1. TOP ROW: PRIMARY SENSOR CARDS */}
      <Cards data={data} />
      
      {/* 2. MIDDLE ROW: ANALYTICS & LIVE ACOUSTIC MONITORING */}
      <div className="dashboard-main-grid">
        <div className="left-col">
           <Charts history={history} />
        </div>
        
        <div className="right-col" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
           <ExternalSoundSection 
             outsideSound={data.soundOutside} 
             soundPrediction={soundPrediction} 
           />
           <HiveIntelligence 
             liveInsideSound={data?.soundInside} 
             temp={data?.tempInside} 
             timestamp={data?.timestamp}
           />
        </div>
      </div>

      {/* 3. THIRD ROW: AI DECISIONS & MANUAL LAB TOOLS */}
      <div className="dashboard-grid">
         <DecisionSection aiData={aiData} />
         <SoundAnalysisSection />
      </div>

      {/* 4. BOTTOM ROW: KNOWLEDGE BASE */}
      <div className="bot-full-width">
         <HiveKnowledgeBot />
      </div>
    </div>
  );
}

export default App;