import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function HeroSection({ heroImage }) {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
      setMousePos({ x, y });
    };
    const el = containerRef.current;
    if (el) el.addEventListener('mousemove', handleMouseMove);
    return () => { if (el) el.removeEventListener('mousemove', handleMouseMove); };
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden">
      {/* Split layout */}
      <div className="h-full flex flex-col md:flex-row">
        {/* Left - Image */}
        <motion.div 
          className="relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        >
          <motion.img
            src={heroImage}
            alt="H²F Luxury Polo"
            className="w-full h-full object-cover"
            initial={{ scale: 1.15 }}
            animate={{ scale: 1.0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/20" />
        </motion.div>

        {/* Right - Brand */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full flex flex-col items-center justify-center px-8">
          <motion.div
            style={{
              transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
            }}
            className="transition-transform duration-700 ease-out"
          >
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <Logo size="xl" className="text-foreground" />
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="font-mono text-[10px] md:text-xs tracking-[0.35em] text-muted-foreground mt-8 text-center uppercase"
          >
            Disciplined Rebellion · Effortless Affluence
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="mt-12"
          >
            <Link
              to="/shop"
              className="group relative font-mono text-xs tracking-[0.3em] uppercase px-10 py-4 border border-foreground/20 hover:border-accent hover:text-accent transition-all duration-500"
            >
              <span>Enter the Archive</span>
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent group-hover:w-full transition-all duration-500" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <span className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground uppercase mb-3">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="w-[1px] h-8 bg-accent/50"
        />
      </motion.div>
    </section>
  );
}
