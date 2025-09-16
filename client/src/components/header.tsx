
export function Header() {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Geometric logo with pet theme */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-primary via-accent to-secondary p-0.5">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.5 12c0-1.232.046-2.453.138-3.662a4.006 4.006 0 0 1 3.7-3.7 48.678 48.678 0 0 1 7.324 0 4.006 4.006 0 0 1 3.7 3.7c.092 1.21.138 2.43.138 3.662 0 1.232-.046 2.453-.138 3.662a4.006 4.006 0 0 1-3.7 3.7 48.657 48.657 0 0 1-7.324 0 4.006 4.006 0 0 1-3.7-3.7A48.696 48.696 0 0 1 4.5 12Z"/>
                  <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 mix-blend-overlay"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-foreground">Pets IQ Bot</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Pet Care Guidance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span>Available 24/7</span>
            </div>
            <button 
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              data-testid="button-menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
