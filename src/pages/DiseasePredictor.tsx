import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Activity, 
  CheckCircle2, 
  XCircle,
  Stethoscope, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  HeartPulse,
  Brain,
  Droplets,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  ClipboardList
} from "lucide-react";
import { logActivity } from "@/utils/analytics";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────
type PredictorStep = "QUESTIONS" | "RESULT_ROUTING" | "PARAMETER_FORM" | "PREDICTING" | "RESULTS";
type DiseaseType = "diabetes" | "heart" | "parkinsons";

interface SymptomQuestion {
  id: string;
  text: string;
  diseaseRelevance: DiseaseType[];
}

interface PredictionResult {
  diseaseType: string;
  diseaseName: string;
  prediction: number;
  isPositive: boolean;
  message: string;
  disclaimer: string;
}

// ─── Symptom Questions ───────────────────────────────────
const SYMPTOM_QUESTIONS: SymptomQuestion[] = [
  // Diabetes-related
  { id: "q1", text: "Do you experience frequent thirst or dry mouth?", diseaseRelevance: ["diabetes"] },
  { id: "q2", text: "Do you urinate more often than usual?", diseaseRelevance: ["diabetes"] },
  { id: "q3", text: "Do you feel persistent fatigue or extreme tiredness?", diseaseRelevance: ["diabetes", "heart"] },
  { id: "q4", text: "Have you experienced unexplained weight loss recently?", diseaseRelevance: ["diabetes"] },
  { id: "q5", text: "Do you have blurred vision or difficulty focusing?", diseaseRelevance: ["diabetes"] },
  // Heart Disease-related
  { id: "q6", text: "Do you experience chest pain or discomfort?", diseaseRelevance: ["heart"] },
  { id: "q7", text: "Do you feel shortness of breath during normal activities?", diseaseRelevance: ["heart"] },
  { id: "q8", text: "Do you feel dizzy or lightheaded frequently?", diseaseRelevance: ["heart", "parkinsons"] },
  { id: "q9", text: "Do you have swelling in your legs, ankles, or feet?", diseaseRelevance: ["heart"] },
  { id: "q10", text: "Do you experience irregular heartbeat or palpitations?", diseaseRelevance: ["heart"] },
  // Parkinson's-related
  { id: "q11", text: "Do you notice tremors or involuntary shaking in your hands?", diseaseRelevance: ["parkinsons"] },
  { id: "q12", text: "Do you experience stiffness in your limbs or body?", diseaseRelevance: ["parkinsons"] },
  { id: "q13", text: "Have you noticed your handwriting becoming smaller or cramped?", diseaseRelevance: ["parkinsons"] },
  { id: "q14", text: "Do you have difficulty with balance or walking?", diseaseRelevance: ["parkinsons"] },
  { id: "q15", text: "Has your voice become noticeably softer or more monotone?", diseaseRelevance: ["parkinsons"] },
];

// ─── Parameter Definitions ───────────────────────────────
interface ParamField {
  key: string;
  label: string;
  placeholder: string;
  helpText?: string;
}

const DIABETES_PARAMS: ParamField[] = [
  { key: "Pregnancies", label: "Number of Pregnancies", placeholder: "e.g. 6", helpText: "Number of pregnancies (0 if male or never pregnant)" },
  { key: "Glucose", label: "Glucose Level (mg/dL)", placeholder: "e.g. 148", helpText: "Plasma glucose concentration (2 hours in an oral glucose tolerance test)" },
  { key: "BloodPressure", label: "Blood Pressure (mm Hg)", placeholder: "e.g. 72", helpText: "Diastolic blood pressure" },
  { key: "SkinThickness", label: "Skin Thickness (mm)", placeholder: "e.g. 35", helpText: "Triceps skin fold thickness" },
  { key: "Insulin", label: "Insulin Level (mu U/ml)", placeholder: "e.g. 0", helpText: "2-Hour serum insulin" },
  { key: "BMI", label: "BMI (kg/m²)", placeholder: "e.g. 33.6", helpText: "Body Mass Index (weight in kg / height in m²)" },
  { key: "DiabetesPedigreeFunction", label: "Diabetes Pedigree Function", placeholder: "e.g. 0.627", helpText: "A function scoring likelihood of diabetes based on family history" },
  { key: "Age", label: "Age (years)", placeholder: "e.g. 50" },
];

