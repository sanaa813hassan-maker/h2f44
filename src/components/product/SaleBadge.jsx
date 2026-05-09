import { useState, useEffect } from 'react';

/**
 * Returns effective price info considering:
 * 1. Product-level sale (on_sale + sale_price + optional sale_ends_at)
 * 2. Category-level sale (category.on_sale + category.sale_discount_pct)
 */
export function useEffectivePrice(product, category) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const basePrice = product?.price || 0;

  // Product-level sale
  if (product?.on_sale && product?.sale_price) {
    const expired = product.sale_ends_at && new Date(product.sale_ends_at).getTime() < now;
    if (!expired) {
      return {
        effectivePrice: product.sale_price,
        originalPrice: basePrice,
        onSale: true,
        saleEndsAt: product.sale_ends_at || null,
        discountPct: Math.round(((basePrice - product.sale_price) / basePrice) * 100),
        source: 'product',
      };
    }
  }

  // Category-level sale
  if (category?.on_sale && category?.sale_discount_pct > 0) {
    const expired = category.sale_ends_at && new Date(category.sale_ends_at).getTime() < now;
    if (!expired) {
      const discounted = basePrice * (1 - category.sale_discount_pct / 100);
      return {
        effectivePrice: Math.round(discounted * 100) / 100,
        originalPrice: basePrice,
        onSale: true,
        saleEndsAt: category.sale_ends_at || null,
        discountPct: category.sale_discount_pct,
        source: 'category',
      };
    }
  }

  return { effectivePrice: basePrice, originalPrice: null, onSale: false, saleEndsAt: null, discountPct: 0, source: null };
}

export function SaleBadge({ discountPct }) {
  if (!discountPct) return null;
  return (
    <span className="inline-block bg-red-500 text-white font-mono text-[9px] tracking-wider uppercase px-2 py-0.5">
      -{discountPct}%
    </span>
  );
}

export function SaleCountdown({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!endsAt) return;
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('SALE ENDED'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const d = Math.floor(h / 24);
      if (d > 0) setTimeLeft(`${d}d ${h % 24}h ${m}m`);
      else setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!endsAt || !timeLeft) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      <span className="font-mono text-[10px] tracking-wider text-red-500 uppercase">
        Sale ends in {timeLeft}
      </span>
    </div>
  );
}
