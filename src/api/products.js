import { neon } from '@neondatabase/serverless';

/* eslint-disable no-undef */
const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
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
      const { name, description, price, category, collection, sizes, colors, image_url, lifestyle_image_url, stock, featured, style_guide, fabric, status } = req.body;
      const rows = await sql`
        INSERT INTO products (name, description, price, category, collection, sizes, colors, image_url, lifestyle_image_url, stock, featured, style_guide, fabric, status, created_date, updated_date)
        VALUES (${name}, ${description}, ${price}, ${category}, ${collection}, ${JSON.stringify(sizes || [])}, ${JSON.stringify(colors || [])}, ${image_url}, ${lifestyle_image_url}, ${stock}, ${featured || false}, ${JSON.stringify(style_guide || [])}, ${fabric}, ${status || 'active'}, NOW(), NOW())
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { name, description, price, category, collection, sizes, colors, image_url, lifestyle_image_url, stock, featured, style_guide, fabric, status } = req.body;
      const rows = await sql`
        UPDATE products SET
          name = ${name}, description = ${description}, price = ${price}, category = ${category},
          collection = ${collection}, sizes = ${JSON.stringify(sizes || [])}, colors = ${JSON.stringify(colors || [])},
          image_url = ${image_url}, lifestyle_image_url = ${lifestyle_image_url}, stock = ${stock},
          featured = ${featured || false}, style_guide = ${JSON.stringify(style_guide || [])},
          fabric = ${fabric}, status = ${status || 'active'}, updated_date = NOW()
        WHERE id = ${id} RETURNING *
      `;
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM products WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
