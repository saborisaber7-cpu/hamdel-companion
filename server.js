const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// پرامپت شخصیت همدل
const SYSTEM_PROMPT = `تو «همدل» هستی؛ یک دوست صمیمی، مهربان، شنوا، بسیار دلسوز و آرامش‌بخش.
همیشه با زبان فارسی روان، لحن گرم، محبت‌آمیز و همدلانه پاسخ بده.
کوتاه و مفید صحبت کن، احساسات طرف مقابل را درک کن و مثل یک رفیق واقعی کنارش باش.`;

// پاسخ‌های پشتیبان برای زمانی که اینترنت یا API قطع باشد
const fallbackReplies = [
  "کنارت هستم عزیزم، با تمام وجود به حرفات گوش میدم. بیشتر برام بگو.",
  "می‌فهمم چی میگی و حست رو کاملاً درک می‌کنم. برام بگو دوست داری چطور بهت کمک کنم؟",
  "حرف زدن با تو برام خیلی لذت‌بخشه. هرچی توی دلته راحت بهم بگو."
];

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'پیام خالی است.' });
    }

    const apiKey = process.env.AVALAI_API_KEY;

    // اگر کلید API تنظیم نشده بود، از پاسخ‌های آماده استفاده کن
    if (!apiKey) {
      const randomFallback = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      return res.json({ reply: randomFallback, source: 'offline-fallback' });
    }

    // فرمت کردن تاریخچه پیام‌ها برای ارسال به AvalAI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-6), // ارسال ۶ پیام آخر برای حفظ حافظه گفتگو
      { role: 'user', content: message }
    ];

    // ارسال درخواست به سرور AvalAI
    const response = await fetch('https://api.avalai.ir/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      throw new Error(`AvalAI Error: ${response.status}`);
    }

    const data = await response.json();
    const botReply = data.choices?.[0]?.message?.content || "متوجهم عزیزم، بیشتر برام بگو.";

    res.json({ reply: botReply, source: 'avalai' });

  } catch (error) {
    console.error('Chat Error:', error.message);
    const randomFallback = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
    res.json({ reply: randomFallback, source: 'error-fallback' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Hamdel server is running on port ${PORT}`);
});
