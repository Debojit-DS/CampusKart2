import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const provider = process.env.EMAIL_PROVIDER || 'console';

  if (provider === 'smtp') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }

  return null;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER || 'console';

  if (provider === 'console') {
    console.log('\n========================================');
    console.log('📧 EMAIL (Console Mode)');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('----------------------------------------');
    console.log(options.text || options.html.replace(/<[^>]*>/g, ''));
    console.log('========================================\n');
    return true;
  }

  try {
    const tp = getTransporter();
    if (!tp) {
      console.error('Email transporter not configured');
      return false;
    }

    await tp.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
}

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'Verify your CampusKart account',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1a1a2e; border-radius: 16px;">
        <h1 style="color: #7c3aed; font-size: 24px; margin-bottom: 16px;">Welcome to CampusKart!</h1>
        <p style="color: #a0a0b0; font-size: 14px; line-height: 1.6;">Your verification code is:</p>
        <div style="background: #2a2a3e; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 700; color: #7c3aed; letter-spacing: 8px;">${code}</span>
        </div>
        <p style="color: #a0a0b0; font-size: 12px;">This code expires in 15 minutes. If you didn't request this, please ignore this email.</p>
      </div>
    `,
    text: `Your CampusKart verification code is: ${code}`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: 'Reset your CampusKart password',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #1a1a2e; border-radius: 16px;">
        <h1 style="color: #7c3aed; font-size: 24px; margin-bottom: 16px;">Password Reset</h1>
        <p style="color: #a0a0b0; font-size: 14px; line-height: 1.6;">Click the link below to reset your password:</p>
        <div style="background: #2a2a3e; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #7c3aed;">${process.env.FRONTEND_URL}/reset-password?token=${token}</span>
        </div>
        <p style="color: #a0a0b0; font-size: 12px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    `,
    text: `Reset your password: ${process.env.FRONTEND_URL}/reset-password?token=${token}`,
  });
}
