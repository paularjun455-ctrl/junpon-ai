import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashViewProps {
  onComplete: () => void;
}

// 3D Crystal Mesh Vertices for the Iconic "J" Logo
const VERTICES = [
  // --- Section 0: Top Cap (y ≈ -45) ---
  { x: 13, y: -42.5, z: 12 },   // 0: Front Ridge
  { x: 3, y: -45, z: 4 },       // 1: Front Left
  { x: 23, y: -40, z: 4 },      // 2: Front Right
  { x: 3, y: -45, z: 0 },       // 3: Side Left
  { x: 23, y: -40, z: 0 },      // 4: Side Right
  { x: 3, y: -45, z: -4 },      // 5: Back Left
  { x: 23, y: -40, z: -4 },     // 6: Back Right
  { x: 13, y: -42.5, z: -12 },  // 7: Back Ridge

  // --- Section 1: Mid-Upper Stem (y ≈ -25) ---
  { x: 13, y: -25, z: 12 },     // 8: Front Ridge
  { x: 3, y: -25, z: 4 },       // 9: Front Left
  { x: 23, y: -22, z: 4 },      // 10: Front Right
  { x: 3, y: -25, z: 0 },       // 11: Side Left
  { x: 23, y: -22, z: 0 },      // 12: Side Right
  { x: 3, y: -25, z: -4 },      // 13: Back Left
  { x: 23, y: -22, z: -4 },     // 14: Back Right
  { x: 13, y: -25, z: -12 },    // 15: Back Ridge

  // --- Section 2: Mid-Lower Stem (y ≈ -5) ---
  { x: 13, y: -5, z: 12 },      // 16: Front Ridge
  { x: 3, y: -5, z: 4 },        // 17: Front Left
  { x: 23, y: -2, z: 4 },       // 18: Front Right
  { x: 3, y: -5, z: 0 },        // 19: Side Left
  { x: 23, y: -2, z: 0 },       // 20: Side Right
  { x: 3, y: -5, z: -4 },       // 21: Back Left
  { x: 23, y: -2, z: -4 },      // 22: Back Right
  { x: 13, y: -5, z: -12 },     // 23: Back Ridge

  // --- Section 3: Stem-Hook Junction (y ≈ 12) ---
  { x: 10, y: 12, z: 12 },      // 24: Front Ridge
  { x: 1, y: 10, z: 4 },        // 25: Front Left (Inner)
  { x: 21, y: 15, z: 4 },       // 26: Front Right (Outer)
  { x: 1, y: 10, z: 0 },        // 27: Side Left (Inner)
  { x: 21, y: 15, z: 0 },       // 28: Side Right (Outer)
  { x: 1, y: 10, z: -4 },       // 29: Back Left (Inner)
  { x: 21, y: 15, z: -4 },      // 30: Back Right (Outer)
  { x: 10, y: 12, z: -12 },     // 31: Back Ridge

  // --- Section 4: Bottom Turn (y ≈ 32) ---
  { x: -2, y: 30, z: 12 },      // 32: Front Ridge
  { x: -8, y: 20, z: 4 },       // 33: Front Inner-Left
  { x: 11, y: 32, z: 4 },       // 34: Front Outer-Right
  { x: -8, y: 20, z: 0 },       // 35: Side Inner-Left
  { x: 11, y: 32, z: 0 },       // 36: Side Outer-Right
  { x: -8, y: 20, z: -4 },      // 37: Back Inner-Left
  { x: 11, y: 32, z: -4 },      // 38: Back Outer-Right
  { x: -2, y: 30, z: -12 },     // 39: Back Ridge

  // --- Section 5: Hook Mid-Up (y ≈ 20) ---
  { x: -18, y: 18, z: 12 },     // 40: Front Ridge
  { x: -10, y: 12, z: 4 },      // 41: Front Inner-Right
  { x: -24, y: 22, z: 4 },      // 42: Front Outer-Left
  { x: -10, y: 12, z: 0 },      // 43: Side Inner-Right
  { x: -24, y: 22, z: 0 },      // 44: Side Outer-Left
  { x: -10, y: 12, z: -4 },     // 45: Back Inner-Right
  { x: -24, y: 22, z: -4 },     // 46: Back Outer-Left
  { x: -18, y: 18, z: -12 },    // 47: Back Ridge

  // --- Section 6: Hook Tip (y ≈ 3) ---
  { x: -30, y: 1, z: 10 },      // 48: Front Ridge
  { x: -18, y: 8, z: 4 },       // 49: Front Inner
  { x: -33, y: -2, z: 4 },      // 50: Front Outer
  { x: -18, y: 8, z: 0 },       // 51: Side Inner
  { x: -33, y: -2, z: 0 },      // 52: Side Outer
  { x: -18, y: 8, z: -4 },      // 53: Back Inner
  { x: -33, y: -2, z: -4 },     // 54: Back Outer
  { x: -30, y: 1, z: -10 },     // 55: Back Ridge
];

