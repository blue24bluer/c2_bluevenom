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

function getMaintenancePage(message) {
  return `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BlueRever | Server Status</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;800&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
      <style>
          :root {
              --primary-glow: #3b82f6;
              --secondary-glow: #8b5cf6;
              --glass-bg: rgba(17, 25, 40, 0.75);
              --glass-border: rgba(255, 255, 255, 0.125);
              --text-main: #ffffff;
              --text-muted: #94a3b8;
          }

          * { box-sizing: border-box; }

          body, html {
              margin: 0; padding: 0; min-height: 100vh;
              font-family: 'Cairo', sans-serif;
              background: radial-gradient(circle at 50% 10%, #1e293b 0%, #0f172a 100%), 
                          url('https://i.giphy.com/077i6AULCXc0FKTj9s.webp');
              background-size: cover;
              background-position: center;
              background-blend-mode: overlay;
              background-attachment: fixed;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              color: var(--text-main);
              overflow-x: hidden;
          }

          header, footer {
              padding: 2rem 0;
              width: 100%;
              text-align: center;
              z-index: 10;
          }

          .brand-name {
              font-size: 2.2rem;
              font-weight: 800;
              margin: 0;
              background: linear-gradient(to right, #fff, #a5b4fc);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              text-shadow: 0 4px 12px rgba(0,0,0,0.3);
              letter-spacing: 1px;
          }

          /* بطاقة المحتوى الزجاجية */
          .container {
              position: relative;
              z-index: 10;
              width: 90%;
              max-width: 500px;
              padding: 3.5rem 2rem;
              background: var(--glass-bg);
              backdrop-filter: blur(16px) saturate(180%);
              -webkit-backdrop-filter: blur(16px) saturate(180%);
              border-radius: 28px;
              border: 1px solid var(--glass-border);
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
              text-align: center;
              animation: float 6s ease-in-out infinite;
          }

          @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-15px); }
          }

          .status-icon-wrapper {
              position: relative;
              display: inline-flex;
              margin-bottom: 2rem;
          }

          .status-icon {
              width: 100px;
              height: 100px;
              background: rgba(59, 130, 246, 0.1);
              border: 2px solid var(--primary-glow);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 2.5rem;
              color: var(--primary-glow);
              animation: pulse-glow 2s infinite;
          }

          @keyframes pulse-glow {
              0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); transform: scale(1); }
              70% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); transform: scale(1.05); }
              100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); transform: scale(1); }
          }

          h1 {
              font-size: 1.8rem;
              font-weight: 700;
              margin-bottom: 1rem;
              color: #fff;
          }

          .message {
              font-size: 1.1rem;
              color: var(--text-muted);
              line-height: 1.8;
              margin-bottom: 2rem;
          }

          .divider {
              height: 1px;
              width: 60px;
              background: var(--primary-glow);
              margin: 1.5rem auto;
              opacity: 0.5;
          }

          .loader-dots {
              display: flex;
              justify-content: center;
              gap: 8px;
          }

          .dot {
              width: 8px;
              height: 8px;
              background: var(--primary-glow);
              border-radius: 50%;
              animation: dot-pulse 1.5s infinite ease-in-out;
          }

          .dot:nth-child(2) { animation-delay: 0.2s; }
          .dot:nth-child(3) { animation-delay: 0.4s; }

          @keyframes dot-pulse {
              0%, 100% { transform: scale(1); opacity: 0.3; }
              50% { transform: scale(1.5); opacity: 1; }
          }

          footer p {
              color: var(--text-muted);
              font-size: 0.9rem;
              letter-spacing: 0.5px;
          }

          /* تحسينات الموبايل */
          @media (max-width: 480px) {
              .container { padding: 2.5rem 1.5rem; }
              .brand-name { font-size: 1.8rem; }
              h1 { font-size: 1.5rem; }
              .message { font-size: 1rem; }
          }
      </style>
  </head>
  <body>
      <header>
          <div class="brand-name">BlueRever</div>
      </header>
      
      <main class="container">
          <div class="status-icon-wrapper">
              <div class="status-icon">
                  <i class="fas fa-tools"></i>
              </div>
          </div>
          
          <h1>عذراً، السيرفر متوقف مؤقتاً</h1>
          
          <div class="divider"></div>
          
          <p class="message">${message}</p>
          
          <div class="loader-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
          </div>
      </main>

      <footer>
          <p>جاري مراقبة النظام تلقائياً.. يرجى المحاولة لاحقاً</p>
          <p style="font-size: 0.7rem; margin-top: 10px; opacity: 0.5;">© 2024 C2BlueVenom Intelligence</p>
      </footer>
  </body>
  </html>
  `;
}
