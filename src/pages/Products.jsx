import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Minus, Plus, ChevronDown, Heart, Share2, Truck, RotateCcw, Shield } from 'lucide-react';
import { toast } from 'sonner';
import ProductVideo from '../components/product/ProductVideo';

const COLOR_MAP = {
  'Navy': '#1a2744',
  'Black': '#111111',
  'Cream': '#f5f0e8',
  'Ivory': '#f8f4ec',
  'Forest Green': '#2d4a2d',
  'Hunter Green': '#355e3b',
  'Burgundy': '#6e1c2e',
  'Wine': '#722f37',
  'Charcoal': '#36454f',
  'Midnight Blue': '#191970',
  'Deep Navy': '#0d1b3e',
};

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase">{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductDetail() {
  const productId = window.location.pathname.split('/product/')[1];
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      return await api.products.get(productId);
    },
    enabled: !!productId,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['related-products', product?.category],
    queryFn: () => api.products.filter({ category: product.category, status: 'active', limit: 4 }),
    enabled: !!product?.category,
  });

  const addToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    const cart = JSON.parse(localStorage.getItem('h2f_cart') || '[]');
    const existingIndex = cart.findIndex(
      (item) => item.product_id === productId && item.size === selectedSize && item.color === selectedColor
    );
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        product_id: productId,
        product_name: product.name,
        size: selectedSize,
        color: selectedColor || product.colors?.[0] || '',
        quantity,
        price: product.price,
        image_url: product.image_url,
      });
    }
    localStorage.setItem('h2f_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    toast.success(`${product.name} added to cart`);
  };

  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center">
        <p className="font-serif text-2xl italic">Product not found</p>
        <Link to="/shop" className="font-mono text-xs tracking-widest mt-4 text-accent">BACK TO ARCHIVE</Link>
      </div>
    );
  }

  const sizes = product.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = product.colors || [];
  const allImages = [product.image_url, product.lifestyle_image_url].filter(Boolean);

  const filtered = relatedProducts.filter(p => p.id !== productId).slice(0, 3);

  return (
    <div className="pt-20 min-h-screen">
      {/* Breadcrumb */}
      <div className="px-6 md:px-12 py-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <span className="text-muted-foreground text-xs">/</span>
          <Link to="/shop" className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors">Archive</Link>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground">{product.category?.replace('_', ' ')}</span>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-foreground">{product.name}</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row">
        {/* Left — Image Gallery */}
        <div className="w-full lg:w-[58%]">
          {/* Thumbnail strip + main image */}
          <div className="flex gap-3 px-6 md:px-12 lg:px-6">
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="hidden md:flex flex-col gap-2 w-20 shrink-0">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-20 h-24 overflow-hidden border-2 transition-all duration-200 ${
                      activeImageIndex === i ? 'border-foreground' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1">
              <motion.div
                key={activeImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="relative aspect-[3/4] overflow-hidden grain-overlay"
              >
                <img
                  src={allImages[activeImageIndex] || product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {/* Category badge */}
                <div className="absolute top-4 left-4">
                  <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/80 bg-foreground/40 backdrop-blur-sm px-3 py-1.5">
                    {product.category?.replace('_', ' ')}
                  </span>
                </div>
              </motion.div>

              {/* Mobile thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-2 md:hidden">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`w-16 h-20 overflow-hidden border-2 transition-all ${
                        activeImageIndex === i ? 'border-foreground' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — Product Info (sticky) */}
        <div className="w-full lg:w-[42%] px-6 md:px-12 py-8 lg:py-0 lg:pt-4 lg:pr-16 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {/* Collection tag */}
            {product.collection && (
              <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-accent">{product.collection}</span>
            )}

            {/* Name + price */}
            <div className="flex items-start justify-between mt-2">
              <h1 className="font-serif text-3xl md:text-4xl italic font-light tracking-tight flex-1 pr-4">
                {product.name}
              </h1>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors mt-1">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mt-3">
              <span className="font-serif text-2xl text-accent font-light">${product.price}</span>
              <span className="font-mono text-[9px] tracking-wider text-muted-foreground uppercase">Free Shipping & Returns</span>
            </div>

            <div className="hairline my-6" />

            {/* Color selection */}
            {colors.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                    Color: <span className="text-foreground">{selectedColor || colors[0]}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const hex = COLOR_MAP[color];
                    const isSelected = selectedColor === color || (!selectedColor && color === colors[0]);
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        className={`group relative w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                          isSelected ? 'border-foreground scale-110' : 'border-transparent hover:border-muted-foreground/50'
                        }`}
                        style={{ backgroundColor: hex || '#ccc' }}
                      >
                        {!hex && (
                          <span className="absolute inset-0 flex items-center justify-center font-mono text-[7px] text-white/70">{color.slice(0,2)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Color label chips for no-hex colors */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {colors.filter(c => !COLOR_MAP[c]).map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 font-mono text-[9px] tracking-wider uppercase border transition-all duration-200 ${
                        selectedColor === color ? 'border-accent text-accent' : 'border-border text-muted-foreground hover:border-foreground'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Size</span>
                <button className="font-mono text-[9px] tracking-wider text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors">
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[3rem] h-11 px-3 font-mono text-xs tracking-wider border transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-foreground text-foreground bg-foreground/5'
                        : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-6 mt-6 mb-8">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Quantity</span>
              <div className="flex items-center border border-border">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-muted transition-colors">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-5 font-mono text-sm min-w-[2.5rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-muted transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="space-y-3">
              <motion.button
                onClick={addToCart}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-foreground text-primary-foreground font-mono text-xs tracking-[0.3em] uppercase hover:bg-accent transition-colors duration-500"
              >
                Add to Cart — ${(product.price * quantity).toFixed(0)}
              </motion.button>
              <button className="w-full py-4 border border-foreground/20 text-foreground font-mono text-xs tracking-[0.3em] uppercase hover:border-accent hover:text-accent transition-colors duration-300 flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" /> Save to Wishlist
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 mt-8 py-6 border-t border-b border-border">
              {[
                { icon: Truck, label: 'Free Shipping', sub: 'On all orders' },
                { icon: RotateCcw, label: 'Free Returns', sub: 'Within 30 days' },
                { icon: Shield, label: 'Authentic', sub: 'Guaranteed' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-[8px] tracking-wider uppercase text-foreground">{label}</span>
                  <span className="font-mono text-[8px] text-muted-foreground">{sub}</span>
                </div>
              ))}
            </div>

            {/* Accordions */}
            <div className="mt-2">
              <Accordion title="Product Details" defaultOpen={true}>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {product.description || 'Crafted from premium pique cotton with meticulous attention to detail. This piece embodies the H²F philosophy of disciplined rebellion.'}
                </p>
                {product.collection && (
                  <p className="font-mono text-[9px] tracking-wider text-muted-foreground mt-3 uppercase">Collection: {product.collection}</p>
                )}
                <p className="font-mono text-[9px] tracking-wider text-muted-foreground mt-1 uppercase">SKU: H2F-{productId?.slice(0, 8).toUpperCase()}</p>
              </Accordion>

              <Accordion title="Fabric & Care">
                <div className="space-y-3">
                  <div>
                    <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground block mb-1">Composition</span>
                    <p className="font-body text-sm">{product.fabric || 'Premium Pique Cotton'}</p>
                  </div>
                  <div className="hairline" />
                  <div className="space-y-2">
                    {['Machine wash cold, gentle cycle', 'Do not bleach', 'Tumble dry low', 'Warm iron if needed', 'Do not dry clean'].map(inst => (
                      <p key={inst} className="font-body text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
                        {inst}
                      </p>
                    ))}
                  </div>
                </div>
              </Accordion>

              {product.style_guide && product.style_guide.length > 0 && (
                <Accordion title="Style Guide">
                  <div className="space-y-4">
                    {product.style_guide.map((tip, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <span className="font-mono text-[9px] text-accent mt-1 shrink-0">0{i + 1}</span>
                        <p className="font-body text-sm text-muted-foreground leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </Accordion>
              )}

              <Accordion title="Shipping & Returns">
                <div className="space-y-4 font-body text-sm text-muted-foreground">
                  <div>
                    <p className="font-mono text-[9px] tracking-wider uppercase text-foreground mb-2">Shipping</p>
                    <p>Complimentary standard shipping on all orders. Express delivery available at checkout. All orders are processed within 1–2 business days.</p>
                  </div>
                  <div className="hairline" />
                  <div>
                    <p className="font-mono text-[9px] tracking-wider uppercase text-foreground mb-2">Returns</p>
                    <p>We offer free returns within 30 days of delivery. Items must be unworn, unwashed and in their original condition with all tags attached.</p>
                  </div>
                </div>
              </Accordion>
            </div>

            {/* Share */}
            <div className="flex items-center gap-3 mt-6 pb-8">
              <span className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground">Share</span>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied'); }}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Product Video */}
      <ProductVideo product={product} />

      {/* You May Also Like */}
      {filtered.length > 0 && (
        <section className="px-6 md:px-12 py-16 border-t border-border">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl italic font-light">Complete the Look</h2>
              <Link to="/shop" className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground hover:text-accent transition-colors">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {filtered.map((related, i) => (
                <motion.div
                  key={related.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/product/${related.id}`} className="group block">
                    <div className="aspect-[3/4] overflow-hidden grain-overlay mb-4">
                      <img
                        src={related.image_url}
                        alt={related.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <h3 className="font-serif text-lg italic font-light">{related.name}</h3>
                    <p className="font-serif text-sm text-accent mt-1">${related.price}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}
    </div>
  );
}
