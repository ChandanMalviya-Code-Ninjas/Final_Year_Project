import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Stethoscope, Loader2, AlertCircle, CheckCircle2, Info, Heart } from "lucide-react";
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "bg-red-100 border-red-300 dark:bg-red-900/20 dark:border-red-700";
      case "Medium":
        return "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700";
      case "Low":
        return "bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-700";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "High":
        return "destructive";
      case "Medium":
        return "default";
      case "Low":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="container max-w-4xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="shadow-xl border-0 animate-fade-in overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-b">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold font-display">AI Symptom Checker</CardTitle>
                <CardDescription className="text-base">Describe your symptoms for an AI-powered preliminary analysis</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            {/* Input Section */}
            <div className="space-y-3">
              <label className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                Describe Your Symptoms
              </label>
              <div className="relative">
                <Textarea
                  placeholder="e.g., I have a headache, fever, and sore throat for the past 2 days. Started after exposure to someone with similar symptoms..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={6}
                  className="resize-none border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30 bg-white dark:bg-slate-900 transition-all duration-200"
                />
                <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                  {symptoms.length} characters
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                <Info className="inline h-3 w-3 mr-1" />
                Be as detailed as possible for better analysis
              </p>
            </div>

            {/* Analyze Button */}
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !symptoms.trim()}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg transition-all duration-200"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing Your Symptoms...
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-5 w-5" />
                  Analyze Symptoms
                </>
              )}
            </Button>

            {/* Results Section */}
            {results && (
              <div className="space-y-6 animate-fade-in-up pt-4 border-t-2 border-slate-200 dark:border-slate-700">
                {/* Possible Conditions */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Possible Conditions</h3>
                  </div>
                  <div className="space-y-3">
                    {results.possibleConditions.map((condition: any, index: number) => (
                      <Card 
                        key={index} 
                        className={`p-5 border-2 transition-all duration-200 hover:shadow-md ${getSeverityColor(condition.severity)}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-bold text-lg text-slate-900 dark:text-white">{condition.name}</p>
                            <div className="flex gap-4 mt-2">
                              <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                                <Heart className="h-4 w-4" />
                                Probability: {condition.probability}
                              </span>
                            </div>
                          </div>
                          <Badge variant={getSeverityBadgeVariant(condition.severity)} className="text-sm py-1 px-3">
                            {condition.severity} Severity
                          </Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recommended Actions</h3>
                  </div>
                  <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-2 border-green-300 dark:border-green-700">
                    <ul className="space-y-3">
                      {results.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>

                {/* Disclaimer */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-5">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Important Medical Disclaimer</p>
                      <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                        This is a preliminary AI analysis and should not replace professional medical advice. Please consult a licensed healthcare provider for accurate diagnosis and treatment.
                      </p>
                    </div>
                  </div>
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
