import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { petAssessmentSchema, type PetAssessmentRequest, type TriageResponse, type EnhancedChatResponse } from "@shared/schema";
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
  enhancedResponse?: EnhancedChatResponse;
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
        // Transform frontend data to backend format
        const backendRequest = {
          text: data.symptoms,
          species: data.petType,
          age: data.petAge
        };
        
        const response = await apiRequest("POST", "/api/chat", backendRequest);
        
        if (!response.ok) {
          throw new Error(`Assessment failed: ${response.status}`);
        }
        
        const result = await response.json() as EnhancedChatResponse;
        
        // Enhanced response includes all structured data
        return result;
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

      // Add AI response with enhanced data
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        isUser: false,
        enhancedResponse: response,
      };

      setMessages(prev => [...prev, userMessage, aiMessage]);
      
      // Handle emergency detection (map new triage values)
      if (response.triage === "emergency") {
        setEmergencyDetected(true);
      } else {
        setEmergencyDetected(false);
      }

      // Only reset symptoms field, keep pet type and age selections
      form.setValue("symptoms", "");
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
    urgent: 'text-orange-400',
    home: 'text-accent'
  };

  const statusIcons = {
    emergency: '🚨',
    urgent: '⚠️',
    home: '✅'
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-pet-age">
                            <SelectValue placeholder="Select pet age" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="under 6 months">Under 6 months</SelectItem>
                          <SelectItem value="6 months - 1 year">6 months - 1 year</SelectItem>
                          <SelectItem value="1-2 years">1-2 years</SelectItem>
                          <SelectItem value="3-5 years">3-5 years</SelectItem>
                          <SelectItem value="6-8 years">6-8 years</SelectItem>
                          <SelectItem value="9-12 years">9-12 years</SelectItem>
                          <SelectItem value="over 12 years">Over 12 years</SelectItem>
                        </SelectContent>
                      </Select>
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
                {message.enhancedResponse && (
                  <div className="space-y-4">
                    {/* Header with disease and category */}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {message.enhancedResponse.triage === "emergency" ? "🚨" : 
                         message.enhancedResponse.triage === "urgent" ? "⚠️" : "✅"}
                      </span>
                      <div>
                        <h3 className="font-semibold font-display">
                          {message.enhancedResponse.disease} ({message.enhancedResponse.category})
                        </h3>
                        <p className="text-sm text-muted-foreground">{message.enhancedResponse.message}</p>
                        <p className="text-xs text-muted-foreground">Confidence: {Math.round(message.enhancedResponse.confidence * 100)}%</p>
                      </div>
                    </div>

                    {/* Red Flags Alert */}
                    {message.enhancedResponse.red_flags.length > 0 && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                        <h4 className="font-medium text-destructive flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Red Flags Detected
                        </h4>
                        <ul className="text-sm text-destructive/80 mt-2 space-y-1">
                          {message.enhancedResponse.red_flags.map((flag, index) => (
                            <li key={index}>• {flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Symptom Analysis */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Symptom Analysis:</h4>
                      <div className="grid gap-2">
                        {message.enhancedResponse.signals
                          .sort((a, b) => b.weight - a.weight)
                          .map((signal, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded border">
                            <span className="text-sm">{signal.name}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded ${signal.present ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {signal.present ? 'Present' : 'Not observed'}
                              </span>
                              <span className="text-xs font-medium">Weight: {signal.weight}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Differential Diagnosis */}
                    {message.enhancedResponse.differentials.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-foreground">Possible Conditions:</h4>
                        <div className="space-y-2">
                          {message.enhancedResponse.differentials.map((diff, index) => (
                            <div key={index} className="bg-muted/30 p-3 rounded-lg">
                              <div className="font-medium text-sm">{diff.name}</div>
                              <div className="text-xs text-muted-foreground">{diff.why}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Recommended Actions */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Recommended Actions:</h4>
                      <ul className="space-y-2">
                        {message.enhancedResponse.actions.map((action, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <span className="text-sm">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Roma Agent Analysis */}
                    {message.enhancedResponse.roma_analysis && (
                      <div className="space-y-3 border-t border-border pt-4">
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          <span className="text-sm">🤖</span>
                          Roma Agent Insights
                        </h4>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                          <pre className="text-xs text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                            {typeof message.enhancedResponse.roma_analysis === 'object' 
                              ? JSON.stringify(message.enhancedResponse.roma_analysis, null, 2)
                              : message.enhancedResponse.roma_analysis
                            }
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Triage Level */}
                    <div className="border-t border-border pt-4">
                      <p className="text-sm">
                        <strong className={
                          message.enhancedResponse.triage === "emergency" ? "text-destructive" :
                          message.enhancedResponse.triage === "urgent" ? "text-orange-400" :
                          "text-accent"
                        }>
                          Triage Level:
                        </strong> {
                          message.enhancedResponse.triage === "emergency" ? "Emergency - Seek immediate veterinary care" :
                          message.enhancedResponse.triage === "urgent" ? "Urgent - Schedule vet visit within 24-48 hours" :
                          "Home Care - Monitor and provide supportive care"
                        }
                      </p>
                    </div>
                    
                    <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                      <p>This AI assessment is for informational purposes only and does not replace professional veterinary advice. Assessment method: {message.enhancedResponse.assessment_method || 'knowledge_base'}</p>
                    </div>
                  </div>
                )}

                {/* Legacy support for old message format */}
                {message.response && !message.enhancedResponse && (
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
