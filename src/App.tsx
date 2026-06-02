import { useState } from "react";
import { usePercolation } from "./hooks/usePercolation";
import { Header } from "./components/Header";
import { SimulationSettings } from "./components/SimulationSettings";
import { SimulationTab } from "./components/SimulationTab";
import { MonteCarloSection } from "./components/MonteCarloSection";
import { TheoryAccordion } from "./components/TheoryAccordion";
import { Footer } from "./components/Footer";
import { Tv, BarChart2, BookOpen } from "lucide-react";

function App() {
  const [activeTab, setActiveTab] = useState<
    "simulation" | "analysis" | "theory"
  >("simulation");
  const sim = usePercolation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="sr-only">Interaktiver Waldbrand- und Perkolationstheorie-Simulator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Settings Sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <SimulationSettings
              settings={sim.settings}
              setRows={sim.setRows}
              setCols={sim.setCols}
              setProbability={sim.setProbability}
              setUseDiagonal={sim.setUseDiagonal}
              setSpeedLevel={sim.setSpeedLevel}
              simState={sim.simState}
              onGenerate={sim.generateGrid}
              onStart={sim.startFire}
              onPause={sim.handlePause}
              onResume={sim.handleResume}
              onReset={sim.resetGridToInitial}
              getSpeedLabel={sim.getSpeedLabel}
              showClusters={sim.showClusters}
              setShowClusters={sim.setShowClusters}
            />
          </aside>

          {/* Main Display Area (Tabs + Canvas/Charts/Theory) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Navigation Tabs */}
            <nav aria-label="Hauptnavigation" className="flex border-b border-border overflow-x-auto whitespace-nowrap scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              <button
                onClick={() => setActiveTab("simulation")}
                className={`pb-3 px-4 border-b-2 font-outfit text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "simulation"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Tv className="w-4 h-4" />
                Interaktive Simulation
              </button>
              <button
                onClick={() => setActiveTab("analysis")}
                className={`pb-3 px-4 border-b-2 font-outfit text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "analysis"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                Monte-Carlo Analyse
              </button>
              <button
                onClick={() => setActiveTab("theory")}
                className={`pb-3 px-4 border-b-2 font-outfit text-sm font-semibold transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "theory"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Perkolationstheorie
              </button>
            </nav>

            {/* Tab Panels */}
            <div className="flex flex-col gap-6">
              {/* TAB 1: SIMULATION */}
              {activeTab === "simulation" && (
                <SimulationTab
                  grid={sim.grid}
                  rows={sim.settings.rows}
                  cols={sim.settings.cols}
                  stepCount={sim.stepCount}
                  stats={sim.stats}
                  runtime={sim.runtime}
                  percolationResult={sim.percolationResult}
                  showClusters={sim.showClusters}
                  clusterGrid={sim.clusterGrid}
                  highlightedClusterId={sim.highlightedClusterId}
                  isClusterSpanning={sim.isClusterSpanning}
                  currentStepIndex={sim.currentStepIndex}
                  jumpToStep={sim.jumpToStep}
                />
              )}

              {/* TAB 2: MONTE CARLO ANALYSIS */}
              {activeTab === "analysis" && (
                <MonteCarloSection
                  gridRows={sim.settings.rows}
                  gridCols={sim.settings.cols}
                  currentP={sim.settings.probability}
                  useDiagonal={sim.settings.useDiagonal}
                />
              )}

              {/* TAB 3: THEORY */}
              {activeTab === "theory" && <TheoryAccordion />}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
