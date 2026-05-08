// API client that replaces base44 SDK - connects to Vercel serverless functions → NeonDB

const BASE = '';

async function request(method, path, body, params) {
  let url = path;
  if (params) {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));
    if (qs.toString()) url += '?' + qs.toString();
  }
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  products: {
    list: () => request('GET', '/api/products'),
    filter: (filters = {}) => request('GET', '/api/products', null, filters),
    get: (id) => request('GET', '/api/products', null, { id }),
    create: (data) => request('POST', '/api/products', data),
    update: (id, data) => request('PUT', `/api/products?id=${id}`, data),
    delete: (id) => request('DELETE', `/api/products?id=${id}`),
  },
  orders: {
    list: () => request('GET', '/api/orders'),
    create: (data) => request('POST', '/api/orders', data),
    update: (id, data) => request('PUT', `/api/orders?id=${id}`, data),
  },
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error(await res.text());
    return res.json(); // { file_url }
  },
};
