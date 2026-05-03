import React, { useState } from 'react';

const HiveKnowledgeBot = ({ data, aiData }) => {
  const [step, setStep] = useState('start');
  const [history, setHistory] = useState([]);

  // Helper to handle navigation
  const navigateTo = (nextStep) => {
    if (nextStep === 'diagnostic') {
      generateDiagnostic();
      return;
    }
    setHistory([...history, step]);
    setStep(nextStep);
  };

  const [diagnosticResult, setDiagnosticResult] = useState('');

  const generateDiagnostic = () => {
    if (!data || !aiData) return;
    
    let diagnosis = `Current Status: Your hive is ${aiData.status?.health?.toLowerCase() || 'stable'}. `;
    diagnosis += `The internal temperature is ${data.tempInside}°C and humidity is ${data.humInside}%. `;
    
    if (aiData.risk_score > 60) {
      diagnosis += "URGENT: High risk detected! Recommendations: " + aiData.reasons.join(", ");
    } else if (aiData.status?.swarm !== 'Low') {
      diagnosis += "Warning: High swarming risk. Consider adding space.";
    } else {
      diagnosis += "Everything looks optimal. No immediate action required.";
    }
    
    setDiagnosticResult(diagnosis);
    setHistory([...history, step]);
    setStep('diagnostic_result');
  };

  const goBack = () => {
    const prevStep = history.pop();
    setStep(prevStep || 'start');
    setHistory([...history]);
  };

  const knowledgeTree = {
    start: {
      question: "Welcome to the Bee-Expert Knowledge Base. What is the primary concern?",
      options: [
        { label: "⚡ Run Live AI Diagnostic", next: "diagnostic" },
        { label: "🔊 Unusual Sounds (Roaring/Hissing)", next: "roaring" },
        { label: "🌡️ Temperature/Weather Issues", next: "heat" },
        { label: "🐝 Entrance Behavior (Bearding/Fighting)", next: "entrance" },
        { label: "🧐 Health Inspection (Mites/Brood)", next: "health" }
      ]
    },
    // --- SOUND BRANCH ---
    roaring: {
      question: "Aссoustic changes are key indicators. Describe the sound:",
      options: [
        { label: "Steady high-pitched roar", next: "queenless_advice" },
        { label: "Short, sharp hissing sounds", next: "agitated" },
        { label: "Pulsating vibrations", next: "swarm_advice" }
      ]
    },
    agitated: {
      question: "Hissing often means the bees are defensive. Have you opened the hive recently, or are there predators (skunks/wasps) nearby?",
      options: [
        { label: "Predators nearby", next: "predator_advice" },
        { label: "Just opened the hive", next: "smoke_advice" }
      ]
    },
    // --- ENTRANCE BRANCH ---
    entrance: {
      question: "Entrance behavior reveals the hive's mood. What do you see?",
      options: [
        { label: "Bees fighting/tussling on board", next: "robbing_advice" },
        { label: "Masses of bees hanging outside (Bearding)", next: "bearding_check" },
        { label: "Drones being kicked out", next: "winter_prep" }
      ]
    },
    bearding_check: {
      question: "Bearding is common in summer. Is it after 5:00 PM on a hot day?",
      options: [
        { label: "Yes, it's hot and late", next: "normal_bearding" },
        { label: "No, it's early/cool", next: "overcrowded_advice" }
      ]
    },
    // --- HEALTH BRANCH ---
    health: {
      question: "Inspection is vital. What is the most worrying sign?",
      options: [
        { label: "Reddish spots on bee backs (Mites)", next: "varroa_advice" },
        { label: "Spotty/patchy brood pattern", next: "brood_issue" },
        { label: "Bees crawling in grass/unabled to fly", next: "disease_advice" }
      ]
    },
    // --- FINAL ADVICE RESULTS ---
    queenless_advice: { question: "AI Conclusion: Probable Queenlessness. ACTION: Look for eggs. If absent for 3+ days, introduce a new Queen.", options: [] },
    swarm_advice: { question: "AI Conclusion: Swarm Fever. ACTION: Check for swarm cells on bottom of frames. Provide more space immediately.", options: [] },
    predator_advice: { question: "AI Conclusion: Predator Stress. ACTION: Install a 'robbing screen' or mouse guard to give bees a smaller area to defend.", options: [] },
    smoke_advice: { question: "AI Conclusion: Normal Agitation. ACTION: Use a bit more smoke and move slower. Ensure you aren't wearing dark, fuzzy clothing.", options: [] },
    robbing_advice: { question: "AI Conclusion: ROBBING EVENT. ACTION: This is an emergency! Reduce entrance to 1-inch immediately and drape a wet sheet over the hive.", options: [] },
    normal_bearding: { question: "AI Conclusion: Normal Cooling. ACTION: No action needed. The bees are just regulating internal temperature.", options: [] },
    overcrowded_advice: { question: "AI Conclusion: Space Issues. ACTION: Add a new honey super. The hive is running out of room to work.", options: [] },
    varroa_advice: { question: "AI Conclusion: Mite Infestation. ACTION: Perform an Alcohol Wash. If mite count is >3 per 100 bees, treat with Formic Pro or Oxalic Acid.", options: [] },
    brood_issue: { question: "AI Conclusion: Poor Queen or Disease. ACTION: Could be European Foulbrood (EFB). Contact a local inspector if brood smells sour.", options: [] },
    disease_advice: { question: "AI Conclusion: Tracheal Mites or Nosema. ACTION: Check for 'K-wing' deformity. Feed with Fumidil-B if Nosema is suspected.", options: [] },
    winter_prep: { question: "AI Conclusion: Winter Prep. ACTION: Normal for autumn. The colony is evicting drones to save food for winter.", options: [] },
    diagnostic_result: { question: diagnosticResult, options: [] }
  };

  const currentStep = knowledgeTree[step] || knowledgeTree['start'];

  return (
    <div style={styles.botContainer}>
      <div style={styles.botHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={styles.botIcon}>🐝</span>
          <h4 style={styles.botTitle}>Hive Expert Bot</h4>
        </div>
        {step !== 'start' && (
          <button onClick={goBack} style={styles.backBtn}>← Back</button>
        )}
      </div>
      
      <div style={styles.messageBox}>
        <p style={styles.questionText}>{currentStep.question}</p>
      </div>

      <div style={styles.optionsContainer}>
        {currentStep.options.length > 0 ? (
          currentStep.options.map((opt, index) => (
            <button key={index} onClick={() => navigateTo(opt.next)} style={styles.optionBtn}>
              {opt.label}
            </button>
          ))
        ) : (
          <button onClick={() => setStep('start')} style={styles.resetBtn}>
            Return to Main Menu
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  botContainer: { 
    background: 'rgba(30, 30, 30, 0.8)', 
    borderRadius: '20px', 
    padding: '24px', 
    boxShadow: '0 12px 40px rgba(0,0,0,0.4)', 
    border: '1px solid rgba(255, 255, 255, 0.05)', 
    width: '100%', 
    maxWidth: '450px',
    backdropFilter: 'blur(15px)',
    marginTop: '20px'
  },
  botHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '15px'
  },
  botIcon: { 
    fontSize: '1.2rem', 
    background: 'rgba(255, 179, 0, 0.1)', 
    padding: '10px', 
    borderRadius: '12px',
    border: '1px solid rgba(255, 179, 0, 0.2)' 
  },
  botTitle: { 
    margin: 0, 
    fontSize: '1rem', 
    color: '#fff', 
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  backBtn: { 
    border: 'none', 
    background: 'none', 
    color: '#666', 
    cursor: 'pointer', 
    fontSize: '0.75rem',
    fontWeight: 'bold',
    transition: 'color 0.2s'
  },
  messageBox: { 
    background: 'rgba(255, 179, 0, 0.05)', 
    padding: '18px', 
    borderRadius: '15px 15px 15px 0px', 
    marginBottom: '20px', 
    borderLeft: '4px solid #ffb300',
    boxShadow: 'inset 0 0 20px rgba(255, 179, 0, 0.02)'
  },
  questionText: { 
    margin: 0, 
    fontSize: '0.9rem', 
    color: '#eee', 
    lineHeight: '1.6', 
    fontWeight: '500' 
  },
  optionsContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px' 
  },
  optionBtn: { 
    background: 'rgba(255,255,255,0.03)', 
    border: '1px solid rgba(255,255,255,0.08)', 
    color: '#ffb300', 
    padding: '14px', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontSize: '0.85rem', 
    textAlign: 'left', 
    transition: 'all 0.3s ease', 
    fontWeight: '600',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
  },
  resetBtn: { 
    background: '#ffb300', 
    color: '#000', 
    border: 'none', 
    padding: '14px', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: '800',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '10px',
    boxShadow: '0 4px 15px rgba(255, 179, 0, 0.3)'
  }
};

export default HiveKnowledgeBot;