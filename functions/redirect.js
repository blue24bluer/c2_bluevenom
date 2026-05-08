const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    const filePath = path.join(__dirname, 'server_url.txt');
    if (!fs.existsSync(filePath)) throw new Error("ملف الإعدادات غير موجود.");
    
    const targetUrl = fs.readFileSync(filePath, 'utf8').trim();
    if (!targetUrl) throw new Error("رابط السيرفر غير مهيأ.");

    const finalUrl = targetUrl + event.path;

    try {
      const response = await fetch(finalUrl, { 
        method: 'GET',
        signal: AbortSignal.timeout(8000) 
      });

      if (response.ok) {
        return { statusCode: 307, headers: { "Location": finalUrl } };
      }

      // معالجة أخطاء الـ HTTP Codes
      let errorTitle = "خطأ في السيرفر";
      let errorMsg = `السيرفر استجاب بخطأ (Status: ${response.status})`;
      
      if (response.status === 404) {
        errorTitle = "الصفحة غير موجودة";
        errorMsg = "الرابط الذي تحاول الوصول إليه غير متوفر على السيرفر (404).";
      } else if (response.status >= 500) {
        errorTitle = "صيانة برمجية";
        errorMsg = "السيرفر البعيد يواجه مشكلة داخلية حالياً (500+).";
      }

      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: getMaintenancePage(errorTitle, errorMsg, "fa-exclamation-triangle")
      };

    } catch (fetchError) {
      // معالجة أخطاء الاتصال والشبكة
      let netTitle = "فشل الاتصال";
      let netMsg = "تعذر الوصول إلى السيرفر، قد يكون مغلقاً أو الرابط غير صحيح.";
      
      if (fetchError.name === 'TimeoutError') {
        netTitle = "انتهاء المهلة";
        netMsg = "استغرق السيرفر وقتاً طويلاً للاستجابة (Timeout).";
      }

      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: getMaintenancePage(netTitle, netMsg, "fa-wifi")
      };
    }

  } catch (error) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: getMaintenancePage("خطأ في النظام", error.message, "fa-bug")
    };
  }
};

function getMaintenancePage(title, message, icon) {
  return `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BlueRever | Status</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
      <style>
          :root { --primary-glow: #3b82f6; --glass-bg: rgba(17, 25, 40, 0.75); --glass-border: rgba(255, 255, 255, 0.125); --text-main: #ffffff; --text-muted: #94a3b8; }
          body, html { margin: 0; padding: 0; min-height: 100vh; font-family: 'Cairo', sans-serif; background: radial-gradient(circle at 50% 10%, #1e293b 0%, #0f172a 100%); display: flex; flex-direction: column; align-items: center; justify-content: space-between; color: var(--text-main); }
          header, footer { padding: 2rem 0; width: 100%; text-align: center; }
          .brand-name { font-size: 2.2rem; font-weight: 800; background: linear-gradient(to right, #fff, #a5b4fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
          .container { position: relative; width: 90%; max-width: 500px; padding: 3.5rem 2rem; background: var(--glass-bg); backdrop-filter: blur(16px); border-radius: 28px; border: 1px solid var(--glass-border); text-align: center; animation: float 6s ease-in-out infinite; }
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
          .status-icon { width: 80px; height: 80px; margin: 0 auto 1.5rem; background: rgba(59, 130, 246, 0.1); border: 2px solid var(--primary-glow); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--primary-glow); }
          h1 { font-size: 1.6rem; margin-bottom: 1rem; }
          .message { font-size: 1rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 2rem; }
          .dot { width: 8px; height: 8px; background: var(--primary-glow); border-radius: 50%; display: inline-block; animation: dot-pulse 1.5s infinite ease-in-out; }
          @keyframes dot-pulse { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.5); opacity: 1; } }
      </style>
  </head>
  <body>
      <header><div class="brand-name">BlueRever</div></header>
      <main class="container">
          <div class="status-icon"><i class="fas ${icon}"></i></div>
          <h1>${title}</h1>
          <p class="message">${message}</p>
          <div><span class="dot"></span> <span class="dot" style="animation-delay:0.2s"></span> <span class="dot" style="animation-delay:0.4s"></span></div>
      </main>
      <footer>
          <p style="color:var(--text-muted); font-size:0.8rem;">© 2024 C2BlueVenom Intelligence</p>
      </footer>
  </body>
  </html>`;
}
