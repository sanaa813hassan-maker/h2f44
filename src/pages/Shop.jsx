import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../components/store/ProductCard';
import ShopFilters from '../components/shop/ShopFilters';

export default function Shop() {
  const [filters, setFilters] = useState({
    category: 'all',
    sortBy: 'newest',
    selectedSize: '',
    selectedColor: '',
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ status: 'active' }),
    initialData: [],
  });

  const filtered = useMemo(() => {
    let result = (!filters.category || filters.category === 'all')
      ? products
      : products.filter(p => p.category === filters.category);

    if (filters.selectedSize) {
      result = result.filter(p => (p.sizes || []).includes(filters.selectedSize));
    }
    if (filters.selectedColor) {
      result = result.filter(p => (p.colors || []).includes(filters.selectedColor));
    }
    if (filters.sortBy === 'name_az') result = [...result].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    if (filters.sortBy === 'name_za') result = [...result].sort((a, b) => (b.name || '').localeCompare(a.name || ''));

    return result;
  }, [products, filters]);

  return (
    <div className="pt-24 pb-24 min-h-screen">
      {/* Header */}
      <div className="px-6 md:px-12 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground">
            The Collection
          </span>
          <h1 className="font-serif text-5xl md:text-7xl italic font-light mt-3 tracking-tight">
            The Archive
          </h1>
        </motion.div>

        <div className="hairline my-8" />

        <ShopFilters products={products} onFilterChange={setFilters} />
      </div>

      {/* Results count */}
      <div className="px-6 md:px-12 mb-6">
        <p className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'} found
        </p>
      </div>

      {/* Product Grid */}
      <div className="px-6 md:px-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className={`${i % 3 === 0 ? 'md:col-span-7' : 'md:col-span-5'}`}>
                <div className="aspect-[3/4] bg-muted animate-pulse" />
                <div className="h-4 bg-muted animate-pulse mt-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-serif text-2xl italic text-muted-foreground">
              No pieces match your selection
            </p>
            <p className="font-mono text-[10px] tracking-wider text-muted-foreground/60 mt-3">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: 2-col compact grid | Desktop: editorial 12-col grid */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} compact />
              ))}
            </div>
            <div className="hidden md:grid md:grid-cols-12 gap-6 md:gap-8">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} large={i % 3 === 0} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
