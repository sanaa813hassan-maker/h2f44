import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, index = 0, large = false, compact = false }) {
  const [isHovered, setIsHovered] = useState(false);

  if (compact) {
    // 2-column square card for mobile grid
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.5, delay: index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Link to={`/product/${product.id}`}>
          <div
            className="group cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Square image */}
            <div className="relative aspect-square overflow-hidden rounded-xl bg-card grain-overlay">
              <motion.img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                animate={{ scale: isHovered ? 1.06 : 1.0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
              {product.lifestyle_image_url && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <img
                    src={product.lifestyle_image_url}
                    alt={`${product.name} lifestyle`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}
              {/* Category badge */}
              <div className="absolute top-2 left-2">
                <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-white/80 bg-foreground/50 backdrop-blur-sm px-2 py-1 rounded-sm">
                  {product.category?.replace('_', ' ')}
                </span>
              </div>
            </div>
            {/* Info */}
            <div className="mt-2.5 px-0.5">
              <h3 className="font-serif text-sm font-light tracking-tight leading-tight truncate">
                {product.name}
              </h3>
              <p className="font-serif text-sm text-accent font-light mt-0.5">
                ${product.price}
              </p>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Default large card (desktop / home)
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={large ? 'col-span-1 md:col-span-7' : 'col-span-1 md:col-span-5'}
    >
      <Link to={`/product/${product.id}`}>
        <div
          className="group relative overflow-hidden bg-card cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative aspect-[3/4] overflow-hidden grain-overlay">
            <motion.img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              animate={{ scale: isHovered ? 1.05 : 1.0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
            {product.lifestyle_image_url && (
              <motion.div
                className="absolute inset-0"
                initial={{ y: '100%' }}
                animate={{ y: isHovered ? '0%' : '100%' }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <img
                  src={product.lifestyle_image_url}
                  alt={`${product.name} lifestyle`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
            <div className="absolute top-4 left-4">
              <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/80 bg-foreground/40 backdrop-blur-sm px-3 py-1.5">
                {product.category?.replace('_', ' ')}
              </span>
            </div>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-mono text-xs tracking-[0.4em] uppercase text-white bg-foreground/60 backdrop-blur-sm px-6 py-3">
                View
              </span>
            </motion.div>
          </div>
          <div className="py-5 px-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-lg md:text-xl font-light tracking-tight">
                  {product.name}
                </h3>
                <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground mt-1 uppercase">
                  {product.fabric || 'Premium Pique Cotton'}
                </p>
              </div>
              <span className="font-serif text-lg text-accent font-light">
                ${product.price}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
