import Groq from 'groq-sdk';

let groqClient = null;

function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey && apiKey !== 'your_groq_api_key_here') {
      groqClient = new Groq({ apiKey });
    }
  }
  return groqClient;
}

const COMMON_DRUGS = [
  'metformin', 'lisinopril', 'atorvastatin', 'amlodipine', 'omeprazole', 'metoprolol',
  'losartan', 'gabapentin', 'warfarin', 'aspirin', 'ibuprofen', 'amoxicillin', 'azithromycin',
  'prednisone', 'levothyroxine', 'simvastatin', 'hydrochlorothiazide', 'sertraline', 'fluoxetine',
  'tramadol', 'oxycodone', 'hydrocodone', 'alprazolam', 'lorazepam', 'clonazepam', 'zolpidem',
  'ciprofloxacin', 'doxycycline', 'naproxen', 'acetaminophen', 'paracetamol', 'pantoprazole',
  'ranitidine', 'famotidine', 'montelukast', 'albuterol', 'fluticasone', 'budesonide',
  'digoxin', 'furosemide', 'spironolactone', 'glipizide', 'glyburide', 'insulin',
  'amitriptyline', 'duloxetine', 'venlafaxine', 'bupropion', 'buspirone', 'escitalopram',
  'citalopram', 'paroxetine', 'hydroxyzine', 'clonidine', 'clopidogrel', 'pravastatin',
  'rosuvastatin', 'niacin', 'gemfibrozil', 'fenofibrate', 'tamsulosin', 'finasteride',
  'sildenafil', 'tadalafil', 'cyclobenzaprine', 'methocarbamol', 'baclofen', 'tizanidine',
  'carisoprodol', 'quetiapine', 'olanzapine', 'risperidone', 'amiodarone', 'lithium',
  'methotrexate', 'allopurinol', 'colchicine', 'diclofenac', 'meloxicam', 'celecoxib',
  'rivaroxaban', 'apixaban', 'dabigatran', 'pregabalin', 'levetiracetam', 'phenytoin',
  'carbamazepine', 'metronidazole', 'cephalexin', 'fluconazole', 'methylprednisolone',
  'dexamethasone', 'hydrocortisone', 'tiotropium', 'liothyronine', 'febuxostat', 'codeine',
];

const TIMING_PATTERNS = [
  /(?:at|in the)?\s*(morning|afternoon|evening|night|bedtime|before breakfast|after breakfast|before lunch|after lunch|before dinner|after dinner)/i,
  /\b(\d{1,2}:\d{2})\s*(am|pm)?\b/i,
  /\b(morning|afternoon|evening|night|bedtime|noon)\b/i,
  /(?:twice|daily|once|three times|weekly|monthly|bd|od|tid|qid)\b/i,
];

function extractTimingFromContext(text, drugName) {
  const drugIndex = text.toLowerCase().indexOf(drugName.toLowerCase());
  if (drugIndex === -1) return null;

  const context = text.substring(
    Math.max(0, drugIndex - 100),
    Math.min(text.length, drugIndex + 200)
  );

  for (const pattern of TIMING_PATTERNS) {
    const match = context.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }
  return null;
}

function cleanDrugName(rawName) {
  if (!rawName) return '';
  
  let cleaned = rawName.trim();
  
  cleaned = cleaned.replace(/^\d+\s*\(|\)\s*\/\s*\d+.*$/g, '');
  cleaned = cleaned.replace(/\d+\s*\(.*?\)\s*/g, '');
  cleaned = cleaned.replace(/\(\s*Pack\s*\[.*?\]/gi, '');
  cleaned = cleaned.replace(/\[.*?\]/g, '');
  cleaned = cleaned.replace(/\d+(?:\.\d+)?\s*(?:MG|Mcg|ML|G|IU|MEQ|%)[^\s]*/gi, '');
  cleaned = cleaned.replace(/\s*(?:Oral|Tablet|Capsule|Injection|Solution|Cream|Patch|mg|ml)\b/gi, '');
  cleaned = cleaned.replace(/\s*\/\s*/g, '/');
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  const parts = cleaned.split('/').map(p => p.trim()).filter(p => p && p.length > 1);
  if (parts.length > 0) {
    cleaned = parts[0];
  }
  
  cleaned = cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return cleaned.trim();
}

export async function extractMedicationsFromText(text) {
  const textLower = text.toLowerCase();
  const foundDrugs = [];
  const seen = new Set();

  for (const drug of COMMON_DRUGS) {
    if (textLower.includes(drug)) {
      const key = drug.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);

        const dosagePattern = /(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu|meq|%)/i;
        const dosageMatch = text.match(new RegExp(`${drug}[\\s\\S]{0,50}(${dosagePattern.source})`, 'i'));

        const timing = extractTimingFromContext(text, drug);

        foundDrugs.push({
          name: drug.charAt(0).toUpperCase() + drug.slice(1),
          dosage: dosageMatch ? dosageMatch[0].match(dosagePattern)?.[0] || 'Not specified' : 'Not specified',
          timing: timing || '',
          category: 'Detected',
          confidence: 'medium',
        });
      }
    }
  }

  try {
    const systemPrompt = `You are a medical prescription parser. Extract ONLY the clean drug names from prescription text.

IMPORTANT RULES:
1. Return ONLY the main drug name, nothing else
2. For combination drugs (like "Acetaminophen/Aspirin/Caffeine"), return "Acetaminophen" only
3. DO NOT include: dosages, mg, mg amounts, tablet, capsule, oral, pack, brand names in brackets
4. DO NOT include prescription numbers, patient info, or addresses
5. Proper Title Case: "Acetaminophen", NOT "ACETAMINOPHEN" or "acetaminophen"
6. If the text has "100 (acetaminophen 250 MG / aspirin 250 MG)", return just: Acetaminophen

Examples:
- Input: "100 (acetaminophen 250 MG / aspirin 250 MG / caffeine 65 MG Oral Tablet [Excedrin])" → Output: Acetaminophen
- Input: "Lisinopril 10mg once daily" → Output: Lisinopril
- Input: "Metformin 500mg twice daily with food" → Output: Metformin

Return valid JSON array only:
[{"name": "CleanDrugName", "dosage": "dosage if clearly stated like '500mg' or 'Not specified'", "timing": "time/schedule if mentioned or empty string", "category": "General"}]

Common drug names to look for: metformin, lisinopril, atorvastatin, amlodipine, omeprazole, aspirin, ibuprofen, amoxicillin, metformin, warfarin, etc.

Return ONLY valid JSON array, no explanations, no markdown formatting.`;

    const userPrompt = `Extract clean medication names from this prescription:\n\n${text.substring(0, 2000)}\n\nReturn JSON array with cleaned drug names only.`;

    const groq = getGroqClient();
    if (!groq) {
      return foundDrugs.slice(0, 20);
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 500,
    });

    const content = completion.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      try {
        const groqDrugs = JSON.parse(jsonMatch[0]);

        for (const drug of groqDrugs) {
          if (drug.name) {
            const cleanedName = cleanDrugName(drug.name);
            if (cleanedName && !seen.has(cleanedName.toLowerCase())) {
              seen.add(cleanedName.toLowerCase());
              foundDrugs.push({
                name: cleanedName,
                dosage: drug.dosage || 'Not specified',
                timing: drug.timing || '',
                category: drug.category || 'Extracted',
                confidence: 'high',
              });
            }
          }
        }
      } catch (e) {
        console.warn('Failed to parse Groq response:', e);
      }
    }
  } catch (error) {
    console.warn('Groq extraction failed, using fallback:', error);
  }

  return foundDrugs.slice(0, 20);
}
