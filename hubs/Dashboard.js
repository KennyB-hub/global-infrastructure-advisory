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

// frontend/src/shared/components/MediaUpload.js
import React, { useState } from 'react';

export default function MediaUpload({ hubType }) {
  const [text, setText] = useState("");
  
  const handleUpload = () => {
    // Logic to push to /api/farmer/upload or /api/contractor/upload
    console.log(`Uploading ${hubType} experience...`);
    alert("Experience shared with GIA Intelligence!");
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
      <h3>{hubType === 'Farmer' ? '🌱 Share Your Field Story' : '🛠️ Upload Ansys Design/Report'}</h3>
      
      <textarea 
        placeholder={hubType === 'Farmer' ? "How are the crops looking today?" : "Describe the Ansys 3D simulation results..."}
        style={{ width: '100%', height: '80px', borderRadius: '8px', padding: '10px' }}
        onChange={(e) => setText(e.target.value)}
      />

      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
        <input type="file" accept="image/*,.pdf,.zip" />
        <button 
          onClick={handleUpload}
          style={{ backgroundColor: '#2d5a27', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none' }}
        >
          Submit to GIA
        </button>
      </div>
    </div>
  );
}
