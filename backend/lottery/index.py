import json
import os
import psycopg2
import psycopg2.extras
import random
import string
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage charity lottery system with prize fund and ticket generation
    Args: event - dict with httpMethod, body, queryStringParameters
          context - object with request_id for tracking
    Returns: HTTP response with lottery data or transaction results
    '''
    method: str = event.get('httpMethod', 'GET')
    
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
    
    # Connect to database
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    try:
        with psycopg2.connect(database_url) as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
                
                if method == 'GET':
                    # Get current lottery status and prize fund
                    params = event.get('queryStringParameters') or {}
                    action = params.get('action', 'status')
                    
                    if action == 'status':
                        data = get_lottery_status(cursor)
                    elif action == 'participants':
                        round_num = int(params.get('round', '0'))
                        data = get_lottery_participants(cursor, round_num)
                    elif action == 'winners':
                        round_num = int(params.get('round', '0'))
                        data = get_lottery_winners(cursor, round_num)
                    else:
                        return {
                            'statusCode': 400,
                            'headers': {'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Invalid action'})
                        }
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps(data)
                    }
                
                elif method == 'POST':
                    # Handle lottery operations
                    body_data = json.loads(event.get('body', '{}'))
                    action = body_data.get('action')
                    
                    if action == 'add_participant':
                        # Add investment as lottery participant
                        result = add_lottery_participant(cursor, conn, body_data)
                    elif action == 'draw_winners':
                        # Conduct lottery draw
                        result = conduct_lottery_draw(cursor, conn, body_data)
                    elif action == 'update_fund':
                        # Manual fund update (admin only)
                        result = update_prize_fund(cursor, conn, body_data)
                    else:
                        return {
                            'statusCode': 400,
                            'headers': {'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Invalid action'})
                        }
                    
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps(result)
                    }
                
                else:
                    return {
                        'statusCode': 405,
                        'headers': {'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Method not allowed'})
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

def get_lottery_status(cursor):
    '''Получает текущий статус лотереи и призового фонда'''
    # Get current lottery round
    cursor.execute("""
        SELECT 
            id, total_investment_amount, prize_fund_1, prize_fund_2, prize_fund_3,
            total_participants, current_round, draw_date, is_active
        FROM lottery 
        WHERE is_active = true 
        ORDER BY current_round DESC 
        LIMIT 1
    """)
    
    lottery = cursor.fetchone()
    
    if not lottery:
        # Create initial lottery if not exists
        cursor.execute("""
            INSERT INTO lottery (
                total_investment_amount, prize_fund_1, prize_fund_2, prize_fund_3,
                total_participants, current_round, is_active
            ) VALUES (0, 0, 0, 0, 0, 1, true)
            RETURNING *
        """)
        lottery = cursor.fetchone()
    
    # Calculate current totals from payments
    cursor.execute("""
        SELECT 
            COALESCE(SUM(amount), 0) as total_invested,
            COUNT(*) as total_investors
        FROM payments 
        WHERE payment_type = 'investment' 
        AND status = 'succeeded'
    """)
    
    current_stats = cursor.fetchone()
    
    # Calculate prize amounts (10%, 3%, 1% of total investment)
    total_amount = current_stats['total_invested'] if current_stats else 0
    prize_1 = int(total_amount * 0.10)  # 10%
    prize_2 = int(total_amount * 0.03)  # 3%
    prize_3 = int(total_amount * 0.01)  # 1%
    
    # Update lottery with current amounts
    cursor.execute("""
        UPDATE lottery 
        SET 
            total_investment_amount = %s,
            prize_fund_1 = %s,
            prize_fund_2 = %s,
            prize_fund_3 = %s,
            total_participants = %s,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = %s
    """, (
        total_amount,
        prize_1,
        prize_2, 
        prize_3,
        current_stats['total_investors'] if current_stats else 0,
        lottery['id']
    ))
    
    return {
        'current_round': lottery['current_round'],
        'total_investment_usd': total_amount / 100,
        'total_participants': current_stats['total_investors'] if current_stats else 0,
        'prize_fund_1_usd': prize_1 / 100,
        'prize_fund_2_usd': prize_2 / 100,
        'prize_fund_3_usd': prize_3 / 100,
        'total_prize_fund_usd': (prize_1 + prize_2 + prize_3) / 100,
        'draw_date': lottery['draw_date'].isoformat() if lottery['draw_date'] else None,
        'is_active': lottery['is_active'],
        'prize_percentages': {
            '1st_place': 10,
            '2nd_place': 3,
            '3rd_place': 1,
            'total': 14
        }
    }

def add_lottery_participant(cursor, conn, data):
    '''Добавляет участника в лотерею при инвестиции'''
    payment_id = data.get('payment_id')
    investment_amount = data.get('amount', 0)
    participant_email = data.get('email')
    
    if not payment_id:
        raise ValueError("Payment ID is required")
    
    # Get current lottery round
    cursor.execute("""
        SELECT current_round FROM lottery 
        WHERE is_active = true 
        ORDER BY current_round DESC 
        LIMIT 1
    """)
    
    lottery = cursor.fetchone()
    current_round = lottery['current_round'] if lottery else 1
    
    # Generate lottery tickets (1 ticket per $10 invested)
    num_tickets = max(1, investment_amount // 1000)  # 1000 cents = $10
    ticket_numbers = generate_ticket_numbers(num_tickets)
    
    # Add participant
    cursor.execute("""
        INSERT INTO lottery_participants (
            payment_id, lottery_round, participant_email, 
            investment_amount, ticket_numbers
        ) VALUES (%s, %s, %s, %s, %s)
        RETURNING id
    """, (
        payment_id,
        current_round,
        participant_email,
        investment_amount,
        ','.join(ticket_numbers)
    ))
    
    participant_id = cursor.fetchone()['id']
    conn.commit()
    
    return {
        'success': True,
        'participant_id': participant_id,
        'lottery_round': current_round,
        'tickets_count': num_tickets,
        'ticket_numbers': ticket_numbers,
        'message': f'Участник добавлен в лотерею раунда {current_round} с {num_tickets} билетами'
    }

def generate_ticket_numbers(count: int) -> List[str]:
    '''Генерирует уникальные номера билетов'''
    tickets = []
    for _ in range(count):
        # Generate ticket like "LT-ABC123"
        letters = ''.join(random.choices(string.ascii_uppercase, k=3))
        numbers = ''.join(random.choices(string.digits, k=3))
        ticket = f"LT-{letters}{numbers}"
        tickets.append(ticket)
    return tickets

def get_lottery_participants(cursor, round_num=0):
    '''Получает список участников лотереи'''
    if round_num == 0:
        cursor.execute("""
            SELECT current_round FROM lottery 
            WHERE is_active = true 
            ORDER BY current_round DESC 
            LIMIT 1
        """)
        result = cursor.fetchone()
        round_num = result['current_round'] if result else 1
    
    cursor.execute("""
        SELECT 
            lp.id, lp.participant_email, lp.investment_amount,
            lp.ticket_numbers, lp.created_at,
            p.payment_intent_id
        FROM lottery_participants lp
        JOIN payments p ON lp.payment_id = p.id
        WHERE lp.lottery_round = %s
        ORDER BY lp.created_at DESC
    """, (round_num,))
    
    participants = cursor.fetchall()
    
    participants_list = []
    for p in participants:
        participants_list.append({
            'id': p['id'],
            'email': p['participant_email'],
            'investment_usd': p['investment_amount'] / 100,
            'ticket_numbers': p['ticket_numbers'].split(',') if p['ticket_numbers'] else [],
            'tickets_count': len(p['ticket_numbers'].split(',')) if p['ticket_numbers'] else 0,
            'payment_id': p['payment_intent_id'],
            'joined_at': p['created_at'].isoformat() if p['created_at'] else None
        })
    
    return {
        'round': round_num,
        'participants': participants_list,
        'total_participants': len(participants_list)
    }

def get_lottery_winners(cursor, round_num=0):
    '''Получает список победителей лотереи'''
    if round_num == 0:
        cursor.execute("""
            SELECT current_round FROM lottery 
            WHERE is_active = true 
            ORDER BY current_round DESC 
            LIMIT 1
        """)
        result = cursor.fetchone()
        round_num = result['current_round'] if result else 1
    
    cursor.execute("""
        SELECT 
            lw.prize_position, lw.prize_amount, lw.winning_ticket,
            lw.claimed, lw.created_at,
            lp.participant_email, lp.investment_amount
        FROM lottery_winners lw
        JOIN lottery_participants lp ON lw.participant_id = lp.id
        WHERE lw.lottery_round = %s
        ORDER BY lw.prize_position ASC
    """, (round_num,))
    
    winners = cursor.fetchall()
    
    winners_list = []
    for w in winners:
        winners_list.append({
            'position': w['prize_position'],
            'prize_usd': w['prize_amount'] / 100,
            'winning_ticket': w['winning_ticket'],
            'winner_email': w['participant_email'],
            'investment_usd': w['investment_amount'] / 100,
            'claimed': w['claimed'],
            'drawn_at': w['created_at'].isoformat() if w['created_at'] else None
        })
    
    return {
        'round': round_num,
        'winners': winners_list,
        'total_winners': len(winners_list)
    }

def conduct_lottery_draw(cursor, conn, data):
    '''Проводит розыгрыш лотереи'''
    # This would be called manually or scheduled
    # Implementation for actual lottery draw logic
    # For now, return placeholder
    return {
        'success': True,
        'message': 'Lottery draw functionality - coming soon'
    }

def update_prize_fund(cursor, conn, data):
    '''Обновляет призовой фонд (административная функция)'''
    # Admin function to manually update prize fund if needed
    return {
        'success': True,
        'message': 'Prize fund update functionality - coming soon'
    }