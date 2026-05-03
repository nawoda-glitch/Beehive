import React, { useState } from 'react';

const HiveKnowledgeBot = () => {
  const [step, setStep] = useState('start');
  const [history, setHistory] = useState([]);

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
      question: "මීමැසි විශේෂඥ පද්ධතියට සාදරයෙන් පිළිගනිමු. ඔබගේ ප්‍රධාන ගැටලුව කුමක්ද? \n Welcome to Bee-Expert. What is your primary concern?",
      options: [
        { label: "🔊 අසාමාන්‍ය ශබ්ද (Unusual Sounds)", next: "roaring" },
        { label: "🌡️ උෂ්ණත්වය/කාලගුණ ගැටලු (Temp/Weather)", next: "heat" },
        { label: "🐝 පිවිසුම් දොරටුවේ හැසිරීම (Entrance Behavior)", next: "entrance" },
        { label: "🧐 සෞඛ්‍ය පරීක්ෂාව (Mites/Disease)", next: "health" }
      ]
    },
    // --- SOUND BRANCH ---
    roaring: {
      question: "ශබ්දය විස්තර කරන්න: \n Describe the sound:",
      options: [
        { label: "තදින් ගොරවන හඬක් (Steady roar)", next: "queenless_advice" },
        { label: "කෙටි 'හිස්' ගෑමේ ශබ්ද (Short hiss)", next: "agitated" },
        { label: "ගැහෙන සුළු ශබ්ද (Pulsating vibrations)", next: "swarm_advice" }
      ]
    },
    agitated: {
      question: "බඹරුන් හෝ වෙනත් සතුන් අවට සිටීද? \n Are there predators or hornets nearby?",
      options: [
        { label: "ඔව්, සතුරන් සිටී (Predators nearby)", next: "predator_advice" },
        { label: "නැත (No)", next: "smoke_advice" }
      ]
    },
    // --- ENTRANCE BRANCH ---
    entrance: {
      question: "පැණි මැස්සන් දොරටුව අසල හැසිරෙන්නේ කෙසේද? \n How are bees behaving at the entrance?",
      options: [
        { label: "මැස්සන් එකිනෙකා පොරබදයි (Bees fighting)", next: "robbing_advice" },
        { label: "පිටත පොකුරු ගැසී සිටියි (Bearding)", next: "bearding_check" },
        { label: "පැණි මැස්සන් මැරී වැටී සිටී (Dead bees)", next: "pesticide_advice" }
      ]
    },
    bearding_check: {
      question: "මෙය අධික උෂ්ණත්වය නිසා විය හැක. පෙට්ටිය තුල ඉඩ මදිද? \n Is the hive overcrowded or too hot?",
      options: [
        { label: "ඉතා උණුසුම් (Very hot)", next: "normal_bearding" },
        { label: "ඉඩ මදි (Not enough space)", next: "overcrowded_advice" }
      ]
    },
    // --- HEALTH BRANCH ---
    health: {
      question: "ඔබ දකින ලක්ෂණය කුමක්ද? \n What sign do you see?",
      options: [
        { label: "මැස්සන් පිටේ රතු පැහැති තිත් (Mites)", next: "varroa_advice" },
        { label: "පණුවන් කුණු වී ඇත (Rotten brood)", next: "brood_issue" },
        { label: "පියාඹා ගත නොහැකිව බිම වැටී සිටීම (Crawling)", next: "disease_advice" }
      ]
    },
    // --- FINAL ADVICE RESULTS ---
    queenless_advice: { 
        question: "නිගමනය: රැජින අහිමි වී ඇත. \n Action: Probable Queenlessness. බිත්තර පරීක්ෂා කරන්න. නව රැජිනක හඳුන්වා දෙන්න.", 
        options: [] 
    },
    swarm_advice: { 
        question: "නිගමනය: මැසි ජනපදය බෙදී යාමට සූදානම් වේ. \n Action: Swarm Fever. අලුත් පෙට්ටියක් එක් කරන්න.", 
        options: [] 
    },
    predator_advice: { 
        question: "නිගමනය: සතුරන්ගේ බලපෑම. \n Action: Predator Stress. දොරටුව කුඩා කරන්න (Robbing Screen).", 
        options: [] 
    },
    pesticide_advice: { 
        question: "නිගමනය: කෘමිනාශක විෂ වීම. \n Action: Pesticide Poisoning. පිරිසිදු ජලය ලබා දෙන්න.", 
        options: [] 
    },
    robbing_advice: { 
        question: "නිගමනය: කොල්ලකෑම (හදිසි). \n Action: ROBBING EVENT. දොරටුව වහාම අඟලක් දක්වා අඩු කරන්න.", 
        options: [] 
    },
    normal_bearding: { 
        question: "නිගමනය: සාමාන්‍ය තත්වයකි. \n Action: Normal Cooling. සෙවණ ලබා දෙන්න.", 
        options: [] 
    },
    overcrowded_advice: { 
        question: "නිගමනය: ඉඩ ප්‍රමාණවත් නොවේ. \n Action: Space Issues. අමතර තට්ටුවක් (Super) එක් කරන්න.", 
        options: [] 
    },
    varroa_advice: { 
        question: "නිගමනය: මයිටා ආසාදනය. \n Action: Mite Infestation. ෆෝමික් ඇසිඩ් හෝ ස්වභාවික ප්‍රතිකාර යොදන්න.", 
        options: [] 
    },
    brood_issue: { 
        question: "නිගමනය: රෝගී තත්වයකි. \n Action: Brood Disease. පළපුරුදු අයෙකුගේ සහය ලබා ගන්න.", 
        options: [] 
    },
    disease_advice: { 
        question: "නිගමනය: පියාපත් ආබාධ හෝ වෙනත් රෝග. \n Action: Disease. ආසාදිත මැස්සන් වෙන් කරන්න.", 
        options: [] 
    },
    smoke_advice: { 
        question: "නිගමනය: මැස්සන් කලබල වී ඇත. \n Action: Normal Agitation. දුම් භාවිතා කර සෙමින් වැඩ කරන්න.", 
        options: [] 
    }
  };

  const currentStep = knowledgeTree[step] || knowledgeTree['start'];

  return (
    <div style={styles.botContainer} className="bee-card">
      <div style={styles.botHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={styles.botIcon}>🐝</span>
          <h4 style={styles.botTitle}>සහායක බොට් / Helper Bot</h4>
        </div>
        {step !== 'start' && (
          <button onClick={goBack} style={styles.backBtn}>← ආපසු / Back</button>
        )}
      </div>
      
      <div style={styles.messageBox}>
        <p style={styles.questionText}>
          {currentStep.question.split('\n').map((line, i) => (
            <span key={i} style={{ display: 'block', marginBottom: i === 0 ? '5px' : '0', color: i === 0 ? '#fff' : '#aaa', fontSize: i === 0 ? '1rem' : '0.8rem' }}>
              {line}
            </span>
          ))}
        </p>
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
            මුල සිට ආරම්භ කරන්න / Restart
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  botContainer: { 
    background: 'rgba(30, 30, 30, 0.85)', 
    borderRadius: '24px', 
    padding: '24px', 
    boxShadow: '0 15px 45px rgba(0,0,0,0.5)', 
    border: '1px solid rgba(255, 179, 0, 0.1)', 
    width: '100%', 
    maxWidth: '480px',
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
    fontSize: '1.4rem', 
    background: 'linear-gradient(145deg, #ffb300, #ff8f00)', 
    padding: '10px', 
    borderRadius: '16px',
    boxShadow: '0 4px 10px rgba(255, 143, 0, 0.3)'
  },
  botTitle: { 
    margin: 0, 
    fontSize: '0.85rem', 
    color: '#fff', 
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  backBtn: { 
    border: 'none', 
    background: 'rgba(255,255,255,0.05)', 
    color: '#888', 
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer', 
    fontSize: '0.7rem',
    fontWeight: 'bold',
    transition: 'all 0.2s'
  },
  messageBox: { 
    background: 'rgba(255, 255, 255, 0.02)', 
    padding: '20px', 
    borderRadius: '18px 18px 18px 4px', 
    marginBottom: '25px', 
    border: '1px solid rgba(255, 179, 0, 0.1)',
    position: 'relative'
  },
  questionText: { 
    margin: 0, 
    lineHeight: '1.5'
  },
  optionsContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px' 
  },
  optionBtn: { 
    background: 'rgba(255, 179, 0, 0.05)', 
    border: '1px solid rgba(255, 179, 0, 0.2)', 
    color: '#ffb300', 
    padding: '16px', 
    borderRadius: '14px', 
    cursor: 'pointer', 
    fontSize: '0.9rem', 
    textAlign: 'left', 
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
    fontWeight: '600',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resetBtn: { 
    background: 'linear-gradient(90deg, #ffb300, #ff8f00)', 
    color: '#000', 
    border: 'none', 
    padding: '16px', 
    borderRadius: '14px', 
    cursor: 'pointer', 
    fontWeight: '900',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    marginTop: '10px',
    boxShadow: '0 6px 20px rgba(255, 179, 0, 0.3)'
  }
};

export default HiveKnowledgeBot;