import { neon } from '@neondatabase/serverless';

/* eslint-disable no-undef */
const sql = neon(process.env.DATABASE_URL);

// Run migrations only once per cold start
let migrationDone = false;
async function runMigrations() {
  if (migrationDone) return;
  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2)`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_ends_at TIMESTAMPTZ`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS on_sale BOOLEAN DEFAULT false`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS color_images JSONB DEFAULT '{}'`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS size_stock JSONB DEFAULT '{}'`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS extra_images JSONB DEFAULT '[]'`;
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT`;
    migrationDone = true;
  } catch (e) {
    console.error('Migration error:', e);
  }
}

export default async function handler(req, res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Secure write operations with admin key
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const adminKey = req.headers['x-admin-key'];
    const expectedKey = process.env.ADMIN_SECRET_KEY;
    if (expectedKey && adminKey !== expectedKey) {
      return res.status(403).json({ error: 'Forbidden' });
    }
  }

  try {
    await runMigrations();

    if (req.method === 'GET') {
      const { id, category, status, limit } = req.query;

      if (id) {
        const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
        return res.status(200).json(rows[0] || null);
      }

      let query = `SELECT * FROM products WHERE 1=1`;
      const params = [];
      let idx = 1;

      if (status) { query += ` AND status = $${idx++}`; params.push(status); }
      if (category) { query += ` AND category = $${idx++}`; params.push(category); }
      query += ` ORDER BY created_date DESC`;
      if (limit) { query += ` LIMIT $${idx++}`; params.push(Number(limit)); }

      const rows = await sql.unsafe(query, params);
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const {
        name, description, price, sale_price, sale_ends_at, on_sale,
        category, collection, sizes, size_stock, colors, color_images,
        image_url, lifestyle_image_url, extra_images, video_url,
        stock, featured, style_guide, fabric, status
      } = req.body;

      if (!name || price === undefined || price === null) {
        return res.status(400).json({ error: 'name and price are required' });
      }

      const rows = await sql`
        INSERT INTO products (
          name, description, price, sale_price, sale_ends_at, on_sale,
          category, collection, sizes, size_stock, colors, color_images,
          image_url, lifestyle_image_url, extra_images, video_url,
          stock, featured, style_guide, fabric, status, created_date, updated_date
        ) VALUES (
          ${name}, ${description || null}, ${Number(price)},
          ${sale_price ? Number(sale_price) : null}, ${sale_ends_at || null}, ${on_sale || false},
          ${category || null}, ${collection || null},
          ${JSON.stringify(sizes || [])}, ${JSON.stringify(size_stock || {})},
          ${JSON.stringify(colors || [])}, ${JSON.stringify(color_images || {})},
          ${image_url || null}, ${lifestyle_image_url || null},
          ${JSON.stringify(extra_images || [])}, ${video_url || null},
          ${Number(stock) || 0}, ${featured || false},
          ${JSON.stringify(style_guide || [])}, ${fabric || null},
          ${status || 'active'}, NOW(), NOW()
        ) RETURNING *
      `;
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });

      const {
        name, description, price, sale_price, sale_ends_at, on_sale,
        category, collection, sizes, size_stock, colors, color_images,
        image_url, lifestyle_image_url, extra_images, video_url,
        stock, featured, style_guide, fabric, status
      } = req.body;

      const rows = await sql`
        UPDATE products SET
          name = ${name}, description = ${description || null}, price = ${Number(price)},
          sale_price = ${sale_price ? Number(sale_price) : null},
          sale_ends_at = ${sale_ends_at || null}, on_sale = ${on_sale || false},
          category = ${category || null}, collection = ${collection || null},
          sizes = ${JSON.stringify(sizes || [])}, size_stock = ${JSON.stringify(size_stock || {})},
          colors = ${JSON.stringify(colors || [])}, color_images = ${JSON.stringify(color_images || {})},
          image_url = ${image_url || null}, lifestyle_image_url = ${lifestyle_image_url || null},
          extra_images = ${JSON.stringify(extra_images || [])}, video_url = ${video_url || null},
          stock = ${Number(stock) || 0}, featured = ${featured || false},
          style_guide = ${JSON.stringify(style_guide || [])}, fabric = ${fabric || null},
          status = ${status || 'active'}, updated_date = NOW()
        WHERE id = ${id} RETURNING *
      `;

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });
      await sql`DELETE FROM products WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
