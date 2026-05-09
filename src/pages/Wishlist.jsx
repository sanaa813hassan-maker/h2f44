import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, X, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { getWishlist, toggleWishlist } from '@/lib/wishlist';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    setWishlist(getWishlist());
    const handler = () => setWishlist(getWishlist());
    window.addEventListener('wishlist-updated', handler);
    return () => window.removeEventListener('wishlist-updated', handler);
  }, []);

  const removeItem = (product) => {
    toggleWishlist(product);
    toast.success('Removed from wishlist');
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('h2f_cart') || '[]');
    const existing = cart.findIndex(i => i.product_id === product.id);
    if (existing > -1) {
      cart[existing].quantity += 1;
    } else {
      cart.push({
        product_id: product.id,
        product_name: product.name,
        size: 'M',
        color: '',
        quantity: 1,
        price: product.price,
        image_url: product.image_url,
      });
    }
    localStorage.setItem('h2f_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="pt-24 pb-24 min-h-screen px-4 md:px-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground">Saved Items</span>
        <h1 className="font-serif text-4xl md:text-6xl italic font-light mt-3 tracking-tight">Wishlist</h1>
      </motion.div>

      <div className="hairline my-8" />

      {wishlist.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-serif text-2xl italic text-muted-foreground">Your wishlist is empty</p>
          <Link to="/shop" className="inline-block mt-6 font-mono text-xs tracking-[0.3em] uppercase text-accent border-b border-accent pb-1">
            Browse the Archive
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {wishlist.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group relative"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="relative aspect-[3/4] overflow-hidden grain-overlay">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </Link>

                {/* Remove button */}
                <button
                  onClick={() => removeItem(product)}
                  className="absolute top-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-white transition-colors rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="mt-3 space-y-1 px-0.5">
                  <h3 className="font-serif text-base italic font-light truncate">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm text-accent">${product.price}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="flex items-center gap-1.5 font-mono text-[9px] tracking-wider uppercase text-muted-foreground hover:text-accent transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
