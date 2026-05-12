// public/sw.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-blueprints') {
    event.waitUntil(uploadPendingData());
  }
});

async function uploadPendingData() {
  // 1. Open your 'DOS-style' local database (IndexedDB)
  const db = await openDatabase();
  const pending = await db.getAll('outbox');

  // 2. Loop through and push to your Cloudflare Worker
  for (const item of pending) {
    try {
      await fetch('/api/air-gap-sync', {
        method: 'POST',
        body: JSON.stringify(item),
        headers: { 'Content-Type': 'application/json' }
      });
      // 3. If successful, delete from local outbox
      await db.delete('outbox', item.id);
    } catch (err) {
      console.error("Sync failed, will retry when signal returns.");
    }
  }
}
