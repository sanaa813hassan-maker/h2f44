import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import HeroSection from '../components/store/HeroSection';
import ProductCard from '../components/store/ProductCard';

const HERO_IMAGE = 'https://media.base44.com/images/public/69fdc9d7ee19d2366aeb5b5b/8dd7cad6d_generated_c1a4bb5f.png';

export default function Home() {
  const { data: products = [] } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.products.filter({ status: 'active', limit: 6 }),
    initialData: [],
  });

  return (
    <div>
      <HeroSection heroImage={HERO_IMAGE} />

      {/* Section divider */}
      <div className="px-6 md:px-12 py-20">
        <div className="hairline" />
      </div>

      {/* Collection Intro */}
      <section className="px-6 md:px-12 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground">
            Current Archive
          </span>
          <h2 className="font-serif text-4xl md:text-6xl lg:text-7xl italic font-light mt-4 tracking-tight leading-[0.95]">
            Where Heritage<br />
            <span className="text-accent">Meets Velocity</span>
          </h2>
          <p className="font-body text-base text-muted-foreground mt-6 max-w-lg leading-relaxed">
            Each piece in our archive is crafted at the intersection of old-world tailoring 
            and modern-day ambition. This is not fast fashion — this is lasting statement.
          </p>
        </motion.div>
      </section>

      {/* Staggered Product Grid */}
      <section className="px-6 md:px-12 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              large={i % 3 === 0}
            />
          ))}
        </div>

        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-16 text-center"
          >
            <Link
              to="/shop"
              className="group inline-flex items-center font-mono text-xs tracking-[0.3em] uppercase text-foreground hover:text-accent transition-colors duration-300"
            >
              <span>View Full Archive</span>
              <motion.span
                className="ml-3 inline-block"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        )}
      </section>

      {/* Brand Statement */}
      <section className="px-6 md:px-12 py-24 md:py-36 bg-foreground text-primary-foreground">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="font-serif text-3xl md:text-5xl lg:text-6xl italic font-light leading-tight tracking-tight"
          >
            "We don't follow trends.<br />
            We set the <span className="text-accent">standard</span>."
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-10"
          >
            <Link
              to="/about"
              className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary-foreground/60 hover:text-accent transition-colors border-b border-primary-foreground/20 pb-1"
            >
              Our Story
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
