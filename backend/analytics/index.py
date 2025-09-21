import json
import os
import psycopg2
import psycopg2.extras
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Provide payment analytics and statistics for dashboard
    Args: event - dict with httpMethod, queryStringParameters for filters
          context - object with request_id for tracking
    Returns: HTTP response with payment analytics data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS request
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'GET':
        try:
            # Get query parameters
            params = event.get('queryStringParameters') or {}
            endpoint = params.get('endpoint', 'summary')
            
            # Connect to database
            database_url = os.environ.get('DATABASE_URL')
            if not database_url:
                return {
                    'statusCode': 500,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Database not configured'})
                }
            
            with psycopg2.connect(database_url) as conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                    
                    if endpoint == 'summary':
                        # Get summary statistics
                        data = get_summary_stats(cursor)
                    elif endpoint == 'payments':
                        # Get payments list with pagination
                        limit = int(params.get('limit', '50'))
                        offset = int(params.get('offset', '0'))
                        payment_type = params.get('type')
                        data = get_payments_list(cursor, limit, offset, payment_type)
                    elif endpoint == 'charts':
                        # Get chart data for last 30 days
                        days = int(params.get('days', '30'))
                        data = get_chart_data(cursor, days)
                    else:
                        return {
                            'statusCode': 400,
                            'headers': {'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Invalid endpoint'})
                        }
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps(data)
                    }
                    
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'error': 'Internal server error',
                    'message': str(e),
                    'request_id': context.request_id
                })
            }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }

def get_summary_stats(cursor):
    '''Получает общую статистику платежей'''
    # Total statistics
    cursor.execute("""
        SELECT 
            COUNT(*) as total_payments,
            COALESCE(SUM(amount), 0) as total_amount,
            COUNT(CASE WHEN payment_type = 'donation' THEN 1 END) as total_donations,
            COUNT(CASE WHEN payment_type = 'investment' THEN 1 END) as total_investments,
            COALESCE(SUM(CASE WHEN payment_type = 'donation' THEN amount ELSE 0 END), 0) as donations_amount,
            COALESCE(SUM(CASE WHEN payment_type = 'investment' THEN amount ELSE 0 END), 0) as investments_amount
        FROM payments
        WHERE status != 'failed'
    """)
    total_stats = cursor.fetchone()
    
    # Last 30 days statistics
    cursor.execute("""
        SELECT 
            COUNT(*) as recent_payments,
            COALESCE(SUM(amount), 0) as recent_amount
        FROM payments 
        WHERE created_at >= NOW() - INTERVAL '30 days'
        AND status != 'failed'
    """)
    recent_stats = cursor.fetchone()
    
    # Average payment amount
    cursor.execute("""
        SELECT COALESCE(AVG(amount), 0) as avg_amount
        FROM payments 
        WHERE status != 'failed'
    """)
    avg_stats = cursor.fetchone()
    
    return {
        'total_payments': total_stats['total_payments'],
        'total_amount_usd': total_stats['total_amount'] / 100,  # Convert cents to dollars
        'total_donations': total_stats['total_donations'],
        'total_investments': total_stats['total_investments'],
        'donations_amount_usd': total_stats['donations_amount'] / 100,
        'investments_amount_usd': total_stats['investments_amount'] / 100,
        'recent_payments_30d': recent_stats['recent_payments'],
        'recent_amount_30d_usd': recent_stats['recent_amount'] / 100,
        'average_payment_usd': avg_stats['avg_amount'] / 100
    }

def get_payments_list(cursor, limit, offset, payment_type=None):
    '''Получает список платежей с пагинацией'''
    where_clause = "WHERE status != 'failed'"
    params = []
    
    if payment_type and payment_type in ['donation', 'investment']:
        where_clause += " AND payment_type = %s"
        params.append(payment_type)
    
    # Get total count
    cursor.execute(f"SELECT COUNT(*) as total FROM payments {where_clause}", params)
    total_count = cursor.fetchone()['total']
    
    # Get payments with pagination
    query = f"""
        SELECT 
            id, payment_intent_id, amount, currency, payment_type, status,
            customer_email, customer_name, description,
            created_at, completed_at
        FROM payments 
        {where_clause}
        ORDER BY created_at DESC 
        LIMIT %s OFFSET %s
    """
    params.extend([limit, offset])
    
    cursor.execute(query, params)
    payments = cursor.fetchall()
    
    # Convert to dict and format amounts
    payments_list = []
    for payment in payments:
        payment_dict = dict(payment)
        payment_dict['amount_usd'] = payment_dict['amount'] / 100
        payment_dict['created_at'] = payment_dict['created_at'].isoformat() if payment_dict['created_at'] else None
        payment_dict['completed_at'] = payment_dict['completed_at'].isoformat() if payment_dict['completed_at'] else None
        payments_list.append(payment_dict)
    
    return {
        'payments': payments_list,
        'total': total_count,
        'limit': limit,
        'offset': offset,
        'has_more': total_count > offset + limit
    }

def get_chart_data(cursor, days):
    '''Получает данные для графиков за указанное количество дней'''
    # Daily payments chart
    cursor.execute("""
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count,
            SUM(amount) as amount,
            COUNT(CASE WHEN payment_type = 'donation' THEN 1 END) as donations,
            COUNT(CASE WHEN payment_type = 'investment' THEN 1 END) as investments
        FROM payments 
        WHERE created_at >= NOW() - INTERVAL '%s days'
        AND status != 'failed'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
    """, (days,))
    
    daily_data = cursor.fetchall()
    
    # Payment type distribution
    cursor.execute("""
        SELECT 
            payment_type,
            COUNT(*) as count,
            SUM(amount) as amount
        FROM payments 
        WHERE created_at >= NOW() - INTERVAL '%s days'
        AND status != 'failed'
        GROUP BY payment_type
    """, (days,))
    
    type_distribution = cursor.fetchall()
    
    # Format data
    daily_chart = []
    for row in daily_data:
        daily_chart.append({
            'date': row['date'].isoformat() if row['date'] else None,
            'count': row['count'],
            'amount_usd': row['amount'] / 100 if row['amount'] else 0,
            'donations': row['donations'],
            'investments': row['investments']
        })
    
    type_chart = []
    for row in type_distribution:
        type_chart.append({
            'type': row['payment_type'],
            'count': row['count'],
            'amount_usd': row['amount'] / 100 if row['amount'] else 0
        })
    
    return {
        'daily_payments': daily_chart,
        'payment_types': type_chart,
        'period_days': days
    }