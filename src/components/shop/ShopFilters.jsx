import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';

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

function CustomDropdown({ label, options, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const selectedLabel = options.find(o => o.value === selected)?.label || label;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] uppercase border border-border px-4 py-2.5 hover:border-accent transition-colors duration-300 min-w-[160px] justify-between"
      >
        <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>{selectedLabel}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-1 w-full bg-card border border-border z-40 shadow-xl"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onSelect(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors hover:bg-muted ${
                  selected === opt.value ? 'text-accent bg-accent/5' : 'text-muted-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShopFilters({ products, categories = [], onFilterChange, currentCategory }) {
  const [category, setCategory] = useState(currentCategory || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    if (currentCategory && currentCategory !== category) setCategory(currentCategory);
  }, [currentCategory]);

  // Derive available sizes and colors from all products
  const allSizes = [...new Set((products || []).flatMap(p => Array.isArray(p.sizes) ? p.sizes : []))].sort();
  const allColors = [...new Set((products || []).flatMap(p => Array.isArray(p.colors) ? p.colors : []))].sort();

  // Build category tabs from dynamic categories
  const categoryTabs = [
    { value: 'all', label: 'ALL' },
    ...(categories.filter(c => c.status === 'active').map(c => ({ value: c.key, label: c.label.toUpperCase() }))),
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price ↑' },
    { value: 'price_desc', label: 'Price ↓' },
    { value: 'name_az', label: 'Name A–Z' },
    { value: 'name_za', label: 'Name Z–A' },
  ];

  const activeFilterCount = [selectedSize, selectedColor].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedSize('');
    setSelectedColor('');
  };

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({ category, sortBy, selectedSize, selectedColor });
    }
  }, [category, sortBy, selectedSize, selectedColor]);

  return (
    <div className="space-y-6">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-6">
        {categoryTabs.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`font-mono text-[10px] tracking-[0.3em] uppercase transition-all duration-300 pb-1 border-b ${
              category === cat.value
                ? 'text-foreground border-accent'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Secondary filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Size filter */}
        <div className="flex flex-wrap gap-1.5">
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground self-center mr-2">Size</span>
          {allSizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
              className={`w-10 h-10 font-mono text-[10px] tracking-wider border transition-all duration-200 ${
                selectedSize === size
                  ? 'border-accent text-accent bg-accent/5'
                  : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        <div className="w-px h-8 bg-border mx-2 hidden md:block" />

        {/* Color filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground mr-2">Color</span>
          {allColors.map((color) => {
            const hex = COLOR_MAP[color];
            const isSelected = selectedColor === color;
            return (
              <button
                key={color}
                onClick={() => setSelectedColor(selectedColor === color ? '' : color)}
                title={color}
                className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                  isSelected ? 'border-foreground scale-110' : 'border-transparent hover:border-muted-foreground/50'
                }`}
                style={{ backgroundColor: hex || '#aaa' }}
              />
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Clear & Sort */}
        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 font-mono text-[9px] tracking-wider uppercase text-muted-foreground hover:text-accent transition-colors"
            >
              <X className="w-3 h-3" />
              Clear ({activeFilterCount})
            </button>
          )}
          <CustomDropdown
            label="Sort By"
            options={sortOptions}
            selected={sortBy}
            onSelect={setSortBy}
          />
        </div>
      </div>
    </div>
  );
}
