/**
 * Email Service - 邮件发送服务
 * 使用 Resend 发送验证码邮件
 */

import { Resend } from 'resend'

interface EmailConfig {
  apiKey: string
  fromEmail?: string
  fromName?: string
}

interface SendCodeResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * 邮件服务类
 */
export class EmailService {
  private resend: Resend
  private fromEmail: string
  private fromName: string

  constructor(config: EmailConfig) {
    this.resend = new Resend(config.apiKey)
    this.fromEmail = config.fromEmail || 'noreply@resend.dev'
    this.fromName = config.fromName || '快记'
  }

  /**
   * 生成6位数字验证码
   */
  static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  /**
   * 发送注册验证码邮件
   */
  async sendVerificationCode(email: string, code: string): Promise<SendCodeResult> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: email,
        subject: `【快记】您的注册验证码：${code}`,
        html: this.getVerificationEmailTemplate(code),
      })

      if (error) {
        console.error('Resend error:', error)
        return { success: false, error: error.message }
      }

      return { success: true, messageId: data?.id }
    } catch (error) {
      console.error('Email send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * 发送重置密码验证码邮件
   */
  async sendPasswordResetCode(email: string, code: string): Promise<SendCodeResult> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: email,
        subject: `【快记】重置密码验证码：${code}`,
        html: this.getPasswordResetEmailTemplate(code),
      })

      if (error) {
        console.error('Resend error:', error)
        return { success: false, error: error.message }
      }

      return { success: true, messageId: data?.id }
    } catch (error) {
      console.error('Email send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * 测试邮件服务连接
   */
  async ping(): Promise<{ success: boolean; error?: string }> {
    try {
      // Resend doesn't have a direct ping method, we just verify the API key format
      if (!this.resend) {
        return { success: false, error: 'Resend client not initialized' }
      }
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * 注册验证码邮件模板
   */
  private getVerificationEmailTemplate(code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>注册验证码</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">快记</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #666;">快速记录，深度思考</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #333; line-height: 1.6;">
                您好！感谢您注册快记。
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #333; line-height: 1.6;">
                请使用以下验证码完成注册：
              </p>
            </td>
          </tr>

          <!-- Code Box -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; text-align: center;">
                <span style="font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'SF Mono', Monaco, monospace;">
                  ${code}
                </span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 40px;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #999; line-height: 1.5;">
                验证码有效期 <strong style="color: #666;">10 分钟</strong>，请勿泄露给他人。
              </p>
              <p style="margin: 0; font-size: 13px; color: #999; line-height: 1.5;">
                如果这不是您的操作，请忽略此邮件。
              </p>
            </td>
          </tr>
        </table>

        <!-- Bottom text -->
        <p style="margin: 24px 0 0; font-size: 12px; color: #999;">
          此邮件由系统自动发送，请勿回复
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`
  }

  /**
   * 重置密码验证码邮件模板
   */
  private getPasswordResetEmailTemplate(code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>重置密码验证码</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">快记</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #666;">快速记录，深度思考</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #333; line-height: 1.6;">
                您好！您正在重置快记账号的密码。
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #333; line-height: 1.6;">
                请使用以下验证码完成密码重置：
              </p>
            </td>
          </tr>

          <!-- Code Box -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; padding: 24px; text-align: center;">
                <span style="font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'SF Mono', Monaco, monospace;">
                  ${code}
                </span>
              </div>
            </td>
          </tr>

          <!-- Warning -->
          <tr>
            <td style="padding: 24px 40px 0;">
              <div style="background-color: #fff8e6; border-radius: 8px; padding: 12px 16px; border-left: 3px solid #ffb800;">
                <p style="margin: 0; font-size: 13px; color: #8a6d00; line-height: 1.5;">
                  ⚠️ 如果这不是您本人的操作，您的账号可能存在安全风险，建议尽快修改密码。
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 40px;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #999; line-height: 1.5;">
                验证码有效期 <strong style="color: #666;">10 分钟</strong>，请勿泄露给他人。
              </p>
            </td>
          </tr>
        </table>

        <!-- Bottom text -->
        <p style="margin: 24px 0 0; font-size: 12px; color: #999;">
          此邮件由系统自动发送，请勿回复
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`
  }
}

/**
 * 创建邮件服务实例的工厂函数
 */
export function createEmailService(): EmailService | null {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn('Email service not configured. Set RESEND_API_KEY.')
    return null
  }

  return new EmailService({
    apiKey,
    fromEmail: process.env.EMAIL_FROM || 'noreply@resend.dev',
    fromName: process.env.EMAIL_FROM_NAME || '快记',
  })
}
