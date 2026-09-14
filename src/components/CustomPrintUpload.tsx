import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { useStore } from '../context/StoreContext';
import { MATERIAL_OPTIONS, COLOR_OPTIONS } from '../data/materials';
import { CustomPrintQuote, MaterialOption, ColorOption } from '../types';
import { ThreeDViewer } from './ThreeDViewer';
import { parseSTL, parseOBJ, createDemoGeometry } from '../utils/stlParser';
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
  Check,
} from 'lucide-react';

export const CustomPrintUpload: React.FC = () => {
  const { addCustomQuoteToCart, formatPrice } = useStore();

  // Active 3D Geometry state (either parsed from real STL/OBJ or demo preset)
  const [uploadedGeometry, setUploadedGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('Fibonacci_Spiral_Vase_Decor.stl');
  const [uploadedFileSizeMb, setUploadedFileSizeMb] = useState<number>(15.6);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [triangleCount, setTriangleCount] = useState<number>(18420);
  const [meshPreviewType, setMeshPreviewType] = useState<'vase' | 'gear' | 'dragon' | 'cube'>('vase');

  // Base raw model dimensions before user scaling (in mm)
  const [baseDimensions, setBaseDimensions] = useState<{ x: number; y: number; z: number }>({
    x: 110,
    y: 110,
    z: 180,
  });
  const [baseVolumeCm3, setBaseVolumeCm3] = useState<number>(290);

  // Print Configuration Options
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialOption>(MATERIAL_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState<ColorOption>(COLOR_OPTIONS[0]);

  const [infillPercentage, setInfillPercentage] = useState<number>(20);
  const [layerHeightMm, setLayerHeightMm] = useState<number>(0.20);
  const [scalePercentage, setScalePercentage] = useState<number>(100);
  const [quantity, setQuantity] = useState<number>(1);

  // Initialize with the spiral vase demo geometry on mount
  useEffect(() => {
    const demo = createDemoGeometry('spiral_vase');
    setUploadedGeometry(demo.geometry);
    setBaseDimensions(demo.dimensionsMm);
    setBaseVolumeCm3(demo.volumeCm3);
    setTriangleCount(demo.geometry.getAttribute('position') ? demo.geometry.getAttribute('position').count / 3 : 15000);
  }, []);

  // Scaled dimensions based on scale percentage
  const currentX = Math.max(5, Math.round(baseDimensions.x * (scalePercentage / 100)));
  const currentY = Math.max(5, Math.round(baseDimensions.y * (scalePercentage / 100)));
  const currentZ = Math.max(5, Math.round(baseDimensions.z * (scalePercentage / 100)));

  // Scaled volume (cubic scaling)
  const scaleCube = Math.pow(scalePercentage / 100, 3);
  const volumeCm3 = Math.max(1, Math.round(baseVolumeCm3 * scaleCube));

  // Volumetric weight & machine slice time calculations
  const weightGrams = Math.max(
    10,
    Math.round(volumeCm3 * 1.24 * (infillPercentage / 100 + 0.18))
  );
  const estimatedHours = Number(
    Math.max(0.5, volumeCm3 * 0.11 * (0.20 / layerHeightMm)).toFixed(1)
  );

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
    {
      name: 'Anime_Hero_Action_Figure.stl',
      sizeMb: 28.4,
      type: 'anime_hero' as const,
      previewType: 'dragon' as const,
    },
    {
      name: 'Japanese_Wave_Wall_Hanging.stl',
      sizeMb: 18.2,
      type: 'wave_wall' as const,
      previewType: 'cube' as const,
    },
    {
      name: 'Articulated_Flexi_Dragon_Keychain.stl',
      sizeMb: 12.5,
      type: 'flexi_dragon' as const,
      previewType: 'dragon' as const,
    },
    {
      name: 'Fibonacci_Spiral_Vase_Decor.stl',
      sizeMb: 15.6,
      type: 'spiral_vase' as const,
      previewType: 'vase' as const,
    },
  ];

  // REAL USER FILE UPLOAD HANDLER (.stl, .obj, etc.)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    const fileName = file.name;
    const fileSizeMb = Number((file.size / (1024 * 1024)).toFixed(2));
    setUploadedFileName(fileName);
    setUploadedFileSizeMb(fileSizeMb);

    const isObj = fileName.toLowerCase().endsWith('.obj');

    const reader = new FileReader();

    if (isObj) {
      reader.readAsText(file);
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const parsed = parseOBJ(text);
          setUploadedGeometry(parsed.geometry);
          setBaseDimensions(parsed.dimensionsMm);
          setBaseVolumeCm3(parsed.volumeCm3);
          setTriangleCount(parsed.triangleCount);
          setMeshPreviewType('vase');
          setIsAnalyzing(false);
        } catch (err) {
          console.error('OBJ parsing error:', err);
          setAnalysisError('Could not parse OBJ mesh. Loading fallback CAD representation.');
          const fallback = createDemoGeometry('spiral_vase');
          setUploadedGeometry(fallback.geometry);
          setIsAnalyzing(false);
        }
      };
    } else {
      // Default: Read as ArrayBuffer for Binary or ASCII STL
      reader.readAsArrayBuffer(file);
      reader.onload = (event) => {
        try {
          const buffer = event.target?.result as ArrayBuffer;
          const parsed = parseSTL(buffer);
          setUploadedGeometry(parsed.geometry);
          setBaseDimensions(parsed.dimensionsMm);
          setBaseVolumeCm3(parsed.volumeCm3);
          setTriangleCount(parsed.triangleCount);
          setMeshPreviewType('vase');
          setIsAnalyzing(false);
        } catch (err) {
          console.error('STL parsing error:', err);
          setAnalysisError('Could not parse STL binary. Loading fallback CAD representation.');
          const fallback = createDemoGeometry('spiral_vase');
          setUploadedGeometry(fallback.geometry);
          setIsAnalyzing(false);
        }
      };
    }

    reader.onerror = () => {
      setAnalysisError('Failed to read file from disk.');
      setIsAnalyzing(false);
    };
  };

  const handleSelectDemo = (demo: typeof demoFiles[0]) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setUploadedFileName(demo.name);
    setUploadedFileSizeMb(demo.sizeMb);
    setMeshPreviewType(demo.previewType);

    setTimeout(() => {
      const parsed = createDemoGeometry(demo.type);
      setUploadedGeometry(parsed.geometry);
      setBaseDimensions(parsed.dimensionsMm);
      setBaseVolumeCm3(parsed.volumeCm3);
      setTriangleCount(
        parsed.geometry.getAttribute('position')
          ? parsed.geometry.getAttribute('position').count / 3
          : 12000
      );
      setIsAnalyzing(false);
    }, 300);
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
    <div className="bg-[#FAF9F6] min-h-screen font-sans py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title Banner */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 bg-[#5A5A40]/10 text-[#3F3F2C] border border-[#5A5A40]/30 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
            <UploadCloud className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Instant Slicing & Real-Time 3D Mesh Render</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#2C2C2C]">
            Custom 3D Print Slicer
          </h1>
          <p className="text-xs sm:text-sm text-[#5C5F56]">
            Upload your STL or OBJ files for real-time 3D volumetric slicing, material selection, precision CAD scaling, and automated local print hub dispatch.
          </p>
        </div>

        {/* MAIN WORKSPACE GRID: Left Upload & 3D Canvas / Right Slicing Controls & Quote */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: File Drop Zone + 3D Canvas Slicer */}
          <div className="lg:col-span-7 space-y-6">
            {/* File Drag & Drop Zone */}
            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-[#D1CFB9] hover:border-[#5A5A40] transition-colors shadow-xs relative group cursor-pointer">
              <input
                type="file"
                accept=".stl,.obj,.3mf,.step"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center text-center space-y-3 pointer-events-none">
                <div className="w-14 h-14 rounded-2xl bg-[#F2F0EA] text-[#5A5A40] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <p className="font-bold text-[#2C2C2C] text-sm">
                    Drag & Drop your 3D CAD model file here, or browse
                  </p>
                  <p className="text-xs text-[#8E9299] mt-1">
                    Supports <span className="font-mono font-bold text-[#2C2C2C]">.STL (Binary & ASCII), .OBJ</span> up to 150MB
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Demo Models selector if user doesn't have an STL handy */}
            <div className="bg-white p-4 rounded-xl border border-[#E5E2D9] space-y-2">
              <p className="text-xs font-bold text-[#2C2C2C] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Or Select a Demo 3D Model File To Test Instant Slicing:</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {demoFiles.map((demo) => (
                  <button
                    key={demo.name}
                    type="button"
                    onClick={() => handleSelectDemo(demo)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      uploadedFileName === demo.name
                        ? 'border-[#5A5A40] bg-[#F2F0EA] font-bold text-[#2C2C2C] ring-2 ring-[#5A5A40]/20'
                        : 'border-[#E5E2D9] hover:border-[#5A5A40]/50 bg-white text-[#4A4A4A]'
                    }`}
                  >
                    <p className="truncate text-[11px] font-mono font-semibold">{demo.name.replace('.stl', '')}</p>
                    <p className="text-[10px] text-[#8E9299] font-mono mt-0.5">{demo.sizeMb} MB</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive 3D Canvas Preview of Uploaded Model */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#2C2C2C]">
                <span className="font-bold flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-[#5A5A40]" />
                  <span>3D Model: <strong className="font-mono text-[#5A5A40]">{uploadedFileName}</strong></span>
                </span>
                <span className="font-mono text-[#8E9299]">
                  {uploadedFileSizeMb > 0 && `${uploadedFileSizeMb} MB • `}
                  {triangleCount.toLocaleString()} Triangles
                </span>
              </div>

              {analysisError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{analysisError}</span>
                </div>
              )}

              {isAnalyzing ? (
                <div className="h-96 bg-white rounded-2xl border border-[#E5E2D9] flex flex-col items-center justify-center space-y-3">
                  <div className="w-10 h-10 border-4 border-[#5A5A40] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-mono text-[#5A5A40]">Parsing 3D CAD Mesh & Calculating Geometry Normals...</p>
                </div>
              ) : (
                <ThreeDViewer
                  uploadedGeometry={uploadedGeometry}
                  scalePercentage={scalePercentage}
                  colorHex={selectedColor.hex}
                  materialFinish={selectedMaterial.name}
                  height="h-96"
                  customDimensions={{ x: currentX, y: currentY, z: currentZ }}
                  modelTitle={uploadedFileName}
                />
              )}
            </div>

            {/* Sliced Mesh Geometry Telemetry */}
            <div className="grid grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-[#E5E2D9] text-center font-mono text-xs shadow-xs">
              <div>
                <span className="text-[10px] text-[#8E9299] block">Bounding X×Y×Z</span>
                <span className="font-bold text-[#2C2C2C]">{currentX}×{currentY}×{currentZ} mm</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8E9299] block">Mesh Volume</span>
                <span className="font-bold text-[#2C2C2C]">{volumeCm3} cm³</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8E9299] block">Est. Weight</span>
                <span className="font-bold text-[#2C2C2C]">{weightGrams} g</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8E9299] block">Print Time</span>
                <span className="font-bold text-[#2C2C2C]">{estimatedHours} hrs</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Print Slicing Parameters & Dynamic Price Quote */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E5E2D9] shadow-xs space-y-6">
            <div className="border-b border-[#E5E2D9] pb-4">
              <h2 className="font-serif text-xl font-bold text-[#2C2C2C]">Configure Print Slicing Specs</h2>
              <p className="text-xs text-[#8E9299]">Adjust polymer material, infill density, layer height, and uniform CAD scale factor.</p>
            </div>

            {/* 1. Material Choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2C2C2C] block">Select Polymer Filament Material</label>
              <div className="grid grid-cols-2 gap-2">
                {MATERIAL_OPTIONS.map((mat) => (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => setSelectedMaterial(mat)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      selectedMaterial.id === mat.id
                        ? 'border-[#5A5A40] bg-[#F2F0EA] font-bold text-[#2C2C2C] ring-1 ring-[#5A5A40]'
                        : 'border-[#E5E2D9] hover:border-[#5A5A40]/50 text-[#4A4A4A]'
                    }`}
                  >
                    <p className="font-bold text-[#2C2C2C]">{mat.name}</p>
                    <p className="text-[10px] text-[#8E9299]">{mat.properties.finish}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Color Choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2C2C2C] block">Color Swatch ({selectedColor.name})</label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                      selectedColor.id === c.id
                        ? 'scale-110 border-[#5A5A40] ring-2 ring-[#5A5A40]/30 shadow-xs'
                        : 'border-[#E5E2D9] hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {selectedColor.id === c.id && (
                      <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Infill Density Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#2C2C2C]">
                <span>Infill Density (%):</span>
                <span className="text-[#5A5A40] font-mono font-bold">
                  {infillPercentage}% ({infillPercentage < 25 ? 'Light Decor' : infillPercentage < 60 ? 'Rigid Functional' : 'Solid High Strength'})
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={infillPercentage}
                onChange={(e) => setInfillPercentage(Number(e.target.value))}
                className="w-full accent-[#5A5A40] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8E9299] font-mono">
                <span>10% (Light)</span>
                <span>50% (Rigid)</span>
                <span>100% (Solid)</span>
              </div>
            </div>

            {/* 4. Layer Resolution (mm) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#2C2C2C] block">Layer Height Quality</label>
              <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                {[
                  { label: '0.08mm', val: 0.08, desc: 'Ultra Fine' },
                  { label: '0.12mm', val: 0.12, desc: 'Fine Detail' },
                  { label: '0.20mm', val: 0.20, desc: 'Standard' },
                  { label: '0.28mm', val: 0.28, desc: 'Draft Speed' },
                ].map((l) => (
                  <button
                    key={l.val}
                    type="button"
                    onClick={() => setLayerHeightMm(l.val)}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      layerHeightMm === l.val
                        ? 'border-[#5A5A40] bg-[#F2F0EA] font-bold text-[#2C2C2C]'
                        : 'border-[#E5E2D9] text-[#4A4A4A] hover:border-[#5A5A40]/50'
                    }`}
                  >
                    <p>{l.label}</p>
                    <p className="text-[9px] text-[#8E9299]">{l.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Scale Percentage Factor Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[#2C2C2C]">
                <span>Uniform CAD Scale Factor:</span>
                <span className="text-[#5A5A40] font-mono font-bold">{scalePercentage}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="250"
                step="5"
                value={scalePercentage}
                onChange={(e) => setScalePercentage(Number(e.target.value))}
                className="w-full accent-[#5A5A40] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8E9299] font-mono">
                <span>30% Miniature</span>
                <span>100% 1:1 Scale</span>
                <span>250% Giant</span>
              </div>
            </div>

            {/* Quantity Selector & Quote Summary Box */}
            <div className="bg-[#2C2C2C] text-white p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#D1CFB9] font-bold">Print Quantity</span>
                <div className="flex items-center border border-[#5A5A40] rounded-lg overflow-hidden font-bold">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 hover:bg-[#3F3F2C] cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 text-[#D1CFB9]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 hover:bg-[#3F3F2C] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="border-t border-[#3F3F2C] pt-3 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[#8E9299] block font-mono">Automated Quote Total</span>
                  <span className="text-[10px] text-[#D1CFB9] font-mono">All GST & India Hub Slicing Included</span>
                </div>
                <span className="font-serif text-3xl font-bold text-[#FAF9F6]">
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full bg-[#5A5A40] hover:bg-[#6D6D4E] text-[#FAF9F6] font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5 text-[#D1CFB9]" />
                <span>Add Custom Print Job to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
