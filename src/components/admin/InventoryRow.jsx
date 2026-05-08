export default function InventoryRow({ product }) {
  const stockLevel = product.stock > 20 ? 'safe' : product.stock > 5 ? 'low' : 'critical';
  const stockColors = {
    safe: 'bg-green-500',
    low: 'bg-amber-500',
    critical: 'bg-red-500',
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${stockColors[stockLevel]}`} />
        <div>
          <p className="font-body text-sm text-white/90">{product.name}</p>
          <p className="font-mono text-[9px] tracking-wider text-white/30 uppercase">
            {product.category?.replace('_', ' ')}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className="font-serif text-sm text-[#C5A059]">${product.price}</span>
        <span className={`font-mono text-[10px] tracking-wider ${
          stockLevel === 'critical' ? 'text-red-400' : stockLevel === 'low' ? 'text-amber-400' : 'text-white/40'
        }`}>
          {product.stock ?? 0} units
        </span>
      </div>
    </div>
  );
}
