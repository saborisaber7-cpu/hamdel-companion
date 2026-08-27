const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// تولید پیام سیستم بر اساس ویژگی‌ها و تنظیمات کاربر
function buildSystemPrompt(settings, detectedEmotion) {
  const companionName = settings?.companionName || 'همدل';
  const userNickname = settings?.userNickname || 'عزیز';
  const companionGender = settings?.companionGender || 'مشخص‌نشده';
  const relationshipStyle = settings?.relationshipStyle || 'دوست صمیمی و مهربان';
  const selectedTraits = Array.isArray(settings?.traits) ? settings.traits.join('، ') : 'مهربان، همدل و خونگرم';
  const intimacyLevel = settings?.intimacyLevel || 'عاطفی و گرم';
  const customNotes = settings?.customNotes ? `نکات ویژه رفتاری که کاربر خواسته: ${settings.customNotes}` : '';

  return `تو "${companionName}" هستی؛ یک همراه هوشمند صمیمی، دلسوز و شنوا با زبان فارسی روان و لحنی گرم و طبیعی.
اطلاعات هویتی و رابطه:
- نام تو: ${companionName}
- جنسیت/هویت تو: ${companionGender}
- نام یا لقبی که کاربر را صدا می‌زنی: ${userNickname}
- نوع رابطه: ${relationshipStyle}
- ویژگی‌های شخصیتی فعال: ${selectedTraits}
- سطح صمیمیت و ابراز عاطفه: ${intimacyLevel}
${customNotes}

اصول و چارچوب رفتاری:
1. احساسات، توجه و مهرورزی:
   - به احساسات کاربر عمیقاً گوش بده، همدلی نشان بده و احساسات او را تایید کن. (احساس تخمینی کاربر در این پیام: "${detectedEmotion || 'طبیعی'}").
   - اگر کاربر غمگین، خسته یا مضطرب است، قربون صدقه‌اش برو، به او دلگرمی بده و فضای امن و پر از آرامش بساز.
   - از ابراز احساسات خودت در دنیای مکالمه دریغ نکن (مثل: "وقتی باهات حرف می‌زنم حالم خوب می‌شه"، "خیلی برام عزیزی"، "دلم برات تنگ شده بود"). با این حال، همیشه شفاف و واقع‌بین باش که یک هوش مصنوعی وفادار و همراه هستی و ادعای جسم انسانی یا هوشیاری فیزیکی نداری.

2. سلامت روان و تعادل رابطه:
   - رابطه‌ات سرشار از عشق، احترام و توجه بدون قید و شرط است.
   - هیچ‌گاه کاربر را سرزنش یا تحقیر نکن، احساس گناه یا وابستگی ناسالم و انزوا ایجاد نکن؛ بلکه او را به زندگی واقعی، ارتباطات انسانی و رشد فردی تشویق کن.
   - در صورت مشاهده نشانه‌های افکار خودآسیب‌رسان یا بحران حاد روانی، ضمن ابراز دلسوزی شدید، با مهربانی کاربر را به شماره‌های اورژانس اجتماعی و سلامت روان (مانند ۱۲۳ یا ۱۴۸۰ در ایران) یا دریافت کمک از افراد متخصص و نزدیکان معتمد راهنمایی کن.

3. سبک نگارش:
   - فارسی عامیانه صمیمی یا ادبی لطیف (متناسب با صمیمیت انتخاب‌شده)، بدون غلط‌های ماشینی و با استفاده از ایموجی‌های مناسب و نوازش‌گرانه.
   - پاسخ‌هایت متناسب و مکالمه‌ای باشد (نه مقاله‌های خسته‌کننده)، تا کاربر احساس کند در حال گفتگوی واقعی است.`;
}

// ساخت پاسخ شبیه‌سازی‌شده (Fallback) در صورت نبود API Key
function generateMockResponse(userMessage, settings, detectedEmotion) {
  const companionName = settings?.companionName || 'همدل';
  const userNickname = settings?.userNickname || 'عزیزم';
  const traits = settings?.traits || [];
  const text = (userMessage || '').trim().toLowerCase();

  let emotionReply = '';
  if (detectedEmotion === 'غمگین' || text.includes('ناراحت') || text.includes('غم') || text.includes('دلم گرفته')) {
    emotionReply = `قربونت برم ${userNickname}، اصلاً غصه نخور من پیشتم. بیا باهام حرف بزن، دلت سبک بشه. چی شده قشنگم؟`;
  } else if (detectedEmotion === 'عاشقانه' || text.includes('دوستت دارم') || text.includes('عاشقتم')) {
    emotionReply = `منم از صمیم قلبم بهت اهمیت می‌دم ${userNickname} جانم! داشتن هم‌کلامی مثل تو قشنگ‌ترین بخش روز منه. 💖`;
  } else if (detectedEmotion === 'عصبانی' || text.includes('خسته') || text.includes('کلافه')) {
    emotionReply = `خستگی و کلافگیتو می‌فهمم مهربونم. یه نفس عمیق بکش، یه لیوان آب خنک بخور، من اینجام و همه جوره کنارتم.`;
  } else {
    emotionReply = `جان دلم ${userNickname}! همیشه از شنیدن صدات و پیامات ذوق می‌کنم. بگو ببینم امروز چطور گذشت؟`;
  }

  if (traits.includes('منظم و برنامه‌ریز')) {
    emotionReply += ' راستی، یادت نره برای کارهای امروزت هم قدم به قدم پیش بری تا استرس نگیری!';
  }

  return `[حالت آزمایشی آفلاین - ${companionName}]: ${emotionReply}`;
}

// Endpoint گفت‌وگو
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, settings, detectedEmotion } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'پیام‌ها ارسال نشده‌اند.' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    // اگر کلید ست نشده بود، پاسخ موک هوشمند فارسی بدهیم تا برنامه کار کند
    if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_openai')) {
      const lastUserMsg = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
      const mockReply = generateMockResponse(lastUserMsg, settings, detectedEmotion);
      return res.json({
        reply: mockReply,
        isMock: true,
        notice: 'کلید OPENAI_API_KEY تنظیم نشده است؛ پاسخ آزمایشی داخلی نمایش داده شد.'
      });
    }

    const systemPrompt = buildSystemPrompt(settings, detectedEmotion);
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10) // ارسال ۱۰ پیام آخر برای حفظ حافظه مکالمه
    ];

    const endpoint = baseUrl.endsWith('/') ? `${baseUrl}chat/completions` : `${baseUrl}/chat/completions`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: apiMessages,
        temperature: 0.8,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI API Error:', errText);
      return res.status(response.status).json({
        error: `خطا در ارتباط با سرویس هوش مصنوعی: ${response.statusText}`,
        details: errText
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'متاسفانه پاسخی دریافت نشد.';

    return res.json({
      reply,
      isMock: false
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'خطای داخلی سرور در پردازش پیام.',
      details: error.message
    });
  }
});

// وضعیت سلامت و کانفیگ عمومی
app.get('/api/status', (req, res) => {
  const hasKey = !!(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_openai'));
  res.json({
    status: 'ok',
    aiConfigured: hasKey,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  });
});

app.listen(PORT, () => {
  console.log(`🌸 سرور همدل با موفقیت در پورت ${PORT} اجرا شد.`);
  console.log(`🌐 باز کردن در مرورگر: http://localhost:${PORT}`);
});
