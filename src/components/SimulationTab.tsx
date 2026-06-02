import { CheckCircle2, XCircle, History, SkipBack, SkipForward, ChevronLeft, ChevronRight } from "lucide-react";
import { SimulationCanvas } from "./SimulationCanvas";
import { LiveStats } from "./LiveStats";
import { SimulationStats } from "../simulation/PercolationEngine";

interface SimulationTabProps {
  grid: Uint8Array;
  rows: number;
  cols: number;
  stepCount: number;
  stats: SimulationStats | null;
  runtime: number;
  percolationResult: "success" | "failure" | null;
  
  // Cluster visualization properties
  showClusters?: boolean;
  clusterGrid?: Int32Array | null;
  highlightedClusterId?: number;
  isClusterSpanning?: boolean;

  // Replay control properties
  currentStepIndex?: number;
  jumpToStep?: (index: number) => void;
}

export function SimulationTab({
  grid,
  rows,
  cols,
  stepCount,
  stats,
  runtime,
  percolationResult,
  showClusters = false,
  clusterGrid = null,
  highlightedClusterId = -1,
  isClusterSpanning = false,
  currentStepIndex = 0,
  jumpToStep = () => {}
}: SimulationTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Percolation Status Alert */}
      {percolationResult === "success" && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-xl flex gap-3 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
          <div>
            <h4 className="font-bold text-sm">Perkolation erfolgreich!</h4>
            <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
              Das Feuer hat einen durchgehenden Pfad von der linken zur rechten Kante gebildet. 
              Es existiert eine kontinuierliche Kette brennbarer Zellen im Gitter.
            </p>
          </div>
        </div>
      )}

      {percolationResult === "failure" && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-300 rounded-xl flex gap-3 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-4 duration-300">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div>
            <h4 className="font-bold text-sm">Keine Perkolation</h4>
            <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
              Das Feuer ist erloschen, ohne das rechte Ufer zu erreichen. 
              Es existiert kein durchgehender Pfad aus brennbaren Bäumen.
            </p>
          </div>
        </div>
      )}

      {/* Cluster Analysis Info Alert */}
      {showClusters && percolationResult === null && (
        isClusterSpanning ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-xl flex gap-3 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
            <div>
              <h4 className="font-bold text-sm">Spannender Cluster (Perkolationspfad) vorhanden</h4>
              <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                Der größte Baum-Cluster (leuchtend grün) verbindet die linke mit der rechten Kante. 
                Ein gestartetes Schadfeuer wird mit Sicherheit perkolieren (durchbrennen).
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-xl flex gap-3 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-4 duration-300">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <h4 className="font-bold text-sm">Kein durchgehender Pfad (Unterkritisch)</h4>
              <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                Der größte Cluster (leuchtend grün) ist isoliert und erreicht nicht beide Ufer. 
                Ein Feuer kann sich nicht vollständig ausbreiten.
              </p>
            </div>
          </div>
        )
      )}

      {/* Canvas Container Card */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <SimulationCanvas
          grid={grid}
          width={cols}
          height={rows}
          stepCount={stepCount}
          showClusters={showClusters}
          clusterGrid={clusterGrid}
          highlightedClusterId={highlightedClusterId}
        />

        {/* Replay Controls (Timeline / Zeitstrahl) */}
        {stepCount > 0 && (
          <div className="mt-5 pt-5 border-t border-border flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5 font-outfit uppercase tracking-wider">
                <History className="w-3.5 h-3.5 text-primary" />
                Zeitstrahl (Replay)
              </span>
              <span className="bg-secondary px-2.5 py-0.5 rounded text-primary font-bold text-[11px]">
                Schritt {currentStepIndex} / {stepCount}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Step navigation buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => jumpToStep(0)}
                  disabled={currentStepIndex === 0}
                  className="p-1.5 bg-secondary hover:bg-muted border border-border text-foreground rounded-lg disabled:opacity-40 transition-colors flex items-center justify-center active:scale-95"
                  title="Zum Anfang springen"
                  aria-label="Zum Anfang springen"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => jumpToStep(Math.max(0, currentStepIndex - 1))}
                  disabled={currentStepIndex === 0}
                  className="p-1.5 bg-secondary hover:bg-muted border border-border text-foreground rounded-lg disabled:opacity-40 transition-colors flex items-center justify-center active:scale-95"
                  title="Einen Schritt zurück"
                  aria-label="Einen Schritt zurück"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                type="range"
                min="0"
                max={stepCount}
                value={currentStepIndex}
                onChange={(e) => jumpToStep(parseInt(e.target.value))}
                className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                aria-label="Brandverlauf scrubben"
              />

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => jumpToStep(Math.min(stepCount, currentStepIndex + 1))}
                  disabled={currentStepIndex === stepCount}
                  className="p-1.5 bg-secondary hover:bg-muted border border-border text-foreground rounded-lg disabled:opacity-40 transition-colors flex items-center justify-center active:scale-95"
                  title="Einen Schritt vor"
                  aria-label="Einen Schritt vor"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => jumpToStep(stepCount)}
                  disabled={currentStepIndex === stepCount}
                  className="p-1.5 bg-secondary hover:bg-muted border border-border text-foreground rounded-lg disabled:opacity-40 transition-colors flex items-center justify-center active:scale-95"
                  title="Zum Ende springen"
                  aria-label="Zum Ende springen"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground text-center">
              Nutze den Slider oder die Tasten, um den Brandverlauf rückwärts/vorwärts anzusehen. Das Fortsetzen ist jederzeit möglich.
            </div>
          </div>
        )}
      </div>

      {/* Live Statistics cards */}
      {stats && (
        <LiveStats
          stats={stats}
          stepCount={currentStepIndex} // Show step count matching the scrubbed index
          runtime={runtime}
        />
      )}
    </div>
  );
}
