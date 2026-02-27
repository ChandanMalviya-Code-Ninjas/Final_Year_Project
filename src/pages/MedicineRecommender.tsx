import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Home,
  Search,
  Pill,
  Leaf,
  Dumbbell,
  Lightbulb,
  Heart,
  AlertCircle,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";

interface DiseaseRecommendation {
  disease: string;
  allopathic: Array<{
    name: string;
    dosage: string;
    frequency: string;
    notes: string;
  }>;
  ayurvedic: Array<{
    name: string;
    dosage: string;
    frequency: string;
    notes: string;
  }>;
  exercises: Array<{
    name: string;
    duration: string;
    frequency: string;
    benefits: string;
  }>;
  homeRemedies: Array<{
    name: string;
    ingredients: string;
    preparation: string;
    benefits: string;
  }>;
}

const medicineDatabase: DiseaseRecommendation[] = [
  {
    disease: "Diabetes",
    allopathic: [
      {
        name: "Metformin",
        dosage: "500-1000mg",
        frequency: "2-3 times daily",
        notes: "First-line treatment, reduces blood sugar by decreasing glucose production",
      },
      {
        name: "Glibenclamide",
        dosage: "2.5-5mg",
        frequency: "Once daily",
        notes: "Stimulates pancreas to release insulin",
      },
      {
        name: "Insulin Therapy",
        dosage: "Variable",
        frequency: "As prescribed",
        notes: "For type 1 or advanced type 2 diabetes",
      },
    ],
    ayurvedic: [
      {
        name: "Neem",
        dosage: "1-2 fresh leaves",
        frequency: "Morning & evening",
        notes: "Purifies blood, regulates blood sugar levels naturally",
      },
      {
        name: "Karela (Bitter Gourd)",
        dosage: "1 fresh fruit or juice",
        frequency: "Daily morning",
        notes: "Contains insulin-like compounds that reduce glucose",
      },
      {
        name: "Fenugreek (Methi) Seeds",
        dosage: "1 teaspoon",
        frequency: "Daily in warm water",
        notes: "Slows carbohydrate digestion and sugar absorption",
      },
      {
        name: "Jamun (Black Plum)",
        dosage: "4-5 fruits",
        frequency: "Daily",
        notes: "Ancient remedy for diabetes, contains tannins",
      },
    ],
    exercises: [
      {
        name: "Brisk Walking",
        duration: "30-45 minutes",
        frequency: "Daily",
        benefits: "Improves insulin sensitivity, burns calories, strengthens heart",
      },
      {
        name: "Swimming",
        duration: "30 minutes",
        frequency: "3-4 times per week",
        benefits: "Low-impact cardio, improves glucose control",
      },
      {
        name: "Yoga (Surya Namaskar)",
        duration: "15-20 minutes",
        frequency: "Daily",
        benefits: "Balances metabolism, reduces stress, improves flexibility",
      },
      {
        name: "Strength Training",
        duration: "20-30 minutes",
        frequency: "3 times per week",
        benefits: "Builds muscle, improves insulin sensitivity",
      },
    ],
    homeRemedies: [
      {
        name: "Cinnamon & Honey",
        ingredients: "1/2 teaspoon cinnamon powder, 1 teaspoon honey, warm water",
        preparation: "Mix cinnamon in warm water, add honey, stir well",
        benefits: "Improves insulin sensitivity, reduces fasting blood sugar",
      },
      {
        name: "Apple Cider Vinegar",
        ingredients: "2 tablespoons apple cider vinegar, 1 glass water",
        preparation: "Dilute vinegar in water, consume before meals",
        benefits: "Slows carb digestion, improves glucose control",
      },
      {
        name: "Turmeric Milk",
        ingredients: "1/2 teaspoon turmeric, 1 cup milk, 1 pinch black pepper",
        preparation: "Heat milk, add turmeric and pepper, stir and drink warm",
        benefits: "Anti-inflammatory, reduces insulin resistance",
      },
      {
        name: "Ginger Tea",
        ingredients: "1 inch fresh ginger, water, lemon juice",
        preparation: "Boil ginger in water, strain, add fresh lemon juice",
        benefits: "Aids digestion, improves glucose metabolism",
      },
    ],
  },
  {
    disease: "Heart Disease",
    allopathic: [
      {
        name: "Aspirin",
        dosage: "75-325mg",
        frequency: "Once daily",
        notes: "Prevents blood clots, reduces risk of heart attack",
      },
      {
        name: "Atorvastatin",
        dosage: "10-80mg",
        frequency: "Once daily",
        notes: "Lowers cholesterol levels significantly",
      },
      {
        name: "Lisinopril",
        dosage: "2.5-20mg",
        frequency: "Once daily",
        notes: "Lowers blood pressure, protects heart",
      },
    ],
    ayurvedic: [
      {
        name: "Arjuna Bark",
        dosage: "3-5 grams",
        frequency: "Twice daily with water",
        notes: "Strengthens heart muscles, improves circulation",
      },
      {
        name: "Ashwagandha",
        dosage: "500-1000mg",
        frequency: "Daily",
        notes: "Reduces stress, lowers blood pressure naturally",
      },
      {
        name: "Ginger",
        dosage: "2-3 grams",
        frequency: "Daily in tea or food",
        notes: "Improves blood flow, anti-inflammatory properties",
      },
    ],
    exercises: [
      {
        name: "Aerobic Walking",
        duration: "30-40 minutes",
        frequency: "5 days per week",
        benefits: "Strengthens heart, improves cardiovascular health",
      },
      {
        name: "Yoga (Heart-friendly poses)",
        duration: "20-30 minutes",
        frequency: "Daily",
        benefits: "Reduces stress, improves circulation",
      },
      {
        name: "Swimming",
        duration: "30 minutes",
        frequency: "3 times per week",
        benefits: "Low-impact cardio, strengthens heart without strain",
      },
      {
        name: "Light Cycling",
        duration: "30 minutes",
        frequency: "3-4 times per week",
        benefits: "Improves heart rate, burns calories",
      },
    ],
    homeRemedies: [
      {
        name: "Garlic & Honey",
        ingredients: "3-4 garlic cloves, 1 teaspoon honey",
        preparation: "Crush garlic, mix with honey, consume daily morning",
        benefits: "Lowers cholesterol, improves heart health",
      },
      {
        name: "Lemon & Water",
        ingredients: "Fresh lemon juice, warm water, honey",
        preparation: "Squeeze lemon in warm water, add honey, drink",
        benefits: "Improves circulation, reduces blood pressure",
      },
      {
        name: "Coconut Water",
        ingredients: "1 fresh coconut water",
        preparation: "Consume fresh coconut water directly",
        benefits: "Rich in potassium, balances electrolytes, strengthens heart",
      },
      {
        name: "Pomegranate Juice",
        ingredients: "1 fresh pomegranate",
        preparation: "Extract juice or consume fresh",
        benefits: "Antioxidant powerhouse, improves blood flow",
      },
    ],
  },
  {
    disease: "Hypertension",
    allopathic: [
      {
        name: "Amlodipine",
        dosage: "5-10mg",
        frequency: "Once daily",
        notes: "Calcium channel blocker, relaxes blood vessels",
      },
      {
        name: "Enalapril",
        dosage: "5-10mg",
        frequency: "Once or twice daily",
        notes: "ACE inhibitor, reduces blood pressure effectively",
      },
      {
        name: "Losartan",
        dosage: "25-100mg",
        frequency: "Once daily",
        notes: "ARB medication, blocks angiotensin II receptor",
      },
    ],
    ayurvedic: [
      {
        name: "Brahmi",
        dosage: "1-2 grams",
        frequency: "Daily",
        notes: "Calms nervous system, reduces stress-induced hypertension",
      },
      {
        name: "Sarpagandha (Rauwolfia)",
        dosage: "100-200mg",
        frequency: "Daily",
        notes: "Traditional Ayurvedic remedy for blood pressure",
      },
      {
        name: "Turmeric",
        dosage: "500-1000mg",
        frequency: "Daily in food or milk",
        notes: "Anti-inflammatory, improves circulation",
      },
    ],
    exercises: [
      {
        name: "Meditation",
        duration: "15-20 minutes",
        frequency: "Daily",
        benefits: "Reduces stress, lowers blood pressure naturally",
      },
      {
        name: "Pranayama (Breathing)",
        duration: "10-15 minutes",
        frequency: "Daily",
        benefits: "Calms mind, regulates blood pressure",
      },
      {
        name: "Gentle Yoga",
        duration: "20-30 minutes",
        frequency: "5 days per week",
        benefits: "Relaxes body, improves flexibility",
      },
      {
        name: "Walking",
        duration: "30 minutes",
        frequency: "Daily",
        benefits: "Low-impact cardio, effective BP control",
      },
    ],
    homeRemedies: [
      {
        name: "Banana & Milk",
        ingredients: "1 banana, 1 cup milk",
        preparation: "Blend banana with milk, consume daily",
        benefits: "Rich in potassium, reduces blood pressure",
      },
      {
        name: "Hibiscus Tea",
        ingredients: "1 teaspoon dried hibiscus, 1 cup hot water",
        preparation: "Steep hibiscus in hot water, strain, drink warm",
        benefits: "Natural blood pressure reducer",
      },
      {
        name: "Coconut Oil",
        ingredients: "1 tablespoon virgin coconut oil",
        preparation: "Use in cooking or consume directly daily",
        benefits: "Contains heart-healthy fats, reduces BP",
      },
      {
        name: "Celery Juice",
        ingredients: "Fresh celery stalks",
        preparation: "Extract juice or blend and strain",
        benefits: "Contains compounds that relax blood vessel walls",
      },
    ],
  },
  {
    disease: "Asthma",
    allopathic: [
      {
        name: "Albuterol Inhaler",
        dosage: "2 puffs",
        frequency: "As needed",
        notes: "Quick-relief bronchodilator for acute attacks",
      },
      {
        name: "Fluticasone Inhaler",
        dosage: "110-440 mcg",
        frequency: "Twice daily",
        notes: "Steroid inhaler prevents inflammation",
      },
      {
        name: "Theophylline",
        dosage: "300-400mg",
        frequency: "Twice daily",
        notes: "Relaxes bronchial muscles, improves breathing",
      },
    ],
    ayurvedic: [
      {
        name: "Vasaka (Adhatoda)",
        dosage: "1-2 grams",
        frequency: "Twice daily",
        notes: "Natural expectorant, clears respiratory passages",
      },
      {
        name: "Ginger & Tulsi Tea",
        dosage: "1 cup",
        frequency: "Twice daily",
        notes: "Soothes respiratory tract, reduces inflammation",
      },
      {
        name: "Licorice Root",
        dosage: "1 teaspoon",
        frequency: "Twice daily",
        notes: "Anti-inflammatory, soothing for airways",
      },
    ],
    exercises: [
      {
        name: "Diaphragmatic Breathing",
        duration: "10 minutes",
        frequency: "Daily",
        benefits: "Strengthens respiratory muscles, improves oxygen intake",
      },
      {
        name: "Yoga (Pranayama)",
        duration: "15-20 minutes",
        frequency: "Daily",
        benefits: "Expands lungs, improves breathing capacity",
      },
      {
        name: "Swimming",
        duration: "30 minutes",
        frequency: "3-4 times per week",
        benefits: "Safe cardio, builds respiratory endurance",
      },
      {
        name: "Walking",
        duration: "30 minutes",
        frequency: "Daily or alternate days",
        benefits: "Gentle cardio, improves lung function",
      },
    ],
    homeRemedies: [
      {
        name: "Honey & Lemon",
        ingredients: "1 teaspoon honey, fresh lemon juice, warm water",
        preparation: "Mix all ingredients, drink warm",
        benefits: "Soothes throat, reduces cough",
      },
      {
        name: "Ginger & Honey",
        ingredients: "1 inch fresh ginger, 1 teaspoon honey",
        preparation: "Chew fresh ginger, follow with honey",
        benefits: "Anti-inflammatory, opens airways",
      },
      {
        name: "Turmeric Milk",
        ingredients: "1/2 teaspoon turmeric, 1 cup warm milk",
        preparation: "Mix turmeric in warm milk, drink before bed",
        benefits: "Anti-inflammatory, promotes better sleep",
      },
      {
        name: "Garlic & Mustard Oil",
        ingredients: "3-4 garlic cloves, 2 tablespoons mustard oil",
        preparation: "Heat mustard oil, add garlic, massage on chest",
        benefits: "Improves circulation, eases breathing",
      },
    ],
  },
  {
    disease: "Cold & Cough",
    allopathic: [
      {
        name: "Paracetamol",
        dosage: "500-1000mg",
        frequency: "3-4 times daily",
        notes: "Relieves fever and body aches",
      },
      {
        name: "Dextromethorphan",
        dosage: "10-20mg",
        frequency: "Every 4-6 hours",
        notes: "Suppresses cough, reduces irritation",
      },
      {
        name: "Loratadine",
        dosage: "10mg",
        frequency: "Once daily",
        notes: "Antihistamine for allergic symptoms",
      },
    ],
    ayurvedic: [
      {
        name: "Giloy",
        dosage: "1-2 pieces of stem",
        frequency: "Daily",
        notes: "Boosts immunity, fights infection",
      },
      {
        name: "Ginger & Tulsi Tea",
        dosage: "1 cup",
        frequency: "3-4 times daily",
        notes: "Soothes throat, expels phlegm",
      },
      {
        name: "Licorice Root",
        dosage: "1/2 teaspoon",
        frequency: "Twice daily",
        notes: "Soothing to throat, anti-inflammatory",
      },
    ],
    exercises: [
      {
        name: "Rest & Sleep",
        duration: "8-10 hours",
        frequency: "Daily until recovery",
        benefits: "Allows immune system to fight infection",
      },
      {
        name: "Light Walking",
        duration: "15-20 minutes",
        frequency: "Alternate days",
        benefits: "Gentle movement aids recovery",
      },
      {
        name: "Deep Breathing",
        duration: "5-10 minutes",
        frequency: "3-4 times daily",
        benefits: "Clears nasal passages, oxygenates body",
      },
      {
        name: "Mild Stretching",
        duration: "10 minutes",
        frequency: "Daily",
        benefits: "Prevents stiffness, promotes circulation",
      },
    ],
    homeRemedies: [
      {
        name: "Honey & Ginger",
        ingredients: "1 teaspoon honey, 1 tablespoon fresh ginger juice",
        preparation: "Mix honey and ginger juice, consume directly",
        benefits: "Soothes cough, warms body",
      },
      {
        name: "Turmeric & Milk",
        ingredients: "1/2 teaspoon turmeric, 1 cup warm milk, honey",
        preparation: "Heat milk, add turmeric and honey, drink warm",
        benefits: "Reduces inflammation, promotes sleep",
      },
      {
        name: "Lemon Tea",
        ingredients: "1 lemon, 1 cup hot water, 1 teaspoon honey",
        preparation: "Squeeze lemon in hot water, add honey, drink",
        benefits: "Rich in vitamin C, soothes throat",
      },
      {
        name: "Salt Water Gargle",
        ingredients: "1/2 teaspoon salt, 1 cup warm water",
        preparation: "Mix salt in warm water, gargle twice daily",
        benefits: "Kills bacteria, reduces throat pain",
      },
    ],
  },
];

