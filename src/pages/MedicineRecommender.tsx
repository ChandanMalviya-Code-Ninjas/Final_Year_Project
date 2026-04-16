import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  Pill,
  Leaf,
  Dumbbell,
  Lightbulb,
  Heart,
  ChevronLeft,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/utils/analytics";

interface DiseaseRecommendation {
  disease: string;
  image?: string;
  allopathic: Array<{ name: string; dosage: string; frequency: string; notes: string }>;
  ayurvedic: Array<{ name: string; dosage: string; frequency: string; notes: string }>;
  exercises: Array<{ name: string; duration: string; frequency: string; benefits: string }>;
  homeRemedies: Array<{ name: string; ingredients: string; preparation: string; benefits: string }>;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const GEMINI_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];

const buildPrompt = (disease: string) =>
  `You are a medical AI assistant. The user has provided a disease or symptom: "${disease}".

Provide comprehensive treatment recommendations. Return ONLY a valid JSON object with this exact structure (no markdown, no code fences, no extra text):
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

const extractJSON = (raw: string): DiseaseRecommendation => {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse AI response as JSON.");
  }
};

/** PRIMARY: Groq — free, 14,400 req/day, very fast */
const callGroq = async (disease: string): Promise<DiseaseRecommendation> => {
  if (!GROQ_API_KEY || GROQ_API_KEY === "YOUR_GROQ_API_KEY_HERE") {
    throw new Error("Groq API key not configured");
  }
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: buildPrompt(disease) }],
      temperature: 0.2,
      max_tokens: 2048,
    }),
  });

  if (response.status === 429) throw new Error("QUOTA:Groq rate limited");
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq error ${response.status}: ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content;
  if (!rawText) throw new Error("Empty response from Groq");
  console.log("[MedicineRecommender] Groq succeeded");
  return extractJSON(rawText);
};

/** FALLBACK: Gemini with model chain */
const callGeminiWithFallback = async (disease: string): Promise<DiseaseRecommendation> => {
  if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured");
  const prompt = buildPrompt(disease);
  let lastError: Error = new Error("All Gemini models exhausted");

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`[MedicineRecommender] Trying Gemini model: ${model}`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
          }),
        }
      );

      if (response.status === 429) {
        console.warn(`[MedicineRecommender] ${model} quota hit, trying next...`);
        lastError = new Error(`Rate limit on ${model}`);
        continue;
      }
      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Gemini ${response.status} (${model}): ${errBody.slice(0, 200)}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error(`Empty response from ${model}`);
      console.log(`[MedicineRecommender] Gemini ${model} succeeded`);
      return extractJSON(rawText);
    } catch (err) {
      if (err instanceof Error && (err.message.includes("Rate limit") || err.message.includes("QUOTA"))) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError;
};

/** LAST RESORT: Supabase Edge Function */
const callSupabaseFunction = async (disease: string): Promise<DiseaseRecommendation> => {
  const { data, error } = await supabase.functions.invoke("medicine-recommender", {
    body: { disease },
  });
  if (error) throw new Error(error.message || "Supabase function error");
  if (!data || data.error) throw new Error(data?.error || "No data from Supabase function");
  return data as DiseaseRecommendation;
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const MedicineRecommender = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [selectedDisease, setSelectedDisease] = useState<DiseaseRecommendation | null>(null);
  const [searchResults, setSearchResults] = useState<DiseaseRecommendation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSearch = async (overrideQuery?: string) => {
    const queryToUse = (overrideQuery || searchInput).trim();
    if (!queryToUse) {
      toast.error("Please enter a disease name");
      return;
    }
    if (overrideQuery) setSearchInput(overrideQuery);

    setIsAnalyzing(true);
    setHasSearched(true);
    setSelectedDisease(null);
    setSearchResults([]);

    try {
      let finalData: DiseaseRecommendation | null = null;

      // 1️⃣ Groq (free, fast, 14k req/day)
      try {
        finalData = await callGroq(queryToUse);
      } catch (err) {
        console.warn("[MedicineRecommender] Groq failed:", (err as Error).message);
      }

      // 2️⃣ Gemini (model fallback chain)
      if (!finalData) {
        try {
          finalData = await callGeminiWithFallback(queryToUse);
        } catch (err) {
          console.warn("[MedicineRecommender] All Gemini models failed:", (err as Error).message);
        }
      }

      // 3️⃣ Supabase Edge Function
      if (!finalData) {
        try {
          console.log("[MedicineRecommender] Trying Supabase Edge Function...");
          finalData = await callSupabaseFunction(queryToUse);
        } catch (err) {
          console.warn("[MedicineRecommender] Supabase function failed:", (err as Error).message);
        }
      }

      if (!finalData) {
        throw new Error(
          "All AI services are unavailable right now. Please add a free Groq API key at console.groq.com or try again later."
        );
      }

      setSearchResults([finalData]);

      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          logActivity(user.id, "Medicine Recommender", "/medicine-recommender", "Completed", {
            disease: queryToUse,
          });
        }
      });
    } catch (error: unknown) {
      console.error("[MedicineRecommender] Fatal error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate recommendations. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectDisease = (disease: DiseaseRecommendation) => {
    setSelectedDisease(disease);
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        logActivity(user.id, "Medicine Recommender", "/medicine-recommender", "Completed", {
          disease: disease.disease,
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans">
      <header className="border-b border-slate-200/50 bg-white/80 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="container flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="hover:bg-slate-100">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Medicine Search Engine
              </span>
              <p className="text-xs text-muted-foreground">AI-Powered Health Guidance</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-6 py-10">
        {!selectedDisease ? (
          <>
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-2xl mb-8 ring-1 ring-slate-100">
                <Search className="h-12 w-12 text-blue-600 animate-pulse" />
              </div>
              <h1 className="text-6xl font-black text-slate-900 mb-4 tracking-tight">Medicine Search Engine</h1>
              <p className="text-xl text-slate-600 mb-12 max-w-2xl font-medium">
                Research treatments, meds, and remedies for any condition using advanced AI.
              </p>

              <div className="w-full max-w-3xl relative">
                <div className="absolute inset-0 bg-blue-500/10 blur-[100px] -z-10 rounded-full" />
                <Card className="border-0 shadow-2xl bg-white ring-1 ring-slate-200 rounded-2xl overflow-hidden">
                  <CardContent className="p-2">
                    <div className="flex items-center px-4">
                      <Search className="h-6 w-6 text-slate-400 mr-3" />
                      <Input
                        id="disease-search-input"
                        placeholder="Type a disease or symptom (e.g., Asthma, Migraine, Flu)..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="flex-1 text-xl py-8 border-0 focus-visible:ring-0 shadow-none placeholder:text-slate-400 font-medium"
                      />
                      <Button
                        id="disease-search-btn"
                        onClick={() => handleSearch()}
                        disabled={isAnalyzing}
                        className="h-12 px-8 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg hover:shadow-blue-200"
                      >
                        {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-8 flex flex-wrap justify-center gap-6 text-slate-500 font-bold text-sm uppercase tracking-wider">
                  <span className="flex items-center gap-2 text-blue-600"><Pill className="h-4 w-4" /> Allopathic</span>
                  <span className="flex items-center gap-2 text-emerald-600"><Leaf className="h-4 w-4" /> Ayurvedic</span>
                  <span className="flex items-center gap-2 text-amber-600"><Lightbulb className="h-4 w-4" /> Remedies</span>
                  <span className="flex items-center gap-2 text-orange-600"><Dumbbell className="h-4 w-4" /> Exercises</span>
                </div>
              </div>
            </div>

            {isAnalyzing && (
              <div className="max-w-4xl mx-auto mt-12">
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                    <Sparkles className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-800">Analyzing with AI...</p>
                    <p className="text-slate-500 mt-1">
                      Generating treatment guide for{" "}
                      <span className="font-semibold text-blue-600">{searchInput}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isAnalyzing && hasSearched && searchResults.length > 0 && (
              <div className="max-w-4xl mx-auto space-y-6 mt-12">
                <div className="flex items-center justify-between border-b pb-4">
                  <h2 className="text-2xl font-bold text-slate-900">Treatment Results</h2>
                  <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 px-3 py-1">
                    <Sparkles className="h-3 w-3 mr-1" /> AI Generated
                  </Badge>
                </div>
                <div className="grid gap-6">
                  {searchResults.map((disease, idx) => (
                    <Card
                      key={idx}
                      className="cursor-pointer overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all bg-white group"
                      onClick={() => handleSelectDisease(disease)}
                    >
                      <div className="flex flex-col h-full">
                        <div className="p-8 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors uppercase">
                              {disease.disease}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-slate-600 font-medium mb-6">
                              <span className="flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full text-blue-700"><Pill className="h-4 w-4" /> {disease.allopathic?.length || 0} Meds</span>
                              <span className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full text-emerald-700"><Leaf className="h-4 w-4" /> {disease.ayurvedic?.length || 0} Ayurvedic</span>
                              <span className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full text-amber-700"><Lightbulb className="h-4 w-4" /> {disease.homeRemedies?.length || 0} Remedies</span>
                              <span className="flex items-center gap-1.5 bg-orange-50 px-3 py-1 rounded-full text-orange-700"><Dumbbell className="h-4 w-4" /> {disease.exercises?.length || 0} Exercises</span>
                            </div>
                          </div>
                          <Button className="w-fit px-8 bg-blue-600 hover:bg-blue-700 font-bold rounded-xl h-12 shadow-md">
                            Open Treatment Guide →
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {!isAnalyzing && hasSearched && searchResults.length === 0 && (
              <div className="mt-16 text-center text-slate-400">
                <p className="text-lg font-medium">No results found. Try a different disease name.</p>
              </div>
            )}
          </>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <Button
                variant="ghost"
                onClick={() => setSelectedDisease(null)}
                className="gap-2 mb-8 text-slate-600 font-bold hover:text-blue-600"
              >
                <ChevronLeft className="h-5 w-5" />
                Back to Search Results
              </Button>

              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="flex-1">
                  <h1 className="text-6xl font-black text-slate-900 mb-4 uppercase tracking-tighter">
                    {selectedDisease.disease}
                  </h1>
                  <p className="text-2xl text-slate-500 font-medium mb-8">
                    Complete Medical Recommendation &amp; Treatment Protocols
                  </p>
                  <div className="flex gap-4">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-4 py-1 text-sm font-bold uppercase tracking-widest">Scientific</Badge>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 px-4 py-1 text-sm font-bold uppercase tracking-widest">Natural</Badge>
                  </div>
                </div>

              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10 mb-10">
              <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-blue-600 text-white p-6">
                  <div className="flex items-center gap-3">
                    <Pill className="h-8 w-8" />
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">Allopathic Medicines</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {selectedDisease.allopathic?.map((med, idx) => (
                      <div key={idx} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                        <p className="font-black text-xl text-slate-900 mb-2">{med.name}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm font-bold uppercase text-slate-500 mb-3">
                          <span>Dosage: <span className="text-slate-900">{med.dosage}</span></span>
                          <span>Frequency: <span className="text-slate-900">{med.frequency}</span></span>
                        </div>
                        <p className="text-slate-600 bg-blue-50 p-4 rounded-xl border-l-4 border-blue-600 italic">
                          &ldquo;{med.notes}&rdquo;
                        </p>
                      </div>
                    ))}
                    {(!selectedDisease.allopathic || selectedDisease.allopathic.length === 0) && (
                      <p className="text-slate-400 italic">Consult a doctor for allopathic recommendations.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-emerald-600 text-white p-6">
                  <div className="flex items-center gap-3">
                    <Leaf className="h-8 w-8" />
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">Ayurvedic Medicines</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {selectedDisease.ayurvedic?.map((med, idx) => (
                      <div key={idx} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                        <p className="font-black text-xl text-slate-900 mb-2">{med.name}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm font-bold uppercase text-slate-500 mb-3">
                          <span>Dosage: <span className="text-slate-900">{med.dosage}</span></span>
                          <span>Frequency: <span className="text-slate-900">{med.frequency}</span></span>
                        </div>
                        <p className="text-slate-600 bg-emerald-50 p-4 rounded-xl border-l-4 border-emerald-600 italic">
                          &ldquo;{med.notes}&rdquo;
                        </p>
                      </div>
                    ))}
                    {(!selectedDisease.ayurvedic || selectedDisease.ayurvedic.length === 0) && (
                      <p className="text-slate-400 italic">No Ayurvedic recommendations available.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-10 mb-20">
              <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-orange-600 text-white p-6">
                  <div className="flex items-center gap-3">
                    <Dumbbell className="h-8 w-8" />
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">Exercises</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {selectedDisease.exercises?.map((ex, idx) => (
                      <div key={idx} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                        <p className="font-black text-xl text-slate-900 mb-2">{ex.name}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm font-bold uppercase text-slate-500 mb-3">
                          <span>Duration: <span className="text-slate-900">{ex.duration}</span></span>
                          <span>Frequency: <span className="text-slate-900">{ex.frequency}</span></span>
                        </div>
                        <p className="text-slate-600 bg-orange-50 p-4 rounded-xl border-l-4 border-orange-600 italic">
                          &ldquo;{ex.benefits}&rdquo;
                        </p>
                      </div>
                    ))}
                    {(!selectedDisease.exercises || selectedDisease.exercises.length === 0) && (
                      <p className="text-slate-400 italic">No exercise recommendations available.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-amber-600 text-white p-6">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="h-8 w-8" />
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">Home Remedies</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {selectedDisease.homeRemedies?.map((rem, idx) => (
                      <div key={idx} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                        <p className="font-black text-xl text-slate-900 mb-2">{rem.name}</p>
                        <p className="text-sm font-bold uppercase text-slate-500 mb-1">
                          Ingredients: <span className="text-slate-900">{rem.ingredients}</span>
                        </p>
                        <p className="text-sm font-bold uppercase text-slate-500 mb-3">
                          Preparation: <span className="text-slate-900">{rem.preparation}</span>
                        </p>
                        <p className="text-slate-600 bg-amber-50 p-4 rounded-xl border-l-4 border-amber-600 italic">
                          &ldquo;{rem.benefits}&rdquo;
                        </p>
                      </div>
                    ))}
                    {(!selectedDisease.homeRemedies || selectedDisease.homeRemedies.length === 0) && (
                      <p className="text-slate-400 italic">No home remedies available.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-2xl bg-slate-900 text-white p-10 rounded-3xl text-center">
              <Heart className="h-16 w-16 text-red-500 mx-auto mb-6" />
              <h2 className="text-4xl font-black mb-6 uppercase tracking-tighter">Stay Safe &amp; Healthy</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8 font-medium">
                These recommendations are generated by AI for informational purposes only. Always consult a
                qualified medical professional before starting any treatment.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-4xl font-black text-blue-500 mb-1">{selectedDisease.allopathic?.length || 0}</p>
                  <p className="text-sm font-bold uppercase text-slate-500">Allopathic</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-emerald-500 mb-1">{selectedDisease.ayurvedic?.length || 0}</p>
                  <p className="text-sm font-bold uppercase text-slate-500">Ayurvedic</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-orange-500 mb-1">{selectedDisease.exercises?.length || 0}</p>
                  <p className="text-sm font-bold uppercase text-slate-500">Exercises</p>
                </div>
                <div>
                  <p className="text-4xl font-black text-amber-500 mb-1">{selectedDisease.homeRemedies?.length || 0}</p>
                  <p className="text-sm font-bold uppercase text-slate-500">Remedies</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default MedicineRecommender;
