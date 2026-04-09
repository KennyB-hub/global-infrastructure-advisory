// frontend/src/hubs/PublicHub/DecoyBlueprint.js
import React, { useState, useEffect } from 'react';

export default function DecoyBlueprint() {
  const [concept, setConcept] = useState({ id: 'GIA-001', img: '/assets/ai-gen/concept-1.png' });

  useEffect(() => {
    // Logic to refresh concept every 15 mins
    const interval = setInterval(() => {
      const timeID = Math.floor(Date.now() / (15 * 60 * 1000));
      setConcept({ 
        id: `CONCEPT-${timeID}`, 
        img: `/assets/ai-gen/concept-${timeID % 5}.png` // Cycle through AI decoys
      });
    }, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#fff' }}>
      <h4 style={{ color: '#2d5a27' }}>Draft Proposal: {concept.id}</h4>
      <img src={concept.img} alt="AI Conceptual Blueprint" style={{ width: '100%', borderRadius: '4px' }} />
      <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '10px' }}>
        *AI-generated conceptual model for regional planning. Refreshes every 15m.
      </p>
    </div>
  );
}