const HEART_PARAMS: ParamField[] = [
  { key: "age", label: "Age (years)", placeholder: "e.g. 63" },
  { key: "sex", label: "Sex", placeholder: "1 = Male, 0 = Female", helpText: "Biological sex: 1 for Male, 0 for Female" },
  { key: "cp", label: "Chest Pain Type", placeholder: "0-3", helpText: "0: Asymptomatic, 1: Atypical angina, 2: Non-anginal pain, 3: Typical angina" },
  { key: "trestbps", label: "Resting Blood Pressure (mm Hg)", placeholder: "e.g. 145" },
  { key: "chol", label: "Serum Cholesterol (mg/dL)", placeholder: "e.g. 233" },
  { key: "fbs", label: "Fasting Blood Sugar > 120 mg/dL", placeholder: "1 = True, 0 = False" },
  { key: "restecg", label: "Resting ECG Results", placeholder: "0-2", helpText: "0: Normal, 1: ST-T wave abnormality, 2: Left ventricular hypertrophy" },
  { key: "thalach", label: "Max Heart Rate Achieved", placeholder: "e.g. 150" },
  { key: "exang", label: "Exercise Induced Angina", placeholder: "1 = Yes, 0 = No" },
  { key: "oldpeak", label: "ST Depression (Exercise vs Rest)", placeholder: "e.g. 2.3" },
  { key: "slope", label: "Slope of Peak Exercise ST", placeholder: "0-2", helpText: "0: Upsloping, 1: Flat, 2: Downsloping" },
  { key: "ca", label: "Major Vessels by Fluoroscopy", placeholder: "0-4", helpText: "Number of major vessels colored by fluoroscopy (0-4)" },
  { key: "thal", label: "Thalassemia", placeholder: "0-3", helpText: "0: Unknown, 1: Normal, 2: Fixed defect, 3: Reversible defect" },
];

const PARKINSONS_PARAMS: ParamField[] = [
  { key: "fo", label: "MDVP:Fo (Hz)", placeholder: "e.g. 119.992", helpText: "Average vocal fundamental frequency" },
  { key: "fhi", label: "MDVP:Fhi (Hz)", placeholder: "e.g. 157.302", helpText: "Maximum vocal fundamental frequency" },
  { key: "flo", label: "MDVP:Flo (Hz)", placeholder: "e.g. 74.997", helpText: "Minimum vocal fundamental frequency" },
  { key: "Jitter_percent", label: "MDVP:Jitter (%)", placeholder: "e.g. 0.00784" },
  { key: "Jitter_Abs", label: "MDVP:Jitter (Abs)", placeholder: "e.g. 0.00007" },
  { key: "RAP", label: "MDVP:RAP", placeholder: "e.g. 0.00370" },
  { key: "PPQ", label: "MDVP:PPQ", placeholder: "e.g. 0.00554" },
  { key: "DDP", label: "Jitter:DDP", placeholder: "e.g. 0.01109" },
  { key: "Shimmer", label: "MDVP:Shimmer", placeholder: "e.g. 0.04374" },
  { key: "Shimmer_dB", label: "MDVP:Shimmer (dB)", placeholder: "e.g. 0.426" },
  { key: "APQ3", label: "Shimmer:APQ3", placeholder: "e.g. 0.02182" },
  { key: "APQ5", label: "Shimmer:APQ5", placeholder: "e.g. 0.03130" },
  { key: "APQ", label: "MDVP:APQ", placeholder: "e.g. 0.02971" },
  { key: "DDA", label: "Shimmer:DDA", placeholder: "e.g. 0.06545" },
  { key: "NHR", label: "NHR", placeholder: "e.g. 0.02211", helpText: "Noise-to-harmonics ratio" },
  { key: "HNR", label: "HNR", placeholder: "e.g. 21.033", helpText: "Harmonics-to-noise ratio" },
  { key: "RPDE", label: "RPDE", placeholder: "e.g. 0.414783", helpText: "Recurrence period density entropy" },
  { key: "DFA", label: "DFA", placeholder: "e.g. 0.815285", helpText: "Signal fractal scaling exponent" },
  { key: "spread1", label: "Spread1", placeholder: "e.g. -4.813031", helpText: "Nonlinear measure of fundamental frequency variation" },
  { key: "spread2", label: "Spread2", placeholder: "e.g. 0.266482" },
  { key: "D2", label: "D2", placeholder: "e.g. 2.301442", helpText: "Correlation dimension" },
  { key: "PPE", label: "PPE", placeholder: "e.g. 0.284654", helpText: "Pitch period entropy" },
];