const MedicineRecommender = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [selectedDisease, setSelectedDisease] = useState<DiseaseRecommendation | null>(null);
  const [searchResults, setSearchResults] = useState<DiseaseRecommendation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (searchInput.trim() === "") {
      toast.error("Please enter a disease name");
      return;
    }

    const query = searchInput.toLowerCase();
    const results = medicineDatabase.filter(item =>
      item.disease.toLowerCase().includes(query)
    );

    setSearchResults(results);
    setHasSearched(true);
    setSelectedDisease(null);

    if (results.length === 0) {
      toast.info("Disease not found in database. Try another search.");
    }
  };

  const handleSelectDisease = (disease: DiseaseRecommendation) => {
    setSelectedDisease(disease);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-200/50 bg-white/80 backdrop-blur-xl sticky top-0 z-40 shadow-sm">
        <div className="container flex h-20 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="hover:bg-slate-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-display font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Medicine Recommender
              </span>
              <p className="text-xs text-muted-foreground">Find remedies for any disease</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-6 py-10">
        {!selectedDisease ? (
          <>
            {/* Search Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-50 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Search for Disease Treatment</CardTitle>
                <CardDescription>
                  Enter a disease name to get comprehensive treatment recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Diabetes, Heart Disease, Asthma, Cold..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 text-lg py-2"
                  />
                  <Button
                    onClick={handleSearch}
                    className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                    size="lg"
                  >
                    <Search className="h-5 w-5" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Available Diseases */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Available Diseases</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {medicineDatabase.map((disease, idx) => (
                  <Card
                    key={idx}
                    className="cursor-pointer border-2 border-slate-200 hover:border-emerald-600 hover:shadow-lg transition-all hover:-translate-y-1 bg-white/60 backdrop-blur-sm group"
                    onClick={() => {
                      setSearchInput(disease.disease);
                      handleSelectDisease(disease);
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {disease.disease}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Pill className="h-4 w-4 text-blue-600" />
                          <span>{disease.allopathic.length} Medicines</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-green-600" />
                          <span>{disease.ayurvedic.length} Remedies</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dumbbell className="h-4 w-4 text-orange-600" />
                          <span>{disease.exercises.length} Exercises</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600" />
                          <span>{disease.homeRemedies.length} Tips</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                        size="sm"
                      >
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Details View */}
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => setSelectedDisease(null)}
                className="gap-2 mb-6"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Search
              </Button>

              <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">
                {selectedDisease.disease} - Treatment Guide
              </h1>
              <p className="text-lg text-slate-600">
                Comprehensive recommendations for managing {selectedDisease.disease.toLowerCase()}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Allopathic Medicines */}
              <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <Pill className="h-6 w-6" />
                    <CardTitle>Allopathic Medicines</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {selectedDisease.allopathic.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        <p className="font-bold text-slate-900 text-lg">{med.name}</p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p className="text-slate-700">
                            <span className="font-semibold">Dosage:</span> {med.dosage}
                          </p>
                          <p className="text-slate-700">
                            <span className="font-semibold">Frequency:</span> {med.frequency}
                          </p>
                          <p className="text-blue-700 mt-2 italic">{med.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ayurvedic Medicines */}
              <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-6 w-6" />
                    <CardTitle>Ayurvedic Medicines</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {selectedDisease.ayurvedic.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-colors"
                      >
                        <p className="font-bold text-slate-900 text-lg">{med.name}</p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p className="text-slate-700">
                            <span className="font-semibold">Dosage:</span> {med.dosage}
                          </p>
                          <p className="text-slate-700">
                            <span className="font-semibold">Frequency:</span> {med.frequency}
                          </p>
                          <p className="text-green-700 mt-2 italic">{med.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {/* Exercises */}
              <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-6 w-6" />
                    <CardTitle>Recommended Exercises</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {selectedDisease.exercises.map((exercise, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors"
                      >
                        <p className="font-bold text-slate-900 text-lg">{exercise.name}</p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p className="text-slate-700">
                            <span className="font-semibold">Duration:</span> {exercise.duration}
                          </p>
                          <p className="text-slate-700">
                            <span className="font-semibold">Frequency:</span> {exercise.frequency}
                          </p>
                          <p className="text-orange-700 mt-2 italic">{exercise.benefits}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Home Remedies */}
              <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-6 w-6" />
                    <CardTitle>Home Remedies</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {selectedDisease.homeRemedies.map((remedy, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 transition-colors"
                      >
                        <p className="font-bold text-slate-900 text-lg">{remedy.name}</p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p className="text-slate-700">
                            <span className="font-semibold">Ingredients:</span> {remedy.ingredients}
                          </p>
                          <p className="text-slate-700">
                            <span className="font-semibold">Preparation:</span> {remedy.preparation}
                          </p>
                          <p className="text-yellow-700 mt-2 italic">{remedy.benefits}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-900 to-slate-800 text-white">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Heart className="h-6 w-6" />
                  Complete Treatment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-400">
                      {selectedDisease.allopathic.length}
                    </p>
                    <p className="text-slate-300">Allopathic Options</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-400">
                      {selectedDisease.ayurvedic.length}
                    </p>
                    <p className="text-slate-300">Ayurvedic Options</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-400">
                      {selectedDisease.exercises.length}
                    </p>
                    <p className="text-slate-300">Exercise Programs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-400">
                      {selectedDisease.homeRemedies.length}
                    </p>
                    <p className="text-slate-300">Home Remedies</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default MedicineRecommender;
