import { CheckCircle2, XCircle } from "lucide-react";
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
}

export function SimulationTab({
  grid,
  rows,
  cols,
  stepCount,
  stats,
  runtime,
  percolationResult
}: SimulationTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Percolation Status Alert */}
      {percolationResult === "success" && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-xl flex gap-3 shadow-sm transition-all duration-300">
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
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-300 rounded-xl flex gap-3 shadow-sm transition-all duration-300">
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

      {/* Canvas Container Card */}
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <SimulationCanvas
          grid={grid}
          width={cols}
          height={rows}
          stepCount={stepCount}
        />
      </div>

      {/* Live Statistics cards */}
      {stats && (
        <LiveStats
          stats={stats}
          stepCount={stepCount}
          runtime={runtime}
        />
      )}
    </div>
  );
}
