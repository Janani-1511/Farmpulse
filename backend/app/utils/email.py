import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

logger = logging.getLogger("farmpulse.email")

def send_otp_email(to_email: str, otp_code: str) -> bool:
    """
    Sends a 6-digit OTP code to the target user email via SMTP.
    If SMTP credentials are not configured in environment, it logs the OTP code safely.
    """
    try:
        from dotenv import load_dotenv
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
        load_dotenv(dotenv_path=env_path, override=True)
    except Exception as e:
        pass

    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user or "noreply@farmpulse.com")

    subject = f"FarmPulse Password Reset Code: {otp_code}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>FarmPulse Password Reset OTP</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0; shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #15803d; margin: 0; font-size: 26px;">FarmPulse</h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Smart Agricultural Market Intelligence</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
        <h2 style="color: #0f172a; font-size: 18px; margin-bottom: 10px;">Password Reset Verification</h2>
        <p style="color: #334155; font-size: 14px; line-height: 1.5;">
          You requested a password reset for your FarmPulse account (<strong>{to_email}</strong>). Use the verification code below to proceed:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background-color: #f0fdf4; border: 2px dashed #22c55e; color: #15803d; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; border-radius: 10px;">
            {otp_code}
          </span>
        </div>
        <p style="color: #64748b; font-size: 12px; text-align: center;">
          This code is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 25px; margin-bottom: 15px;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
          (c) 2025 FarmPulse Inc. All rights reserved.
        </p>
      </div>
    </body>
    </html>
    """

    plain_text = f"Your FarmPulse Password Reset OTP code is: {otp_code}\n\nThis code expires in 10 minutes."

    if not smtp_user or not smtp_password:
        logger.warning(f"[SMTP NOT CONFIGURED] Simulated email to {to_email}. OTP Code is: {otp_code}")
        print(f"\n==========================================")
        print(f" SIMULATED EMAIL TO: {to_email}")
        print(f" OTP VERIFICATION CODE: {otp_code}")
        print(f"==========================================\n")
        return False

    try:
        from email.utils import formataddr, make_msgid, formatdate
        
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"FarmPulse Password Reset Verification Code: {otp_code}"
        msg["From"] = formataddr(("FarmPulse Security", from_email))
        msg["To"] = to_email
        msg["Reply-To"] = from_email
        msg["Date"] = formatdate(localtime=True)
        msg["Message-ID"] = make_msgid(domain="farmpulse.org")
        msg["X-Priority"] = "1"
        msg["Importance"] = "High"
        msg["X-Mailer"] = "FarmPulse Mailer v1.0"

        msg.attach(MIMEText(plain_text, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=10) as server:
                server.login(smtp_user, smtp_password)
                server.sendmail(from_email, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_password)
                server.sendmail(from_email, [to_email], msg.as_string())
        
        logger.info(f"Successfully sent OTP email to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email via SMTP to {to_email}: {e}")
        print(f"[SMTP ERROR] Failed to send email to {to_email}: {e}")
        return False
