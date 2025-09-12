import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { petAssessmentSchema, type PetAssessmentRequest, type TriageResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  response?: TriageResponse;
}

interface ChatInterfaceProps {
  emergencyDetected: boolean;
  setEmergencyDetected: (detected: boolean) => void;
}

export function ChatInterface({ emergencyDetected, setEmergencyDetected }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const form = useForm<PetAssessmentRequest>({
    resolver: zodResolver(petAssessmentSchema),
    defaultValues: {
      petType: "dog",
      petAge: "",
      symptoms: "",
    },
  });

  const assessmentMutation = useMutation({
    mutationFn: async (data: PetAssessmentRequest) => {
      try {
        const response = await apiRequest("POST", "/api/assess", data);
        
        if (!response.ok) {
          throw new Error(`Assessment failed: ${response.status}`);
        }
        
        const result = await response.json();
        return result as TriageResponse & { id: string };
      } catch (error) {
        console.error("Assessment mutation error:", error);
        throw error;
      }
    },
    onSuccess: (response, variables) => {
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `Pet: ${variables.petType}, Age: ${variables.petAge}\nSymptoms: ${variables.symptoms}`,
        isUser: true,
      };

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.summary,
        isUser: false,
        response,
      };

      setMessages(prev => [...prev, userMessage, aiMessage]);
      
      // Handle emergency detection
      if (response.triage === "emergency") {
        setEmergencyDetected(true);
      } else {
        setEmergencyDetected(false);
      }

      form.reset();
    },
    onError: (error) => {
      console.error("Assessment failed:", error);
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: "Sorry, there was an error processing your request. Please try again.",
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    },
  });

  const onSubmit = (data: PetAssessmentRequest) => {
    assessmentMutation.mutate(data);
  };

  const statusColors = {
    emergency: 'text-destructive',
    see_vet_soon: 'text-orange-400',
    ok: 'text-accent'
  };

  const statusIcons = {
    emergency: '🚨',
    see_vet_soon: '⚠️',
    ok: '✅'
  };

  return (
    <div className="space-y-6">
      {/* Emergency Alert Banner */}
      {emergencyDetected && (
        <Alert className="gradient-border emergency-pulse border-destructive" data-testid="alert-emergency">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive font-display mb-2">Emergency Detected</h3>
              <p className="text-destructive/90">This is an emergency. Please take your pet to the nearest veterinary clinic or emergency animal hospital right now.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Chat Input Section */}
      <div className="gradient-border">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 font-display">Describe Your Pet's Condition</h2>
          <p className="text-muted-foreground mb-6">Our AI assistant will help assess your pet's symptoms and provide guidance on next steps.</p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-assessment">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="petType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pet Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-pet-type">
                            <SelectValue placeholder="Select pet type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dog">Dog</SelectItem>
                          <SelectItem value="cat">Cat</SelectItem>
                          <SelectItem value="bird">Bird</SelectItem>
                          <SelectItem value="rabbit">Rabbit</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="petAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pet Age</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., 3 years old" 
                          {...field} 
                          data-testid="input-pet-age"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe the symptoms or concern</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Please describe what you've noticed about your pet's behavior, eating habits, energy level, or any specific symptoms..."
                        {...field}
                        data-testid="textarea-symptoms"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={assessmentMutation.isPending}
                data-testid="button-submit-assessment"
              >
                {assessmentMutation.isPending ? "Assessing..." : "Get AI Assessment"}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="space-y-4" data-testid="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-bubble ${message.isUser ? 'ml-auto' : 'mr-auto'}`}
          >
            {message.isUser ? (
              <div className="bg-primary text-primary-foreground p-4 rounded-2xl rounded-br-md">
                <p className="whitespace-pre-line">{message.content}</p>
              </div>
            ) : (
              <div className="bg-card border border-border p-6 rounded-2xl rounded-bl-md shadow-lg">
                {message.response && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{statusIcons[message.response.triage]}</span>
                      <div>
                        <h3 className="font-semibold font-display">Assessment Complete</h3>
                        <p className="text-sm text-muted-foreground">{message.response.summary}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Recommended Actions:</h4>
                      <ul className="space-y-2">
                        {message.response.advice.map((step, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="border-t border-border pt-4">
                      <p className="text-sm">
                        <strong className={statusColors[message.response.triage]}>When to see a vet:</strong> {message.response.when_to_see_vet}
                      </p>
                    </div>
                    
                    <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                      <p>{message.response.disclaimer}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
