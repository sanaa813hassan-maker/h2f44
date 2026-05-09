import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { toggleWishlist, isInWishlist } from '@/lib/wishlist';
import ProductVideo from '../components/product/ProductVideo';

export default function ProductDetail() {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [wishlisted, setWishlisted] = useState(() => isInWishlist(id));

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.products.get(id),
    enabled: !!id,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
    initialData: [],
  });

  if (isLoading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl italic text-muted-foreground">Product not found</p>
          <Link to="/shop" className="mt-4 inline-block font-mono text-xs tracking-wider uppercase text-accent border-b border-accent pb-1">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const category = categories.find(c => c.key === product.category);

  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const colors = Array.isArray(product.colors) ? product.colors : [];

  const mainImage = (selectedColor && product.color_images?.[selectedColor]) || product.image_url;

  const isSizeOutOfStock = (size) => {
    if (product.size_stock && Object.keys(product.size_stock).length > 0) {
      return (product.size_stock[size] ?? 1) === 0;
    }
    return false;
  };

  const addToCart = () => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    const cart = JSON.parse(localStorage.getItem('h2f_cart') || '[]');
    const key = `${product.id}-${selectedSize}-${selectedColor}`;
    const existing = cart.find(i => `${i.product_id}-${i.size}-${i.color}` === key);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        product_id: product.id,
        product_name: product.name,
        size: selectedSize,
        color: selectedColor,
        price: product.sale_price && product.on_sale ? product.sale_price : product.price,
        image_url: mainImage,
        quantity: 1,
      });
    }
    localStorage.setItem('h2f_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    toast.success('Added to cart');
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    setWishlisted(!wishlisted);
  };

  return (
    <div className="pt-20 md:pt-24 pb-24 min-h-screen px-4 md:px-12">
      <Link to="/shop" className="inline-flex items-center gap-2 font-mono text-[10px] tracking-wider uppercase text-muted-foreground hover:text-accent transition-colors mb-8">
        <ArrowLeft className="w-3 h-3" /> Back to Archive
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        {/* Image */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          {mainImage ? (
            <img src={mainImage} alt={product.name} className="w-full aspect-[3/4] object-cover" />
          ) : (
            <div className="w-full aspect-[3/4] bg-muted" />
          )}
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-6">
          {category && (
            <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground">{category.label}</span>
          )}
          <h1 className="font-serif text-3xl md:text-5xl italic font-light tracking-tight">{product.name}</h1>

          <div className="flex items-center gap-4">
            {product.on_sale && product.sale_price ? (
              <>
                <span className="font-serif text-2xl text-accent">${product.sale_price}</span>
                <span className="font-serif text-lg text-muted-foreground line-through">${product.price}</span>
                <span className="font-mono text-[9px] tracking-wider uppercase bg-accent/10 text-accent px-2 py-1">
                  {Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF
                </span>
              </>
            ) : (
              <span className="font-serif text-2xl text-accent">${product.price}</span>
            )}
          </div>

          {product.description && (
            <p className="font-body text-muted-foreground leading-relaxed">{product.description}</p>
          )}

          <div className="hairline" />

          {/* Colors */}
          {colors.length > 0 && (
            <div>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground block mb-3">
                Color{selectedColor ? `: ${selectedColor}` : ''}
              </span>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                    className={`px-4 py-2 font-mono text-[10px] tracking-wider border transition-all ${
                      selectedColor === color ? 'border-accent text-accent bg-accent/5' : 'border-border text-muted-foreground hover:border-foreground'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground block mb-3">Size</span>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => {
                  const oos = isSizeOutOfStock(size);
                  return (
                    <button
                      key={size}
                      onClick={() => !oos && setSelectedSize(selectedSize === size ? '' : size)}
                      disabled={oos}
                      className={`w-12 h-12 font-mono text-[10px] tracking-wider border transition-all ${
                        oos ? 'border-border text-muted-foreground/30 line-through cursor-not-allowed' :
                        selectedSize === size ? 'border-accent text-accent bg-accent/5' : 'border-border text-muted-foreground hover:border-foreground'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={addToCart}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-foreground text-primary-foreground font-mono text-xs tracking-[0.3em] uppercase hover:bg-accent transition-colors duration-500"
            >
              <ShoppingBag className="w-4 h-4" /> Add to Bag
            </motion.button>
            <button
              onClick={handleWishlist}
              className={`w-14 h-14 border flex items-center justify-center transition-colors ${
                wishlisted ? 'border-accent text-accent' : 'border-border text-muted-foreground hover:border-accent hover:text-accent'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-accent' : ''}`} />
            </button>
          </div>

          {/* Fabric */}
          {product.fabric && (
            <>
              <div className="hairline" />
              <div>
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground block mb-2">Fabric</span>
                <p className="font-body text-sm text-foreground">{product.fabric}</p>
              </div>
            </>
          )}

          {/* Style guide */}
          {Array.isArray(product.style_guide) && product.style_guide.length > 0 && (
            <>
              <div className="hairline" />
              <div>
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground block mb-3">Style Guide</span>
                <ul className="space-y-1">
                  {product.style_guide.map((tip, i) => (
                    <li key={i} className="font-body text-sm text-muted-foreground flex gap-2">
                      <span className="text-accent">—</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </motion.div>
      </div>
      {/* Full-width video section below */}
      <ProductVideo product={product} />
    </div>
  );
}
