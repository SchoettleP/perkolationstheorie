import { useState, useEffect, useRef } from "react";
import { PercolationEngine, SimulationStats } from "../simulation/PercolationEngine";

export interface PercolationSettings {
  rows: number;
  cols: number;
  probability: number;
  useDiagonal: boolean;
  speedLevel: number;
}

export function usePercolation() {
  const [rows, setRows] = useState<number>(100);
  const [cols, setCols] = useState<number>(100);
  const [probability, setProbability] = useState<number>(59);
  const [useDiagonal, setUseDiagonal] = useState<boolean>(false);
  const [speedLevel, setSpeedLevel] = useState<number>(3); // 1 = slow, 2 = medium, 3 = fast, 4 = very fast
  
  const [grid, setGrid] = useState<Uint8Array>(new Uint8Array(0));
  const [stats, setStats] = useState<SimulationStats | null>(null);
  const [stepCount, setStepCount] = useState<number>(0);
  const [runtime, setRuntime] = useState<number>(0);
  const [simState, setSimState] = useState<"idle" | "running" | "paused" | "finished">("idle");
  const [percolationResult, setPercolationResult] = useState<"success" | "failure" | null>(null);

  const engineRef = useRef<PercolationEngine | null>(null);
  const initialGridRef = useRef<Uint8Array | null>(null);
  const startTimeRef = useRef<number>(0);
  const runtimeOffsetRef = useRef<number>(0);

  // Map speed level to step delay in ms
  const getTickSpeed = (level: number): number => {
    switch (level) {
      case 1: return 400; // Slow
      case 2: return 150; // Medium
      case 3: return 40;  // Fast
      case 4: return 10;  // Very Fast
      default: return 40;
    }
  };
  const speed = getTickSpeed(speedLevel);

  // Generate grid based on parameters
  const generateGrid = () => {
    const engine = new PercolationEngine(cols, rows, probability / 100, useDiagonal);
    engineRef.current = engine;
    initialGridRef.current = new Uint8Array(engine.grid);

    setGrid(new Uint8Array(engine.grid));
    setStats(engine.getStats());
    setStepCount(0);
    setRuntime(0);
    setSimState("idle");
    setPercolationResult(null);
  };

  // Re-generate grid when parameters change, only if simulation is not currently running/paused
  useEffect(() => {
    if (simState === "idle" || simState === "finished") {
      generateGrid();
    }
  }, [rows, cols, probability, useDiagonal]);

  // Main simulation tick loop
  useEffect(() => {
    if (simState !== "running") return;

    let timerId: any = null;

    const tick = () => {
      if (!engineRef.current) return;

      const result = engineRef.current.step();
      setGrid(new Uint8Array(engineRef.current.grid));
      setStats(engineRef.current.getStats());
      setStepCount(engineRef.current.stepCount);

      // Track running time
      const elapsed = Date.now() - startTimeRef.current + runtimeOffsetRef.current;
      setRuntime(elapsed);

      if (result.finished) {
        setSimState("finished");
        const hasPerc = engineRef.current.hasPercolated();
        setPercolationResult(hasPerc ? "success" : "failure");
      } else {
        timerId = setTimeout(tick, speed);
      }
    };

    timerId = setTimeout(tick, speed);

    return () => {
      clearTimeout(timerId);
    };
  }, [simState, speed]);

  const startFire = () => {
    if (!engineRef.current) return;

    // Reset grid to unburnt state first if finished/paused
    if (simState === "finished" || simState === "paused") {
      resetGridToInitial();
    }

    engineRef.current.startFire();
    setGrid(new Uint8Array(engineRef.current.grid));
    setStats(engineRef.current.getStats());
    setStepCount(0);
    setRuntime(0);
    setSimState("running");
    setPercolationResult(null);

    startTimeRef.current = Date.now();
    runtimeOffsetRef.current = 0;
  };

  const handlePause = () => {
    if (simState !== "running") return;
    setSimState("paused");
    runtimeOffsetRef.current += Date.now() - startTimeRef.current;
  };

  const handleResume = () => {
    if (simState !== "paused") return;
    setSimState("running");
    startTimeRef.current = Date.now();
  };

  const resetGridToInitial = () => {
    if (!engineRef.current || !initialGridRef.current) return;

    engineRef.current.grid.set(initialGridRef.current);
    engineRef.current.burningIndices = [];
    engineRef.current.stepCount = 0;

    setGrid(new Uint8Array(engineRef.current.grid));
    setStats(engineRef.current.getStats());
    setStepCount(0);
    setRuntime(0);
    setSimState("idle");
    setPercolationResult(null);
  };

  // Form handler clamps
  const handleRowsChange = (val: number) => {
    const clamped = Math.min(Math.max(val, 10), 500);
    setRows(clamped);
  };

  const handleColsChange = (val: number) => {
    const clamped = Math.min(Math.max(val, 10), 500);
    setCols(clamped);
  };

  const getSpeedLabel = (level: number) => {
    switch (level) {
      case 1: return "Langsam (400ms)";
      case 2: return "Mittel (150ms)";
      case 3: return "Schnell (40ms)";
      case 4: return "Sehr Schnell (10ms)";
      default: return "";
    }
  };

  return {
    settings: {
      rows,
      cols,
      probability,
      useDiagonal,
      speedLevel,
    },
    setRows: handleRowsChange,
    setCols: handleColsChange,
    setProbability,
    setUseDiagonal,
    setSpeedLevel,
    grid,
    stats,
    stepCount,
    runtime,
    simState,
    percolationResult,
    generateGrid,
    startFire,
    handlePause,
    handleResume,
    resetGridToInitial,
    getSpeedLabel,
  };
}
