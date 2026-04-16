// Medicine database with information about common medicines
export interface MedicineInfo {
  name: string;
  aliases?: string[];
  conditions?: string[];
  uses?: string[];
  commonDosages?: string[];
  frequency?: string;
  sideEffects?: string[];
  warnings?: string[];
  foodInteractions?: string;
  alcoholInteraction?: string;
  // Extended fields from CSV
  genericName?: string;
  category?: string;
  therapeuticIndication?: string;
  dosageForms?: string[];
  mrp?: string;
  prescriptionRequired?: boolean;
  manufacturer?: string;
  countryOfOrigin?: string;
  introduction?: string;
  howItWorks?: string;
  directionsForUse?: string;
  precautions?: string[];
  interactions?: string[];
  storage?: string;
  faqs?: string[];
}

// Global medicine database - will be loaded from CSV
let medicineDatabase: { [key: string]: MedicineInfo } = {};
let databaseLoaded = false;

// Initialize fallback database
const fallbackDatabase: { [key: string]: MedicineInfo } = {
  // Cardiovascular
  aspirin: {
    name: "Aspirin",
    aliases: ["ASA", "acetylsalicylic acid"],
    conditions: ["Heart disease", "Stroke prevention", "Clotting disorders"],
    uses: ["Anti-inflammatory", "Pain relief", "Blood thinner", "Heart protection"],
    commonDosages: ["75mg", "81mg", "100mg", "325mg", "500mg"],
    frequency: "Once daily (for heart conditions)",
    sideEffects: ["Stomach upset", "Heartburn", "Bleeding risk"],
    warnings: ["Can cause bleeding", "Not for severe asthma", "Avoid during pregnancy"],
    foodInteractions: "Take with food to reduce stomach upset",
    alcoholInteraction: "Avoid alcohol - increases GI bleeding risk"
  },
  lisinopril: {
    name: "Lisinopril",
    aliases: ["Zestril", "Prinivil", "ACE inhibitor"],
    conditions: ["High blood pressure", "Heart failure", "Post-MI recovery"],
    uses: ["Blood pressure control", "Heart protection", "Reduces strain on heart"],
    commonDosages: ["2.5mg", "5mg", "10mg", "20mg"],
    frequency: "Once daily",
    sideEffects: ["Dry cough", "Dizziness", "Fatigue", "Hyperkalemia"],
    warnings: ["Monitor kidney function", "Can cause persistent cough", "Not for pregnant women"],
    foodInteractions: "Can be taken with or without food",
    alcoholInteraction: "Limit alcohol - increases dizziness"
  },
  metformin: {
    name: "Metformin",
    aliases: ["Glucophage", "biguanide"],
    conditions: ["Type 2 diabetes", "Prediabetes", "PCOS"],
    uses: ["Blood sugar control", "Insulin sensitivity improvement", "Weight management aid"],
    commonDosages: ["500mg", "850mg", "1000mg"],
    frequency: "Once or twice daily (with meals)",
    sideEffects: ["Stomach upset", "Diarrhea", "Loss of appetite", "Metallic taste"],
    warnings: ["Monitor kidney function", "Risk of lactic acidosis", "Hold before surgery"],
    foodInteractions: "Take with meals to reduce GI upset",
    alcoholInteraction: "Avoid alcohol - increases lactic acidosis risk"
  },
  atorvastatin: {
    name: "Atorvastatin",
    aliases: ["Lipitor", "statin"],
    conditions: ["High cholesterol", "Heart disease", "Stroke prevention"],
    uses: ["Cholesterol reduction", "Heart protection", "Prevents artery blockage"],
    commonDosages: ["10mg", "20mg", "40mg", "80mg"],
    frequency: "Once daily",
    sideEffects: ["Muscle pain", "Liver enzyme elevation", "Memory issues"],
    warnings: ["Monitor liver function", "Muscle pain needs evaluation", "Avoid with grapefruit"],
    foodInteractions: "Can be taken with or without food",
    alcoholInteraction: "Limit alcohol - increases liver damage risk"
  },
  amlodipine: {
    name: "Amlodipine",
    aliases: ["Norvasc", "calcium channel blocker"],
    conditions: ["High blood pressure", "Angina", "Heart disease"],
    uses: ["Blood vessel relaxation", "Blood pressure reduction", "Heart workload reduction"],
    commonDosages: ["2.5mg", "5mg", "10mg"],
    frequency: "Once daily",
    sideEffects: ["Ankles swelling", "Headache", "Dizziness", "Flushing"],
    warnings: ["Not for severe aortic stenosis", "Monitor for edema"],
    foodInteractions: "Can be taken with or without food",
    alcoholInteraction: "Avoid alcohol - increases dizziness"
  },
  // Diabetes
  glipizide: {
    name: "Glipizide",
    aliases: ["Glucotrol", "sulfonylurea"],
    conditions: ["Type 2 diabetes"],
    uses: ["Stimulates insulin release", "Blood sugar reduction"],
    commonDosages: ["5mg", "10mg"],
    frequency: "Once or twice daily before meals",
    sideEffects: ["Hypoglycemia", "Weight gain", "Skin reactions"],
    warnings: ["Risk of low blood sugar", "Not for Type 1 diabetes"],
    foodInteractions: "Take 30 minutes before meals",
    alcoholInteraction: "Avoid alcohol - can cause severe hypoglycemia"
  },
  // Respiratory
  salbutamol: {
    name: "Salbutamol (Albuterol)",
    aliases: ["Ventolin", "SABA", "beta-2 agonist"],
    conditions: ["Asthma", "COPD", "Bronchospasm"],
    uses: ["Quick relief of breathing difficulty", "Bronchial dilation", "Wheezing relief"],
    commonDosages: ["100mcg", "200mcg (inhaler)"],
    frequency: "As needed, every 4-6 hours",
    sideEffects: ["Tremor", "Headache", "Palpitations", "Anxiety"],
    warnings: ["Overuse indicates need for control therapy", "Monitor heart rate"],
    foodInteractions: "No significant interactions",
    alcoholInteraction: "No major interactions"
  },
  // Antibiotics
  amoxicillin: {
    name: "Amoxicillin",
    aliases: ["Amoxil", "penicillin"],
    conditions: ["Bacterial infections", "Ear infection", "UTI", "Strep throat"],
    uses: ["Kills bacteria", "Treats infections"],
    commonDosages: ["250mg", "500mg", "875mg"],
    frequency: "Every 8 hours (3 times daily) or every 12 hours",
    sideEffects: ["Rash", "Nausea", "Diarrhea", "Allergic reactions"],
    warnings: ["Severe allergy risk in sensitive patients", "Complete full course"],
    foodInteractions: "Can be taken with or without food",
    alcoholInteraction: "No significant interaction"
  },
  azithromycin: {
    name: "Azithromycin",
    aliases: ["Zithromax", "Z-pack", "macrolide"],
    conditions: ["Bacterial infections", "Respiratory infections"],
    uses: ["Antibiotic", "Bacterial infection treatment"],
    commonDosages: ["250mg", "500mg"],
    frequency: "Once daily for 5 days (or as prescribed)",
    sideEffects: ["Nausea", "Abdominal pain", "Diarrhea"],
    warnings: ["QT prolongation risk", "Liver disease precaution"],
    foodInteractions: "Take 1 hour before or 2 hours after meals",
    alcoholInteraction: "No major interaction"
  },
  // Pain Relief
  ibuprofen: {
    name: "Ibuprofen",
    aliases: ["Advil", "Motrin", "NSAID"],
    conditions: ["Pain", "Fever", "Inflammation", "Arthritis"],
    uses: ["Pain relief", "Reduces inflammation", "Fever reduction"],
    commonDosages: ["200mg", "400mg", "600mg", "800mg"],
    frequency: "Every 4-6 hours as needed",
    sideEffects: ["Stomach upset", "Heartburn", "Dizziness"],
    warnings: ["GI bleeding risk", "Kidney disease precaution", "Heart disease precaution"],
    foodInteractions: "Take with food to reduce stomach upset",
    alcoholInteraction: "Avoid - increases GI bleeding risk"
  },
  paracetamol: {
    name: "Paracetamol (Acetaminophen)",
    aliases: ["Tylenol", "APAP"],
    conditions: ["Pain", "Fever"],
    uses: ["Pain relief", "Fever reduction"],
    commonDosages: ["250mg", "500mg", "650mg", "1000mg"],
    frequency: "Every 4-6 hours, max 3000-4000mg daily",
    sideEffects: ["Rare with normal use", "Liver damage at overdose"],
    warnings: ["Do not exceed maximum daily dose", "Liver disease precaution"],
    foodInteractions: "Can be taken with or without food",
    alcoholInteraction: "Limit alcohol - increases liver damage risk"
  },
  // Thyroid
  levothyroxine: {
    name: "Levothyroxine",
    aliases: ["Synthroid", "Levoxyl", "thyroid hormone"],
    conditions: ["Hypothyroidism", "Thyroid cancer"],
    uses: ["Replaces thyroid hormone", "Increases metabolism"],
    commonDosages: ["25mcg", "50mcg", "75mcg", "100mcg", "150mcg"],
    frequency: "Once daily in morning",
    sideEffects: ["Tremor", "Anxiety", "Weight loss", "Palpitations"],
    warnings: ["Requires TSH monitoring", "Avoid taking with iron/calcium"],
    foodInteractions: "Take 30-60 minutes before breakfast",
    alcoholInteraction: "No significant interaction"
  },
  // Gastrointestinal
  omeprazole: {
    name: "Omeprazole",
    aliases: ["Prilosec", "PPI", "proton pump inhibitor"],
    conditions: ["Acid reflux", "GERD", "Ulcers"],
    uses: ["Reduces stomach acid", "Prevents acid damage"],
    commonDosages: ["20mg", "40mg"],
    frequency: "Once daily before breakfast",
    sideEffects: ["Headache", "Abdominal pain", "Diarrhea or constipation"],
    warnings: ["Long-term use may affect B12 absorption", "Increased fracture risk"],
    foodInteractions: "Take before breakfast",
    alcoholInteraction: "Avoid alcohol - increases stomach irritation"
  },
  metoclopramide: {
    name: "Metoclopramide",
    aliases: ["Reglan", "anti-emetic"],
    conditions: ["Nausea", "Vomiting", "GERD"],
    uses: ["Prevents vomiting", "Speeds stomach emptying"],
    commonDosages: ["5mg", "10mg"],
    frequency: "3-4 times daily",
    sideEffects: ["Drowsiness", "Restlessness", "Tardive dyskinesia (long-term)"],
    warnings: ["Not for more than 12 weeks", "Tardive dyskinesia risk"],
    foodInteractions: "Take 30 minutes before meals",
    alcoholInteraction: "Avoid - increases drowsiness"
  },
  // Additional medicines from real prescriptions
  itayprus: {
    name: "Itayprus",
    aliases: ["Cap. Itayprus", "capsule itayprus"],
    conditions: ["Piles/Hemorrhoids", "Anal fissures", "Varicose veins"],
    uses: ["Strengthens blood vessel walls", "Reduces venous congestion", "Anti-inflammatory"],
    commonDosages: ["200mg", "300mg"],
    frequency: "Once or twice daily",
    sideEffects: ["Mild GI upset", "Headache", "Dizziness"],
    warnings: ["Use as directed by doctor", "Consult if symptoms persist"],
    foodInteractions: "Can be taken with or without food",
    alcoholInteraction: "No significant interaction"
  },
  epigest: {
    name: "Epigest Cream",
    aliases: ["Epigest", "cream"],
    conditions: ["Dry skin", "Eczema", "Dermatitis", "Skin irritation"],
    uses: ["Moisturizes skin", "Anti-inflammatory", "Reduces itching"],
    commonDosages: ["Topical"],
    frequency: "Once or twice daily as needed",
    sideEffects: ["Rare - mild irritation if sensitive"],
    warnings: ["For external use only", "Avoid contact with eyes", "Discontinue if rash develops"],
    foodInteractions: "Topical application - no food interaction",
    alcoholInteraction: "No interaction"
  },
  langefor: {
    name: "Langefor Cream",
    aliases: ["Langefor", "cream"],
    conditions: ["Dry skin", "Psoriasis", "Itchy skin", "Skin conditions"],
    uses: ["Deep moisturization", "Anti-inflammatory", "Skin healing"],
    commonDosages: ["Topical"],
    frequency: "Once or twice daily (usually at night)",
    sideEffects: ["Rare - local irritation"],
    warnings: ["For external use only", "Avoid eyes and mucous membranes", "Not for open wounds"],
    foodInteractions: "Topical application - no food interaction",
    alcoholInteraction: "No interaction"
  },
  niazoclin: {
    name: "Niazoclin Soap",
    aliases: ["Niazoclin", "soap", "ketoconazole soap"],
    conditions: ["Fungal infections", "Seborrheic dermatitis", "Dandruff"],
    uses: ["Antifungal action", "Cleanses affected skin", "Prevents recurrence"],
    commonDosages: ["Topical - external use only"],
    frequency: "Use during daily bath/shower as directed",
    sideEffects: ["Rare - mild skin irritation"],
    warnings: ["For external use only", "Avoid eyes", "Not for internal use"],
    foodInteractions: "Topical - no food interaction",
    alcoholInteraction: "No interaction"
  },
  lyft: {
    name: "Lyft/Inspectect",
    aliases: ["Tab. Lyft", "Inspectect", "levocetirizine"],
    conditions: ["Allergies", "Hay fever", "Urticaria", "Allergic rhinitis"],
    uses: ["Antihistamine", "Reduces allergy symptoms", "Anti-itch"],
    commonDosages: ["5mg"],
    frequency: "Once daily at night",
    sideEffects: ["Drowsiness", "Dry mouth", "Headache"],
    warnings: ["May cause drowsiness", "Avoid driving if drowsy", "Not for children under 6"],
    foodInteractions: "Can be taken with or without food",
    alcoholInteraction: "Avoid alcohol - increases drowsiness"
  },
};