// Facet definitions for drawing the 3D crystal J with beautiful lighting and coloring
const FACETS = [
  // --- Section 0 to Section 1 (Upper Stem) ---
  { indices: [1, 9, 8], type: 'front', color: 'purple' },
  { indices: [1, 8, 0], type: 'front', color: 'purple' },
  { indices: [0, 8, 10], type: 'front', color: 'purple' },
  { indices: [0, 10, 2], type: 'front', color: 'purple' },
  { indices: [5, 13, 15], type: 'back', color: 'purple' },
  { indices: [5, 15, 7], type: 'back', color: 'purple' },
  { indices: [7, 15, 14], type: 'back', color: 'purple' },
  { indices: [7, 14, 6], type: 'back', color: 'purple' },
  // Side Transitions
  { indices: [1, 3, 11], type: 'left', color: 'purple' },
  { indices: [1, 11, 9], type: 'left', color: 'purple' },
  { indices: [3, 5, 13], type: 'left', color: 'purple' },
  { indices: [3, 13, 11], type: 'left', color: 'purple' },
  { indices: [2, 4, 12], type: 'right', color: 'purple' },
  { indices: [2, 12, 10], type: 'right', color: 'purple' },
  { indices: [4, 6, 14], type: 'right', color: 'purple' },
  { indices: [4, 14, 12], type: 'right', color: 'purple' },

  // --- Section 1 to Section 2 (Mid Stem) ---
  { indices: [9, 17, 16], type: 'front', color: 'purple' },
  { indices: [9, 16, 8], type: 'front', color: 'purple' },
  { indices: [8, 16, 18], type: 'front', color: 'purple' },
  { indices: [8, 18, 10], type: 'front', color: 'purple' },
  { indices: [13, 21, 23], type: 'back', color: 'purple' },
  { indices: [13, 23, 15], type: 'back', color: 'purple' },
  { indices: [15, 23, 22], type: 'back', color: 'purple' },
  { indices: [15, 22, 14], type: 'back', color: 'purple' },
  // Side Transitions
  { indices: [9, 11, 19], type: 'left', color: 'purple' },
  { indices: [9, 19, 17], type: 'left', color: 'purple' },
  { indices: [11, 13, 21], type: 'left', color: 'purple' },
  { indices: [11, 21, 19], type: 'left', color: 'purple' },
  { indices: [10, 12, 20], type: 'right', color: 'purple' },
  { indices: [10, 20, 18], type: 'right', color: 'purple' },
  { indices: [12, 14, 22], type: 'right', color: 'purple' },
  { indices: [12, 22, 20], type: 'right', color: 'purple' },

  // --- Section 2 to Section 3 (Lower Stem) ---
  { indices: [17, 25, 24], type: 'front', color: 'purple' },
  { indices: [17, 24, 16], type: 'front', color: 'purple' },
  { indices: [16, 24, 26], type: 'front', color: 'purple' },
  { indices: [16, 26, 18], type: 'front', color: 'purple' },
  { indices: [21, 29, 31], type: 'back', color: 'purple' },
  { indices: [21, 31, 23], type: 'back', color: 'purple' },
  { indices: [23, 31, 30], type: 'back', color: 'purple' },
  { indices: [23, 30, 22], type: 'back', color: 'purple' },
  // Side Transitions
  { indices: [17, 19, 27], type: 'left', color: 'purple' },
  { indices: [17, 27, 25], type: 'left', color: 'purple' },
  { indices: [19, 21, 29], type: 'left', color: 'purple' },
  { indices: [19, 29, 27], type: 'left', color: 'purple' },
  { indices: [18, 20, 28], type: 'right', color: 'purple' },
  { indices: [18, 28, 26], type: 'right', color: 'purple' },
  { indices: [20, 22, 30], type: 'right', color: 'purple' },
  { indices: [20, 30, 28], type: 'right', color: 'purple' },

  // --- Section 3 to Section 4 (Hook Bend) ---
  { indices: [25, 33, 32], type: 'front', color: 'purple' },
  { indices: [25, 32, 24], type: 'front', color: 'purple' },
  { indices: [24, 32, 34], type: 'front', color: 'purple' },
  { indices: [24, 34, 26], type: 'front', color: 'purple' },
  { indices: [29, 37, 39], type: 'back', color: 'purple' },
  { indices: [29, 39, 31], type: 'back', color: 'purple' },
  { indices: [31, 39, 38], type: 'back', color: 'purple' },
  { indices: [31, 38, 30], type: 'back', color: 'purple' },
  // Side Transitions
  { indices: [25, 27, 35], type: 'left', color: 'purple' },
  { indices: [25, 35, 33], type: 'left', color: 'purple' },
  { indices: [27, 29, 37], type: 'left', color: 'purple' },
  { indices: [27, 37, 35], type: 'left', color: 'purple' },
  { indices: [26, 28, 36], type: 'right', color: 'purple' },
  { indices: [26, 36, 34], type: 'right', color: 'purple' },
  { indices: [28, 30, 38], type: 'right', color: 'purple' },
  { indices: [28, 38, 36], type: 'right', color: 'purple' },

  // --- Section 4 to Section 5 (Hook Rising) ---
  { indices: [33, 41, 40], type: 'front', color: 'purple' },
  { indices: [33, 40, 32], type: 'front', color: 'purple' },
  { indices: [32, 40, 42], type: 'front', color: 'purple' },
  { indices: [32, 42, 34], type: 'front', color: 'purple' },
  { indices: [37, 45, 47], type: 'back', color: 'purple' },
  { indices: [37, 47, 39], type: 'back', color: 'purple' },
  { indices: [39, 47, 46], type: 'back', color: 'purple' },
  { indices: [39, 46, 38], type: 'back', color: 'purple' },
  // Side Transitions
  { indices: [33, 35, 43], type: 'left', color: 'purple' },
  { indices: [33, 43, 41], type: 'left', color: 'purple' },
  { indices: [35, 37, 45], type: 'left', color: 'purple' },
  { indices: [35, 45, 43], type: 'left', color: 'purple' },
  { indices: [34, 36, 44], type: 'right', color: 'purple' },
  { indices: [34, 44, 42], type: 'right', color: 'purple' },
  { indices: [36, 38, 46], type: 'right', color: 'purple' },
  { indices: [36, 46, 44], type: 'right', color: 'purple' },

  // --- Section 5 to Section 6 (Hook Tip Peak) ---
  { indices: [41, 49, 48], type: 'front', color: 'purple' },
  { indices: [41, 48, 40], type: 'front', color: 'purple' },
  { indices: [40, 48, 50], type: 'front', color: 'purple' },
  { indices: [40, 50, 42], type: 'front', color: 'purple' },
  { indices: [45, 53, 55], type: 'back', color: 'purple' },
  { indices: [45, 55, 47], type: 'back', color: 'purple' },
  { indices: [47, 55, 54], type: 'back', color: 'purple' },
  { indices: [47, 54, 46], type: 'back', color: 'purple' },
  // Side Transitions
  { indices: [41, 43, 51], type: 'left', color: 'purple' },
  { indices: [41, 51, 49], type: 'left', color: 'purple' },
  { indices: [43, 45, 53], type: 'left', color: 'purple' },
  { indices: [43, 53, 51], type: 'left', color: 'purple' },
  { indices: [42, 44, 52], type: 'right', color: 'purple' },
  { indices: [42, 52, 50], type: 'right', color: 'purple' },
  { indices: [44, 46, 54], type: 'right', color: 'purple' },
  { indices: [44, 54, 52], type: 'right', color: 'purple' },

  // --- Section 0 Cap ---
  { indices: [0, 1, 2], type: 'top', color: 'purple' },
  { indices: [1, 3, 5], type: 'top', color: 'purple' },
  { indices: [2, 4, 6], type: 'top', color: 'purple' },
  { indices: [7, 5, 6], type: 'top', color: 'purple' },
  { indices: [0, 2, 6], type: 'top', color: 'purple' },
  { indices: [0, 6, 7], type: 'top', color: 'purple' },
  { indices: [0, 7, 5], type: 'top', color: 'purple' },
  { indices: [0, 5, 1], type: 'top', color: 'purple' },

  // --- Section 6 Cap ---
  { indices: [48, 49, 50], type: 'top', color: 'purple' },
  { indices: [49, 51, 53], type: 'top', color: 'purple' },
  { indices: [50, 52, 54], type: 'top', color: 'purple' },
  { indices: [55, 53, 54], type: 'top', color: 'purple' },
  { indices: [48, 50, 54], type: 'top', color: 'purple' },
  { indices: [48, 54, 55], type: 'top', color: 'purple' },
  { indices: [48, 55, 53], type: 'top', color: 'purple' },
  { indices: [48, 53, 49], type: 'top', color: 'purple' },
];

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  tx: number; // target x
  ty: number; // target y
  tz: number; // target z
  size: number;
  color: string;
  alpha: number;
  noiseSpeed: number;
  noiseOffset: number;
}

