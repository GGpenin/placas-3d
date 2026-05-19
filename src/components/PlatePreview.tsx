import React, { useMemo, useRef, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text3D, Center, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../store';
import { createRoundedRectShape, createFrameShape } from '../utils/generatePlateGeometry';
import { generateLayout } from '../utils/layoutEngine';

const FONT_URL = 'https://unpkg.com/three@0.152.0/examples/fonts/droid/droid_sans_regular.typeface.json';
const FONT_BOLD_URL = 'https://unpkg.com/three@0.152.0/examples/fonts/droid/droid_sans_bold.typeface.json';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <Html center>
          <div className="bg-red-900/80 text-white p-4 rounded-lg backdrop-blur border border-red-500 w-80 text-center">
            <h2 className="font-bold mb-2">Erro ao renderizar 3D</h2>
            <p className="text-sm opacity-80">{this.state.error?.message || 'Erro desconhecido'}</p>
          </div>
        </Html>
      );
    }
    return this.props.children;
  }
}

function Plate() {
  const { plateConfig, plateData } = useAppStore();
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      window.plateGroup = groupRef.current;
    }
  }, [plateConfig, plateData]);

  const { width, height, thickness, borderRadius, textRelief, lineThickness, color, boxDepth } = plateConfig;

  const baseThickness = Math.max(0.1, thickness - boxDepth);

  const baseShape = useMemo(() => createRoundedRectShape(width, height, borderRadius), [width, height, borderRadius]);
  const frameShape = useMemo(() => createFrameShape(width, height, borderRadius, lineThickness), [width, height, borderRadius, lineThickness]);

  const material = useMemo(() => new THREE.MeshStandardMaterial({ 
    color, 
    roughness: 0.8, // More matte to avoid glare washing out the text
    metalness: 0.1,
  }), [color]);

  const { lines, texts } = useMemo(() => generateLayout(plateConfig, plateData), [plateConfig, plateData]);

  const textZ = baseThickness;
  const textExtrude = textRelief;

  const FieldText = ({ text, label, x, y, w, h, rotate = 0 }: { text: string, label?: string, x: number, y: number, w: number, h: number, rotate?: number }) => {
    if (!text && !label) return null;
    
    let displayText = text;
    if (plateConfig.dataTextCase === 'uppercase') {
      displayText = text.toUpperCase();
    } else if (plateConfig.dataTextCase === 'lowercase') {
      displayText = text.toLowerCase();
    }

    let displayLabel = label;
    if (label) {
      if (plateConfig.labelTextCase === 'uppercase') {
        displayLabel = label.toUpperCase();
      } else if (plateConfig.labelTextCase === 'lowercase') {
        displayLabel = label.toLowerCase();
      }
    }
    
    const dataSize = Math.max(1, plateConfig.dataTextSize || 6);
    const labelSize = Math.max(1, plateConfig.labelTextSize || 2.5);

    // Calculate available space with padding
    const paddingX = 4; // 2mm padding on each side horizontally
    const paddingY = 4; // 2mm padding top and bottom vertically
    const availableW = Math.max(0.1, w - paddingX);
    const availableH = Math.max(0.1, h - paddingY);
    
    // Estimate widths (Helvetiker is approx 0.65 * size per character)
    const estimatedLabelWidth = displayLabel ? displayLabel.length * labelSize * 0.65 : 0;
    const estimatedDataWidth = displayText ? displayText.length * dataSize * 0.65 : 0;

    let scaleLabel = displayLabel ? Math.min(1, availableW / Math.max(0.1, estimatedLabelWidth)) : 1;
    let scaleData = displayText ? Math.min(1, availableW / Math.max(0.1, estimatedDataWidth)) : 1;

    // Calculate actual physical heights given current scales
    // Text3D height is approximately 1.0 * size
    let physLabelH = displayLabel ? labelSize * scaleLabel : 0;
    let physDataH = displayText ? dataSize * scaleData : 0;

    // Minimum gap between label and data
    const gap = displayLabel && displayText ? Math.max(1, h * 0.05) : 0;
    const totalPhysH = physLabelH + gap + physDataH;

    // If total height exceeds available height, scale them down proportionally
    if (totalPhysH > availableH) {
      const reduction = availableH / totalPhysH;
      scaleLabel *= reduction;
      scaleData *= reduction;
      physLabelH *= reduction;
      physDataH *= reduction;
    }

    // Determine positions so the block is perfectly centered in the 'h' area.
    const blockH = physLabelH + gap + physDataH;
    const topOfBlockY = blockH / 2;

    const labelY = displayLabel ? topOfBlockY - (physLabelH / 2) : 0;
    const dataY = displayLabel 
      ? labelY - (physLabelH / 2) - gap - (physDataH / 2)
      : 0;

    return (
      <group position={[x, y, textZ]} rotation={[0, 0, rotate]}>
        {displayLabel && (
          <group position={[0, labelY, 0]}>
            <Center>
              <group scale={[scaleLabel, scaleLabel, 1]}>
                <Text3D font={plateConfig.labelFontWeight === 'bold' ? FONT_BOLD_URL : FONT_URL} size={labelSize} height={textExtrude} material={material}>
                  {displayLabel}
                </Text3D>
              </group>
            </Center>
          </group>
        )}
        {displayText && (
          <group position={[0, dataY, 0]}>
            <Center>
              <group scale={[scaleData, scaleData, 1]}>
                <Text3D font={plateConfig.dataFontWeight === 'regular' ? FONT_URL : FONT_BOLD_URL} size={dataSize} height={textExtrude} material={material}>
                  {displayText}
                </Text3D>
              </group>
            </Center>
          </group>
        )}
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      {/* Base Plate */}
      <mesh material={material} castShadow receiveShadow>
        <extrudeGeometry args={[baseShape, { depth: baseThickness, bevelEnabled: false }]} />
      </mesh>

      {/* Outer Frame */}
      <mesh material={material} position={[0, 0, baseThickness]} castShadow receiveShadow>
        <extrudeGeometry args={[frameShape, { depth: boxDepth, bevelEnabled: false }]} />
      </mesh>

      {/* Inner Lines */}
      {lines.map((line, i) => (
        <mesh key={i} material={material} position={[line.x, line.y, baseThickness + boxDepth / 2]} castShadow receiveShadow>
          <boxGeometry args={[line.w, line.h, boxDepth]} />
        </mesh>
      ))}

      {/* Texts */}
      {texts.map((t, i) => (
        <FieldText key={i} {...t} />
      ))}
    </group>
  );
}

