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
    const systemPrompt = `Extract medication names from prescription text. Return valid JSON array:
[{"name": "DrugName", "dosage": "dosage if found or 'Not specified'", "timing": "time of day if mentioned or empty string", "category": "category"}]

Common timing values: "06:00", "07:00", "08:00", "09:00", "12:00", "18:00", "20:00", "21:00", "Before breakfast", "After breakfast", "Before lunch", "After lunch", "Before dinner", "After dinner", "At bedtime", "Morning", "Afternoon", "Evening", "Night"

Rules:
- Only actual medication/drug names
- Include dosage if mentioned (e.g., "500mg", "10mg", "twice daily")
- Include timing/schedule if mentioned (e.g., "in the morning", "twice daily", "at bedtime")
- Proper capitalization for drug names
- Do NOT include patient/doctor names or addresses
- Return ONLY valid JSON array, no markdown`;

    const userPrompt = `Extract medications from:\n${text.substring(0, 3000)}\n\nReturn JSON array with name, dosage, timing, and category for each medication.`;

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
          if (drug.name && !seen.has(drug.name.toLowerCase())) {
            seen.add(drug.name.toLowerCase());
            foundDrugs.push({
              name: drug.name,
              dosage: drug.dosage || 'Not specified',
              timing: drug.timing || '',
              category: drug.category || 'Extracted',
              confidence: 'high',
            });
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
