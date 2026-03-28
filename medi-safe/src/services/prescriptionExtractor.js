import { CreateMLCEngine } from '@mlc-ai/web-llm';

const WebLLMModel = 'Llama-3.2-3B-Instruct-q4f16_1-MLC';

let engine = null;
let isModelLoaded = false;
let isLoading = false;

const commonDrugs = [
  'Metformin', 'Lisinopril', 'Atorvastatin', 'Amlodipine', 'Omeprazole', 'Metoprolol',
  'Losartan', 'Gabapentin', 'Warfarin', 'Aspirin', 'Ibuprofen', 'Amoxicillin', 'Azithromycin',
  'Prednisone', 'Levothyroxine', 'Simvastatin', 'Hydrochlorothiazide', 'Sertraline', 'Fluoxetine',
  'Tramadol', 'Oxycodone', 'Hydrocodone', 'Alprazolam', 'Lorazepam', 'Clonazepam', 'Zolpidem',
  'Ciprofloxacin', 'Doxycycline', 'Naproxen', 'Acetaminophen', 'Paracetamol', 'Pantoprazole',
  'Ranitidine', 'Famotidine', 'Montelukast', 'Albuterol', 'Ventolin', 'Advair', 'Singulair',
  'Amlodipine', 'Losartan', 'Valsartan', 'Carvedilol', 'Digoxin', 'Furosemide', 'Spironolactone',
  'Metformin', 'Glipizide', 'Glyburide', 'Insulin', 'Januvia', 'Jardiance', 'Ozempic',
  'Amitriptyline', 'Duloxetine', 'Venlafaxine', 'Bupropion', 'Buspirone', 'Escitalopram',
  'Citalopram', 'Fluoxetine', 'Sertraline', 'Paroxetine', 'Hydroxyzine', 'Clonidine',
  'Clopidogrel', 'Pravastatin', 'Rosuvastatin', 'Niacin', 'Gemfibrozil', 'Fenofibrate',
  'Tamsulosin', 'Finasteride', 'Dutasteride', 'Sildenafil', 'Tadalafil', 'Vardenafil',
  'Cyclobenzaprine', 'Methocarbamol', 'Baclofen', 'Tizanidine', 'Carisoprodol'
];

export async function initializeWebLLM(onProgress) {
  if (isModelLoaded || isLoading) return engine;
  
  isLoading = true;
  
  try {
    engine = await CreateMLCEngine(WebLLMModel, {
      initProgressCallback: (progressData) => {
        if (onProgress && progressData.progress !== undefined) {
          onProgress(Math.round(progressData.progress));
        }
      }
    });
    
    isModelLoaded = true;
    isLoading = false;
    return engine;
  } catch (error) {
    console.error('Failed to initialize WebLLM:', error);
    isLoading = false;
    return null;
  }
}

export async function extractMedicationsFromText(prescriptionText, onProgress) {
  if (!prescriptionText || prescriptionText.trim().length === 0) {
    return fallbackExtractMedications(prescriptionText);
  }

  const systemPrompt = `You are a clinical pharmacist assistant. Your task is to extract medication names from prescription text. 
Return ONLY a JSON array of medication objects with this exact format:
[{"name": "DrugName", "dosage": "dosage if found or 'Not specified'", "category": "category if known or 'Unknown'"}]

Rules:
- Extract ONLY actual medication/drug names
- Include dosage if mentioned (e.g., "500mg", "10mg", "twice daily")
- Use proper capitalization for drug names
- Do NOT include patient names, doctor names, or addresses
- Return ONLY valid JSON, no explanation or markdown`;

  const userPrompt = `Extract all medications from this prescription text:

${prescriptionText.substring(0, 3000)}

Return ONLY the JSON array.`;

  try {
    if (!isModelLoaded) {
      await initializeWebLLM(onProgress);
    }

    if (!engine) {
      console.log('WebLLM not available, using fallback extraction');
      return fallbackExtractMedications(prescriptionText);
    }

    const response = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content;
    
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const drugs = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          drugs: drugs.filter(d => d && d.name).slice(0, 20),
          message: `Found ${drugs.length} medication(s) from prescription`,
          source: 'webllm'
        };
      } catch (e) {
        console.warn('Failed to parse JSON from WebLLM:', e);
      }
    }
    
    return fallbackExtractMedications(prescriptionText);
  } catch (error) {
    console.error('WebLLM extraction error:', error);
    return fallbackExtractMedications(prescriptionText);
  }
}

function fallbackExtractMedications(text) {
  const foundDrugs = [];
  const textLower = text.toLowerCase();
  
  for (const drug of commonDrugs) {
    const drugLower = drug.toLowerCase();
    if (textLower.includes(drugLower)) {
      if (!foundDrugs.some(d => d.name.toLowerCase() === drug.toLowerCase())) {
        foundDrugs.push({
          name: drug,
          dosage: 'Not specified',
          category: 'Detected from prescription'
        });
      }
    }
  }

  const dosagePatterns = [
    /(\d+\.?\d*)\s*(mg|mcg|g|ml|iu|meq)\b/gi,
    /(\d+\.?\d*)\s*(mg|mcg|g|ml|iu|meq)\s*(daily|twice|once|weekly|monthly|bid|tid|qid)/gi
  ];

  foundDrugs.forEach(drug => {
    for (const pattern of dosagePatterns) {
      const match = text.match(new RegExp(`${drug.name.toLowerCase()}[\\s\\S]{0,100}` + pattern.source, 'i'));
      if (match) {
        const dosageMatch = match[0].match(pattern);
        if (dosageMatch) {
          drug.dosage = dosageMatch[0];
          break;
        }
      }
    }
  });

  return {
    success: foundDrugs.length > 0,
    drugs: foundDrugs,
    message: foundDrugs.length > 0
      ? `Found ${foundDrugs.length} medication(s) from prescription`
      : 'No medications detected in prescription',
    source: 'fallback'
  };
}

export function isWebLLMReady() {
  return isModelLoaded && engine !== null;
}

export function resetEngine() {
  if (engine) {
    engine.terminate?.();
  }
  engine = null;
  isModelLoaded = false;
  isLoading = false;
}
