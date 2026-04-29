async function registerContractor(data) {
  const registration = await navigator.serviceWorker.ready;
  
  // Save to local 'outbox' first (Safety First!)
  await saveDataToIndexedDB(data);

  // Tell the system to sync as soon as it can
  if ('sync' in registration) {
    await registration.sync.register('sync-blueprints');
    alert("Offline: Your data is queued and will sync when a signal is found.");
  } else {
    // Fallback for older systems
    sendNow(data);
  }
}
