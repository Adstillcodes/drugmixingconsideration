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
  if (!rawName || typeof rawName !== 'string') return '';
  
  let cleaned = rawName.trim();
  
  if (cleaned.length > 100) {
    cleaned = cleaned.substring(0, 100);
  }
  
  if (cleaned.includes('(') && cleaned.includes('MG') && !cleaned.includes(' + ')) {
    const ingredients = [];
    const ingredientPattern = /([a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s+\d+(?:\.\d+)?\s*(?:MG|MCG|ML|G)\/[A-Z]/gi;
    const matches = cleaned.match(ingredientPattern);
    
    if (!matches) {
      const simplePattern = /([a-zA-Z]+)\s+\d+(?:\.\d+)?\s*(?:MG|MCG|ML|G)/gi;
      const simpleMatches = [...cleaned.matchAll(simplePattern)];
      for (const match of simpleMatches) {
        const ingredientName = match[1].trim();
        if (ingredientName.length > 3 && !['pack', 'oral', 'tablet', 'capsule', 'solution'].includes(ingredientName.toLowerCase())) {
          ingredients.push(ingredientName.charAt(0).toUpperCase() + ingredientName.slice(1).toLowerCase());
        }
      }
    }
    
    if (ingredients.length > 0) {
      const uniqueIngredients = [...new Set(ingredients)];
      return uniqueIngredients.slice(0, 3).join(' + ');
    }
  }
  
  if (cleaned.match(/^\d+\s*\(/) || cleaned.includes('{') || cleaned.includes('Pack')) {
    cleaned = cleaned
      .replace(/^\d+\s*\(/, '')
      .replace(/^\{\d+\s*\(/, '')
      .replace(/\)\s*\/.*$/, '')
      .replace(/\s*\}\s*Pack.*$/i, '')
      .replace(/^\(|\)$/g, '')
      .trim();
  }
  
  cleaned = cleaned.replace(/^\d+\s*\(|\)\s*\/\s*\d+.*$/g, '');
  cleaned = cleaned.replace(/\d+\s*\(.*?\)\s*/g, '');
  cleaned = cleaned.replace(/\(\s*Pack\s*\[.*?\]/gi, '');
  cleaned = cleaned.replace(/\[\s*Pack\s*\]/gi, '');
  cleaned = cleaned.replace(/\[.*?\]/g, '');
  cleaned = cleaned.replace(/\d+(?:\.\d+)?\s*(?:MG|Mcg|ML|G|IU|MEQ|%)[^\s]*/gi, '');
  cleaned = cleaned.replace(/\s*(?:Oral|Tablet|Capsule|Injection|Solution|Cream|Patch)\b/gi, '');
  cleaned = cleaned.replace(/\s*\/+\s*/g, ' + ');
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  const parts = cleaned.split('+').map(p => p.trim()).filter(p => p && p.length > 1 && p.length < 50);
  if (parts.length > 0) {
    if (parts.length > 3) {
      cleaned = parts.slice(0, 3).join(' + ') + ' + others';
    } else {
      cleaned = parts.join(' + ');
    }
  }
  
  cleaned = cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  cleaned = cleaned.replace(/\s+[a-z]\s+/g, ' ');
  
  if (cleaned.length > 60 || cleaned.match(/\d+\s*\(/) || cleaned.includes('{')) {
    return '';
  }
  
  return cleaned.trim();
}

function isValidDrugName(name) {
  if (!name || typeof name !== 'string') return false;
  
  const cleaned = name.trim();
  
  if (cleaned.length < 2 || cleaned.length > 60) return false;
  if (cleaned.match(/\d+\s*\(/)) return false;
  if (cleaned.includes('{') || cleaned.includes('}')) return false;
  if (cleaned.includes('Pack') && cleaned.length > 20) return false;
  if (cleaned.match(/\)\s*\/|\/\s*\(/)) return false;
  if (cleaned.split(/\s+/).length > 8) return false;
  
  const hasLetters = /[a-zA-Z]{3,}/.test(cleaned);
  if (!hasLetters) return false;
  
  return true;
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

        const drugName = drug.charAt(0).toUpperCase() + drug.slice(1);
        if (isValidDrugName(drugName)) {
          foundDrugs.push({
            name: drugName,
            dosage: dosageMatch ? dosageMatch[0].match(dosagePattern)?.[0] || 'Not specified' : 'Not specified',
            timing: timing || '',
            category: 'Detected',
            confidence: 'medium',
          });
        }
      }
    }
  }

  try {
    const systemPrompt = `You are a medical prescription parser. Extract medication names in a clean, user-friendly format.

CRITICAL RULES:
1. For COMBINATION drugs (multiple ingredients like cough syrups), return the ingredients joined by " + "
   - Example: "acetaminophen + dextromethorphan + doxylamine"
   - Example: "acetaminophen + aspirin + caffeine"
2. For SINGLE drugs, return just the drug name
   - Example: "Lisinopril", "Metformin", "Aspirin"
3. NEVER return raw prescription text, dosages in parentheses, or pack information
4. NEVER return text like "100 (acetaminophen 250 MG / aspirin...)" - extract the drug names only
5. Proper Title Case: "Acetaminophen", "Metformin", "Dextromethorphan"
6. For cough/cold combinations, extract ALL active ingredients

Examples of CORRECT output:
- "Acetaminophen + Dextromethorphan + Doxylamine" (from cough syrup)
- "Acetaminophen" (from single drug)
- "Metformin + Lisinopril" (from two drugs)
- "Aspirin + Clopidogrel" (from blood thinner combo)

Examples of WRONG output (DO NOT DO THIS):
- "100 (acetaminophen 250 MG / aspirin 250 MG / caffeine 65 MG Oral Tablet [Excedrin])"
- "1 (acetaminophen 33.3 MG/ML / dextromethorphan hydrobromide 1 MG/ML)"
- "{1 (...Pack"

Return valid JSON array:
[{"name": "Drug Name(s)", "dosage": "Not specified", "timing": "", "category": "General"}]

Return ONLY valid JSON array, no explanations, no markdown.`;

    const userPrompt = `Parse this prescription and extract clean medication names:\n\n${text.substring(0, 2000)}\n\nReturn JSON array with properly formatted drug names.`;

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
            if (isValidDrugName(cleanedName) && !seen.has(cleanedName.toLowerCase())) {
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
