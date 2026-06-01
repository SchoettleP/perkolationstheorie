import React, { useRef, useEffect } from "react";
import {
  Sliders,
  ChevronLeft,
  ChevronRight,
  Pause,
  Flame,
  Play,
  RotateCcw,
  Info
} from "lucide-react";
import { PercolationSettings } from "../hooks/usePercolation";

interface SimulationSettingsProps {
  settings: PercolationSettings;
  setRows: (val: number) => void;
  setCols: (val: number) => void;
  setProbability: React.Dispatch<React.SetStateAction<number>>;
  setUseDiagonal: React.Dispatch<React.SetStateAction<boolean>>;
  setSpeedLevel: React.Dispatch<React.SetStateAction<number>>;
  simState: "idle" | "running" | "paused" | "finished";
  onGenerate: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  getSpeedLabel: (level: number) => string;
}

export function SimulationSettings({
  settings,
  setRows,
  setCols,
  setProbability,
  setUseDiagonal,
  setSpeedLevel,
  simState,
  onGenerate,
  onStart,
  onPause,
  onResume,
  onReset,
  getSpeedLabel
}: SimulationSettingsProps) {
  const { rows, cols, probability, useDiagonal, speedLevel } = settings;

  const intervalRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  const startChanging = (direction: "increase" | "decrease") => {
    if (simState === "running" || simState === "paused") return;

    const step = 0.1;
    const update = () => {
      setProbability(p => {
        const isMin = p <= 0;
        const isMax = p >= 100;
        if (direction === "decrease" && isMin) {
          stopChanging();
          return p;
        }
        if (direction === "increase" && isMax) {
          stopChanging();
          return p;
        }

        const newVal = direction === "increase"
          ? Math.min(100, Math.round((p + step) * 10) / 10)
          : Math.max(0, Math.round((p - step) * 10) / 10);

        if (newVal === 0 || newVal === 100) {
          stopChanging();
        }
        return newVal;
      });
    };

    // Run once immediately
    update();

    stopChanging();

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(update, 50);
    }, 350);
  };

  const stopChanging = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => stopChanging();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card rounded-xl border border-border shadow-sm p-5">
        <div className="flex items-center gap-2 border-b border-border pb-3 mb-5">
          <Sliders className="w-4 h-4 text-primary" />
          <h2 className="text-base font-bold text-foreground">Simulationseinstellungen</h2>
        </div>

        <div className="flex flex-col gap-5">
          {/* Dimensions (Rows & Cols) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="input-rows" className="text-xs font-semibold text-muted-foreground uppercase">
                Zeilen (Height)
              </label>
              <input
                id="input-rows"
                type="number"
                min="10"
                max="500"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 10)}
                disabled={simState === "running" || simState === "paused"}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="input-cols" className="text-xs font-semibold text-muted-foreground uppercase">
                Spalten (Width)
              </label>
              <input
                id="input-cols"
                type="number"
                min="10"
                max="500"
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value) || 10)}
                disabled={simState === "running" || simState === "paused"}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>
          </div>

          {/* Tree Probability Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground uppercase">Baumwahrscheinlichkeit</span>
              <span className="text-primary bg-secondary px-2 py-0.5 rounded text-xs font-bold">
                {probability.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onPointerDown={() => startChanging("decrease")}
                onPointerUp={stopChanging}
                onPointerLeave={stopChanging}
                disabled={simState === "running" || simState === "paused" || probability <= 0}
                className="p-1.5 bg-secondary hover:bg-muted text-foreground border border-border rounded-lg disabled:opacity-40 transition-colors flex items-center justify-center shrink-0 active:scale-95 select-none touch-none"
                title="0,1 % verringern"
                aria-label="Wahrscheinlichkeit um 0,1 Prozent verringern"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={probability}
                onChange={(e) => setProbability(parseFloat(e.target.value))}
                disabled={simState === "running" || simState === "paused"}
                className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50"
              />

              <button
                type="button"
                onPointerDown={() => startChanging("increase")}
                onPointerUp={stopChanging}
                onPointerLeave={stopChanging}
                disabled={simState === "running" || simState === "paused" || probability >= 100}
                className="p-1.5 bg-secondary hover:bg-muted text-foreground border border-border rounded-lg disabled:opacity-40 transition-colors flex items-center justify-center shrink-0 active:scale-95 select-none touch-none"
                title="0,1 % erhöhen"
                aria-label="Wahrscheinlichkeit um 0,1 Prozent erhöhen"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0% (Lichtung)</span>
              <span className="text-red-500 font-semibold">p_c ≈ 59.3%</span>
              <span>100% (Dichter Wald)</span>
            </div>
          </div>

          {/* Speed Level Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground uppercase">Geschwindigkeit</span>
              <span className="text-primary bg-secondary px-2 py-0.5 rounded text-xs font-bold">
                {getSpeedLabel(speedLevel)}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={speedLevel}
              onChange={(e) => setSpeedLevel(parseInt(e.target.value))}
              className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Langsam</span>
              <span>Sehr Schnell</span>
            </div>
          </div>

          {/* Diagonal Checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none py-1 group">
            <input
              type="checkbox"
              checked={useDiagonal}
              onChange={(e) => setUseDiagonal(e.target.checked)}
              disabled={simState === "running" || simState === "paused"}
              className="w-4.5 h-4.5 rounded border-border text-primary bg-background focus:ring-primary disabled:opacity-50 cursor-pointer"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground">Diagonale Nachbarn</span>
              <span className="text-[10px] text-muted-foreground">8er-Nachbarschaft aktivieren</span>
            </div>
          </label>

          {/* Actions Grid */}
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
            <button
              onClick={onGenerate}
              className="w-full py-2.5 bg-secondary hover:bg-muted border border-border text-foreground rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              Neues Gitter erzeugen
            </button>

            <div className="grid grid-cols-2 gap-2">
              {simState === "running" ? (
                <button
                  onClick={onPause}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={onStart}
                  className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm glow-btn-accent border-none"
                >
                  <Flame className="w-4 h-4 fill-current animate-pulse" />
                  Brand starten
                </button>
              )}

              <button
                onClick={onResume}
                disabled={simState !== "paused"}
                className="w-full py-2.5 bg-primary hover:opacity-90 text-primary-foreground rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed glow-btn-primary"
              >
                <Play className="w-4 h-4" />
                Fortsetzen
              </button>
            </div>

            <button
              onClick={onReset}
              disabled={simState === "idle"}
              className="w-full py-2.5 bg-secondary hover:bg-muted border border-border text-foreground rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              Zurücksetzen
            </button>
          </div>
        </div>
      </div>

      {/* Quick Science Hint Card */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm text-xs flex gap-3 text-muted-foreground leading-relaxed">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <strong>Wissenschaftliche Info:</strong> Bei einem standardmäßigen 2D-Gitter (4er-Nachbarschaft) führt eine Baumdichte oberhalb von <strong>~59,3 %</strong> fast immer zu einem vollständigen Durchbrennen (Perkolation). Liegt die Dichte darunter, stirbt das Feuer fast immer lokal ab.
        </div>
      </div>
    </div>
  );
}
