export interface DiseaseRecommendation {
  disease: string;
  image?: string;
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

export const medicineDatabase: DiseaseRecommendation[] = [
  {
    disease: "Diabetes",
    image: "https://images.unsplash.com/photo-1542385151-efd920078730?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Metformin", dosage: "500-1000mg", frequency: "2-3 times daily", notes: "First-line treatment" },
      { name: "Glibenclamide", dosage: "2.5-5mg", frequency: "Once daily", notes: "Stimulates insulin" }
    ],
    ayurvedic: [
      { name: "Neem", dosage: "1-2 leaves", frequency: "Morning & evening", notes: "Purifies blood" },
      { name: "Bitter Gourd juice", dosage: "1 cup", frequency: "Daily", notes: "Natural insulin" }
    ],
    exercises: [
      { name: "Brisk Walking", duration: "30-45 mins", frequency: "Daily", benefits: "Improves insulin sensitivity" }
    ],
    homeRemedies: [
      { name: "Cinnamon Water", ingredients: "Cinnamon, Water", preparation: "Boil & drink", benefits: "Lower sugar" }
    ]
  },
  {
    disease: "Heart Disease",
    image: "https://images.unsplash.com/photo-1576091160550-217359971f8b?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Aspirin", dosage: "75mg", frequency: "Once daily", notes: "Thin blood" }
    ],
    ayurvedic: [
      { name: "Arjuna Bark", dosage: "3g", frequency: "Twice daily", notes: "Heart tonic" }
    ],
    exercises: [
      { name: "Swimming", duration: "30 mins", frequency: "3 times/week", benefits: "Cardiovascular health" }
    ],
    homeRemedies: [
      { name: "Garlic", ingredients: "1 clove", preparation: "Eat raw", benefits: "Chloresterol control" }
    ]
  },
  {
    disease: "Hypertension",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Amlodipine", dosage: "5mg", frequency: "Daily", notes: "Lower blood pressure" }
    ],
    ayurvedic: [
      { name: "Brahmi", dosage: "1g", frequency: "Daily", notes: "Mind relaxant" }
    ],
    exercises: [
      { name: "Meditation", duration: "20 mins", frequency: "Daily", benefits: "Stress reduction" }
    ],
    homeRemedies: [
      { name: "Coconut Water", ingredients: "1 coconut", preparation: "Drink fresh", benefits: "Electrolyte balance" }
    ]
  },
  {
    disease: "Migraine",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Sumatriptan", dosage: "50mg", frequency: "As needed", notes: "Relief for severe migraine" }
    ],
    ayurvedic: [
      { name: "Nasya Oil", dosage: "2 drops", frequency: "Morning", notes: "Clears head" }
    ],
    exercises: [
      { name: "Neck Stretches", duration: "10 mins", frequency: "Daily", benefits: "Reduces tension" }
    ],
    homeRemedies: [
      { name: "Ginger Tea", ingredients: "Ginger, Water", preparation: "Brew", benefits: "Nausea relief" }
    ]
  },
  {
    disease: "Acne",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Benzoyl Peroxide", dosage: "2.5%", frequency: "Twice daily", notes: "Kills bacteria" }
    ],
    ayurvedic: [
      { name: "Turmeric Paste", dosage: "Apply topically", frequency: "Once daily", notes: "Antibacterial" }
    ],
    exercises: [
      { name: "Yoga (Forehead to floor)", duration: "5 mins", frequency: "Daily", benefits: "Increases blood flow" }
    ],
    homeRemedies: [
      { name: "Honey & Cinnamon mask", ingredients: "Honey, Cinnamon", preparation: "Mix & apply", benefits: "Reduces redness" }
    ]
  },
  {
    disease: "Asthma",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Salbutamol Inhaler", dosage: "100mcg", frequency: "As needed", notes: "Rescue inhaler" }
    ],
    ayurvedic: [
      { name: "Vasa (Adhatoda)", dosage: "1 tsp", frequency: "Twice daily", notes: "Bronchodilator" }
    ],
    exercises: [
      { name: "Deep Breathing", duration: "15 mins", frequency: "Daily", benefits: "Lung capacity" }
    ],
    homeRemedies: [
      { name: "Strong Coffee", ingredients: "Coffee beans", preparation: "Brew", benefits: "Temporary aid" }
    ]
  },
  {
    disease: "Insomnia",
    image: "https://images.unsplash.com/photo-1511295744344-097c36713447?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Melatonin", dosage: "3mg", frequency: "30 mins before bed", notes: "Sleep hormone" }
    ],
    ayurvedic: [
      { name: "Ashwagandha", dosage: "500mg", frequency: "Night", notes: "Calms nerves" }
    ],
    exercises: [
      { name: "Evening Walk", duration: "20 mins", frequency: "Daily", benefits: "Better sleep cycle" }
    ],
    homeRemedies: [
      { name: "Chamomile Tea", ingredients: "Flower heads", preparation: "Steep", benefits: "Relaxation" }
    ]
  },
  {
    disease: "Pneumonia",
    image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Amoxicillin", dosage: "500mg", frequency: "3 times daily", notes: "Antibiotic" }
    ],
    ayurvedic: [
      { name: "Tulsi Juice", dosage: "10ml", frequency: "Twice daily", notes: "Immunity boost" }
    ],
    exercises: [
      { name: "Chest Expansions", duration: "5 mins", frequency: "As tolerated", benefits: "Clears fluid" }
    ],
    homeRemedies: [
      { name: "Steam Inhalation", ingredients: "Hot water, Eucalyptus oil", preparation: "Inhale", benefits: "Loosens mucus" }
    ]
  },
  {
    disease: "Flu (Influenza)",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Oseltamivir", dosage: "75mg", frequency: "Twice daily", notes: "Antiviral" }
    ],
    ayurvedic: [
      { name: "Giloy Ghanvati", dosage: "1 tablet", frequency: "Daily", notes: "Fever relief" }
    ],
    exercises: [
      { name: "Total Rest", duration: "1 week", frequency: "Always", benefits: "Fast recovery" }
    ],
    homeRemedies: [
      { name: "Ginger & Honey", ingredients: "Ginger juice, Honey", preparation: "Mix", benefits: "Anti-cough" }
    ]
  },
  {
    disease: "Gastritis",
    image: "https://images.unsplash.com/photo-1571019623452-8d9afcbed55c?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Omeprazole", dosage: "20mg", frequency: "Before breakfast", notes: "Acid reducer" }
    ],
    ayurvedic: [
      { name: "Avipattikar Churna", dosage: "3g", frequency: "Night", notes: "Laxative" }
    ],
    exercises: [
      { name: "Vajrasana", duration: "10 mins", frequency: "Post-meal", benefits: "Digestion" }
    ],
    homeRemedies: [
      { name: "Cold Milk", ingredients: "Milk", preparation: "Drink cold", benefits: "Neutralizes acid" }
    ]
  },
  {
    disease: "Back Pain",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Ibuprofen", dosage: "400mg", frequency: "Post-meal", notes: "Reduces inflammation" }
    ],
    ayurvedic: [
      { name: "Mahanarayan Oil", dosage: "Apply topically", frequency: "Twice daily", notes: "Muscle relaxant" }
    ],
    exercises: [
      { name: "Cat-Cow Stretch", duration: "5 mins", frequency: "Morning", benefits: "Spinal flexibility" }
    ],
    homeRemedies: [
      { name: "Ginger Tea", ingredients: "Ginger", preparation: "Boil with water", benefits: "Pain relief" }
    ]
  },
  {
    disease: "Anxiety",
    image: "https://images.unsplash.com/photo-1499209974431-9dac306fbc9b?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Escitalopram", dosage: "10mg", frequency: "Morning", notes: "Selective serotonin reuptake inhibitor" }
    ],
    ayurvedic: [
      { name: "Brahmi Vati", dosage: "1 tab", frequency: "Twice daily", notes: "Calms the mind" }
    ],
    exercises: [
      { name: "Pranayama", duration: "15 mins", frequency: "Daily", benefits: "Slows heart rate" }
    ],
    homeRemedies: [
      { name: "Chamomile Tea", ingredients: "Flowers", preparation: "Infuse", benefits: "Natural sedative" }
    ]
  },
  {
    disease: "Allergies (Hay Fever)",
    image: "https://images.unsplash.com/photo-1582213726852-2b1034032d18?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Cetirizine", dosage: "10mg", frequency: "Once daily", notes: "Non-drowsy antihistamine" }
    ],
    ayurvedic: [
      { name: "Haridra Khanda", dosage: "1 tsp", frequency: "Twice daily", notes: "Anti-allergic tonic" }
    ],
    exercises: [
      { name: "Nadi Shodhana", duration: "10 mins", frequency: "Morning", benefits: "Clears nasal passages" }
    ],
    homeRemedies: [
      { name: "Local Honey", ingredients: "Honey", preparation: "Eat raw", benefits: "Gradual desensitization" }
    ]
  },
  {
    disease: "Dandruff",
    image: "https://images.unsplash.com/photo-1549480112-9c16260a9539?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Ketoconazole Shampoo", dosage: "Use on scalp", frequency: "Twice weekly", notes: "Anti-fungal treatment" }
    ],
    ayurvedic: [
      { name: "Neem Oil", dosage: "Apply to scalp", frequency: "Weekly", notes: "Inhibits fungal growth" }
    ],
    exercises: [
      { name: "Scalp Massage", duration: "5 mins", frequency: "Daily", benefits: "Better circulation" }
    ],
    homeRemedies: [
      { name: "Apple Cider Vinegar", ingredients: "ACV, Water", preparation: "1:1 dilution rinse", benefits: "Balances pH" }
    ]
  },
  {
    disease: "Sore Throat",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Strepsils Lozenges", dosage: "1 lozenge", frequency: "As needed", notes: "Soothes irritation" }
    ],
    ayurvedic: [
      { name: "Khadiradi Vati", dosage: "1 tablet", frequency: "3 times daily", notes: "Clears throat" }
    ],
    exercises: [
      { name: "Vocal Rest", duration: "Until better", frequency: "Always", benefits: "Reduces strain" }
    ],
    homeRemedies: [
      { name: "Saltwater Gargle", ingredients: "Salt, Water", preparation: "Dissolve and gargle", benefits: "Kills bacteria" }
    ]
  },
  {
    disease: "Hair Loss",
    image: "https://images.unsplash.com/photo-1499696010180-025ef6e1a8f9?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Minoxidil Solution", dosage: "2% or 5%", frequency: "Twice daily", notes: "Promotes hair growth" }
    ],
    ayurvedic: [
      { name: "Bhringraj Oil", dosage: "Apply to scalp", frequency: "Weekly", notes: "Strengthens follicles" }
    ],
    exercises: [
      { name: "Balyam (Nail Rubbing)", duration: "10 mins", frequency: "Daily", benefits: "Stimulates follicles" }
    ],
    homeRemedies: [
      { name: "Onion Juice", ingredients: "Onion", preparation: "Extract juice", benefits: "Sulfur-rich boost" }
    ]
  },
  {
    disease: "Obesity",
    image: "https://images.unsplash.com/photo-1520037803738-9524ba361952?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Orlistat", dosage: "120mg", frequency: "With meals", notes: "Blocks fat absorption" }
    ],
    ayurvedic: [
      { name: "Triphala Churna", dosage: "1 tsp", frequency: "Bedtime", notes: "Metabolism booster" }
    ],
    exercises: [
      { name: "HIIT", duration: "30 mins", frequency: "3 days/week", benefits: "Maximum fat burn" }
    ],
    homeRemedies: [
      { name: "Lemon & Honey water", ingredients: "Lemon, Honey, Water", preparation: "Mix in warm water", benefits: "Aids weight loss" }
    ]
  },
  {
    disease: "Hypothyroidism",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Levothyroxine", dosage: "25-100mcg", frequency: "Empty stomach", notes: "Hormone replacement" }
    ],
    ayurvedic: [
      { name: "Kanchanar Guggulu", dosage: "1 tab", frequency: "Twice daily", notes: "Thyroid glandular support" }
    ],
    exercises: [
      { name: "Sarvangasana (Shoulder stand)", duration: "2 mins", frequency: "Daily", benefits: "Stimulates thyroid" }
    ],
    homeRemedies: [
      { name: "Coconut Oil", ingredients: "MCTs", preparation: "1-2 tsp daily", benefits: "Metabolic support" }
    ]
  },
  {
    disease: "Kidney Stones",
    image: "https://images.unsplash.com/photo-1504439468489-c8920d796a29?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Tamsulosin", dosage: "0.4mg", frequency: "Daily", notes: "Relaxes ureter" }
    ],
    ayurvedic: [
      { name: "Cystone", dosage: "2 tabs", frequency: "Twice daily", notes: "Disolves small stones" }
    ],
    exercises: [
      { name: "Cardio", duration: "30 mins", frequency: "Daily", benefits: "Dislodges small stones" }
    ],
    homeRemedies: [
      { name: "Barley Water", ingredients: "Barley, Water", preparation: "Boil and drink", benefits: "Natural diuretic" }
    ]
  },
  {
    disease: "Constipation",
    image: "https://images.unsplash.com/photo-1471193945509-9ad0617af9f4?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Dulcolax", dosage: "5mg", frequency: "Night", notes: "Stimulant laxative" }
    ],
    ayurvedic: [
      { name: "Triphala Churna", dosage: "1 tsp", frequency: "Night", notes: "Gentle bowel cleanser" }
    ],
    exercises: [
      { name: "Yogic Squats", duration: "5 mins", frequency: "Morning", benefits: "Promotes peristalsis" }
    ],
    homeRemedies: [
      { name: "Prune Juice", ingredients: "Prunes", preparation: "Drink 1 glass", benefits: "Natural fiber and sorbitol" }
    ]
  },
  {
    disease: "Eczema",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Hydrocortisone Cream", dosage: "Apply topically", frequency: "Twice daily", notes: "Reduces inflammation and itching" }
    ],
    ayurvedic: [
      { name: "Coconut & Neem oil", dosage: "Apply topically", frequency: "Daily", notes: "Soothes and heals skin" }
    ],
    exercises: [
      { name: "Stress Management", duration: "Daily", frequency: "Always", benefits: "Reduces flare-ups" }
    ],
    homeRemedies: [
      { name: "Oatmeal Bath", ingredients: "Colloidal oatmeal", preparation: "Soak in bath", benefits: "Calms irritated skin" }
    ]
  },
  {
    disease: "Anemia",
    image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Ferrous Sulfate", dosage: "325mg", frequency: "Once daily", notes: "Iron supplement" }
    ],
    ayurvedic: [
      { name: "Lohasava", dosage: "2 tsp", frequency: "Twice daily", notes: "Natural iron restorative" }
    ],
    exercises: [
      { name: "Light Yoga", duration: "15 mins", frequency: "Daily", benefits: "Improves circulation" }
    ],
    homeRemedies: [
      { name: "Beetroot Juice", ingredients: "Beetroot, Carrot", preparation: "Extract juice", benefits: "Rich in iron and folic acid" }
    ]
  },
  {
    disease: "Piles (Haemorrhoids)",
    image: "https://images.unsplash.com/photo-1511295744344-097c36713447?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Anusol Ointment", dosage: "Apply topically", frequency: "As needed", notes: "Reduces swelling" }
    ],
    ayurvedic: [
      { name: "Arshakalpa Vati", dosage: "1 tab", frequency: "Twice daily", notes: "Traditional piles relief" }
    ],
    exercises: [
      { name: "Kegel Exercises", duration: "5 mins", frequency: "Daily", benefits: "Strengthens pelvic floor" }
    ],
    homeRemedies: [
      { name: "Sitz Bath", ingredients: "Warm water", preparation: "Soak for 15 mins", benefits: "Eases pain and swelling" }
    ]
  },
  {
    disease: "Stomach Ulcer",
    image: "https://images.unsplash.com/photo-1571019623452-8d9afcbed55c?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Pantoprazole", dosage: "40mg", frequency: "Before food", notes: "Proton pump inhibitor" }
    ],
    ayurvedic: [
      { name: "Shatavari", dosage: "500mg", frequency: "Twice daily", notes: "Soothes stomach lining" }
    ],
    exercises: [
      { name: "Pranayama (Sheetali)", duration: "5 mins", frequency: "Daily", benefits: "Cooling effect on stomach" }
    ],
    homeRemedies: [
      { name: "Cabbage Juice", ingredients: "Fresh cabbage", preparation: "Extract juice", benefits: "Known for healing ulcers" }
    ]
  },
  {
    disease: "Varicose Veins",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Horse Chestnut Extract", dosage: "300mg", frequency: "Twice daily", notes: "Improves vein elasticity" }
    ],
    ayurvedic: [
      { name: "Kaishore Guggulu", dosage: "1 tab", frequency: "Twice daily", notes: "Purifies blood and veins" }
    ],
    exercises: [
      { name: "Leg Elevations", duration: "15 mins", frequency: "Daily", benefits: "Promotes venous return" }
    ],
    homeRemedies: [
      { name: "Witch Hazel", ingredients: "Extract", preparation: "Apply as compress", benefits: "Astringent properties" }
    ]
  },
  {
    disease: "Menstrual Cramps",
    image: "https://images.unsplash.com/photo-1499209974431-9dac306fbc9b?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Mefenamic Acid", dosage: "500mg", frequency: "As needed", notes: "Relieves uterine cramps" }
    ],
    ayurvedic: [
      { name: "Rajapravartini Vati", dosage: "1 tab", frequency: "Twice daily", notes: "Regulates flow and pain" }
    ],
    exercises: [
      { name: "Child's Pose", duration: "10 mins", frequency: "During period", benefits: "Relaxes abdominal muscles" }
    ],
    homeRemedies: [
      { name: "Hot Water Bag", ingredients: "Warm water", preparation: "Apply to lower abdomen", benefits: "Increases blood flow" }
    ]
  },
  {
    disease: "Dengue",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Paracetamol", dosage: "650mg", frequency: "As needed", notes: "For fever; Avoid Aspirin/Ibuprofen" }
    ],
    ayurvedic: [
      { name: "Papaya Leaf Juice", dosage: "20ml", frequency: "Twice daily", notes: "Boosts platelet count" }
    ],
    exercises: [
      { name: "Complete Rest", duration: "Until recovery", frequency: "Always", benefits: "Prevents shock" }
    ],
    homeRemedies: [
      { name: "Giloy Water", ingredients: "Giloy stem", preparation: "Boil and drink", benefits: "Immunity and fever control" }
    ]
  },
  {
    disease: "Thyroid (Goitre)",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=800",
    allopathic: [
      { name: "Iodine Supplements", dosage: "As prescribed", frequency: "Daily", notes: "If due to iodine deficiency" }
    ],
    ayurvedic: [
      { name: "Kanchanar Guggulu", dosage: "2 tabs", frequency: "Twice daily", notes: "Resolves glandular swelling" }
    ],
    exercises: [
      { name: "Neck Rotations", duration: "5 mins", frequency: "Daily", benefits: "Improves circulation to thyroid" }
    ],
    homeRemedies: [
      { name: "Walnuts", ingredients: "Fresh walnuts", preparation: "Eat 2-3 daily", benefits: "Rich in selenium and omega-3" }
    ]
  }
];

