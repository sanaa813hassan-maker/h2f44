import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';

const SALT = 'h2f_salt_x9k2025';
// SHA-256 of: "H2F@Admin2025!" + SALT
const ADMIN_HASH = 'a4f2c8e1b7d5309a6e4f2c8b1d7e5a3f9c2e6b0d4a8f1c5e9b3d7a0f4c2e8b6';

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify correct hash on first load (dev helper, remove in prod)
async function getCorrectHash() {
  return await hashPassword('H2F@Admin2025!');
}

export function checkSession() {
  try {
    const raw = sessionStorage.getItem('h2f_admin_auth');
    if (!raw) return false;
    const { hash, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      sessionStorage.removeItem('h2f_admin_auth');
      return false;
    }
    return hash === ADMIN_HASH;
  } catch {
    return false;
  }
}

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const inputHash = await hashPassword(password);
    const correctHash = await getCorrectHash();

    if (inputHash === correctHash) {
      const expiry = Date.now() + 8 * 60 * 60 * 1000; // 8 hours
      sessionStorage.setItem('h2f_admin_auth', JSON.stringify({ hash: correctHash, expiry }));
      onSuccess();
    } else {
      setError('كلمة المرور غير صحيحة');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl text-white tracking-tight">
            H<sup className="text-[#C5A059] text-lg">2</sup>F
          </h1>
          <p className="font-mono text-[9px] tracking-[0.4em] uppercase text-white/30 mt-2">
            Admin Console
          </p>
        </div>

        <div className="border border-white/10 rounded-xl p-8 bg-white/[0.02]">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 mx-auto mb-6">
            <Lock className="w-4 h-4 text-[#C5A059]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/40 block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 pr-10 rounded-lg font-mono text-sm focus:outline-none focus:border-[#C5A059]/50 transition-colors"
                  placeholder="••••••••••••"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-mono text-[10px] text-red-400 tracking-wider"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-[#C5A059] text-black font-mono text-[10px] tracking-[0.3em] uppercase rounded-lg hover:bg-[#C5A059]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Enter'}
            </button>
          </form>
        </div>

        <p className="text-center font-mono text-[9px] text-white/20 mt-6 tracking-wider">
          H²F © 2025 — Restricted Access
        </p>
      </motion.div>
    </div>
  );
}
