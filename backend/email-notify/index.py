import json
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Отправляет email уведомления победителям лотереи
    Args: event - dict с httpMethod, body (содержит email, subject, message)
          context - объект с атрибутами: request_id, function_name, function_version
    Returns: HTTP response dict с результатом отправки
    '''
    
    try:
        # Debug: log the full event for troubleshooting
        print(f"Event received: {json.dumps(event)}")
        print(f"Context: request_id={getattr(context, 'request_id', 'unknown')}")
        
        method: str = event.get('httpMethod', 'POST')
        
        # Handle CORS OPTIONS request
        if method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Max-Age': '86400'
                },
                'body': ''
            }
        
        if method != 'POST':
            return {
                'statusCode': 405,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
        
        # Parse request body
        body_data = json.loads(event.get('body', '{}'))
        to_email = body_data.get('to_email')
        subject = body_data.get('subject', 'Уведомление о выигрыше!')
        message = body_data.get('message', '')
        
        if not to_email or not message:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing to_email or message'})
            }
        
        # Get SMTP configuration from environment
        smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_user = os.environ.get('SMTP_USER')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        
        if not smtp_user or not smtp_password:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'SMTP credentials not configured'})
            }
        
        # Create email message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = smtp_user
        msg['To'] = to_email
        
        # Create HTML version of the message
        html_message = f"""
        <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">🎉 Поздравляем!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Вы выиграли в благотворительной лотерее!</p>
                </div>
                
                <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        {message}
                    </div>
                    
                    <div style="background: #e8f5e8; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #155724;">
                            <strong>Важно:</strong> Ваш выигрыш будет переведен в течение 1-3 рабочих дней на контактные данные, указанные при инвестировании.
                        </p>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
                    
                    <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
                        Спасибо за участие в нашем благотворительном проекте! Ваша инвестиция помогает делать мир лучше.
                    </p>
                    
                    <div style="text-align: center; margin-top: 25px;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            Это автоматическое уведомление. Пожалуйста, не отвечайте на это письмо.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Create plain text version
        text_message = f"""
Поздравляем! Вы выиграли в благотворительной лотерее!

{message}

Важно: Ваш выигрыш будет переведен в течение 1-3 рабочих дней на контактные данные, указанные при инвестировании.

Спасибо за участие в нашем благотворительном проекте! Ваша инвестиция помогает делать мир лучше.

---
Это автоматическое уведомление. Пожалуйста, не отвечайте на это письмо.
        """
        
        # Attach parts
        msg.attach(MIMEText(text_message, 'plain'))
        msg.attach(MIMEText(html_message, 'html'))
        
        # Send email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.send_message(msg)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Email sent successfully',
                'to': to_email,
                'request_id': getattr(context, 'request_id', 'unknown')
            })
        }
        
    except Exception as e:
        print(f"Error in email handler: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'error': f'Failed to send email: {str(e)}',
                'request_id': getattr(context, 'request_id', 'unknown')
            })
        }