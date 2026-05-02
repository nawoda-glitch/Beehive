import React, { useState } from 'react';

const HiveKnowledgeBot = () => {
  const [step, setStep] = useState('start');
  const [history, setHistory] = useState([]);

  // Helper to handle navigation
  const navigateTo = (nextStep) => {
    setHistory([...history, step]);
    setStep(nextStep);
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
    winter_prep: { question: "AI Conclusion: Winter Prep. ACTION: Normal for autumn. The colony is evicting drones to save food for winter.", options: [] }
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
  botContainer: { background: '#ffffff', borderRadius: '16px', padding: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', width: '100%', maxWidth: '450px' },
  botHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  botIcon: { fontSize: '1.5rem', background: '#fef3c7', padding: '8px', borderRadius: '50%' },
  botTitle: { margin: 0, fontSize: '1.1rem', color: '#1a202c', fontWeight: 'bold' },
  backBtn: { border: 'none', background: 'none', color: '#718096', cursor: 'pointer', fontSize: '0.8rem' },
  messageBox: { background: '#fffaf0', padding: '15px', borderRadius: '12px', marginBottom: '15px', borderLeft: '5px solid #f6ad55' },
  questionText: { margin: 0, fontSize: '0.95rem', color: '#2d3748', lineHeight: '1.5', fontWeight: '500' },
  optionsContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
  optionBtn: { background: '#fff', border: '1px solid #cbd5e0', color: '#4a5568', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', transition: '0.2s', fontWeight: '600' },
  resetBtn: { background: '#2d3748', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }
};

export default HiveKnowledgeBot;