import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Model weights extracted from sklearn pickle files ───
// Diabetes: SVC with linear kernel (8 features)
const DIABETES_COEF = [
  0.08711652351985322, 0.032064109333077795, -0.011519129438056552,
  0.00023438574589818018, -0.0015798939111846266, 0.07903335685392676,
  0.7290042067332327, 0.006816209354383318
];
const DIABETES_INTERCEPT = -7.130816847821328;
const DIABETES_FEATURES = [
  "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
  "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
];

// Heart Disease: Logistic Regression (13 features)
const HEART_COEF = [
  0.00972776579660922, -1.292456817552437, 0.8890580225917815,
  -0.012082450410371509, -0.0025807626939402793, -0.07412427998260032,
  0.5778499209037506, 0.03402739086100445, -0.9024949094037096,
  -0.49204990894668654, 0.2423381728516691, -0.7937811940253837,
  -1.1603417451590055
];
const HEART_INTERCEPT = -5.154394848665909e-05;
const HEART_FEATURES = [
  "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
  "thalach", "exang", "oldpeak", "slope", "ca", "thal"
];

// Parkinson's: SVC with linear kernel (22 features)
const PARKINSONS_COEF = [
  -0.006436178569231288, -0.0023981122542977573, 0.0016487456304332682,
  -0.011791340920639852, -0.00010521768330263787, -0.0005593542334430635,
  -0.0031327252127602368, -0.0017104016438242394, 0.0859497554945976,
  0.7535659407722547, 0.04049152706608084, 0.05498900396156781,
  0.08063047190599008, 0.12139688570146921, -0.07654543234115692,
  0.037209333159367475, -0.9975325853540173, 0.47133993461573287,
  1.3368816123561222, 0.44958776630690656, 0.8365463379046978,
  0.02054647125390302
];
const PARKINSONS_INTERCEPT = 7.462176934170908;
const PARKINSONS_FEATURES = [
  "fo", "fhi", "flo", "Jitter_percent", "Jitter_Abs",
  "RAP", "PPQ", "DDP", "Shimmer", "Shimmer_dB",
  "APQ3", "APQ5", "APQ", "DDA", "NHR", "HNR",
  "RPDE", "DFA", "spread1", "spread2", "D2", "PPE"
];

function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

function predictLinearSVC(features: number[], coef: number[], intercept: number): number {
  const decision = dotProduct(coef, features) + intercept;
  return decision > 0 ? 1 : 0;
}

function predictLogisticRegression(features: number[], coef: number[], intercept: number): number {
  const decision = dotProduct(coef, features) + intercept;
  const probability = 1 / (1 + Math.exp(-decision));
  return probability >= 0.5 ? 1 : 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { diseaseType, parameters } = await req.json();

    if (!diseaseType || !parameters) {
      return new Response(
        JSON.stringify({ error: "diseaseType and parameters are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let prediction: number;
    let diseaseName: string;
    let positiveMessage: string;
    let negativeMessage: string;

    switch (diseaseType) {
      case "diabetes": {
        const features = DIABETES_FEATURES.map((f) => {
          const val = parameters[f];
          if (val === undefined || val === null || val === "") {
            throw new Error(`Missing parameter: ${f}`);
          }
          return parseFloat(val);
        });
        prediction = predictLinearSVC(features, DIABETES_COEF, DIABETES_INTERCEPT);
        diseaseName = "Diabetes";
        positiveMessage = "The assessment indicates signs consistent with diabetes. Please consult a healthcare professional for a thorough evaluation and proper management plan.";
        negativeMessage = "The assessment does not indicate signs of diabetes. Continue maintaining a healthy lifestyle with regular check-ups.";
        break;
      }

      case "heart": {
        const features = HEART_FEATURES.map((f) => {
          const val = parameters[f];
          if (val === undefined || val === null || val === "") {
            throw new Error(`Missing parameter: ${f}`);
          }
          return parseFloat(val);
        });
        prediction = predictLogisticRegression(features, HEART_COEF, HEART_INTERCEPT);
        diseaseName = "Heart Disease";
        positiveMessage = "The assessment indicates potential heart disease risk. Please seek immediate medical consultation for further evaluation, including ECG and cardiac imaging.";
        negativeMessage = "The assessment does not indicate heart disease. Maintain a heart-healthy diet, regular exercise, and routine cardiovascular check-ups.";
        break;
      }

      case "parkinsons": {
        const features = PARKINSONS_FEATURES.map((f) => {
          const val = parameters[f];
          if (val === undefined || val === null || val === "") {
            throw new Error(`Missing parameter: ${f}`);
          }
          return parseFloat(val);
        });
        prediction = predictLinearSVC(features, PARKINSONS_COEF, PARKINSONS_INTERCEPT);
        diseaseName = "Parkinson's Disease";
        positiveMessage = "The assessment indicates signs consistent with Parkinson's disease. Please consult a neurologist for a comprehensive evaluation and discuss management options.";
        negativeMessage = "The assessment does not indicate signs of Parkinson's disease. Continue monitoring for any changes and maintain a healthy, active lifestyle.";
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown disease type: ${diseaseType}. Supported: diabetes, heart, parkinsons` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const result = {
      diseaseType,
      diseaseName,
      prediction,
      isPositive: prediction === 1,
      message: prediction === 1 ? positiveMessage : negativeMessage,
      disclaimer: "This is an AI-based screening tool and not a substitute for professional medical diagnosis. Always consult a qualified healthcare provider.",
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("disease-predictor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
