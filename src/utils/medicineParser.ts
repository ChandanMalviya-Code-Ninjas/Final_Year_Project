interface MedicineData {
  name: string;
  genericName: string;
  category: string;
  therapeuticIndication: string;
  dosageForms: string[];
  mrp: string;
  prescriptionRequired: boolean;
  manufacturer: string;
  countryOfOrigin: string;
  introduction: string;
  uses: string[];
  howItWorks: string;
  directionsForUse: string;
  sideEffects: string[];
  warnings: string[];
  precautions: string[];
  interactions: string[];
  storage: string;
  faqs: string[];
}

export const parseMedicinesCSV = (csvText: string): MedicineData[] => {
  const medicines: MedicineData[] = [];
  const lines = csvText.split('\n').slice(1); // Skip header

  let currentMedicine: Partial<MedicineData> | null = null;
  let currentSection = '';

  for (const line of lines) {
    if (!line.trim()) continue;

    // Check if this is a new medicine entry (starts with category)
    if (line.includes('Acne') || line.includes('ADHD') || line.match(/^[A-Z][a-zA-Z\s]+,\s*https/)) {
      // Save previous medicine if exists
      if (currentMedicine && currentMedicine.name) {
        medicines.push(currentMedicine as MedicineData);
      }

      // Start new medicine
      currentMedicine = {};
      currentSection = 'header';

      // Parse header line
      const headerMatch = line.match(/^([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*(.+)$/);
      if (headerMatch) {
        currentMedicine.category = headerMatch[1].trim();
        currentMedicine.name = headerMatch[2].trim();
        currentMedicine.genericName = headerMatch[3].trim();
        currentMedicine.therapeuticIndication = headerMatch[4].trim();
        currentMedicine.dosageForms = headerMatch[5].split(',').map(f => f.trim());
        currentMedicine.mrp = headerMatch[6].trim();
        currentMedicine.prescriptionRequired = headerMatch[7].includes('Rx required');
        currentMedicine.manufacturer = headerMatch[8].trim();
        currentMedicine.countryOfOrigin = headerMatch[9].trim();
        currentMedicine.introduction = headerMatch[10].trim();
      }
    } else if (currentMedicine) {
      // Parse content based on section
      if (line.startsWith('USES OF') || line.startsWith('USE OF')) {
        currentSection = 'uses';
        currentMedicine.uses = [];
      } else if (line.startsWith('HOW') && line.includes('WORK')) {
        currentSection = 'howItWorks';
        currentMedicine.howItWorks = '';
      } else if (line.startsWith('DIRECTIONS FOR USE')) {
        currentSection = 'directions';
        currentMedicine.directionsForUse = '';
      } else if (line.startsWith('SIDE EFFECTS OF')) {
        currentSection = 'sideEffects';
        currentMedicine.sideEffects = [];
      } else if (line.startsWith('WARNING') || line.startsWith('PRECAUTIONS')) {
        currentSection = 'warnings';
        currentMedicine.warnings = [];
        currentMedicine.precautions = [];
      } else if (line.startsWith('INTERACTIONS')) {
        currentSection = 'interactions';
        currentMedicine.interactions = [];
      } else if (line.startsWith('MORE INFORMATION')) {
        currentSection = 'storage';
        currentMedicine.storage = '';
      } else if (line.startsWith('FAQS')) {
        currentSection = 'faqs';
        currentMedicine.faqs = [];
      } else {
        // Add content to current section
        switch (currentSection) {
          case 'uses':
            if (line.trim() && !line.includes('USES OF') && currentMedicine.uses) {
              currentMedicine.uses.push(line.trim());
            }
            break;
          case 'howItWorks':
            if (currentMedicine.howItWorks !== undefined) {
              currentMedicine.howItWorks += line.trim() + ' ';
            }
            break;
          case 'directions':
            if (currentMedicine.directionsForUse !== undefined) {
              currentMedicine.directionsForUse += line.trim() + ' ';
            }
            break;
          case 'sideEffects':
            if (line.trim() && !line.includes('SIDE EFFECTS') && currentMedicine.sideEffects) {
              currentMedicine.sideEffects.push(line.trim());
            }
            break;
          case 'warnings':
            if (line.trim() && !line.includes('WARNING') && currentMedicine.warnings) {
              currentMedicine.warnings.push(line.trim());
            }
            break;
          case 'interactions':
            if (line.trim() && !line.includes('INTERACTIONS') && currentMedicine.interactions) {
              currentMedicine.interactions.push(line.trim());
            }
            break;
          case 'storage':
            if (currentMedicine.storage !== undefined) {
              currentMedicine.storage += line.trim() + ' ';
            }
            break;
          case 'faqs':
            if (line.trim() && !line.includes('FAQS') && currentMedicine.faqs) {
              currentMedicine.faqs.push(line.trim());
            }
            break;
        }
      }
    }
  }

  // Add the last medicine
  if (currentMedicine && currentMedicine.name) {
    medicines.push(currentMedicine as MedicineData);
  }

  return medicines;
};

export const searchMedicines = (medicines: MedicineData[], query: string): MedicineData[] => {
  const lowercaseQuery = query.toLowerCase();
  return medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(lowercaseQuery) ||
    medicine.genericName.toLowerCase().includes(lowercaseQuery) ||
    medicine.category.toLowerCase().includes(lowercaseQuery) ||
    medicine.therapeuticIndication.toLowerCase().includes(lowercaseQuery) ||
    medicine.uses.some(use => use.toLowerCase().includes(lowercaseQuery))
  );
};

export const getMedicineStats = (medicines: MedicineData[]) => {
  const categories = new Map<string, number>();
  const manufacturers = new Map<string, number>();
  const prescriptionRequired = medicines.filter(m => m.prescriptionRequired).length;

  medicines.forEach(medicine => {
    // Count categories
    categories.set(medicine.category, (categories.get(medicine.category) || 0) + 1);

    // Count manufacturers
    manufacturers.set(medicine.manufacturer, (manufacturers.get(medicine.manufacturer) || 0) + 1);
  });

  return {
    totalMedicines: medicines.length,
    categories: Array.from(categories.entries()).sort((a, b) => b[1] - a[1]),
    manufacturers: Array.from(manufacturers.entries()).sort((a, b) => b[1] - a[1]),
    prescriptionRequired,
    overTheCounter: medicines.length - prescriptionRequired
  };
};