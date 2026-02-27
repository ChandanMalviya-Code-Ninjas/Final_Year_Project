import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Calendar, Activity, Download, Search, Trash2, ChevronDown, TrendingUp, Clock, CheckCircle, AlertCircle, AlertTriangle, Apple, FileJson, FileText as FileIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const HealthHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const symptoms = [
    { id: "s1", date: "2025-10-05", time: "14:30", symptoms: "Headache, fever", diagnosis: "Common Cold", severity: "Low", temperature: "98.2°F", notes: "Doctor recommended rest and fluids" },
    { id: "s2", date: "2025-09-28", time: "09:15", symptoms: "Sore throat, cough", diagnosis: "Viral Infection", severity: "Medium", temperature: "99.5°F", notes: "Prescribed antibiotics and cough syrup" },
    { id: "s3", date: "2025-09-15", time: "16:45", symptoms: "Fatigue, dizziness", diagnosis: "Dehydration", severity: "Low", temperature: "98.0°F", notes: "Increased water intake recommended" },
    { id: "s4", date: "2025-09-01", time: "11:20", symptoms: "Back pain", diagnosis: "Muscle Strain", severity: "Medium", temperature: "98.1°F", notes: "Physical therapy suggested" }
  ];

  const consultations = [
    { id: "c1", date: "2025-10-06", time: "15:00", topic: "Diet recommendations for weight loss", duration: "15 min", type: "Nutrition", messages: 12, satisfaction: "5/5" },
    { id: "c2", date: "2025-10-03", time: "10:30", topic: "Exercise routine suggestions", duration: "12 min", type: "Fitness", messages: 8, satisfaction: "4/5" },
    { id: "c3", date: "2025-09-29", time: "14:45", topic: "Managing stress and anxiety", duration: "18 min", type: "Mental Health", messages: 15, satisfaction: "5/5" },
    { id: "c4", date: "2025-09-20", time: "09:00", topic: "Sleep improvement tips", duration: "10 min", type: "Wellness", messages: 6, satisfaction: "4/5" }
  ];

  const dietPlans = [
    { id: "d1", date: "2025-10-04", disease: "General Health", type: "Balanced", goal: "Weight Loss", calories: "1500-1800 kcal", meals: 4, saved: true },
    { id: "d2", date: "2025-09-20", disease: "Diabetes", type: "Low Glycemic", goal: "Maintenance", calories: "1800-2200 kcal", meals: 4, saved: true },
    { id: "d3", date: "2025-09-10", disease: "Heart Disease", type: "Low Sodium", goal: "Health", calories: "2000-2300 kcal", meals: 3, saved: false }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200";
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Low":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "High":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Nutrition":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200";
      case "Fitness":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200";
      case "Mental Health":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200";
      case "Wellness":
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Export functions
  const exportAsJSON = (data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${filename} downloaded successfully`);
  };

  const exportAsCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${filename} downloaded successfully`);
  };

  const exportAllRecords = () => {
    const allData = {
      exportedAt: new Date().toISOString(),
      symptoms,
      consultations,
      dietPlans,
      summary: {
        totalHealthChecks: symptoms.length,
        totalConsultations: consultations.length,
        totalDietPlans: dietPlans.length
      }
    };
    exportAsJSON(allData, `health-records-${new Date().toISOString().split('T')[0]}.json`);
  };

  const downloadSymptoms = () => exportAsCSV(symptoms, `health-checks-${new Date().toISOString().split('T')[0]}.csv`);

  const downloadConsultations = () => exportAsCSV(consultations, `consultations-${new Date().toISOString().split('T')[0]}.csv`);

  const downloadDietPlans = () => exportAsCSV(dietPlans, `diet-plans-${new Date().toISOString().split('T')[0]}.csv`);

  const downloadRecord = (record: any, filename: string) => {
    exportAsJSON(record, filename);
  };

  const deleteRecord = (id: string, type: string) => {
    toast.success(`${type} record deleted`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="container max-w-7xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 hover:bg-white/50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Header Card */}
        <Card className="shadow-xl border-blue-200/50 overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                  <FileText className="h-7 w-7" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-display">Health History & Records</CardTitle>
                  <CardDescription className="text-blue-100">
                    Complete view of your medical history, consultations, and health plans
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white" onClick={exportAllRecords}>
                  <FileJson className="mr-2 h-4 w-4" />
                  Export JSON
                </Button>
                <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white" onClick={() => {
                  const allData = {
                    exportedAt: new Date().toISOString(),
                    symptoms,
                    consultations,
                    dietPlans
                  };
                  const csv = [
                    'Type,Date,Details',
                    ...symptoms.map(s => `"Health Check","${s.date}","${s.diagnosis}"`),
                    ...consultations.map(c => `"Consultation","${c.date}","${c.topic}"`),
                    ...dietPlans.map(d => `"Diet Plan","${d.date}","${d.disease}"`)
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `all-records-${new Date().toISOString().split('T')[0]}.csv`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  toast.success('All records exported as CSV');
                }}>
                  <FileIcon className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-lg border-blue-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Health Checks</p>
                  <p className="text-3xl font-bold text-blue-600">{symptoms.length}</p>
                </div>
                <Activity className="h-10 w-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-purple-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Consultations</p>
                  <p className="text-3xl font-bold text-purple-600">{consultations.length}</p>
                </div>
                <Clock className="h-10 w-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-green-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Diet Plans</p>
                  <p className="text-3xl font-bold text-green-600">{dietPlans.length}</p>
                </div>
                <Apple className="h-10 w-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-orange-100/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Satisfaction</p>
                  <p className="text-3xl font-bold text-orange-600">4.5/5</p>
                </div>
                <TrendingUp className="h-10 w-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Card className="shadow-xl border-blue-100/50">
          <CardContent className="pt-6">
            <Tabs defaultValue="symptoms" className="space-y-6">
              <div className="flex items-center justify-between border-b">
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                  <TabsTrigger value="symptoms" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span className="hidden sm:inline">Health Checks</span>
                  </TabsTrigger>
                  <TabsTrigger value="consultations" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="hidden sm:inline">Consultations</span>
                  </TabsTrigger>
                  <TabsTrigger value="diet" className="flex items-center gap-2">
                    <Apple className="h-4 w-4" />
                    <span className="hidden sm:inline">Diet Plans</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Symptoms Tab */}
              <TabsContent value="symptoms" className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search symptoms or diagnosis..."
                      className="pl-10 border-blue-200 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={downloadSymptoms} className="gap-2">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {symptoms.map((record) => (
                    <div key={record.id} className="group">
                      <Card
                        className="shadow-md border-l-4 border-l-blue-500 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                        onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  {getSeverityIcon(record.severity)}
                                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                    {record.date} at {record.time}
                                  </span>
                                </div>
                                <Badge className={getSeverityColor(record.severity)}>
                                  {record.severity}
                                </Badge>
                              </div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                                {record.diagnosis}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Symptoms: {record.symptoms}
                              </p>
                              {expandedId === record.id && (
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 animate-in fade-in">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Temperature</p>
                                      <p className="text-sm font-medium">{record.temperature}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Additional Notes</p>
                                      <p className="text-sm">{record.notes}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => downloadRecord(record, `symptom-${record.id}-${new Date().toISOString().split('T')[0]}.json`)}
                              >
                                <Download className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => deleteRecord(record.id, "Symptom")}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Consultations Tab */}
              <TabsContent value="consultations" className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search consultations..."
                      className="pl-10 border-purple-200 focus:ring-purple-500"
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={downloadConsultations} className="gap-2">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {consultations.map((consultation) => (
                    <div key={consultation.id} className="group">
                      <Card className="shadow-md border-l-4 border-l-purple-500 hover:shadow-lg transition-all cursor-pointer overflow-hidden">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  {consultation.date} at {consultation.time}
                                </span>
                                <Badge className={getTypeColor(consultation.type)}>
                                  {consultation.type}
                                </Badge>
                              </div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">
                                {consultation.topic}
                              </h3>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Duration</p>
                                  <p className="font-medium">{consultation.duration}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Messages</p>
                                  <p className="font-medium">{consultation.messages}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Satisfaction</p>
                                  <p className="font-medium text-yellow-600">⭐ {consultation.satisfaction}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => downloadRecord(consultation, `consultation-${consultation.id}-${new Date().toISOString().split('T')[0]}.json`)}
                              >
                                <Download className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => deleteRecord(consultation.id, "Consultation")}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Diet Plans Tab */}
              <TabsContent value="diet" className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search diet plans..."
                      className="pl-10 border-green-200 focus:ring-green-500"
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={downloadDietPlans} className="gap-2">
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {dietPlans.map((plan) => (
                    <div key={plan.id} className="group">
                      <Card className="shadow-md border-l-4 border-l-green-500 hover:shadow-lg transition-all cursor-pointer overflow-hidden">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  {plan.date}
                                </span>
                                {plan.saved && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                                    ✓ Saved
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">
                                {plan.disease}
                              </h3>
                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Diet Type</p>
                                  <p className="font-medium">{plan.type}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Goal</p>
                                  <p className="font-medium">{plan.goal}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Calories</p>
                                  <p className="font-medium">{plan.calories}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Meals</p>
                                  <p className="font-medium">{plan.meals} meals/day</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => downloadRecord(plan, `diet-plan-${plan.id}-${new Date().toISOString().split('T')[0]}.json`)}
                              >
                                <Download className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => deleteRecord(plan.id, "Diet Plan")}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <strong>Your Health Data:</strong> All your health records are securely stored and encrypted. You can download or delete any record at any time.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default HealthHistory;
