import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiClient';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Save, Tag, Clock, Image, Video } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const emptyProduct = {
  name: '', description: '', price: 0, sale_price: '', sale_ends_at: '', on_sale: false,
  category: '', collection: '',
  sizes: ['S', 'M', 'L', 'XL'], size_stock: {},
  colors: [], color_images: {},
  image_url: '', lifestyle_image_url: '', extra_images: [], video_url: '',
  stock: 50, fabric: '', status: 'active', style_guide: [], featured: false,
};

export default function Products() {
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [activeTab, setActiveTab] = useState('basic');
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.products.list(),
    initialData: [],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.categories.list(),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.products.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); setEditing(null); toast.success('Product created'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.products.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); setEditing(null); toast.success('Product updated'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.products.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted'); },
  });

  const handleEdit = (product) => {
    setFormData({
      ...emptyProduct, ...product,
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
      extra_images: Array.isArray(product.extra_images) ? product.extra_images : [],
      style_guide: Array.isArray(product.style_guide) ? product.style_guide : [],
      color_images: product.color_images || {},
      size_stock: product.size_stock || {},
      sale_ends_at: product.sale_ends_at ? product.sale_ends_at.slice(0, 16) : '',
    });
    setEditing(product.id);
    setActiveTab('basic');
  };

  const handleNew = () => { setFormData(emptyProduct); setEditing('new'); setActiveTab('basic'); };

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    const data = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      sale_price: formData.sale_price ? Number(formData.sale_price) : null,
      sale_ends_at: formData.sale_ends_at ? new Date(formData.sale_ends_at).toISOString() : null,
      sizes: typeof formData.sizes === 'string' ? formData.sizes.split(',').map(s => s.trim()) : formData.sizes,
      colors: typeof formData.colors === 'string' ? formData.colors.split(',').map(s => s.trim()).filter(Boolean) : formData.colors,
      style_guide: typeof formData.style_guide === 'string' ? formData.style_guide.split('\n').filter(Boolean) : formData.style_guide,
    };
    if (editing === 'new') createMutation.mutate(data);
    else updateMutation.mutate({ id: editing, data });
  };

  const handleUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    toast.loading('Uploading…', { id: 'upload' });
    const { file_url } = await api.upload(file);
    set(field, file_url);
    toast.success('Uploaded', { id: 'upload' });
  };

  const handleColorImageUpload = async (e, color) => {
    const file = e.target.files[0];
    if (!file) return;
    toast.loading(`Uploading ${color} image…`, { id: `upload-${color}` });
    const { file_url } = await api.upload(file);
    set('color_images', { ...formData.color_images, [color]: file_url });
    toast.success('Uploaded', { id: `upload-${color}` });
  };

  const handleExtraImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    toast.loading('Uploading image…', { id: 'upload-extra' });
    const { file_url } = await api.upload(file);
    set('extra_images', [...(formData.extra_images || []), file_url]);
    toast.success('Uploaded', { id: 'upload-extra' });
  };

  const sizesArr = typeof formData.sizes === 'string'
    ? formData.sizes.split(',').map(s => s.trim()).filter(Boolean)
    : (formData.sizes || []);

  const colorsArr = typeof formData.colors === 'string'
    ? formData.colors.split(',').map(s => s.trim()).filter(Boolean)
    : (formData.colors || []);

  const tabs = [
    { id: 'basic', label: 'Basic' },
    { id: 'media', label: 'Media' },
    { id: 'variants', label: 'Variants' },
    { id: 'sale', label: 'Sale' },
  ];

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light text-white">Products</h1>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/30 mt-1">{products.length} items in archive</p>
        </div>
        <button onClick={handleNew} className="flex items-center gap-2 px-5 py-2.5 bg-[#C5A059] text-black font-mono text-[10px] tracking-wider uppercase rounded-lg hover:bg-[#C5A059]/80 transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Editor */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="rounded-xl border border-white/8 bg-white/[0.03] p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-mono text-xs tracking-wider text-white/60 uppercase">{editing === 'new' ? 'New Product' : 'Edit Product'}</h3>
              <button onClick={() => setEditing(null)} className="text-white/30 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-1.5 font-mono text-[9px] tracking-wider uppercase rounded transition-colors ${activeTab === t.id ? 'bg-[#C5A059] text-black' : 'text-white/40 hover:text-white'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* BASIC TAB */}
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-admin">Name</label>
                  <Input value={formData.name} onChange={(e) => set('name', e.target.value)} className="input-admin" />
                </div>
                <div>
                  <label className="label-admin">Price ($)</label>
                  <Input type="number" value={formData.price} onChange={(e) => set('price', e.target.value)} className="input-admin" />
                </div>
                <div>
                  <label className="label-admin">Category</label>
                  <Select value={formData.category} onValueChange={(v) => set('category', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.length === 0 && <SelectItem value="_none" disabled>Create categories first</SelectItem>}
                      {categories.map(c => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="label-admin">Collection</label>
                  <Input value={formData.collection} onChange={(e) => set('collection', e.target.value)} className="input-admin" placeholder="Summer 2025" />
                </div>
                <div>
                  <label className="label-admin">Stock</label>
                  <Input type="number" value={formData.stock} onChange={(e) => set('stock', e.target.value)} className="input-admin" />
                </div>
                <div>
                  <label className="label-admin">Status</label>
                  <Select value={formData.status} onValueChange={(v) => set('status', v)}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="label-admin">Fabric</label>
                  <Input value={formData.fabric} onChange={(e) => set('fabric', e.target.value)} className="input-admin" placeholder="100% Premium Cotton" />
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.featured} onChange={(e) => set('featured', e.target.checked)} className="w-4 h-4 accent-[#C5A059]" />
                    <span className="font-mono text-[10px] tracking-wider text-white/60 uppercase">Featured on homepage</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="label-admin">Description</label>
                  <Textarea value={formData.description} onChange={(e) => set('description', e.target.value)} className="bg-white/5 border-white/10 text-white h-20" />
                </div>
                <div className="md:col-span-2">
                  <label className="label-admin">Style Guide (one per line)</label>
                  <Textarea
                    value={Array.isArray(formData.style_guide) ? formData.style_guide.join('\n') : formData.style_guide}
                    onChange={(e) => set('style_guide', e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-20"
                    placeholder="Pair with tailored chinos…" />
                </div>
              </div>
            )}

            {/* MEDIA TAB */}
            {activeTab === 'media' && (
              <div className="space-y-5">
                {/* Primary image */}
                <div>
                  <label className="label-admin flex items-center gap-1"><Image className="w-3 h-3" /> Primary Image</label>
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'image_url')} className="file-input-admin" />
                  {formData.image_url && <img src={formData.image_url} alt="" className="w-24 h-28 object-cover mt-2 rounded" />}
                </div>

                {/* Lifestyle image */}
                <div>
                  <label className="label-admin">Lifestyle Image</label>
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e, 'lifestyle_image_url')} className="file-input-admin" />
                  {formData.lifestyle_image_url && <img src={formData.lifestyle_image_url} alt="" className="w-24 h-28 object-cover mt-2 rounded" />}
                </div>

                {/* Extra images gallery */}
                <div>
                  <label className="label-admin">Extra Gallery Images</label>
                  <input type="file" accept="image/*" onChange={handleExtraImageUpload} className="file-input-admin" />
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {(formData.extra_images || []).map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} alt="" className="w-16 h-20 object-cover rounded" />
                        <button onClick={() => set('extra_images', formData.extra_images.filter((_, idx) => idx !== i))}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video */}
                <div>
                  <label className="label-admin flex items-center gap-1"><Video className="w-3 h-3" /> Product Video URL</label>
                  <Input value={formData.video_url || ''} onChange={(e) => set('video_url', e.target.value)}
                    className="input-admin" placeholder="https://example.com/video.mp4" />
                  <p className="font-mono text-[9px] text-white/20 mt-1">Paste a direct .mp4 link or upload and paste the URL. Video appears in the gallery thumbnail strip.</p>
                </div>

                {/* Color-specific images */}
                {colorsArr.length > 0 && (
                  <div>
                    <label className="label-admin">Color-Specific Images</label>
                    <p className="font-mono text-[9px] text-white/30 mb-3">Upload a unique image for each color. When a customer selects a color, this image shows as the primary photo.</p>
                    <div className="space-y-3">
                      {colorsArr.map(color => (
                        <div key={color} className="flex items-center gap-4">
                          <span className="font-mono text-[10px] text-white/60 w-24 shrink-0">{color}</span>
                          <input type="file" accept="image/*" onChange={(e) => handleColorImageUpload(e, color)} className="file-input-admin flex-1" />
                          {formData.color_images?.[color] && (
                            <div className="relative shrink-0">
                              <img src={formData.color_images[color]} alt={color} className="w-14 h-16 object-cover rounded" />
                              <button onClick={() => {
                                const ci = { ...formData.color_images };
                                delete ci[color];
                                set('color_images', ci);
                              }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                <X className="w-2.5 h-2.5 text-white" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {colorsArr.length === 0 && (
                  <p className="font-mono text-[9px] text-white/20">Add colors in the Variants tab first to set per-color images.</p>
                )}
              </div>
            )}

            {/* VARIANTS TAB */}
            {activeTab === 'variants' && (
              <div className="space-y-5">
                <div>
                  <label className="label-admin">Sizes (comma-separated)</label>
                  <Input
                    value={Array.isArray(formData.sizes) ? formData.sizes.join(', ') : formData.sizes}
                    onChange={(e) => set('sizes', e.target.value)}
                    className="input-admin" placeholder="XS, S, M, L, XL, XXL" />
                </div>

                {/* Per-size stock */}
                {sizesArr.length > 0 && (
                  <div>
                    <label className="label-admin">Stock per Size (optional)</label>
                    <p className="font-mono text-[9px] text-white/30 mb-3">Leave empty to use the global stock. Set 0 to mark that size as out-of-stock.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {sizesArr.map(size => (
                        <div key={size}>
                          <label className="font-mono text-[9px] text-white/40 uppercase block mb-1">{size}</label>
                          <Input
                            type="number"
                            value={formData.size_stock?.[size] ?? ''}
                            onChange={(e) => set('size_stock', { ...formData.size_stock, [size]: e.target.value === '' ? undefined : Number(e.target.value) })}
                            className="input-admin" placeholder="—" min="0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="label-admin">Colors (comma-separated)</label>
                  <Input
                    value={Array.isArray(formData.colors) ? formData.colors.join(', ') : formData.colors}
                    onChange={(e) => set('colors', e.target.value)}
                    className="input-admin" placeholder="Navy, Cream, Black, Burgundy" />
                  <p className="font-mono text-[9px] text-white/20 mt-1">After saving, go to the Media tab to upload per-color images.</p>
                </div>
              </div>
            )}

            {/* SALE TAB */}
            {activeTab === 'sale' && (
              <div className="space-y-5">
                <div className="border border-white/10 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#C5A059]">Product Sale</span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.on_sale} onChange={(e) => set('on_sale', e.target.checked)} className="w-4 h-4 accent-[#C5A059]" />
                    <span className="font-mono text-[10px] tracking-wider text-white/60 uppercase">Enable Sale on this product</span>
                  </label>

                  {formData.on_sale && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label-admin">Sale Price ($)</label>
                        <Input type="number" value={formData.sale_price || ''} onChange={(e) => set('sale_price', e.target.value)}
                          className="input-admin" placeholder="e.g. 79" />
                        {formData.price > 0 && formData.sale_price > 0 && (
                          <p className="font-mono text-[9px] text-[#C5A059] mt-1">
                            {Math.round(((formData.price - formData.sale_price) / formData.price) * 100)}% off
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="label-admin flex items-center gap-1"><Clock className="w-3 h-3" /> Sale Ends At (optional)</label>
                        <Input type="datetime-local" value={formData.sale_ends_at} onChange={(e) => set('sale_ends_at', e.target.value)} className="input-admin" />
                        <p className="font-mono text-[9px] text-white/20 mt-1">Leave empty for a permanent sale.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
                  <p className="font-mono text-[9px] text-white/30 leading-relaxed">
                    <span className="text-white/50">Priority:</span> Product-level sale takes priority over category sale.<br />
                    If no product sale is set, the category sale (set in the Categories page) will apply automatically.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2 border-t border-white/5">
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 bg-[#C5A059] text-black font-mono text-[10px] tracking-wider uppercase rounded-lg hover:bg-[#C5A059]/80 transition-colors">
                <Save className="w-3.5 h-3.5" /> Save Product
              </button>
              <button onClick={() => setEditing(null)} className="px-6 py-2.5 border border-white/10 text-white/50 font-mono text-[10px] tracking-wider uppercase rounded-lg hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product list */}
      <div className="rounded-xl border border-white/8 bg-white/[0.03] overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/8">
          {[['Image',1],['Name',3],['Category',2],['Price',1],['Stock',1],['Status',2],['Actions',2]].map(([h,span]) => (
            <span key={h} className={`col-span-${span} font-mono text-[8px] tracking-wider text-white/30 uppercase ${h === 'Actions' ? 'text-right' : ''}`}>{h}</span>
          ))}
        </div>

        {isLoading ? (
          <div className="p-12 text-center"><div className="w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center"><p className="font-mono text-xs text-white/20">No products yet.</p></div>
        ) : (
          products.map((product) => {
            const cat = categories.find(c => c.key === product.category);
            return (
              <div key={product.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <div className="col-span-1">
                  {product.image_url ? <img src={product.image_url} alt="" className="w-10 h-10 object-cover rounded" />
                    : <div className="w-10 h-10 bg-white/5 rounded" />}
                </div>
                <div className="col-span-3">
                  <p className="font-body text-sm text-white/90 truncate">{product.name}</p>
                  {product.on_sale && <span className="font-mono text-[8px] text-red-400 uppercase">On Sale</span>}
                </div>
                <div className="col-span-2">
                  <span className="font-mono text-[9px] tracking-wider text-white/40 uppercase">{cat?.label || product.category?.replace(/_/g, ' ')}</span>
                </div>
                <div className="col-span-1">
                  <span className="font-serif text-sm text-[#C5A059]">${product.price}</span>
                </div>
                <div className="col-span-1">
                  <span className={`font-mono text-[10px] ${(product.stock ?? 0) <= 5 ? 'text-red-400' : (product.stock ?? 0) <= 20 ? 'text-amber-400' : 'text-white/40'}`}>{product.stock ?? 0}</span>
                </div>
                <div className="col-span-2">
                  <span className={`font-mono text-[9px] tracking-wider uppercase ${product.status === 'active' ? 'text-green-400' : product.status === 'draft' ? 'text-amber-400' : 'text-white/30'}`}>{product.status || 'active'}</span>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button onClick={() => handleEdit(product)} className="p-2 text-white/30 hover:text-white transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteMutation.mutate(product.id)} className="p-2 text-white/30 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .label-admin { @apply font-mono text-[9px] tracking-wider text-white/40 uppercase block mb-1; }
        .input-admin { @apply bg-white/5 border-white/10 text-white; }
        .file-input-admin { @apply text-xs text-white/50 file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:bg-white/10 file:text-white/70 file:font-mono file:text-[10px] file:uppercase file:tracking-wider; }
      `}</style>
    </div>
  );
}
