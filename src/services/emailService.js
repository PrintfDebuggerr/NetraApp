const RESEND_API_KEY = 're_du9hpDNn_73kJxUh1irY5wNN7YzE2X6DM';
const RESEND_API_URL = 'https://api.resend.com/emails';

export const sendVerificationEmail = async (email, code) => {
  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Quitter <onboarding@resend.dev>', // Domain doğruladıktan sonra: 'Quitter <noreply@yourdomain.com>'
        to: email,
        subject: 'Email Doğrulama Kodu - Quitter',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #1a1a2e;
                  color: #ffffff;
                  padding: 20px;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #16213e;
                  border-radius: 12px;
                  padding: 40px;
                  text-align: center;
                }
                .logo {
                  font-size: 48px;
                  font-weight: bold;
                  color: #e94560;
                  margin-bottom: 20px;
                }
                .title {
                  font-size: 24px;
                  margin-bottom: 20px;
                  color: #ffffff;
                }
                .code-container {
                  background-color: #0f3460;
                  border: 2px solid #e94560;
                  border-radius: 8px;
                  padding: 30px;
                  margin: 30px 0;
                }
                .code {
                  font-size: 48px;
                  font-weight: bold;
                  letter-spacing: 10px;
                  color: #e94560;
                  font-family: 'Courier New', monospace;
                }
                .message {
                  font-size: 16px;
                  color: #999999;
                  line-height: 1.6;
                  margin-top: 20px;
                }
                .warning {
                  font-size: 14px;
                  color: #ff6b6b;
                  margin-top: 20px;
                }
                .footer {
                  margin-top: 40px;
                  font-size: 12px;
                  color: #666666;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">Quitter</div>
                <div class="title">Email Doğrulama Kodu</div>
                
                <div class="code-container">
                  <div class="code">${code}</div>
                </div>
                
                <div class="message">
                  Yukarıdaki 6 haneli kodu Quitter uygulamasına girerek email adresinizi doğrulayabilirsiniz.
                  <br><br>
                  Bu kod <strong>10 dakika</strong> boyunca geçerlidir.
                </div>
                
                <div class="warning">
                  ⚠️ Bu kodu kimseyle paylaşmayın!
                </div>
                
                <div class="footer">
                  Bu emaili siz talep etmediyseniz, güvenle görmezden gelebilirsiniz.
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API Error:', data);
      return { success: false, error: data.message || 'Email gönderilemedi' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email Service Error:', error);
    return { success: false, error: error.message };
  }
};

export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