// Function to parse CSV medicine data
export const parseCSVMedicines = (csvText: string): { [key: string]: MedicineInfo } => {
  const medicines: { [key: string]: MedicineInfo } = {};
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) return medicines;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    try {
      // Parse CSV line - be careful with quoted fields
      const fields = parseCSVLine(line);
      
      if (fields.length < 10) {
        i++;
        continue;
      }

      const medicine: MedicineInfo = {
        category: fields[0]?.trim() || '',
        name: fields[1]?.trim() || '',
        genericName: fields[2]?.trim() || '',
        therapeuticIndication: fields[3]?.trim() || '',
        dosageForms: fields[4] ? fields[4].split(';').map(f => f.trim()) : [],
        mrp: fields[5]?.trim() || '',
        prescriptionRequired: fields[6]?.toLowerCase().includes('rx required') || false,
        manufacturer: fields[7]?.trim() || '',
        countryOfOrigin: fields[8]?.trim() || '',
        introduction: fields[9]?.trim() || '',
        uses: [],
        conditions: [],
        sideEffects: [],
        warnings: [],
        precautions: [],
        interactions: [],
        commonDosages: fields[4] ? fields[4].split(';').map(f => f.trim()) : [],
        frequency: 'As prescribed',
        foodInteractions: 'Refer to medicine instructions',
        alcoholInteraction: 'Consult pharmacist',
        aliases: [fields[2]?.trim() || ''].filter(a => a), // Generic name as alias
      };

      if (medicine.name) {
        const key = medicine.name.toLowerCase();
        medicines[key] = medicine;
      }
    } catch (error) {
      console.error('Error parsing medicine line:', error);
    }
    
    i++;
  }

  return medicines;
};

