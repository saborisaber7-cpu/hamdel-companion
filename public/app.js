// Hamdel Voice Companion Client PWA
document.addEventListener('DOMContentLoaded', () => {
  const messagesContainer = document.getElementById('messages');
  const userInput = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const micBtn = document.getElementById('mic-btn');
  const statusEl = document.getElementById('status');

  let isListening = false;
  let recognition = null;
  let synth = window.speechSynthesis || null;

  // Initialize Web Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'fa-IR';

    recognition.onstart = () => {
      isListening = true;
      micBtn.classList.add('active');
      updateStatus('در حال شنیدن...', 'listening');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim() !== '') {
        userInput.value = transcript;
        sendMessage(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      stopListening();
      if (event.error === 'not-allowed') {
        updateStatus('دسترسی میکروفون مسدود است', '');
      } else {
        updateStatus('آماده گفتگو', '');
      }
    };

    recognition.onend = () => {
      stopListening();
    };
  } else {
    micBtn.title = 'تشخیص گفتار در این مرورگر پشتیبانی نمی‌شود';
    micBtn.style.opacity = '0.5';
  }

  function startListening() {
    if (!recognition) {
      alert('مرورگر شما از تشخیص صدای آنلاین پشتیبانی نمی‌کند. لطفاً از مرورگرهای مدرن مثل کروم استفاده فرمایید.');
      return;
    }
    if (synth && synth.speaking) {
      synth.cancel();
    }
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      stopListening();
    }
  }

  function stopListening() {
    isListening = false;
    micBtn.classList.remove('active');
    if (statusEl.textContent === 'در حال شنیدن...') {
      updateStatus('آماده گفتگو', '');
    }
  }

  function updateStatus(text, className) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.className = 'status-badge ' + (className || '');
  }

  function appendMessage(text, isUser = false) {
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble ' + (isUser ? 'user-message' : 'bot-message');

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;

    const time = document.createElement('span');
    time.className = 'message-time';
    const now = new Date();
    time.textContent = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    bubble.appendChild(content);
    bubble.appendChild(time);
    messagesContainer.appendChild(bubble);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function speakPersian(text) {
    if (!synth) return;
    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fa-IR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to find Persian voice if available
    const voices = synth.getVoices();
    const faVoice = voices.find(v => v.lang.includes('fa') || v.lang.includes('IR'));
    if (faVoice) {
      utterance.voice = faVoice;
    }

    utterance.onstart = () => {
      updateStatus('در حال پاسخ صوتی...', 'speaking');
    };

    utterance.onend = () => {
      updateStatus('آماده گفتگو', '');
    };

    utterance.onerror = () => {
      updateStatus('آماده گفتگو', '');
    };

    synth.speak(utterance);
  }

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    appendMessage(trimmed, true);
    userInput.value = '';
    updateStatus('در حال تفکر...', 'thinking');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: trimmed })
      });

      if (!response.ok) {
        throw new Error('خطا در برقراری ارتباط با سرور');
      }

      const data = await response.json();
      const botReply = data.reply || 'متأسفانه پاسخی دریافت نشد.';
      
      appendMessage(botReply, false);
      updateStatus('آماده گفتگو', '');
      speakPersian(botReply);

    } catch (err) {
      console.error(err);
      appendMessage('متأسفانه در اتصال به سرور مشکلی پیش آمد. لطفا دوباره تلاش کنید.', false);
      updateStatus('خطا در اتصال', '');
    }
  }

  // Event Listeners
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if (isListening) {
        if (recognition) recognition.stop();
        stopListening();
      } else {
        startListening();
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      sendMessage(userInput.value);
    });
  }

  if (userInput) {
    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage(userInput.value);
      }
    });
  }

  // Register Service Worker for PWA offline capabilities
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('SW registration failed: ', err);
      });
    });
  }
});
