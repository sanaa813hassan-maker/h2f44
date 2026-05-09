import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Minus, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('h2f_cart') || '[]'));
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('h2f_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
    updateCart(newCart);
  };

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    updateCart(newCart);
    toast.success('Item removed');
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="pt-20 md:pt-24 pb-24 min-h-screen px-4 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground">
          Your Selection
        </span>
        <h1 className="font-serif text-4xl md:text-6xl italic font-light mt-3 tracking-tight">
          Cart
        </h1>
      </motion.div>

      <div className="hairline my-6 md:my-8" />

      {cart.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24"
        >
          <p className="font-serif text-2xl italic text-muted-foreground">
            Your cart is empty
          </p>
          <Link
            to="/shop"
            className="inline-block mt-6 font-mono text-xs tracking-[0.3em] uppercase text-accent border-b border-accent pb-1"
          >
            Browse the Archive
          </Link>
        </motion.div>
      ) : (
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 lg:gap-16">
          {/* Items */}
          <div className="lg:col-span-2 space-y-0">
            <AnimatePresence>
              {cart.map((item, index) => (
                <motion.div
                  key={`${item.product_id}-${item.size}-${item.color}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className="border-b border-border py-5 md:py-8 flex gap-4 md:gap-6"
                >
                  {item.image_url && (
                    <Link to={`/product/${item.product_id}`} className="shrink-0">
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-20 h-28 md:w-32 md:h-40 object-cover"
                      />
                    </Link>
                  )}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-serif text-base md:text-lg font-light leading-tight truncate">{item.product_name}</h3>
                          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground mt-1">
                            {item.size}{item.color ? ` · ${item.color}` : ''}
                          </p>
                        </div>
                        <button onClick={() => removeItem(index)} className="p-1 hover:text-accent transition-colors shrink-0">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 md:mt-4">
                      <div className="flex items-center border border-border">
                        <button onClick={() => updateQuantity(index, -1)} className="p-2 hover:bg-muted transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 md:px-4 font-mono text-xs">{item.quantity}</span>
                        <button onClick={() => updateQuantity(index, 1)} className="p-2 hover:bg-muted transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-serif text-base md:text-lg text-accent">${(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-card border border-border p-6 md:p-8">
              <h3 className="font-mono text-[10px] tracking-[0.3em] uppercase mb-6 md:mb-8">Order Summary</h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="font-body text-muted-foreground">Subtotal</span>
                  <span className="font-serif">${total.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-muted-foreground">Shipping</span>
                  <span className="font-mono text-[10px] tracking-wider uppercase text-accent">Complimentary</span>
                </div>
              </div>

              <div className="hairline my-6" />

              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Total</span>
                <span className="font-serif text-2xl text-accent">${total.toFixed(0)}</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 md:mt-8 py-4 bg-foreground text-primary-foreground font-mono text-xs tracking-[0.3em] uppercase hover:bg-accent transition-colors duration-500"
                onClick={() => toast.success('Checkout coming soon')}
              >
                Proceed to Checkout
              </motion.button>

              <Link
                to="/shop"
                className="block text-center mt-4 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-accent transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
