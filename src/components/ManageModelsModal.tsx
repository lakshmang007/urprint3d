import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductSize, MaterialOption, ColorOption } from '../types';
import { MATERIAL_OPTIONS, COLOR_OPTIONS } from '../data/materials';
import {
  addProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  resetFirestoreCatalog,
} from '../services/firebaseService';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Check,
  Box,
  Database,
  Sliders,
  Sparkles,
  AlertCircle,
  Save,
  Maximize2,
  Tag,
} from 'lucide-react';

interface ManageModelsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageModelsModal: React.FC<ManageModelsModalProps> = ({ isOpen, onClose }) => {
  const { products, formatPrice, currency } = useStore();
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCategory, setFormCategory] = useState<string>('Anime & Action Figures');
  const [formBasePrice, setFormBasePrice] = useState('1499');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formHoverImageUrl, setFormHoverImageUrl] = useState('');
  const [formGeometryType, setFormGeometryType] = useState('anime_figure');
  const [formWidthMm, setFormWidthMm] = useState('100');
  const [formDepthMm, setFormDepthMm] = useState('100');
  const [formHeightMm, setFormHeightMm] = useState('180');
  const [formMinScale, setFormMinScale] = useState('25');
  const [formMaxScale, setFormMaxScale] = useState('250');
  const [formBadge, setFormBadge] = useState('NEW');
  const [formDetails, setFormDetails] = useState('');
  const [formInStock, setFormInStock] = useState(true);

  if (!isOpen) return null;

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleStartAdd = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSubtitle('');
    setFormCategory('Anime & Action Figures');
    setFormBasePrice('1499');
    setFormImageUrl(
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=1200'
    );
    setFormHoverImageUrl('');
    setFormGeometryType('anime_figure');
    setFormWidthMm('100');
    setFormDepthMm('100');
    setFormHeightMm('180');
    setFormMinScale('25');
    setFormMaxScale('250');
    setFormBadge('NEW');
    setFormDetails('Precision 3D printable model optimized for high-resolution desktop additive manufacturing with smooth layer resolution.');
    setFormInStock(true);
    setActiveTab('add');
  };

  const handleStartEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormSubtitle(prod.subtitle || '');
    setFormCategory(prod.category);
    setFormBasePrice(prod.basePrice.toString());
    setFormImageUrl(prod.images[0] || '');
    setFormHoverImageUrl(prod.hoverImage || prod.images[1] || prod.images[0] || '');
    setFormGeometryType(prod.stlGeometryType || 'spiral_vase');
    const baseSize = prod.sizes.find((s) => s.scaleFactor === 1.0) || prod.sizes[0];
    setFormWidthMm(baseSize ? baseSize.dimensions.widthMm.toString() : '100');
    setFormDepthMm(baseSize ? baseSize.dimensions.depthMm.toString() : '100');
    setFormHeightMm(baseSize ? baseSize.dimensions.heightMm.toString() : '150');
    setFormMinScale('25');
    setFormMaxScale('250');
    setFormBadge(prod.badges?.[0] || 'NEW');
    setFormDetails(prod.detailsAccordion || '');
    setFormInStock(prod.inStock !== false);
    setActiveTab('edit');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showStatus('Model name is required', 'error');
      return;
    }

    const priceNum = parseFloat(formBasePrice) || 29.0;
    const w = parseInt(formWidthMm, 10) || 100;
    const d = parseInt(formDepthMm, 10) || 100;
    const h = parseInt(formHeightMm, 10) || 150;

    const sizes: ProductSize[] = [
      {
        id: 's',
        label: `Small (${Math.round(h * 0.7)}mm)`,
        scaleFactor: 0.7,
        dimensions: {
          widthMm: Math.round(w * 0.7),
          depthMm: Math.round(d * 0.7),
          heightMm: Math.round(h * 0.7),
        },
      },
      {
        id: 'm',
        label: `Standard (${h}mm)`,
        scaleFactor: 1.0,
        dimensions: { widthMm: w, depthMm: d, heightMm: h },
      },
      {
        id: 'l',
        label: `Grand (${Math.round(h * 1.4)}mm)`,
        scaleFactor: 1.4,
        dimensions: {
          widthMm: Math.round(w * 1.4),
          depthMm: Math.round(d * 1.4),
          heightMm: Math.round(h * 1.4),
        },
      },
    ];

    setIsSaving(true);
    try {
      if (activeTab === 'add') {
        const newId = `prod-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        const newProd: Product = {
          id: newId,
          name: formName.trim(),
          subtitle: formSubtitle.trim() || 'Custom 3D model designed for precision printing',
          category: formCategory,
          basePrice: priceNum,
          rating: 5.0,
          reviewCount: 1,
          images: [
            formImageUrl ||
              'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=1200',
            formHoverImageUrl ||
              'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200',
          ],
          hoverImage:
            formHoverImageUrl ||
            'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=1200',
          badges: formBadge ? [formBadge] : ['NEW'],
          materials: MATERIAL_OPTIONS,
          colors: COLOR_OPTIONS,
          sizes: sizes,
          defaultMaterial: 'pla-matte',
          defaultColor: 'silk-emerald',
          defaultSize: 'm',
          specs: {
            designer: 'UrPrint Design Lab',
            license: 'Commercial Print License',
            weightGrams: Math.round(w * 1.5),
            printTimeHours: Math.round((h / 20) * 10) / 10,
            infillPercentage: 20,
            layerHeightMm: 0.16,
            sku: `UP-${newId.toUpperCase().slice(-6)}`,
          },
          detailsAccordion:
            formDetails ||
            'Optimized 3D geometry with high overhang stability and minimum support requirements.',
          stlGeometryType: formGeometryType,
          inStock: formInStock,
        };

        await addProductToFirestore(newProd);
        showStatus(`"${newProd.name}" added to Firebase database successfully!`);
        setActiveTab('list');
      } else if (activeTab === 'edit' && editingProduct) {
        const updates: Partial<Product> = {
          name: formName.trim(),
          subtitle: formSubtitle.trim(),
          category: formCategory,
          basePrice: priceNum,
          images: [formImageUrl, formHoverImageUrl].filter(Boolean),
          hoverImage: formHoverImageUrl || formImageUrl,
          badges: formBadge ? [formBadge] : [],
          sizes: sizes,
          stlGeometryType: formGeometryType,
          detailsAccordion: formDetails,
          inStock: formInStock,
        };

        await updateProductInFirestore(editingProduct.id, updates);
        showStatus(`"${formName}" updated in Firebase database!`);
        setActiveTab('list');
      }
    } catch (err: any) {
      console.error('Error saving product to Firebase:', err);
      showStatus(err?.message || 'Failed to save to Firebase', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from Firebase?`)) {
      return;
    }
    try {
      await deleteProductFromFirestore(id);
      showStatus(`"${name}" deleted from Firebase.`);
    } catch (err: any) {
      showStatus(err?.message || 'Failed to delete from Firebase', 'error');
    }
  };

  const handleResetCatalog = async () => {
    if (!window.confirm('Reset the Firestore catalog to default 3D models?')) return;
    try {
      setIsSaving(true);
      await resetFirestoreCatalog();
      showStatus('Catalog reset to default 3D models in Firebase!');
    } catch (err: any) {
      showStatus(err?.message || 'Failed to reset catalog', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-sans">
      <div onClick={onClose} className="fixed inset-0 bg-[#2C2C2C]/70 backdrop-blur-xs" />

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div
          id="manage-models-modal"
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E5E2D9] overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-5 sm:p-6 bg-[#F7F6F2] border-b border-[#E5E2D9] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2C2C2C] text-[#D1CFB9] flex items-center justify-center shadow-xs">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-bold text-[#2C2C2C]">
                    Firebase 3D Models Studio
                  </h2>
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold bg-[#E5E2D9] text-[#5A5A40] px-2 py-0.5 rounded-full border border-[#D1CFB9]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Firestore Live Backend
                  </span>
                </div>
                <p className="text-xs text-[#8E9299]">
                  Add new 3D models, modify existing pricing, scale options, and sync with Firebase
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#8E9299] hover:text-[#2C2C2C] bg-white rounded-full border border-[#E5E2D9] hover:bg-[#F2F0EA] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Message Banner */}
          {statusMessage && (
            <div
              className={`px-5 py-2.5 text-xs font-semibold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-b border-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Tabs bar */}
          <div className="flex items-center justify-between border-b border-[#E5E2D9] px-6 py-2.5 bg-white">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'list'
                    ? 'bg-[#2C2C2C] text-white shadow-xs'
                    : 'text-[#4A4A4A] hover:bg-[#F7F6F2]'
                }`}
              >
                All Models ({products.length})
              </button>
              <button
                onClick={handleStartAdd}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'add'
                    ? 'bg-[#5A5A40] text-white shadow-xs'
                    : 'text-[#5A5A40] bg-[#F2F0EA] hover:bg-[#E5E2D9]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add New 3D Model</span>
              </button>
              {activeTab === 'edit' && editingProduct && (
                <span className="text-xs font-mono bg-[#FAF9F6] text-[#2C2C2C] border border-[#E5E2D9] px-2.5 py-1 rounded-md">
                  Editing: <span className="font-bold">{editingProduct.name}</span>
                </span>
              )}
            </div>

            <button
              onClick={handleResetCatalog}
              disabled={isSaving}
              className="text-[11px] text-[#8E9299] hover:text-[#2C2C2C] flex items-center gap-1 hover:underline"
              title="Reset all models in Firebase Firestore to initial presets"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#FAF9F6]">
            {activeTab === 'list' ? (
              /* List & Manage Models in Firestore */
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {products.map((prod) => (
                    <div
                      key={prod.id}
                      className="p-3.5 bg-white rounded-2xl border border-[#E5E2D9] shadow-xs flex items-center gap-3.5 hover:border-[#5A5A40] transition-all"
                    >
                      <div className="w-16 h-16 rounded-xl bg-[#F7F6F2] overflow-hidden border border-[#E5E2D9] shrink-0">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono uppercase bg-[#F2F0EA] text-[#5A5A40] px-1.5 py-0.2 rounded-sm font-bold">
                            {prod.category}
                          </span>
                          {!prod.inStock && (
                            <span className="text-[9px] font-mono text-rose-600 bg-rose-50 px-1.5 rounded-sm">
                              Out of Stock
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-[#2C2C2C] text-xs truncate mt-0.5">
                          {prod.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px]">
                          <span className="font-serif font-bold text-[#2C2C2C]">
                            {formatPrice(prod.basePrice)}
                          </span>
                          <span className="text-[#8E9299] text-[10px] font-mono">
                            • Scale Options: 25% - 250%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(prod)}
                          className="p-1.5 text-[#5A5A40] hover:bg-[#F2F0EA] rounded-lg transition-all"
                          title="Modify Model"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-1.5 text-[#8E9299] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete from Firebase"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Add or Edit Form */
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E5E2D9] space-y-4">
                  <h3 className="font-serif text-base font-bold text-[#2C2C2C] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                    <span>
                      {activeTab === 'add' ? 'Add New 3D Model to Firestore' : 'Modify 3D Model'}
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#2C2C2C] block">
                        3D Model Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Minimalist Planter Pot"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#E5E2D9] rounded-xl focus:outline-hidden focus:border-[#5A5A40] bg-[#FAF9F6]"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#2C2C2C] block">Category</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#E5E2D9] rounded-xl focus:outline-hidden focus:border-[#5A5A40] bg-[#FAF9F6]"
                      >
                        <option value="Anime & Action Figures">Anime & Action Figures</option>
                        <option value="Home Decor">Home Decor</option>
                        <option value="Wall Hangings">Wall Hangings</option>
                        <option value="Keychains">Keychains</option>
                        <option value="Sculptures & Accents">Sculptures & Accents</option>
                      </select>
                    </div>

                    {/* Base Price */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#2C2C2C] block">
                        Base Price (₹ INR) *
                      </label>
                      <input
                        type="number"
                        step="10"
                        min="50"
                        required
                        placeholder="1499"
                        value={formBasePrice}
                        onChange={(e) => setFormBasePrice(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#E5E2D9] rounded-xl focus:outline-hidden focus:border-[#5A5A40] bg-[#FAF9F6] font-mono"
                      />
                      <span className="text-[10px] text-[#8E9299]">
                        Price: {formatPrice(parseFloat(formBasePrice) || 0)}
                      </span>
                    </div>

                    {/* Badge */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#2C2C2C] block">Badge / Tag</label>
                      <select
                        value={formBadge}
                        onChange={(e) => setFormBadge(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#E5E2D9] rounded-xl focus:outline-hidden focus:border-[#5A5A40] bg-[#FAF9F6]"
                      >
                        <option value="NEW">NEW</option>
                        <option value="BESTSELLER">BESTSELLER</option>
                        <option value="TRENDING">TRENDING</option>
                        <option value="EXCLUSIVE">EXCLUSIVE</option>
                        <option value="SUSTAINABLE">SUSTAINABLE</option>
                      </select>
                    </div>

                    {/* Subtitle */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-[#2C2C2C] block">
                        Subtitle / Short Description
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Biomimetic ribbed container with drain holes"
                        value={formSubtitle}
                        onChange={(e) => setFormSubtitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#E5E2D9] rounded-xl focus:outline-hidden focus:border-[#5A5A40] bg-[#FAF9F6]"
                      />
                    </div>

                    {/* Dimensions & Scale Constraints */}
                    <div className="space-y-1 sm:col-span-2 bg-[#F7F6F2] p-3.5 rounded-xl border border-[#E5E2D9]">
                      <label className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5 text-[#5A5A40]" />
                        <span>Base Dimensions & Scale Bounds</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <span className="text-[10px] text-[#8E9299] block">Width (mm)</span>
                          <input
                            type="number"
                            min="20"
                            max="500"
                            value={formWidthMm}
                            onChange={(e) => setFormWidthMm(e.target.value)}
                            className="w-full p-2 bg-white border border-[#E5E2D9] rounded-lg text-xs font-mono"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8E9299] block">Depth (mm)</span>
                          <input
                            type="number"
                            min="20"
                            max="500"
                            value={formDepthMm}
                            onChange={(e) => setFormDepthMm(e.target.value)}
                            className="w-full p-2 bg-white border border-[#E5E2D9] rounded-lg text-xs font-mono"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8E9299] block">Height (mm)</span>
                          <input
                            type="number"
                            min="20"
                            max="600"
                            value={formHeightMm}
                            onChange={(e) => setFormHeightMm(e.target.value)}
                            className="w-full p-2 bg-white border border-[#E5E2D9] rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-[#8E9299] font-mono mt-2">
                        Mentioned Scale Limits: Min 25% ({Math.round(parseInt(formWidthMm || '100') * 0.25)}×{Math.round(parseInt(formHeightMm || '150') * 0.25)}mm) to Max 250% ({Math.round(parseInt(formWidthMm || '100') * 2.5)}×{Math.round(parseInt(formHeightMm || '150') * 2.5)}mm).
                      </p>
                    </div>

                    {/* Image URL */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-bold text-[#2C2C2C] block">Primary Image URL</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#E5E2D9] rounded-xl focus:outline-hidden focus:border-[#5A5A40] bg-[#FAF9F6] font-mono text-[11px]"
                      />
                    </div>

                    {/* 3D Geometry Type */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#2C2C2C] block">
                        3D Preview Simulation Mesh
                      </label>
                      <select
                        value={formGeometryType}
                        onChange={(e) => setFormGeometryType(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-[#E5E2D9] rounded-xl focus:outline-hidden focus:border-[#5A5A40] bg-[#FAF9F6]"
                      >
                        <option value="anime_figure">Anime Action Figure Statue</option>
                        <option value="chibi">Chibi Miniature Figure</option>
                        <option value="wall_art">3D Wall Hanging Panel</option>
                        <option value="keychain">Custom Keychain / Tag</option>
                        <option value="spiral_vase">Parametric Spiral Vase</option>
                        <option value="planter">Ribbed Planter Pot</option>
                        <option value="lamp">Woven Lattice Lamp</option>
                        <option value="dragon">Articulated Flexi Dragon</option>
                        <option value="sculpture">Artisan Sculpture</option>
                      </select>
                    </div>

                    {/* In Stock toggle */}
                    <div className="space-y-1 flex items-end">
                      <label className="flex items-center gap-2 text-xs font-bold text-[#2C2C2C] cursor-pointer pb-2">
                        <input
                          type="checkbox"
                          checked={formInStock}
                          onChange={(e) => setFormInStock(e.target.checked)}
                          className="rounded border-[#E5E2D9] text-[#5A5A40] focus:ring-[#5A5A40] w-4 h-4"
                        />
                        <span>In Stock & Ready to Print</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-4 py-2 text-xs font-semibold text-[#4A4A4A] hover:bg-[#E5E2D9] rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-[#2C2C2C] hover:bg-[#444444] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5 text-[#D1CFB9]" />
                    <span>{isSaving ? 'Saving to Firebase...' : 'Save to Firestore'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