function getParamsForDisease(disease: DiseaseType): ParamField[] {
  switch (disease) {
    case "diabetes": return DIABETES_PARAMS;
    case "heart": return HEART_PARAMS;
    case "parkinsons": return PARKINSONS_PARAMS;
  }
}

function getDiseaseInfo(disease: DiseaseType) {
  switch (disease) {
    case "diabetes": return { name: "Diabetes", icon: Droplets, color: "blue", gradient: "from-blue-500 to-cyan-500" };
    case "heart": return { name: "Heart Disease", icon: HeartPulse, color: "rose", gradient: "from-rose-500 to-pink-500" };
    case "parkinsons": return { name: "Parkinson's Disease", icon: Brain, color: "purple", gradient: "from-purple-500 to-violet-500" };
  }
}

// ─── ML Model Weights (extracted from sklearn pickle files) ───
const MODEL_WEIGHTS = {
  diabetes: {
    coef: [0.08711652351985322, 0.032064109333077795, -0.011519129438056552, 0.00023438574589818018, -0.0015798939111846266, 0.07903335685392676, 0.7290042067332327, 0.006816209354383318],
    intercept: -7.130816847821328,
    type: "svc" as const,
    featureKeys: ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"],
    positiveMessage: "The assessment indicates signs consistent with diabetes. Please consult a healthcare professional for a thorough evaluation and proper management plan.",
    negativeMessage: "The assessment does not indicate signs of diabetes. Continue maintaining a healthy lifestyle with regular check-ups.",
  },
  heart: {
    coef: [0.02884312041744863, 0.4606182611137253, -0.7768197264269201, 0.22876314378342233, 0.0053059076577364195, -0.07716246760754641, -0.3084885167678282, -0.32075044697016925, 0.2163517738153382, 0.4560685076805213, -0.23628552368619582, 0.4302399528270193, 0.6148628291311669],
    intercept: -0.22488325229472117,
    type: "svc_scaled" as const,
    scaler_mean: [54.752066115702476, 0.6818181818181818, 0.9958677685950413, 131.27685950413223, 248.07438016528926, 0.16942148760330578, 0.5247933884297521, 149.43801652892563, 0.32231404958677684, 1.0801652892561981, 1.4173553719008265, 0.7644628099173554, 2.3264462809917354],
    scaler_scale: [9.029594127718653, 0.46577048936179993, 1.0543022207116421, 17.830289301735032, 53.464233087711335, 0.3751237757615327, 0.5156687051877457, 22.550729794125527, 0.4673624963834277, 1.200834409260738, 0.6126999840093249, 1.0515128419954558, 0.60715684727829],
    featureKeys: ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"],
    positiveMessage: "The assessment indicates potential heart disease risk. Please seek immediate medical consultation for further evaluation, including ECG and cardiac imaging.",
    negativeMessage: "The assessment does not indicate heart disease. Maintain a heart-healthy diet, regular exercise, and routine cardiovascular check-ups.",
  },
  parkinsons: {
    coef: [-0.006436178569231288, -0.0023981122542977573, 0.0016487456304332682, -0.011791340920639852, -0.00010521768330263787, -0.0005593542334430635, -0.0031327252127602368, -0.0017104016438242394, 0.0859497554945976, 0.7535659407722547, 0.04049152706608084, 0.05498900396156781, 0.08063047190599008, 0.12139688570146921, -0.07654543234115692, 0.037209333159367475, -0.9975325853540173, 0.47133993461573287, 1.3368816123561222, 0.44958776630690656, 0.8365463379046978, 0.02054647125390302],
    intercept: 7.462176934170908,
    type: "svc" as const,
    featureKeys: ["fo", "fhi", "flo", "Jitter_percent", "Jitter_Abs", "RAP", "PPQ", "DDP", "Shimmer", "Shimmer_dB", "APQ3", "APQ5", "APQ", "DDA", "NHR", "HNR", "RPDE", "DFA", "spread1", "spread2", "D2", "PPE"],
    positiveMessage: "The assessment indicates signs consistent with Parkinson's disease. Please consult a neurologist for a comprehensive evaluation and discuss management options.",
    negativeMessage: "The assessment does not indicate signs of Parkinson's disease. Continue monitoring for any changes and maintain a healthy, active lifestyle.",
  },
};

