import json
import os
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, EmailStr, ValidationError
import sendgrid
from sendgrid.helpers.mail import Mail, Email, To, Content

class EmailRequest(BaseModel):
    to_email: EmailStr = Field(..., description="Email получателя")
    subject: str = Field(..., min_length=1, max_length=200, description="Тема письма")
    content: str = Field(..., min_length=1, description="Содержимое письма в HTML или текст")
    from_email: Optional[EmailStr] = Field(default="noreply@poehali.dev", description="Email отправителя")
    content_type: str = Field(default="text/html", pattern="^(text/plain|text/html)$", description="Тип контента")

class PaymentNotificationRequest(BaseModel):
    payment_id: str = Field(..., description="ID платежа")
    amount: int = Field(..., gt=0, description="Сумма в центах")
    currency: str = Field(default="usd", description="Валюта")
    payment_type: str = Field(..., description="Тип платежа (donation/investment)")
    payer_email: Optional[EmailStr] = Field(default=None, description="Email плательщика")
    description: Optional[str] = Field(default=None, description="Описание платежа")

def handler(event, context):
    '''
    Business: Отправляет email уведомления через SendGrid
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами: request_id, function_name, function_version
    Returns: HTTP response dict
    '''
    method = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    # Проверяем наличие SendGrid API ключа
    sendgrid_api_key = os.environ.get('SENDGRID_API_KEY')
    if not sendgrid_api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': False,
                'error': 'SendGrid API key not configured'
            })
        }
    
    if method == 'POST':
        try:
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action', 'send_email')
            
            if action == 'payment_notification':
                # Отправка уведомления о платеже
                payment_req = PaymentNotificationRequest(**body_data)
                result = send_payment_notification(payment_req, sendgrid_api_key)
                
            else:
                # Обычная отправка email
                email_req = EmailRequest(**body_data)
                result = send_email(email_req, sendgrid_api_key)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result)
            }
            
        except ValidationError as e:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': False,
                    'error': 'Validation error',
                    'details': e.errors()
                })
            }
    
    # GET запрос - проверка статуса
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'status': 'Email service is running',
            'sendgrid_configured': bool(sendgrid_api_key)
        })
    }

def send_email(email_req: EmailRequest, api_key: str) -> Dict[str, Any]:
    '''Отправляет обычный email'''
    try:
        sg = sendgrid.SendGridAPIClient(api_key=api_key)
        
        from_email = Email(email_req.from_email)
        to_email = To(email_req.to_email)
        content = Content(email_req.content_type, email_req.content)
        
        mail = Mail(from_email, to_email, email_req.subject, content)
        
        response = sg.client.mail.send.post(request_body=mail.get())
        
        return {
            'success': True,
            'message': 'Email sent successfully',
            'status_code': response.status_code
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to send email: {str(e)}'
        }

def send_payment_notification(payment_req: PaymentNotificationRequest, api_key: str) -> Dict[str, Any]:
    '''Отправляет уведомление о платеже'''
    try:
        notification_email = os.environ.get('NOTIFICATION_EMAIL')
        if not notification_email:
            return {
                'success': False,
                'error': 'Notification email not configured'
            }
        
        # Форматируем сумму
        amount_formatted = f"${payment_req.amount / 100:.2f}"
        
        # Определяем тип платежа на русском
        payment_type_ru = {
            'donation': 'Пожертвование',
            'investment': 'Инвестиция'
        }.get(payment_req.payment_type, payment_req.payment_type.title())
        
        # HTML содержимое письма
        html_content = f'''
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed; text-align: center;">💰 Новый платеж получен!</h2>
            
            <div style="background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0;">Детали платежа:</h3>
                <p style="margin: 5px 0;"><strong>Тип:</strong> {payment_type_ru}</p>
                <p style="margin: 5px 0;"><strong>Сумма:</strong> {amount_formatted} {payment_req.currency.upper()}</p>
                <p style="margin: 5px 0;"><strong>ID платежа:</strong> {payment_req.payment_id}</p>
                {f'<p style="margin: 5px 0;"><strong>Email плательщика:</strong> {payment_req.payer_email}</p>' if payment_req.payer_email else ''}
                {f'<p style="margin: 5px 0;"><strong>Описание:</strong> {payment_req.description}</p>' if payment_req.description else ''}
            </div>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    Это автоматическое уведомление о новом платеже в вашей системе.
                    Проверьте Stripe Dashboard для получения полной информации.
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://dashboard.stripe.com/payments" 
                   style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Открыть Stripe Dashboard
                </a>
            </div>
        </div>
        '''
        
        sg = sendgrid.SendGridAPIClient(api_key=api_key)
        
        from_email = Email("noreply@poehali.dev", "Payment System")
        to_email = To(notification_email)
        subject = f"🔔 Новый {payment_type_ru.lower()} - {amount_formatted}"
        content = Content("text/html", html_content)
        
        mail = Mail(from_email, to_email, subject, content)
        
        response = sg.client.mail.send.post(request_body=mail.get())
        
        return {
            'success': True,
            'message': 'Payment notification sent successfully',
            'status_code': response.status_code,
            'sent_to': notification_email
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Failed to send payment notification: {str(e)}'
        }