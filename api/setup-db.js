import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Guard: ensure DATABASE_URL is configured in Vercel environment variables
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      error: 'DATABASE_URL environment variable is not set. '
           + 'Add it in Vercel → Project Settings → Environment Variables.',
    });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // ── Products table ──────────────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name                VARCHAR(255)  NOT NULL,
        description         TEXT,
        price               DECIMAL(10,2) NOT NULL DEFAULT 0,
        category            VARCHAR(100),
        collection          VARCHAR(255),
        sizes               JSONB         DEFAULT '[]',
        colors              JSONB         DEFAULT '[]',
        image_url           TEXT,
        lifestyle_image_url TEXT,
        stock               INTEGER       DEFAULT 0,
        featured            BOOLEAN       DEFAULT false,
        style_guide         JSONB         DEFAULT '[]',
        fabric              VARCHAR(255),
        status              VARCHAR(50)   DEFAULT 'active',
        created_date        TIMESTAMPTZ   DEFAULT NOW(),
        updated_date        TIMESTAMPTZ   DEFAULT NOW()
      )
    `;

    // ── Orders table ────────────────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_email   VARCHAR(255)  NOT NULL,
        customer_name    VARCHAR(255),
        items            JSONB         DEFAULT '[]',
        total            DECIMAL(10,2) DEFAULT 0,
        status           VARCHAR(50)   DEFAULT 'pending',
        shipping_address TEXT,
        tracking_number  VARCHAR(255),
        created_date     TIMESTAMPTZ   DEFAULT NOW(),
        updated_date     TIMESTAMPTZ   DEFAULT NOW()
      )
    `;

    return res.status(200).json({
      success: true,
      message: 'Tables created (or already exist).',
    });
  } catch (error) {
    console.error('[setup-db] error:', error);
    return res.status(500).json({ error: error.message });
  }
}
