const RXNORM_API = 'https://rxnav.nlm.nih.gov/REST';
const OPENFDA_DRUG_NAMES_URL = 'https://api.fda.gov/drug/ndc.json';
const OPENFDA_API_KEY = process.env.OPENFDA_API_KEY;

let cachedDrugs = [];
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000;

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

async function fetchFromOpenFDA(query) {
  const now = Date.now();

  if (cachedDrugs.length > 0 && (now - lastFetch) < CACHE_DURATION) {
    const queryLower = query.toLowerCase();
    return cachedDrugs
      .filter((drug) =>
        drug.name.toLowerCase().includes(queryLower) ||
        drug.brandName?.toLowerCase().includes(queryLower) ||
        drug.genericName?.toLowerCase().includes(queryLower)
      )
      .slice(0, 20);
  }

  try {
    const response = await fetch(
      `${OPENFDA_DRUG_NAMES_URL}?search=brand_name:${encodeURIComponent(query)}*+OR+generic_name:${encodeURIComponent(query)}*&limit=50&api_key=${OPENFDA_API_KEY}`
    );

    if (!response.ok) {
      return [];
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
  } catch {
    return [];
  }
}

function convertToINR(usdPrice) {
  if (!usdPrice) return null;
  const usdMatch = usdPrice.match(/\$(\d+)(?:-(\d+))?/);
  if (!usdMatch) return usdPrice;
  
  const minUsd = parseInt(usdMatch[1]);
  const maxUsd = usdMatch[2] ? parseInt(usdMatch[2]) : minUsd;
  const rate = 83;
  const minInr = Math.round(minUsd * rate);
  const maxInr = Math.round(maxUsd * rate);
  return `₹${minInr}-${maxInr}/month`;
}

const LOCAL_DRUG_DATABASE = [
  { name: 'Metformin', category: 'Antidiabetic', class: 'Biguanide', genericCost: '$5-15/month', brandCost: '$100-200/month' },
  { name: 'Metformin ER', category: 'Antidiabetic', class: 'Biguanide', genericCost: '$10-20/month', brandCost: '$150-250/month' },
  { name: 'Glipizide', category: 'Antidiabetic', class: 'Sulfonylurea', genericCost: '$5-10/month', brandCost: '$50-100/month' },
  { name: 'Glyburide', category: 'Antidiabetic', class: 'Sulfonylurea', genericCost: '$5-15/month', brandCost: '$60-120/month' },
  { name: 'Glimepiride', category: 'Antidiabetic', class: 'Sulfonylurea', genericCost: '$5-10/month', brandCost: '$80-150/month' },
  { name: 'Sitagliptin', category: 'Antidiabetic', class: 'DPP-4 Inhibitor', genericCost: '$50-100/month', brandCost: '$400-500/month' },
  { name: 'Empagliflozin', category: 'Antidiabetic', class: 'SGLT2 Inhibitor', genericCost: '$80-150/month', brandCost: '$500-600/month' },
  { name: 'Liraglutide', category: 'Antidiabetic', class: 'GLP-1 Agonist', genericCost: '$300-500/month', brandCost: '$800-1000/month' },
  { name: 'Lisinopril', category: 'Antihypertensive', class: 'ACE Inhibitor', genericCost: '$5-15/month', brandCost: '$50-100/month' },
  { name: 'Enalapril', category: 'Antihypertensive', class: 'ACE Inhibitor', genericCost: '$5-15/month', brandCost: '$50-80/month' },
  { name: 'Ramipril', category: 'Antihypertensive', class: 'ACE Inhibitor', genericCost: '$5-15/month', brandCost: '$60-100/month' },
  { name: 'Amlodipine', category: 'Antihypertensive', class: 'Calcium Channel Blocker', genericCost: '$5-15/month', brandCost: '$50-150/month' },
  { name: 'Nifedipine', category: 'Antihypertensive', class: 'Calcium Channel Blocker', genericCost: '$10-20/month', brandCost: '$80-150/month' },
  { name: 'Diltiazem', category: 'Antihypertensive', class: 'Calcium Channel Blocker', genericCost: '$10-30/month', brandCost: '$100-200/month' },
  { name: 'Verapamil', category: 'Antihypertensive', class: 'Calcium Channel Blocker', genericCost: '$10-25/month', brandCost: '$80-150/month' },
  { name: 'Losartan', category: 'Antihypertensive', class: 'ARB', genericCost: '$5-15/month', brandCost: '$80-150/month' },
  { name: 'Valsartan', category: 'Antihypertensive', class: 'ARB', genericCost: '$10-30/month', brandCost: '$100-200/month' },
  { name: 'Olmesartan', category: 'Antihypertensive', class: 'ARB', genericCost: '$20-40/month', brandCost: '$100-180/month' },
  { name: 'Metoprolol', category: 'Antihypertensive', class: 'Beta Blocker', genericCost: '$5-15/month', brandCost: '$50-100/month' },
  { name: 'Atenolol', category: 'Antihypertensive', class: 'Beta Blocker', genericCost: '$5-10/month', brandCost: '$30-60/month' },
  { name: 'Carvedilol', category: 'Antihypertensive', class: 'Beta Blocker', genericCost: '$10-25/month', brandCost: '$80-150/month' },
  { name: 'Bisoprolol', category: 'Antihypertensive', class: 'Beta Blocker', genericCost: '$10-20/month', brandCost: '$60-100/month' },
  { name: 'Hydrochlorothiazide', category: 'Antihypertensive', class: 'Thiazide Diuretic', genericCost: '$5-10/month', brandCost: '$20-50/month' },
  { name: 'Chlorthalidone', category: 'Antihypertensive', class: 'Thiazide Diuretic', genericCost: '$5-15/month', brandCost: '$30-60/month' },
  { name: 'Furosemide', category: 'Diuretic', class: 'Loop Diuretic', genericCost: '$5-15/month', brandCost: '$30-60/month' },
  { name: 'Spironolactone', category: 'Diuretic', class: 'Potassium-sparing Diuretic', genericCost: '$10-25/month', brandCost: '$80-150/month' },
  { name: 'Atorvastatin', category: 'Cholesterol', class: 'Statin', genericCost: '$5-15/month', brandCost: '$100-200/month' },
  { name: 'Simvastatin', category: 'Cholesterol', class: 'Statin', genericCost: '$5-15/month', brandCost: '$100-200/month' },
  { name: 'Rosuvastatin', category: 'Cholesterol', class: 'Statin', genericCost: '$20-50/month', brandCost: '$200-300/month' },
  { name: 'Pravastatin', category: 'Cholesterol', class: 'Statin', genericCost: '$10-30/month', brandCost: '$80-150/month' },
  { name: 'Ezetimibe', category: 'Cholesterol', class: 'Cholesterol Absorption Inhibitor', genericCost: '$30-60/month', brandCost: '$200-300/month' },
  { name: 'Omeprazole', category: 'Gastrointestinal', class: 'PPI', genericCost: '$5-15/month', brandCost: '$100-200/month' },
  { name: 'Pantoprazole', category: 'Gastrointestinal', class: 'PPI', genericCost: '$10-25/month', brandCost: '$100-200/month' },
  { name: 'Esomeprazole', category: 'Gastrointestinal', class: 'PPI', genericCost: '$30-60/month', brandCost: '$200-300/month' },
  { name: 'Lansoprazole', category: 'Gastrointestinal', class: 'PPI', genericCost: '$10-25/month', brandCost: '$100-200/month' },
  { name: 'Rabeprazole', category: 'Gastrointestinal', class: 'PPI', genericCost: '$30-50/month', brandCost: '$150-250/month' },
  { name: 'Ranitidine', category: 'Gastrointestinal', class: 'H2 Blocker', genericCost: '$5-15/month', brandCost: '$30-60/month' },
  { name: 'Famotidine', category: 'Gastrointestinal', class: 'H2 Blocker', genericCost: '$5-15/month', brandCost: '$50-100/month' },
  { name: 'Gabapentin', category: 'Neurological', class: 'Anticonvulsant', genericCost: '$10-30/month', brandCost: '$200-400/month' },
  { name: 'Pregabalin', category: 'Neurological', class: 'Anticonvulsant', genericCost: '$20-50/month', brandCost: '$300-400/month' },
  { name: 'Levetiracetam', category: 'Neurological', class: 'Anticonvulsant', genericCost: '$15-40/month', brandCost: '$200-400/month' },
  { name: 'Phenytoin', category: 'Neurological', class: 'Anticonvulsant', genericCost: '$10-25/month', brandCost: '$50-100/month' },
  { name: 'Carbamazepine', category: 'Neurological', class: 'Anticonvulsant', genericCost: '$10-25/month', brandCost: '$80-150/month' },
  { name: 'Sertraline', category: 'Antidepressant', class: 'SSRI', genericCost: '$5-15/month', brandCost: '$80-150/month' },
  { name: 'Fluoxetine', category: 'Antidepressant', class: 'SSRI', genericCost: '$5-10/month', brandCost: '$80-150/month' },
  { name: 'Escitalopram', category: 'Antidepressant', class: 'SSRI', genericCost: '$5-15/month', brandCost: '$100-200/month' },
  { name: 'Paroxetine', category: 'Antidepressant', class: 'SSRI', genericCost: '$5-15/month', brandCost: '$80-150/month' },
  { name: 'Citalopram', category: 'Antidepressant', class: 'SSRI', genericCost: '$5-15/month', brandCost: '$80-150/month' },
  { name: 'Venlafaxine', category: 'Antidepressant', class: 'SNRI', genericCost: '$10-25/month', brandCost: '$100-200/month' },
  { name: 'Duloxetine', category: 'Antidepressant', class: 'SNRI', genericCost: '$10-25/month', brandCost: '$100-200/month' },
  { name: 'Bupropion', category: 'Antidepressant', class: 'NDRI', genericCost: '$20-50/month', brandCost: '$150-300/month' },
  { name: 'Mirtazapine', category: 'Antidepressant', class: 'Tetracyclic', genericCost: '$10-25/month', brandCost: '$100-200/month' },
  { name: 'Trazodone', category: 'Antidepressant', class: 'SARI', genericCost: '$5-15/month', brandCost: '$50-100/month' },
  { name: 'Alprazolam', category: 'Anxiolytic', class: 'Benzodiazepine', genericCost: '$5-15/month', brandCost: '$50-100/month' },
  { name: 'Lorazepam', category: 'Anxiolytic', class: 'Benzodiazepine', genericCost: '$5-15/month', brandCost: '$50-100/month' },
  { name: 'Clonazepam', category: 'Anxiolytic', class: 'Benzodiazepine', genericCost: '$5-15/month', brandCost: '$50-100/month' },
  { name: 'Diazepam', category: 'Anxiolytic', class: 'Benzodiazepine', genericCost: '$5-15/month', brandCost: '$30-60/month' },
  { name: 'Buspirone', category: 'Anxiolytic', class: 'Azapirone', genericCost: '$20-50/month', brandCost: '$100-200/month' },
  { name: 'Zolpidem', category: 'Sedative', class: 'Z-drug', genericCost: '$10-25/month', brandCost: '$100-200/month' },
  { name: 'Eszopiclone', category: 'Sedative', class: 'Z-drug', genericCost: '$30-60/month', brandCost: '$150-250/month' },
  { name: 'Hydroxyzine', category: 'Sedative', class: 'Antihistamine', genericCost: '$5-15/month', brandCost: '$30-60/month' },
  { name: 'Warfarin', category: 'Anticoagulant', class: 'Vitamin K Antagonist', genericCost: '$10-25/month', brandCost: '$50-100/month' },
  { name: 'Rivaroxaban', category: 'Anticoagulant', class: 'Factor Xa Inhibitor', genericCost: '$100-200/month', brandCost: '$350-450/month' },
  { name: 'Apixaban', category: 'Anticoagulant', class: 'Factor Xa Inhibitor', genericCost: '$100-200/month', brandCost: '$350-450/month' },
  { name: 'Dabigatran', category: 'Anticoagulant', class: 'Direct Thrombin Inhibitor', genericCost: '$100-200/month', brandCost: '$300-400/month' },
  { name: 'Clopidogrel', category: 'Antiplatelet', class: 'P2Y12 Inhibitor', genericCost: '$10-25/month', brandCost: '$100-200/month' },
  { name: 'Aspirin', category: 'Antiplatelet', class: 'NSAID', genericCost: '$5-10/month', brandCost: '$20-40/month' },
  { name: 'Amoxicillin', category: 'Antibiotic', class: 'Penicillin', genericCost: '$5-15/month', brandCost: '$30-60/month' },
  { name: 'Azithromycin', category: 'Antibiotic', class: 'Macrolide', genericCost: '$10-25/month', brandCost: '$80-150/month' },
  { name: 'Clarithromycin', category: 'Antibiotic', class: 'Macrolide', genericCost: '$10-25/month', brandCost: '$80-150/month' },
  { name: 'Ciprofloxacin', category: 'Antibiotic', class: 'Fluoroquinolone', genericCost: '$10-25/month', brandCost: '$50-100/month' },
  { name: 'Levofloxacin', category: 'Antibiotic', class: 'Fluoroquinolone', genericCost: '$20-40/month', brandCost: '$100-200/month' },
  { name: 'Doxycycline', category: 'Antibiotic', class: 'Tetracycline', genericCost: '$10-25/month', brandCost: '$50-100/month' },
  { name: 'Metronidazole', category: 'Antibiotic', class: 'Nitroimidazole', genericCost: '$5-15/month', brandCost: '$50-100/month' },
  { name: 'Cephalexin', category: 'Antibiotic', class: 'Cephalosporin', genericCost: '$10-20/month', brandCost: '$50-100/month' },
  { name: 'Fluconazole', category: 'Antifungal', class: 'Azole', genericCost: '$10-25/month', brandCost: '$50-100/month' },
  { name: 'Itraconazole', category: 'Antifungal', class: 'Azole', genericCost: '$30-60/month', brandCost: '$100-200/month' },
  { name: 'Ketoconazole', category: 'Antifungal', class: 'Azole', genericCost: '$10-25/month', brandCost: '$50-100/month' },
  { name: 'Prednisone', category: 'Corticosteroid', class: 'Glucocorticoid', genericCost: '$5-15/month', brandCost: '$30-60/month' },
  { name: 'Methylprednisolone', category: 'Corticosteroid', class: 'Glucocorticoid', genericCost: '$10-25/month', brandCost: '$50-100/month' },
  { name: 'Dexamethasone', category: 'Corticosteroid', class: 'Glucocorticoid', genericCost: '$5-15/month', brandCost: '$20-50/month' },
  { name: 'Hydrocortisone', category: 'Corticosteroid', class: 'Glucocorticoid', genericCost: '$5-15/month', brandCost: '$20-50/month' },
  { name: 'Montelukast', category: 'Respiratory', class: 'Leukotriene Inhibitor', genericCost: '$20-40/month', brandCost: '$100-200/month' },
  { name: 'Albuterol', category: 'Respiratory', class: 'Beta Agonist', genericCost: '$20-50/month', brandCost: '$50-100/month' },
  { name: 'Fluticasone', category: 'Respiratory', class: 'Inhaled Corticosteroid', genericCost: '$30-60/month', brandCost: '$100-200/month' },
  { name: 'Budesonide', category: 'Respiratory', class: 'Inhaled Corticosteroid', genericCost: '$30-60/month', brandCost: '$100-200/month' },
  { name: 'Tiotropium', category: 'Respiratory', class: 'Anticholinergic', genericCost: '$80-150/month', brandCost: '$200-350/month' },
  { name: 'Levothyroxine', category: 'Thyroid', class: 'Thyroid Hormone', genericCost: '$5-15/month', brandCost: '$30-60/month' },
  { name: 'Liothyronine', category: 'Thyroid', class: 'Thyroid Hormone', genericCost: '$20-50/month', brandCost: '$100-200/month' },
  { name: 'Allopurinol', category: 'Antigout', class: 'Xanthine Oxidase Inhibitor', genericCost: '$5-15/month', brandCost: '$30-60/month' },
  { name: 'Febuxostat', category: 'Antigout', class: 'Xanthine Oxidase Inhibitor', genericCost: '$30-60/month', brandCost: '$100-200/month' },
  { name: 'Colchicine', category: 'Antigout', class: 'Anti-inflammatory', genericCost: '$10-30/month', brandCost: '$100-200/month' },
  { name: 'Diclofenac', category: 'NSAID', class: 'NSAID', genericCost: '$10-25/month', brandCost: '$50-100/month' },
  { name: 'Ibuprofen', category: 'NSAID', class: 'NSAID', genericCost: '$5-15/month', brandCost: '$20-40/month' },
  { name: 'Naproxen', category: 'NSAID', class: 'NSAID', genericCost: '$5-15/month', brandCost: '$30-60/month' },
  { name: 'Meloxicam', category: 'NSAID', class: 'NSAID', genericCost: '$10-25/month', brandCost: '$50-100/month' },
  { name: 'Celecoxib', category: 'NSAID', class: 'COX-2 Inhibitor', genericCost: '$30-60/month', brandCost: '$100-200/month' },
  { name: 'Acetaminophen', category: 'Analgesic', class: 'Analgesic', genericCost: '$5-15/month', brandCost: '$20-50/month' },
  { name: 'Tramadol', category: 'Analgesic', class: 'Opioid', genericCost: '$15-40/month', brandCost: '$80-150/month' },
  { name: 'Oxycodone', category: 'Analgesic', class: 'Opioid', genericCost: '$30-80/month', brandCost: '$150-300/month' },
  { name: 'Morphine', category: 'Analgesic', class: 'Opioid', genericCost: '$20-50/month', brandCost: '$100-200/month' },
  { name: 'Hydrocodone', category: 'Analgesic', class: 'Opioid', genericCost: '$20-50/month', brandCost: '$100-200/month' },
  { name: 'Codeine', category: 'Analgesic', class: 'Opioid', genericCost: '$5-15/month', brandCost: '$30-60/month' },
  { name: 'Cyclobenzaprine', category: 'Muscle Relaxant', class: 'Muscle Relaxant', genericCost: '$5-15/month', brandCost: '$30-60/month' },
  { name: 'Methocarbamol', category: 'Muscle Relaxant', class: 'Muscle Relaxant', genericCost: '$10-25/month', brandCost: '$50-100/month' },
  { name: 'Baclofen', category: 'Muscle Relaxant', class: 'GABA Agonist', genericCost: '$10-25/month', brandCost: '$80-150/month' },
  { name: 'Tizanidine', category: 'Muscle Relaxant', class: 'Alpha-2 Agonist', genericCost: '$15-35/month', brandCost: '$80-150/month' },
  { name: 'Carisoprodol', category: 'Muscle Relaxant', class: 'Muscle Relaxant', genericCost: '$10-25/month', brandCost: '$50-100/month' },
  { name: 'Tamsulosin', category: 'Urological', class: 'Alpha Blocker', genericCost: '$10-25/month', brandCost: '$80-150/month' },
  { name: 'Finasteride', category: 'Urological', class: '5-alpha Reductase Inhibitor', genericCost: '$20-50/month', brandCost: '$100-200/month' },
  { name: 'Dutasteride', category: 'Urological', class: '5-alpha Reductase Inhibitor', genericCost: '$30-60/month', brandCost: '$100-200/month' },
  { name: 'Sildenafil', category: 'Urological', class: 'PDE5 Inhibitor', genericCost: '$50-100/month', brandCost: '$400-600/month' },
  { name: 'Tadalafil', category: 'Urological', class: 'PDE5 Inhibitor', genericCost: '$50-100/month', brandCost: '$400-600/month' },
  { name: 'Amitriptyline', category: 'Antidepressant', class: 'Tricyclic', genericCost: '$5-15/month', brandCost: '$30-60/month' },
  { name: 'Nortriptyline', category: 'Antidepressant', class: 'Tricyclic', genericCost: '$10-25/month', brandCost: '$50-100/month' },
  { name: 'Quetiapine', category: 'Antipsychotic', class: 'Atypical Antipsychotic', genericCost: '$10-30/month', brandCost: '$100-200/month' },
  { name: 'Olanzapine', category: 'Antipsychotic', class: 'Atypical Antipsychotic', genericCost: '$10-30/month', brandCost: '$100-200/month' },
  { name: 'Risperidone', category: 'Antipsychotic', class: 'Atypical Antipsychotic', genericCost: '$10-25/month', brandCost: '$100-200/month' },
  { name: 'Digoxin', category: 'Cardiac', class: 'Cardiac Glycoside', genericCost: '$10-25/month', brandCost: '$50-100/month' },
  { name: 'Amiodarone', category: 'Cardiac', class: 'Antiarrhythmic', genericCost: '$20-50/month', brandCost: '$100-200/month' },
  { name: 'Lithium', category: 'Mood Stabilizer', class: 'Mood Stabilizer', genericCost: '$10-25/month', brandCost: '$50-100/month' },
  { name: 'Methotrexate', category: 'Immunosuppressant', class: 'DMARD', genericCost: '$20-50/month', brandCost: '$100-200/month' },
  { name: 'Insulin Glargine', category: 'Antidiabetic', class: 'Insulin', genericCost: '$100-200/month', brandCost: '$300-500/month' },
  { name: 'Insulin Lispro', category: 'Antidiabetic', class: 'Insulin', genericCost: '$100-200/month', brandCost: '$300-500/month' },
  { name: 'Insulin Aspart', category: 'Antidiabetic', class: 'Insulin', genericCost: '$100-200/month', brandCost: '$300-500/month' },
];

async function searchRxNorm(query) {
  try {
    const response = await fetch(
      `${RXNORM_API}/drugs.json?name=${encodeURIComponent(query)}&nameType=brand`
    );

    if (!response.ok) {
      throw new Error(`RxNorm API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.drugGroup?.conceptGroup) {
      const drugs = [];

      for (const group of data.drugGroup.conceptGroup) {
        if (group.conceptProperties) {
          for (const concept of group.conceptProperties) {
            drugs.push({
              name: concept.name,
              rxcui: concept.rxcui,
              category: 'RxNorm',
              class: concept.tty || 'Unknown',
              dosage: 'See prescription',
            });
          }
        }
      }

      return drugs.slice(0, 20);
    }

    return [];
  } catch (error) {
    console.warn('RxNorm search failed:', error);
    return [];
  }
}

export async function searchDrugs(req, res) {
  try {
    const { q, query, limit = 20 } = req.query;
    const searchTerm = q || query || '';

    if (!searchTerm || searchTerm.length < 2) {
      const drugsWithINR = LOCAL_DRUG_DATABASE.slice(0, limit).map(drug => ({
        ...drug,
        genericCost: convertToINR(drug.genericCost),
        brandCost: convertToINR(drug.brandCost)
      }));
      return res.json({
        success: true,
        drugs: drugsWithINR,
        source: 'local',
      });
    }

    const queryLower = searchTerm.toLowerCase();

    const localMatches = LOCAL_DRUG_DATABASE.filter(
      (drug) =>
        drug.name.toLowerCase().includes(queryLower) ||
        drug.category.toLowerCase().includes(queryLower) ||
        drug.class.toLowerCase().includes(queryLower)
    ).slice(0, limit).map(drug => ({
      ...drug,
      genericCost: convertToINR(drug.genericCost),
      brandCost: convertToINR(drug.brandCost)
    }));

    const apiMatches = await fetchFromOpenFDA(searchTerm);

    const combined = [...localMatches];
    const seenNames = new Set(localMatches.map(d => d.name.toLowerCase()));

    for (const drug of apiMatches) {
      if (!seenNames.has(drug.name.toLowerCase())) {
        combined.push(drug);
        seenNames.add(drug.name.toLowerCase());
      }
    }

    res.json({
      success: true,
      drugs: combined.slice(0, limit),
      source: combined.length > localMatches.length ? 'openfda+local' : 'local',
    });
  } catch (error) {
    console.error('Drug search error:', error);
    const drugsWithINR = LOCAL_DRUG_DATABASE.slice(0, 20).map(drug => ({
      ...drug,
      genericCost: convertToINR(drug.genericCost),
      brandCost: convertToINR(drug.brandCost)
    }));
    res.status(500).json({
      success: false,
      error: 'Search failed',
      drugs: drugsWithINR,
      source: 'local-fallback',
    });
  }
}

export function getDrugsByClass(drugClass) {
  return LOCAL_DRUG_DATABASE.filter(
    drug => drug.class.toLowerCase() === drugClass.toLowerCase()
  );
}

export function getDrugByName(drugName) {
  const nameLower = drugName.toLowerCase();
  return LOCAL_DRUG_DATABASE.find(
    drug => drug.name.toLowerCase() === nameLower
  );
}

export function getAlternativesForInteraction(drug1Name, drug2Name, severity) {
  const drug1 = getDrugByName(drug1Name);
  const drug2 = getDrugByName(drug2Name);
  
  const alternatives = {
    drug1Alternatives: [],
    drug2Alternatives: []
  };

  if (drug1) {
    const sameClassDrugs = getDrugsByClass(drug1.class);
    alternatives.drug1Alternatives = sameClassDrugs
      .filter(d => d.name.toLowerCase() !== drug1Name.toLowerCase())
      .map(d => ({
        name: d.name,
        class: d.class,
        reason: `Alternative ${drug1.class} that may not interact with ${drug2Name}`,
        genericCost: convertToINR(d.genericCost),
        brandCost: convertToINR(d.brandCost)
      }));
  }

  if (drug2) {
    const sameClassDrugs = getDrugsByClass(drug2.class);
    alternatives.drug2Alternatives = sameClassDrugs
      .filter(d => d.name.toLowerCase() !== drug2Name.toLowerCase())
      .map(d => ({
        name: d.name,
        class: d.class,
        reason: `Alternative ${drug2.class} that may not interact with ${drug1Name}`,
        genericCost: convertToINR(d.genericCost),
        brandCost: convertToINR(d.brandCost)
      }));
  }

  return alternatives;
}

export { LOCAL_DRUG_DATABASE };
