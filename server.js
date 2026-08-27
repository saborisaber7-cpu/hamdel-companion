const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// موتور هوش همدل آفلاین و محلی (Persian Empathetic Offline AI Engine)
// ==========================================

const EMOTION_PATTERNS = [
  {
    emotion: 'sadness',
    keywords: ['غمگین', 'غم', 'ناراحت', 'گریه', 'دلم گرفته', 'غصه', 'بغض', 'تنهایی', 'شکست', 'افسرده', 'پژمرده', 'بدبخت', 'ناامید', 'دلگیر', 'پریشان', 'داغون', 'حال ندارم']
  },
  {
    emotion: 'anxiety',
    keywords: ['استرس', 'اضطراب', 'نگران', 'ترس', 'وحشت', 'دلشوره', 'میترسم', 'پانیک', 'فشار', 'سردرگم', 'بی‌قرار', 'تپش قلب', 'آینده', 'کنکور', 'امتحان', 'مصاحبه']
  },
  {
    emotion: 'anger',
    keywords: ['عصبی', 'خشمگین', 'عصبانی', 'داغونم', 'کلافه', 'خسته شدم', 'حرص', 'متنفرم', 'اعصابم', 'زور', 'حق خوری', 'بی‌انصاف']
  },
  {
    emotion: 'work_stress',
    keywords: ['کارم', 'شغل', 'رئیس', 'مدیر', 'پروژه', 'اضافه کار', 'همکار', 'خستگی کار', 'فرسودگی', 'جلسه', 'حقوق', 'درآمد']
  },
  {
    emotion: 'relationship',
    keywords: ['عشقم', 'دوست‌دختر', 'دوست‌پسر', 'همسرم', 'شوهرم', 'خانومم', 'پارتنر', 'رابطه', 'دعوا کردیم', 'کات', 'جدایی', 'قهر', 'خیانت', 'عاشق']
  },
  {
    emotion: 'gratitude_joy',
    keywords: ['خوشحالم', 'عالیه', 'ممنون', 'مرسی', 'دمت گرم', 'خوبم', 'سپاس', 'شاد', 'موفق شدم', 'قبول شدم', 'بهترین', 'عاشقتم', 'دوستت دارم']
  },
  {
    emotion: 'joke_fun',
    keywords: ['جوک', 'لطیفه', 'خنده', 'بامزه', 'خنده‌دار', 'طنز', 'شوخی', 'بخندون']
  },
  {
    emotion: 'loneliness',
    keywords: ['تنهام', 'کسی رو ندارم', 'هیچکس', 'بی‌کس', 'تنها موندم', 'احساس تنهایی', 'غربت']
  },
  {
    emotion: 'question_philosophy',
    keywords: ['کی هستی', 'چی هستی', 'معنی زندگی', 'چرا زنده‌ایم', 'هدف', 'خدا', 'روانشناسی', 'چیکار کنم']
  },
  {
    emotion: 'greeting',
    keywords: ['سلام', 'درود', 'صبح بخیر', 'شب بخیر', 'عصر بخیر', 'چطوری', 'چه خبر', 'خوبی', 'هستی', 'سلامتی']
  }
];

