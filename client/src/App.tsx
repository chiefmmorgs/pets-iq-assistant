import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import logoImage from "@assets/chiefmmorgs-logo.png";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        
        {/* Powered by credit in bottom right corner */}
        <div 
          className="fixed bottom-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground z-50"
          data-testid="powered-by-credit"
        >
          <span>powered by</span>
          <img 
            src={logoImage} 
            alt="chiefmmorgs" 
            className="h-8 opacity-70"
          />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
