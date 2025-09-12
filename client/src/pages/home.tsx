import { useState } from "react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { ChatInterface } from "../components/chat-interface";
import { Sidebar } from "../components/sidebar";

export default function Home() {
  const [emergencyDetected, setEmergencyDetected] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground paw-pattern">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ChatInterface 
              emergencyDetected={emergencyDetected}
              setEmergencyDetected={setEmergencyDetected}
            />
          </div>
          <div>
            <Sidebar />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
