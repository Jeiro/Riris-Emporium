import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Package,
  Star
} from 'lucide-react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { imageService } from '../../services/imageService';
import { productService } from '../../services/productService';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';

export const AddProductPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    category: '',
    sku: `SKU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    stock: '0',
    lowStockThreshold: '5',
    isFeatured: false,
    images: [] as string[]
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image`);
        if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name} exceeds 5MB limit`);

        const result = await imageService.uploadProductImage(file);
        return result.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.price || formData.images.length === 0) {
      setError('Name, Price, and at least one image are required');
      return;
    }

    setIsSaving(true);
    try {
      await productService.createProduct({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        category: formData.category,
        sku: formData.sku,
        isFeatured: formData.isFeatured,
        images: formData.images,
        inventory: {
          quantity: parseInt(formData.stock),
          lowStockThreshold: parseInt(formData.lowStockThreshold)
        }
      } as any);

      setSuccess(true);
      setTimeout(() => navigate('/admin/products'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto p-6 lg:p-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/admin/products')}
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-[#E8DFD0] text-[#5D3A1A] hover:bg-[#8B5A2B] hover:text-white transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-[0.2em] mb-1">Product Studio</p>
              <h1 className="text-3xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>
                New Masterpiece
              </h1>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
              className="h-12 px-6 border-[#D4C4A8] text-[#5D3A1A] rounded-xl hover:bg-[#FAF7F2]"
            >
              Discard
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSaving || isUploading}
              className="h-12 px-8 bg-[#8B5A2B] hover:bg-[#6B4423] text-white rounded-xl shadow-lg shadow-[#8B5A2B]/20 transition-all hover:-translate-y-0.5"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <span>Publish Product</span>}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm flex items-center gap-3 animate-shake">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm flex items-center gap-3 animate-fade-in">
            <CheckCircle2 size={18} /> Product created successfully. Redirecting...
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* ── Left Side: Main Info ── */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-[#E8DFD0] p-8 shadow-sm space-y-8">
              <div className="space-y-6">
                <div className="grid gap-2">
                  <label className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="E.g. Vintage Leather Messenger Bag"
                    className="w-full px-5 py-4 bg-[#FAF7F2] border border-[#D4C4A8] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#8B5A2B]/5 focus:border-[#8B5A2B] transition-all font-medium text-[#5D3A1A]"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Description</label>
                  <textarea
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell the story behind this piece..."
                    className="w-full px-5 py-4 bg-[#FAF7F2] border border-[#D4C4A8] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#8B5A2B]/5 focus:border-[#8B5A2B] transition-all font-medium text-[#5D3A1A] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8DFD0] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#8B5A2B]/10 flex items-center justify-center text-[#8B5A2B]">
                  <ImageIcon size={20} />
                </div>
                <h2 className="text-xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>Media Gallery</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative aspect-square group rounded-2xl overflow-hidden border border-[#E8DFD0]">
                    <img src={url} alt="Product" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removeImage(index)}
                        className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-[#8B5A2B] text-white text-[8px] font-bold px-2 py-0.5 rounded shadow-lg uppercase tracking-tighter">Cover</div>
                    )}
                  </div>
                ))}

                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-[#D4C4A8] rounded-2xl hover:bg-[#FAF7F2] hover:border-[#8B5A2B] cursor-pointer transition-all">
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <div className="p-3 rounded-full bg-[#FAF7F2] text-[#A67B5B] mb-2">
                    {isUploading ? <Loader2 size={24} className="animate-spin text-[#8B5A2B]" /> : <Plus size={24} />}
                  </div>
                  <span className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest">Add Images</span>
                </label>
              </div>
              <p className="mt-4 text-[10px] text-[#A67B5B] italic">The first image will be used as the product cover page.</p>
            </div>
          </div>

          {/* ── Right Side: Specs & Status ── */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-[#E8DFD0] p-8 shadow-sm space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD0]">
                  <div className="flex items-center gap-3">
                    <Star className={`w-5 h-5 ${formData.isFeatured ? 'text-yellow-500 fill-yellow-500' : 'text-[#D4C4A8]'}`} />
                    <span className="text-sm font-bold text-[#5D3A1A]">Featured Product</span>
                  </div>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(v) => setFormData({ ...formData, isFeatured: v })}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Accessories"
                    className="w-full px-5 py-3.5 bg-[#FAF7F2] border border-[#D4C4A8] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#8B5A2B]/5 focus:border-[#8B5A2B] transition-all font-medium text-[#5D3A1A] text-sm"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Unique SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    readOnly
                    className="w-full px-5 py-3.5 bg-white border border-[#F5F1E8] rounded-2xl text-[#A67B5B] text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8DFD0] p-8 shadow-sm space-y-8">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <label className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Retail Price (₦)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="50,000"
                    className="w-full px-5 py-3.5 bg-[#FAF7F2] border border-[#D4C4A8] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#8B5A2B]/5 focus:border-[#8B5A2B] transition-all font-bold text-[#8B5A2B] text-lg"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Compare at Price</label>
                  <input
                    type="number"
                    value={formData.compareAtPrice}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                    placeholder="65,000"
                    className="w-full px-5 py-3.5 bg-[#FAF7F2] border border-[#D4C4A8] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#8B5A2B]/5 focus:border-[#8B5A2B] transition-all font-medium text-[#A67B5B] line-through text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8DFD0] p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                  <Package size={20} />
                </div>
                <h2 className="text-xl font-bold text-[#5D3A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>Inventory</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Quantity</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-5 py-3.5 bg-[#FAF7F2] border border-[#D4C4A8] rounded-2xl focus:outline-none focus:border-[#8B5A2B] transition-all font-bold text-[#5D3A1A] text-sm text-center"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-[10px] font-bold text-[#A67B5B] uppercase tracking-widest pl-1">Low Limit</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full px-5 py-3.5 bg-[#FAF7F2] border border-[#D4C4A8] rounded-2xl focus:outline-none focus:border-[#8B5A2B] transition-all font-bold text-[#5D3A1A] text-sm text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
