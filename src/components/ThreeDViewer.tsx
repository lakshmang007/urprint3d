import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCw,
  Box,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCcw,
  Sparkles,
} from 'lucide-react';

interface ThreeDViewerProps {
  geometryType?:
    | 'spiral_vase'
    | 'anime_figure'
    | 'chibi'
    | 'wall_art'
    | 'keychain'
    | 'dragon'
    | 'planter'
    | 'lamp'
    | 'sculpture'
    | 'gear_clock'
    | 'custom';
  colorHex?: string;
  materialFinish?: string;
  wireframe?: boolean;
  className?: string;
  height?: string;
  customVolumeCm3?: number;
  customDimensions?: { x: number; y: number; z: number };
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({
  geometryType = 'spiral_vase',
  colorHex = '#5A5A40',
  wireframe: initialWireframe = false,
  className = '',
  height = 'h-80',
  materialFinish = 'Matte Precision Polymer',
  customDimensions,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState(initialWireframe);
  const [isRotating, setIsRotating] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [hasError, setHasError] = useState(false);

  // References for dynamic updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isDestroyed = false;
    let animationFrameId: number;

    try {
      const width = container.clientWidth > 0 ? container.clientWidth : 420;
      const heightPx = container.clientHeight > 0 ? container.clientHeight : 340;

      // 1. Scene setup with studio aesthetic
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xfbfaf7);
      sceneRef.current = scene;

      // 2. Camera setup
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

      // Clear previous DOM children safely
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // 4. Lighting Rig
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambientLight);

      // Key light with shadow
      const dirLight1 = new THREE.DirectionalLight(0xfffaed, 1.4);
      dirLight1.position.set(15, 25, 18);
      dirLight1.castShadow = true;
      dirLight1.shadow.mapSize.width = 1024;
      dirLight1.shadow.mapSize.height = 1024;
      dirLight1.shadow.camera.near = 0.5;
      dirLight1.shadow.camera.far = 80;
      scene.add(dirLight1);

      // Rim light for clean silhouette highlights
      const dirLight2 = new THREE.DirectionalLight(0xd1cfb9, 0.9);
      dirLight2.position.set(-18, 12, -15);
      scene.add(dirLight2);

      // Soft underside bounce light
      const bounceLight = new THREE.DirectionalLight(0xffffff, 0.4);
      bounceLight.position.set(0, -10, 0);
      scene.add(bounceLight);

      // 5. Studio circular ground base & grid
      const groundGeo = new THREE.CylinderGeometry(14, 14, 0.4, 48);
      const groundMat = new THREE.MeshStandardMaterial({
        color: 0xeeece4,
        roughness: 0.9,
        metalness: 0.1,
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.position.y = -6.2;
      ground.receiveShadow = true;
      scene.add(ground);

      // Radial slicer grid helper
      const gridHelper = new THREE.PolarGridHelper(13, 8, 8, 32, 0xb8b5a8, 0xd8d5c8);
      gridHelper.position.y = -5.95;
      scene.add(gridHelper);

      // 6. Build Compound 3D Procedural Geometries
      const modelGroup = new THREE.Group();
      scene.add(modelGroup);
      rootGroupRef.current = modelGroup;

      const activeMaterials: THREE.MeshStandardMaterial[] = [];

      const createStdMaterial = (hex: string, rough = 0.35, metal = 0.15) => {
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(hex),
          roughness: rough,
          metalness: metal,
          wireframe: wireframe,
        });
        activeMaterials.push(mat);
        return mat;
      };

      const primaryMat = createStdMaterial(colorHex, 0.3, 0.2);
      const accentMat = createStdMaterial('#2C2C2C', 0.4, 0.1);
      const metallicMat = createStdMaterial('#C8B568', 0.25, 0.7);

      materialsRef.current = activeMaterials;

      switch (geometryType) {
        case 'anime_figure': {
          // --- ANIME ACTION FIGURE COMPOUND MODEL ---
          // Base Pedestal
          const base = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 6, 1.2, 32), accentMat);
          base.position.y = -5.4;
          base.castShadow = true;
          base.receiveShadow = true;
          modelGroup.add(base);

          // Boots / Lower Legs
          const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 4.5, 12), primaryMat);
          leftLeg.position.set(-1.4, -2.6, 0.2);
          leftLeg.rotation.z = 0.12;
          leftLeg.castShadow = true;
          modelGroup.add(leftLeg);

          const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 4.5, 12), primaryMat);
          rightLeg.position.set(1.4, -2.6, -0.2);
          rightLeg.rotation.z = -0.12;
          rightLeg.castShadow = true;
          modelGroup.add(rightLeg);

          // Armored Torso / Robes
          const torso = new THREE.Mesh(new THREE.ConeGeometry(2.4, 4.2, 16), primaryMat);
          torso.position.y = 0.2;
          torso.rotation.x = Math.PI;
          torso.castShadow = true;
          modelGroup.add(torso);

          // Chest Armor Plate
          const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.8, 1.6), accentMat);
          chestPlate.position.set(0, 0.8, 0.3);
          chestPlate.castShadow = true;
          modelGroup.add(chestPlate);

          // Shoulder Armor Pads
          const leftPad = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 12), accentMat);
          leftPad.position.set(-2.2, 1.4, 0);
          leftPad.scale.set(1.2, 0.8, 1);
          leftPad.castShadow = true;
          modelGroup.add(leftPad);

          const rightPad = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 12), accentMat);
          rightPad.position.set(2.2, 1.4, 0);
          rightPad.scale.set(1.2, 0.8, 1);
          rightPad.castShadow = true;
          modelGroup.add(rightPad);

          // Head & Anime Face
          const head = new THREE.Mesh(new THREE.SphereGeometry(1.4, 24, 20), primaryMat);
          head.position.y = 2.8;
          head.scale.set(0.9, 1.1, 0.95);
          head.castShadow = true;
          modelGroup.add(head);

          // Spiked Hair Crest
          const hairGroup = new THREE.Group();
          for (let i = 0; i < 7; i++) {
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.2, 6), primaryMat);
            const angle = (i - 3) * 0.35;
            spike.position.set(Math.sin(angle) * 1.2, 3.8 + Math.cos(angle) * 0.6, -Math.abs(angle) * 0.3);
            spike.rotation.z = -angle * 0.8;
            spike.rotation.x = -0.3;
            hairGroup.add(spike);
          }
          modelGroup.add(hairGroup);

          // Katana Sword
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 9.0, 0.5), metallicMat);
          blade.position.set(2.6, 1.2, 1.2);
          blade.rotation.z = -0.4;
          blade.rotation.x = 0.2;
          blade.castShadow = true;
          modelGroup.add(blade);

          // Ethereal Aura Ring / Halo
          const halo = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.18, 12, 36), metallicMat);
          halo.position.set(0, 1.5, -1.0);
          halo.rotation.x = 0.4;
          modelGroup.add(halo);
          break;
        }

        case 'chibi': {
          // --- CHIBI CHARACTER STATUE ---
          // Rounded Base
          const base = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.2, 1.0, 32), accentMat);
          base.position.y = -5.4;
          base.castShadow = true;
          modelGroup.add(base);

          // Small Plump Body
          const body = new THREE.Mesh(new THREE.SphereGeometry(2.4, 24, 20), primaryMat);
          body.position.y = -2.2;
          body.scale.set(1.0, 1.2, 0.9);
          body.castShadow = true;
          modelGroup.add(body);

          // Big Cute Head (Chibi 1:1 proportion)
          const head = new THREE.Mesh(new THREE.SphereGeometry(3.6, 32, 28), primaryMat);
          head.position.y = 1.6;
          head.castShadow = true;
          modelGroup.add(head);

          // Cute Ears / Hair Buns
          const leftEar = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), accentMat);
          leftEar.position.set(-2.8, 4.4, 0);
          modelGroup.add(leftEar);

          const rightEar = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), accentMat);
          rightEar.position.set(2.8, 4.4, 0);
          modelGroup.add(rightEar);

          // Eyes
          const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), accentMat);
          leftEye.position.set(-1.1, 1.8, 3.3);
          modelGroup.add(leftEye);

          const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 12), accentMat);
          rightEye.position.set(1.1, 1.8, 3.3);
          modelGroup.add(rightEye);
          break;
        }

        case 'wall_art': {
          // --- 3D SACRED GEOMETRIC MANDALA WALL ART ---
          // Outer Beveled Frame
          const frame = new THREE.Mesh(new THREE.BoxGeometry(14, 14, 1.2), accentMat);
          frame.position.set(0, 0, 0);
          frame.castShadow = true;
          frame.receiveShadow = true;
          modelGroup.add(frame);

          // Inner Relief Canvas
          const innerCanvas = new THREE.Mesh(new THREE.BoxGeometry(12.4, 12.4, 1.4), primaryMat);
          innerCanvas.position.set(0, 0, 0.2);
          modelGroup.add(innerCanvas);

          // Multi-layer Radial Mandala Rings
          for (let layer = 1; layer <= 4; layer++) {
            const count = layer * 6;
            const radius = layer * 1.3;
            for (let i = 0; i < count; i++) {
              const angle = (i / count) * Math.PI * 2;
              const petal = new THREE.Mesh(
                new THREE.ConeGeometry(0.45 * (5 - layer) * 0.3, 1.8, 4),
                metallicMat
              );
              petal.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 1.1 + layer * 0.15);
              petal.rotation.z = angle - Math.PI / 2;
              petal.rotation.x = 0.2;
              petal.castShadow = true;
              modelGroup.add(petal);
            }
          }

          // Center Sun/Lotus Gem
          const centerGem = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), metallicMat);
          centerGem.position.set(0, 0, 1.8);
          centerGem.castShadow = true;
          modelGroup.add(centerGem);
          break;
        }

        case 'dragon': {
          // --- ARTICULATED DRAGON / WYVERN ---
          const dragonKnot = new THREE.Mesh(
            new THREE.TorusKnotGeometry(5.2, 1.6, 120, 20, 2, 3),
            primaryMat
          );
          dragonKnot.position.y = 0.5;
          dragonKnot.castShadow = true;
          dragonKnot.receiveShadow = true;
          modelGroup.add(dragonKnot);

          // Dragon Head & Horns
          const head = new THREE.Mesh(new THREE.ConeGeometry(1.8, 4.0, 8), primaryMat);
          head.position.set(0, 4.8, 3.2);
          head.rotation.x = -Math.PI / 3;
          head.castShadow = true;
          modelGroup.add(head);

          const leftHorn = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.5, 6), metallicMat);
          leftHorn.position.set(-1.2, 6.2, 2.2);
          leftHorn.rotation.z = 0.5;
          leftHorn.rotation.x = -0.4;
          modelGroup.add(leftHorn);

          const rightHorn = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.5, 6), metallicMat);
          rightHorn.position.set(1.2, 6.2, 2.2);
          rightHorn.rotation.z = -0.5;
          rightHorn.rotation.x = -0.4;
          modelGroup.add(rightHorn);
          break;
        }

        case 'keychain': {
          // --- ARTICULATED KEYCHAIN CHARM ---
          // Top Metal Key Ring Loop
          const keyRing = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.35, 16, 32), metallicMat);
          keyRing.position.set(0, 4.8, 0);
          keyRing.castShadow = true;
          modelGroup.add(keyRing);

          // Link Connector
          const link = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.8, 12), metallicMat);
          link.position.set(0, 2.8, 0);
          modelGroup.add(link);

          // Beveled Dragon Medallion Tag
          const tag = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 3.8, 0.8, 32), primaryMat);
          tag.position.set(0, -0.6, 0);
          tag.rotation.x = Math.PI / 2;
          tag.castShadow = true;
          tag.receiveShadow = true;
          modelGroup.add(tag);

          // Embossed Kanji/Dragon Crest
          const crest = new THREE.Mesh(new THREE.TorusKnotGeometry(1.6, 0.35, 48, 8, 2, 3), metallicMat);
          crest.position.set(0, -0.6, 0.5);
          crest.castShadow = true;
          modelGroup.add(crest);
          break;
        }

        case 'spiral_vase': {
          // --- TWISTED FIBONACCI SPIRAL VASE ---
          const vaseGeo = new THREE.CylinderGeometry(4.2, 6.0, 13.5, 36, 40);
          const pos = vaseGeo.attributes.position;
          for (let i = 0; i < pos.count; i++) {
            const y = pos.getY(i);
            const x = pos.getX(i);
            const z = pos.getZ(i);
            // Non-linear organic twist
            const angle = (y + 7) * 0.18;
            const radiusMod = 1.0 + Math.sin(y * 0.6) * 0.15;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            pos.setX(i, (x * cos - z * sin) * radiusMod);
            pos.setZ(i, (x * sin + z * cos) * radiusMod);
          }
          vaseGeo.computeVertexNormals();

          const vase = new THREE.Mesh(vaseGeo, primaryMat);
          vase.position.y = 0.8;
          vase.castShadow = true;
          vase.receiveShadow = true;
          modelGroup.add(vase);
          break;
        }

        case 'planter': {
          // --- GEOMETRIC HEXAGONAL FLUTED PLANTER ---
          const potGeo = new THREE.CylinderGeometry(5.8, 4.4, 9.5, 8, 6);
          const pot = new THREE.Mesh(potGeo, primaryMat);
          pot.position.y = -0.5;
          pot.castShadow = true;
          pot.receiveShadow = true;
          modelGroup.add(pot);

          // Inner Soil Rim
          const soil = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 4.0, 1.0, 16), accentMat);
          soil.position.y = 3.6;
          modelGroup.add(soil);

          // Saucer Tray
          const saucer = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 5.0, 1.2, 16), accentMat);
          saucer.position.y = -5.0;
          saucer.castShadow = true;
          modelGroup.add(saucer);
          break;
        }

        case 'lamp': {
          // --- LATTICE VORONOI SHADE WITH INTERNAL GLOW ---
          const shade = new THREE.Mesh(
            new THREE.CylinderGeometry(4.5, 5.5, 12, 24, 16, true),
            primaryMat
          );
          shade.position.y = 0.5;
          shade.castShadow = true;
          modelGroup.add(shade);

          // Internal warm glowing filament core
          const bulbGeo = new THREE.SphereGeometry(1.6, 24, 24);
          const bulbMat = new THREE.MeshStandardMaterial({
            color: 0xffe899,
            emissive: 0xffaa00,
            emissiveIntensity: 0.9,
            roughness: 0.1,
          });
          const bulb = new THREE.Mesh(bulbGeo, bulbMat);
          bulb.position.y = 0.5;
          modelGroup.add(bulb);

          // Point light emitting from inside lamp
          const lampLight = new THREE.PointLight(0xffb74d, 2.5, 20);
          lampLight.position.y = 0.5;
          modelGroup.add(lampLight);
          break;
        }

        case 'gear_clock': {
          // --- INTERLOCKING PLANETARY GEAR MECHANISM ---
          const gear1 = new THREE.Mesh(new THREE.TorusGeometry(5.5, 1.5, 16, 32), primaryMat);
          gear1.rotation.x = Math.PI / 2;
          gear1.castShadow = true;
          modelGroup.add(gear1);

          // Central Sun Gear
          const sunGear = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 2.0, 12), metallicMat);
          sunGear.castShadow = true;
          modelGroup.add(sunGear);
          break;
        }

        case 'sculpture':
        default: {
          const polyGeo = new THREE.IcosahedronGeometry(5.8, 1);
          const poly = new THREE.Mesh(polyGeo, primaryMat);
          poly.position.y = 0.5;
          poly.castShadow = true;
          poly.receiveShadow = true;
          modelGroup.add(poly);
          break;
        }
      }

      // 7. Interactive Pointer / Touch Drag
      let isDragging = false;
      let previousPosition = { x: 0, y: 0 };

      const onPointerDown = (e: PointerEvent) => {
        isDragging = true;
        previousPosition = { x: e.clientX, y: e.clientY };
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!isDragging || !rootGroupRef.current) return;
        const deltaX = e.clientX - previousPosition.x;
        const deltaY = e.clientY - previousPosition.y;

        rootGroupRef.current.rotation.y += deltaX * 0.009;
        rootGroupRef.current.rotation.x = Math.max(
          -0.6,
          Math.min(0.6, rootGroupRef.current.rotation.x + deltaY * 0.009)
        );

        previousPosition = { x: e.clientX, y: e.clientY };
      };

      const onPointerUp = () => {
        isDragging = false;
      };

      const domElement = renderer.domElement;
      domElement.style.touchAction = 'none';
      domElement.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);

      // 8. Render Animation Loop
      const animate = () => {
        if (isDestroyed) return;
        animationFrameId = requestAnimationFrame(animate);

        if (isRotating && rootGroupRef.current && !isDragging) {
          rootGroupRef.current.rotation.y += 0.008;
        }

        renderer.render(scene, camera);
      };

      animate();

      // 9. Resize Observer with Debounce and Threshold
      let resizeTimer: number | undefined;
      const handleResize = () => {
        if (isDestroyed || !container || !renderer || !camera) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (w === 0 || h === 0) return;

        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      };

      const resizeObserver = new ResizeObserver(() => {
        if (resizeTimer) window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(handleResize, 50);
      });
      resizeObserver.observe(container);

      return () => {
        isDestroyed = true;
        if (resizeTimer) window.clearTimeout(resizeTimer);
        cancelAnimationFrame(animationFrameId);

        domElement.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        resizeObserver.disconnect();

        try {
          renderer.dispose();
          scene.clear();
        } catch (e) {
          // ignore clean teardown
        }
      };
    } catch (err) {
      console.warn('Three.js 3D Viewer initialization fallback:', err);
      setHasError(true);
    }
  }, [geometryType]);

  // Update color dynamically across active materials
  useEffect(() => {
    if (materialsRef.current.length > 0 && colorHex) {
      try {
        const threeColor = new THREE.Color(colorHex);
        materialsRef.current.forEach((mat, idx) => {
          if (idx === 0) {
            mat.color.set(threeColor);
          }
        });
      } catch (e) {
        // ignore
      }
    }
  }, [colorHex]);

  // Update wireframe / layer slicing mode dynamically
  useEffect(() => {
    if (materialsRef.current.length > 0) {
      materialsRef.current.forEach((mat) => {
        mat.wireframe = wireframe;
      });
    }
  }, [wireframe]);

  // Camera Zoom Controls
  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const delta = direction === 'in' ? -3 : 3;
    const newZ = cameraRef.current.position.z + delta;
    if (newZ >= 12 && newZ <= 45) {
      cameraRef.current.position.z = newZ;
    }
  };

  const handleResetCamera = () => {
    if (!cameraRef.current || !rootGroupRef.current) return;
    cameraRef.current.position.set(0, 14, 28);
    cameraRef.current.lookAt(0, 0, 0);
    rootGroupRef.current.rotation.set(0, 0, 0);
  };

  if (hasError) {
    return (
      <div className={`relative bg-[#F7F6F2] rounded-2xl border border-[#E5E2D9] p-8 flex flex-col items-center justify-center text-center space-y-3 ${className} ${height}`}>
        <Box className="w-12 h-12 text-[#5A5A40]" />
        <h4 className="font-serif font-bold text-[#2C2C2C] text-sm">3D Slicer Mesh Ready</h4>
        <p className="text-xs text-[#8E9299] max-w-xs">
          High-precision 0.08mm layer geometry loaded with {materialFinish} specification.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative bg-[#F7F6F2] rounded-2xl border border-[#E5E2D9] overflow-hidden select-none group ${className}`}>
      {/* 3D Canvas Container */}
      <div
        ref={mountRef}
        className={`w-full ${height} cursor-grab active:cursor-grabbing`}
      />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md border border-[#E5E2D9] text-xs text-[#2C2C2C] z-10">
        {/* Layer / Wireframe Slicer Toggle */}
        <button
          type="button"
          onClick={() => setWireframe(!wireframe)}
          title="Toggle 3D Print Layer Mesh Slicer"
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
            wireframe
              ? 'bg-[#5A5A40] text-white shadow-xs'
              : 'hover:bg-[#F7F6F2] text-[#4A4A4A]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{wireframe ? 'Mesh Slices' : 'Solid Render'}</span>
        </button>

        {/* Auto-Rotation Toggle */}
        <button
          type="button"
          onClick={() => setIsRotating(!isRotating)}
          title="Toggle Auto 360° Rotation"
          className={`p-1.5 rounded-full transition-colors ${
            isRotating
              ? 'text-[#5A5A40] bg-[#F7F6F2]'
              : 'text-[#8E9299] hover:bg-[#F7F6F2]'
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
        </button>

        {/* Zoom In */}
        <button
          type="button"
          onClick={() => handleZoom('in')}
          title="Zoom In 3D Model"
          className="p-1.5 text-[#4A4A4A] hover:text-[#2C2C2C] hover:bg-[#F7F6F2] rounded-full"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={() => handleZoom('out')}
          title="Zoom Out 3D Model"
          className="p-1.5 text-[#4A4A4A] hover:text-[#2C2C2C] hover:bg-[#F7F6F2] rounded-full"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        {/* Reset Camera View */}
        <button
          type="button"
          onClick={handleResetCamera}
          title="Reset Camera Angle"
          className="p-1.5 text-[#4A4A4A] hover:text-[#2C2C2C] hover:bg-[#F7F6F2] rounded-full"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Floating Dimension & Material Indicator */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E5E2D9] shadow-xs text-[11px] font-mono text-[#2C2C2C] flex items-center gap-2 pointer-events-auto">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
            style={{ backgroundColor: colorHex }}
          />
          <span className="font-semibold">{materialFinish}</span>
          <span className="text-[#8E9299]">|</span>
          <span className="text-[#5A5A40] font-bold">0.08mm Layer Res</span>
        </div>

        {customDimensions && (
          <div className="bg-[#2C2C2C]/90 text-[#D1CFB9] backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#5A5A40]/40 shadow-xs text-[10px] font-mono pointer-events-auto hidden sm:block">
            {customDimensions.x} × {customDimensions.y} × {customDimensions.z} mm
          </div>
        )}
      </div>
    </div>
  );
};
