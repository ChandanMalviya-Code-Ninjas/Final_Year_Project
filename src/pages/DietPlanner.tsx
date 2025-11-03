import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Apple, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const DietPlanner = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [preferences, setPreferences] = useState({
    goal: "",
    dietType: "",
    calories: ""
  });

  const handleGenerate = async () => {
    if (!preferences.goal || !preferences.dietType || !preferences.calories) {
      toast.error("Please fill in all preferences");
      return;
    }

    setIsGenerating(true);
    
    try {
      const preferencesText = `Goal: ${preferences.goal}, Diet: ${preferences.dietType}, Calories: ${preferences.calories}`;
      
      const { data, error } = await supabase.functions.invoke('diet-planner', {
        body: { 
          preferences: preferencesText,
          calorieTarget: preferences.calories 
        }
      });

      if (error) throw error;

      // Transform API response to match UI format
      const meals = [];
      if (data.mealPlan.breakfast) {
        meals.push({
          time: "Breakfast (8:00 AM)",
          items: data.mealPlan.breakfast.map((m: any) => m.name),
          calories: data.mealPlan.breakfast.reduce((sum: number, m: any) => sum + (m.calories || 0), 0)
        });
      }
      if (data.mealPlan.lunch) {
        meals.push({
          time: "Lunch (1:00 PM)",
          items: data.mealPlan.lunch.map((m: any) => m.name),
          calories: data.mealPlan.lunch.reduce((sum: number, m: any) => sum + (m.calories || 0), 0)
        });
      }
      if (data.mealPlan.dinner) {
        meals.push({
          time: "Dinner (7:00 PM)",
          items: data.mealPlan.dinner.map((m: any) => m.name),
          calories: data.mealPlan.dinner.reduce((sum: number, m: any) => sum + (m.calories || 0), 0)
        });
      }
      if (data.mealPlan.snacks) {
        meals.push({
          time: "Snacks",
          items: data.mealPlan.snacks.map((m: any) => m.name),
          calories: data.mealPlan.snacks.reduce((sum: number, m: any) => sum + (m.calories || 0), 0)
        });
      }

      setDietPlan({
        meals,
        tips: data.nutritionTips || []
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
                <Apple className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-display">AI Diet Planner</CardTitle>
                <CardDescription>Get a personalized diet plan based on your goals</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Your Goal</Label>
                <RadioGroup value={preferences.goal} onValueChange={(value) => setPreferences({...preferences, goal: value})}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weight-loss" id="weight-loss" />
                    <Label htmlFor="weight-loss" className="font-normal cursor-pointer">Weight Loss</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="muscle-gain" id="muscle-gain" />
                    <Label htmlFor="muscle-gain" className="font-normal cursor-pointer">Muscle Gain</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="maintenance" id="maintenance" />
                    <Label htmlFor="maintenance" className="font-normal cursor-pointer">Maintenance</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Diet Type</Label>
                <Select value={preferences.dietType} onValueChange={(value) => setPreferences({...preferences, dietType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select diet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                    <SelectItem value="paleo">Paleo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Daily Calorie Target</Label>
                <Select value={preferences.calories} onValueChange={(value) => setPreferences({...preferences, calories: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select calorie range" />
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
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                "Generate Diet Plan"
              )}
            </Button>

            {dietPlan && (
              <div className="space-y-4 animate-fade-in-up">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Your Personalized Meal Plan</h3>
                  <div className="space-y-3">
                    {dietPlan.meals.map((meal: any, index: number) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{meal.time}</h4>
                          <span className="text-sm text-muted-foreground">{meal.calories} kcal</span>
                        </div>
                        <ul className="space-y-1">
                          {meal.items.map((item: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Nutrition Tips</h3>
                  <Card className="p-4">
                    <ul className="space-y-2">
                      {dietPlan.tips.map((tip: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-1">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DietPlanner;
