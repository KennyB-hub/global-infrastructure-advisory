(function () {
  const voiceBtn = document.getElementById('voice-flight-btn');
  const logsEl = document.getElementById('agri-logs');

  function logLine(text, cssClass = 'text-dim') {
    if (!logsEl) return;
    const p = document.createElement('p');
    p.className = cssClass;
    p.textContent = text;
    logsEl.appendChild(p);
    logsEl.scrollTop = logsEl.scrollHeight;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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

  async function sendToSeven(text) {
    logLine(`> YOU: ${text}`, 'text-dim');

    try {
      const res = await fetch('/api/voice-flight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: 'public-demo',
          role: 'farmer',
          inputType: 'text',
          text
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const displayText = data.displayText || `> SEVEN: ${data.spokenText || 'No response.'}`;
      logLine(displayText, data.priority === 'critical' ? 'text-danger' : 'text-info');

      if ('speechSynthesis' in window && data.spokenText) {
        const utter = new SpeechSynthesisUtterance(data.spokenText);
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
    voiceBtn.textContent = '🎤 Listening...';
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
      if (listening) {
        recognition.start();
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
})();
