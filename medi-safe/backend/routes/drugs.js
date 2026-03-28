const RXNORM_API = 'https://rxnav.nlm.nih.gov/REST';

const LOCAL_DRUG_DATABASE = [
  { name: 'Metformin', category: 'Antidiabetic', class: 'Biguanide' },
  { name: 'Metformin ER', category: 'Antidiabetic', class: 'Biguanide' },
  { name: 'Glipizide', category: 'Antidiabetic', class: 'Sulfonylurea' },
  { name: 'Glyburide', category: 'Antidiabetic', class: 'Sulfonylurea' },
  { name: 'Glimepiride', category: 'Antidiabetic', class: 'Sulfonylurea' },
  { name: 'Sitagliptin', category: 'Antidiabetic', class: 'DPP-4 Inhibitor' },
  { name: 'Empagliflozin', category: 'Antidiabetic', class: 'SGLT2 Inhibitor' },
  { name: 'Liraglutide', category: 'Antidiabetic', class: 'GLP-1 Agonist' },
  { name: 'Lisinopril', category: 'Antihypertensive', class: 'ACE Inhibitor' },
  { name: 'Enalapril', category: 'Antihypertensive', class: 'ACE Inhibitor' },
  { name: 'Ramipril', category: 'Antihypertensive', class: 'ACE Inhibitor' },
  { name: 'Amlodipine', category: 'Antihypertensive', class: 'Calcium Channel Blocker' },
  { name: 'Nifedipine', category: 'Antihypertensive', class: 'Calcium Channel Blocker' },
  { name: 'Diltiazem', category: 'Antihypertensive', class: 'Calcium Channel Blocker' },
  { name: 'Verapamil', category: 'Antihypertensive', class: 'Calcium Channel Blocker' },
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
  { name: 'Clarithromycin', category: 'Antibiotic', class: 'Macrolide' },
  { name: 'Ciprofloxacin', category: 'Antibiotic', class: 'Fluoroquinolone' },
  { name: 'Levofloxacin', category: 'Antibiotic', class: 'Fluoroquinolone' },
  { name: 'Doxycycline', category: 'Antibiotic', class: 'Tetracycline' },
  { name: 'Metronidazole', category: 'Antibiotic', class: 'Nitroimidazole' },
  { name: 'Cephalexin', category: 'Antibiotic', class: 'Cephalosporin' },
  { name: 'Fluconazole', category: 'Antifungal', class: 'Azole' },
  { name: 'Itraconazole', category: 'Antifungal', class: 'Azole' },
  { name: 'Ketoconazole', category: 'Antifungal', class: 'Azole' },
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
  { name: 'Morphine', category: 'Analgesic', class: 'Opioid' },
  { name: 'Hydrocodone', category: 'Analgesic', class: 'Opioid' },
  { name: 'Codeine', category: 'Analgesic', class: 'Opioid' },
  { name: 'Cyclobenzaprine', category: 'Muscle Relaxant', class: 'Muscle Relaxant' },
  { name: 'Methocarbamol', category: 'Muscle Relaxant', class: 'Muscle Relaxant' },
  { name: 'Baclofen', category: 'Muscle Relaxant', class: 'GABA Agonist' },
  { name: 'Tizanidine', category: 'Muscle Relaxant', class: 'Alpha-2 Agonist' },
  { name: 'Carisoprodol', category: 'Muscle Relaxant', class: 'Muscle Relaxant' },
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
  { name: 'Lithium', category: 'Mood Stabilizer', class: 'Mood Stabilizer' },
  { name: 'Methotrexate', category: 'Immunosuppressant', class: 'DMARD' },
  { name: 'Insulin Glargine', category: 'Antidiabetic', class: 'Insulin' },
  { name: 'Insulin Lispro', category: 'Antidiabetic', class: 'Insulin' },
  { name: 'Insulin Aspart', category: 'Antidiabetic', class: 'Insulin' },
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
      return res.json({
        success: true,
        drugs: LOCAL_DRUG_DATABASE.slice(0, limit),
        source: 'local',
      });
    }

    const queryLower = searchTerm.toLowerCase();

    const localMatches = LOCAL_DRUG_DATABASE.filter(
      (drug) =>
        drug.name.toLowerCase().includes(queryLower) ||
        drug.category.toLowerCase().includes(queryLower) ||
        drug.class.toLowerCase().includes(queryLower)
    ).slice(0, limit);

    if (localMatches.length >= 5) {
      return res.json({
        success: true,
        drugs: localMatches,
        source: 'local',
      });
    }

    const apiMatches = await searchRxNorm(searchTerm);

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
      source: combined.length > localMatches.length ? 'rxnorm+local' : 'local',
    });
  } catch (error) {
    console.error('Drug search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      drugs: LOCAL_DRUG_DATABASE.slice(0, 20),
      source: 'local-fallback',
    });
  }
}
