
import { SiX } from "react-icons/si";

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
              <li><a href="https://github.com/UIDickinson/pets-iq-assistant" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">About Our AI</a></li>
              <li><a href="https://sentient.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">SentientAGI</a></li>
              <li><a href="https://x.com/SentientAGI" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Sentient_Official_X</a></li>
              <li><a href="https://discord.com/invite/sentientfoundation" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Sentient Discord</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 font-display">Connect</h4>
            <div className="space-y-3">
              <a 
                href="https://x.com/ui_anon" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-twitter"
              >
                <SiX className="h-4 w-4" />
                Follow @ui_anon
              </a>
              <p className="text-xs text-muted-foreground">For emergencies, contact your veterinarian immediately.</p>
            </div>
          </div>
        </div>
        <div className="border-t border-border/50 mt-8 pt-8 relative">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; Pets IQ Bot. Developed MM_UI.</p>
          </div>
          <div className="absolute bottom-0 left-0 flex items-center gap-2 text-xs text-muted-foreground/70 pointer-events-none">
            <span data-testid="text-branding">Pets IQ Bot</span>
            <div className="h-6 w-6 rounded bg-gradient-to-br from-primary to-accent opacity-80" data-testid="img-brand-logo"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
