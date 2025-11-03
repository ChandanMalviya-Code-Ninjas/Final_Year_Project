import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Stethoscope, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SymptomChecker = () => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast.error("Please describe your symptoms");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('symptom-checker', {
        body: { symptoms }
      });

      if (error) throw error;

      setResults({
        possibleConditions: data.conditions.map((c: any) => ({
          name: c.name,
          probability: c.severity === "high" ? "High" : c.severity === "medium" ? "Medium" : "Low",
          severity: c.severity.charAt(0).toUpperCase() + c.severity.slice(1)
        })),
        recommendations: data.recommendations
      });
      toast.success("Analysis complete");
    } catch (error: any) {
      console.error("Symptom analysis error:", error);
      toast.error(error.message || "Failed to analyze symptoms");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="container max-w-4xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="shadow-large animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Stethoscope className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-display">AI Symptom Checker</CardTitle>
                <CardDescription>Describe your symptoms for an AI-powered preliminary analysis</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Describe Your Symptoms</label>
              <Textarea
                placeholder="e.g., I have a headache, fever, and sore throat for the past 2 days..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Symptoms"
              )}
            </Button>

            {results && (
              <div className="space-y-4 animate-fade-in-up">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Possible Conditions</h3>
                  <div className="space-y-2">
                    {results.possibleConditions.map((condition: any, index: number) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{condition.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Probability: {condition.probability}
                            </p>
                          </div>
                          <Badge variant={condition.severity === "Low" ? "secondary" : "destructive"}>
                            {condition.severity} Severity
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                  <Card className="p-4">
                    <ul className="space-y-2">
                      {results.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Disclaimer:</strong> This is a preliminary AI analysis and should not replace professional medical advice. 
                    Please consult a healthcare provider for accurate diagnosis and treatment.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SymptomChecker;
