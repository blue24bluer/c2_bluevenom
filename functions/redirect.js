const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    const filePath = path.join(__dirname, 'server_url.txt');
    const targetUrl = fs.readFileSync(filePath, 'utf8').trim();

    if (!targetUrl) {
      throw new Error("ملف التحكم فارغ.");
    }

    const finalUrl = targetUrl + event.path;

    // محاولة فحص السيرفر قبل التوجيه
    try {
      const response = await fetch(finalUrl, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // وقت انتظار 5 ثواني كحد أقصى
      });

      // إذا كانت الاستجابة ناجحة (200-299)
      if (response.ok) {
        return {
          statusCode: 307,
          headers: { "Location": finalUrl },
        };
      }
      
      // إذا كانت الاستجابة تحمل خطأ (404, 500, 503...)
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: getMaintenancePage("السيرفر لا يستجيب حالياً (Status: " + response.status + ")")
      };

    } catch (fetchError) {
      // في حال فشل الاتصال تماماً (السيرفر مغلق أو الرابط خطأ)
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: getMaintenancePage("تعذر الاتصال بالسيرفر البعيد.. قد يكون تحت الصيانة.")
      };
    }

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// دالة تحتوي على تصميم صفحة الصيانة (Blue Venom Design)
function getMaintenancePage(message) {
  return `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>C2BlueVenom | Server Status</title>
      <style>
          :root {
              --bg-color: #000428;
              --accent-color: #004e92;
              --glow-color: #00d4ff;
              --glass-bg: rgba(255, 255, 255, 0.05);
          }

          body, html {
              margin: 0; padding: 0; height: 100%; width: 100%;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: radial-gradient(circle at center, var(--accent-color) 0%, var(--bg-color) 100%);
              display: flex; align-items: center; justify-content: center;
              overflow: hidden; color: white;
          }

          /* فقاعات خلفية متحركة */
          .bubbles { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
          .bubble {
              position: absolute; bottom: -100px; background: rgba(0, 212, 255, 0.1);
              border-radius: 50%; animation: rise 15s infinite ease-in;
              box-shadow: 0 0 10px rgba(0, 212, 255, 0.2);
          }

          @keyframes rise {
              0% { bottom: -100px; transform: translateX(0) scale(1); opacity: 0; }
              20% { opacity: 0.5; }
              100% { bottom: 110%; transform: translateX(100px) scale(1.5); opacity: 0; }
          }

          /* بطاقة الزجاج (Glassmorphism) */
          .container {
              position: relative; z-index: 10;
              padding: 3rem; background: var(--glass-bg);
              backdrop-filter: blur(15px); -webkit-backdrop-filter: blur(15px);
              border-radius: 30px; border: 1px solid rgba(255, 255, 255, 0.1);
              box-shadow: 0 25px 45px rgba(0,0,0,0.5);
              text-align: center; max-width: 500px; width: 90%;
              animation: fadeIn 1.5s ease-out;
          }

          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

          .logo {
              font-size: 3rem; font-weight: bold; margin-bottom: 1rem;
              background: linear-gradient(to right, #fff, var(--glow-color));
              -webkit-background-clip: text; -webkit-text-fill-color: transparent;
              filter: drop-shadow(0 0 15px var(--glow-color));
              letter-spacing: 2px;
          }

          .status-icon {
              width: 80px; height: 80px; margin-bottom: 1.5rem;
              display: inline-block; border-radius: 50%;
              border: 3px solid var(--glow-color);
              position: relative; animation: pulse 2s infinite;
          }

          @keyframes pulse {
              0% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.7); }
              70% { box-shadow: 0 0 0 20px rgba(0, 212, 255, 0); }
              100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0); }
          }

          .message { font-size: 1.2rem; opacity: 0.9; line-height: 1.6; }
          .footer { margin-top: 2rem; font-size: 0.8rem; opacity: 0.5; }

      </style>
  </head>
  <body>
      <div class="bubbles" id="bubbles"></div>
      
      <div class="container">
          <div class="logo">C2BLUE VENOM</div>
          <div class="status-icon" style="display: flex; align-items: center; justify-content: center;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </div>
          <h1>عذراً، السيرفر متوقف</h1>
          <p class="message">${message}</p>
          <div class="footer">جاري مراقبة النظام تلقائياً.. يرجى المحاولة لاحقاً.</div>
      </div>

      <script>
          function createBubbles() {
              const container = document.getElementById('bubbles');
              for (let i = 0; i < 20; i++) {
                  const bubble = document.createElement('div');
                  bubble.className = 'bubble';
                  const size = Math.random() * 60 + 10 + 'px';
                  bubble.style.width = size;
                  bubble.style.height = size;
                  bubble.style.left = Math.random() * 100 + '%';
                  bubble.style.animationDuration = Math.random() * 10 + 5 + 's';
                  bubble.style.animationDelay = Math.random() * 5 + 's';
                  container.appendChild(bubble);
              }
          }
          createBubbles();
      </script>
  </body>
  </html>
  `;
}
