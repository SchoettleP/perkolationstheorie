import { useState, useEffect, useRef, useCallback } from "react";
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
  
  // Cluster visualization states
  const [showClusters, setShowClusters] = useState<boolean>(false);
  const [clusterGrid, setClusterGrid] = useState<Int32Array | null>(null);
  const [highlightedClusterId, setHighlightedClusterId] = useState<number>(-1);
  const [isClusterSpanning, setIsClusterSpanning] = useState<boolean>(false);

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

  // History for replay scrubbing
  const historyRef = useRef<Uint8Array[]>([]);
  const statsHistoryRef = useRef<SimulationStats[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

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
  const generateGrid = useCallback(() => {
    const engine = new PercolationEngine(cols, rows, probability / 100, useDiagonal);
    engineRef.current = engine;
    initialGridRef.current = new Uint8Array(engine.grid);

    const initialGrid = new Uint8Array(engine.grid);
    const initialStats = engine.getStats();

    setGrid(initialGrid);
    setStats(initialStats);
    setStepCount(0);
    setRuntime(0);
    setSimState("idle");
    setPercolationResult(null);

    // Initialize history
    historyRef.current = [initialGrid];
    statsHistoryRef.current = [initialStats];
    setCurrentStepIndex(0);

    // Calculate initial clusters
    const clusters = engine.getClusters();
    setClusterGrid(clusters.clusterIds);
    setHighlightedClusterId(clusters.highlightedClusterId);
    setIsClusterSpanning(clusters.isSpanning);
  }, [cols, rows, probability, useDiagonal]);

  const simStateRef = useRef(simState);
  useEffect(() => {
    simStateRef.current = simState;
  }, [simState]);

  // Re-generate grid when parameters change, only if simulation is not currently running/paused
  useEffect(() => {
    if (simStateRef.current === "idle" || simStateRef.current === "finished") {
      generateGrid();
    }
  }, [generateGrid]);

  // Main simulation tick loop
  useEffect(() => {
    if (simState !== "running") return;

    let timerId: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      if (!engineRef.current) return;

      const result = engineRef.current.step();
      const currentStep = engineRef.current.stepCount;
      const nextGrid = new Uint8Array(engineRef.current.grid);
      const nextStats = engineRef.current.getStats();

      // Truncate history and append the new step (handles resuming from earlier steps)
      historyRef.current = historyRef.current.slice(0, currentStep);
      historyRef.current.push(nextGrid);

      statsHistoryRef.current = statsHistoryRef.current.slice(0, currentStep);
      statsHistoryRef.current.push(nextStats);

      setGrid(nextGrid);
      setStats(nextStats);
      setStepCount(currentStep);
      setCurrentStepIndex(currentStep);

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
      if (timerId) clearTimeout(timerId);
    };
  }, [simState, speed]);

  const startFire = () => {
    if (!engineRef.current) return;

    // Reset grid to unburnt state first if finished/paused/scrubbed
    if (simState === "finished" || simState === "paused" || currentStepIndex < stepCount) {
      resetGridToInitial();
    }

    engineRef.current.startFire();
    const firedGrid = new Uint8Array(engineRef.current.grid);
    const firedStats = engineRef.current.getStats();

    setGrid(firedGrid);
    setStats(firedStats);
    setStepCount(0);
    setRuntime(0);
    setSimState("running");
    setPercolationResult(null);

    // Initialize history with step 0 of fire
    historyRef.current = [firedGrid];
    statsHistoryRef.current = [firedStats];
    setCurrentStepIndex(0);

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

    const initialGrid = new Uint8Array(engineRef.current.grid);
    const initialStats = engineRef.current.getStats();

    setGrid(initialGrid);
    setStats(initialStats);
    setStepCount(0);
    setRuntime(0);
    setSimState("idle");
    setPercolationResult(null);

    // Reset history to step 0
    historyRef.current = [initialGrid];
    statsHistoryRef.current = [initialStats];
    setCurrentStepIndex(0);
  };

  // Jump to a specific step in history (scrubbing)
  const jumpToStep = (index: number) => {
    if (!engineRef.current || index < 0 || index >= historyRef.current.length) return;

    // Auto-pause if running
    if (simState === "running") {
      handlePause();
    }

    const targetGrid = historyRef.current[index];
    const targetStats = statsHistoryRef.current[index];

    // Restore engine state
    engineRef.current.restoreState(targetGrid, index);

    // Update active UI states
    setGrid(new Uint8Array(targetGrid));
    setStats(targetStats);
    setCurrentStepIndex(index);

    // Adjust simulation state context
    if (index === 0 && simState !== "idle") {
      setSimState("idle");
      setPercolationResult(null);
    } else if (index < stepCount && (simState === "finished" || simState === "idle")) {
      setSimState("paused");
      setPercolationResult(null);
    } else if (index === stepCount && simState === "paused") {
      // Re-evaluate if finished if we scrubbed back to the end
      const hasPerc = engineRef.current.hasPercolated();
      const finished = engineRef.current.burningIndices.length === 0;
      if (finished) {
        setSimState("finished");
        setPercolationResult(hasPerc ? "success" : "failure");
      }
    }
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
    
    // Cluster visualization
    showClusters,
    setShowClusters,
    clusterGrid,
    highlightedClusterId,
    isClusterSpanning,

    // Replay controls
    currentStepIndex,
    jumpToStep,
  };
}
