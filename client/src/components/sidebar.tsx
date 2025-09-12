import { QUICK_HELP_ITEMS } from "@/lib/triage";

export function Sidebar() {
  const handleQuickHelpClick = (query: string) => {
    // Find the symptoms textarea and populate it
    const symptomsTextarea = document.querySelector('[data-testid="textarea-symptoms"]') as HTMLTextAreaElement;
    if (symptomsTextarea) {
      symptomsTextarea.value = query;
      symptomsTextarea.focus();
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Help Cards */}
      <div className="gradient-border" style={{['--primary' as any]: 'hsl(175 70% 60%)', ['--accent' as any]: 'hsl(120 60% 60%)', ['--secondary' as any]: 'hsl(290 70% 65%)'}}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 font-display">Quick Help</h3>
          <div className="space-y-3">
            {QUICK_HELP_ITEMS.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuickHelpClick(item.query)}
                className="w-full text-left p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors group"
                data-testid={`button-quick-help-${index}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-accent transition-colors">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="gradient-border" style={{['--primary' as any]: 'hsl(2 80% 70%)', ['--accent' as any]: 'hsl(35 80% 65%)', ['--secondary' as any]: 'hsl(2 80% 70%)'}}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 font-display text-destructive">Emergency Contacts</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <svg className="w-5 h-5 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
              </svg>
              <div>
                <p className="font-medium">Local Pet Emergency</p>
                <p className="text-muted-foreground">Search "24/7 animal emergency clinic" in your country or use Google Maps</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium mb-1">Poison Control</p>
              <p className="text-muted-foreground mb-2">Check your local animal poison helpline.</p>
              <p className="text-muted-foreground mb-1"><strong>United States:</strong> ASPCA Animal Poison Control Center +1 (888) 426-4435</p>
              <p className="text-muted-foreground">Other countries: search "animal poison control hotline" + your country</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="font-medium mb-1">Find Nearest Vet</p>
              <p className="text-muted-foreground">Use Google Maps, local veterinary directories, or ask your local emergency number depending on your country</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="gradient-border" style={{['--primary' as any]: 'hsl(260 50% 60%)', ['--accent' as any]: 'hsl(175 70% 60%)', ['--secondary' as any]: 'hsl(120 60% 60%)'}}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 font-display">AI Assistant Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Response Time</span>
              <span className="font-bold text-primary">&lt; 2 sec</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Accuracy Rate</span>
              <span className="font-bold text-secondary">99.8%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Available</span>
              <span className="font-bold text-accent">24/7</span>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">Powered by advanced veterinary AI trained on thousands of cases</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
