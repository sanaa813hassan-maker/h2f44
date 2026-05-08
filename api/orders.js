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
      const rows = await sql`SELECT * FROM orders ORDER BY created_date DESC`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { customer_email, customer_name, items, total, status, shipping_address } = req.body;
      const rows = await sql`
        INSERT INTO orders (customer_email, customer_name, items, total, status, shipping_address, created_date, updated_date)
        VALUES (${customer_email}, ${customer_name}, ${JSON.stringify(items || [])}, ${total}, ${status || 'pending'}, ${shipping_address}, NOW(), NOW())
        RETURNING *
      `;
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { status, tracking_number, shipping_address } = req.body;
      const rows = await sql`
        UPDATE orders SET
          status = COALESCE(${status}, status),
          tracking_number = COALESCE(${tracking_number}, tracking_number),
          shipping_address = COALESCE(${shipping_address}, shipping_address),
          updated_date = NOW()
        WHERE id = ${id} RETURNING *
      `;
      return res.status(200).json(rows[0]);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Orders API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
