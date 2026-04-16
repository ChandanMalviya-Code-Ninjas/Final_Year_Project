import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { disease } = await req.json();

    if (!disease || disease.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Disease name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured in Supabase secrets" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are a medical AI assistant. The user has provided a disease or symptom: "${disease}".

Provide comprehensive treatment recommendations. Return ONLY a valid JSON object with this exact structure (no markdown, no code fences):
{
  "disease": "Standardized disease/condition name",
  "image": "https://images.unsplash.com/photo-1631549916768-4119b295f78b?w=800&q=80",
  "allopathic": [
    { "name": "Medicine Name", "dosage": "e.g. 500mg", "frequency": "e.g. Twice daily", "notes": "Important note about this medicine" }
  ],
  "ayurvedic": [
    { "name": "Herb/Remedy Name", "dosage": "e.g. 1 teaspoon", "frequency": "e.g. Once daily", "notes": "Benefits and usage note" }
  ],
  "exercises": [
    { "name": "Exercise Name", "duration": "e.g. 20 minutes", "frequency": "e.g. Daily", "benefits": "How this exercise helps" }
  ],
  "homeRemedies": [
    { "name": "Remedy Name", "ingredients": "List of ingredients", "preparation": "How to prepare", "benefits": "Benefits of this remedy" }
  ]
}

Rules:
- Provide 3-4 items per category
- Use a real relevant Unsplash image URL
- Be accurate, safe, and responsible
- Always general guidance — not a substitute for professional medical advice
- Return ONLY the JSON object, nothing else`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const geminiData = await response.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      throw new Error("No response from AI model");
    }

    // Strip any markdown code fences if present
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      // Try to extract JSON from response
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("medicine-recommender error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
