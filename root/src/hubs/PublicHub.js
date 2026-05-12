// frontend/src/hubs/PublicHub/PublicDashboard.js
import React from 'react';
import GPSMonitor from '../FarmerHub/GPSMonitor'; // Reuse the SAME mapping tool

export default function PublicDashboard() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
      {/* 1. GIA MISSION LOGO (No Identity Card needed for Public) */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <img src="/assets/gia-logo.png" alt="GIA Intelligence" style={{ width: '80px' }} />
        <h1 style={{ color: '#2d5a27' }}>GIA Global Insight</h1>
        <p>Public Information & Community Mapping</p>
      </div>

      {/* 2. THE MAP (Masked Layer) */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h3>🛰️ Regional Activity Map</h3>
        <p style={{ fontSize: '0.8rem', color: '#666' }}>Generalized data for public awareness.</p>
        
        {/* We use the same component, but the backend handles the restriction */}
        <GPSMonitor hubType="Public" />
      </div>

      {/* 3. CALL TO ACTION */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button style={{ padding: '10px 20px', backgroundColor: '#2d5a27', color: 'white', border: 'none', borderRadius: '5px' }}>
          Apply to be a Pilot Farmer
        </button>
      </div>
    </div>
  );
}
