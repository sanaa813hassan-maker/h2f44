/* eslint-disable no-undef */
import { put } from '@vercel/blob';
import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const form = new IncomingForm({ keepExtensions: true });
    const [, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file?.[0] || files.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const fileBuffer = fs.readFileSync(file.filepath);
    const blob = await put(file.originalFilename || 'upload', fileBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return res.status(200).json({ file_url: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}
