import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../config"; // Adjust the dots based on folder depth

function ChatbotSection() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Welcome to the Bee-Expert Knowledge Base. What is the primary concern?" }
  ]);
  const scrollRef = useRef(null);

  const quickActions = [
    { label: "Unusual Sounds (Roaring/Hissing)", icon: "🔊" },
    { label: "Temperature/Weather Issues", icon: "🌡️" },
    { label: "Entrance Behavior (Bearding/Fighting)", icon: "🐝" },
    { label: "Health Inspection (Mites/Brood)", icon: "🧐" },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleActionClick = (actionLabel) => {
    sendMessage(actionLabel);
  };

  const sendMessage = async (overrideInput) => {
    const textToSend = overrideInput || input;
    if (!textToSend) return;

    const userMsg = { sender: "user", text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      // BEFORE: fetch("https://beehiveapi.vercel.app/api", ...)
// AFTER:
const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: textToSend })
});
      const data = await response.json();
      setMessages(prev => [...prev, { sender: "bot", text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: "bot", text: "⚠️ System offline. Check ML server." }]);
    }
  };

  return (
    <div className="dashboard-card chatbot-card">
      <div className="chat-header">
        <div className="bot-avatar">🐝</div>
        <div className="header-info">
            <h3 className="gold-text">Hive Expert Bot</h3>
            <span className="online-indicator">● System Active</span>
        </div>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === "user" ? "msg-user" : "msg-bot"}>
            {msg.text}
          </div>
        ))}

        {/* GOLDEN QUICK ACTIONS */}
        <div className="quick-actions-grid">
          {quickActions.map((action, idx) => (
            <button 
              key={idx} 
              className="action-pill"
              onClick={() => handleActionClick(action.label)}
            >
              <span className="pill-icon">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chat-input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about hive health..."
          className="chat-input"
        />
        <button onClick={() => sendMessage()} className="send-btn-gold">
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatbotSection;