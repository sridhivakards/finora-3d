'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { formatINR } from '@/lib/utils';
import { RotateCw, Sparkles, PieChart, Layers, RefreshCw } from 'lucide-react';

export interface ExpenseCategory {
  id: string;
  name: string;
  amount: number;
  color: string;
  glowColor: string;
  transactionsCount: number;
  anomalyNote?: string;
}

export const DEFAULT_EXPENSE_DATA: ExpenseCategory[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    amount: 6200,
    color: '#06b6d4', // Cyber Cyan
    glowColor: '#22d3ee',
    transactionsCount: 14,
  },
  {
    id: 'shopping',
    name: 'Shopping & Zara',
    amount: 5600,
    color: '#8b5cf6', // Electric Violet
    glowColor: '#c084fc',
    transactionsCount: 5,
    anomalyNote: 'Zara spike ₹5,600 flagged by ML',
  },
  {
    id: 'transport',
    name: 'Commute & Fuel',
    amount: 3100,
    color: '#38bdf8', // Sky Blue
    glowColor: '#7dd3fc',
    transactionsCount: 18,
  },
  {
    id: 'bills',
    name: 'Bills & Utilities',
    amount: 2000,
    color: '#f59e0b', // Warm Amber
    glowColor: '#fbbf24',
    transactionsCount: 3,
  },
  {
    id: 'health',
    name: 'Health & Gym',
    amount: 1500,
    color: '#10b981', // Emerald
    glowColor: '#34d399',
    transactionsCount: 2,
  },
];

// Helper to create mathematical 2D Arc Sector Shape for Donut Slice
function createArcSectorShape(
  innerR: number,
  outerR: number,
  startA: number,
  endA: number,
  gapAngle = 0.04
): THREE.Shape {
  const shape = new THREE.Shape();
  const s = startA + gapAngle / 2;
  const e = endA - gapAngle / 2;
  if (e <= s) return shape;

  // 1. Move to start of outer arc
  shape.moveTo(Math.cos(s) * outerR, Math.sin(s) * outerR);

  // 2. Trace outer arc counter-clockwise to endAngle
  shape.absarc(0, 0, outerR, s, e, false);

  // 3. Radial cut line to inner arc at endAngle
  shape.lineTo(Math.cos(e) * innerR, Math.sin(e) * innerR);

  // 4. Trace inner arc clockwise back to startAngle
  shape.absarc(0, 0, innerR, e, s, true);

  // 5. Close path back to outer start
  shape.closePath();

  return shape;
}

// Single 3D Extruded Donut Ring Segment in Perfect Polar Formation
function DonutSegmentMesh({
  category,
  startAngle,
  endAngle,
  pct,
  innerRadius,
  outerRadius,
  depth,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: {
  category: ExpenseCategory;
  startAngle: number;
  endAngle: number;
  pct: number;
  innerRadius: number;
  outerRadius: number;
  depth: number;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);

  const midAngle = (startAngle + endAngle) / 2;

  // Extruded geometry for 3D beveled slice
  // CRITICAL: We translate ONLY on Z axis to keep polar coordinates centered at (0, 0, 0)!
  const geometry = useMemo(() => {
    const shape = createArcSectorShape(innerRadius, outerRadius, startAngle, endAngle, 0.04);
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: depth,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      curveSegments: 48,
    };
    const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Center Z only (depth), preserve X and Y polar orientation around origin (0, 0)!
    geom.translate(0, 0, -depth / 2);
    return geom;
  }, [innerRadius, outerRadius, startAngle, endAngle, depth]);

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  // Radial pop-out vector when hovered or selected (gentle 0.14 separation so it NEVER hides the chart)
  const active = isSelected || isHovered;
  const pushDist = active ? 0.14 : 0;
  const targetX = Math.cos(midAngle) * pushDist;
  const targetY = Math.sin(midAngle) * pushDist;
  const targetZ = active ? 0.06 : 0;

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.14);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.14);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.14);
      const targetScale = active ? 1.02 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.14);
    }
  });

  // Label position on outer perimeter of the slice
  const labelRadius = outerRadius + 0.55;
  const labelX = Math.cos(midAngle) * labelRadius;
  const labelY = Math.sin(midAngle) * labelRadius;

  return (
    <group ref={groupRef}>
      {/* 3D Curved Extruded Slice */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(true);
        }}
        onPointerOut={() => onHover(false)}
      >
        <meshPhysicalMaterial
          color={category.color}
          emissive={category.glowColor}
          emissiveIntensity={active ? 1.4 : 0.38}
          roughness={0.2}
          metalness={0.65}
          clearcoat={0.8}
          clearcoatRoughness={0.15}
          reflectivity={0.9}
        />
      </mesh>

      {/* Outer Floating Pill Label */}
      <Billboard
        position={[labelX, labelY, 0]}
        follow={true}
        lockX={false}
        lockY={false}
        lockZ={false}
      >
        <group scale={active ? 1.15 : 0.95}>
          {/* Subtle glow dot connecting to slice */}
          <mesh position={[0, -0.16, 0]}>
            <circleGeometry args={[0.04, 16]} />
            <meshBasicMaterial color={category.glowColor} />
          </mesh>

          {/* Category name */}
          <Text
            position={[0, 0.08, 0]}
            fontSize={0.13}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          >
            {category.name}
          </Text>

          {/* Amount & percentage */}
          <Text
            position={[0, -0.07, 0]}
            fontSize={0.12}
            color={category.glowColor}
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          >
            {`${formatINR(category.amount)} (${pct.toFixed(1)}%)`}
          </Text>
        </group>
      </Billboard>
    </group>
  );
}

