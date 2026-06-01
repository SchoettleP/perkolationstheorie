import React, { useState } from "react";
import { ChevronDown, BookOpen, Network, Flame, Info, GitFork } from "lucide-react";

interface AccordionItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export const TheoryAccordion: React.FC = () => {
  const [openItem, setOpenItem] = useState<string | null>("percolation");

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  const theoryItems: AccordionItem[] = [
    {
      id: "percolation",
      title: "Was ist Perkolation?",
      icon: <Info className="w-4 h-4 text-blue-500" />,
      content: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Das Wort <strong>Perkolation</strong> leitet sich vom lateinischen <em>percolare</em> („durchsickern“) ab. 
            In der Physik und Mathematik beschreibt die Perkolationstheorie das Verhalten von Clustern in ungeordneten Medien.
          </p>
          <p>
            Stellen Sie sich vor, Sie gießen Wasser auf einen Schwamm oder Kaffeesatz. Wenn genügend winzige Kanäle miteinander verbunden sind, kann das Wasser von oben nach unten durchsickern (perkolieren). Gibt es zu wenige Verbindungen, bleibt das Wasser stecken. 
            Die Perkolationstheorie untersucht mathematisch, ab welchem Punkt ein solcher durchgehender Pfad entsteht.
          </p>
        </div>
      ),
    },
    {
      id: "forestfire",
      title: "Waldbrände als klassisches Modell",
      icon: <Flame className="w-4 h-4 text-red-500" />,
      content: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Ein Waldbrand ist ein hervorragendes Anschauungsbeispiel für <strong>Schnittstellenperkolation</strong> (Bond/Site Percolation) auf einem zweidimensionalen Gitter:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Die Zellen:</strong> Jeder Gitterplatz ist entweder leer (Lichtung) oder besetzt (Baum).</li>
            <li><strong>Die Baumdichte (<em>p</em>):</strong> Die Wahrscheinlichkeit, mit der ein Gitterplatz einen Baum enthält.</li>
            <li><strong>Der Brand:</strong> Das Feuer startet links und kann sich nur auf direkt benachbarte Bäume ausbreiten (nicht über leere Zellen hinweg).</li>
            <li><strong>Die Perkolation:</strong> Wenn das Feuer das rechte Ufer erreicht, existiert ein zusammenhängender Cluster (Pfad) aus Bäumen von links nach rechts. Der Wald gilt als „perkoliert“.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "criticalpoint",
      title: "Kritischer Punkt (Phasenübergang)",
      icon: <GitFork className="w-4 h-4 text-amber-500" />,
      content: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Das faszinierendste Phänomen in der Perkolationstheorie ist der abrupte <strong>Phasenübergang</strong> (Phase Transition) am sogenannten <strong>kritischen Punkt <em>p</em><sub>c</sub></strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Bei einer Baumdichte <strong>unter <em>p</em><sub>c</sub></strong> ist die Wahrscheinlichkeit, dass das Feuer das andere Ende erreicht, bei sehr großen Gittern praktisch <strong>0 %</strong>. Das Feuer erlischt schnell, da die Bäume isolierte Inseln (Cluster) bilden.</li>
            <li>Bei einer Baumdichte <strong>über <em>p</em><sub>c</sub></strong> springt die Wahrscheinlichkeit schlagartig gegen <strong>100 %</strong>. Es bildet sich ein „riesiger unendlicher Cluster“ (Spanning Cluster), der den gesamten Wald durchzieht.</li>
          </ul>
          <p>
            In unendlich großen Gittern ist dieser Übergang absolut scharf (mathematische Diskontinuität). Bei endlichen Gittern (wie unserem 100x100 Gitter) ist dieser Übergang leicht abgerundet, aber in der Monte-Carlo-Kurve immer noch deutlich als steile S-Kurve erkennbar.
          </p>
        </div>
      ),
    },
    {
      id: "threshold59",
      title: "Warum liegt die Schwelle bei ~59,27%?",
      icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
      content: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Für ein unendliches quadratisches 2D-Gitter mit 4er-Nachbarschaft (Site Percolation) beträgt die exakte Perkolationsschwelle näherungsweise:
            <span className="block my-2 text-center text-lg font-mono font-bold text-primary">
              <em>p</em><sub>c</sub> ≈ 0.592746 (ca. 59,27 %)
            </span>
            Es gibt für diesen Wert keine geschlossene analytische Formel – er wurde durch extrem präzise Computersimulationen ermittelt.
          </p>
          <p>
            <strong>Einfluss der Nachbarschaft (Konnektivität):</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>4er-Nachbarschaft (oben, unten, links, rechts):</strong> Bäume müssen direkt Kante an Kante stehen. Die Schwelle liegt bei ~59,3 %.</li>
            <li><strong>8er-Nachbarschaft (inklusive Diagonale):</strong> Durch die zusätzliche Diagonalausbreitung gibt es viel mehr Wege für das Feuer. Die Perkolationsschwelle sinkt drastisch auf <strong><em>p</em><sub>c</sub> ≈ 0.4072 (ca. 40,7 %)</strong>, da das Feuer leichter Lücken überspringen kann.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "connections",
      title: "Zusammenhang zu Epidemien und Netzwerken",
      icon: <Network className="w-4 h-4 text-indigo-500" />,
      content: (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Die Perkolationstheorie findet in vielen Disziplinen außerhalb der Forstwirtschaft Anwendung:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Epidemiologie (Ausbreitung von Krankheiten):</strong> Ein Virus verbreitet sich in einer Bevölkerung analog zu einem Waldbrand. Die kritische Schwelle entspricht der Herdenimmunität: Wenn die Dichte empfänglicher Personen unter einen kritischen Wert sinkt, kann sich die Pandemie nicht mehr global ausbreiten.</li>
            <li><strong>Stromnetze und Infrastruktur:</strong> Wie viele Stromleitungen oder Serverknoten dürfen ausfallen (EMPTY werden), bevor das Gesamtnetzwerk zusammenbricht und kein Strom/Datenstrom mehr fließen kann (Verlust des Spanning Clusters)?</li>
            <li><strong>Materialwissenschaften (Leitfähigkeit):</strong> Wie hoch muss der Anteil von Metallpartikeln in einem Kunststoffgemisch sein, damit der Kunststoff plötzlich elektrisch leitend wird?</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Perkolationstheorie & wissenschaftlicher Hintergrund
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Hintergründe zu Phasenübergängen, Schwellenwerten und praktischen Anwendungen in der modernen Netzwerktheorie.
        </p>
      </div>

      <div className="divide-y divide-border">
        {theoryItems.map((item) => {
          const isOpen = openItem === item.id;
          return (
            <div key={item.id} className="w-full">
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full py-4 px-5 flex items-center justify-between text-left font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-secondary flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-sm md:text-base font-bold">{item.title}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                    isOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? "max-h-[600px] border-t border-border" : "max-h-0"
                }`}
              >
                <div className="p-5 bg-slate-50/20 dark:bg-slate-900/10 leading-relaxed">
                  {item.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
