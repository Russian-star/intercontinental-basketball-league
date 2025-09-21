import json
import os
import requests
import psycopg2
import psycopg2.extras
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, ValidationError

class PaymentRequest(BaseModel):
    amount: int = Field(..., gt=0, description="Amount in cents (e.g., 5000 for $50.00)")
    currency: str = Field(default="usd", pattern="^[a-z]{3}$")
    payment_type: str = Field(..., pattern="^(investment|donation)$")
    description: Optional[str] = Field(None, max_length=500)
    customer_email: Optional[str] = Field(None, pattern=r'^[^@]+@[^@]+\.[^@]+$')
    customer_name: Optional[str] = Field(None, max_length=100)
    metadata: Optional[Dict[str, str]] = Field(default_factory=dict)

def handler(event, context):
    '''
    Business: Process Stripe payment creation for investments and donations
    Args: event - dict with httpMethod, body containing payment details
          context - object with request_id for tracking
    Returns: HTTP response with Stripe payment intent or error
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
    
    # Проверяем наличие Stripe API ключа
    stripe_key = os.environ.get('STRIPE_SECRET_KEY')
    if not stripe_key:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Stripe API key not configured'})
        }
    
    # Импортируем Stripe только если ключ есть
    try:
        import stripe
        stripe.api_key = stripe_key
    except ImportError:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Stripe library not available'})
        }
    
    if method == 'GET':
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'status': 'Payment service is running'})
        }
    
    if method == 'POST':
        try:
            # Parse and validate request data
            body_data = json.loads(event.get('body', '{}'))
            payment_req = PaymentRequest(**body_data)
            
            # Prepare description and metadata
            description = f"{payment_req.payment_type.title()}: {payment_req.description or 'No description'}"
            metadata = {
                'payment_type': payment_req.payment_type,
                'request_id': context.request_id
            }
            if payment_req.metadata:
                metadata.update(payment_req.metadata)
            
            # Create Stripe PaymentIntent
            intent = stripe.PaymentIntent.create(
                amount=payment_req.amount,
                currency=payment_req.currency,
                description=description,
                metadata=metadata,
                automatic_payment_methods={'enabled': True},
                receipt_email=payment_req.customer_email if payment_req.customer_email else None
            )
            
            # Save payment to database
            try:
                save_payment_to_db({
                    'payment_intent_id': intent.id,
                    'amount': payment_req.amount,
                    'currency': payment_req.currency,
                    'payment_type': payment_req.payment_type,
                    'customer_email': payment_req.customer_email,
                    'customer_name': payment_req.customer_name,
                    'description': payment_req.description,
                    'metadata': json.dumps(metadata) if metadata else None,
                    'status': intent.status
                })
            except Exception as db_error:
                print(f"Database save failed: {db_error}")
            
            # Отправляем email уведомление
            try:
                send_payment_notification({
                    'payment_id': intent.id,
                    'amount': intent.amount,
                    'currency': intent.currency,
                    'payment_type': payment_req.payment_type,
                    'payer_email': payment_req.customer_email,
                    'description': payment_req.description
                })
            except Exception as email_error:
                # Логируем ошибку email, но не прерываем платеж
                print(f"Email notification failed: {email_error}")
            
            # Return client secret for frontend
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'client_secret': intent.client_secret,
                    'payment_intent_id': intent.id,
                    'amount': payment_req.amount,
                    'currency': payment_req.currency,
                    'status': intent.status
                })
            }
            
        except ValidationError as e:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'error': 'Invalid payment data',
                    'details': e.errors()
                })
            }
        
        except stripe.error.StripeError as e:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'error': 'Payment processing error',
                    'message': str(e)
                })
            }
        
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'error': 'Internal server error',
                    'request_id': context.request_id
                })
            }

def save_payment_to_db(payment_data):
    '''Сохраняет платеж в базу данных'''
    try:
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            raise Exception("DATABASE_URL not configured")
        
        with psycopg2.connect(database_url) as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO payments (
                        payment_intent_id, amount, currency, payment_type,
                        customer_email, customer_name, description, metadata, status
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    payment_data['payment_intent_id'],
                    payment_data['amount'],
                    payment_data['currency'],
                    payment_data['payment_type'],
                    payment_data.get('customer_email'),
                    payment_data.get('customer_name'),
                    payment_data.get('description'),
                    payment_data.get('metadata'),
                    payment_data['status']
                ))
                conn.commit()
    except Exception as e:
        print(f"Database error: {e}")
        raise

def send_payment_notification(payment_data):
    '''Отправляет уведомление о платеже через email сервис'''
    try:
        email_url = 'https://functions.poehali.dev/02a484b7-65f0-4f91-9812-ee40c53aff64'
        
        payload = {
            'action': 'payment_notification',
            'payment_id': payment_data['payment_id'],
            'amount': payment_data['amount'],
            'currency': payment_data['currency'],
            'payment_type': payment_data['payment_type'],
            'payer_email': payment_data.get('payer_email'),
            'description': payment_data.get('description')
        }
        
        response = requests.post(
            email_url,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        return response.json() if response.status_code == 200 else None
        
    except Exception as e:
        print(f"Failed to send email notification: {e}")
        return None