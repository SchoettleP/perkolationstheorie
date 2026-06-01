# Waldbrand & Perkolationstheorie: Wissenschaftlicher Simulator

Ein interaktiver, webbasierter Simulator zur Visualisierung und statistischen Analyse von Phasenübergängen am klassischen Modell eines Waldbrands (*Site Percolation* auf einem 2D-Quadratgitter).

Dieses Tool demonstriert eindrucksvoll das physikalische und mathematische Phänomen der **Perkolation**, bei dem eine geringfügige Änderung der Baumdichte ($p$) zu einem abrupten, makroskopischen Systemwechsel (Phasenübergang) führt.

---

## 🌟 Features

### 1. Interaktive Simulation
* **Echtzeit-Visualisierung**: Starten Sie ein Schadfeuer an der linken Kante und beobachten Sie die dynamische Ausbreitung der Brandfront durch den Wald.
* **Flexible Konfiguration**:
  * Rasterdimensionen frei wählbar (z. B. $50 \times 50$ bis hin zu hochauflösenden Gittern).
  * Stufenlose Einstellung der Baumdichte ($p$) von 0 % bis 100 %.
  * Regelbare Simulationsgeschwindigkeit.
  * Umschaltbare Konnektivität: Klassische **4er-Nachbarschaft** (oben, unten, links, rechts) oder erweiterte **8er-Nachbarschaft** (inklusive Diagonalen).
* **Interaktive Canvas-Oberfläche**: Hochperformantes Rendering mittels HTML5 Canvas. Unterstützt freies **Zoomen (Mausrad)** und **Verschieben (Drag & Drop)** zur detaillierten Untersuchung von Clustern.
* **Live-Statistiken**: Laufende Erfassung von gesunden Bäumen, aktiven Brandherden, verbrannter Fläche (Asche) sowie der präzisen Simulationsdauer.

### 2. Monte-Carlo-Analyse
* **Statistische Auswertung**: Führen Sie hunderte Simulationen im Hintergrund aus (asynchron gebatcht, um den Browser-Thread flüssig zu halten).
* **Perkolations-Wahrscheinlichkeitskurve**: Live-Generierung der charakteristischen **S-Kurve (Phasenübergang)** über ein Dichtespektrum von 40 % bis 80 %.
* **Verteilungs-Histogramm**: Darstellung der Häufigkeitsverteilung der schlussendlich verbrannten Waldfläche zur Analyse kritischer Clusterstrukturen.
* **Referenzlinien**: Visueller Abgleich mit den theoretischen Grenzwerten ($p_c \approx 59{,}27\,\%$ bei 4er- und $p_c \approx 40{,}72\,\%$ bei 8er-Nachbarschaft).

### 3. Wissenschaftlicher Hintergrund
* **Integriertes Theorie-Kompendium**: Anschauliche Erläuterungen zu:
  * Mathematischer Definition der Perkolation
  * Unterschieden zwischen 4er- und 8er-Konnektivität
  * Verwandten Systemen in der echten Welt (Ausbreitung von Epidemien/Herdenimmunität, Stabilität von Strom- und Datennetzen, elektrische Leitfähigkeit von Mischmaterialien).

---

## 🛠️ Technologie-Stack

* **Core**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
* **Build-Tool**: [Vite](https://vitejs.dev/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **UI-Komponenten**: [Radix UI](https://www.radix-ui.com/) (Primitives für Tabs, Progress, Slider, Accordion)
* **Datenvisualisierung**: [Recharts](https://recharts.org/) (für die interaktiven Kurven und Histogramme)
* **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Projektstruktur

```bash
src/
├── components/                     # React UI-Komponenten
│   ├── Header.tsx                  # Kopfzeile mit ThemeToggle und Logo
│   ├── Footer.tsx                  # Fußzeile mit Projektinformationen
│   ├── LiveStats.tsx               # Anzeige der Live-Simulationsmetriken
│   ├── MonteCarloSection.tsx       # Einstellungen und Diagramme der statistischen Analyse
│   ├── SimulationCanvas.tsx        # Interaktive Canvas-Komponente mit Pan & Zoom
│   ├── SimulationSettings.tsx      # Steuerpanel für Dichte, Gittergröße und Geschwindigkeit
│   ├── SimulationTab.tsx           # Layout-Container für das Simulations-Tab
│   ├── ThemeToggle.tsx             # Schalter für Hell-/Dunkelmodus
│   └── TheoryAccordion.tsx         # Wissenschaftliches Theorie-Panel
├── hooks/
│   └── usePercolation.ts           # React-Hook zur Kapselung des Simulationszustands
├── simulation/
│   └── PercolationEngine.ts        # Reine TypeScript-Klasse für Gitter-Logik (Uint8Array)
├── App.tsx                         # Haupt-Layout und Tab-Steuerung
├── main.tsx                        # App-Einstiegspunkt
└── index.css                       # Globale Styles & Design-Tokens (CSS-Variablen für HSL-Farben)
```

---

## 🚀 Installation & lokale Ausführung

Folgen Sie diesen Schritten, um das Projekt lokal auf Ihrem Rechner einzurichten:

### Voraussetzungen
Stellen Sie sicher, dass Sie [Node.js](https://nodejs.org/) (Version 18 oder höher empfohlen) und npm installiert haben.

### 1. Repository klonen
```bash
git clone https://github.com/SchoettleP/perkolationstheorie.git
cd perkolationstheorie
```

### 2. Abhängigkeiten installieren
```bash
npm install
```

### 3. Entwicklungsserver starten
```bash
npm run dev
```

Die Anwendung startet standardmäßig unter [http://localhost:5173](http://localhost:5173). Öffnen Sie diesen Link im Browser.

### 4. Build für Produktion (Optional)
Um ein optimiertes Build für das Deployment zu erstellen:
```bash
npm run build
```
Die statischen Dateien werden im Ordner `dist` generiert.

---

## 📖 Wissenschaftliche Grundlagen im Überblick

In einem unendlich großen zweidimensionalen Gitter existiert eine exakte Schwelle $p_c$ für die Baumdichte:
* **$p < p_c$**: Ein Feuer an einer Seite erlischt mit einer Wahrscheinlichkeit von nahezu 100 % nach kurzer Zeit, da die Bäume isolierte Cluster bilden.
* **$p > p_c$**: Das Feuer perkolliert fast sicher bis zur gegenüberliegenden Seite, da sich ein sogenannter *Spanning Cluster* bildet.

Im Simulator können Sie den Übergang von lokalen Inseln zu einem globalen Netzwerk selbst erforschen:

| Nachbarschaftstyp | Konnektivität | Kritische Schwelle ($p_c$) |
| :--- | :--- | :--- |
| **4er-Nachbarschaft** | Nur horizontale & vertikale Kontakte | $p_c \approx 59{,}27\,\%$ |
| **8er-Nachbarschaft** | Kanten- und Eckkontakte (diagonal) | $p_c \approx 40{,}72\,\%$ |

---

## 📄 Lizenz

Dieses Projekt ist unter der [MIT-Lizenz](LICENSE) lizenziert.
