const OPENFDA_API_URL = 'https://api.fda.gov/drug/label.json';
const OPENFDA_DRUG_NAMES_URL = 'https://api.fda.gov/drug/ndc.json';

const LOCAL_DRUG_DATABASE = [
  { name: 'Metformin', category: 'Antidiabetic', class: 'Biguanide' },
  { name: 'Metformin ER', category: 'Antidiabetic', class: 'Biguanide' },
  { name: 'Glipizide', category: 'Antidiabetic', class: 'Sulfonylurea' },
  { name: 'Glyburide', category: 'Antidiabetic', class: 'Sulfonylurea' },
  { name: 'Glimepiride', category: 'Antidiabetic', class: 'Sulfonylurea' },
  { name: 'Sitagliptin', category: 'Antidiabetic', class: 'DPP-4 Inhibitor' },
  { name: 'Empagliflozin', category: 'Antidiabetic', class: 'SGLT2 Inhibitor' },
  { name: 'Liraglutide', category: 'Antidiabetic', class: 'GLP-1 Agonist' },
  { name: 'Insulin Glargine', category: 'Antidiabetic', class: 'Insulin' },
  { name: 'Insulin Lispro', category: 'Antidiabetic', class: 'Insulin' },
  { name: 'Lisinopril', category: 'Antihypertensive', class: 'ACE Inhibitor' },
  { name: 'Enalapril', category: 'Antihypertensive', class: 'ACE Inhibitor' },
  { name: 'Ramipril', category: 'Antihypertensive', class: 'ACE Inhibitor' },
  { name: 'Amlodipine', category: 'Antihypertensive', class: 'Calcium Channel Blocker' },
  { name: 'Nifedipine', category: 'Antihypertensive', class: 'Calcium Channel Blocker' },
  { name: 'Losartan', category: 'Antihypertensive', class: 'ARB' },
  { name: 'Valsartan', category: 'Antihypertensive', class: 'ARB' },
  { name: 'Olmesartan', category: 'Antihypertensive', class: 'ARB' },
  { name: 'Metoprolol', category: 'Antihypertensive', class: 'Beta Blocker' },
  { name: 'Atenolol', category: 'Antihypertensive', class: 'Beta Blocker' },
  { name: 'Carvedilol', category: 'Antihypertensive', class: 'Beta Blocker' },
  { name: 'Bisoprolol', category: 'Antihypertensive', class: 'Beta Blocker' },
  { name: 'Hydrochlorothiazide', category: 'Antihypertensive', class: 'Thiazide Diuretic' },
  { name: 'Chlorthalidone', category: 'Antihypertensive', class: 'Thiazide Diuretic' },
  { name: 'Furosemide', category: 'Diuretic', class: 'Loop Diuretic' },
  { name: 'Spironolactone', category: 'Diuretic', class: 'Potassium-sparing Diuretic' },
  { name: 'Atorvastatin', category: 'Cholesterol', class: 'Statin' },
  { name: 'Simvastatin', category: 'Cholesterol', class: 'Statin' },
  { name: 'Rosuvastatin', category: 'Cholesterol', class: 'Statin' },
  { name: 'Pravastatin', category: 'Cholesterol', class: 'Statin' },
  { name: 'Ezetimibe', category: 'Cholesterol', class: 'Cholesterol Absorption Inhibitor' },
  { name: 'Omeprazole', category: 'Gastrointestinal', class: 'PPI' },
  { name: 'Pantoprazole', category: 'Gastrointestinal', class: 'PPI' },
  { name: 'Esomeprazole', category: 'Gastrointestinal', class: 'PPI' },
  { name: 'Lansoprazole', category: 'Gastrointestinal', class: 'PPI' },
  { name: 'Rabeprazole', category: 'Gastrointestinal', class: 'PPI' },
  { name: 'Ranitidine', category: 'Gastrointestinal', class: 'H2 Blocker' },
  { name: 'Famotidine', category: 'Gastrointestinal', class: 'H2 Blocker' },
  { name: 'Gabapentin', category: 'Neurological', class: 'Anticonvulsant' },
  { name: 'Pregabalin', category: 'Neurological', class: 'Anticonvulsant' },
  { name: 'Levetiracetam', category: 'Neurological', class: 'Anticonvulsant' },
  { name: 'Phenytoin', category: 'Neurological', class: 'Anticonvulsant' },
  { name: 'Carbamazepine', category: 'Neurological', class: 'Anticonvulsant' },
  { name: 'Sertraline', category: 'Antidepressant', class: 'SSRI' },
  { name: 'Fluoxetine', category: 'Antidepressant', class: 'SSRI' },
  { name: 'Escitalopram', category: 'Antidepressant', class: 'SSRI' },
  { name: 'Paroxetine', category: 'Antidepressant', class: 'SSRI' },
  { name: 'Citalopram', category: 'Antidepressant', class: 'SSRI' },
  { name: 'Venlafaxine', category: 'Antidepressant', class: 'SNRI' },
  { name: 'Duloxetine', category: 'Antidepressant', class: 'SNRI' },
  { name: 'Bupropion', category: 'Antidepressant', class: 'NDRI' },
  { name: 'Mirtazapine', category: 'Antidepressant', class: 'Tetracyclic' },
  { name: 'Trazodone', category: 'Antidepressant', class: 'SARI' },
  { name: 'Alprazolam', category: 'Anxiolytic', class: 'Benzodiazepine' },
  { name: 'Lorazepam', category: 'Anxiolytic', class: 'Benzodiazepine' },
  { name: 'Clonazepam', category: 'Anxiolytic', class: 'Benzodiazepine' },
  { name: 'Diazepam', category: 'Anxiolytic', class: 'Benzodiazepine' },
  { name: 'Buspirone', category: 'Anxiolytic', class: 'Azapirone' },
  { name: 'Zolpidem', category: 'Sedative', class: 'Z-drug' },
  { name: 'Eszopiclone', category: 'Sedative', class: 'Z-drug' },
  { name: 'Hydroxyzine', category: 'Sedative', class: 'Antihistamine' },
  { name: 'Warfarin', category: 'Anticoagulant', class: 'Vitamin K Antagonist' },
  { name: 'Rivaroxaban', category: 'Anticoagulant', class: 'Factor Xa Inhibitor' },
  { name: 'Apixaban', category: 'Anticoagulant', class: 'Factor Xa Inhibitor' },
  { name: 'Dabigatran', category: 'Anticoagulant', class: 'Direct Thrombin Inhibitor' },
  { name: 'Clopidogrel', category: 'Antiplatelet', class: 'P2Y12 Inhibitor' },
  { name: 'Aspirin', category: 'Antiplatelet', class: 'NSAID' },
  { name: 'Amoxicillin', category: 'Antibiotic', class: 'Penicillin' },
  { name: 'Azithromycin', category: 'Antibiotic', class: 'Macrolide' },
  { name: 'Ciprofloxacin', category: 'Antibiotic', class: 'Fluoroquinolone' },
  { name: 'Levofloxacin', category: 'Antibiotic', class: 'Fluoroquinolone' },
  { name: 'Doxycycline', category: 'Antibiotic', class: 'Tetracycline' },
  { name: 'Metronidazole', category: 'Antibiotic', class: 'Nitroimidazole' },
  { name: 'Cephalexin', category: 'Antibiotic', class: 'Cephalosporin' },
  { name: 'Prednisone', category: 'Corticosteroid', class: 'Glucocorticoid' },
  { name: 'Methylprednisolone', category: 'Corticosteroid', class: 'Glucocorticoid' },
  { name: 'Dexamethasone', category: 'Corticosteroid', class: 'Glucocorticoid' },
  { name: 'Hydrocortisone', category: 'Corticosteroid', class: 'Glucocorticoid' },
  { name: 'Montelukast', category: 'Respiratory', class: 'Leukotriene Inhibitor' },
  { name: 'Albuterol', category: 'Respiratory', class: 'Beta Agonist' },
  { name: 'Fluticasone', category: 'Respiratory', class: 'Inhaled Corticosteroid' },
  { name: 'Budesonide', category: 'Respiratory', class: 'Inhaled Corticosteroid' },
  { name: 'Tiotropium', category: 'Respiratory', class: 'Anticholinergic' },
  { name: 'Levothyroxine', category: 'Thyroid', class: 'Thyroid Hormone' },
  { name: 'Liothyronine', category: 'Thyroid', class: 'Thyroid Hormone' },
  { name: 'Allopurinol', category: 'Antigout', class: 'Xanthine Oxidase Inhibitor' },
  { name: 'Febuxostat', category: 'Antigout', class: 'Xanthine Oxidase Inhibitor' },
  { name: 'Colchicine', category: 'Antigout', class: 'Anti-inflammatory' },
  { name: 'Diclofenac', category: 'NSAID', class: 'NSAID' },
  { name: 'Ibuprofen', category: 'NSAID', class: 'NSAID' },
  { name: 'Naproxen', category: 'NSAID', class: 'NSAID' },
  { name: 'Meloxicam', category: 'NSAID', class: 'NSAID' },
  { name: 'Celecoxib', category: 'NSAID', class: 'COX-2 Inhibitor' },
  { name: 'Acetaminophen', category: 'Analgesic', class: 'Analgesic' },
  { name: 'Tramadol', category: 'Analgesic', class: 'Opioid' },
  { name: 'Oxycodone', category: 'Analgesic', class: 'Opioid' },
  { name: 'Cyclobenzaprine', category: 'Muscle Relaxant', class: 'Muscle Relaxant' },
  { name: 'Methocarbamol', category: 'Muscle Relaxant', class: 'Muscle Relaxant' },
  { name: 'Baclofen', category: 'Muscle Relaxant', class: 'GABA Agonist' },
  { name: 'Tizanidine', category: 'Muscle Relaxant', class: 'Alpha-2 Agonist' },
  { name: 'Tamsulosin', category: 'Urological', class: 'Alpha Blocker' },
  { name: 'Finasteride', category: 'Urological', class: '5-alpha Reductase Inhibitor' },
  { name: 'Dutasteride', category: 'Urological', class: '5-alpha Reductase Inhibitor' },
  { name: 'Sildenafil', category: 'Urological', class: 'PDE5 Inhibitor' },
  { name: 'Tadalafil', category: 'Urological', class: 'PDE5 Inhibitor' },
  { name: 'Amitriptyline', category: 'Antidepressant', class: 'Tricyclic' },
  { name: 'Nortriptyline', category: 'Antidepressant', class: 'Tricyclic' },
  { name: 'Quetiapine', category: 'Antipsychotic', class: 'Atypical Antipsychotic' },
  { name: 'Olanzapine', category: 'Antipsychotic', class: 'Atypical Antipsychotic' },
  { name: 'Risperidone', category: 'Antipsychotic', class: 'Atypical Antipsychotic' },
  { name: 'Digoxin', category: 'Cardiac', class: 'Cardiac Glycoside' },
  { name: 'Amiodarone', category: 'Cardiac', class: 'Antiarrhythmic' },
];

