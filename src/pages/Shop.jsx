import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/store/ProductCard';
import ShopFilters from '../components/shop/ShopFilters';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [filters, setFilters] = useState({ category: initialCategory, sortBy: 'newest', selectedSize: '', selectedColor: '' });

  const { data: products = [] } = useQuery({
    queryKey: ['shop-products'],
    queryFn: () => api.products.filter({ status: 'active' }),
    initialData: [],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories.list(),
    initialData: [],
  });

  const categoryMap = useMemo(() => Object.fromEntries(categories.map(c => [c.key, c])), [categories]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (filters.category && filters.category !== 'all') {
      result = result.filter(p => p.category === filters.category);
    }
    if (filters.selectedSize) {
      result = result.filter(p => Array.isArray(p.sizes) && p.sizes.includes(filters.selectedSize));
    }
    if (filters.selectedColor) {
      result = result.filter(p => Array.isArray(p.colors) && p.colors.includes(filters.selectedColor));
    }

    switch (filters.sortBy) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break;
      case 'price_desc': result.sort((a, b) => b.price - a.price); break;
      case 'name_az': result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name_za': result.sort((a, b) => b.name.localeCompare(a.name)); break;
      default: result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }

    return result;
  }, [products, filters]);

  return (
    <div className="pt-20 md:pt-24 pb-24 min-h-screen px-4 md:px-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <span className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground">The Archive</span>
        <h1 className="font-serif text-4xl md:text-6xl italic font-light mt-3 tracking-tight">Shop</h1>
      </motion.div>

      <div className="hairline my-6 md:my-8" />

      <ShopFilters
        products={products}
        categories={categories}
        onFilterChange={setFilters}
        currentCategory={initialCategory}
      />

      <div className="hairline my-6 md:my-8" />

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-serif text-2xl italic text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              large={i % 3 === 0}
              category={categoryMap[product.category]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
