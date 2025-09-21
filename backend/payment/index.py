import json
import os
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

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Process Stripe payment creation for investments and donations
    Args: event - dict with httpMethod, body containing payment details
          context - object with request_id for tracking
    Returns: HTTP response with Stripe payment intent or error
    '''
    method: str = event.get('httpMethod', 'GET')
    
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
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    # Get Stripe secret key
    stripe_secret = os.environ.get('STRIPE_SECRET_KEY')
    if not stripe_secret:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Payment system not configured'})
        }
    
    try:
        # Import Stripe (will be installed via requirements.txt)
        import stripe
        stripe.api_key = stripe_secret
        
        # Parse and validate request
        body_data = json.loads(event.get('body', '{}'))
        payment_req = PaymentRequest(**body_data)
        
        # Create payment description based on type
        if payment_req.payment_type == 'investment':
            description = f"IBLC Investment - ${payment_req.amount / 100:.2f}"
        else:  # donation
            description = f"IBLC Charity Donation - ${payment_req.amount / 100:.2f}"
        
        if payment_req.description:
            description += f" - {payment_req.description}"
        
        # Prepare metadata
        metadata = {
            'request_id': context.request_id,
            'payment_type': payment_req.payment_type,
            'source': 'iblc_website'
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