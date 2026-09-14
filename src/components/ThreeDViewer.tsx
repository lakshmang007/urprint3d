import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCw,
  Box,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCcw,
  Sparkles,
  Compass,
  Sun,
  Moon,
  Eye,
  Sliders,
  X,
} from 'lucide-react';

interface ThreeDViewerProps {
  geometryType?:
    | 'spiral_vase'
    | 'anime_figure'
    | 'anime_hero'
    | 'chibi'
    | 'wall_art'
    | 'wave_wall'
    | 'keychain'
    | 'dragon'
    | 'flexi_dragon'
    | 'planter'
    | 'lamp'
    | 'sculpture'
    | 'gear_clock'
    | 'custom';
  uploadedGeometry?: THREE.BufferGeometry | null;
  scalePercentage?: number;
  colorHex?: string;
  materialFinish?: string;
  wireframe?: boolean;
  className?: string;
  height?: string;
  customVolumeCm3?: number;
  customDimensions?: { x: number; y: number; z: number };
  modelTitle?: string;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({
  geometryType = 'spiral_vase',
  uploadedGeometry = null,
  scalePercentage = 100,
  colorHex = '#5A5A40',
  wireframe: initialWireframe = false,
  className = '',
  height = 'h-80',
  materialFinish = 'Matte Precision Polymer',
  customDimensions,
  modelTitle = '3D CAD Model',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const [wireframe, setWireframe] = useState(initialWireframe);
  const [isRotating, setIsRotating] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [renderMode, setRenderMode] = useState<'solid' | 'wireframe' | 'slicer'>('solid');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [environmentTheme, setEnvironmentTheme] = useState<'light' | 'dark' | 'blueprint'>('light');

  // References for Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const activeMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const gridHelperRef = useRef<THREE.PolarGridHelper | null>(null);

  // Mouse / Touch interaction state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  // Toggle Full Screen View with native API + CSS fallback
  const toggleFullscreen = () => {
    const nextState = !isFullscreen;
    setIsFullscreen(nextState);

    if (nextState) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          // Ignored if in restricted iframe sandbox; CSS fallback active
        });
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Keyboard shortcut listener (Escape to exit fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };

    const handleFsChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, [isFullscreen]);

  // Main Three.js setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isDestroyed = false;
    let animationFrameId: number;

    try {
      const width = container.clientWidth > 0 ? container.clientWidth : 480;
      const heightPx = container.clientHeight > 0 ? container.clientHeight : 380;

      // 1. Scene Setup
      const scene = new THREE.Scene();
      const bgColor =
        environmentTheme === 'dark'
          ? 0x18181b
          : environmentTheme === 'blueprint'
          ? 0x0f172a
          : 0xfcfbf9;
      scene.background = new THREE.Color(bgColor);
      sceneRef.current = scene;

      // 2. Camera Setup
      const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 1000);
      camera.position.set(0, 14, 28);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // 3. WebGL Renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, heightPx, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // 4. Lighting Rig
      const ambientLight = new THREE.AmbientLight(
        environmentTheme === 'dark' ? 0xffffff : 0xffffff,
        environmentTheme === 'dark' ? 0.7 : 0.9
      );
      scene.add(ambientLight);

      // Key light with shadow
      const dirLight1 = new THREE.DirectionalLight(0xfffaed, 1.4);
      dirLight1.position.set(16, 26, 18);
      dirLight1.castShadow = true;
      dirLight1.shadow.mapSize.width = 1024;
      dirLight1.shadow.mapSize.height = 1024;
      dirLight1.shadow.camera.near = 0.5;
      dirLight1.shadow.camera.far = 80;
      scene.add(dirLight1);

      // Rim light
      const dirLight2 = new THREE.DirectionalLight(
        environmentTheme === 'blueprint' ? 0x38bdf8 : 0xd1cfb9,
        0.85
      );
      dirLight2.position.set(-18, 14, -15);
      scene.add(dirLight2);

      // Underside bounce
      const bounceLight = new THREE.DirectionalLight(0xffffff, 0.45);
      bounceLight.position.set(0, -10, 0);
      scene.add(bounceLight);

