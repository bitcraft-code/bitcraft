import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX;
}

type ContactRequest = {
  name: string;
  email: string;
  message: string;
  _honey?: string;
};

async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body: ContactRequest = await request.json();
    const { name, email, message, _honey } = body;

    if (_honey) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (name.length > 200 || email.length > 254 || message.length > 5000) {
      return NextResponse.json({ error: "Input too long" }, { status: 400 });
    }

    const template = getEmailTemplate(name, email, message);
    const result = await getResend().emails.send({
      from: "onboarding@resend.dev",
      to: process.env.CONTACT_EMAIL_TO || "delivered@resend.dev",
      replyTo: email,
      subject: `Novo contato de ${name} - Bitcraft`,
      html: template,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, id: result.data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

function getEmailTemplate(name: string, email: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      background-color: #0a1f35;
      line-height: 1.6;
      padding: 20px;
    }
    .wrapper { max-width: 640px; margin: 0 auto; }
    .container {
      background: linear-gradient(135deg, rgba(10,25,47,0.95) 0%, rgba(7,22,20,0.95) 100%);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(0,170,255,0.2);
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    .header {
      background: linear-gradient(135deg, #00aaff 0%, #00ff9f 100%);
      padding: 60px 40px;
      text-align: center;
      color: white;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 50px 50px;
      opacity: 0.3;
    }
    .header-content { position: relative; z-index: 1; }
    .logo {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 16px;
      letter-spacing: -1px;
    }
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 12px;
      line-height: 1.2;
    }
    .header p {
      font-size: 15px;
      opacity: 0.95;
      font-weight: 500;
    }
    .content {
      padding: 48px 40px;
      background: rgba(255,255,255,0.02);
    }
    .badge {
      display: inline-block;
      background: rgba(0,170,255,0.15);
      border: 1px solid rgba(0,170,255,0.3);
      color: #00aaff;
      padding: 8px 16px;
      border-radius: 24px;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 32px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .section-title {
      color: #ffffff;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 2px solid rgba(0,170,255,0.3);
    }
    .fields {
      display: grid;
      gap: 24px;
    }
    .field { }
    .field-label {
      display: block;
      font-weight: 700;
      color: rgba(0,170,255,0.8);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .field-value {
      background: rgba(255,255,255,0.04);
      padding: 16px 20px;
      border-radius: 8px;
      border-left: 4px solid #00aaff;
      color: rgba(255,255,255,0.9);
      font-size: 15px;
      word-break: break-word;
      white-space: pre-wrap;
    }
    .message-field .field-value {
      min-height: 120px;
      background: rgba(0,170,255,0.05);
      border-left-color: #00ff9f;
    }
    .footer {
      background: rgba(255,255,255,0.02);
      padding: 32px 40px;
      border-top: 1px solid rgba(255,255,255,0.1);
      text-align: center;
    }
    .footer-text {
      color: rgba(255,255,255,0.7);
      font-size: 13px;
      line-height: 1.8;
      margin-bottom: 16px;
    }
    .footer-link {
      display: inline-block;
      color: #00aaff;
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s;
    }
    .footer-link:hover { opacity: 0.8; }
    .cta-section {
      background: linear-gradient(135deg, rgba(0,170,255,0.1) 0%, rgba(0,255,159,0.05) 100%);
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 24px;
      border: 1px solid rgba(0,170,255,0.2);
    }
    .cta-section strong {
      color: #00ff9f;
    }
    .reply-email {
      display: inline-block;
      background: rgba(0,170,255,0.1);
      padding: 8px 12px;
      border-radius: 6px;
      color: #00aaff;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 12px;
    }
    .divider {
      height: 1px;
      background: rgba(255,255,255,0.1);
      margin: 24px 0;
    }
    .credit {
      color: rgba(255,255,255,0.5);
      font-size: 11px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="header-content">
          <div class="logo">⚡ BITCRAFT</div>
          <h1>Novo Contato Recebido</h1>
          <p>Um cliente está interessado em seus serviços</p>
        </div>
      </div>

      <div class="content">
        <span class="badge">Bitcraft Contact Form</span>

        <h2 class="section-title">Detalhes do Contato</h2>

        <div class="fields">
          <div class="field">
            <label class="field-label">Nome</label>
            <div class="field-value">${escapeHtml(name)}</div>
          </div>

          <div class="field">
            <label class="field-label">Email de Contato</label>
            <div class="field-value">
              <a href="mailto:${escapeHtml(email)}" style="color: #00aaff; text-decoration: none; word-break: break-all;">
                ${escapeHtml(email)}
              </a>
            </div>
          </div>

          <div class="field message-field">
            <label class="field-label">Mensagem</label>
            <div class="field-value">${escapeHtml(message)}</div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="cta-section">
          <strong>📧 Para responder:</strong><br>
          Responda diretamente para <span class="reply-email">${escapeHtml(email)}</span>
        </div>
      </div>

      <div class="footer">
        <div class="footer-text">
          Este email foi gerado automaticamente pelo sistema de contato da Bitcraft.
        </div>
        <a href="https://bitcraft.dev.br" class="footer-link">Visite nosso site →</a>

        <div class="credit">
          Bitcraft • Engenharia de Software & Growth Marketing<br>
          © 2026 • Todos os direitos reservados
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export { POST };
