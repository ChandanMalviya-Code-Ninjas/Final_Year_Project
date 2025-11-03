import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Calendar, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HealthHistory = () => {
  const navigate = useNavigate();

  const symptoms = [
    { date: "2025-10-05", symptoms: "Headache, fever", diagnosis: "Common Cold", severity: "Low" },
    { date: "2025-09-28", symptoms: "Sore throat, cough", diagnosis: "Viral Infection", severity: "Medium" },
    { date: "2025-09-15", symptoms: "Fatigue, dizziness", diagnosis: "Dehydration", severity: "Low" }
  ];

  const consultations = [
    { date: "2025-10-06", topic: "Diet recommendations for weight loss", duration: "15 min" },
    { date: "2025-10-03", topic: "Exercise routine suggestions", duration: "12 min" },
    { date: "2025-09-29", topic: "Managing stress and anxiety", duration: "18 min" }
  ];

  const dietPlans = [
    { date: "2025-10-04", type: "Balanced", goal: "Weight Loss", calories: "1500-1800 kcal" },
    { date: "2025-09-20", type: "Vegetarian", goal: "Maintenance", calories: "1800-2200 kcal" }
  ];

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
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-display">Health History</CardTitle>
                <CardDescription>Track your health records and past consultations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="symptoms" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="symptoms">Symptom Checks</TabsTrigger>
                <TabsTrigger value="consultations">Chatbot History</TabsTrigger>
                <TabsTrigger value="diet">Diet Plans</TabsTrigger>
              </TabsList>

              <TabsContent value="symptoms" className="space-y-3">
                {symptoms.map((record, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{record.date}</span>
                        </div>
                        <p className="font-medium">{record.diagnosis}</p>
                        <p className="text-sm text-muted-foreground">Symptoms: {record.symptoms}</p>
                      </div>
                      <Badge variant={record.severity === "Low" ? "secondary" : "destructive"}>
                        {record.severity}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="consultations" className="space-y-3">
                {consultations.map((consultation, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{consultation.date}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{consultation.duration}</span>
                      </div>
                      <p className="font-medium">{consultation.topic}</p>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="diet" className="space-y-3">
                {dietPlans.map((plan, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{plan.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge>{plan.type}</Badge>
                        <Badge variant="outline">{plan.goal}</Badge>
                      </div>
                      <p className="text-sm">Target: {plan.calories}</p>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthHistory;