function runPrediction(diseaseType: DiseaseType, params: Record<string, string>): PredictionResult {
  const model = MODEL_WEIGHTS[diseaseType];
  const features = model.featureKeys.map((key) => parseFloat(params[key]));

  // Apply StandardScaler if the model requires it (heart disease model)
  let scaledFeatures = features;
  if (model.type === "svc_scaled" && "scaler_mean" in model && "scaler_scale" in model) {
    scaledFeatures = features.map((val, i) => (val - model.scaler_mean[i]) / model.scaler_scale[i]);
  }

  // Compute dot product: sum(coef[i] * scaled_feature[i]) + intercept
  let decision = model.intercept;
  for (let i = 0; i < scaledFeatures.length; i++) {
    decision += model.coef[i] * scaledFeatures[i];
  }

  // Linear SVC: decision > 0 → class 1
  const prediction = decision > 0 ? 1 : 0;

  const info = getDiseaseInfo(diseaseType);
  return {
    diseaseType,
    diseaseName: info.name,
    prediction,
    isPositive: prediction === 1,
    message: prediction === 1 ? model.positiveMessage : model.negativeMessage,
    disclaimer: "This is an AI-based screening tool and not a substitute for professional medical diagnosis. Always consult a qualified healthcare provider.",
  };
}

