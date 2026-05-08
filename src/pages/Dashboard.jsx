import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import StatCard from '../../components/admin/StatCard';
import InventoryRow from '../../components/admin/InventoryRow';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list(),
    initialData: [],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list(),
    initialData: [],
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const oldMoneyCount = products.filter(p => p.category === 'old_money').length;
  const starBoyCount = products.filter(p => p.category === 'star_boy').length;

  const oldMoneyRevenue = orders.reduce((sum, o) => {
    return sum + (o.items || []).filter(i => {
      const prod = products.find(p => p.id === i.product_id);
      return prod?.category === 'old_money';
    }).reduce((s, i) => s + (i.price * i.quantity), 0);
  }, 0);

  const starBoyRevenue = orders.reduce((sum, o) => {
    return sum + (o.items || []).filter(i => {
      const prod = products.find(p => p.id === i.product_id);
      return prod?.category === 'star_boy';
    }).reduce((s, i) => s + (i.price * i.quantity), 0);
  }, 0);

  const lowStockProducts = products
    .filter(p => (p.stock ?? 0) <= 20)
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));

  const chartData = [
    { name: 'Old Money', value: oldMoneyRevenue },
    { name: 'Star Boy', value: starBoyRevenue },
    { name: 'Essentials', value: totalRevenue - oldMoneyRevenue - starBoyRevenue },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-light text-white">Precision Command</h1>
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30 mt-1">
          Real-time overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} index={0} />
        <StatCard label="Orders" value={totalOrders} icon={ShoppingCart} index={1} />
        <StatCard label="Products" value={totalProducts} icon={Package} index={2} />
        <StatCard label="Avg. Order" value={`$${avgOrderValue.toFixed(0)}`} icon={TrendingUp} index={3} />
      </div>

      {/* Sales Narrative */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-white/8 bg-white/[0.03] backdrop-blur-md p-6"
      >
        <h3 className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 mb-3">Sales Narrative</h3>
        <p className="font-serif text-lg font-light text-white/80 italic leading-relaxed">
          {starBoyRevenue > oldMoneyRevenue
            ? `Your Star Boy collection is outperforming Old Money staples by ${oldMoneyRevenue > 0 ? Math.round(((starBoyRevenue - oldMoneyRevenue) / oldMoneyRevenue) * 100) : 100}%.`
            : oldMoneyRevenue > starBoyRevenue
            ? `Old Money collection leads with $${oldMoneyRevenue.toLocaleString()} in revenue, ${starBoyRevenue > 0 ? Math.round(((oldMoneyRevenue - starBoyRevenue) / starBoyRevenue) * 100) : 100}% ahead of Star Boy.`
            : `Both collections are performing equally. Total inventory: ${totalProducts} pieces across all categories.`
          }
          {' '}You have {totalOrders} orders totaling ${totalRevenue.toLocaleString()}.
          {lowStockProducts.length > 0 && ` Alert: ${lowStockProducts.length} product${lowStockProducts.length > 1 ? 's' : ''} running low on stock.`}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="rounded-xl border border-white/8 bg-white/[0.03] backdrop-blur-md p-6">
          <h3 className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40 mb-6">Revenue by Collection</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#ffffff40', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff30', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#fff',
                    fontFamily: 'JetBrains Mono',
                    fontSize: 11,
                  }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Bar dataKey="value" fill="#C5A059" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Matrix */}
        <div className="rounded-xl border border-white/8 bg-white/[0.03] backdrop-blur-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/40">Inventory Matrix</h3>
            <div className="flex items-center gap-4">
              {[
                { color: 'bg-green-500', label: 'Safe' },
                { color: 'bg-amber-500', label: 'Low' },
                { color: 'bg-red-500', label: 'Critical' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                  <span className="font-mono text-[8px] tracking-wider text-white/30 uppercase">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {products.length === 0 ? (
              <p className="font-mono text-xs text-white/20 text-center py-8">No products yet</p>
            ) : (
              products.map((product) => (
                <InventoryRow key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
