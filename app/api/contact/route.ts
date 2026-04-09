import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

type ContactRequest = {
  name: string;
  email: string;
  message: string;
};

async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ContactRequest = await request.json();
    const { name, email, message } = body;

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

    const template = getEmailTemplate(name, email, message);
    const result = await resend.emails.send({
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
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; background-color: #f5f5f5; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #00aaff 0%, #00ff9f 100%); padding: 40px 20px; text-align: center; color: white; }
    .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .content { padding: 40px; }
    .content h2 { color: #0a192f; font-size: 20px; margin-bottom: 20px; border-bottom: 2px solid #00aaff; padding-bottom: 12px; }
    .field { margin-bottom: 20px; }
    .field label { display: block; font-weight: 600; color: #0a192f; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .field-value { background-color: #f9f9f9; padding: 12px 16px; border-radius: 6px; border-left: 4px solid #00aaff; color: #333; font-size: 14px; word-break: break-word; white-space: pre-wrap; }
    .message-box { background-color: #f0f7ff; padding: 16px; border-radius: 6px; border-left: 4px solid #00aaff; margin-top: 8px; }
    .footer { background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eeeeee; font-size: 12px; color: #666; }
    .footer a { color: #00aaff; text-decoration: none; }
    .badge { display: inline-block; background-color: #00aaff; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Novo Contato Recebido</h1>
      <p>Um cliente está interessado em seus serviços</p>
    </div>
    <div class="content">
      <span class="badge">Bitcraft Contact</span>
      <h2>Detalhes do Contato</h2>
      <div class="field">
        <label>Nome</label>
        <div class="field-value">${escapeHtml(name)}</div>
      </div>
      <div class="field">
        <label>Email</label>
        <div class="field-value"><a href="mailto:${escapeHtml(email)}" style="color: #00aaff; text-decoration: none;">${escapeHtml(email)}</a></div>
      </div>
      <div class="field">
        <label>Mensagem</label>
        <div class="field-value message-box">${escapeHtml(message)}</div>
      </div>
    </div>
    <div class="footer">
      <p><strong>Próximos passos:</strong></p>
      <p>Responda diretamente para <strong>${escapeHtml(email)}</strong> para entrar em contato com o cliente.</p>
      <p style="margin-top: 16px; color: #999;">
        Este email foi gerado automaticamente pelo sistema de contato da Bitcraft<br>
        <a href="https://bitcraft.dev.br">Visite nosso site</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

export { POST };