export default function SplashView({ onComplete }: SplashViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showText, setShowText] = useState(false);
  const [taglineGlow, setTaglineGlow] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Set canvas dimensions with high-density DPI scaling for razor-sharp rendering on all displays
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Dynamic resizing
    const handleResize = () => {
      if (canvas) {
        dpr = window.devicePixelRatio || 1;
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const newCtx = canvas.getContext('2d');
        if (newCtx) newCtx.scale(dpr, dpr);
      }
    };
    window.addEventListener('resize', handleResize);

    // High fidelity background stars (Twinkling Cosmic Dust)
    const backgroundStars: { x: number; y: number; size: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < 70; i++) {
      backgroundStars.push({
        x: Math.random(),
        y: Math.random(),
        size: 0.4 + Math.random() * 1.1,
        speed: 0.01 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const particleCount = 1800; // Increased particle density for richer look
    const particles: Particle[] = [];

    // Helper: Generate a random point on a chosen facet's surface to get continuous 3D distribution
    const getRandomPointOnFacets = () => {
      const facet = FACETS[Math.floor(Math.random() * FACETS.length)];
      const idxs = facet.indices;
      
      // Get three vertices of the facet (triangulation fallback)
      const v0 = VERTICES[idxs[0]];
      const v1 = VERTICES[idxs[1]];
      const v2 = VERTICES[idxs[2]];

      // Interpolate inside triangle
      let r1 = Math.random();
      let r2 = Math.random();
      if (r1 + r2 > 1) {
        r1 = 1 - r1;
        r2 = 1 - r2;
      }
      const r3 = 1 - r1 - r2;

      return {
        x: v0.x * r1 + v1.x * r2 + v2.x * r3,
        y: v0.y * r1 + v1.y * r2 + v2.y * r3,
        z: v0.z * r1 + v1.z * r2 + v2.z * r3,
      };
    };

    // Initialize particles swirling from outside frame in total darkness
    for (let i = 0; i < particleCount; i++) {
      const target = getRandomPointOnFacets();
      
      // Cosmic swirling coordinates
      const angle = Math.random() * Math.PI * 2;
      const radius = 350 + Math.random() * 450;
      const initialZ = (Math.random() - 0.5) * 350;

      particles.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius + (Math.random() - 0.5) * 200,
        z: initialZ,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2,
        tx: target.x * 2.5, // slightly smaller and more refined
        ty: target.y * 2.5,
        tz: target.z * 2.5,
        size: 0.6 + Math.random() * 1.6,
        // High fidelity deep Purple, Orchid Pink and Electric Cyan glowing particles
        color: Math.random() > 0.6 ? '#D946EF' : Math.random() > 0.35 ? '#a855f7' : '#06B6D4',
        alpha: 0.15 + Math.random() * 0.85,
        noiseSpeed: 0.015 + Math.random() * 0.025,
        noiseOffset: Math.random() * 100,
      });
    }

    let startTime = Date.now();
    const assemblyDuration = 2200; // 2.2 seconds assembly
    const textFadeDelay = 2200;
    const pulseDelay = 2800;
    const completeDelay = 4200;

    // 3D angles of continuous rotation
    let angleY = 0;
    let angleX = 0.2; // starting tilting perspective
    let cameraZ = 300; // slowly zoom in

    // Starburst Specular Flare Helper
    const drawSpecularFlare = (context: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number, rotationAngle: number) => {
      context.save();
      context.translate(x, y);
      context.rotate(rotationAngle);

      // 1. Soft glowing halo behind the spike
      const flareGlow = context.createRadialGradient(0, 0, 0, 0, 0, size * 2.5);
      flareGlow.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.95})`);
      flareGlow.addColorStop(0.2, `rgba(216, 180, 254, ${opacity * 0.7})`);
      flareGlow.addColorStop(0.6, `rgba(168, 85, 247, ${opacity * 0.25})`);
      flareGlow.addColorStop(1, 'rgba(168, 85, 247, 0)');
      context.fillStyle = flareGlow;
      context.beginPath();
      context.arc(0, 0, size * 2.5, 0, Math.PI * 2);
      context.fill();

      // 2. Main horizontal/vertical razor spikes
      context.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.95})`;
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(-size * 1.8, 0);
      context.lineTo(size * 1.8, 0);
      context.moveTo(0, -size * 1.8);
      context.lineTo(0, size * 1.8);
      context.stroke();

      // 3. Diagonal secondary thin spikes
      context.strokeStyle = `rgba(216, 180, 254, ${opacity * 0.45})`;
      context.lineWidth = 0.8;
      context.beginPath();
      context.moveTo(-size * 1.0, -size * 1.0);
      context.lineTo(size * 1.0, size * 1.0);
      context.moveTo(size * 1.0, -size * 1.0);
      context.lineTo(-size * 1.0, size * 1.0);
      context.stroke();

      context.restore();
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      // Clear with pure elegant black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Draw high definition twinkling background star field
      backgroundStars.forEach(star => {
        const starOpacity = 0.15 + Math.sin(elapsed * star.speed + star.phase) * 0.35;
        ctx.fillStyle = `rgba(243, 232, 255, ${starOpacity})`;
        ctx.fillRect(star.x * width, star.y * height, star.size, star.size);
      });

      const cx = isFinite(width) ? width / 2 : 0;
      const cy = isFinite(height) ? height / 2 : 0;

      // Radial background ambient deep cosmic light
      try {
        const bgGlow = ctx.createRadialGradient(
          cx, cy, 10,
          cx, cy, Math.max(350, width * 0.45)
        );
        // Soft violet and electric indigo nebula glow
        bgGlow.addColorStop(0, 'rgba(147, 51, 234, 0.07)'); // rich purple
        bgGlow.addColorStop(0.5, 'rgba(79, 70, 229, 0.03)'); // indigo
        bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bgGlow;
        ctx.fillRect(0, 0, width, height);
      } catch (e) {
        // Fallback silently
      }

      // Calculate progress of gathering together (0 to 1)
      const rawProgress = Math.min(elapsed / assemblyDuration, 1);
      // Beautiful ease-out cubic for realistic physics pull
      const progress = 1 - Math.pow(1 - rawProgress, 3);

      // Logo rotations
      if (rawProgress >= 0.99) {
        // Continuous slow luxurious rotate
        angleY += 0.009;
        angleX = 0.2 + Math.sin(elapsed * 0.0008) * 0.07;
        // Slow move toward camera
        cameraZ = Math.max(300 - (elapsed - assemblyDuration) * 0.02, 235);
      } else {
        // Gathering spin
        angleY = (1 - progress) * 3.5 + 0.1;
      }

      // Projections formulas
      const project = (x: number, y: number, z: number) => {
        // Apply Y-axis rotation
        let x1 = x * Math.cos(angleY) - z * Math.sin(angleY);
        let z1 = x * Math.sin(angleY) + z * Math.cos(angleY);

        // Apply X-axis rotation
        let y2 = y * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = y * Math.sin(angleX) + z1 * Math.cos(angleX);

        // Perspective scaling - prevent division by zero or negative perspective wrapping
        const denom = cameraZ + z2;
        const scale = Math.abs(denom) > 0.001 ? cameraZ / denom : 0;
        
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;

        return {
          x: isFinite(px) ? px : cx,
          y: isFinite(py) ? py : cy,
          depth: z2,
          scale: isFinite(scale) ? scale : 0
        };
      };

      const rotate3D = (x: number, y: number, z: number) => {
        const x1 = x * Math.cos(angleY) - z * Math.sin(angleY);
        const z1 = x * Math.sin(angleY) + z * Math.cos(angleY);
        const y2 = y * Math.cos(angleX) - z1 * Math.sin(angleX);
        const z2 = y * Math.sin(angleX) + z1 * Math.cos(angleX);
        return { x: x1, y: y2, z: z2 };
      };

      // Store projected coordinates of key vertices to draw specular glints later
      const projectedVertices: { x: number; y: number; index: number }[] = [];

      // 1. Render Faceted 3D Crystal Logo underlay once mostly gathered
      if (rawProgress > 0.6) {
        const opacityMultiplier = Math.min((rawProgress - 0.6) * 2.5, 1);

        // Project and save all 3D mesh vertices first
        for (let i = 0; i < VERTICES.length; i++) {
          const v = VERTICES[i];
          const projV = project(v.x * 2.5, v.y * 2.5, v.z * 2.5);
          projectedVertices.push({ x: projV.x, y: projV.y, index: i });
        }

        // Sort facets by average depth (Painter's algorithm for proper 3D layering)
        const sortedFacets = FACETS.map((facet, idx) => {
          const pts = facet.indices.map(vIdx => VERTICES[vIdx]);
          // Calculate center depth of the facet
          let avgZ = 0;
          pts.forEach(p => {
            // Apply current rotation to vertices to find absolute depth
            let z1 = p.x * Math.sin(angleY) + p.z * Math.cos(angleY);
            let z2 = p.y * Math.sin(angleX) + z1 * Math.cos(angleX);
            avgZ += z2;
          });
          avgZ /= pts.length;
          return { facet, depth: avgZ, id: idx };
        }).sort((a, b) => b.depth - a.depth);

        // Render each crystal polygon face
        sortedFacets.forEach(({ facet }) => {
          const projectedPts = facet.indices.map(vIdx => projectedVertices[vIdx]);

          if (!projectedPts[0] || !projectedPts[1]) return;

          ctx.beginPath();
          ctx.moveTo(projectedPts[0].x, projectedPts[0].y);
          for (let i = 1; i < projectedPts.length; i++) {
            if (projectedPts[i]) {
              ctx.lineTo(projectedPts[i].x, projectedPts[i].y);
            }
          }
          ctx.closePath();

          // Premium 3D crystal lighting calculations based on rotated face normal
          const p0_idx = facet.indices[0];
          const p1_idx = facet.indices[1];
          const p2_idx = facet.indices[2] || p0_idx;

          const p0_3d = VERTICES[p0_idx];
          const p1_3d = VERTICES[p1_idx];
          const p2_3d = VERTICES[p2_idx];

          const r0 = rotate3D(p0_3d.x, p0_3d.y, p0_3d.z);
          const r1 = rotate3D(p1_3d.x, p1_3d.y, p1_3d.z);
          const r2 = rotate3D(p2_3d.x, p2_3d.y, p2_3d.z);

          const ax = r1.x - r0.x;
          const ay = r1.y - r0.y;
          const az = r1.z - r0.z;

          const bx = r2.x - r0.x;
          const by = r2.y - r0.y;
          const bz = r2.z - r0.z;

          // Cross product to get face normal
          const nx = ay * bz - az * by;
          const ny = az * bx - ax * bz;
          const nz = ax * by - ay * bx;

          const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
          let intensity = 0.5; // default fallback
          if (len > 0.001) {
            const nnx = nx / len;
            const nny = ny / len;
            const nnz = nz / len;
            
            // Light vector coming from front-top-left
            const dot = nnx * (-0.35) + nny * (-0.55) + nnz * 0.75;
            intensity = (dot + 1) / 2; // Map dot product range [-1, 1] to light intensity [0, 1]
          }

          // Create beautiful gradient stops using hue shifting
          const s0_i = Math.max(0, Math.min(1, intensity * 0.75));
          const s1_i = Math.max(0, Math.min(1, intensity * 1.35));

          const hsla = (h: number, s: number, l: number, a: number) => {
            return `hsla(${Math.round(h)}, ${Math.round(Math.max(0, Math.min(100, s)))}%, ${Math.round(Math.max(0, Math.min(100, l)))}%, ${a})`;
          };

          // Shadow stop color (Stop 0): deep royal indigo-blue or rich midnight violet
          const h0 = 255 + (275 - 255) * s0_i;
          const s0 = 85 + (15 * s0_i);
          const l0 = 12 + (30 * s0_i);

          // Highlight stop color (Stop 1): highly polished orchid pink/magenta, rising to translucent lilac white
          const h1 = 275 + (25 * s1_i); // up to 300 (magenta/orchid)
          const s1 = 95 - (5 * s1_i); // bright highlights are clean
          const l1 = 42 + (53 * s1_i); // up to 95% (glowing crystal white)

          const color0 = hsla(h0, s0, l0, opacityMultiplier);
          const color1 = hsla(h1, s1, l1, opacityMultiplier);

          const p0 = projectedPts[0];
          const p1 = projectedPts[1];
          const p2 = projectedPts[2] || p1;

          const x0 = isFinite(p0.x) ? p0.x : 0;
          const y0 = isFinite(p0.y) ? p0.y : 0;
          const x2 = isFinite(p2.x) ? p2.x : 0;
          const y2 = isFinite(p2.y) ? p2.y : 0;

          let grad;
          try {
            grad = ctx.createLinearGradient(x0, y0, x2, y2);
            grad.addColorStop(0, color0);
            grad.addColorStop(1, color1);
            ctx.fillStyle = grad;
          } catch (e) {
            ctx.fillStyle = hsla(280, 90, 45, opacityMultiplier);
          }

          ctx.fill();

          // 2D Specular Gloss/Glass reflection overlay inside the crystal facet
          try {
            ctx.save();
            const glossGrad = ctx.createLinearGradient(x0, y0, (x0 + x2) / 2, (y0 + y2) / 2);
            glossGrad.addColorStop(0, `rgba(255, 255, 255, ${(0.22 + intensity * 0.1) * opacityMultiplier})`);
            glossGrad.addColorStop(0.35, `rgba(255, 255, 255, ${0.05 * opacityMultiplier})`);
            glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = glossGrad;
            ctx.fill();
            ctx.restore();
          } catch (e) {}

          // Highlight crystal sharp edges with a very thin, glossy stroke
          const edgeAlpha = (0.25 + intensity * 0.6) * opacityMultiplier;
          ctx.strokeStyle = hsla(270, 100, 85 + intensity * 15, edgeAlpha);
          ctx.lineWidth = 1.0;
          ctx.stroke();

          // Draw an inner glowing line on highlights
          ctx.strokeStyle = hsla(285, 95, 60, 0.28 * opacityMultiplier);
          ctx.lineWidth = 2.4;
          ctx.stroke();
        });

        // Vertex Specular Starburst glints (making it look unbelievably shiny and premium like a high-res gem)
        if (rawProgress >= 0.95) {
          // Choose specific sharp structural vertices to produce glistening flare sparks
          const glintVertices = [
            { idx: 52, flareSize: 13, speedFactor: 1.2 },  // Hook outer peak point
            { idx: 0, flareSize: 11, speedFactor: 0.9 },   // Top stem cap corner
            { idx: 32, flareSize: 10, speedFactor: 1.5 },  // Hook bottom curve corner
            { idx: 2, flareSize: 9, speedFactor: 0.8 },    // Stem outer right corner
          ];

          glintVertices.forEach(g => {
            const pv = projectedVertices[g.idx];
            if (pv) {
              // Pulse opacity based on time & rotation angle to make it shine dynamically
              const phaseAngle = (elapsed * 0.002 * g.speedFactor) + (g.idx * 1.5);
              const flareOpacity = Math.max(0, Math.sin(phaseAngle)) * 0.85 * opacityMultiplier;
              const rotationRad = (elapsed * 0.0006) + (g.idx * 0.5);
              if (flareOpacity > 0.05) {
                drawSpecularFlare(ctx, pv.x, pv.y, g.flareSize, flareOpacity, rotationRad);
              }
            }
          });
        }
      }

      // 2. Update and render Particles (Diamond dust trailing in 3D space)
      particles.forEach((p) => {
        // Interpolate between initial swirled state and target J coordinates
        const curTargetX = p.tx;
        const curTargetY = p.ty;
        const curTargetZ = p.tz;

        // Current coordinates
        let cx_p = p.x + (curTargetX - p.x) * progress;
        let cy_p = p.y + (curTargetY - p.y) * progress;
        let cz_p = p.z + (curTargetZ - p.z) * progress;

        // Add minor holographic noise/turbulence after gathered
        if (rawProgress >= 0.98) {
          cx_p += Math.sin(elapsed * p.noiseSpeed + p.noiseOffset) * 0.45;
          cy_p += Math.cos(elapsed * p.noiseSpeed * 0.8 + p.noiseOffset) * 0.45;
          cz_p += Math.sin(elapsed * p.noiseSpeed * 1.2 + p.noiseOffset) * 0.45;
        }

        // Project 3D point to 2D
        const proj = project(cx_p, cy_p, cz_p);

        // Draw particle with nice bright glow
        const particleAlpha = p.alpha * (rawProgress < 0.25 ? rawProgress * 4 : 1) * (rawProgress > 0.9 ? 0.85 : 1);
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, Math.max(0.15, p.size * proj.scale), 0, Math.PI * 2);
        
        ctx.fillStyle = p.color;
        
        // Add subtle subpixel shadow blur for glow
        if (rawProgress > 0.8) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
        }
        ctx.fill();
        ctx.shadowBlur = 0; // reset shadow for performance
      });

      // 3. Volumetric Light Flash Burst on perfect assembly
      if (elapsed >= pulseDelay && elapsed < pulseDelay + 800) {
        const pulseProgress = (elapsed - pulseDelay) / 800;
        const radiusGlow = pulseProgress * 320;
        const alphaGlow = Math.max(0, 1 - pulseProgress) * 0.3;

        try {
          const flashGrad = ctx.createRadialGradient(
            cx, cy, 2,
            cx, cy, Math.max(2, radiusGlow)
          );
          flashGrad.addColorStop(0, `rgba(255, 255, 255, ${alphaGlow * 1.6})`);
          flashGrad.addColorStop(0.25, `rgba(168, 85, 247, ${alphaGlow * 1.1})`);
          flashGrad.addColorStop(0.65, `rgba(6, 182, 212, ${alphaGlow * 0.45})`);
          flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

          ctx.fillStyle = flashGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(2, radiusGlow), 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {
          // Fallback silently
        }
      }

      // Trigger tags fade-in precisely
      if (elapsed >= textFadeDelay && !showText) {
        setShowText(true);
      }

      if (elapsed >= pulseDelay && !taglineGlow) {
        setTaglineGlow(true);
      }

      // Seamlessly finish and call onComplete
      if (elapsed < completeDelay) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Trigger exit transition
        onComplete();
      }
    };

    // Begin cinematic frame loop
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onComplete]);

  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-between p-6 pb-12 text-white select-none z-50 overflow-hidden">
      {/* Absolute Dark Cinema Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0" />

      {/* Spacing alignment helper */}
      <div className="h-10 z-10" />

      {/* Cinematic Logo Branding Details */}
      <div className="flex flex-col items-center text-center z-10 w-full select-none pointer-events-none mt-[40vh] sm:mt-[38vh]">
        <AnimatePresence>
          {showText && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center"
            >
              <h1 className="text-4xl sm:text-5xl font-sans font-bold tracking-tight text-white flex items-center gap-2">
                Junpon <span className="text-[#a855f7] drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">AI</span>
              </h1>
              
              <motion.p
                initial={{ opacity: 0, letterSpacing: '0.05em' }}
                animate={{ 
                  opacity: 0.85, 
                  letterSpacing: '0.22em',
                  textShadow: taglineGlow ? '0 0 12px rgba(168, 85, 247, 0.6)' : '0 0 0px transparent'
                }}
                transition={{ delay: 0.4, duration: 1.4, ease: 'easeOut' }}
                className="text-[10px] sm:text-xs font-mono tracking-widest text-purple-300 italic mt-3.5 font-semibold uppercase"
              >
                AI that understands you.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Sparkles & Status */}
      <div className="flex flex-col items-center gap-2 z-10 opacity-40">
        <span className="text-[8px] tracking-[0.3em] text-neutral-500 font-mono uppercase">
          Junpon Engine v2.0
        </span>
      </div>
    </div>
  );
}
