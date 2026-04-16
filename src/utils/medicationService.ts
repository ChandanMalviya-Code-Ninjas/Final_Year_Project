import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

// ─── EmailJS helpers (client-side email, no backend needed) ───────────────────
const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  as string | undefined;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined;
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  as string | undefined;

const sendEmailViaEmailJS = async (params: {
  toEmail: string;
  subject: string;
  message: string;
  userName?: string;
}) => {
  console.log("[EmailJS] Sending email to:", `"${params.toEmail}"`);
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || 
      EMAILJS_SERVICE_ID.includes("YOUR_") || EMAILJS_PUBLIC_KEY.includes("YOUR_")) {
    console.warn("[EmailJS] Not configured – please replace 'YOUR_...' placeholders in .env");
    throw new Error("EmailJS not configured. Check your .env file.");
  }

  const payload = {
    service_id:  EMAILJS_SERVICE_ID,
    template_id: EMAILJS_TEMPLATE_ID,
    user_id:     EMAILJS_PUBLIC_KEY,
    template_params: {
      to_email:        params.toEmail.trim(),
      email:           params.toEmail.trim(), // Common fallback
      recipient_email: params.toEmail.trim(), // Another fallback
      contact_email:   params.toEmail.trim(), // Specific fallback
      to_name:   params.userName || "User",
      subject:   params.subject,
      message:   params.message,
    },
  };

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("[EmailJS] Full Error Response:", errText);
    throw new Error(`EmailJS error ${response.status}: ${errText}`);
  }
};

// ─── WhatsApp via Twilio Sandbox (vite proxy /twilio-api) ────────────────────
const TWILIO_ACCOUNT_SID   = import.meta.env.VITE_TWILIO_ACCOUNT_SID   as string | undefined;
const TWILIO_AUTH_TOKEN    = import.meta.env.VITE_TWILIO_AUTH_TOKEN    as string | undefined;
const TWILIO_WHATSAPP_FROM = import.meta.env.VITE_TWILIO_WHATSAPP_FROM as string | undefined;

const formatPhone = (phone: string) => phone.replace(/[^+0-9]/g, "");

const sendWhatsAppViaTwilio = async (toPhone: string, message: string) => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    throw new Error("Twilio credentials not configured in .env");
  }

  const whatsappTo = toPhone.startsWith("whatsapp:")
    ? toPhone
    : `whatsapp:${formatPhone(toPhone)}`;

  const data = new URLSearchParams();
  data.append("To",   whatsappTo);
  data.append("From", TWILIO_WHATSAPP_FROM);
  data.append("Body", message);

  const response = await fetch(
    `/twilio-api/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method:  "POST",
      headers: {
        Authorization:  `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data.toString(),
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(
      `Twilio error ${response.status}: ${result.message || JSON.stringify(result)}`
    );
  }

  return response.json();
};

