-- Migration: Add subscriptions table
-- Description: Add subscriptions table for premium user subscriptions
-- Date: 2026-06-20

-- ===========================================
-- Table: subscriptions
-- ===========================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  
  -- ENUM('basic', 'premium', 'enterprise') converted to VARCHAR + CHECK constraint
  plan_type VARCHAR(20) NOT NULL DEFAULT 'basic'
    CHECK (plan_type IN ('basic', 'premium', 'enterprise')),
  
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  
  -- ENUM('telebirr', 'bank_transfer', 'cash', 'stripe') converted to VARCHAR + CHECK constraint
  gateway VARCHAR(20) NOT NULL DEFAULT 'telebirr'
    CHECK (gateway IN ('telebirr', 'bank_transfer', 'cash', 'stripe')),
  
  transaction_id VARCHAR(120),
  
  -- ENUM('active', 'cancelled', 'expired') converted to VARCHAR + CHECK constraint
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled', 'expired')),
  
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  
  -- TINYINT(1) converted to BOOLEAN
  auto_renew BOOLEAN NOT NULL DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_subscription_user 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
);

-- Add comments
COMMENT ON TABLE subscriptions IS 'User subscriptions for premium access';
COMMENT ON COLUMN subscriptions.plan_type IS 'Subscription plan: basic, premium, or enterprise';
COMMENT ON COLUMN subscriptions.status IS 'Subscription status: active, cancelled, or expired';
COMMENT ON COLUMN subscriptions.auto_renew IS 'Auto-renewal flag (converted from MySQL TINYINT(1))';
COMMENT ON COLUMN subscriptions.updated_at IS 'Automatically updated on row modification via trigger';

-- Create trigger for updated_at
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);
