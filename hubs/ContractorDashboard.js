import React from 'react';
import IdentityCard from '../../shared/components/IdentityCard'; // Reuse our identity card
import MediaUpload from '../../shared/components/MediaUpload'; // Reuse our share tool

export default function ContractorDashboard() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#e9ecef', minHeight: '100vh' }}>
      {/* 1. GIA Identity Badge (Technical Slate Color) */}
      

      <h1 style={{ color: '#343a40', marginTop: '30px' }}>GIA Contractor Portal</h1>
      <p>Project: Infrastructure Analysis & Ansys Simulation</p>

      {/* 2. Ansys Upload Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3>🛰️ Active Worksite GPS</h3>
          <div style={{ height: '200px', background: '#ccc', borderRadius: '8px' }}>
             {/* Map for contractors goes here */}
             <p style={{ textAlign: 'center', paddingTop: '80px' }}>[Loading Site Map Layer]</p>
          </div>
        </div>

        {/* This is the tool for 2D/3D stories and Ansys files */}
        <MediaUpload hubType="Contractor" />
      </div>

      <footer style={{ marginTop: '50px', fontSize: '0.8rem', color: '#6c757d' }}>
        GIA Intelligence | Restricted Technical Access Only
      </footer>
    </div>
  );
}
