import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Pill,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit,
  Calendar,
  BarChart3,
  Bell,
  X,
  ChevronsUpDown,
  Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { medicationService } from "@/utils/medicationService";
import { logActivity } from "@/utils/analytics";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const COMMON_MEDICATIONS = [
  "Aspirin", "Ibuprofen", "Paracetamol", "Amoxicillin", "Lisinopril",
  "Metformin", "Atorvastatin", "Amlodipine", "Omeprazole", "Losartan",
  "Levothyroxine", "Albuterol", "Gabapentin", "Sertraline", "Simvastatin"
];

interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  frequency: string;
  reason: string;
  startDate: string;
  notes?: string;
  userId?: string;
}

interface MedicationLog {
  id: string;
  medicationId: string;
  date: string;
  time: string;
  taken: boolean;
  notes?: string;
}

const MedicationReminder = () => {
  const navigate = useNavigate();

  console.log("MedicationReminder component mounted");

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [enableExternalReminders, setEnableExternalReminders] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactWhatsApp, setContactWhatsApp] = useState("");
  const [notifiedReminders, setNotifiedReminders] = useState<string[]>([]);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Medication>({
    id: "",
    name: "",
    dosage: "",
    times: ["08:00"],
    frequency: "daily",
    reason: "",
    startDate: new Date().toISOString().split("T")[0],
    notes: ""
  });

  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load medications on component mount
  useEffect(() => {
    console.log("MedicationReminder useEffect triggered");

    const checkUser = async () => {
      setAuthLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.log("No user found, redirecting to login");
          setAuthLoading(false);
          navigate("/login");
          return;
        }

        console.log("User authenticated:", user.id);
        setUser(user);
      } catch (error) {
        console.error("Error checking user:", error);
        toast.error("Authentication error. Redirecting to login.");
        navigate("/login");
      } finally {
        setAuthLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  // Load medications after authentication
  useEffect(() => {
    if (user && !authLoading) {
      loadMedications();
      checkNotifications();
    }
  }, [user, authLoading]);

  const loadMedications = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const meds = await medicationService.getMedications();
      const logs = await medicationService.getMedicationLogs();

      console.log("Loaded medications:", meds.length, "logs:", logs.length);

      setMedications(meds);
      setLogs(logs);

      // Do not treat no medications as an error; use the normal UI to guide the user.
      if (meds.length === 0) {
        console.log("No medications found yet.");
      }
    } catch (error) {
      console.error("Error loading medications:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      setLoadError(`Failed to load medications: ${message}`);
      toast.error("Failed to load medications");
    } finally {
      setIsLoading(false);
    }
  };

  const checkNotifications = async () => {
    const enabled = await medicationService.enableNotifications();
    setNotificationsEnabled(enabled);
  };

  const loadReminderSettings = async () => {
    const savedEmail = localStorage.getItem("keen_care_reminder_email") || "";
    const savedWhatsApp = localStorage.getItem("keen_care_reminder_whatsapp") || "";
    const savedEnable = localStorage.getItem("keen_care_reminder_enabled") === "true";

    setContactEmail(savedEmail);
    setContactWhatsApp(savedWhatsApp);
    setEnableExternalReminders(savedEnable);

    if (!savedEmail || !savedWhatsApp) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setContactEmail(user.email);
      }
      if (user?.user_metadata?.phone) {
        setContactWhatsApp(String(user.user_metadata.phone));
      }
    }
  };

  const storeReminderSettings = () => {
    localStorage.setItem("keen_care_reminder_email", contactEmail);
    localStorage.setItem("keen_care_reminder_whatsapp", contactWhatsApp);
    localStorage.setItem("keen_care_reminder_enabled", enableExternalReminders.toString());
    toast.success("Reminder settings saved!");
  };

  const sendExternalReminder = async (reminder: UpcomingReminder, eventType: "reminder" | "taken" = "reminder") => {
    if (!enableExternalReminders || (!contactEmail && !contactWhatsApp)) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await medicationService.sendExternalReminder({
        toEmail: contactEmail || undefined,
        toWhatsApp: contactWhatsApp || undefined,
        userName: user?.user_metadata?.full_name || user?.email || "User",
        medication: reminder.name,
        dosage: reminder.dosage,
        time: reminder.time,
        eventType,
      });
      toast.success("Reminder sent via WhatsApp/Email ✓");
    } catch (error) {
      console.error("External reminder failed:", error);
      toast.error(`Reminder failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const testWhatsApp = async () => {
    if (!contactWhatsApp.trim()) { toast.error("Enter a WhatsApp number first"); return; }
    setIsSendingWhatsApp(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await medicationService.sendExternalReminder({
        toWhatsApp: contactWhatsApp,
        userName: user?.user_metadata?.full_name || user?.email || "User",
        medication: "Test Medicine",
        dosage: "500mg",
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        eventType: "reminder",
      });
      toast.success("✅ WhatsApp test message sent! Check your phone.");
    } catch (err) {
      toast.error(`WhatsApp failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const testEmail = async () => {
    if (!contactEmail.trim()) { toast.error("Enter an email address first"); return; }
    setIsSendingEmail(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await medicationService.sendExternalReminder({
        toEmail: contactEmail,
        userName: user?.user_metadata?.full_name || user?.email || "User",
        medication: "Test Medicine",
        dosage: "500mg",
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        eventType: "reminder",
      });
      toast.success("✅ Test email sent! Check your inbox.");
    } catch (err) {
      toast.error(`Email failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const checkAndTriggerReminders = async (reminders: UpcomingReminder[]) => {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    // To trigger 5 minutes before the actual time, we look 5 minutes into the future
    const futureDate = new Date(now.getTime() + 5 * 60000);
    const triggerTime = futureDate.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });

    const dueReminders = reminders.filter((reminder) => {
      // Trigger if the reminder time is exactly 2 minutes from now
      return reminder.time === triggerTime && !reminder.isOverdue;
    });

    for (const reminder of dueReminders) {
      const reminderKey = `${reminder.id}_${reminder.time}_${today}`;
      if (notifiedReminders.includes(reminderKey)) continue;

      medicationService.sendNotification({
        title: `Medication Reminder: ${reminder.name}`,
        body: `Time to take ${reminder.name} (${reminder.dosage}) at ${reminder.time}`,
        icon: "💊"
      });

      // Show a highly visible toast IN THE APP itself
      toast.info(`💊 Time for Medication: ${reminder.name}`, {
        description: `Please take ${reminder.dosage} now.`,
        duration: 20000, // keep the toast visible for 20 seconds
        action: {
          label: "Mark Taken",
          onClick: () => markAsTaken(reminder.id, reminder.time),
        },
      });

      await sendExternalReminder(reminder, "reminder");

      setNotifiedReminders((prev) => [...prev, reminderKey]);
    }

    const currentTime = now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
    if (currentTime === "00:00") {
      setNotifiedReminders([]);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const remindersToCheck = getUpcomingReminders();
      checkAndTriggerReminders(remindersToCheck).catch((e) => console.error(e));
    }, 60_000);

    return () => clearInterval(interval);
  }, [medications, logs, enableExternalReminders, contactEmail, contactWhatsApp, notifiedReminders]);

  useEffect(() => {
    loadReminderSettings();
  }, []);

  const saveMedication = async () => {
    const finalName = formData.name.trim() || searchQuery.trim();
    const validTimes = formData.times.filter((t) => t && t.trim().length > 0);

    if (!finalName || !formData.dosage.trim() || validTimes.length === 0 || !formData.startDate) {
      toast.error("Please fill in required fields: name, dosage, startDate, and valid times.");
      return;
    }

    const payload = {
      ...formData,
      name: finalName,
      times: validTimes
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("User not authenticated");
        setLoadError("User session expired. Please log in again.");
        navigate("/login");
        return;
      }

      await medicationService.saveMedication(payload, user.id);

      // Log the activity to Dashboard History
      logActivity(user.id, "Medication Added", "/medication-reminder", "Completed", { name: payload.name, dosage: payload.dosage });

      // Reload medications
      await loadMedications();

      toast.success("Medication saved successfully");
      setShowForm(false);
      setEditingId(null);
      setSearchQuery("");
      setComboboxOpen(false);
      setFormData({
        id: "",
        name: "",
        dosage: "",
        times: ["08:00"],
        frequency: "daily",
        reason: "",
        startDate: new Date().toISOString().split("T")[0],
        notes: ""
      });

      if (notificationsEnabled) {
        medicationService.sendNotification({
          title: "Medication Added",
          body: `${payload.name} ${payload.dosage} has been added to your reminders.`,
          icon: "💊"
        });
      }
    } catch (error) {
      console.error("Error saving medication:", error, "payload:", payload);
      const message = error instanceof Error ? error.message : String(error);
      setLoadError(`Error saving medication: ${message}`);
      toast.error(`Error saving medication: ${message}`);
    }
  };

  const deleteMedication = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await medicationService.deleteMedication(id, user.id);

      // Reload medications
      await loadMedications();
      toast.success("Medication deleted");
    } catch (error) {
      console.error("Error deleting medication:", error);
      toast.error("Error deleting medication");
    }
  };

  const markAsTaken = async (medicationId: string, time: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark in Supabase
      await medicationService.markMedicationAsTaken(medicationId, time, user.id);

      const med = medications.find((m) => m.id === medicationId);

      // Log to Dashboard Realtime History
      logActivity(user.id, "Medication Taken", "/medication-reminder", "Completed", { name: med?.name, time });

      // Reload logs
      const updatedLogs = await medicationService.getMedicationLogs();
      setLogs(updatedLogs);

      if (notificationsEnabled) {
        medicationService.sendNotification({
          title: "Medication Logged ✓",
          body: `${med?.name} at ${time} marked as taken.`,
          icon: "✅"
        });
      }

      if (med) {
        await sendExternalReminder({
          id: med.id,
          name: med.name,
          dosage: med.dosage,
          time,
          isOverdue: false
        }, "taken");
      }
    } catch (error) {
      console.error("Error updating medication log:", error);
      toast.error("Error updating medication log");
    }
  };

  const addTimeSlot = () => {
    setFormData({
      ...formData,
      times: [...formData.times, ""]
    });
  };

  const removeTimeSlot = (index: number) => {
    setFormData({
      ...formData,
      times: formData.times.filter((_, i) => i !== index)
    });
  };

  const updateTimeSlot = (index: number, value: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const updateFormField = (field: keyof Medication, value: unknown) => {
    setFormData({ ...formData, [field]: value });
  };

  const getAdherenceStats = () => {
    if (medications.length === 0) return { total: 0, taken: 0, percentage: 0 };

    const today = new Date().toISOString().split("T")[0];
    let total = 0;
    let taken = 0;

    // Calculate total expected doses
    medications.forEach((med) => {
      med.times.forEach(() => {
        total++;
      });
    });

    // Count taken doses
    logs.forEach((log) => {
      if (log.date === today && log.taken) {
        taken++;
      }
    });

    return {
      total,
      taken,
      percentage: total > 0 ? Math.round((taken / total) * 100) : 0
    };
  };

  interface UpcomingReminder {
    id: string;
    name: string;
    time: string;
    dosage: string;
    isOverdue: boolean;
  }

  const getUpcomingReminders = () => {
    const upcoming: UpcomingReminder[] = [];
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

    medications.forEach((med) => {
      med.times.forEach((time) => {
        const isAlreadyTaken = logs.find(
          (log) => log.medicationId === med.id && log.time === time && log.taken
        );

        if (!isAlreadyTaken) {
          upcoming.push({
            id: med.id,
            name: med.name,
            dosage: med.dosage,
            time,
            isOverdue: time < currentTime
          });
        }
      });
    });

    return upcoming.sort((a, b) => a.time.localeCompare(b.time));
  };

  const editMedication = (medication: Medication) => {
    setFormData(medication);
    setSearchQuery(medication.name);
    setEditingId(medication.id);
    setShowForm(true);
  };

  const stats = getAdherenceStats();
  const upcomingReminders = getUpcomingReminders();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center p-6 rounded-lg bg-white shadow-lg border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">You are not signed in</h2>
          <p className="mt-2 text-slate-600">Please log in to access medication reminders.</p>
          <Button onClick={() => navigate('/login')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your medications...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <h2 className="text-xl font-bold text-red-600">Medication reminder issue</h2>
          <p className="mt-2 text-sm text-slate-600">{loadError}</p>
          <Button onClick={() => loadMedications()} className="mt-4 bg-red-600 hover:bg-red-700">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/80 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                <Pill className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Medication Reminders</h1>
                <p className="text-xs text-slate-500">Stay on top of your health</p>
                {user && (
                  <p className="text-xs text-green-600 mt-1">Logged in as: {user.email}</p>
                )}
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) {
                setEditingId(null);
                setSearchQuery("");
                setComboboxOpen(false);
                setFormData({
                  id: "",
                  name: "",
                  dosage: "",
                  times: ["08:00"],
                  frequency: "daily",
                  reason: "",
                  startDate: new Date().toISOString().split("T")[0],
                  notes: ""
                });
              }
            }}
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4" />
            Add Medication
          </Button>
          <Button
            onClick={() => loadMedications()}
            variant="outline"
            className="gap-2"
          >
            <Bell className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </header>

      <main className="container px-6 py-8">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit">
            <TabsTrigger value="today" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Today</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2">
              <Pill className="h-4 w-4" />
              <span className="hidden sm:inline">Manage</span>
            </TabsTrigger>
          </TabsList>

          {/* TODAY TAB */}
          <TabsContent value="today" className="space-y-6">
            {showForm && (
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle>{editingId ? "Edit Medication" : "Add New Medication"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Medication Name *</Label>
                      <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={comboboxOpen}
                            className="w-full justify-between"
                          >
                            {formData.name || "Select or type medication..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput
                              placeholder="Search medication..."
                              value={searchQuery}
                              onValueChange={setSearchQuery}
                            />
                            <CommandList>
                              <CommandEmpty>
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start font-normal text-slate-700"
                                  onClick={() => {
                                    if (searchQuery.trim()) {
                                      updateFormField("name", searchQuery.trim());
                                      setComboboxOpen(false);
                                      setSearchQuery("");
                                    }
                                  }}
                                >
                                  Use "{searchQuery}"
                                </Button>
                              </CommandEmpty>
                              <CommandGroup>
                                {COMMON_MEDICATIONS.map((med) => (
                                  <CommandItem
                                    key={med}
                                    value={med}
                                    onSelect={(currentValue) => {
                                      updateFormField("name", med);
                                      setComboboxOpen(false);
                                      setSearchQuery("");
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        formData.name === med ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {med}
                                  </CommandItem>
                                ))}
                                {searchQuery && !COMMON_MEDICATIONS.some(m => m.toLowerCase() === searchQuery.toLowerCase()) && (
                                  <CommandItem
                                    value={searchQuery}
                                    onSelect={() => {
                                      updateFormField("name", searchQuery.trim());
                                      setComboboxOpen(false);
                                      setSearchQuery("");
                                    }}
                                  >
                                    <Check className="mr-2 h-4 w-4 opacity-0" />
                                    Use "{searchQuery}"
                                  </CommandItem>
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage *</Label>
                      <Input
                        id="dosage"
                        value={formData.dosage}
                        onChange={(e) => updateFormField("dosage", e.target.value)}
                        placeholder="e.g., 500mg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency *</Label>
                      <select
                        id="frequency"
                        aria-label="Frequency"
                        value={formData.frequency}
                        onChange={(e) => updateFormField("frequency", e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="daily">Daily</option>
                        <option value="twice-daily">Twice Daily</option>
                        <option value="thrice-daily">Thrice Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="as-needed">As Needed</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Medication</Label>
                      <Input
                        id="reason"
                        value={formData.reason}
                        onChange={(e) => updateFormField("reason", e.target.value)}
                        placeholder="e.g., Pain relief"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Reminder Times *</Label>
                    <div className="space-y-2">
                      {formData.times.map((time, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            type="time"
                            value={time}
                            onChange={(e) => updateTimeSlot(index, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeTimeSlot(index)}
                            disabled={formData.times.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTimeSlot}
                      className="w-full gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Time
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => updateFormField("startDate", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => updateFormField("notes", e.target.value)}
                      placeholder="e.g., Take with food"
                      className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={saveMedication}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {editingId ? "Update" : "Add"} Medication
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {upcomingReminders.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Today's Reminders
                  </CardTitle>
                  <CardDescription>
                    {upcomingReminders.length} reminder{upcomingReminders.length !== 1 ? "s" : ""} pending
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingReminders.map((reminder) => (
                    <div
                      key={`${reminder.id}_${reminder.time}`}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${reminder.isOverdue
                          ? "border-red-200 bg-red-50"
                          : "border-blue-200 bg-blue-50"
                        }`}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{reminder.name}</h4>
                        <p className="text-sm text-slate-600">
                          {reminder.dosage} • {reminder.time}
                        </p>
                        {reminder.isOverdue && (
                          <p className="text-xs text-red-600 font-semibold mt-1">OVERDUE</p>
                        )}
                      </div>
                      <Button
                        onClick={() => markAsTaken(reminder.id, reminder.time)}
                        size="sm"
                        className="gap-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Mark Taken
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Today's Adherence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">{stats.taken}</p>
                    <p className="text-sm text-slate-600">Taken</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                    <p className="text-sm text-slate-600">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{stats.percentage}%</p>
                    <p className="text-sm text-slate-600">Complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SCHEDULE TAB */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Medication Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {medications.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No medications added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {medications.map((med) => (
                      <div key={med.id} className="p-4 border rounded-lg hover:bg-slate-50">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-900">{med.name}</h4>
                            <p className="text-sm text-slate-600">{med.dosage}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {med.times.join(", ")}
                            </p>
                          </div>
                          <Pill className="h-5 w-5 text-purple-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Adherence Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-2xl font-bold text-blue-600">{medications.length}</p>
                    <p className="text-xs text-slate-600 mt-1">Active Meds</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-2xl font-bold text-green-600">{logs.length}</p>
                    <p className="text-xs text-slate-600 mt-1">Total Logs</p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                    <p className="text-2xl font-bold text-purple-600">{stats.percentage}%</p>
                    <p className="text-xs text-slate-600 mt-1">Today Rate</p>
                  </div>
                  <div className="p-4 rounded-lg bg-pink-50 border border-pink-200">
                    <p className="text-2xl font-bold text-pink-600">{upcomingReminders.length}</p>
                    <p className="text-xs text-slate-600 mt-1">Remaining</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MANAGE TAB */}
          <TabsContent value="manage" className="space-y-6">
            {/* ── WhatsApp Card ── */}
            <Card className="border border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">💬</span> WhatsApp Reminders
                  <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${import.meta.env.VITE_TWILIO_ACCOUNT_SID
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                    }`}>
                    {import.meta.env.VITE_TWILIO_ACCOUNT_SID ? "✅ Twilio Configured" : "❌ Not Configured"}
                  </span>
                </CardTitle>
                <CardDescription>
                  Sends via Twilio Sandbox. The recipient must first text{" "}
                  <strong>join &lt;sandbox-keyword&gt;</strong> to{" "}
                  <strong>+1 415 523 8886</strong> on WhatsApp to activate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="contactWhatsApp">Recipient WhatsApp number (with country code)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="contactWhatsApp"
                      value={contactWhatsApp}
                      onChange={(e) => setContactWhatsApp(e.target.value)}
                      placeholder="e.g. +919876543210"
                      className="flex-1"
                    />
                    <Button
                      onClick={testWhatsApp}
                      disabled={isSendingWhatsApp}
                      className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                    >
                      {isSendingWhatsApp ? <span className="animate-spin">⏳</span> : "🧪 Test Send"}
                    </Button>
                  </div>
                </div>
                <Alert>
                  <AlertDescription className="text-xs">
                    <strong>One-time setup:</strong> Open WhatsApp → New chat → search{" "}
                    <strong>+14155238886</strong> → send the join keyword shown in your{" "}
                    <a href="https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn" target="_blank" rel="noreferrer" className="underline text-blue-600">Twilio console</a>.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* ── Email Card ── */}
            <Card className="border border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📧</span> Email Reminders
                  <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${import.meta.env.VITE_EMAILJS_PUBLIC_KEY
                      ? "bg-green-200 text-green-800"
                      : "bg-yellow-200 text-yellow-800"
                    }`}>
                    {import.meta.env.VITE_EMAILJS_PUBLIC_KEY ? "✅ EmailJS Configured" : "⚠️ Setup Required"}
                  </span>
                </CardTitle>
                <CardDescription>
                  Uses EmailJS (free, 200 emails/month). Requires a 2-minute setup at{" "}
                  <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" className="underline text-blue-600">emailjs.com</a>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {!import.meta.env.VITE_EMAILJS_PUBLIC_KEY && (
                  <Alert>
                    <AlertDescription className="text-xs space-y-1">
                      <p className="font-bold">Quick Setup (2 min):</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Sign up free at <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" className="underline text-blue-600">emailjs.com</a></li>
                        <li>Add an Email Service (e.g. Gmail) → copy <strong>Service ID</strong></li>
                        <li>Create a Template with variables: <code>to_email, subject, message, to_name</code> → copy <strong>Template ID</strong></li>
                        <li>Go to Account → copy your <strong>Public Key</strong></li>
                        <li>Add to <code>.env</code>:<br />
                          <code className="bg-slate-100 px-1 rounded text-xs block mt-1">
                            VITE_EMAILJS_SERVICE_ID="service_xxx"<br />
                            VITE_EMAILJS_TEMPLATE_ID="template_xxx"<br />
                            VITE_EMAILJS_PUBLIC_KEY="your_public_key"<br />
                          </code>
                        </li>
                        <li>Restart the dev server</li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-1">
                  <Label htmlFor="contactEmail">Recipient email address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="contactEmail"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="you@example.com"
                      type="email"
                      className="flex-1"
                    />
                    <Button
                      onClick={testEmail}
                      disabled={isSendingEmail || !import.meta.env.VITE_EMAILJS_PUBLIC_KEY}
                      className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                    >
                      {isSendingEmail ? <span className="animate-spin">⏳</span> : "🧪 Test Send"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Global Toggle + Save ── */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    id="enableExternalReminders"
                    type="checkbox"
                    checked={enableExternalReminders}
                    onChange={(e) => setEnableExternalReminders(e.target.checked)}
                    className="h-5 w-5 accent-purple-600"
                  />
                  <Label htmlFor="enableExternalReminders" className="text-base font-semibold">
                    Enable automatic WhatsApp + email reminders 5 min before each dose
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={storeReminderSettings} className="bg-purple-600 hover:bg-purple-700">
                    💾 Save Settings
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setContactEmail(""); setContactWhatsApp(""); setEnableExternalReminders(false);
                    localStorage.removeItem("keen_care_reminder_email");
                    localStorage.removeItem("keen_care_reminder_whatsapp");
                    localStorage.removeItem("keen_care_reminder_enabled");
                    toast.success("Settings cleared");
                  }}>
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Medications</CardTitle>
              </CardHeader>
              <CardContent>
                {medications.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No medications to manage</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {medications.map((med) => (
                      <div
                        key={med.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{med.name}</h4>
                          <p className="text-sm text-slate-600">
                            {med.dosage} • {med.frequency}
                          </p>
                          {med.reason && (
                            <p className="text-xs text-slate-500 mt-1">{med.reason}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editMedication(med)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMedication(med.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MedicationReminder;
