import { neon } from '@neondatabase/serverless';

/* eslint-disable no-undef */
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(100) UNIQUE NOT NULL,
        label VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image_url TEXT,
        on_sale BOOLEAN DEFAULT false,
        sale_discount_pct DECIMAL(5,2) DEFAULT 0,
        sale_ends_at TIMESTAMPTZ,
        sort_order INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        created_date TIMESTAMPTZ DEFAULT NOW(),
        updated_date TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM categories ORDER BY sort_order ASC, created_date ASC`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { key, label, description, cover_image_url, on_sale, sale_discount_pct, sale_ends_at, sort_order, status } = req.body;
      const rows = await sql`
        INSERT INTO categories (key, label, description, cover_image_url, on_sale, sale_discount_pct, sale_ends_at, sort_order, status)
        VALUES (${key}, ${label}, ${description}, ${cover_image_url}, ${on_sale || false}, ${sale_discount_pct || 0}, ${sale_ends_at || null}, ${sort_order || 0}, ${status || 'active'})
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { key, label, description, cover_image_url, on_sale, sale_discount_pct, sale_ends_at, sort_order, status } = req.body;
      const rows = await sql`
        UPDATE categories SET
          key = ${key}, label = ${label}, description = ${description},
          cover_image_url = ${cover_image_url}, on_sale = ${on_sale || false},
          sale_discount_pct = ${sale_discount_pct || 0}, sale_ends_at = ${sale_ends_at || null},
          sort_order = ${sort_order || 0}, status = ${status || 'active'}, updated_date = NOW()
        WHERE id = ${id} RETURNING *
      `;
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM categories WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Categories API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