// Helper function to parse CSV line respecting quoted fields
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
};

// Function to load medicine database from CSV
export const loadMedicinesFromCSV = async (): Promise<{ [key: string]: MedicineInfo }> => {
  try {
    const response = await fetch('/medicines.csv');
    if (!response.ok) {
      console.warn('Medicine CSV not found, using fallback database');
      return fallbackDatabase;
    }

    const csvText = await response.text();
    const parsedMedicines = parseCSVMedicines(csvText);
    
    if (Object.keys(parsedMedicines).length > 0) {
      medicineDatabase = parsedMedicines;
      databaseLoaded = true;
      console.log(`Loaded ${Object.keys(parsedMedicines).length} medicines from CSV`);
      return parsedMedicines;
    } else {
      console.warn('No medicines parsed from CSV, using fallback database');
      medicineDatabase = fallbackDatabase;
      return fallbackDatabase;
    }
  } catch (error) {
    console.error('Error loading medicines CSV:', error);
    medicineDatabase = fallbackDatabase;
    return fallbackDatabase;
  }
};

// Initialize database on module load
loadMedicinesFromCSV().catch(console.error);

// Function to ensure database is loaded
export const ensureDatabaseLoaded = async (): Promise<void> => {
  if (!databaseLoaded) {
    await loadMedicinesFromCSV();
  }
};

