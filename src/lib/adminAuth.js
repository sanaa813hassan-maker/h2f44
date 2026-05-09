const SALT = 'h2f_salt_x9k2025';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function getCorrectHash() {
  return await hashPassword('H2F@Admin2025!');
}

export function isAdminAuthenticated() {
  try {
    const raw = sessionStorage.getItem('h2f_admin_auth');
    if (!raw) return false;
    const { expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      sessionStorage.removeItem('h2f_admin_auth');
      return false;
    }
    // Session exists and not expired
    return true;
  } catch {
    return false;
  }
}

export function logoutAdmin() {
  sessionStorage.removeItem('h2f_admin_auth');
}
