import React from "react";
import { SimulationStats } from "../simulation/PercolationEngine";
import { Flame, Trees, History, RotateCcw } from "lucide-react";

interface LiveStatsProps {
  stats: SimulationStats;
  stepCount: number;
  runtime: number; // in milliseconds
}

export const LiveStats: React.FC<LiveStatsProps> = ({ stats, stepCount, runtime }) => {
  const density = stats.totalCells > 0 ? (stats.initialTrees / stats.totalCells) * 100 : 0;
  
  // Format runtime to seconds with decimals
  const formattedRuntime = (runtime / 1000).toFixed(2);

  const statItems = [
    {
      title: "Baumdichte",
      value: `${density.toFixed(1)}%`,
      sub: `${stats.initialTrees.toLocaleString()} / ${stats.totalCells.toLocaleString()} Zellen`,
      icon: <Trees className="w-5 h-5 text-primary" />,
      bg: "bg-primary/10 dark:bg-primary/20",
    },
    {
      title: "Brennend",
      value: stats.burning.toLocaleString(),
      sub: "Aktive Brandherde",
      icon: <Flame className="w-5 h-5 text-orange-500 animate-pulse" />,
      bg: "bg-orange-500/10 dark:bg-orange-500/20",
    },
    {
      title: "Verbrannt",
      value: stats.burnt.toLocaleString(),
      sub: `${stats.burntPercentageOfInitialTrees.toFixed(1)}% der Bäume`,
      icon: <RotateCcw className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />,
      bg: "bg-neutral-500/10 dark:bg-neutral-500/20",
    },
    {
      title: "Fortschritt",
      value: `Schritt ${stepCount}`,
      sub: `${formattedRuntime}s Laufzeit`,
      icon: <History className="w-5 h-5 text-amber-500" />,
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="p-4 rounded-xl bg-card border border-border flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {item.title}
              </span>
              <span className="text-xl font-bold mt-1 text-foreground">
                {item.value}
              </span>
            </div>
            <div className={`p-2.5 rounded-lg ${item.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
              {item.icon}
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
            <span>{item.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
