/**
 * GIA Master Brain - Local Storage Schema (2026)
 * Purpose: Secure, offline-first storage for infrastructure data.
 */

const DB_NAME = 'GIA_Offline_Vault';
const DB_VERSION = 1;

function openGIAVault() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // 🛠️ The "Batch File" for creating the Database Structure
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. CONTRACTOR HUB: Stores blueprints and registration data
      if (!db.objectStoreNames.contains('contractors')) {
        db.createObjectStore('contractors', { keyPath: 'id', autoIncrement: true });
      }

      // 2. OUTBOX: The "Spooler" for Background Sync (Air-Gap)
      if (!db.objectStoreNames.contains('outbox')) {
        db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
      }

      // 3. CIVIL APPS: Encrypted local storage for legal filings
      if (!db.objectStoreNames.contains('civil_vault')) {
        db.createObjectStore('civil_vault', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * DOS-Style "Save" Command
 * Usage: saveToOutbox('sync-blueprints', { company: 'SAIC', file: 'data...' });
 */
async function saveToOutbox(type, payload) {
  const db = await openGIAVault();
  const tx = db.transaction('outbox', 'readwrite');
  const store = tx.objectStore('outbox');
  
  await store.add({
    type: type,
    data: payload,
    timestamp: Date.now(),
    synced: false
  });
  
  return tx.complete;
}
