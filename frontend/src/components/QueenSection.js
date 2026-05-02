import React from 'react';

const QueenSection = ({ result, onUpload, setFile }) => {
  return (
    <div style={{ background: "white", padding: "20px", borderRadius: "15px", marginTop: "20px" }}>
      <h3>👑 Queen Bee Analysis</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button 
        onClick={onUpload}
        style={{ marginLeft: "10px", padding: "8px 16px", cursor: "pointer" }}
      >
        Analyze Audio
      </button>

      {result && (
        <div style={{ 
          marginTop: "15px", 
          padding: "10px", 
          borderRadius: "8px", 
          backgroundColor: result.prediction === "queen_missing" ? "#fff5f5" : "#f0fff4",
          border: `1px solid ${result.prediction === "queen_missing" ? "red" : "green"}`
        }}>
          <strong>Result:</strong> {result.prediction} ({result.confidence}%)
        </div>
      )}
    </div>
  );
};

export default QueenSection;