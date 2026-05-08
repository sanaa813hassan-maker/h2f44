import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const emptyProduct = {
  name: '', description: '', price: 0, category: 'old_money', collection: '',
  sizes: ['S', 'M', 'L', 'XL'], colors: [], image_url: '', lifestyle_image_url: '',
  stock: 50, fabric: '', status: 'active', style_guide: [], featured: false,
};

export default function Products() {
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyProduct);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setEditing(null);
      toast.success('Product created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setEditing(null);
      toast.success('Product updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
  });

  const handleEdit = (product) => {
    setFormData({ ...emptyProduct, ...product });
    setEditing(product.id);
  };

  const handleNew = () => {
    setFormData(emptyProduct);
    setEditing('new');
  };

  const handleSave = () => {
    const data = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      sizes: typeof formData.sizes === 'string' ? formData.sizes.split(',').map(s => s.trim()) : formData.sizes,
      colors: typeof formData.colors === 'string' ? formData.colors.split(',').map(s => s.trim()).filter(Boolean) : formData.colors,
      style_guide: typeof formData.style_guide === 'string' ? formData.style_guide.split('\n').filter(Boolean) : formData.style_guide,
    };
    if (editing === 'new') {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate({ id: editing, data });
    }
  };

  const handleUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFormData(prev => ({ ...prev, [field]: file_url }));
  };

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-white">Products</h1>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30 mt-1">
            {products.length} items in archive
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#C5A059] text-black font-mono text-[10px] tracking-wider uppercase rounded-lg hover:bg-[#C5A059]/80 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Editor */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-xl border border-white/8 bg-white/[0.03] backdrop-blur-md p-6 space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-xs tracking-wider text-white/60 uppercase">
                {editing === 'new' ? 'New Product' : 'Edit Product'}
              </h3>
              <button onClick={() => setEditing(null)} className="text-white/30 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Name</label>
                <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Price ($)</label>
                <Input type="number" value={formData.price} onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Category</label>
                <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="old_money">Old Money</SelectItem>
                    <SelectItem value="star_boy">Star Boy</SelectItem>
                    <SelectItem value="essentials">Essentials</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Stock</label>
                <Input type="number" value={formData.stock} onChange={(e) => setFormData(p => ({ ...p, stock: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white" />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Status</label>
                <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Fabric</label>
                <Input value={formData.fabric} onChange={(e) => setFormData(p => ({ ...p, fabric: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white" placeholder="Premium Pique Cotton" />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Sizes (comma separated)</label>
                <Input value={Array.isArray(formData.sizes) ? formData.sizes.join(', ') : formData.sizes}
                  onChange={(e) => setFormData(p => ({ ...p, sizes: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white" placeholder="S, M, L, XL" />
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Colors (comma separated)</label>
                <Input value={Array.isArray(formData.colors) ? formData.colors.join(', ') : formData.colors}
                  onChange={(e) => setFormData(p => ({ ...p, colors: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white" placeholder="Navy, Cream, Black" />
              </div>
            </div>

            <div>
              <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Description</label>
              <Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                className="bg-white/5 border-white/10 text-white h-20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Product Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'image_url')}
                  className="text-xs text-white/50 file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:bg-white/10 file:text-white/70 file:font-mono file:text-[10px] file:uppercase file:tracking-wider" />
                {formData.image_url && <img src={formData.image_url} alt="Preview" className="w-20 h-20 object-cover mt-2 rounded" />}
              </div>
              <div>
                <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Lifestyle Image</label>
                <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'lifestyle_image_url')}
                  className="text-xs text-white/50 file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:bg-white/10 file:text-white/70 file:font-mono file:text-[10px] file:uppercase file:tracking-wider" />
                {formData.lifestyle_image_url && <img src={formData.lifestyle_image_url} alt="Preview" className="w-20 h-20 object-cover mt-2 rounded" />}
              </div>
            </div>

            <div>
              <label className="font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1">Style Guide (one per line)</label>
              <Textarea
                value={Array.isArray(formData.style_guide) ? formData.style_guide.join('\n') : formData.style_guide}
                onChange={(e) => setFormData(p => ({ ...p, style_guide: e.target.value }))}
                className="bg-white/5 border-white/10 text-white h-20"
                placeholder="Pair with tailored chinos for a classic look..."
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#C5A059] text-black font-mono text-[10px] tracking-wider uppercase rounded-lg hover:bg-[#C5A059]/80 transition-colors">
                <Save className="w-3.5 h-3.5" /> Save
              </button>
              <button onClick={() => setEditing(null)}
                className="px-6 py-2.5 border border-white/10 text-white/50 font-mono text-[10px] tracking-wider uppercase rounded-lg hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product list */}
      <div className="rounded-xl border border-white/8 bg-white/[0.03] backdrop-blur-md overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/8">
          <span className="col-span-1 font-mono text-[8px] tracking-wider text-white/30 uppercase">Image</span>
          <span className="col-span-3 font-mono text-[8px] tracking-wider text-white/30 uppercase">Name</span>
          <span className="col-span-2 font-mono text-[8px] tracking-wider text-white/30 uppercase">Category</span>
          <span className="col-span-1 font-mono text-[8px] tracking-wider text-white/30 uppercase">Price</span>
          <span className="col-span-1 font-mono text-[8px] tracking-wider text-white/30 uppercase">Stock</span>
          <span className="col-span-2 font-mono text-[8px] tracking-wider text-white/30 uppercase">Status</span>
          <span className="col-span-2 font-mono text-[8px] tracking-wider text-white/30 uppercase text-right">Actions</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-mono text-xs text-white/20">No products yet. Add your first piece.</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <div className="col-span-1">
                {product.image_url ? (
                  <img src={product.image_url} alt="" className="w-10 h-10 object-cover rounded" />
                ) : (
                  <div className="w-10 h-10 bg-white/5 rounded" />
                )}
              </div>
              <div className="col-span-3">
                <p className="font-body text-sm text-white/90 truncate">{product.name}</p>
              </div>
              <div className="col-span-2">
                <span className="font-mono text-[9px] tracking-wider text-white/40 uppercase">{product.category?.replace('_', ' ')}</span>
              </div>
              <div className="col-span-1">
                <span className="font-serif text-sm text-[#C5A059]">${product.price}</span>
              </div>
              <div className="col-span-1">
                <span className={`font-mono text-[10px] ${(product.stock ?? 0) <= 5 ? 'text-red-400' : (product.stock ?? 0) <= 20 ? 'text-amber-400' : 'text-white/40'}`}>
                  {product.stock ?? 0}
                </span>
              </div>
              <div className="col-span-2">
                <span className={`font-mono text-[9px] tracking-wider uppercase ${
                  product.status === 'active' ? 'text-green-400' : product.status === 'draft' ? 'text-amber-400' : 'text-white/30'
                }`}>
                  {product.status || 'active'}
                </span>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-2">
                <button onClick={() => handleEdit(product)} className="p-2 text-white/30 hover:text-white transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteMutation.mutate(product.id)} className="p-2 text-white/30 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