// Sleek Holographic Center Core (Inside Donut Hole r < 1.45)
function DonutCenterCore({
  totalAmount,
  activeCategory,
  innerRadius,
  centerTitle = 'TOTAL EXPENSES',
  centerSubtitle = '₹25,000 BUDGET (ON TRACK)',
}: {
  totalAmount: number;
  activeCategory: ExpenseCategory | null;
  innerRadius: number;
  centerTitle?: string;
  centerSubtitle?: string;
}) {
  const ringRef1 = useRef<THREE.Mesh>(null!);
  const ringRef2 = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ringRef1.current) ringRef1.current.rotation.z = t * 0.35;
    if (ringRef2.current) ringRef2.current.rotation.z = -t * 0.5;
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Outer cyber ring border */}
      <mesh ref={ringRef1}>
        <ringGeometry args={[innerRadius - 0.1, innerRadius - 0.07, 64]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner counter-rotating ring border */}
      <mesh ref={ringRef2}>
        <ringGeometry args={[innerRadius - 0.22, innerRadius - 0.19, 48]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Semi-transparent dark circular glass backing plate */}
      <mesh position={[0, 0, -0.05]}>
        <circleGeometry args={[innerRadius - 0.24, 48]} />
        <meshBasicMaterial color="#070c1a" transparent opacity={0.88} />
      </mesh>

      {/* Center 3D HUD Billboard - Positioned at z=0.4 to float cleanly in front of tilted 3D ring */}
      <Billboard follow={true}>
        <group position={[0, 0, 0.4]}>
          <Text
            position={[0, 0.30, 0]}
            fontSize={0.12}
            color="#94a3b8"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          >
            {centerTitle}
          </Text>

          <Text
            position={[0, 0.02, 0]}
            fontSize={totalAmount >= 100000 ? 0.28 : 0.32}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          >
            {formatINR(totalAmount)}
          </Text>

          {centerSubtitle && (
            <Text
              position={[0, -0.24, 0]}
              fontSize={0.11}
              color="#38bdf8"
              anchorX="center"
              anchorY="middle"
              font="https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
            >
              {centerSubtitle}
            </Text>
          )}
        </group>
      </Billboard>
    </group>
  );
}

// 3D Chart Rig with Physics Rotation & Inertia
function DonutChartRig({
  categories,
  totalAmount,
  selectedId,
  hoveredId,
  onSelectCategory,
  onHoverCategory,
  dragRotation,
  innerRadius = 1.68,
  outerRadius = 2.65,
  depth = 0.48,
  centerTitle,
  centerSubtitle,
}: {
  categories: ExpenseCategory[];
  totalAmount: number;
  selectedId: string | null;
  hoveredId: string | null;
  onSelectCategory: (id: string) => void;
  onHoverCategory: (id: string | null) => void;
  dragRotation: { x: number; y: number };
  innerRadius?: number;
  outerRadius?: number;
  depth?: number;
  centerTitle?: string;
  centerSubtitle?: string;
}) {
  const chartGroupRef = useRef<THREE.Group>(null!);

  // Lerp to user's drag rotation
  useFrame(() => {
    if (chartGroupRef.current) {
      chartGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        chartGroupRef.current.rotation.x,
        dragRotation.x,
        0.12
      );
      chartGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        chartGroupRef.current.rotation.y,
        dragRotation.y,
        0.12
      );
    }
  });

  // Calculate slice angles in perfect 0 to 2*PI sequence
  let cumulativeAngle = 0;
  const segmentsWithAngles = categories.map((cat) => {
    const sliceAngle = (cat.amount / totalAmount) * Math.PI * 2;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle = endAngle;
    const pct = (cat.amount / totalAmount) * 100;
    return {
      cat,
      startAngle,
      endAngle,
      pct,
    };
  });

  const activeCategory =
    categories.find((c) => c.id === (hoveredId || selectedId)) || null;

  return (
    <group ref={chartGroupRef}>
      {/* 3D Donut Ring Segments in Circular Formation */}
      {segmentsWithAngles.map(({ cat, startAngle, endAngle, pct }) => (
        <DonutSegmentMesh
          key={cat.id}
          category={cat}
          startAngle={startAngle}
          endAngle={endAngle}
          pct={pct}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          depth={depth}
          isSelected={selectedId === cat.id}
          isHovered={hoveredId === cat.id}
          onSelect={() => onSelectCategory(cat.id)}
          onHover={(hovered) => onHoverCategory(hovered ? cat.id : null)}
        />
      ))}

      {/* Holographic Center Core Pill */}
      <DonutCenterCore
        totalAmount={totalAmount}
        activeCategory={activeCategory}
        innerRadius={innerRadius}
        centerTitle={centerTitle}
        centerSubtitle={centerSubtitle}
      />
    </group>
  );
}

