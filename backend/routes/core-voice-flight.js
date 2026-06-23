// Ensure browser loads all voices before Seven speaks
window.speechSynthesis.onvoiceschanged = () => {
  console.log("Seven Hybrid Voices Loaded:", window.speechSynthesis.getVoices());
};

const voiceBtn = document.getElementById('voice-flight-btn');
const logsEl = document.getElementById('agri-logs');

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let listening = false;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
} else {
  console.warn('SpeechRecognition not supported in this browser.');
}

function logLine(text, cssClass = 'text-dim') {
  if (!logsEl) return;
  const p = document.createElement('p');
  p.className = cssClass;
  p.textContent = text;
  logsEl.appendChild(p);
  logsEl.scrollTop = logsEl.scrollHeight;
}
// ---------------------------------------------
// HYBRID VOICE SELECTION (Seven-of-Nine)
// ---------------------------------------------
function selectHybridVoice(mode) {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();

  // Default fallback
  let selected = voices.find(v => v.name.includes("Female")) || voices[0];

  if (mode === "rural") {
    selected = voices.find(v => v.name.includes("Serena")) || selected;
  }

  if (mode === "engineering") {
    selected = voices.find(v => v.name.includes("Jenny")) || selected;
  }

  if (mode === "emergency") {
    selected = voices.find(v => v.name.includes("Samantha")) || selected;
  }

  if (mode === "tactical") {
    selected = voices.find(v => v.name.includes("Zira")) || selected;
  }

  return selected;
}

async function sendToSeven(text) {
  logLine(`> YOU: ${text}`, 'text-dim');

  try {
    const res = await fetch('/api/voice-flight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'local-demo',
        role: 'farmer', // or contractor | emt | rescue
        inputType: 'text',
        text
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    const displayText = data.displayText || `> SEVEN: ${data.spokenText || 'No response.'}`;
    logLine(displayText, data.priority === 'critical' ? 'text-danger' : 'text-info');
    // If Seven returns a mission object, log it clearly
if (data.mission || data.rescuePlan || data.supplyPlan) {
  logLine("> MISSION: " + (data.displayText || "Mission generated."), "text-warning");
}
    // Speak back
    if ('speechSynthesis' in window && data.spokenText) {
      const utter = new SpeechSynthesisUtterance(data.spokenText);

// ⭐ Apply Seven’s hybrid voice mode
const selectedVoice = selectHybridVoice(data.mode);
if (selectedVoice) utter.voice = selectedVoice;

// ⭐ Adjust tone/cadence per mode
if (data.mode === "rural") utter.rate = 0.95;
if (data.mode === "engineering") utter.rate = 1.05;
if (data.mode === "emergency") utter.rate = 1.15;
if (data.mode === "tactical") utter.rate = 1.0;

window.speechSynthesis.speak(utter);
    }
  } catch (err) {
    console.error(err);
    logLine('> ERROR: Unable to reach Seven.', 'text-danger');
  }
}

function startListening() {
  if (!recognition) {
    logLine('> Voice not supported in this browser.', 'text-danger');
    return;
  }

  listening = true;
  voiceBtn.textContent = '🎤 Listening... (tap to stop)';
  logLine('> Voice Flight: Listening...', 'text-info');

  recognition.start();
}

function stopListening() {
  if (!recognition) return;
  listening = false;
  voiceBtn.textContent = '🎤 Voice Flight';
  recognition.stop();
  logLine('> Voice Flight: Stopped.', 'text-dim');
}

if (recognition) {
  recognition.addEventListener('result', (event) => {
    const transcript = event.results[0][0].transcript;
    sendToSeven(transcript);
  });

  recognition.addEventListener('end', () => {
    // Auto‑stop UI if user didn’t explicitly toggle
    if (listening) {
      // For continuous mode, uncomment next line:
      // recognition.start();
    } else {
      voiceBtn.textContent = '🎤 Voice Flight';
    }
  });

  recognition.addEventListener('error', (event) => {
    console.error('Speech recognition error:', event.error);
    logLine(`> Voice error: ${event.error}`, 'text-danger');
    listening = false;
    voiceBtn.textContent = '🎤 Voice Flight';
  });
}

if (voiceBtn) {
  voiceBtn.addEventListener('click', () => {
    if (!recognition) {
      logLine('> Voice not supported in this browser.', 'text-danger');
      return;
    }
    if (!listening) {
      startListening();
    } else {
      stopListening();
    }
  });
}
