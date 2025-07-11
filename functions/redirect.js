const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    // 1. تحديد المسار الصحيح لملف التحكم الخاص بك
    const filePath = path.join(__dirname, '..', '..', 'server_url.txt');
    
    // 2. قراءة محتوى الملف وتنظيفه من أي مسافات
    const serverUrl = fs.readFileSync(filePath, 'utf8').trim();

    // 3. التحقق من أن الملف ليس فارغاً
    if (!serverUrl) {
      throw new Error("ملف التحكم server_url.txt فارغ.");
    }
    
    // 4. تنفيذ إعادة التوجيه التي تعمل مع البوتات
    return {
      statusCode: 307, // يحافظ على طلبات POST
      headers: {
        "Location": serverUrl,
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
