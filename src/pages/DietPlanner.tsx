import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Apple, Loader2, AlertCircle, CheckCircle2, Droplet, Heart, Brain, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DiseaseInfo {
  icon: any;
  color: string;
  bgColor: string;
  description: string;
  guidelines: string[];
  avoidFoods: string[];
}

const diseaseInfo: Record<string, DiseaseInfo> = {
  diabetes: {
    icon: Droplet,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    description: "Focus on low glycemic index foods, high fiber, and controlled portions",
    guidelines: [
      "Limit refined carbohydrates and sugary foods",
      "Choose whole grains over white rice/bread",
      "Include lean proteins and healthy fats",
      "Monitor portion sizes",
      "Stay hydrated"
    ],
    avoidFoods: ["White rice", "Sugary drinks", "Refined flour", "Processed snacks", "Fried foods"]
  },
  "heart-disease": {
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    description: "Emphasize heart-healthy foods, low sodium, and reduce saturated fats",
    guidelines: [
      "Reduce sodium intake",
      "Choose whole grains",
      "Include omega-3 rich foods",
      "Limit saturated fats",
      "Increase fruits and vegetables",
      "Cook at home more often"
    ],
    avoidFoods: ["Processed meats", "High-salt snacks", "Butter", "Full-fat dairy", "Fried foods"]
  },
  parkinsons: {
    icon: Brain,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    description: "Focus on nutrient-dense foods, adequate protein, and medication timing",
    guidelines: [
      "Eat protein separately from L-dopa medication",
      "Include antioxidant-rich foods",
      "Ensure adequate fiber intake",
      "Stay well-hydrated",
      "Eat soft/easy-to-swallow foods if needed",
      "Regular meal timing"
    ],
    avoidFoods: ["Iron supplements with L-dopa", "High-vitamin K foods with warfarin", "Hard/sticky foods"]
  }
};