export function PlatePreview() {
  return (
    <div className="absolute inset-0 bg-gray-950">
      <Canvas shadows camera={{ position: [0, 0, 150], fov: 50 }}>
        <color attach="background" args={['#111827']} />
        
        {/* Base ambient light, kept relatively low so shadows can exist */}
        <ambientLight intensity={0.4} />
        
        {/* Main key light: angled from top-left to cast strong shadows on the relief */}
        <directionalLight 
          position={[-20, 40, 30]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        
        {/* Fill light: from the opposite side to soften shadows slightly so they aren't pitch black */}
        <directionalLight 
          position={[30, -20, 20]} 
          intensity={0.5} 
        />

        {/* Rim light: from behind/side to highlight edges */}
        <directionalLight 
          position={[0, 50, -20]} 
          intensity={0.3} 
        />
        
        <Environment preset="city" environmentIntensity={0.3} />
        
        <ErrorBoundary>
          <Suspense fallback={<Html center><div className="text-white font-medium animate-pulse">Carregando modelo 3D...</div></Html>}>
            <Center>
              <Plate />
            </Center>
          </Suspense>
        </ErrorBoundary>
        
        <OrbitControls makeDefault />
        <gridHelper args={[500, 50, '#374151', '#1f2937']} position={[0, 0, -10]} rotation={[Math.PI / 2, 0, 0]} />
      </Canvas>
    </div>
  );
}
