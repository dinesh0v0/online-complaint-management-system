import logging
import resend
from app.core.config import get_settings

logger = logging.getLogger(__name__)

def send_complaint_update_email(to_email: str, complaint_title: str, tracking_id: str, message: str, is_new: bool = False):
    settings = get_settings()
    
    if not settings.resend_api_key or not settings.from_email:
        logger.warning(
            f"Mock Email Sent to {to_email}. "
            f"Define RESEND_API_KEY and FROM_EMAIL in .env to actually deliver this."
            f"\\nSubject: [OCMS] {complaint_title}\\nMessage: {message}"
        )
        return

    resend.api_key = settings.resend_api_key

    subject = f"[OCMS] Complaint Logged" if is_new else f"[OCMS] Update on: {complaint_title}"
    
    html_content = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #CC0000; display: flex; align-items: center; gap: 8px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
            OCMS Alerts
        </h2>
        <p><strong>Tracking ID:</strong> {tracking_id}</p>
        <p><strong>Complaint Title:</strong> {complaint_title}</p>
        <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="white-space: pre-wrap;">{message}</p>
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-top: 30px; font-size: 14px; color: #4b5563;">
            <p style="margin: 0;">You can track your complaint in real-time using our secure Tracking ID portal at any time.</p>
        </div>
    </div>
    """

    try:
        response = resend.Emails.send({
            "from": f"OCMS Administrator <{settings.from_email}>",
            "to": [to_email],
            "subject": subject,
            "html": html_content
        })
        logger.info(f"Email sent successfully to {to_email}: {response}")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email} via Resend: {e}")