      // 5. Studio circular ground base & grid
      const groundGeo = new THREE.CylinderGeometry(14, 14, 0.4, 48);
      const groundMat = new THREE.MeshStandardMaterial({
        color:
          environmentTheme === 'dark'
            ? 0x27272a
            : environmentTheme === 'blueprint'
            ? 0x1e293b
            : 0xeeece4,
        roughness: 0.9,
        metalness: 0.05,
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.position.y = -6.2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Radial slicer grid helper
      const gridColor =
        environmentTheme === 'blueprint' ? 0x0284c7 : 0xb8b5a8;
      const gridHelper = new THREE.PolarGridHelper(13, 8, 8, 32, gridColor, 0x71717a);
      gridHelper.position.y = -5.95;
      scene.add(gridHelper);
      gridHelperRef.current = gridHelper;

      // 6. Master Model Group
      const rootGroup = new THREE.Group();
      scene.add(rootGroup);
      rootGroupRef.current = rootGroup;

      const meshGroup = new THREE.Group();
      rootGroup.add(meshGroup);
      meshGroupRef.current = meshGroup;

      // 7. Material Setup
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        roughness: materialFinish.includes('Resin')
          ? 0.15
          : materialFinish.includes('Carbon')
          ? 0.6
          : 0.35,
        metalness: materialFinish.includes('Silk') ? 0.7 : 0.15,
        wireframe: renderMode === 'wireframe',
      });
      activeMaterialRef.current = mat;

      // 8. Build Geometry
      buildActiveModel(meshGroup, uploadedGeometry, geometryType, mat, scalePercentage);

      // 9. Animation Loop
      const animate = () => {
        if (isDestroyed) return;
        animationFrameId = requestAnimationFrame(animate);

        if (rootGroupRef.current && isRotating && !isDraggingRef.current) {
          rootGroupRef.current.rotation.y += 0.008;
        }

        renderer.render(scene, camera);
      };
      animate();

      // 10. Mouse/Touch Orbit Handlers
      const handleMouseDown = (e: MouseEvent) => {
        isDraggingRef.current = true;
        prevMousePosRef.current = { x: e.clientX, y: e.clientY };
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current || !rootGroupRef.current) return;
        const deltaX = e.clientX - prevMousePosRef.current.x;
        const deltaY = e.clientY - prevMousePosRef.current.y;

        rootGroupRef.current.rotation.y += deltaX * 0.01;
        rootGroupRef.current.rotation.x = Math.max(
          -0.5,
          Math.min(0.7, rootGroupRef.current.rotation.x + deltaY * 0.008)
        );