const DietPlanner = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [preferences, setPreferences] = useState({
    disease: "",
    dietType: "",
    calories: ""
  });

  const handleGenerate = async () => {
    if (!preferences.disease || !preferences.dietType || !preferences.calories) {
      toast.error("Please fill in all preferences");
      return;
    }

    setIsGenerating(true);
    
    try {
      const disease = diseaseInfo[preferences.disease];
      const preferencesText = `Disease: ${preferences.disease}, Diet: ${preferences.dietType}, Calories: ${preferences.calories}, Guidelines: ${disease.guidelines.join(", ")}, Avoid: ${disease.avoidFoods.join(", ")}`;
      
      const { data, error } = await supabase.functions.invoke('diet-planner', {
        body: { 
          preferences: preferencesText,
          calorieTarget: preferences.calories,
          disease: preferences.disease,
          dietType: preferences.dietType
        }
      });

      if (error) throw error;

      // Transform API response to match UI format
      const meals = [];
      if (data.mealPlan.breakfast) {
        meals.push({
          time: "🌅 Breakfast (8:00 AM)",
          items: data.mealPlan.breakfast.map((m: any) => m.name),
          calories: data.mealPlan.breakfast.reduce((sum: number, m: any) => sum + (m.calories || 0), 0)
        });
      }
      if (data.mealPlan.lunch) {
        meals.push({
          time: "☀️ Lunch (1:00 PM)",
          items: data.mealPlan.lunch.map((m: any) => m.name),
          calories: data.mealPlan.lunch.reduce((sum: number, m: any) => sum + (m.calories || 0), 0)
        });
      }
      if (data.mealPlan.snacks) {
        meals.push({
          time: "🥤 Snacks (4:00 PM)",
          items: data.mealPlan.snacks.map((m: any) => m.name),
          calories: data.mealPlan.snacks.reduce((sum: number, m: any) => sum + (m.calories || 0), 0)
        });
      }
      if (data.mealPlan.dinner) {
        meals.push({
          time: "🌙 Dinner (7:00 PM)",
          items: data.mealPlan.dinner.map((m: any) => m.name),
          calories: data.mealPlan.dinner.reduce((sum: number, m: any) => sum + (m.calories || 0), 0)
        });
      }

      setDietPlan({
        meals,
        tips: data.nutritionTips || [],
        totalCalories: meals.reduce((sum, meal) => sum + meal.calories, 0)
      });
      toast.success("Diet plan generated successfully");
    } catch (error: any) {
      console.error("Diet plan generation error:", error);
      toast.error(error.message || "Failed to generate diet plan");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="container max-w-5xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid gap-6">
          {/* Header Card */}
          <Card className="shadow-xl border-green-200/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                  <Apple className="h-7 w-7" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-display">Disease-Specific Diet Planner</CardTitle>
                  <CardDescription className="text-green-100">
                    Get personalized meal plans tailored to your health condition
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Input Section */}
            <Card className="lg:col-span-1 shadow-lg border-green-100/50">
              <CardHeader>
                <CardTitle className="text-xl">Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Disease Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Select Your Condition</Label>
                  <div className="space-y-2">
                    {Object.entries(diseaseInfo).map(([key, info]) => {
                      const IconComponent = info.icon;
                      return (
                        <div
                          key={key}
                          onClick={() => setPreferences({...preferences, disease: key})}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            preferences.disease === key
                              ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20'
                              : 'border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent className={`h-5 w-5 ${info.color}`} />
                            <span className="font-medium capitalize">{key.replace('-', ' ')}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Disease Info */}
                {preferences.disease && (
                  <Alert className={`${diseaseInfo[preferences.disease].bgColor} border-0`}>
                    <AlertCircle className={diseaseInfo[preferences.disease].color} />
                    <AlertDescription className="text-sm">
                      {diseaseInfo[preferences.disease].description}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Diet Type */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Diet Type</Label>
                  <Select value={preferences.dietType} onValueChange={(value) => setPreferences({...preferences, dietType: value})}>
                    <SelectTrigger className="border-green-200 focus:ring-green-500">
                      <SelectValue placeholder="Choose diet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced Diet</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="keto">Keto-Friendly</SelectItem>
                      <SelectItem value="low-sodium">Low Sodium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Calorie Target */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Daily Calorie Target</Label>
                  <Select value={preferences.calories} onValueChange={(value) => setPreferences({...preferences, calories: value})}>
                    <SelectTrigger className="border-green-200 focus:ring-green-500">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1200-1500">1200-1500 kcal</SelectItem>
                      <SelectItem value="1500-1800">1500-1800 kcal</SelectItem>
                      <SelectItem value="1800-2200">1800-2200 kcal</SelectItem>
                      <SelectItem value="2200-2500">2200-2500 kcal</SelectItem>
                      <SelectItem value="2500+">2500+ kcal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !preferences.disease}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <Apple className="mr-2 h-5 w-5" />
                      Generate Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <div className="lg:col-span-2">
              {!dietPlan ? (
                <Card className="shadow-lg border-green-100/50 h-full flex items-center justify-center min-h-96">
                  <CardContent className="text-center py-12">
                    <Apple className="h-16 w-16 text-green-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Ready to Create Your Plan?</h3>
                    <p className="text-gray-500">
                      Select your condition and preferences on the left to generate a personalized meal plan
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6 animate-fade-in-up">
                  {/* Meal Plan Section */}
                  <Card className="shadow-lg border-green-100/50 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
                      <div className="flex items-center justify-between">
                        <CardTitle>Your 7-Day Meal Plan</CardTitle>
                        <div className="text-2xl font-bold text-green-600">{dietPlan.totalCalories} kcal/day</div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {dietPlan.meals.map((meal: any, index: number) => (
                          <div
                            key={index}
                            className="p-5 rounded-lg border-l-4 border-green-500 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-900/10 dark:to-transparent hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">{meal.time}</h4>
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">
                                {meal.calories} cal
                              </span>
                            </div>
                            <ul className="space-y-2">
                              {meal.items.map((item: string, i: number) => (
                                <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-3">
                                  <span className="text-green-500 font-bold mt-0.5">✓</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Guidelines & Nutrition Tips */}
                  {preferences.disease && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Do's */}
                      <Card className="shadow-lg border-blue-100/50">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            Recommended Foods
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <ul className="space-y-2">
                            {diseaseInfo[preferences.disease].guidelines.map((guideline: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="text-blue-500 font-semibold mt-0.5">→</span>
                                <span>{guideline}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      {/* Don'ts */}
                      <Card className="shadow-lg border-red-100/50">
                        <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <X className="h-5 w-5 text-red-600" />
                            Foods to Avoid
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <ul className="space-y-2">
                            {diseaseInfo[preferences.disease].avoidFoods.map((food: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="text-red-500 font-semibold mt-0.5">✗</span>
                                <span>{food}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* AI Tips */}
                  {dietPlan.tips.length > 0 && (
                    <Card className="shadow-lg border-amber-100/50">
                      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
                        <CardTitle className="text-lg">💡 Nutrition Tips</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <ul className="space-y-3">
                          {dietPlan.tips.map((tip: string, index: number) => (
                            <li key={index} className="flex items-start gap-3 text-sm">
                              <span className="text-amber-500 text-xl">→</span>
                              <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      <strong>Important:</strong> This diet plan is personalized for your condition. Always consult with a healthcare professional before making significant dietary changes.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={() => setDietPlan(null)}
                    variant="outline"
                    className="w-full"
                  >
                    Generate New Plan
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietPlanner;
