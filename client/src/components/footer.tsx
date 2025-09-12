import logoUrl from '@assets/chiefmmorgs_white_1757691007314.png';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-semibold mb-3 font-display">Pets IQ Bot</h4>
            <p className="text-sm text-muted-foreground">AI-powered pet care guidance available 24/7. Not a substitute for professional veterinary care.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 font-display">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Our AI</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 font-display">Emergency Notice</h4>
            <p className="text-sm text-muted-foreground">This tool provides guidance only. For true emergencies, contact your veterinarian or emergency animal hospital immediately.</p>
          </div>
        </div>
        <div className="border-t border-border/50 mt-8 pt-8 relative">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Pets IQ Bot. Powered by AI veterinary expertise.</p>
          </div>
          <div className="absolute bottom-0 left-0 flex items-center gap-2 text-xs text-muted-foreground/70 pointer-events-none">
            <span data-testid="text-branding">something by</span>
            <img 
              src={logoUrl} 
              alt="Chiefmmorgs logo" 
              className="h-4 w-auto opacity-80"
              data-testid="img-brand-logo"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