        prevMousePosRef.current = { x: e.clientX, y: e.clientY };
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
      };

      // Touch handlers for mobile / tablet gestures
      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          isDraggingRef.current = true;
          prevMousePosRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
          };
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (!isDraggingRef.current || !rootGroupRef.current || e.touches.length !== 1) return;
        const deltaX = e.touches[0].clientX - prevMousePosRef.current.x;
        const deltaY = e.touches[0].clientY - prevMousePosRef.current.y;

        rootGroupRef.current.rotation.y += deltaX * 0.012;
        rootGroupRef.current.rotation.x = Math.max(
          -0.5,
          Math.min(0.7, rootGroupRef.current.rotation.x + deltaY * 0.009)
        );

        prevMousePosRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      };

      const handleTouchEnd = () => {
        isDraggingRef.current = false;
      };

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        if (!cameraRef.current) return;
        const newZ = cameraRef.current.position.z + e.deltaY * 0.03;
        cameraRef.current.position.z = Math.max(10, Math.min(60, newZ));
      };

      const domElement = renderer.domElement;
      domElement.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      domElement.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleTouchEnd);
      domElement.addEventListener('wheel', handleWheel, { passive: false });

      // Resize observer
      const resizeObserver = new ResizeObserver((entries) => {
        if (isDestroyed || !renderer || !camera) return;
        for (const entry of entries) {
          const newW = entry.contentRect.width;
          const newH = entry.contentRect.height || 380;
          if (newW > 0 && newH > 0) {
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH, false);
          }
        }
      });
      resizeObserver.observe(container);

      return () => {
        isDestroyed = true;
        cancelAnimationFrame(animationFrameId);
        resizeObserver.disconnect();
        domElement.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        domElement.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
        domElement.removeEventListener('wheel', handleWheel);
        renderer.dispose();
      };
    } catch (err) {
      console.warn('3D Viewer Initialization notice:', err);
    }
  }, [geometryType, uploadedGeometry, environmentTheme]);

  // Update Material Color / Finish dynamically
  useEffect(() => {
    if (activeMaterialRef.current) {
      activeMaterialRef.current.color.set(colorHex);
      activeMaterialRef.current.wireframe = renderMode === 'wireframe';
      activeMaterialRef.current.roughness = materialFinish.includes('Resin')
        ? 0.15
        : 0.35;
      activeMaterialRef.current.metalness = materialFinish.includes('Silk')
        ? 0.7
        : 0.15;
    }
  }, [colorHex, renderMode, materialFinish]);

  // Update Scale dynamically
  useEffect(() => {
    if (meshGroupRef.current) {
      const s = scalePercentage / 100;
      meshGroupRef.current.scale.set(s, s, s);
    }
  }, [scalePercentage]);

  // Preset Camera Angles
  const setCameraView = (view: 'iso' | 'front' | 'top' | 'side') => {
    if (!cameraRef.current || !rootGroupRef.current) return;
    rootGroupRef.current.rotation.set(0, 0, 0);

    switch (view) {
      case 'front':
        cameraRef.current.position.set(0, 2, 28);
        break;
      case 'top':
        cameraRef.current.position.set(0, 32, 0.1);
        break;
      case 'side':
        cameraRef.current.position.set(28, 2, 0);
        break;
      case 'iso':
      default:
        cameraRef.current.position.set(0, 14, 28);
        break;
    }
    cameraRef.current.lookAt(0, 0, 0);
  };

  const handleResetCamera = () => {
    setCameraView('iso');
  };

  const handleZoom = (delta: number) => {
    if (cameraRef.current) {
      const newZ = cameraRef.current.position.z + delta;
      cameraRef.current.position.z = Math.max(10, Math.min(60, newZ));
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-[9999] w-screen h-screen m-0 rounded-none bg-[#141517] flex flex-col'
          : `bg-[#FAF9F6] rounded-2xl overflow-hidden border border-[#E5E2D9] ${className} ${height}`
      }`}
    >
      {/* FULLSCREEN HEADER BAR */}
      {isFullscreen && (
        <div className="bg-[#1F2023]/95 backdrop-blur-md border-b border-[#2E3035] px-6 py-3.5 flex items-center justify-between z-30 text-white shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#5A5A40] flex items-center justify-center text-[#FAF9F6] shadow-xs">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold text-white tracking-wide">
                  {modelTitle}
                </h3>
                <span className="bg-[#5A5A40]/30 text-[#D1CFB9] border border-[#5A5A40]/50 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold">
                  3D Inspection Studio
                </span>
              </div>
              {customDimensions && (
                <p className="text-xs text-stone-400 font-mono">
                  Bounding Box: {customDimensions.x} × {customDimensions.y} × {customDimensions.z} mm • Scale: {scalePercentage}%
                </p>
              )}
            </div>
          </div>

          {/* Quick Preset Views in Fullscreen */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-[#28292E] p-1 rounded-xl border border-[#3A3C42] text-xs font-mono">
              <span className="px-2 text-stone-400 flex items-center gap-1 text-[11px]">
                <Compass className="w-3.5 h-3.5 text-[#D1CFB9]" /> View:
              </span>
              <button
                type="button"
                onClick={() => setCameraView('iso')}
                className="px-2.5 py-1 rounded-lg hover:bg-[#383A42] text-stone-200 transition-colors cursor-pointer"
              >
                Isometric
              </button>
              <button
                type="button"
                onClick={() => setCameraView('front')}
                className="px-2.5 py-1 rounded-lg hover:bg-[#383A42] text-stone-200 transition-colors cursor-pointer"
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => setCameraView('side')}
                className="px-2.5 py-1 rounded-lg hover:bg-[#383A42] text-stone-200 transition-colors cursor-pointer"
              >
                Side
              </button>
              <button
                type="button"
                onClick={() => setCameraView('top')}
                className="px-2.5 py-1 rounded-lg hover:bg-[#383A42] text-stone-200 transition-colors cursor-pointer"
              >
                Top
              </button>
            </div>

            {/* Studio Environment Switcher */}
            <div className="flex items-center bg-[#28292E] p-1 rounded-xl border border-[#3A3C42]">
              <button
                type="button"
                onClick={() => setEnvironmentTheme('light')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  environmentTheme === 'light'
                    ? 'bg-[#5A5A40] text-white'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="Studio Light Environment"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setEnvironmentTheme('dark')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  environmentTheme === 'dark'
                    ? 'bg-[#5A5A40] text-white'
                    : 'text-stone-400 hover:text-white'
                }`}
                title="Dark Industrial Forge"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>

            {/* Exit Full Screen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex items-center gap-1.5 bg-[#5A5A40] hover:bg-[#6D6D4E] text-[#FAF9F6] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ml-2"
            >
              <Minimize2 className="w-4 h-4 text-[#D1CFB9]" />
              <span>Exit Fullscreen</span>
              <kbd className="hidden md:inline bg-black/30 text-[10px] px-1.5 py-0.5 rounded font-mono font-normal">
                ESC
              </kbd>
            </button>
          </div>
        </div>
      )}

      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className={`w-full cursor-grab active:cursor-grabbing ${
          isFullscreen ? 'flex-1 h-full' : 'h-full'
        }`}
      />

      {/* FLOATING TOP-RIGHT CONTROLS (Always accessible) */}
      <div
        className={`absolute flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border shadow-xs text-xs font-semibold z-20 ${
          isFullscreen
            ? 'top-20 right-6 bg-[#28292E]/90 border-[#3A3C42] text-stone-200 backdrop-blur-md'
            : 'top-3 right-3 bg-white/90 border-[#E5E2D9] text-[#4A4A4A] backdrop-blur-md'
        }`}
      >
        {/* Wireframe / Solid Mode */}
        <button
          type="button"
          onClick={() => setRenderMode(renderMode === 'solid' ? 'wireframe' : 'solid')}
          className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
            renderMode === 'wireframe'
              ? 'bg-[#2C2C2C] text-[#FAF9F6]'
              : 'hover:bg-[#F2F0EA] text-[#2C2C2C]'
          }`}
          title="Toggle Wireframe Mesh"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{renderMode === 'wireframe' ? 'Wireframe' : 'Solid'}</span>
        </button>

        <span className="text-[#8E9299]/40">|</span>

        {/* Auto Rotation */}
        <button
          type="button"
          onClick={() => setIsRotating(!isRotating)}
          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
            isRotating
              ? 'text-[#5A5A40] bg-[#F2F0EA]'
              : 'text-stone-400 hover:text-stone-700'
          }`}
          title="Toggle 360° Turntable Rotation"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={() => handleZoom(-4)}
          className="p-1.5 rounded-full hover:bg-[#F2F0EA] text-stone-600 transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={() => handleZoom(4)}
          className="p-1.5 rounded-full hover:bg-[#F2F0EA] text-stone-600 transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Reset Camera */}
        <button
          type="button"
          onClick={handleResetCamera}
          className="p-1.5 rounded-full hover:bg-[#F2F0EA] text-stone-600 transition-colors cursor-pointer"
          title="Reset Camera Angle"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
        </button>

        <span className="text-[#8E9299]/40">|</span>

        {/* FULLSCREEN TOGGLE BUTTON */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 rounded-full bg-[#5A5A40] text-[#FAF9F6] hover:bg-[#6D6D4E] transition-colors cursor-pointer shadow-xs flex items-center gap-1 px-2"
          title={isFullscreen ? 'Exit Full Screen' : 'Expand to Full Screen View'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-[#D1CFB9]" />
              <span className="text-[10px] font-bold">Exit</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-[#D1CFB9]" />
              <span className="text-[10px] font-bold">Full Screen</span>
            </>
          )}
        </button>
      </div>

      {/* BOTTOM FLOATING INFO OVERLAYS */}
      <div
        className={`absolute flex items-center gap-2 pointer-events-none z-20 ${
          isFullscreen ? 'bottom-6 left-6' : 'bottom-3 left-3'
        }`}
      >
        <div
          className={`backdrop-blur-md px-3.5 py-1.5 rounded-full border text-[11px] font-mono flex items-center gap-2 shadow-xs ${
            isFullscreen
              ? 'bg-[#28292E]/95 border-[#3A3C42] text-white'
              : 'bg-white/95 border-[#E5E2D9] text-[#2C2C2C]'
          }`}
        >
          <span
            className="w-3 h-3 rounded-full shadow-xs border border-white/20"
            style={{ backgroundColor: colorHex }}
          />
          <span className="font-semibold">{materialFinish.split(' ')[0]}</span>
          <span className="text-stone-400">|</span>
          <span>0.08mm Resolution</span>
        </div>
      </div>

      {customDimensions && (
        <div
          className={`absolute pointer-events-none z-20 ${
            isFullscreen ? 'bottom-6 right-6' : 'bottom-3 right-3'
          }`}
        >
          <div
            className={`backdrop-blur-md px-3.5 py-1.5 rounded-xl text-[11px] font-mono shadow-xs border ${
              isFullscreen
                ? 'bg-[#28292E]/95 border-[#3A3C42] text-[#FAF9F6]'
                : 'bg-[#2C2C2C]/90 border-black text-white'
            }`}
          >
            <span>
              {customDimensions.x} × {customDimensions.y} × {customDimensions.z} mm
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

function buildActiveModel(
  group: THREE.Group,
  uploadedGeometry: THREE.BufferGeometry | null,
  geometryType: string,
  mat: THREE.MeshStandardMaterial,
  scalePercentage: number
) {
  // Clear previous children
  while (group.children.length > 0) {
    group.remove(group.children[0]);
  }

  if (uploadedGeometry) {
    // Clone and prepare uploaded geometry
    const geo = uploadedGeometry.clone();
    geo.computeBoundingBox();
    geo.computeVertexNormals();

    const bbox = geo.boundingBox || new THREE.Box3();
    geo.center(); // Center at (0, 0, 0)

    const size = new THREE.Vector3();
    bbox.getSize(size);

    // Max visual dimension on 3D plate ~11 units
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const fitScale = 11 / maxDim;
    geo.scale(fitScale, fitScale, fitScale);
    geo.computeBoundingBox();

    const newBbox = geo.boundingBox!;
    const bottomY = newBbox.min.y;

    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // Align bottom exactly with print bed at y = -5.9
    mesh.position.y = -5.9 - bottomY;

    group.add(mesh);

    const s = scalePercentage / 100;
    group.scale.set(s, s, s);
    return;
  }

  // Fallback Procedural Geometries when no uploaded CAD file is active
  switch (geometryType) {
    case 'anime_figure':
    case 'anime_hero': {
      const figureGroup = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 6, 1.2, 32), mat);
      base.position.y = -5.4;
      base.castShadow = true;
      figureGroup.add(base);

      const torso = new THREE.Mesh(new THREE.ConeGeometry(2.4, 4.2, 16), mat);
      torso.position.y = 0.2;
      torso.rotation.x = Math.PI;
      torso.castShadow = true;
      figureGroup.add(torso);

      const head = new THREE.Mesh(new THREE.SphereGeometry(1.4, 24, 20), mat);
      head.position.y = 2.8;
      head.castShadow = true;
      figureGroup.add(head);

      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 9.0, 0.5), mat);
      blade.position.set(2.6, 1.2, 1.2);
      blade.rotation.z = -0.4;
      figureGroup.add(blade);
      group.add(figureGroup);
      break;
    }

    case 'dragon':
    case 'flexi_dragon': {
      const dragonGeo = new THREE.TorusKnotGeometry(4.2, 1.2, 128, 24, 2, 5);
      const dragonMesh = new THREE.Mesh(dragonGeo, mat);
      dragonMesh.position.y = -0.5;
      dragonMesh.castShadow = true;
      group.add(dragonMesh);
      break;
    }

    case 'wall_art':
    case 'wave_wall': {
      const waveGeo = new THREE.PlaneGeometry(16, 12, 40, 30);
      const pos = waveGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const v = pos.getY(i);
        const z = Math.sin(u * 0.5) * Math.cos(v * 0.6) * 1.8 + Math.sin(u * 0.9) * 0.8;
        pos.setZ(i, z);
      }
      waveGeo.computeVertexNormals();
      const waveMesh = new THREE.Mesh(waveGeo, mat);
      waveMesh.rotation.x = -Math.PI / 4;
      waveMesh.position.y = 0;
      waveMesh.castShadow = true;
      group.add(waveMesh);
      break;
    }

    case 'spiral_vase':
    default: {
      const points: THREE.Vector2[] = [];
      for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const y = (t - 0.5) * 12;
        const radius = 2.8 + Math.sin(t * Math.PI * 2.5) * 1.6 + Math.cos(t * Math.PI * 4) * 0.3;
        points.push(new THREE.Vector2(radius, y));
      }
      const vaseGeo = new THREE.LatheGeometry(points, 48);
      const vaseMesh = new THREE.Mesh(vaseGeo, mat);
      vaseMesh.position.y = 0;
      vaseMesh.castShadow = true;
      group.add(vaseMesh);
      break;
    }
  }

  const s = scalePercentage / 100;
  group.scale.set(s, s, s);
}