// Function to search for medicine information
export const getMedicineInfo = (medicineName: string): MedicineInfo | null => {
  const normalizedName = medicineName.toLowerCase().trim();
  
  // First check direct match in current database
  if (medicineDatabase[normalizedName]) {
    return medicineDatabase[normalizedName];
  }

  // Search by name or aliases
  for (const [key, medicine] of Object.entries(medicineDatabase)) {
    if (key.toLowerCase() === normalizedName || 
        medicine.name.toLowerCase() === normalizedName ||
        (medicine.aliases && medicine.aliases.some(alias => alias?.toLowerCase() === normalizedName)) ||
        (medicine.genericName && medicine.genericName.toLowerCase() === normalizedName)) {
      return medicine;
    }
  }
  
  // Search by partial name match
  for (const [key, medicine] of Object.entries(medicineDatabase)) {
    if (key.includes(normalizedName) || medicine.name.toLowerCase().includes(normalizedName)) {
      return medicine;
    }
  }
  
  return null;
};

// Async version to ensure database is loaded first
export const getMedicineInfoAsync = async (medicineName: string): Promise<MedicineInfo | null> => {
  await ensureDatabaseLoaded();
  return getMedicineInfo(medicineName);
};

// Function to get all medicines
export const getAllMedicines = (): MedicineInfo[] => {
  return Object.values(medicineDatabase);
};

