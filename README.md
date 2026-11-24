# 🎙️ VoiceForge — تطبيق تدريب واستنساخ الأصوات RVC بالذكاء الاصطناعي للموبايل

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/souadalialwaeli-ui/abbascopy/blob/main/voiceforge/colab/VoiceForge_Server.ipynb)

مشروع متكامل يتيح لك تدريب واستنساخ الأصوات (RVC v2) من هاتفك الذكي مباشرة عبر متصفح الويب (PWA)، مع تشغيل المعالجة والذكاء الاصطناعي مجاناً على سيرفر **Google Colab (GPU)**.

---

## ⚡ رابط التشغيل الفوري على Google Colab

اضغط على الزر أدناه أو الرابط لفتح خادم المشروع مباشرة في Google Colab:

👉 **[فتح في Google Colab](https://colab.research.google.com/github/souadalialwaeli-ui/abbascopy/blob/main/voiceforge/colab/VoiceForge_Server.ipynb)**

### خطوات التشغيل في كولاب:
1. تأكد من تفعيل كارت الشاشة (GPU): **Runtime > Change runtime type > T4 GPU**.
2. شغّل الخلايا بالترتيب:
   - **الخلية 1 (الإعداد):** تثبيت محرك Applio والاعتماديات.
   - **الخلية 2 (تشغيل الخادم):** إطلاق السيرفر ونفق Cloudflare الآمن (مجاني وتلقائي).
3. سيظهر لك رابط السيرفر (مثل: `https://xxx.trycloudflare.com`)، قم بنسخه ووضعه داخل إعدادات التطبيق على هاتفك.

---

## 📁 هيكل المشروع

- `voiceforge/frontend`: تطبيق الويب والواجهة (React + Tailwind + PWA) المتوافق مع الهواتف الذكية.
- `voiceforge/colab`: ملفات الخادم ودفتر الملاحظات `VoiceForge_Server.ipynb` ومسارات API.
- `voiceforge/docs`: التوثيق ودليل الاستخدام.
