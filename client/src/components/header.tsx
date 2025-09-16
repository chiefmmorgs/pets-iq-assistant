
export function Header() {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Pet care icon placeholder */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-primary via-accent to-secondary p-0.5">
              <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.5 12a7.5 7.5 0 0 0 14.998 0A17.933 17.933 0 0 1 12 5.75c-2.676 0-5.216.584-7.5 1.634A17.933 17.933 0 0 1 12 18.25A17.933 17.933 0 0 1 4.5 12Z"/>
                  <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0Z"/>
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 mix-blend-overlay"></div>
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
