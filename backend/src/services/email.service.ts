import nodemailer from 'nodemailer';
import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  private static async getTransporter() {
    if (this.transporter) return this.transporter;

    const host = config.smtp.host || 'smtp.gmail.com';
    const user = config.smtp.user || 'karnikap376@gmail.com';
    const pass = config.smtp.pass || 'emzswvazajwkeoqi';
    const port = config.smtp.port || 465;

    logger.info(`Initializing fast SMTP transporter via ${host}:${port}`);
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 4000,
      socketTimeout: 4000,
      tls: {
        rejectUnauthorized: false,
      },
    });

    return this.transporter;
  }

  static async sendOTPEmail(toEmail: string, studentName: string, otpCode: string) {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 32px; border-radius: 16px;">
        <div style="max-width: 550px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 28px; font-weight: 800; color: #3b82f6; tracking: -0.5px;">Life<span style="color: #60a5fa;">OS</span></span>
            <p style="font-size: 13px; color: #94a3b8; margin-top: 4px;">AI-Powered Life & Deadline Management System</p>
          </div>

          <h2 style="color: #f8fafc; font-size: 20px; font-weight: 700; margin-top: 0; text-align: center;">Verify Your Email Address</h2>
          <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">Hello <strong>${studentName}</strong>,</p>
          <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">Use the 6-digit verification code below to complete your registration on LifeOS. This OTP code is valid for 10 minutes.</p>

          <div style="text-align: center; margin: 28px 0;">
            <span style="display: inline-block; font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #60a5fa; background: #1e293b; padding: 14px 28px; border-radius: 12px; border: 1px solid #3b82f6;">${otpCode}</span>
          </div>

          <p style="font-size: 12px; color: #64748b; text-align: center;">If you did not request this registration code, please ignore this email.</p>

          <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #1f2937; text-align: center; font-size: 11px; color: #475569;">
            © ${new Date().getFullYear()} LifeOS Personal Productivity Systems
          </div>
        </div>
      </div>
    `;

    // Attempt Resend HTTPS API if API Key is configured
    if (config.smtp.resendApiKey) {
      try {
        const res = await axios.post(
          'https://api.resend.com/emails',
          {
            from: 'LifeOS Verification <onboarding@resend.dev>',
            to: [toEmail],
            subject: `[LifeOS Verification Code] ${otpCode} is your OTP`,
            html: htmlContent,
          },
          {
            headers: {
              Authorization: `Bearer ${config.smtp.resendApiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
        logger.info(`OTP Email dispatched via Resend HTTPS API to ${toEmail}. Response:`, res.data);
        return res.data;
      } catch (resendError: any) {
        logger.warn('Resend HTTPS API dispatch failed, falling back to SMTP:', resendError?.message || resendError);
      }
    }

    try {
      const transporter = await this.getTransporter();
      const info = await transporter.sendMail({
        from: config.smtp.from,
        to: toEmail,
        subject: `[LifeOS Verification Code] ${otpCode} is your OTP`,
        html: htmlContent,
      });

      logger.info(`OTP Email dispatched via SMTP to ${toEmail}. MessageID: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.warn(`SMTP dispatch blocked on Render cloud firewall for ${toEmail}. OTP: ${otpCode}. Log:`, error);
      return { status: 'logged', otpCode };
    }
  }

  static async sendDeadlineAlert(toEmail: string, studentName: string, taskTitle: string, dueDate: Date, urgency: string) {
    try {
      const transporter = await this.getTransporter();

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; borderRadius: 16px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; padding: 24px; border-radius: 12px;">
            <h2 style="color: #3b82f6; margin-top: 0;">⏰ LifeOS Deadline Alert</h2>
            <p style="font-size: 16px; color: #e2e8f0;">Hello <strong>${studentName}</strong>,</p>
            <p style="font-size: 14px; color: #94a3b8;">This is an automated notification from your LifeOS AI Deadline Engine.</p>
            
            <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="margin: 0 0 8px 0; color: #ffffff;">${taskTitle}</h3>
              <p style="margin: 4px 0; font-size: 13px; color: #cbd5e1;"><strong>Due Timestamp:</strong> ${dueDate.toLocaleString()}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #fbbf24;"><strong>Urgency Level:</strong> ${urgency}</p>
            </div>

            <p style="font-size: 13px; color: #94a3b8;">Log into your LifeOS Dashboard to break down this task with AI or update your progress.</p>
            
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1f2937; text-align: center; font-size: 11px; color: #64748b;">
              LifeOS AI — Automated Personal Productivity System
            </div>
          </div>
        </div>
      `;

      const info = await transporter.sendMail({
        from: config.smtp.from,
        to: toEmail,
        subject: `[LifeOS Alert] Upcoming Deadline: ${taskTitle}`,
        html: htmlContent,
      });

      logger.info(`Email alert sent successfully to ${toEmail}. MessageID: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        logger.info(`Preview Email URL: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return info;
    } catch (error) {
      logger.error(`Failed to dispatch email to ${toEmail}:`, error);
    }
  }

  static async sendDailyDigest(toEmail: string, studentName: string, pendingCount: number, taskSummaryHtml: string) {
    try {
      const transporter = await this.getTransporter();

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #3b82f6; padding: 24px; border-radius: 16px;">
            <h2 style="color: #60a5fa; margin-top: 0;">📅 Daily 4:00 PM Work Summary</h2>
            <p style="font-size: 15px; color: #e2e8f0;">Good afternoon <strong>${studentName}</strong>,</p>
            <p style="font-size: 13px; color: #94a3b8;">Here is your 4:00 PM summary of pending deadlines and tasks:</p>

            <div style="margin: 16px 0;">
              ${taskSummaryHtml}
            </div>

            <p style="font-size: 12px; color: #94a3b8;">Keep up the great work! Open LifeOS to complete or optimize your schedule.</p>
          </div>
        </div>
      `;

      const info = await transporter.sendMail({
        from: config.smtp.from,
        to: toEmail,
        subject: `[LifeOS 4:00 PM Summary] You have ${pendingCount} pending task(s) for today`,
        html: htmlContent,
      });

      logger.info(`Daily 4:00 PM summary sent to ${toEmail}. MessageID: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Failed to send 4:00 PM daily summary to ${toEmail}:`, error);
    }
  }

  static async sendHighRiskAlert(toEmail: string, studentName: string, taskTitle: string, estimatedHours: number, assessment: string) {
    try {
      const transporter = await this.getTransporter();

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; borderRadius: 16px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #dc2626; padding: 24px; border-radius: 12px;">
            <h2 style="color: #ef4444; margin-top: 0;">🚨 Critical Deadline Risk Warning</h2>
            <p style="font-size: 16px; color: #e2e8f0;">Attention <strong>${studentName}</strong>,</p>
            <p style="font-size: 14px; color: #94a3b8;">Our AI Deadline Engine detected a high-risk deadline on your active schedule.</p>
            
            <div style="background-color: #451a03; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <h3 style="margin: 0 0 8px 0; color: #ffffff;">${taskTitle}</h3>
              <p style="margin: 4px 0; font-size: 13px; color: #fca5a5;"><strong>Required Effort:</strong> ${estimatedHours} hours</p>
              <p style="margin: 4px 0; font-size: 13px; color: #fecaca;"><strong>AI Risk Assessment:</strong> ${assessment}</p>
            </div>

            <p style="font-size: 13px; color: #cbd5e1;">We recommend generating an AI Daily Plan or using AI Goal Decomposer to stay on track.</p>
          </div>
        </div>
      `;

      const info = await transporter.sendMail({
        from: config.smtp.from,
        to: toEmail,
        subject: `🚨 [CRITICAL RISK] Action Required: ${taskTitle}`,
        html: htmlContent,
      });

      logger.info(`High risk email sent to ${toEmail}. MessageID: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error(`Failed to dispatch high risk email to ${toEmail}:`, error);
    }
  }
}
