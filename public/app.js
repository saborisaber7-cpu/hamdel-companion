// Hamdel Companion - Frontend Logic (Chat + Voice Engine)

const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');

let chatHistory = [];
let recognition = null;
let isRecording = false;

// 1. آماده‌سازی موتور تبدیل گفتار به متن (Speech-to-Text)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = 'fa-IR'; // تشخیص زبان فارسی
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => {
    isRecording = true;
    if (voiceBtn) {
      voiceBtn.style.backgroundColor = '#ef4444'; // تغییر رنگ دکمه به قرمز هنگام ضبط
      voiceBtn.title = 'در حال شنیدن...';
    }
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (transcript && transcript.trim() !== '') {
      messageInput.value = transcript;
      sendMessage();
    }
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    stopRecording();
  };

  recognition.onend = () => {
    stopRecording();
  };
} else {
  if (voiceBtn) {
    voiceBtn.title = 'مرورگر شما از ورودی صوتی پشتیبانی نمی‌کند.';
  }
}

function stopRecording() {
  isRecording = false;
  if (voiceBtn) {
    voiceBtn.style.backgroundColor = '';
    voiceBtn.title = 'ارسال صوتی';
  }
}

// 2. آماده‌سازی موتور خواندن متن با صدا (Text-to-Speech)
function speakText(text) {
  if (!('speechSynthesis' in window)) return;

  // توقف صدای در حال پخش قبلی
  window.speechSynthesis.cancel();

  // پاک کردن ایموجی‌ها و علامت‌های خاص برای روان‌تر شدن خوانش
  const cleanText = text.replace(/[*_#`~]/g, '');

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'fa-IR';
  utterance.rate = 0.95; // سرعت طبیعی
  utterance.pitch = 1.0;

  // انتخاب بهترین صدای فارسی در دسترس سیستم
  const voices = window.speechSynthesis.getVoices();
  const persianVoice = voices.find(v => v.lang.includes('fa') || v.lang.includes('IR'));
  if (persianVoice) {
    utterance.voice = persianVoice;
  }

  window.speechSynthesis.speak(utterance);
}

// بارگذاری اولیه لیست صداهای سیستم
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

// 3. توابع نمایش پیام در صفحه
function appendMessage(text, sender = 'user') {
  const msgWrapper = document.createElement('div');
  msgWrapper.className = `message-wrapper ${sender}`;

  const msgBubble = document.createElement('div');
  msgBubble.className = `message-bubble ${sender}`;
  msgBubble.innerText = text;

  const msgTime = document.createElement('span');
  msgTime.className = 'message-time';
  const now = new Date();
  msgTime.innerText = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  msgBubble.appendChild(msgTime);
  msgWrapper.appendChild(msgBubble);
  chatMessages.appendChild(msgWrapper);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 4. ارسال پیام به سرور و دریافت پاسخ هوش مصنوعی
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  appendMessage(text, 'user');
  messageInput.value = '';
  messageInput.focus();

  // نمایش حالت «در حال نوشتن...»
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'message-wrapper bot typing';
  typingIndicator.innerHTML = '<div class="message-bubble bot">در حال پاسخ...</div>';
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: text,
        history: chatHistory
      })
    });

    const data = await response.json();
    chatMessages.removeChild(typingIndicator);

    const botReply = data.reply || 'متأسفانه متوجه نشدم، دوباره بگو.';
    appendMessage(botReply, 'bot');

    // به‌روزرسانی تاریخچه گفتگو
    chatHistory.push({ role: 'user', content: text });
    chatHistory.push({ role: 'assistant', content: botReply });
    if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);

    // خواندن خودکار پاسخ هوش مصنوعی با صدا
    speakText(botReply);

  } catch (error) {
    console.error('Fetch error:', error);
    if (typingIndicator.parentNode) {
      chatMessages.removeChild(typingIndicator);
    }
    const fallbackText = 'ارتباطم یک لحظه قطع شد، لطفاً دوباره بگو.';
    appendMessage(fallbackText, 'bot');
    speakText(fallbackText);
  }
}

// 5. رویدادهای کلیک و دکمه‌ها
if (sendBtn) {
  sendBtn.addEventListener('click', sendMessage);
}

if (messageInput) {
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

if (voiceBtn) {
  voiceBtn.addEventListener('click', () => {
    if (!recognition) {
      alert('مرورگر شما از قابلیت تشخیص صدا پشتیبانی نمی‌کند. لطفاً از مرورگر کروم استفاده کنید.');
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error('Recognition start error:', err);
      }
    }
  });
}

// ثبت Service Worker برای نسخه PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('SW registration failed:', err);
    });
  });
}