// Function to search medicines with filters
export const searchMedicines = (query: string, filters?: { category?: string; prescription?: boolean }): MedicineInfo[] => {
  const normalizedQuery = query.toLowerCase();
  let results = Object.values(medicineDatabase).filter(medicine => 
    medicine.name.toLowerCase().includes(normalizedQuery) ||
    (medicine.genericName && medicine.genericName.toLowerCase().includes(normalizedQuery)) ||
    (medicine.category && medicine.category.toLowerCase().includes(normalizedQuery)) ||
    (medicine.aliases && medicine.aliases.some(alias => alias?.toLowerCase().includes(normalizedQuery)))
  );

  if (filters?.category) {
    results = results.filter(m => m.category?.toLowerCase() === filters.category?.toLowerCase());
  }

  if (filters?.prescription !== undefined) {
    results = results.filter(m => m.prescriptionRequired === filters.prescription);
  }

  return results;
};

// Function to extract dosage from prescription text
export const extractDosageInfo = (medicineText: string): {
  medicineName: string;
  dosage: string;
  frequency: string;
  instructions: string;
} | null => {
  const dosagePattern = /^(.+?)\s+(\d+(?:\.\d+)?(?:mg|g|ml|mcg|%|IU|units)?)\s*(?:[-–]\s*(.+))?$/i;
  const match = medicineText.match(dosagePattern);
  
  if (match) {
    return {
      medicineName: match[1].trim(),
      dosage: match[2].trim(),
      frequency: match[3] ? match[3].trim() : "As prescribed",
      instructions: medicineText
    };
  }
  
  return null;
};
