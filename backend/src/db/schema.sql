-- Products table
CREATE TABLE IF NOT EXISTS products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    affiliate_url TEXT NOT NULL,
    price DECIMAL(10, 2),
    image_url TEXT,
    inci TEXT[], -- Array of INCI ingredients
    key_actives TEXT[], -- Array of key active ingredients
    tags TEXT[], -- Array of tags for matching
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Evidence table
CREATE TABLE IF NOT EXISTS evidence (
    evidence_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    active_ingredient VARCHAR(255) NOT NULL,
    paper_title TEXT NOT NULL,
    source TEXT NOT NULL,
    year INTEGER NOT NULL,
    short_summary TEXT NOT NULL,
    strength_label VARCHAR(20) CHECK (strength_label IN ('strong', 'moderate', 'preliminary')),
    pubmed_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Product-Evidence mapping (many-to-many)
CREATE TABLE IF NOT EXISTS product_evidence (
    product_id UUID REFERENCES products(product_id) ON DELETE CASCADE,
    evidence_id UUID REFERENCES evidence(evidence_id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, evidence_id)
);

-- Analysis history
CREATE TABLE IF NOT EXISTS analyses (
    analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255), -- Optional user identifier
    image_path TEXT,
    skin_tone VARCHAR(50),
    overall_assessment TEXT,
    detected_issues JSONB, -- Store full analysis as JSONB
    consent_given BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Affiliate click tracking
CREATE TABLE IF NOT EXISTS affiliate_clicks (
    click_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(product_id) ON DELETE SET NULL,
    analysis_id UUID REFERENCES analyses(analysis_id) ON DELETE SET NULL,
    user_id VARCHAR(255),
    clicked_at TIMESTAMP DEFAULT NOW(),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    referrer TEXT
);

-- User consent log
CREATE TABLE IF NOT EXISTS user_consents (
    consent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    consent_text TEXT NOT NULL,
    consent_version VARCHAR(20) NOT NULL,
    given_at TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(45)
);

-- Admin users (basic)
CREATE TABLE IF NOT EXISTS admin_users (
    admin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_products_key_actives ON products USING GIN (key_actives);
CREATE INDEX IF NOT EXISTS idx_evidence_active ON evidence(active_ingredient);
CREATE INDEX IF NOT EXISTS idx_analyses_user ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_product ON affiliate_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_analysis ON affiliate_clicks(analysis_id);

