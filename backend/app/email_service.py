import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Email configuration from environment variables
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL")
FROM_NAME = os.getenv("FROM_NAME")
FRONTEND_URL = os.getenv("FRONTEND_URL")

def send_verification_email(to_email: str, username: str, verification_token: str) -> bool:
    """
    Send email verification link to user

    Args:
        to_email: Recipient email address
        username: User's username
        verification_token: Token for verification

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Create verification link
        verification_link = f"{FRONTEND_URL}/verify-email?token={verification_token}"

        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = "Verify Your DiabetesPredict Account"
        message["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
        message["To"] = to_email

        # Create HTML content
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #2563eb; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">DiabetesPredict</h1>
                    </div>

                    <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #2563eb;">Welcome, {username}!</h2>

                        <p>Thank you for registering with DiabetesPredict. To complete your registration and activate your account, please verify your email address.</p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{verification_link}"
                               style="background-color: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                                Verify Email Address
                            </a>
                        </div>

                        <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 5px; font-size: 12px;">
                            {verification_link}
                        </p>

                        <p style="color: #666; font-size: 14px; margin-top: 30px;">
                            <strong>Note:</strong> This verification link will expire in 24 hours.
                        </p>

                        <p style="color: #666; font-size: 14px;">
                            If you didn't create an account with DiabetesPredict, please ignore this email.
                        </p>
                    </div>

                    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                        <p>© 2025 DiabetesPredict. Educational and informational use only.</p>
                        <p>Not intended as a substitute for professional medical advice.</p>
                    </div>
                </div>
            </body>
        </html>
        """

        # Create plain text version
        text_content = f"""
        Welcome to DiabetesPredict, {username}!

        Thank you for registering. To complete your registration and activate your account, please verify your email address by clicking the link below:

        {verification_link}

        This verification link will expire in 24 hours.

        If you didn't create an account with DiabetesPredict, please ignore this email.

        © 2025 DiabetesPredict
        """

        # Attach both versions
        part1 = MIMEText(text_content, "plain")
        part2 = MIMEText(html_content, "html")
        message.attach(part1)
        message.attach(part2)

        # Send email
        if not SMTP_USER or not SMTP_PASSWORD:
            print("WARNING: SMTP credentials not configured. Email not sent.")
            print(f"Verification link (for development): {verification_link}")
            return True  # Return True in development mode

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(message)

        print(f"Verification email sent to {to_email}")
        return True, verification_link

    except Exception as e:
        print(f"Failed to send verification email: {str(e)}")
        return False, verification_link

