import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Deffs } from "recharts";

const Charts = ({ history }) => {
  return (
    <div className="bee-card" style={{ padding: "20px", borderRadius: "15px", marginTop: "20px", background: "rgba(30, 30, 30, 0.8)" }}>
      <h3 style={{ color: "#ffb300", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span>📈</span> Live inside Temperature Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={history}>
          {/* Customizing the Grid to be very subtle */}
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          
          <XAxis 
            dataKey="time" 
            stroke="#666" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
          />
          
          <YAxis 
            stroke="#666" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            unit="°C"
          />
          
          {/* Customizing the Tooltip to look like dark glass */}
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "#1a1a1a", 
              border: "1px solid #ffb300", 
              borderRadius: "8px",
              color: "#fff" 
            }}
            itemStyle={{ color: "#ffb300" }}
          />
          
          {/* The Golden Line with a Glow */}
          <Line 
            type="monotone" 
            dataKey="temp" 
            stroke="#ffb300" 
            strokeWidth={4} 
            dot={{ r: 4, fill: "#ffb300", strokeWidth: 2, stroke: "#1a1a1a" }} 
            activeDot={{ r: 8, stroke: "#ffb300", strokeWidth: 2, fill: "#1a1a1a" }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;