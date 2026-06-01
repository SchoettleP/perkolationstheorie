import React, { useState, useEffect, useRef } from "react";
import {
  PercolationEngine,
  SimulationStats,
} from "../simulation/PercolationEngine";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Play,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  TrendingUp,
  Cpu,
} from "lucide-react";

interface MonteCarloSectionProps {
  gridRows: number;
  gridCols: number;
  currentP: number; // 0 to 100
  useDiagonal: boolean;
}

interface CurvePoint {
  density: number;
  successRate: number;
  avgBurnt: number;
}

interface HistogramBin {
  bin: string;
  count: number;
}

interface AnalysisSummary {
  runs: number;
  successRate: number;
  avgBurntArea: number;
  avgSteps: number;
  gridSize: string;
}

export const MonteCarloSection: React.FC<MonteCarloSectionProps> = ({
  gridRows,
  gridCols,
  currentP,
  useDiagonal,
}) => {
  const [runs, setRuns] = useState<number>(100);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>("");

  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [curveData, setCurveData] = useState<CurvePoint[]>([]);
  const [histogramData, setHistogramData] = useState<HistogramBin[]>([]);

  const cancelRef = useRef<boolean>(false);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  // Standard simulation runner (no canvas drawing)
  const runSimulation = (
    p: number,
  ): { success: boolean; stats: SimulationStats; steps: number } => {
    const engine = new PercolationEngine(gridCols, gridRows, p, useDiagonal);
    engine.startFire();

    let finished = false;
    while (!finished) {
      const stepRes = engine.step();
      finished = stepRes.finished;
    }

    return {
      success: engine.hasPercolated(),
      stats: engine.getStats(),
      steps: engine.stepCount,
    };
  };

  const handleStartAnalysis = async () => {
    if (isRunning) {
      cancelRef.current = true;
      setIsRunning(false);
      return;
    }

    setIsRunning(true);
    setProgress(0);
    cancelRef.current = false;
    setSummary(null);

    // Setup variables
    const runsPerDensity = Math.max(5, Math.round(runs / 10)); // Scale runs per density for the curve (10% of total runs, min 5)
    const densities = Array.from({ length: 41 }, (_, i) => 40 + i); // 40% to 80%
    const histogramRuns = runs;

    const calculatedCurve: CurvePoint[] = [];
    const tempHistogramRaw: number[] = [];

    let currentStep = 0;
    const totalSteps = densities.length + 1; // 41 steps for curve + 1 step for histogram at current P

    // Helper function to sleep/yield execution to keep browser UI responsive
    const yieldToBrowser = () =>
      new Promise((resolve) => setTimeout(resolve, 0));

    try {
      // 1. Run Histogram simulations at current P
      setStatusText(
        `Simuliere ${histogramRuns} Durchläufe bei Baumdichte ${currentP.toFixed(1)}%...`,
      );
      await yieldToBrowser();

      let histogramSuccessCount = 0;
      let totalBurntPercentage = 0;
      let totalStepsCount = 0;

      // Split histogram runs into small chunks to keep UI responsive
      const chunkSize = 20;
      for (let i = 0; i < histogramRuns; i += chunkSize) {
        if (cancelRef.current) throw new Error("Cancelled");

        const currentChunk = Math.min(chunkSize, histogramRuns - i);
        for (let j = 0; j < currentChunk; j++) {
          const res = runSimulation(currentP / 100);
          tempHistogramRaw.push(res.stats.burntPercentageOfTotalGrid);
          if (res.success) histogramSuccessCount++;
          totalBurntPercentage += res.stats.burntPercentageOfTotalGrid;
          totalStepsCount += res.steps;
        }

        setProgress(Math.round(((i + currentChunk) / histogramRuns) * 5)); // first 5% of progress bar
        await yieldToBrowser();
      }

      const histogramSummary: AnalysisSummary = {
        runs: histogramRuns,
        successRate: (histogramSuccessCount / histogramRuns) * 100,
        avgBurntArea: totalBurntPercentage / histogramRuns,
        avgSteps: totalStepsCount / histogramRuns,
        gridSize: `${gridCols}×${gridRows}`,
      };

      currentStep++;
      setProgress(10);

      // 2. Run Curve simulations (densities 40% to 80%)
      for (let dIdx = 0; dIdx < densities.length; dIdx++) {
        if (cancelRef.current) throw new Error("Cancelled");

        const density = densities[dIdx];
        setStatusText(
          `Simuliere Dichte ${density}% (${runsPerDensity} Durchläufe)...`,
        );
        await yieldToBrowser();

        let successCount = 0;
        let densityBurntTotal = 0;

        for (let r = 0; r < runsPerDensity; r++) {
          const res = runSimulation(density / 100);
          if (res.success) successCount++;
          densityBurntTotal += res.stats.burntPercentageOfTotalGrid;
        }

        calculatedCurve.push({
          density,
          successRate: (successCount / runsPerDensity) * 100,
          avgBurnt: densityBurntTotal / runsPerDensity,
        });

        currentStep++;
        setProgress(10 + Math.round((currentStep / totalSteps) * 90));
      }

      if (cancelRef.current) throw new Error("Cancelled");

      // 3. Process Histogram Bins
      // Split 0-100% burned area into 10 bins
      const bins = Array.from({ length: 10 }, (_, i) => ({
        bin: `${i * 10}-${(i + 1) * 10}%`,
        count: 0,
      }));

      tempHistogramRaw.forEach((val) => {
        const binIdx = Math.min(Math.floor(val / 10), 9);
        bins[binIdx].count++;
      });

      // Update state
      setHistogramData(bins);
      setCurveData(calculatedCurve);
      setSummary(histogramSummary);
      setStatusText("Analyse erfolgreich abgeschlossen!");
    } catch (e: any) {
      if (e.message === "Cancelled") {
        setStatusText("Analyse abgebrochen.");
      } else {
        setStatusText(`Fehler bei der Analyse: ${e.message}`);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const isLargeGrid = gridRows * gridCols > 40000; // grid size > 200x200

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Configuration Card */}
      <div className="bg-card text-foreground rounded-xl border border-border shadow-sm p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Cpu className="w-5 h-5 text-primary" />
          Monte-Carlo Simulationsparameter
        </h3>

        <p className="text-sm text-muted-foreground mb-6">
          Die Monte-Carlo-Analyse führt im Hintergrund hunderte von Simulationen
          ohne grafische Darstellung aus. Sie berechnet die
          Perkolations-Wahrscheinlichkeitskurve von 40% bis 80% Baumdichte sowie
          die Verteilung der verbrannten Waldfläche.
        </p>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span>Anzahl Durchläufe</span>
              <span className="text-primary bg-secondary px-2.5 py-0.5 rounded-md text-xs">
                {runs} Läufe
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="2000"
              step="10"
              value={runs}
              onChange={(e) => setRuns(parseInt(e.target.value))}
              disabled={isRunning}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10 (Schnell)</span>
              <span>1000</span>
              <span>2000 (Präzise)</span>
            </div>
          </div>

          {isLargeGrid && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Warnung:</strong> Die aktuelle Gittergröße ({gridCols}×
                {gridRows}) ist sehr groß. Monte-Carlo-Berechnungen können
                einige Zeit in Anspruch nehmen. Wir empfehlen, für die Analyse
                die Gittergröße unter Simulationseinstellungen auf ca. 50×50
                oder 100×100 zu reduzieren.
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleStartAnalysis}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 border shadow-sm transition-all active:scale-95 ${
                isRunning
                  ? "bg-destructive text-white border-destructive hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground border-primary hover:opacity-90"
              }`}
            >
              {isRunning ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Analyse abbrechen
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Analyse starten
                </>
              )}
            </button>

            {isRunning && (
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span className="truncate max-w-[80%] font-medium">
                    {statusText}
                  </span>
                  <span className="font-bold">{progress}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Erfolgsquote (Perkolation)
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-primary">
                {summary.successRate.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                bei {currentP.toFixed(1)}% Baumdichte
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {Math.round((summary.successRate / 100) * summary.runs)} von{" "}
                {summary.runs} Feuern erreichten das rechte Ufer
              </span>
            </p>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ø Verbrannte Fläche
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-amber-500">
                {summary.avgBurntArea.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                des gesamten Waldes
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              Durchschnittlich vernichtete Fläche pro Brandereignis
            </p>
          </div>

          <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ø Laufzeit der Brandfront
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-700 dark:text-slate-200">
                {summary.avgSteps.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                Zeitschritte (Ticks)
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">
              Gittergröße für Analyse: {summary.gridSize}
            </p>
          </div>
        </div>
      )}

      {/* Diagrams Section */}
      {curveData.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
          {/* Transition Curve */}
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col">
            <h4 className="text-sm font-bold flex items-center gap-2 mb-4 border-b border-border pb-2 text-foreground">
              <TrendingUp className="w-4 h-4 text-primary" />
              Erfolgsquote gegen Baumdichte (Perkolations-Wahrscheinlichkeit)
            </h4>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={curveData}
                  margin={{ top: 15, right: 20, left: 20, bottom: 25 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    opacity={0.6}
                  />
                  <XAxis
                    dataKey="density"
                    label={{
                      value: "Baumdichte (%)",
                      position: "insideBottom",
                      offset: -15,
                      style: { fill: "var(--muted-foreground)", fontSize: 11 }
                    }}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    stroke="var(--border)"
                  />
                  <YAxis
                    domain={[0, 100]}
                    label={{
                      value: "Perkolationswahrscheinlichkeit (%)",
                      angle: -90,
                      position: "insideLeft",
                      offset: -10,
                      style: { textAnchor: "middle", fill: "var(--muted-foreground)", fontSize: 11 }
                    }}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    stroke="var(--border)"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", marginTop: "10px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="successRate"
                    name="Perkolations-Erfolg (%)"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  {/* Reference line for the 59.27% percolation threshold */}
                  <ReferenceLine
                    x={59}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: "Kritische Schwelle (~59.3%)",
                      fill: "#ef4444",
                      fontSize: 10,
                      position: "insideTopLeft",
                      offset: 10
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 text-center">
              Die rote gestrichelte Linie markiert die theoretische
              Perkolationsschwelle bei ca. 59,3%. Rechts davon steigt die Kurve
              steil an (Phase Transition).
            </p>
          </div>

          {/* Burned Area Histogram */}
          {histogramData.length > 0 && (
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-col">
              <h4 className="text-sm font-bold flex items-center gap-2 mb-4 border-b border-border pb-2 text-foreground">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                Häufigkeitsverteilung der verbrannten Gesamtfläche
              </h4>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={histogramData}
                    margin={{ top: 15, right: 20, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      opacity={0.6}
                    />
                    <XAxis
                      dataKey="bin"
                      label={{
                        value: "Verbrannte Fläche (%)",
                        position: "insideBottom",
                        offset: -15,
                        style: { fill: "var(--muted-foreground)", fontSize: 11 }
                      }}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      stroke="var(--border)"
                    />
                    <YAxis
                      label={{
                        value: "Häufigkeit (Anzahl)",
                        angle: -90,
                        position: "insideLeft",
                        offset: -10,
                        style: { textAnchor: "middle", fill: "var(--muted-foreground)", fontSize: 11 }
                      }}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      stroke="var(--border)"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Anzahl Läufe"
                      fill="var(--primary)"
                      opacity={0.8}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 text-center">
                Verteilung der verbrannten Fläche (in % des gesamten Gitters)
                über alle {runs} Durchläufe bei einer Baumdichte von{" "}
                {currentP.toFixed(1)}%.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
