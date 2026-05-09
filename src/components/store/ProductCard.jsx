import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useState, useRef } from 'react';
import { toggleWishlist, isInWishlist } from '@/lib/wishlist';

export default function ProductCard({ product, index = 0, large = false, category, forceFullWidth = false }) {
  const [wishlisted, setWishlisted] = useState(() => isInWishlist(product.id));
  const [hovered, setHovered] = useState(false);
  // Mobile swipe state
  const [touchStartX, setTouchStartX] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const videoRef = useRef(null);

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
    setWishlisted(!wishlisted);
  };

  // Build media array: primary image, then lifestyle/video/extra images
  const mediaItems = [];
  if (product.image_url) mediaItems.push({ type: 'image', src: product.image_url });
  if (product.video_url) mediaItems.push({ type: 'video', src: product.video_url });
  else if (product.lifestyle_image_url) mediaItems.push({ type: 'image', src: product.lifestyle_image_url });
  (product.extra_images || []).forEach(url => mediaItems.push({ type: 'image', src: url }));

  const effectivePrice = product.on_sale && product.sale_price ? product.sale_price : product.price;
  const isOnSale = product.on_sale && product.sale_price;

  // Desktop: show second media on hover
  const displayMedia = hovered && mediaItems.length > 1 ? mediaItems[1] : mediaItems[0];

  // Mobile swipe handlers
  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStartX === null || mediaItems.length <= 1) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      setSlideIndex(prev =>
        diff > 0
          ? Math.min(prev + 1, mediaItems.length - 1)
          : Math.max(prev - 1, 0)
      );
    }
    setTouchStartX(null);
  };

  // On mobile we always show slideIndex, on desktop we use hovered logic
  const mobileMedia = mediaItems[slideIndex] || mediaItems[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className={forceFullWidth ? '' : large ? 'md:col-span-8' : 'md:col-span-4'}
    >
      <Link to={`/product/${product.id}`} className="group block relative">
        {/* Image / Video container */}
        <div
          className="relative overflow-hidden grain-overlay aspect-[3/4]"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Desktop: primary or hover media */}
          <div className="hidden md:block w-full h-full">
            {displayMedia?.type === 'video' ? (
              <>
                <video
                  ref={videoRef}
                  src={displayMedia.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* "View Product" overlay on video hover */}
                <div className="absolute inset-0 flex items-end justify-center pb-8 bg-gradient-to-t from-black/50 via-transparent to-transparent">
                  <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-white bg-black/40 backdrop-blur-sm px-4 py-2 border border-white/20">
                    View Product <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </>
            ) : displayMedia?.src ? (
              <img
                src={displayMedia.src}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </div>

          {/* Mobile: swipeable slides */}
          <div className="md:hidden w-full h-full">
            {mobileMedia?.type === 'video' ? (
              <video
                src={mobileMedia.src}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            ) : mobileMedia?.src ? (
              <img
                src={mobileMedia.src}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
            {/* Dot indicators for mobile */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 pointer-events-none">
                {mediaItems.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === slideIndex ? 'bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
            )}
          </div>

          {/* Sale badge */}
          {isOnSale && (
            <div className="absolute top-3 left-3 bg-accent text-accent-foreground font-mono text-[9px] tracking-wider uppercase px-2 py-1">
              {Math.round(((product.price - product.sale_price) / product.price) * 100)}% OFF
            </div>
          )}

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all duration-300 ${
              wishlisted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-accent text-accent' : 'text-white drop-shadow'}`} />
          </button>
        </div>

        {/* Info */}
        <div className="mt-4 space-y-1">
          {category && (
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
              {category.label}
            </span>
          )}
          <h3 className="font-serif text-lg font-light leading-tight group-hover:text-accent transition-colors duration-300">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-serif text-base text-accent">${effectivePrice}</span>
            {isOnSale && (
              <span className="font-serif text-sm text-muted-foreground line-through">${product.price}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
