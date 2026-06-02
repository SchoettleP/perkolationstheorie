import React, { useRef, useEffect, useState, useCallback } from "react";
import { CellState } from "../simulation/PercolationEngine";
import { ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react";

interface SimulationCanvasProps {
  grid: Uint8Array;
  width: number;
  height: number;
  stepCount: number;
  showClusters?: boolean;
  clusterGrid?: Int32Array | null;
  highlightedClusterId?: number;
}

// Helper to convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    r = hue2rgb(h + 1/3);
    g = hue2rgb(h);
    b = hue2rgb(h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), 255];
}

// Colors in RGBA
const COLOR_EMPTY_LIGHT = [245, 242, 238, 255]; // Earthy sand
const COLOR_EMPTY_DARK = [20, 26, 23, 255];     // Dark peat/ground
const COLOR_TREE = [16, 185, 129, 255];         // Glowing Forest Emerald
const COLOR_BURNING = [249, 115, 22, 255];       // Fire Orange
const COLOR_BURNT = [87, 101, 94, 255];         // Ash/Charcoal Grey

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  grid,
  width,
  height,
  stepCount,
  showClusters = false,
  clusterGrid = null,
  highlightedClusterId = -1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  
  const [scale, setScale] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ w: 500, h: 500 });
  
  const baseCellSize = 10; // Base cell dimension before scaling

  // Fit and center grid in the canvas
  const resetZoom = useCallback(() => {
    if (!width || !height) return;
    const gridW = width * baseCellSize;
    const gridH = height * baseCellSize;
    
    // Scale to fit container with 5% padding
    const fitScale = Math.min(canvasSize.w / gridW, canvasSize.h / gridH) * 0.95;
    const initialScale = Math.min(Math.max(fitScale, 0.005), 40);
    
    setScale(initialScale);
    setOffsetX((canvasSize.w - gridW * initialScale) / 2);
    setOffsetY((canvasSize.h - gridH * initialScale) / 2);
  }, [width, height, canvasSize]);

  // Handle Container Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Maintain square aspect ratio or matching container
        if (rect.width > 0) {
          const size = Math.min(rect.width, 600);
          setCanvasSize({ w: size, h: size });
        }
      }
    };
    
    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, []);

  // Run reset zoom once canvas size or grid dimensions initialize
  useEffect(() => {
    resetZoom();
  }, [width, height, canvasSize.w, canvasSize.h, resetZoom]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set device pixel ratio scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.w * dpr;
    canvas.height = canvasSize.h * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.fillStyle = document.documentElement.classList.contains("dark") ? "#040705" : "#f4f7f5";
    ctx.fillRect(0, 0, canvasSize.w, canvasSize.h);
    
    // Render grid using Offscreen Canvas for maximum speed (cached via Ref)
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement("canvas");
    }
    const offscreen = offscreenRef.current;
    offscreen.width = width;
    offscreen.height = height;
    const oCtx = offscreen.getContext("2d");
    if (!oCtx) return;
    
    const imgData = oCtx.createImageData(width, height);
    const isDark = document.documentElement.classList.contains("dark");
    const emptyColor = isDark ? COLOR_EMPTY_DARK : COLOR_EMPTY_LIGHT;
    
    for (let i = 0; i < grid.length; i++) {
      const state = grid[i];
      let r = 0, g = 0, b = 0, a = 0;
      
      switch (state) {
        case CellState.EMPTY:
          [r, g, b, a] = emptyColor;
          break;
        case CellState.TREE:
          if (showClusters && clusterGrid && clusterGrid[i] !== -1) {
            const cid = clusterGrid[i];
            if (cid === highlightedClusterId) {
              // Vibrant neon emerald for highlighted cluster
              [r, g, b, a] = isDark ? [16, 255, 140, 255] : [5, 150, 105, 255];
            } else {
              // Muted multi-colored HSL based on cluster ID
              const hue = 120 + ((cid * 43) % 80); // green to cyan-teal
              const sat = 35 + ((cid * 17) % 25);  // 35% to 60%
              const light = isDark ? 15 + ((cid * 7) % 15) : 60 + ((cid * 7) % 15);
              [r, g, b, a] = hslToRgb(hue / 360, sat / 100, light / 100);
            }
          } else {
            [r, g, b, a] = COLOR_TREE;
          }
          break;
        case CellState.BURNING:
          [r, g, b, a] = COLOR_BURNING;
          break;
        case CellState.BURNT:
          [r, g, b, a] = COLOR_BURNT;
          break;
      }
      
      const pixelIdx = i * 4;
      imgData.data[pixelIdx] = r;
      imgData.data[pixelIdx + 1] = g;
      imgData.data[pixelIdx + 2] = b;
      imgData.data[pixelIdx + 3] = a;
    }
    
    oCtx.putImageData(imgData, 0, 0);
    
    // Render the offscreen canvas onto the main canvas with scaling
    ctx.imageSmoothingEnabled = false;
    
    const renderW = width * baseCellSize * scale;
    const renderH = height * baseCellSize * scale;
    
    ctx.drawImage(offscreen, offsetX, offsetY, renderW, renderH);
    
    // Optional border/frame around the grid
    ctx.strokeStyle = isDark ? "#16261d" : "#cbdad5";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(offsetX, offsetY, renderW, renderH);
  }, [grid, width, height, scale, offsetX, offsetY, canvasSize, stepCount, showClusters, clusterGrid, highlightedClusterId]);

  // Zoom Handler
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const zoomIntensity = 0.1;
    const zoomFactor = e.deltaY < 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);
    const nextScale = Math.min(Math.max(scale * zoomFactor, 0.005), 40);
    
    // Keep the point under the mouse cursor in the same position on screen after zoom
    const nextOffsetX = mouseX - (mouseX - offsetX) * (nextScale / scale);
    const nextOffsetY = mouseY - (mouseY - offsetY) * (nextScale / scale);
    
    setScale(nextScale);
    setOffsetX(nextOffsetX);
    setOffsetY(nextOffsetY);
  };

  // Dragging Handlers (Pan)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return; // Only drag with left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom step controls (+ / - buttons)
  const zoomStep = (multiplier: number) => {
    const nextScale = Math.min(Math.max(scale * multiplier, 0.005), 40);
    // Zoom relative to the center of the canvas
    const centerX = canvasSize.w / 2;
    const centerY = canvasSize.h / 2;
    const nextOffsetX = centerX - (centerX - offsetX) * (nextScale / scale);
    const nextOffsetY = centerY - (centerY - offsetY) * (nextScale / scale);
    
    setScale(nextScale);
    setOffsetX(nextOffsetX);
    setOffsetY(nextOffsetY);
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center">
      <div className="canvas-frame w-full" style={{ maxWidth: `${canvasSize.w}px` }}>
        <div 
          className="canvas-container shadow-inner border border-border flex items-center justify-center relative w-full"
          style={{ width: `${canvasSize.w}px`, height: `${canvasSize.h}px` }}
        >
        <canvas
          ref={canvasRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`w-full h-full block select-none ${isDragging ? "canvas-grabbing" : "canvas-grab"}`}
          style={{ width: `${canvasSize.w}px`, height: `${canvasSize.h}px` }}
        />
        
        {/* Map-style zoom/reset overlays */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={() => zoomStep(1.25)}
            className="p-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
            title="Heranzoomen"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => zoomStep(0.8)}
            className="p-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
            title="Herauszoomen"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetZoom}
            className="p-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
            title="Ansicht zurücksetzen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
        
        {/* Navigation Indicator Overlay */}
        <div className="absolute top-4 left-4 pointer-events-none bg-slate-900/60 text-white text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm shadow-sm select-none">
          <Move className="w-3.5 h-3.5" />
          <span>Mausrad zum Zoomen • Klicken & Ziehen zum Verschieben</span>
        </div>
      </div>
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        Aktueller Zoom: {Math.round(scale * 100)}% | Gitter-Dimension: {width} × {height} ({width * height} Zellen)
      </div>
    </div>
  );
};
