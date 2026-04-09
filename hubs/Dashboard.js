// frontend/src/hubs/FarmerHub/Dashboard.js
import React, { useState, useEffect } from 'react';

export default function FarmerDashboard() {
  const [status, setStatus] = useState("Awaiting GPS...");

  const sendPing = async () => {
    setStatus("Syncing with GIA...");
    try {
      // This hits your backend/routes/farmer-routes.js
      const response = await fetch('/api/farmer/ping', { method: 'POST' });
      const data = await response.json();
      setStatus(`Last Sync: ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      setStatus("Sync Error: Check Connectivity");
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f4f7f6' }}>
      <h1 style={{ color: '#2d5a27' }}>GIA Farmer Hub</h1>
      <div style={{ margin: '40px 0', fontSize: '1.2rem' }}>{status}</div>
      
      {/* Big high-visibility button for field use */}
      <button 
        onClick={sendPing}
        style={{ 
          padding: '20px 40px', 
          fontSize: '1.5rem', 
          backgroundColor: '#4CAF50', 
          color: 'white', 
          borderRadius: '10px',
          border: 'none'
        }}
      >
        🛰️ SYNC GPS DATA
      </button>
    </div>
  );
}