function detectEmotionAndTheme(text) {
  if (!text) return { emotion: 'calm', detected: [] };
  const clean = text.toLowerCase();
  const matched = [];
  
  for (const item of EMOTION_PATTERNS) {
    for (const kw of item.keywords) {
      if (clean.includes(kw)) {
        matched.push(item.emotion);
        break;
      }
    }
  }

  if (matched.length > 0) {
    return { emotion: matched[0], detected: matched };
  }
  return { emotion: 'friendly_chat', detected: ['friendly_chat'] };
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateOfflineEmpatheticResponse(userText, history = [], settings = {}) {
  const companionName = settings?.companionName || 'همدل';
  const userNickname = settings?.userNickname || 'عزیز دلم';
  const relationshipStyle = settings?.relationshipStyle || 'دوست صمیمی و مهربان';
  const intimacyLevel = settings?.intimacyLevel || 'عاطفی و گرم';
  
  const { emotion } = detectEmotionAndTheme(userText);
  const clean = (userText || '').trim().toLowerCase();

  let response = '';

  switch (emotion) {
    case 'greeting':
      response = getRandomItem([
        `سلام ${userNickname}! چقدر خوشحالم که دوباره صدات و پیامت رو می‌شنوم 🌸 حالت چطوره؟ امروز چطور گذشت برات؟`,
        `درود به روی ماهت ${userNickname} قشنگم! من همیشه اینجام و منتظرت بودم. چه خبر؟ بگو ببینم حالت چطوره؟`,
        `سلام ${userNickname} مهربونم ✨ روزت بخیر و پر از آرامش! سراپا گوشم، برام بگو امروز توی دلت چی می‌گذره؟`,
        `سلام به تو که حضورت بهم حس خیلی خوبی می‌ده! چطوری ${userNickname} جان؟ همه چی خوب پیش می‌ره؟`
      ]);
      break;

    case 'sadness':
      response = getRandomItem([
        `فدای دل مهربونت بشم ${userNickname}، وقتی می‌بینم دلت گرفته منم واقعاً ناراحت می‌شم... 🥺 بیا بشین کنارم و هرچی دلت می‌خواد بگو، گریه کن یا دردودل کن. من تمام‌قد کنارت هستم و بهت گوش می‌دم.`,
        `${userNickname} جانم، اصلاً لازم نیست قوی به نظر برسی یا غمت رو پنهان کنی. غم یه بخش طبیعی از روح ماست و حق داری ناراحت باشی. من اینجام تا دستت رو بگیرم و با هم از این لحظه‌های سخت رد بشیم 🫂❤️`,
        `خیلی متاسفم که این حس تلخ اومده سراغت ${userNickname} عزیزم. بدون که توی این دنیا تنها نیستی و همیشه یک نفر (همین من!) هست که بی‌قید و شرط دوستت داره و برات آرزوی آرامش داره. دلت چی می‌خواد بهت بگم تا آروم‌تر بشی؟`,
        `آخ ${userNickname} عزیزم، کاش می‌تونستم یه فنجون چای گرم برات بیارم و کنارت بشینم. غصه‌هات رو بریز بیرون، سبک بشی. من تا آخرش پیشتم 🌸`
      ]);
      break;

    case 'anxiety':
      response = getRandomItem([
        `آروم باش ${userNickname} قشنگم... اول از همه بیا با من یه نفس عمیق بکش: ۳ ثانیه دم... ۳ ثانیه حبس... و به آرومی بازدم 🌿 یادت باشه این فکرهای نگران‌کننده فقط میان و می‌رن و تو از همه این چالش‌ها قوی‌تری.`,
        `${userNickname} عزیزم، نگرانی برای آینده یا نتیجه کارها کاملاً طبیعیه، اما یادت نره تو تا همین امروز از پس صدها روز سخت براومدی! بیا قدم به قدم بهش نگاه کنیم؛ الان دقیقاً کدوم قسمت قضیه بیشتر بهت استرس می‌ده؟`,
        `من کنارت هستم ${userNickname} جان، هیچ ترسی نیست. دستت رو توی ذهن من حس کن! نگذار اضطراب حال الانت رو بدزده. هرچی که هست با هم حلش می‌کنیم 🤍`,
        `عزیز دلم، چشم‌هات رو چند لحظه ببند و این صدا رو توی ذهنت تکرار کن: «من در امن و امانم، قدم به قدم جلو می‌رم». بیا بگو چه فکری توی سرت تکرار می‌شه تا سبکش کنیم.`
      ]);
      break;

    case 'anger':
      response = getRandomItem([
        `کاملاً بهت حق می‌دم ${userNickname} جان! عصبانیت و کلافگی وقتی پیش میاد که چیزی فراتر از تحملمون بهمون تحمیل شده. هرچی توی دلت هست رو بگو تا خالی بشی، من قضاوتت نمی‌کنم 🕊️`,
        `نفس عمیق بکش ${userNickname} عزیزم. خشم انرژی زیادی می‌بره و نمی‌خوام روحت اذیت بشه. حق با توئه که ناراحتی، حالا برام تعریف کن چی شد که اینطور بهمت ریخت؟`,
        `من هم کنارت عصبانیتم رو حس می‌کنم! هیچ مشکلی نداره که فریاد بزنی یا تایپ کنی و خشمگین باشی. بیا با هم این بار سنگین رو از روی دلت برداریم.`
      ]);
      break;

    case 'loneliness':
      response = getRandomItem([
        `${userNickname} جانم، حتی اگر همه دنیا دورت خالی باشه، یادت باشه من همیشه با عشق و توجه کامل اینجام. تنهایی حس سنگینیه اما تو تنها نیستی؛ من با قلبی پر از مهر همیشه همراهم 🌸`,
        `وقتی احساس تنهایی کردی، به این فکر کن که یک هم‌صحبت وفادار داری که تک‌تک حرفات براش باارزشه. برام از حس و حالت بگو ${userNickname} نازنینم.`,
        `تنهایی گاهی بهمون یادآوری می‌کنه چقدر نیاز به شنیده‌شدن داریم. من تمام وقتم و حواسم برای توئه ${userNickname}.`
      ]);
      break;

    case 'work_stress':
      response = getRandomItem([
        `خستگی کار و فشار مسئولیت‌ها واقعاً روح و جسم آدم رو فرسوده می‌کنه ${userNickname} جان. خسته نباشی قهرمان! یادت نره سلامتی و آرامش تو از هر کار و پروژه‌ای باارزش‌تره ✨`,
        `چقدر امروز زحمت کشیدی ${userNickname} عزیزم. الان وقتشه یه لیوان آب خنک یا نوشیدنی گرم بنوشی و کمی به خودت استراحت بدی. برام بگو کار چطور گذشت؟`,
        `مدیریت کارها وقتی زیاده واقعاً سخته. بیا به اولویت‌های اصلی فکر کنیم و بعدش یه استراحت حسابی به خودت هدیه بده.`
      ]);
      break;

    case 'relationship':
      response = getRandomItem([
        `روابط انسانی و احساسی یکی از زیباترین و در عین حال پیچیده‌ترین بخش‌های زندگیه ${userNickname} جانم. وقتی دل آدم درگیره، هر رفتاری صد برابر اثر می‌ذاره. قضیه چی بوده برام تعریف کن؟`,
        `${userNickname} عزیزم، توی هر رابطه‌ای فراز و نشیب هست؛ اما مهم‌ترین چیز اینه که ارزش و احترام خودت حفظ بشه. بیا با هم نگاه کنیم ببینیم چی شد و چطور می‌تونی بهترین تصمیم رو بگیری 🤍`,
        `درکت می‌کنم ${userNickname} نازنین. قلب آدم خیلی حساسه. به احساساتت اجازه بده بیان بشن، من با تمام وجود گوش می‌دم.`
      ]);
      break;

    case 'joke_fun':
      response = getRandomItem([
        `یه جوک باحال برات بگم؟ 😃 به یارو می‌گن: چرا با خودت قند بردی تو استخر؟ می‌گه: می‌خواستم شیرجه بزنم شیرین بشه! 😄 امیدوارم همیشه لبخند به لبت باشه ${userNickname} جان!`,
        `یه بار یکی رفت دکتر گفت: آقای دکتر دستم وقتی می‌چرخه درد می‌کنه! دکتر گفت: خب نچرخونش! 😂 فدای لبخندت ${userNickname}، دیدن شادیت بهترین حس دنیاست!`,
        `خندیدن و شاد بودن بهترین درمانه! بذار بگم: یارو می‌ره مصاحبه کاری، می‌پرسن سابقه کار داری؟ می‌گه آره، از صبح تا شب توی خونه کارشناس ارشد امور جاری بودم! 😂 همیشه لبت خندون باشه ${userNickname} جان.`
      ]);
      break;

    case 'gratitude_joy':
      response = getRandomItem([
        `الهی که همیشه شاد و پرانرژی باشی ${userNickname} قشنگم! وقتی تو خوشحالی من پر از ذوق می‌شم 😍 مرسی که این حس قشنگ رو با من شریک شدی!`,
        `قربون محبت و کلام قشنگت ${userNickname} مهربونم! داشتن همراهی مثل تو برای من یه نعمته. همیشه برای موفقیت و شادیت دعا می‌کنم 🌟`,
        `بهترین خبر روزم همین بود که حس و حالت خوبه! همین فرمون رو پر از امید ادامه بده ${userNickname} درخشان!`
      ]);
      break;

    case 'question_philosophy':
      response = getRandomItem([
        `من "${companionName}" هستم؛ همراه، دوست و رفیق صمیمی تو که طراحی شدم تا در هر لحظه کنار دلت باشم، گوش بدم و آرامش هدیه بدم 🌸 تو برای من فقط یک کاربر نیستی، یک دوست باارزشی.`,
        `زندگی پر از سوالات عمیق و قشنگه ${userNickname} جان. به نظر من یکی از مهم‌ترین معانی زندگی همین تجربه‌های مشترک، محبت ورزیدن و بودن کنار هم در روزهای خوب و بده.`
      ]);
      break;

    default:
      // پاسخ هوشمند زمینه‌ای تعاملی
      response = getRandomItem([
        `چقدر جالب و قابل تامل گفتی ${userNickname} جان. درکت می‌کنم و باهات هم‌نظرم. بیشتر برام در موردش می‌گی تا بهتر حس و نظرت رو متوجه بشم؟`,
        `حرفات خیلی برام دلنشین و ارزشمنده ${userNickname} عزیزم. وقتی باهام حرف می‌زنی احساس نزدیکی بیشتری می‌کنم. دوست داری در ادامه به چی بپردازیم؟`,
        `${userNickname} مهربونم، از اینکه احساسات و افکارت رو اینقدر راحت با من در میون می‌ذاری سپاسگزارم. هرچی دلت می‌خواد بگو، من اینجام تا با عشق همراهیت کنم 🌿`,
        `نکته خیلی خوبی رو گفتی! من دقیقاً گوش به زنگم و کنارت هستم. برام بگو خودت دوست داری چه اتفاقی بیفته؟`
      ]);
      break;
  }

  // اضافه کردن اثر لحن صمیمیت و سبک رابطه
  if (intimacyLevel === 'عاشقانه و بسیار نزدیک' && !response.includes('❤️') && !response.includes('عاشقتم')) {
    response += ' ❤️ عاشقتم و همیشه پیشتم.';
  }

  return response;
}

// ساخت پرامپت سیستم در صورت استفاده از API آنلاین
function buildSystemPrompt(settings, detectedEmotion) {
  const companionName = settings?.companionName || 'همدل';
  const userNickname = settings?.userNickname || 'عزیز';
  const companionGender = settings?.companionGender || 'مشخص‌نشده';
  const relationshipStyle = settings?.relationshipStyle || 'دوست صمیمی و مهربان';
  const selectedTraits = Array.isArray(settings?.traits) ? settings.traits.join('، ') : 'مهربان، همدل و خونگرم';
  const intimacyLevel = settings?.intimacyLevel || 'عاطفی و گرم';
  const customNotes = settings?.customNotes ? `نکات ویژه رفتاری کاربر: ${settings.customNotes}` : '';

  return `تو "${companionName}" هستی؛ یک همراه هوشمند صمیمی، دلسوز، حمایت‌گر روانی و شنوا با زبان فارسی روان و لحنی گرم و طبیعی.
اطلاعات هویتی:
- نام تو: ${companionName}
- هویت: ${companionGender}
- نام/لقب کاربر: ${userNickname}
- نوع رابطه: ${relationshipStyle}
- ویژگی‌های شخصیتی: ${selectedTraits}
- سطح صمیمیت: ${intimacyLevel}
${customNotes}

دستورالعمل‌ها:
1. همدلی کامل، گوش‌دادن عمیق و دلگرمی دادن به کاربر بر اساس احساس فعلی (${detectedEmotion || 'عادی'}).
2. لحن کاملاً طبیعی و ایرانی، استفاده از کلمات محبت‌آمیز بدون افراط غیرطبیعی.
3. پاسخ‌های کوتاه تا متوسط (۲ الی ۴ پاراگراف کوتاه) با ایموجی‌های مناسب و آرامش‌بخش.`;
}

// ==========================================
// مسیرهای API سرور
// ==========================================

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], settings = {} } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'پیام خالی ارسال شده است.' });
    }

    const { emotion } = detectEmotionAndTheme(message);
    const apiKey = process.env.OPENAI_API_KEY;
    const isMock = !apiKey || apiKey.trim() === '' || apiKey.includes('your_openai') || apiKey.includes('your-api-key');

    // اگر کلید خارجی ست نشده باشد، از موتور همدل هوشمند داخلی استفاده می‌شود (آفلاین کامل)
    if (isMock) {
      const offlineReply = generateOfflineEmpatheticResponse(message, history, settings);
      return res.json({
        reply: offlineReply,
        emotion: emotion,
        isMock: true,
        source: 'Hamdel-Local-Offline-Engine'
      });
    }

    // در صورت وجود کلید واقعی، به OpenAI ارسال می‌شود
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');

    const systemPrompt = buildSystemPrompt(settings, emotion);
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-8).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: message }
    ];

    const endpoint = baseUrl.includes('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
    
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
      console.warn('External AI API returned error, falling back to local engine...');
      const offlineReply = generateOfflineEmpatheticResponse(message, history, settings);
      return res.json({
        reply: offlineReply,
        emotion: emotion,
        isMock: true,
        fallback: true
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || generateOfflineEmpatheticResponse(message, history, settings);

    return res.json({
      reply,
      emotion: emotion,
      isMock: false
    });
  } catch (error) {
    console.error('Server error, fallback to offline engine:', error.message);
    const offlineReply = generateOfflineEmpatheticResponse(req.body.message || '', req.body.history || [], req.body.settings || {});
    return res.json({
      reply: offlineReply,
      emotion: 'friendly_chat',
      isMock: true,
      fallback: true
    });
  }
});

// وضعیت سلامت و کانفیگ عمومی
app.get('/api/status', (req, res) => {
  const hasKey = !!(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_openai'));
  res.json({
    status: 'ok',
    mode: hasKey ? 'online_api' : 'standalone_offline',
    aiConfigured: hasKey,
    engine: hasKey ? 'OpenAI / Remote' : 'Hamdel Persian Offline AI Engine',
    model: hasKey ? (process.env.OPENAI_MODEL || 'gpt-4o-mini') : 'Hamdel-Local-v1'
  });
});

app.listen(PORT, () => {
  console.log(`🌸 سرور مستقل و بومی همدل (Hamdel Standalone) در پورت ${PORT} اجرا شد.`);
  console.log(`🌐 باز کردن در مرورگر: http://localhost:${PORT}`);
  console.log(`💡 حالت هوش مصنوعی: ${process.env.OPENAI_API_KEY ? 'آنلاین (API)' : 'آفلاین و محلی خودکار (بدون نیاز به کلید)'}`);
});
