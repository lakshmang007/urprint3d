import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MATERIAL_OPTIONS, COLOR_OPTIONS } from '../data/materials';
import { CustomPrintQuote, MaterialOption, ColorOption } from '../types';
import { ThreeDViewer } from './ThreeDViewer';
import {
  UploadCloud,
  FileCode,
  Sparkles,
  Layers,
  Box,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Sliders,
  RotateCcw,
} from 'lucide-react';

export const CustomPrintUpload: React.FC = () => {
  const { addCustomQuoteToCart, formatPrice } = useStore();

  // File Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSizeMb, setUploadedFileSizeMb] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [meshPreviewType, setMeshPreviewType] = useState<'vase' | 'gear' | 'dragon' | 'cube'>('vase');

  // Print Configuration Options
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialOption>(MATERIAL_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState<ColorOption>(COLOR_OPTIONS[0]);

  const [infillPercentage, setInfillPercentage] = useState<number>(20);
  const [layerHeightMm, setLayerHeightMm] = useState<number>(0.20);
  const [scalePercentage, setScalePercentage] = useState<number>(100);
  const [quantity, setQuantity] = useState<number>(1);

  // Base raw model dimensions (before scaling)
  const baseDimensions = { x: 120, y: 120, z: 180 };

  const currentX = Math.round(baseDimensions.x * (scalePercentage / 100));
  const currentY = Math.round(baseDimensions.y * (scalePercentage / 100));
  const currentZ = Math.round(baseDimensions.z * (scalePercentage / 100));

  // Volumetric calculation
  const volumeCm3 = Math.round(((currentX * currentY * currentZ) / 1000) * 0.4);
  const weightGrams = Math.round(volumeCm3 * 1.24 * (infillPercentage / 100 + 0.15));
  const estimatedHours = Number((volumeCm3 * 0.12 * (0.20 / layerHeightMm)).toFixed(1));

  // Instant Price Quote Formula in INR (₹)
  // Base machine setup fee (₹199) + material cost per gram (₹2.2 * multiplier) + print hour cost (₹35/hr)
  const pricePerUnit = Math.round(
    199 +
    weightGrams * 2.2 * selectedMaterial.priceMultiplier +
    estimatedHours * 35
  );
  const totalPrice = pricePerUnit * quantity;

  // Demo STL preset models for quick testing
  const demoFiles = [
    { name: 'Anime_Hero_Action_Figure.stl', sizeMb: 28.4, type: 'dragon' as const },
    { name: 'Japanese_Wave_Wall_Hanging.stl', sizeMb: 18.2, type: 'cube' as const },
    { name: 'Articulated_Flexi_Dragon_Keychain.stl', sizeMb: 12.5, type: 'dragon' as const },
    { name: 'Fibonacci_Spiral_Vase_Decor.stl', sizeMb: 15.6, type: 'vase' as const },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateAnalysis(file.name, Number((file.size / (1024 * 1024)).toFixed(1)), 'vase');
    }
  };

  const simulateAnalysis = (name: string, sizeMb: number, type: 'vase' | 'gear' | 'dragon' | 'cube') => {
    setIsAnalyzing(true);
    setUploadedFileName(name);
    setUploadedFileSizeMb(sizeMb);
    setMeshPreviewType(type);

    setTimeout(() => {
      setIsAnalyzing(false);
    }, 800);
  };

  const handleAddToCart = () => {
    const quote: CustomPrintQuote = {
      file: null,
      fileName: uploadedFileName || 'Custom_Uploaded_Model.stl',
      fileSizeMb: uploadedFileSizeMb || 14.2,
      volumeCm3,
      dimensionsMm: { x: currentX, y: currentY, z: currentZ },
      selectedMaterial,
      selectedColor,
      infillPercentage,
      layerHeightMm,
      scalePercentage,
      quantity,
      pricePerUnit,
      totalPrice,
      estimatedPrintTimeHours: estimatedHours,
      meshPreviewType,
    };

    addCustomQuoteToCart(quote);
  };

  return (
    <div className="bg-stone-50 min-h-screen font-sans py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-800 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
            <UploadCloud className="w-3.5 h-3.5 text-amber-600" />
            <span>Instant Slicing & Price Quote</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
            Custom 3D Print Upload
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Upload your STL or OBJ files for real-time 3D volumetric slicing, material customization, and automated local print hub dispatch.
          </p>
        </div>

        {/* MAIN WORKSPACE GRID: Left Upload & 3D Canvas / Right Slicing Controls & Quote */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: File Drop Zone + 3D Canvas Slicer */}
          <div className="lg:col-span-7 space-y-6">
            {/* File Drag & Drop Zone */}
            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-stone-300 hover:border-amber-500 transition-colors shadow-xs relative">
              <input
                type="file"
                accept=".stl,.obj,.3mf,.step"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center text-center space-y-3 pointer-events-none">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-xs">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm">
                    Drag & Drop your 3D CAD model file here
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Supports <span className="font-mono font-bold">.STL, .OBJ, .3MF, .STEP</span> up to 150MB
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Demo Models selector if user doesn't have an STL handy */}
            <div className="bg-white p-4 rounded-xl border border-stone-200/80 space-y-2">
              <p className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Or Select a Demo 3D Model File To Test Instant Slicing:</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {demoFiles.map((demo) => (
                  <button
                    key={demo.name}
                    onClick={() => simulateAnalysis(demo.name, demo.sizeMb, demo.type)}
                    className={`p-2 rounded-lg border text-left text-xs transition-all ${
                      uploadedFileName === demo.name
                        ? 'border-amber-600 bg-amber-50 font-bold text-stone-900'
                        : 'border-stone-200 hover:border-stone-400 bg-stone-50/50 text-stone-700'
                    }`}
                  >
                    <p className="truncate text-[11px] font-mono">{demo.name}</p>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">{demo.sizeMb} MB</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive 3D Canvas Preview of Uploaded Model */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-700">
                <span className="font-bold flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-amber-700" />
                  <span>File: {uploadedFileName || 'Parametric_Vase_Prototype.stl'}</span>
                </span>
                {uploadedFileSizeMb > 0 && (
                  <span className="font-mono text-stone-500">
                    {uploadedFileSizeMb} MB • Volume: {volumeCm3} cm³
                  </span>
                )}
              </div>

              {isAnalyzing ? (
                <div className="h-80 bg-white rounded-2xl border border-stone-200 flex flex-col items-center justify-center space-y-3">
                  <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-mono text-stone-600">Analyzing Mesh Geometry & Manifold Mesh Topology...</p>
                </div>
              ) : (
                <ThreeDViewer
                  geometryType={
                    meshPreviewType === 'vase'
                      ? 'spiral_vase'
                      : meshPreviewType === 'gear'
                      ? 'gear_clock'
                      : meshPreviewType === 'dragon'
                      ? 'dragon'
                      : 'headphone_stand'
                  }
                  colorHex={selectedColor.hex}
                  materialFinish={selectedMaterial.name}
                  height="h-96"
                  customDimensions={{ x: currentX, y: currentY, z: currentZ }}
                />
              )}
            </div>

            {/* Sliced Mesh Geometry Telemetry */}
            <div className="grid grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-stone-200 text-center font-mono text-xs shadow-xs">
              <div>
                <span className="text-[10px] text-stone-400 block">Bounding X×Y×Z</span>
                <span className="font-bold text-stone-900">{currentX}×{currentY}×{currentZ}mm</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Mesh Volume</span>
                <span className="font-bold text-stone-900">{volumeCm3} cm³</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Est. Weight</span>
                <span className="font-bold text-stone-900">{weightGrams} g</span>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">Print Time</span>
                <span className="font-bold text-stone-900">{estimatedHours} hrs</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Print Slicing Parameters & Dynamic Price Quote */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="font-serif text-xl font-bold text-stone-900">Configure Print Specs</h2>
              <p className="text-xs text-stone-500">Adjust filament material, infill %, layer height, and scale factor.</p>
            </div>

            {/* 1. Material Choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-900 block">Select Polymer Filament</label>
              <div className="grid grid-cols-2 gap-2">
                {MATERIAL_OPTIONS.map((mat) => (
                  <button
                    key={mat.id}
                    onClick={() => setSelectedMaterial(mat)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      selectedMaterial.id === mat.id
                        ? 'border-amber-600 bg-amber-50 font-bold text-stone-900'
                        : 'border-stone-200 hover:border-stone-400 text-stone-700'
                    }`}
                  >
                    <p className="font-bold">{mat.name}</p>
                    <p className="text-[10px] text-stone-500">{mat.properties.finish}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Color Choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-900 block">Color Swatch</label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      selectedColor.id === c.id ? 'scale-110 border-amber-600 ring-2 ring-amber-500/30' : 'border-stone-300'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* 3. Infill Density Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-stone-900">
                <span>Infill Density (%):</span>
                <span className="text-amber-700 font-mono">{infillPercentage}% ({infillPercentage < 25 ? 'Standard Light' : infillPercentage < 60 ? 'Rigid Heavy Duty' : 'Solid Metal Equivalent'})</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={infillPercentage}
                onChange={(e) => setInfillPercentage(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>10% (Light)</span>
                <span>50% (Rigid)</span>
                <span>100% (Solid)</span>
              </div>
            </div>

            {/* 4. Layer Resolution (mm) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-900 block">Layer Height Quality</label>
              <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                {[
                  { label: '0.08mm', val: 0.08, desc: 'Ultra Fine' },
                  { label: '0.12mm', val: 0.12, desc: 'Fine Detail' },
                  { label: '0.20mm', val: 0.20, desc: 'Standard' },
                  { label: '0.28mm', val: 0.28, desc: 'Draft Speed' },
                ].map((l) => (
                  <button
                    key={l.val}
                    onClick={() => setLayerHeightMm(l.val)}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      layerHeightMm === l.val
                        ? 'border-amber-600 bg-amber-50 font-bold text-amber-900'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    <p>{l.label}</p>
                    <p className="text-[9px] text-stone-400">{l.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Scale Percentage Factor Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-stone-900">
                <span>Uniform Scale Factor:</span>
                <span className="text-amber-700 font-mono">{scalePercentage}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                step="10"
                value={scalePercentage}
                onChange={(e) => setScalePercentage(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Quantity Selector & Quote Summary Box */}
            <div className="bg-stone-900 text-white p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300 font-bold">Print Quantity</span>
                <div className="flex items-center border border-stone-700 rounded-lg overflow-hidden font-bold">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 hover:bg-stone-800">-</button>
                  <span className="px-3 text-amber-400">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1 hover:bg-stone-800">+</button>
                </div>
              </div>

              <div className="border-t border-stone-800 pt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-stone-400 block font-mono">Automated Quote Total</span>
                  <span className="text-[10px] text-amber-400 font-mono">Includes Slicing & Tax</span>
                </div>
                <span className="font-serif text-3xl font-bold text-amber-400">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add Custom Print Job to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
