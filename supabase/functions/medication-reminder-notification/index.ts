import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const formatPhone = (phone: string) => phone.replace(/[^+0-9]/g, "");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const {
      toEmail,
      toWhatsApp,
      userName,
      medication,
      dosage,
      time,
      notes,
      eventType,
      message
    } = body;

    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM"); // e.g. whatsapp:+14155238886

    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "no-reply@healthai.com";

    if (!toEmail && !toWhatsApp) {
      return new Response(JSON.stringify({ error: "No recipient provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subject = eventType === "taken"
      ? `Medication logged: ${medication}`
      : `Medication reminder: ${medication}`;

    const notificationText = message ||
      `Hi ${userName || "user"}, ${eventType === "taken" ? "this medication was marked as taken" : "time to take your medication"}: ${medication} (${dosage}) at ${time}.${notes ? ` Notes: ${notes}` : ""}`;

    const results: any = { email: null, whatsapp: null };

    if (toWhatsApp) {
      if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
        console.log("Mocking WhatsApp message (Twilio config missing):", notificationText);
        results.whatsapp = { status: "mock_sent_whatsapp" };
      } else {
        const whatsappTo = toWhatsApp.startsWith("whatsapp:") ? toWhatsApp : `whatsapp:${formatPhone(toWhatsApp)}`;
        const data = new URLSearchParams();
        data.append("To", whatsappTo);
        data.append("From", TWILIO_WHATSAPP_FROM);
        data.append("Body", notificationText);

        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: data.toString()
        });

        const whatsappResult = await response.json();
        if (!response.ok) {
          throw new Error(`Twilio WhatsApp error: ${whatsappResult.message || JSON.stringify(whatsappResult)}`);
        }
        results.whatsapp = whatsappResult;
      }
    }

    if (toEmail) {
      if (!SENDGRID_API_KEY) {
        console.log("Mocking Email message (SendGrid API key missing):", subject, notificationText);
        results.email = { status: "mock_sent_email" };
      } else {
        const emailPayload = {
          personalizations: [
            {
              to: [{ email: toEmail }],
              subject,
            },
          ],
          from: { email: EMAIL_FROM, name: "KeenCare Bot" },
          content: [
            {
              type: "text/plain",
              value: notificationText,
            },
          ],
        };

        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailPayload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`SendGrid error: ${errorText}`);
        }

        results.email = { status: "sent" };
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("medication-reminder-notification error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
