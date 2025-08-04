-- SQL Schema for Subscription Management System

-- This file contains the CREATE TABLE statements for the required tables.
-- Run this script in your MySQL database to set up the schema.

-- 1. Companies Table
-- Stores information about the companies that subscribe to the service.
CREATE TABLE companies (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zipCode VARCHAR(20),
    country VARCHAR(100),
    taxId VARCHAR(100),
    logoUrl VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Subscription Plans Table
-- Defines the different subscription plans available.
CREATE TABLE subscription_plans (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    durationDays INT NOT NULL,
    features TEXT, -- Stored as a JSON string or comma-separated values
    tokenLimit INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Company Subscriptions Table
-- Links companies to their active subscription plans.
CREATE TABLE company_subscriptions (
    companyId VARCHAR(255) PRIMARY KEY,
    planId VARCHAR(255) NOT NULL,
    startDate TIMESTAMP NOT NULL,
    endDate TIMESTAMP NOT NULL,
    status ENUM('active', 'expired', 'cancelled') NOT NULL,
    tokensUsed INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (companyId) REFERENCES companies(id),
    FOREIGN KEY (planId) REFERENCES subscription_plans(id)
);

-- 4. Support Tickets Table
-- Stores support requests from companies.
CREATE TABLE support_tickets (
    id VARCHAR(255) PRIMARY KEY,
    companyId VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'closed') NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (companyId) REFERENCES companies(id)
);

-- Optional: Insert some default subscription plans to get started
INSERT INTO subscription_plans (id, name, price, durationDays, features, tokenLimit) VALUES
('plan_basic_30', 'Basic Monthly', 29.99, 30, '["5 Users","1000 Invoices/Month","Basic Reporting"]', 1000),
('plan_pro_30', 'Pro Monthly', 79.99, 30, '["20 Users","5000 Invoices/Month","Advanced Reporting","API Access"]', 5000),
('plan_enterprise_365', 'Enterprise Yearly', 999.99, 365, '["Unlimited Users","Unlimited Invoices","Premium Support","Custom Integrations"]', 100000);