export interface DonutChart3DProps {
  data?: ExpenseCategory[];
  height?: string;
  showControls?: boolean;
  className?: string;
  centerTitle?: string;
  centerSubtitle?: string;
  bottomTag?: string | null;
  sidePopupPosition?: 'right' | 'left';
  cameraDistance?: number;
  countUnit?: string;
}

export default function DonutChart3D({
  data = DEFAULT_EXPENSE_DATA,
  height = '100%',
  showControls = true,
  className = '',
  centerTitle = 'TOTAL EXPENSES',
  centerSubtitle = '₹25,000 BUDGET (ON TRACK)',
  bottomTag = '3D DONUT EXPENSE RING // DRAG TO ROTATE 360° // CLICK SEGMENT TO POP OUT',
  sidePopupPosition = 'right',
  cameraDistance = 8.4,
  countUnit = 'txs',
}: DonutChart3DProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  // Initial tilt: tilted forward ~30° for optimal 3D perspective
  const [dragRotation, setDragRotation] = useState({ x: 0.52, y: -0.25 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastInteractionTime = useRef(Date.now());

  const totalAmount = useMemo(
    () => data.reduce((sum, item) => sum + item.amount, 0),
    [data]
  );

  // 360° Drag Handler with velocity tracking
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    lastInteractionTime.current = Date.now();
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: 0, y: 0 };
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    lastInteractionTime.current = Date.now();
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    const rotDeltaX = deltaY * 0.007;
    const rotDeltaY = deltaX * 0.007;

    velocity.current = { x: rotDeltaX, y: rotDeltaY };

    setDragRotation((prev) => ({
      x: Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, prev.x + rotDeltaX)),
      y: prev.y + rotDeltaY,
    }));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    lastInteractionTime.current = Date.now();
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Scroll listener: pauses rotation whenever user scrolls, resumes after 5-6 seconds
  useEffect(() => {
    const onScroll = () => {
      lastInteractionTime.current = Date.now();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const [isHoveringBox, setIsHoveringBox] = useState(false);

  // Inertia decay and auto-spin resume:
  // When cursor is OUT of chart box (!isHoveringBox), it rotates continuously.
  // When inside, user can drag/inspect, and if idle > 5 seconds, it also resumes rotation.
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const idleTime = Date.now() - lastInteractionTime.current;

      if (!isDragging) {
        velocity.current.x *= 0.93;
        velocity.current.y *= 0.93;

        if (
          Math.abs(velocity.current.x) > 0.0001 ||
          Math.abs(velocity.current.y) > 0.0001
        ) {
          setDragRotation((prev) => ({
            x: Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, prev.x + velocity.current.x)),
            y: prev.y + velocity.current.y,
          }));
        } else if (!isHoveringBox || idleTime > 5000) {
          // Rotates continuously whenever cursor is out of the chart box, OR idle inside for >5s!
          setDragRotation((prev) => ({
            ...prev,
            y: prev.y + 0.0035,
          }));
        }
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isDragging, isHoveringBox]);

  const resetView = () => {
    setDragRotation({ x: 0.52, y: -0.25 });
    velocity.current = { x: 0, y: 0 };
    setSelectedId(null);
    lastInteractionTime.current = Date.now();
  };

  const activeCategory =
    data.find((c) => c.id === (hoveredId || selectedId)) || null;

  return (
    <div
      className={`relative w-full ${className}`}
      style={{ height }}
      onPointerEnter={() => {
        setIsHoveringBox(true);
        lastInteractionTime.current = Date.now();
      }}
      onPointerLeave={(e) => {
        handlePointerUp(e);
        setIsHoveringBox(false);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* 3D Canvas Viewport */}
      <div
        className={`w-full h-full ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } select-none`}
      >
        <Canvas
          camera={{ position: [0, 0, cameraDistance], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* Studio Lighting for clean metallic specular shine */}
          <ambientLight intensity={0.9} />
          <directionalLight position={[6, 8, 8]} intensity={2.2} color="#ffffff" />
          <directionalLight position={[-6, -4, 4]} intensity={1.2} color="#8b5cf6" />
          <pointLight position={[0, 4, 3]} intensity={1.4} color="#06b6d4" />
          <pointLight position={[0, -5, 3]} intensity={0.8} color="#f59e0b" />

          {/* 3D Donut Chart in Perfect Ring Formation */}
          <DonutChartRig
            categories={data}
            totalAmount={totalAmount}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelectCategory={(id) => {
              setSelectedId((prev) => (prev === id ? null : id));
            }}
            onHoverCategory={(id) => setHoveredId(id)}
            dragRotation={dragRotation}
            centerTitle={centerTitle}
            centerSubtitle={centerSubtitle}
          />
        </Canvas>
      </div>

      {/* Floating Category Chips Legend */}
      {showControls && (
        <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-2">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            {data.map((cat) => {
              const isSelected = selectedId === cat.id;
              const isHovered = hoveredId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId((prev) => (prev === cat.id ? null : cat.id));
                  }}
                  onMouseEnter={() => setHoveredId(cat.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-all flex items-center gap-1.5 backdrop-blur-md border ${
                    isSelected || isHovered
                      ? 'bg-slate-800/95 text-white border-cyan-400 shadow-md scale-105'
                      : 'bg-slate-900/80 text-slate-300 border-slate-700/60 hover:border-slate-500'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                  <span className="text-slate-400 font-semibold">
                    {formatINR(cat.amount)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Viewport Control Tools (Auto button removed, spins after 5-6s idle) */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetView();
              }}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition-all text-xs font-mono flex items-center gap-1.5 backdrop-blur-md shadow-lg"
              title="Reset 3D View"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Side Pop-up HUD Card when a slice is touched/clicked */}
      {activeCategory && (
        <div
          className={`absolute top-14 sm:top-16 ${
            sidePopupPosition === 'left' ? 'left-3 sm:left-5' : 'right-3 sm:right-5'
          } z-30 pointer-events-auto max-w-[210px] sm:max-w-xs animate-in fade-in duration-300`}
        >
          <div
            className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#0c142b]/95 via-[#090f20]/95 to-[#060913]/95 border shadow-2xl backdrop-blur-xl space-y-2.5 relative overflow-hidden"
            style={{
              borderColor: `${activeCategory.color}80`,
              boxShadow: `0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 20px ${activeCategory.color}35`,
            }}
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: activeCategory.color }}
            />

            {/* Header with Icon, Name & Close */}
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] shrink-0"
                  style={{ backgroundColor: activeCategory.color, color: activeCategory.color }}
                />
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                  {activeCategory.name}
                </h4>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(null);
                  setHoveredId(null);
                }}
                className="w-5 h-5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors shrink-0"
                title="Dismiss Pop-up"
              >
                ✕
              </button>
            </div>

            {/* Financial Metric */}
            <div>
              <div
                className="text-xl sm:text-2xl font-black font-mono tracking-tight"
                style={{ color: activeCategory.glowColor }}
              >
                {formatINR(activeCategory.amount)}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-300 font-mono mt-0.5 flex items-center gap-1.5">
                <span className="text-cyan-400 font-bold">
                  {totalAmount > 0
                    ? ((activeCategory.amount / totalAmount) * 100).toFixed(1)
                    : '0'}% of total
                </span>
                {activeCategory.transactionsCount !== undefined && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span>{activeCategory.transactionsCount} {countUnit}</span>
                  </>
                )}
              </div>
            </div>

            {/* Anomaly Note if present */}
            {activeCategory.anomalyNote && (
              <div className="p-2 rounded-xl bg-violet-950/70 border border-violet-500/40 text-[10px] text-violet-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>{activeCategory.anomalyNote}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Telemetry HUD */}
      {bottomTag && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none text-center z-10 w-full px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 border border-cyan-500/30 backdrop-blur-md text-[10px] sm:text-[11px] font-mono text-cyan-300 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>{bottomTag}</span>
          </div>
        </div>
      )}
    </div>
  );
}