// ─── Main Component ──────────────────────────────────────
const DiseasePredictor = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<PredictorStep>("QUESTIONS");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [scores, setScores] = useState<Record<DiseaseType, number>>({ diabetes: 0, heart: 0, parkinsons: 0 });
  const [recommendedDisease, setRecommendedDisease] = useState<DiseaseType | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseType | null>(null);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = SYMPTOM_QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / SYMPTOM_QUESTIONS.length) * 100;

  const handleAnswer = (answer: boolean) => {
    const newAnswers = { ...answers, [currentQuestion.id]: answer };
    setAnswers(newAnswers);

    // Update scores
    if (answer) {
      const newScores = { ...scores };
      currentQuestion.diseaseRelevance.forEach((d) => {
        newScores[d] = (newScores[d] || 0) + 1;
      });
      setScores(newScores);
    }

    // Move to next question or finish
    if (currentQuestionIndex < SYMPTOM_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Calculate final scores with the current answer
      const finalScores = { ...scores };
      if (answer) {
        currentQuestion.diseaseRelevance.forEach((d) => {
          finalScores[d] = (finalScores[d] || 0) + 1;
        });
      }

      // Determine recommended disease
      const maxScore = Math.max(finalScores.diabetes, finalScores.heart, finalScores.parkinsons);
      let recommended: DiseaseType = "diabetes";
      if (finalScores.heart === maxScore) recommended = "heart";
      if (finalScores.parkinsons === maxScore) recommended = "parkinsons";
      if (finalScores.diabetes === maxScore) recommended = "diabetes";

      setScores(finalScores);
      setRecommendedDisease(recommended);
      setSelectedDisease(recommended);
      setCurrentStep("RESULT_ROUTING");
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Undo the score from the previous answer
      const prevQuestion = SYMPTOM_QUESTIONS[currentQuestionIndex - 1];
      if (answers[prevQuestion.id]) {
        const newScores = { ...scores };
        prevQuestion.diseaseRelevance.forEach((d) => {
          newScores[d] = Math.max(0, (newScores[d] || 0) - 1);
        });
        setScores(newScores);
      }
      const newAnswers = { ...answers };
      delete newAnswers[prevQuestion.id];
      setAnswers(newAnswers);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleParameterChange = (key: string, value: string) => {
    setParameters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmitPrediction = async () => {
    if (!selectedDisease) return;

    const params = getParamsForDisease(selectedDisease);
    const missing = params.filter((p) => !parameters[p.key]?.trim());
    if (missing.length > 0) {
      toast.error(`Please fill in all fields. Missing: ${missing.map((p) => p.label).join(", ")}`);
      return;
    }

    // Validate all values are valid numbers
    const invalidFields = params.filter((p) => isNaN(parseFloat(parameters[p.key])));
    if (invalidFields.length > 0) {
      toast.error(`Invalid values in: ${invalidFields.map((p) => p.label).join(", ")}`);
      return;
    }

    setCurrentStep("PREDICTING");
    setIsSubmitting(true);

    // Small delay for UX — show the loading animation briefly
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      // Run prediction entirely client-side using embedded model weights
      const result = runPrediction(selectedDisease, parameters);

      setPredictionResult(result);
      setCurrentStep("RESULTS");

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        logActivity(user.id, "Disease Predictor", "/disease-predictor", "Completed", {
          diseaseType: selectedDisease,
          prediction: result.prediction,
        });
      }

      toast.success("Prediction complete!");
    } catch (error) {
      console.error("Prediction error:", error);
      toast.error("Failed to run prediction. Please check your input values.");
      setCurrentStep("PARAMETER_FORM");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAll = () => {
    setCurrentStep("QUESTIONS");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScores({ diabetes: 0, heart: 0, parkinsons: 0 });
    setRecommendedDisease(null);
    setSelectedDisease(null);
    setParameters({});
    setPredictionResult(null);
    setIsSubmitting(false);
  };

  useEffect(() => {
    const logAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        logActivity(user.id, "Disease Predictor", "/disease-predictor", "Completed", { status: "Accessed" });
      }
    };
    logAccess();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="container max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-8 group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Button>

        <div className="grid gap-8">
          {/* Header Card */}
          <Card className="border-none shadow-premium bg-white dark:bg-slate-900 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 bg-primary h-full" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Activity className="h-7 w-7" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold font-display">Disease Predictor AI</CardTitle>
                  <CardDescription className="text-base">
                    Answer health questions → Get AI-powered disease prediction
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Step Progress Indicator */}
          <div className="flex items-center gap-2 px-2">
            {["Questions", "Analysis", "Medical Data", "Prediction", "Results"].map((label, index) => {
              const stepMap: PredictorStep[] = ["QUESTIONS", "RESULT_ROUTING", "PARAMETER_FORM", "PREDICTING", "RESULTS"];
              const currentStepIndex = stepMap.indexOf(currentStep);
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              return (
                <div key={label} className="flex items-center flex-1">
                  <div className={`flex items-center gap-2 ${isActive ? "text-blue-600 dark:text-blue-400 font-semibold" : isCompleted ? "text-green-600 dark:text-green-400" : "text-slate-400"}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isActive ? "bg-blue-600 text-white scale-110 shadow-lg shadow-blue-200 dark:shadow-blue-900/50" : 
                      isCompleted ? "bg-green-500 text-white" : 
                      "bg-slate-200 dark:bg-slate-700 text-slate-500"
                    }`}>
                      {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                    </div>
                    <span className="hidden md:inline text-xs">{label}</span>
                  </div>
                  {index < 4 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded ${isCompleted ? "bg-green-400" : "bg-slate-200 dark:bg-slate-700"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Main Content Area */}
          <Card className="border-none shadow-xl bg-white dark:bg-slate-900 min-h-[500px]">
            <CardContent className="p-8">

              {/* ─── Step 1: QUESTIONS ─── */}
              {currentStep === "QUESTIONS" && (
                <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Question {currentQuestionIndex + 1} of {SYMPTOM_QUESTIONS.length}</span>
                      <span className="font-semibold text-blue-600">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Question Card */}
                  <div key={currentQuestion.id} className="animate-in fade-in slide-in-from-right-8 duration-400">
                    <div className="text-center space-y-6 py-8">
                      <div className="inline-flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                        <Stethoscope className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold leading-tight px-4">
                        {currentQuestion.text}
                      </h2>
                      <div className="flex items-center justify-center gap-2">
                        {currentQuestion.diseaseRelevance.map((d) => {
                          const info = getDiseaseInfo(d);
                          return (
                            <Badge key={d} variant="secondary" className={`text-xs bg-${info.color}-50 text-${info.color}-600 dark:bg-${info.color}-900/20 dark:text-${info.color}-400 border-none`}>
                              {info.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    {/* Answer Buttons */}
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <button
                        onClick={() => handleAnswer(true)}
                        className="group relative h-24 rounded-2xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 hover:border-green-400 dark:hover:border-green-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400 transition-transform group-hover:scale-110" />
                          <span className="font-bold text-green-700 dark:text-green-300 text-lg">Yes</span>
                        </div>
                      </button>
                      <button
                        onClick={() => handleAnswer(false)}
                        className="group relative h-24 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <XCircle className="h-8 w-8 text-slate-500 dark:text-slate-400 transition-transform group-hover:scale-110" />
                          <span className="font-bold text-slate-600 dark:text-slate-300 text-lg">No</span>
                        </div>
                      </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-center pt-6">
                      <Button
                        variant="ghost"
                        onClick={goToPreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        size="sm"
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Previous Question
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Step 2: RESULT_ROUTING ─── */}
              {currentStep === "RESULT_ROUTING" && recommendedDisease && (
                <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 fade-in duration-500">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
                      <Sparkles className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <Badge className="px-4 py-1.5 text-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 border-none">
                      SYMPTOM ANALYSIS COMPLETE
                    </Badge>
                    <h2 className="text-3xl font-bold">Here's What We Found</h2>
                    <p className="text-slate-500 max-w-lg mx-auto">
                      Based on your responses, here are the risk scores for each condition. Select a model to proceed with detailed assessment.
                    </p>
                  </div>

                  {/* Score Cards */}
                  <div className="grid gap-4">
                    {(["diabetes", "heart", "parkinsons"] as DiseaseType[]).map((disease) => {
                      const info = getDiseaseInfo(disease);
                      const Icon = info.icon;
                      const maxPossible = SYMPTOM_QUESTIONS.filter((q) => q.diseaseRelevance.includes(disease)).length;
                      const score = scores[disease];
                      const percentage = maxPossible > 0 ? Math.round((score / maxPossible) * 100) : 0;
                      const isRecommended = disease === recommendedDisease;
                      const isSelected = disease === selectedDisease;

                      return (
                        <button
                          key={disease}
                          onClick={() => setSelectedDisease(disease)}
                          className={`relative w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.01] ${
                            isSelected
                              ? `border-${info.color}-400 dark:border-${info.color}-500 bg-${info.color}-50/50 dark:bg-${info.color}-900/20 shadow-lg`
                              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600"
                          }`}
                        >
                          {isRecommended && (
                            <div className="absolute -top-2.5 right-4">
                              <Badge className={`bg-gradient-to-r ${info.gradient} text-white border-none text-xs px-3 shadow-md`}>
                                ★ RECOMMENDED
                              </Badge>
                            </div>
                          )}
                          <div className="flex items-center gap-4">
                            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${info.gradient} text-white shadow-md`}>
                              <Icon className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-lg">{info.name}</p>
                              <p className="text-sm text-slate-500">
                                {score} of {maxPossible} symptoms matched
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-2xl font-bold bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent`}>
                                {percentage}%
                              </p>
                              <p className="text-xs text-slate-400">match</p>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${info.gradient} rounded-full transition-all duration-700`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="grid gap-3">
                    <Button
                      className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg group"
                      onClick={() => setCurrentStep("PARAMETER_FORM")}
                    >
                      Continue with {selectedDisease ? getDiseaseInfo(selectedDisease).name : ""} Assessment
                      <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button variant="ghost" onClick={resetAll} className="text-slate-500">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Start Over
                    </Button>
                  </div>
                </div>
              )}

              {/* ─── Step 3: PARAMETER_FORM ─── */}
              {currentStep === "PARAMETER_FORM" && selectedDisease && (
                <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {(() => {
                    const info = getDiseaseInfo(selectedDisease);
                    const Icon = info.icon;
                    const params = getParamsForDisease(selectedDisease);
                    return (
                      <>
                        <div className="text-center space-y-3">
                          <div className={`inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br ${info.gradient} text-white shadow-lg`}>
                            <Icon className="h-10 w-10" />
                          </div>
                          <h2 className="text-2xl font-bold">{info.name} Assessment</h2>
                          <p className="text-slate-500 max-w-md mx-auto">
                            Enter your medical parameters below to run the ML prediction model. All fields are required.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                          <ClipboardList className="h-5 w-5 text-amber-600 flex-shrink-0" />
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            You can find these values from your recent medical reports or health check-up results.
                          </p>
                        </div>

                        {/* Parameter Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {params.map((param) => (
                            <div key={param.key} className="space-y-1.5">
                              <Label htmlFor={param.key} className="text-sm font-semibold">
                                {param.label}
                              </Label>
                              <Input
                                id={param.key}
                                type="number"
                                step="any"
                                placeholder={param.placeholder}
                                value={parameters[param.key] || ""}
                                onChange={(e) => handleParameterChange(param.key, e.target.value)}
                                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 focus:ring-blue-500"
                              />
                              {param.helpText && (
                                <p className="text-xs text-slate-400">{param.helpText}</p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="grid gap-3 pt-4">
                          <Button
                            className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg group"
                            onClick={handleSubmitPrediction}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Running Prediction...
                              </>
                            ) : (
                              <>
                                Run AI Prediction
                                <Sparkles className="ml-2 h-5 w-5" />
                              </>
                            )}
                          </Button>
                          <Button variant="ghost" onClick={() => setCurrentStep("RESULT_ROUTING")} className="text-slate-500">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Change Disease Model
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* ─── Step 4: PREDICTING ─── */}
              {currentStep === "PREDICTING" && (
                <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in duration-500">
                  <div className="relative">
                    <div className="h-28 w-28 rounded-full border-[6px] border-blue-100 dark:border-blue-900/30 border-t-blue-600 animate-spin" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Sparkles className="h-10 w-10 text-blue-600 animate-pulse" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">Analyzing Your Data...</h3>
                    <p className="text-slate-500">Running the ML prediction model with your parameters</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      Processing inputs
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: "0.3s" }} />
                      Running model
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: "0.6s" }} />
                      Generating results
                    </span>
                  </div>
                </div>
              )}

              {/* ─── Step 5: RESULTS ─── */}
              {currentStep === "RESULTS" && predictionResult && (
                <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 fade-in duration-500">
                  {/* Result Indicator */}
                  <div className="text-center space-y-6">
                    <div className={`inline-flex items-center justify-center p-6 rounded-full ${
                      predictionResult.isPositive
                        ? "bg-red-50 dark:bg-red-900/20"
                        : "bg-emerald-50 dark:bg-emerald-900/20"
                    }`}>
                      {predictionResult.isPositive ? (
                        <AlertTriangle className="h-16 w-16 text-red-500" />
                      ) : (
                        <ShieldCheck className="h-16 w-16 text-emerald-500" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Badge className={`px-4 py-1.5 text-sm border-none ${
                        predictionResult.isPositive
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      }`}>
                        {predictionResult.isPositive ? "⚠️ RISK DETECTED" : "✅ NO RISK DETECTED"}
                      </Badge>
                      <h2 className="text-3xl font-bold">
                        {predictionResult.diseaseName} Assessment Result
                      </h2>
                    </div>
                  </div>

                  {/* Result Card */}
                  <Card className={`border-2 ${
                    predictionResult.isPositive
                      ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                      : "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10"
                  }`}>
                    <CardContent className="p-6">
                      <p className="text-lg leading-relaxed">
                        {predictionResult.message}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Disclaimer */}
                  <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800 dark:text-amber-200">Medical Disclaimer</AlertTitle>
                    <AlertDescription className="text-amber-700 dark:text-amber-300 text-sm">
                      {predictionResult.disclaimer}
                    </AlertDescription>
                  </Alert>

                  {/* Actions */}
                  <div className="grid gap-3 pt-2">
                    <Button
                      className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                      onClick={resetAll}
                    >
                      <RotateCcw className="mr-2 h-5 w-5" />
                      Start New Assessment
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-xl"
                      onClick={() => navigate("/dashboard")}
                    >
                      Return to Dashboard
                    </Button>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DiseasePredictor;