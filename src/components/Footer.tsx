export function Footer() {
  return (
    <footer className="border-t border-border py-6 mt-12 bg-card/40">
      <div className="max-w-7xl mx-auto px-4 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Waldbrand-Visualisierung • Perkolationstheorie Lernplattform</p>
        <p className="mt-1">Entwickelt als performante, clientseitige Single Page Application in React, TypeScript &amp; Canvas</p>
      </div>
    </footer>
  );
}
