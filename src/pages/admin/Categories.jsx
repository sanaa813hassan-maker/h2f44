import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, Tag, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const empty = {
  key: '', label: '', description: '', cover_image_url: '',
  on_sale: false, sale_discount_pct: 0, sale_ends_at: '', sort_order: 0, status: 'active',
};

function toKey(label) {
  return label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

export default function Categories() {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.categories.list(),
    initialData: [],
  });

  const createMut = useMutation({
    mutationFn: (data) => api.categories.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); setEditing(null); toast.success('Category created'); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => api.categories.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); setEditing(null); toast.success('Category updated'); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => api.categories.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); toast.success('Category deleted'); },
  });

  const handleNew = () => { setForm(empty); setEditing('new'); };
  const handleEdit = (cat) => { setForm({ ...empty, ...cat, sale_ends_at: cat.sale_ends_at ? cat.sale_ends_at.slice(0, 16) : '' }); setEditing(cat.id); };

  const handleSave = () => {
    const data = {
      ...form,
      sale_discount_pct: Number(form.sale_discount_pct) || 0,
      sort_order: Number(form.sort_order) || 0,
      sale_ends_at: form.sale_ends_at ? new Date(form.sale_ends_at).toISOString() : null,
    };
    if (editing === 'new') createMut.mutate(data);
    else updateMut.mutate({ id: editing, data });
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-white">Categories</h1>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30 mt-1">{categories.length} categories</p>
        </div>
        <button onClick={handleNew} className="flex items-center gap-2 px-5 py-2.5 bg-[#C5A059] text-black font-mono text-[10px] tracking-wider uppercase rounded-lg hover:bg-[#C5A059]/80 transition-colors">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Editor */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="rounded-xl border border-white/8 bg-white/[0.03] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs tracking-wider text-white/60 uppercase">{editing === 'new' ? 'New Category' : 'Edit Category'}</h3>
              <button onClick={() => setEditing(null)} className="text-white/30 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Label (display name)</label>
                <Input value={form.label}
                  onChange={(e) => { set('label', e.target.value); if (editing === 'new') set('key', toKey(e.target.value)); }}
                  className="bg-white/5 border-white/10 text-white" placeholder="Old Money" />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Key (URL-safe, auto-filled)</label>
                <Input value={form.key} onChange={(e) => set('key', e.target.value)}
                  className="bg-white/5 border-white/10 text-white" placeholder="old_money" />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Sort Order</label>
                <Input type="number" value={form.sort_order} onChange={(e) => set('sort_order', e.target.value)}
                  className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Status</label>
                <Select value={form.status} onValueChange={(v) => set('status', v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Description</label>
              <Textarea value={form.description} onChange={(e) => set('description', e.target.value)}
                className="bg-white/5 border-white/10 text-white h-16" />
            </div>

            {/* Sale section */}
            <div className="border border-white/10 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="w-3.5 h-3.5 text-[#C5A059]" />
                <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#C5A059]">Category Sale</span>
              </div>
              <p className="font-mono text-[9px] text-white/30">Applying a category sale automatically discounts ALL active products in this category.</p>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.on_sale} onChange={(e) => set('on_sale', e.target.checked)}
                    className="w-4 h-4 accent-[#C5A059]" />
                  <span className="font-mono text-[10px] tracking-wider text-white/60 uppercase">Enable Sale</span>
                </label>
              </div>

              {form.on_sale && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Discount %</label>
                    <Input type="number" value={form.sale_discount_pct} onChange={(e) => set('sale_discount_pct', e.target.value)}
                      className="bg-white/5 border-white/10 text-white" placeholder="20" min="1" max="99" />
                  </div>
                  <div>
                    <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Sale Ends At (optional)
                    </label>
                    <Input type="datetime-local" value={form.sale_ends_at} onChange={(e) => set('sale_ends_at', e.target.value)}
                      className="bg-white/5 border-white/10 text-white" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-[#C5A059] text-black font-mono text-[10px] tracking-wider uppercase rounded-lg hover:bg-[#C5A059]/80 transition-colors">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
              <button onClick={() => setEditing(null)} className="px-6 py-2.5 border border-white/10 text-white/50 font-mono text-[10px] tracking-wider uppercase rounded-lg hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      <div className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/8">
          {['Label', 'Key', 'Sale', 'Discount', 'Status', 'Actions'].map(h => (
            <span key={h} className={`font-mono text-[8px] tracking-wider text-white/30 uppercase ${h === 'Actions' ? 'col-span-2 text-right' : 'col-span-2'}`}>{h}</span>
          ))}
        </div>

        {isLoading ? (
          <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-mono text-xs text-white/20">No categories yet. Create your first one.</p>
            <p className="font-mono text-[9px] text-white/10 mt-2">Categories replace the hardcoded old_money / star_boy / essentials</p>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center">
              <div className="md:col-span-2">
                <p className="font-body text-sm text-white/90">{cat.label}</p>
              </div>
              <div className="md:col-span-2">
                <span className="font-mono text-[9px] text-white/30">{cat.key}</span>
              </div>
              <div className="md:col-span-2">
                {cat.on_sale ? (
                  <span className="font-mono text-[9px] tracking-wider uppercase text-red-400">Active</span>
                ) : (
                  <span className="font-mono text-[9px] text-white/20">—</span>
                )}
              </div>
              <div className="md:col-span-2">
                {cat.on_sale && cat.sale_discount_pct > 0 ? (
                  <span className="font-mono text-[10px] text-[#C5A059]">-{cat.sale_discount_pct}%</span>
                ) : (
                  <span className="font-mono text-[9px] text-white/20">—</span>
                )}
              </div>
              <div className="md:col-span-2">
                <span className={`font-mono text-[9px] tracking-wider uppercase ${cat.status === 'active' ? 'text-green-400' : 'text-white/30'}`}>{cat.status}</span>
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-2">
                <button onClick={() => handleEdit(cat)} className="p-2 text-white/30 hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => deleteMut.mutate(cat.id)} className="p-2 text-white/30 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
