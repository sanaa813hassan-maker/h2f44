import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Tag, ExternalLink, LogOut } from 'lucide-react';
import AdminLogin from './AdminLogin';
import { isAdminAuthenticated, logoutAdmin } from '@/lib/adminAuth';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Products', icon: Package, path: '/admin/products' },
  { label: 'Categories', icon: Tag, path: '/admin/categories' },
  { label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
];

export default function AdminLayout() {
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(() => isAdminAuthenticated());

  useEffect(() => {
    setAuthenticated(isAdminAuthenticated());
  }, []);

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  const handleLogout = () => {
    logoutAdmin();
    setAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/8 p-6">
        <Link to="/" className="font-serif text-2xl tracking-tight mb-1">
          H<sup className="text-[#C5A059] text-xs">2</sup>F
        </Link>
        <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/30 mb-10">Admin Console</span>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-mono text-xs tracking-wider ${
                  isActive
                    ? 'bg-white/10 text-[#C5A059]'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/8 pt-4 mt-4 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/30 hover:text-white/60 font-mono text-[10px] tracking-wider transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/30 hover:text-red-400 font-mono text-[10px] tracking-wider transition-colors w-full"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-white/8 px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="font-serif text-lg">
          H<sup className="text-[#C5A059] text-[8px]">2</sup>F
          <span className="font-mono text-[9px] tracking-wider text-white/30 ml-2">Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="flex flex-col items-center gap-0.5">
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#C5A059]' : 'text-white/40'}`} />
                <span className={`font-mono text-[7px] tracking-wider ${isActive ? 'text-[#C5A059]' : 'text-white/30'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button onClick={handleLogout} className="flex flex-col items-center gap-0.5">
            <LogOut className="w-5 h-5 text-white/40 hover:text-red-400 transition-colors" />
            <span className="font-mono text-[7px] tracking-wider text-white/30">Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
