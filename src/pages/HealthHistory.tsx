import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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

  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [allLogs, setAllLogs] = useState<any[]>([]);
  const [tableError, setTableError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('user_activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const logsData = data as any[];
          setAllLogs(logsData);

          setSymptoms(logsData.filter(log => log.type === "Symptom Check").map(log => ({
            id: log.id,
            date: new Date(log.created_at).toLocaleDateString(),
            time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            symptoms: log.details?.symptoms || "N/A",
            diagnosis: log.details?.primaryDiagnosis || log.details?.diagnosis || log.details?.allConditions?.[0]?.name || "Symptom Analysis",
            severity: (() => { const s = log.details?.primarySeverity || log.details?.severity || "medium"; return s.charAt(0).toUpperCase() + s.slice(1); })(),
            allConditions: log.details?.allConditions || [],
            recommendations: log.details?.recommendations || [],
            notes: "Checked via Symptom Checker AI",
            originalRecord: log
          })));

          setConsultations(logsData.filter(log => log.type === "Health Chat").map(log => ({
            id: log.id,
            date: new Date(log.created_at).toLocaleDateString(),
            time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            topic: log.details?.query || "Health Chat Conversation",
            response: log.details?.response || "",
            duration: log.details?.messageCount ? `${log.details.messageCount} messages` : "N/A",
            type: "Wellness",
            messages: log.details?.messageCount || 1,
            originalRecord: log
          })));

          setDietPlans(logsData.filter(log => log.type === "Diet Plan Created").map(log => ({
            id: log.id,
            date: new Date(log.created_at).toLocaleDateString(),
            time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            disease: log.details?.disease || "General Health",
            type: log.details?.dietType || log.details?.type || "Balanced",
            calories: log.details?.calorieTarget || "Personalized",
            totalCalories: log.details?.totalCalories || "N/A",
            meals: log.details?.mealPlan?.length || 3,
            mealPlan: log.details?.mealPlan || [],
            nutritionTips: log.details?.nutritionTips || [],
            saved: true,
            originalRecord: log
          })));
        }
      } catch (error) {
        console.error("Error fetching health history:", error);
        const err = error as any;
        // PGRST205 = table not found — show setup banner, not error toast
        if (err?.code === 'PGRST205' || err?.message?.includes('user_activity_logs')) {
          setTableError(true);
        } else {
          toast.error("Failed to load health history");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

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
  const exportAsJSON = (data: unknown, filename: string) => {
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

  const exportAsCSV = (data: Record<string, unknown>[], filename: string) => {
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

  const downloadRecord = (record: unknown, filename: string) => {
    exportAsJSON(record, filename);
  };

  const deleteRecord = async (id: string, type: string) => {
    try {
      const { error } = await supabase.from('user_activity_logs').delete().eq('id', id);
      if (error) throw error;
      
      toast.success(`${type} record deleted`);
      
      // Update local state
      if (type === "Symptom") setSymptoms(symptoms.filter(s => s.id !== id));
      if (type === "Consultation") setConsultations(consultations.filter(c => c.id !== id));
      if (type === "Diet Plan") setDietPlans(dietPlans.filter(d => d.id !== id));
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(`Failed to delete ${type} record`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/30 border-t-blue-500 mx-auto mb-4" />
          <p className="text-slate-500 text-sm font-medium">Loading your health history...</p>
        </div>
      </div>
    );
  }

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

        {/* Setup error banner */}
        {tableError && (
          <Alert className="mb-6 bg-amber-50 border-amber-300">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Database setup required:</strong> The <code>user_activity_logs</code> table is missing.
              Go to <strong>Supabase → SQL Editor</strong> and run the SQL from{" "}
              <code>supabase/migrations/create_user_activity_logs.sql</code> in your project to enable history tracking.
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                  <p className="text-sm text-muted-foreground">Total Activities</p>
                  <p className="text-3xl font-bold text-orange-600">{allLogs.length}</p>
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
              <div className="flex items-center justify-between border-b pb-2">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="symptoms" className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <Activity className="h-3.5 w-3.5" />
                    <span>Checks <span className="font-bold">({symptoms.length})</span></span>
                  </TabsTrigger>
                  <TabsTrigger value="consultations" className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Chats <span className="font-bold">({consultations.length})</span></span>
                  </TabsTrigger>
                  <TabsTrigger value="diet" className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <Apple className="h-3.5 w-3.5" />
                    <span>Diet <span className="font-bold">({dietPlans.length})</span></span>
                  </TabsTrigger>
                  <TabsTrigger value="all" className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <FileText className="h-3.5 w-3.5" />
                    <span>All <span className="font-bold">({allLogs.length})</span></span>
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

                {symptoms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                      <Activity className="h-8 w-8 text-blue-400" />
                    </div>
                    <p className="text-lg font-semibold text-slate-700 mb-1">No symptom checks yet</p>
                    <p className="text-sm text-slate-400 mb-4">Use the Symptom Checker module and results will appear here automatically.</p>
                    <Button variant="outline" size="sm" onClick={() => navigate("/symptom-checker")} className="gap-2">
                      <Activity className="h-4 w-4" /> Go to Symptom Checker
                    </Button>
                  </div>
                ) : (
                <div className="space-y-3">
                  {symptoms.filter(r => !searchTerm || r.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) || r.symptoms.toLowerCase().includes(searchTerm.toLowerCase())).map((record) => (
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
                                  <span className="text-sm font-semibold text-gray-600">{record.date} at {record.time}</span>
                                </div>
                                <Badge className={getSeverityColor(record.severity)}>{record.severity}</Badge>
                                <ChevronDown className={`h-4 w-4 text-slate-400 ml-auto transition-transform ${expandedId === record.id ? 'rotate-180' : ''}`} />
                              </div>
                              <h3 className="font-bold text-lg text-gray-900 mb-1">{record.diagnosis}</h3>
                              <p className="text-sm text-gray-500">Symptoms: {record.symptoms}</p>
                              {expandedId === record.id && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-in fade-in">
                                  {record.allConditions.length > 0 && (
                                    <div>
                                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">All Predicted Conditions</p>
                                      <div className="space-y-1.5">
                                        {record.allConditions.map((c: any, i: number) => (
                                          <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                                            <span className="text-sm font-medium text-slate-700">{c.name}</span>
                                            <Badge className={getSeverityColor(c.severity || c.probability || 'Medium')}>{c.probability || c.severity}</Badge>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {record.recommendations.length > 0 && (
                                    <div>
                                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Recommendations</p>
                                      <ul className="space-y-1">
                                        {record.recommendations.map((rec: string, i: number) => (
                                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            {rec}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  <p className="text-xs text-slate-400">{record.notes}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); downloadRecord(record, `symptom-${record.id}.json`); }}>
                                <Download className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); deleteRecord(record.id, "Symptom"); }}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
                )}
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

                {consultations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
                      <Clock className="h-8 w-8 text-purple-400" />
                    </div>
                    <p className="text-lg font-semibold text-slate-700 mb-1">No chat consultations yet</p>
                    <p className="text-sm text-slate-400 mb-4">Ask a health question in the Health Chatbot and it will appear here.</p>
                    <Button variant="outline" size="sm" onClick={() => navigate("/health-chatbot")} className="gap-2">
                      <Clock className="h-4 w-4" /> Go to Health Chatbot
                    </Button>
                  </div>
                ) : (
                <div className="space-y-3">
                  {consultations.map((consultation) => (
                    <div key={consultation.id} className="group">
                      <Card
                        className="shadow-md border-l-4 border-l-purple-500 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                        onClick={() => setExpandedId(expandedId === consultation.id ? null : consultation.id)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />{consultation.date} at {consultation.time}
                                </span>
                                <Badge className={getTypeColor(consultation.type)}>{consultation.type}</Badge>
                              </div>
                              <h3 className="font-bold text-base text-gray-900 mb-2 line-clamp-2">{consultation.topic}</h3>
                              <div className="flex gap-4 text-xs text-slate-500">
                                <span>💬 {consultation.messages} message(s)</span>
                                <span>⏱ {consultation.duration}</span>
                              </div>
                              {expandedId === consultation.id && consultation.response && (
                                <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in">
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">AI Response</p>
                                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-6">{consultation.response}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); downloadRecord(consultation, `chat-${consultation.id}.json`); }}>
                                <Download className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); deleteRecord(consultation.id, "Consultation"); }}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
                )}
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

                {dietPlans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
                      <Apple className="h-8 w-8 text-green-400" />
                    </div>
                    <p className="text-lg font-semibold text-slate-700 mb-1">No diet plans yet</p>
                    <p className="text-sm text-slate-400 mb-4">Generate a personalized meal plan in the Diet Planner.</p>
                    <Button variant="outline" size="sm" onClick={() => navigate("/diet-planner")} className="gap-2">
                      <Apple className="h-4 w-4" /> Go to Diet Planner
                    </Button>
                  </div>
                ) : (
                <div className="space-y-3">
                  {dietPlans.map((plan) => (
                    <div key={plan.id} className="group">
                      <Card
                        className="shadow-md border-l-4 border-l-green-500 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                        onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />{plan.date} at {plan.time}
                                </span>
                                <Badge variant="outline" className="bg-green-50 text-green-700">✓ Saved</Badge>
                              </div>
                              <h3 className="font-bold text-lg text-gray-900 mb-2">{plan.disease}</h3>
                              <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                                <span>🥗 {plan.type}</span>
                                <span>🔥 {plan.calories} cal target</span>
                                <span>🍽 {plan.meals} meal sessions</span>
                              </div>
                              {expandedId === plan.id && plan.mealPlan.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 animate-in fade-in">
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Meal Plan</p>
                                  {plan.mealPlan.map((meal: any, i: number) => (
                                    <div key={i} className="bg-slate-50 rounded-lg p-3">
                                      <p className="text-xs font-semibold text-slate-600 mb-1">{meal.time} · {meal.calories} kcal</p>
                                      <p className="text-sm text-slate-700">{Array.isArray(meal.items) ? meal.items.join(', ') : meal.items}</p>
                                    </div>
                                  ))}
                                  {plan.nutritionTips.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Nutrition Tips</p>
                                      {plan.nutritionTips.map((tip: string, i: number) => (
                                        <p key={i} className="text-xs text-slate-500">• {tip}</p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); downloadRecord(plan, `diet-${plan.id}.json`); }}>
                                <Download className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); deleteRecord(plan.id, "Diet Plan"); }}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
                )}
              </TabsContent>

              {/* All Activity Tab */}
              <TabsContent value="all" className="space-y-4">
                {allLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-lg font-semibold text-slate-700 mb-1">No activity recorded yet</p>
                    <p className="text-sm text-slate-400">Start using any health module — every action is automatically saved here.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                        <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{log.type}</p>
                          <p className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</p>
                        </div>
                        <Badge variant="outline" className={log.status === 'Completed' ? 'text-green-700 border-green-300 bg-green-50' : 'text-blue-700 border-blue-300 bg-blue-50'}>
                          {log.status}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex-shrink-0" onClick={() => deleteRecord(log.id, log.type)}>
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
