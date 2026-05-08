import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollProgress from './ScrollProgress';

export default function StoreLayout() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('h2f_cart') || '[]');
      setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    };
    updateCart();
    window.addEventListener('storage', updateCart);
    window.addEventListener('cart-updated', updateCart);
    return () => {
      window.removeEventListener('storage', updateCart);
      window.removeEventListener('cart-updated', updateCart);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <Navbar cartCount={cartCount} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