class MedicationService {
  /** Enable browser push notifications */
  enableNotifications = async (): Promise<boolean> => {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission !== "denied") {
      return (await Notification.requestPermission()) === "granted";
    }
    return false;
  };

  /** Send a browser notification */
  sendNotification = (options: NotificationOptions) => {
    if (Notification.permission === "granted") {
      return new Notification(options.title, {
        body: options.body,
        icon: options.icon ?? "💊",
        tag:  options.tag  ?? "medication-reminder",
      });
    }
  };

  /**
   * Send WhatsApp + Email reminders.
   * WhatsApp  → Twilio Sandbox (via vite /twilio-api proxy)
   * Email     → EmailJS (client-side, no backend required)
   */
  sendExternalReminder = async (payload: {
    toEmail?:   string;
    toWhatsApp?: string;
    userName?:  string;
    medication: string;
    dosage:     string;
    time:       string;
    notes?:     string;
    eventType?: "reminder" | "taken";
  }): Promise<{ whatsapp: boolean; email: boolean }> => {
    if (!payload.toEmail && !payload.toWhatsApp) {
      throw new Error("No recipient configured for external reminder");
    }

    const isTaken  = payload.eventType === "taken";
    const userName = payload.userName || "User";

    let messageBody = "";
    if (isTaken) {
      messageBody = `✅ Hi ${userName}! You have taken ${payload.medication} (${payload.dosage}) at ${payload.time}. Keep it up!`;
    } else {
      // Use custom message from "notes" if provided, otherwise default
      const header = (payload.notes && payload.notes.trim()) 
        ? payload.notes.trim() 
        : `Hi ${userName}! Time to take your medication:`;

      messageBody = `💊 ${header}\n\n` +
        `• Medicine: ${payload.medication}\n` +
        `• Dosage:   ${payload.dosage}\n` +
        `• Time:     ${payload.time}\n\n` +
        `Stay healthy! – KeenCare Bot`;
    }

    const subject = isTaken
      ? `✅ Medication Taken: ${payload.medication}`
      : `💊 Medication Reminder: ${payload.medication}`;

    const results = { whatsapp: false, email: false };

    // ── WhatsApp ──────────────────────────────────────────────────────────────
    if (payload.toWhatsApp && payload.toWhatsApp.trim()) {
      try {
        await sendWhatsAppViaTwilio(payload.toWhatsApp.trim(), messageBody);
        results.whatsapp = true;
        console.log("[MedicationService] WhatsApp sent ✓");
      } catch (err) {
        console.error("[MedicationService] WhatsApp failed:", err);
        throw err;
      }
    }

    // ── Email ─────────────────────────────────────────────────────────────────
    if (payload.toEmail && payload.toEmail.trim()) {
      console.log("[MedicationService] Attempting EmailJS with:", `"${payload.toEmail.trim()}"`);
      try {
        await sendEmailViaEmailJS({
          toEmail:  payload.toEmail.trim(),
          subject,
          message:  messageBody,
          userName,
        });
        results.email = true;
        console.log("[MedicationService] Email sent ✓");
      } catch (err) {
        console.error("[MedicationService] Email failed:", err);
        throw err;
      }
    }

    return results;
  };

  /** Get all medications from Supabase */
  getMedications = async (): Promise<Medication[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("medications")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data || []).map((med: any) => ({
        id:        String(med.id ?? ""),
        name:      String(med.name ?? ""),
        dosage:    String(med.dosage ?? ""),
        times:     (med.reminder_times as string[]) || [],
        frequency: String(med.frequency ?? ""),
        reason:    String(med.reason ?? ""),
        startDate: String(med.start_date ?? ""),
        notes:     med.notes ? String(med.notes) : undefined,
        userId:    med.user_id ? String(med.user_id) : undefined,
      }));
    } catch (error) {
      console.error("Error fetching medications:", error);
      toast.error("Failed to load medications");
      return [];
    }
  };

  /** Save medication to Supabase */
  saveMedication = async (medication: Medication, userId: string): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase.from("medications") as any;
      if (medication.id && medication.id !== "") {
        const { error } = await db
          .update({
            name:           medication.name,
            dosage:         medication.dosage,
            frequency:      medication.frequency,
            reason:         medication.reason,
            reminder_times: medication.times,
            notes:          medication.notes,
            start_date:     medication.startDate,
            updated_at:     new Date().toISOString(),
          })
          .eq("id", medication.id)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await db
          .insert({
            user_id:        user.id,
            name:           medication.name,
            dosage:         medication.dosage,
            frequency:      medication.frequency,
            reason:         medication.reason,
            reminder_times: medication.times,
            notes:          medication.notes,
            start_date:     medication.startDate,
            is_active:      true,
          });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error saving medication:", error);
      throw error;
    }
  };

  /** Soft-delete medication */
  deleteMedication = async (medicationId: string, userId: string): Promise<void> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("medications") as any)
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", medicationId)
        .eq("user_id", userId);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting medication:", error);
      throw error;
    }
  };

  /** Get medication logs from Supabase */
  getMedicationLogs = async (): Promise<MedicationLog[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data || []).map((log: any) => ({
        id:           String(log.id ?? ""),
        medicationId: String(log.medication_id ?? ""),
        date:         String(log.log_date ?? ""),
        time:         String(log.reminder_time ?? ""),
        taken:        Boolean(log.taken),
        notes:        log.notes ? String(log.notes) : undefined,
      }));
    } catch (error) {
      console.error("Error fetching medication logs:", error);
      return [];
    }
  };

  /** Mark medication as taken (toggle) */
  markMedicationAsTaken = async (medicationId: string, time: string, userId: string): Promise<void> => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data: existingLog, error: checkError } = await supabase
        .from("medication_logs")
        .select("*")
        .eq("medication_id", medicationId)
        .eq("log_date", today)
        .eq("reminder_time", time)
        .eq("user_id", userId)
        .limit(1);

      if (checkError) throw checkError;

      if (existingLog && existingLog.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("medication_logs") as any)
          .delete()
          .eq("id", (existingLog[0] as any).id);
        if (error) throw error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from("medication_logs") as any)
          .insert({
            medication_id: medicationId,
            user_id:       userId,
            log_date:      today,
            reminder_time: time,
            taken:         true,
          });
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error marking medication as taken:", error);
      throw error;
    }
  };

  /** Export medications as JSON */
  exportMedicationData = (medications: Medication[], logs: MedicationLog[]): string =>
    JSON.stringify({ medications, logs, exportDate: new Date().toISOString() }, null, 2);

  /** Generate report text */
  generateReport = (medications: Medication[], _logs: MedicationLog[], days = 30): string => {
    let report = `MEDICATION ADHERENCE REPORT\nGenerated: ${new Date().toLocaleDateString()}\n\nSUMMARY\n-------\nTotal Medications: ${medications.length}\nReport Period: Last ${days} days\n\nMEDICATIONS\n-----------\n`;
    medications.forEach((med) => {
      report += `\n- ${med.name}\n  Dosage: ${med.dosage}\n  Frequency: ${med.frequency}\n  Times: ${med.times.join(", ")}\n  Reason: ${med.reason || "N/A"}\n  Started: ${med.startDate}\n`;
    });
    return report;
  };
}

export const medicationService = new MedicationService();
