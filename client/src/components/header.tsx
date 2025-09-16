
import petCollagePath from "@assets/image_1758019973764.png";

export function Header() {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Geometric logo with pet collage pattern */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-primary via-accent to-secondary p-0.5">
              <div className="w-full h-full rounded-lg overflow-hidden">
                <img 
                  src={petCollagePath} 
                  alt="Pet care logo with various dogs and cats" 
                  className="w-full h-full object-cover opacity-80" 
                />
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