let cachedDrugs = [];
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export async function searchDrugs(query, limit = 20) {
  if (!query || query.length < 2) {
    return LOCAL_DRUG_DATABASE.slice(0, limit);
  }

  const queryLower = query.toLowerCase();

  const localMatches = LOCAL_DRUG_DATABASE.filter(
    (drug) =>
      drug.name.toLowerCase().includes(queryLower) ||
      drug.category.toLowerCase().includes(queryLower) ||
      drug.class.toLowerCase().includes(queryLower)
  ).slice(0, limit);

  if (localMatches.length >= 5) {
    return localMatches;
  }

  try {
    const apiResults = await fetchFromOpenFDA(query);
    const combinedResults = [...localMatches];

    apiResults.forEach((drug) => {
      if (!combinedResults.some((d) => d.name.toLowerCase() === drug.name.toLowerCase())) {
        combinedResults.push(drug);
      }
    });

    return combinedResults.slice(0, limit);
  } catch (error) {
    console.warn('OpenFDA API error, using local database:', error);
    return localMatches;
  }
}

async function fetchFromOpenFDA(query) {
  const now = Date.now();

  if (cachedDrugs.length > 0 && (now - lastFetch) < CACHE_DURATION) {
    const queryLower = query.toLowerCase();
    return cachedDrugs
      .filter((drug) =>
        drug.name.toLowerCase().includes(queryLower) ||
        drug.brandName?.toLowerCase().includes(queryLower)
      )
      .slice(0, 20);
  }

  try {
    const response = await fetch(
      `${OPENFDA_DRUG_NAMES_URL}?search=brand_name:${query}*&limit=50&skip=0`
    );

    if (!response.ok) {
      throw new Error(`OpenFDA API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const drugs = data.results
        .filter((item) => item.brand_name && item.generic_name)
        .map((item) => ({
          name: item.brand_name?.[0] || item.generic_name?.[0] || '',
          genericName: item.generic_name?.[0] || '',
          category: categorizeDrug(item),
          class: item.product_type?.[0] || 'Unknown',
          dosage: 'See prescription',
        }))
        .filter((drug) => drug.name && drug.name.length > 0);

      cachedDrugs = drugs;
      lastFetch = now;

      return drugs;
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch from OpenFDA:', error);
    return [];
  }
}

function categorizeDrug(item) {
  const indications = item.indications_and_usage?.[0] || '';
  const pharmacologic = item.pharmacologic_class?.[0] || '';

  if (indications.includes('diabetes') || pharmacologic.includes('Biguanide')) {
    return 'Antidiabetic';
  }
  if (indications.includes('hypertens') || pharmacologic.includes('ACE') || pharmacologic.includes('Calcium Channel')) {
    return 'Antihypertensive';
  }
  if (indications.includes('cholesterol') || pharmacologic.includes('Statin')) {
    return 'Cholesterol';
  }
  if (indications.includes('depress') || pharmacologic.includes('SSRI') || pharmacologic.includes('SNRI')) {
    return 'Antidepressant';
  }
  if (indications.includes('anxiety') || pharmacologic.includes('Benzodiazepine')) {
    return 'Anxiolytic';
  }
  if (indications.includes('pain') || pharmacologic.includes('Opioid')) {
    return 'Analgesic';
  }
  if (indications.includes('bacterial') || pharmacologic.includes('Antibiotic')) {
    return 'Antibiotic';
  }

  return item.product_type?.[0] || 'Medication';
}

export async function getDrugInfo(drugName) {
  const localDrug = LOCAL_DRUG_DATABASE.find(
    (d) => d.name.toLowerCase() === drugName.toLowerCase()
  );

  if (localDrug) {
    return {
      ...localDrug,
      dosage: localDrug.dosage || 'Varies',
      source: 'local',
    };
  }

  try {
    const response = await fetch(
      `${OPENFDA_DRUG_NAMES_URL}?search=brand_name:${drugName}&limit=1`
    );

    if (!response.ok) {
      throw new Error('Drug not found');
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const item = data.results[0];
      return {
        name: item.brand_name?.[0] || drugName,
        genericName: item.generic_name?.[0] || '',
        category: categorizeDrug(item),
        class: item.pharmacologic_class?.[0] || 'Unknown',
        dosage: 'See prescription',
        source: 'api',
      };
    }
  } catch (error) {
    console.warn('Drug info fetch failed, using basic info:', error);
  }

  return {
    name: drugName,
    category: 'Unknown',
    class: 'Unknown',
    dosage: 'See prescription',
    source: 'unknown',
  };
}

export function getLocalDrugDatabase() {
  return [...LOCAL_DRUG_DATABASE];
}

export function getDrugByName(name) {
  return LOCAL_DRUG_DATABASE.find(
    (d) => d.name.toLowerCase() === name.toLowerCase()
  );
}
