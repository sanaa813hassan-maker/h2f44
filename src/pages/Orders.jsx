import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order updated');
    },
  });

  const filtered = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);

  const statusColors = {
    pending: 'text-amber-400',
    confirmed: 'text-blue-400',
    shipped: 'text-purple-400',
    delivered: 'text-green-400',
    cancelled: 'text-red-400',
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light text-white">Orders</h1>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30 mt-1">
            {orders.length} total orders
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white font-mono text-[10px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders table */}
      <div className="rounded-xl border border-white/8 bg-white/[0.03] backdrop-blur-md overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/8">
          <span className="col-span-3 font-mono text-[8px] tracking-wider text-white/30 uppercase">Customer</span>
          <span className="col-span-2 font-mono text-[8px] tracking-wider text-white/30 uppercase">Date</span>
          <span className="col-span-2 font-mono text-[8px] tracking-wider text-white/30 uppercase">Items</span>
          <span className="col-span-2 font-mono text-[8px] tracking-wider text-white/30 uppercase">Total</span>
          <span className="col-span-2 font-mono text-[8px] tracking-wider text-white/30 uppercase">Status</span>
          <span className="col-span-1 font-mono text-[8px] tracking-wider text-white/30 uppercase text-right">View</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center"><p className="font-mono text-xs text-white/20">No orders found</p></div>
        ) : (
          filtered.map((order) => (
            <div key={order.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <div className="col-span-3">
                <p className="font-body text-sm text-white/90">{order.customer_name || order.customer_email}</p>
                <p className="font-mono text-[9px] text-white/30">{order.customer_email}</p>
              </div>
              <div className="col-span-2">
                <span className="font-mono text-[10px] text-white/40">
                  {order.created_date ? format(new Date(order.created_date), 'MMM d, yyyy') : '—'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="font-mono text-[10px] text-white/40">{order.items?.length || 0} items</span>
              </div>
              <div className="col-span-2">
                <span className="font-serif text-sm text-[#C5A059]">${order.total?.toFixed(0) || 0}</span>
              </div>
              <div className="col-span-2">
                <span className={`font-mono text-[9px] tracking-wider uppercase ${statusColors[order.status] || 'text-white/30'}`}>
                  {order.status || 'pending'}
                </span>
              </div>
              <div className="col-span-1 flex justify-end">
                <button onClick={() => setSelectedOrder(order)} className="p-2 text-white/30 hover:text-white transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-mono text-xs tracking-wider uppercase text-white/60">Order Details</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-white/30 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[9px] tracking-wider text-white/30 uppercase">Customer</span>
                  <p className="text-white text-sm mt-1">{selectedOrder.customer_name || '—'}</p>
                  <p className="text-white/50 text-xs">{selectedOrder.customer_email}</p>
                </div>

                <div>
                  <span className="font-mono text-[9px] tracking-wider text-white/30 uppercase">Shipping Address</span>
                  <p className="text-white/70 text-sm mt-1">{selectedOrder.shipping_address || '—'}</p>
                </div>

                <div>
                  <span className="font-mono text-[9px] tracking-wider text-white/30 uppercase">Items</span>
                  <div className="mt-2 space-y-2">
                    {(selectedOrder.items || []).map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                        <div>
                          <p className="text-white text-sm">{item.product_name}</p>
                          <p className="text-white/30 font-mono text-[9px]">{item.size} · Qty: {item.quantity}</p>
                        </div>
                        <span className="text-[#C5A059] font-serif">${(item.price * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="font-mono text-[10px] tracking-wider text-white/40 uppercase">Total</span>
                  <span className="font-serif text-xl text-[#C5A059]">${selectedOrder.total?.toFixed(0)}</span>
                </div>

                <div className="pt-4 space-y-3">
                  <div>
                    <span className="font-mono text-[9px] tracking-wider text-white/30 uppercase block mb-1">Update Status</span>
                    <Select
                      value={selectedOrder.status || 'pending'}
                      onValueChange={(v) => {
                        updateMutation.mutate({ id: selectedOrder.id, data: { status: v } });
                        setSelectedOrder({ ...selectedOrder, status: v });
                      }}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] tracking-wider text-white/30 uppercase block mb-1">Tracking Number</span>
                    <div className="flex gap-2">
                      <Input
                        value={selectedOrder.tracking_number || ''}
                        onChange={(e) => setSelectedOrder({ ...selectedOrder, tracking_number: e.target.value })}
                        className="bg-white/5 border-white/10 text-white flex-1"
                        placeholder="Enter tracking number"
                      />
                      <button
                        onClick={() => updateMutation.mutate({ id: selectedOrder.id, data: { tracking_number: selectedOrder.tracking_number } })}
                        className="px-4 bg-[#C5A059] text-black font-mono text-[10px] uppercase rounded hover:bg-[#C5A059]/80 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
