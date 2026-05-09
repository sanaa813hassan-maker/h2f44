import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, Sun, Moon, Heart } from 'lucide-react';
import Logo from './Logo';
import { useTheme } from '@/lib/ThemeContext';
import { getWishlist } from '@/lib/wishlist';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';

export default function Navbar({ cartCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const [wishlistCount, setWishlistCount] = useState(getWishlist().length);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
    initialData: [],
    staleTime: 60000,
  });

  const navLinks = [
    { label: 'ARCHIVE', path: '/shop' },
    ...categories.filter(c => c.status === 'active').slice(0, 3).map(c => ({
      label: c.label.toUpperCase(),
      path: `/shop?category=${c.key}`,
    })),
    { label: 'ABOUT', path: '/about' },
  ];

  useEffect(() => {
    const handler = () => setWishlistCount(getWishlist().length);
    window.addEventListener('wishlist-updated', handler);
    return () => window.removeEventListener('wishlist-updated', handler);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="hairline" />
        <div className="flex items-center justify-between px-6 md:px-12 py-4">
          <Link to="/" className="z-50">
            <Logo size="sm" />
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="font-mono text-xs tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 z-50">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-1.5 text-muted-foreground hover:text-accent transition-colors duration-300"
              title={theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            {/* Wishlist */}
            <Link to="/wishlist" className="relative group p-1">
              <Heart className="w-5 h-5 text-foreground group-hover:text-accent transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[9px] font-mono flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
            {/* Cart */}
            <Link to="/cart" className="relative group p-1">
              <ShoppingBag className="w-5 h-5 text-foreground group-hover:text-accent transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[9px] font-mono flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="hairline" />
      </nav>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <div className="flex flex-col items-center gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Link
                    to={link.path}
                    onClick={() => setMenuOpen(false)}
                    className="font-serif text-4xl italic tracking-tight text-foreground hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
