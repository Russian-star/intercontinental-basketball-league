-- Create lottery table to track prize fund and draws
CREATE TABLE lottery (
    id SERIAL PRIMARY KEY,
    total_investment_amount INTEGER NOT NULL DEFAULT 0,
    prize_fund_1 INTEGER NOT NULL DEFAULT 0,
    prize_fund_2 INTEGER NOT NULL DEFAULT 0, 
    prize_fund_3 INTEGER NOT NULL DEFAULT 0,
    total_participants INTEGER NOT NULL DEFAULT 0,
    current_round INTEGER NOT NULL DEFAULT 1,
    draw_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lottery participants table
CREATE TABLE lottery_participants (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER NOT NULL,
    lottery_round INTEGER NOT NULL,
    participant_email VARCHAR(255),
    investment_amount INTEGER NOT NULL,
    ticket_numbers TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- Create lottery winners table  
CREATE TABLE lottery_winners (
    id SERIAL PRIMARY KEY,
    lottery_round INTEGER NOT NULL,
    participant_id INTEGER NOT NULL,
    prize_position INTEGER NOT NULL CHECK (prize_position IN (1, 2, 3)),
    prize_amount INTEGER NOT NULL,
    winning_ticket VARCHAR(50),
    claimed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES lottery_participants(id)
);

-- Initialize first lottery round
INSERT INTO lottery (
    total_investment_amount, 
    prize_fund_1, 
    prize_fund_2, 
    prize_fund_3, 
    total_participants,
    current_round,
    is_active
) VALUES (0, 0, 0, 0, 0, 1, true);

-- Create indexes
CREATE INDEX idx_lottery_participants_round ON lottery_participants(lottery_round);
CREATE INDEX idx_lottery_participants_payment ON lottery_participants(payment_id);
CREATE INDEX idx_lottery_winners_round ON lottery_winners(lottery_round);
CREATE INDEX idx_lottery_current_round ON lottery(current_round, is_active);