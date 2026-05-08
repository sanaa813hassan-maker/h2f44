// Frontend base44 client — imported by React components via @/api/base44Client
// This file lives in src/api/ so the @/ alias resolves correctly during Vite builds.
// The root /api/ folder is kept separately for Vercel Serverless Functions.

// ─── Auth stub ────────────────────────────────────────────────────────────────
// The original base44 SDK is a cloud-platform dependency that is no longer
// required now that the backend runs on Vercel + NeonDB.
// These thin replacements keep existing component imports working without
// pulling in the @base44/sdk package.  Replace the bodies with real auth
// logic (e.g. a JWT / session cookie check against /api/auth) as needed.

export const base44 = {
  auth: {
    /**
     * Returns the currently authenticated user, or throws if unauthenticated.
     * Replace this implementation with a real call to your auth endpoint.
     * e.g.  return request('GET', '/api/auth/me');
     */
    me: async () => {
      // TODO: implement real auth check, e.g.:
      // const res = await fetch('/api/auth/me');
      // if (!res.ok) throw new Error('Unauthenticated');
      // return res.json();
      throw new Error('Not authenticated');
    },
  },
};
