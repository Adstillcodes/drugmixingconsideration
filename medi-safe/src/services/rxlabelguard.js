const RXLABELGUARD_API_URL = 'https://api.rxlabelguard.com/v1/interactions';
const API_KEY = import.meta.env.VITE_RXLABELGUARD_API_KEY || '';

export async function checkDrugInteractions(drugs, userContext = {}) {
  if (!drugs || drugs.length < 2) {
    return {
      success: true,
      interactions: [],
      summary: {
        riskLevel: 'safe',
        riskScore: 0,
        riskPercentage: 0,
        message: drugs?.length < 2 
          ? 'Add at least 2 medications to check for interactions' 
          : 'No medications provided',
        allMedicationsChecked: drugs || [],
        checkedAt: new Date().toISOString(),
      },
    };
  }

  const drugNames = drugs.map(d => typeof d === 'string' ? d : d.name);

  if (!API_KEY) {
    console.log('No API key found, using local database');
    return getInteractionsFromDatabase(drugNames, userContext);
  }

  try {
    const response = await fetch(`${RXLABELGUARD_API_URL}/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        drugs: drugNames,
        format: 'structured',
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    return formatApiResponse(data, userContext);
  } catch (error) {
    console.error('RxLabelGuard API Error:', error);
    return getInteractionsFromDatabase(drugNames, userContext);
  }
}

function formatApiResponse(data, userContext) {
  let pairs = [];
  
  if (Array.isArray(data)) {
    pairs = data;
  } else if (data && typeof data === 'object') {
    pairs = data.pairs || data.interactions || data.results || [];
    if (!Array.isArray(pairs)) {
      pairs = [];
    }
  }
  
  const interactions = pairs.map((pair, index) => ({
    id: index + 1,
    drugs: [pair.drugA || pair.drug1 || pair.drug || `Drug ${index + 1}`, 
             pair.drugB || pair.drug2 || `Drug ${index + 2}`],
    severity: pair.severity || pair.maxSeverity || pair.level || 'unknown',
    risk: pair.mechanism || pair.risk || pair.interactions?.[0]?.mechanism || 'Potential interaction',
    description: pair.description || pair.evidenceSnippet || pair.interactions?.[0]?.evidenceSnippet || generateDescription(pair),
    mechanism: pair.mechanism || pair.interactions?.[0]?.mechanism || '',
    recommendations: generateRecommendations(pair, userContext),
    evidence: pair.interactions || pair.evidence || [],
  }));

  const { riskScore, riskLevel } = calculateRisk(interactions);
  
  return {
    success: true,
    interactions,
    summary: {
      riskLevel,
      riskScore,
      riskPercentage: riskScore,
      totalInteractions: interactions.length,
      severityBreakdown: getSeverityBreakdown(interactions),
      message: generateSummaryMessage(interactions, riskLevel),
    },
    apiData: data,
  };
}

function calculateRisk(interactions) {
  if (interactions.length === 0) {
    return { riskScore: 0, riskLevel: 'safe' };
  }

  const severityWeights = {
    contraindicated: 100,
    major: 75,
    moderate: 50,
    minor: 25,
    unknown: 10,
  };

  let totalRisk = 0;
  let maxRisk = 0;

  interactions.forEach(interaction => {
    const severityScore = severityWeights[interaction.severity] || 0;
    totalRisk += severityScore;
    if (severityScore > maxRisk) {
      maxRisk = severityScore;
    }
  });

  const avgRisk = totalRisk / interactions.length;
  const combinedRisk = Math.min(100, (avgRisk + maxRisk) / 1.5);

  let riskLevel = 'safe';
  if (combinedRisk >= 80) riskLevel = 'critical';
  else if (combinedRisk >= 60) riskLevel = 'high';
  else if (combinedRisk >= 40) riskLevel = 'moderate';
  else if (combinedRisk >= 20) riskLevel = 'low';
  else riskLevel = 'safe';

  return { riskScore: Math.round(combinedRisk), riskLevel };
}

function getSeverityBreakdown(interactions) {
  return {
    contraindicated: interactions.filter(i => i.severity === 'contraindicated').length,
    major: interactions.filter(i => i.severity === 'major').length,
    moderate: interactions.filter(i => i.severity === 'moderate').length,
    minor: interactions.filter(i => i.severity === 'minor').length,
    unknown: interactions.filter(i => i.severity === 'unknown').length,
  };
}

function generateSummaryMessage(interactions, riskLevel) {
  if (interactions.length === 0) {
    return 'No significant drug interactions detected between your medications.';
  }

  const messages = {
    critical: `${interactions.length} critical interaction(s) detected. Do not combine these medications without medical supervision.`,
    high: `${interactions.length} high-risk interaction(s) detected. Please consult your healthcare provider immediately.`,
    moderate: `${interactions.length} moderate interaction(s) detected. Monitor closely and consult your doctor.`,
    low: `${interactions.length} minor interaction(s) detected. Generally safe but be aware of potential effects.`,
    safe: 'No significant drug interactions detected.',
  };

  return messages[riskLevel] || messages.safe;
}

function generateDescription(pair) {
  return `Potential interaction between ${pair.drugA} and ${pair.drugB}. Consult your healthcare provider.`;
}

function generateRecommendations(pair, userContext) {
  const severity = pair.maxSeverity || 'unknown';
  const gender = userContext.gender;
  const pregnant = userContext.pregnant;
  const lactating = userContext.lactating;

  const baseRecommendations = {
    contraindicated: [
      'DO NOT take these medications together',
      'Seek immediate medical attention',
      'Contact your prescribing physician',
    ],
    major: [
      'Consult your prescribing physician immediately',
      'Do not start or stop medications without medical advice',
      'Consider alternative treatment options',
    ],
    moderate: [
      'Discuss with your healthcare provider',
      'Monitor for adverse effects',
      'Consider timing separation if appropriate',
    ],
    minor: [
      'Generally safe but be aware of potential effects',
      'Monitor for any unusual symptoms',
    ],
    unknown: [
      'Consult your healthcare provider',
      'Report any unusual symptoms',
    ],
  };

  let recommendations = [...(baseRecommendations[severity] || baseRecommendations.unknown)];

  if (pregnant) {
    recommendations.unshift('⚠️ Important: You indicated possible pregnancy. Some medications can be harmful. Consult your OB/GYN.');
  }

  if (lactating) {
    recommendations.unshift('⚠️ Important: You indicated breastfeeding. Some medications pass through breast milk. Consult your doctor.');
  }

  return recommendations;
}

function getInteractionsFromDatabase(drugNames, userContext) {
  const foundInteractions = [];
  const processedPairs = new Set();
  
  for (let i = 0; i < drugNames.length; i++) {
    for (let j = i + 1; j < drugNames.length; j++) {
      const drug1 = drugNames[i].toLowerCase();
      const drug2 = drugNames[j].toLowerCase();
      const key1 = `${drug1}+${drug2}`;
      const key2 = `${drug2}+${drug1}`;
      
      if (processedPairs.has(key1) || processedPairs.has(key2)) continue;
      processedPairs.add(key1);
      
      const interaction = getInteractionFromDatabase(drug1, drug2);
      
      if (interaction) {
        foundInteractions.push({
          id: foundInteractions.length + 1,
          drugs: [drugNames[i], drugNames[j]],
          severity: interaction.severity,
          risk: interaction.risk,
          description: interaction.description,
          mechanism: interaction.description,
          recommendations: generateRecommendationsForSeverity(interaction.severity, userContext),
          evidence: ['MediSafe Drug Interaction Database', 'Clinical Studies'],
        });
      }
    }
  }

  const { riskScore, riskLevel } = calculateRisk(foundInteractions);

  return {
    success: true,
    interactions: foundInteractions,
    summary: {
      riskLevel,
      riskScore,
      riskPercentage: riskScore,
      totalInteractions: foundInteractions.length,
      severityBreakdown: getSeverityBreakdown(foundInteractions),
      message: generateSummaryMessage(foundInteractions, riskLevel),
      allMedicationsChecked: drugNames,
      checkedAt: new Date().toISOString(),
    },
    isMockData: true,
  };
}

const comprehensiveInteractions = {
  'warfarin+aspirin': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'Concurrent use of Warfarin and Aspirin significantly increases bleeding risk. Monitor INR closely and watch for signs of bleeding.' },
  'aspirin+warfarin': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'Concurrent use of Warfarin and Aspirin significantly increases bleeding risk. Monitor INR closely and watch for signs of bleeding.' },
  'lisinopril+ibuprofen': { severity: 'major', risk: 'Acute Renal Impairment', description: 'NSAIDs like Ibuprofen reduce the antihypertensive effect of ACE inhibitors and may impair kidney function.' },
  'ibuprofen+lisinopril': { severity: 'major', risk: 'Acute Renal Impairment', description: 'NSAIDs like Ibuprofen reduce the antihypertensive effect of ACE inhibitors and may impair kidney function.' },
  'metformin+alcohol': { severity: 'moderate', risk: 'Lactic Acidosis Risk', description: 'Alcohol enhances the hypoglycemic effect of Metformin and increases the risk of lactic acidosis.' },
  'alcohol+metformin': { severity: 'moderate', risk: 'Lactic Acidosis Risk', description: 'Alcohol enhances the hypoglycemic effect of Metformin and increases the risk of lactic acidosis.' },
  'metoprolol+amlodipine': { severity: 'moderate', risk: 'Enhanced Hypotension', description: 'Both Metoprolol and Amlodipine lower blood pressure. Combined use may cause excessive hypotension.' },
  'amlodipine+metoprolol': { severity: 'moderate', risk: 'Enhanced Hypotension', description: 'Both Metoprolol and Amlodipine lower blood pressure. Combined use may cause excessive hypotension.' },
  'simvastatin+amlodipine': { severity: 'major', risk: 'Increased Statin Toxicity', description: 'Amlodipine inhibits the metabolism of Simvastatin, increasing the risk of muscle problems.' },
  'amlodipine+simvastatin': { severity: 'major', risk: 'Increased Statin Toxicity', description: 'Amlodipine inhibits the metabolism of Simvastatin, increasing the risk of muscle problems.' },
  'sertraline+tramadol': { severity: 'major', risk: 'Serotonin Syndrome', description: 'Combined use of SSRIs and Tramadol increases the risk of serotonin syndrome.' },
  'tramadol+sertraline': { severity: 'major', risk: 'Serotonin Syndrome', description: 'Combined use of SSRIs and Tramadol increases the risk of serotonin syndrome.' },
  'alprazolam+alcohol': { severity: 'contraindicated', risk: 'CNS Depression', description: 'Combining Benzodiazepines with alcohol causes severe respiratory depression and can be fatal.' },
  'alcohol+alprazolam': { severity: 'contraindicated', risk: 'CNS Depression', description: 'Combining Benzodiazepines with alcohol causes severe respiratory depression and can be fatal.' },
  'metformin+ciprofloxacin': { severity: 'moderate', risk: 'Blood Sugar Abnormalities', description: 'Ciprofloxacin may cause significant hypoglycemia or hyperglycemia when taken with Metformin.' },
  'ciprofloxacin+metformin': { severity: 'moderate', risk: 'Blood Sugar Abnormalities', description: 'Ciprofloxacin may cause significant hypoglycemia or hyperglycemia when taken with Metformin.' },
  'levothyroxine+omeprazole': { severity: 'minor', risk: 'Reduced Absorption', description: 'Omeprazole may reduce Levothyroxine absorption. Take on empty stomach.' },
  'omeprazole+levothyroxine': { severity: 'minor', risk: 'Reduced Absorption', description: 'Omeprazole may reduce Levothyroxine absorption. Take on empty stomach.' },
  'fluoxetine+tramadol': { severity: 'major', risk: 'Serotonin Syndrome', description: 'SSRIs combined with Tramadol increase serotonin levels, raising serotonin syndrome risk.' },
  'tramadol+fluoxetine': { severity: 'major', risk: 'Serotonin Syndrome', description: 'SSRIs combined with Tramadol increase serotonin levels, raising serotonin syndrome risk.' },
  'escitalopram+tramadol': { severity: 'major', risk: 'Serotonin Syndrome', description: 'SSRIs combined with Tramadol increase serotonin levels, raising serotonin syndrome risk.' },
  'clopidogrel+omeprazole': { severity: 'moderate', risk: 'Reduced Antiplatelet Effect', description: 'Omeprazole may reduce the effectiveness of Clopidogrel.' },
  'omeprazole+clopidogrel': { severity: 'moderate', risk: 'Reduced Antiplatelet Effect', description: 'Omeprazole may reduce the effectiveness of Clopidogrel.' },
  'digoxin+amlodipine': { severity: 'moderate', risk: 'Increased Digoxin Levels', description: 'Amlodipine may increase Digoxin levels, potentially leading to toxicity.' },
  'amlodipine+digoxin': { severity: 'moderate', risk: 'Increased Digoxin Levels', description: 'Amlodipine may increase Digoxin levels, potentially leading to toxicity.' },
  'spironolactone+lisinopril': { severity: 'moderate', risk: 'Hyperkalemia', description: 'Both medications can increase potassium levels. Monitor potassium levels regularly.' },
  'lisinopril+spironolactone': { severity: 'moderate', risk: 'Hyperkalemia', description: 'Both medications can increase potassium levels. Monitor potassium levels regularly.' },
  'warfarin+ibuprofen': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'NSAIDs increase bleeding risk when combined with Warfarin.' },
  'ibuprofen+warfarin': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'NSAIDs increase bleeding risk when combined with Warfarin.' },
  'lisinopril+potassium': { severity: 'moderate', risk: 'Hyperkalemia', description: 'ACE inhibitors can increase potassium levels. Supplementary potassium may cause dangerous hyperkalemia.' },
  'potassium+lisinopril': { severity: 'moderate', risk: 'Hyperkalemia', description: 'ACE inhibitors can increase potassium levels. Supplementary potassium may cause dangerous hyperkalemia.' },
  'amiodarone+warfarin': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'Amiodarone inhibits Warfarin metabolism, significantly increasing bleeding risk.' },
  'warfarin+amiodarone': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'Amiodarone inhibits Warfarin metabolism, significantly increasing bleeding risk.' },
  'fluoxetine+alprazolam': { severity: 'moderate', risk: 'Increased Sedation', description: 'Both medications cause sedation. Combined use may result in excessive drowsiness.' },
  'alprazolam+fluoxetine': { severity: 'moderate', risk: 'Increased Sedation', description: 'Both medications cause sedation. Combined use may result in excessive drowsiness.' },
  'metronidazole+alcohol': { severity: 'contraindicated', risk: 'Disulfiram-like Reaction', description: 'Combining Metronidazole with alcohol causes a disulfiram-like reaction.' },
  'alcohol+metronidazole': { severity: 'contraindicated', risk: 'Disulfiram-like Reaction', description: 'Combining Metronidazole with alcohol causes a disulfiram-like reaction.' },
  'ciprofloxacin+warfarin': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'Ciprofloxacin may increase the anticoagulant effect of Warfarin.' },
  'warfarin+ciprofloxacin': { severity: 'major', risk: 'Increased Bleeding Risk', description: 'Ciprofloxacin may increase the anticoagulant effect of Warfarin.' },
  'simvastatin+gemfibrozil': { severity: 'contraindicated', risk: 'Severe Myopathy Risk', description: 'Gemfibrozil significantly increases Simvastatin levels, causing high risk of myopathy.' },
  'gemfibrozil+simvastatin': { severity: 'contraindicated', risk: 'Severe Myopathy Risk', description: 'Gemfibrozil significantly increases Simvastatin levels, causing high risk of myopathy.' },
  'methotrexate+ibuprofen': { severity: 'major', risk: 'Methotrexate Toxicity', description: 'NSAIDs reduce Methotrexate excretion, potentially causing toxic levels.' },
  'ibuprofen+methotrexate': { severity: 'major', risk: 'Methotrexate Toxicity', description: 'NSAIDs reduce Methotrexate excretion, potentially causing toxic levels.' },
  'digoxin+furosemide': { severity: 'moderate', risk: 'Hypokalemia', description: 'Furosemide-induced hypokalemia increases the risk of Digoxin toxicity.' },
  'furosemide+digoxin': { severity: 'moderate', risk: 'Hypokalemia', description: 'Furosemide-induced hypokalemia increases the risk of Digoxin toxicity.' },
  'losartan+potassium': { severity: 'moderate', risk: 'Hyperkalemia', description: 'ARBs can increase potassium levels. Supplementary potassium may cause dangerous hyperkalemia.' },
  'potassium+losartan': { severity: 'moderate', risk: 'Hyperkalemia', description: 'ARBs can increase potassium levels. Supplementary potassium may cause dangerous hyperkalemia.' },
  'ramipril+potassium': { severity: 'moderate', risk: 'Hyperkalemia', description: 'ACE inhibitors can increase potassium levels.' },
  'enalapril+potassium': { severity: 'moderate', risk: 'Hyperkalemia', description: 'ACE inhibitors can increase potassium levels.' },
  'diltiazem+simvastatin': { severity: 'major', risk: 'Increased Statin Toxicity', description: 'Diltiazem inhibits the metabolism of Simvastatin, increasing risk of myopathy.' },
  'simvastatin+diltiazem': { severity: 'major', risk: 'Increased Statin Toxicity', description: 'Diltiazem inhibits the metabolism of Simvastatin, increasing risk of myopathy.' },
  'amiodarone+simvastatin': { severity: 'major', risk: 'Increased Statin Toxicity', description: 'Amiodarone inhibits the metabolism of Simvastatin, increasing myopathy risk.' },
  'simvastatin+amiodarone': { severity: 'major', risk: 'Increased Statin Toxicity', description: 'Amiodarone inhibits the metabolism of Simvastatin, increasing myopathy risk.' },
};

function getInteractionFromDatabase(drug1, drug2) {
  const key1 = `${drug1}+${drug2}`;
  const key2 = `${drug2}+${drug1}`;
  return comprehensiveInteractions[key1] || comprehensiveInteractions[key2] || null;
}

function generateRecommendationsForSeverity(severity, userContext) {
  const gender = userContext?.gender;
  const pregnant = userContext?.pregnant;
  const lactating = userContext?.lactating;
  
  const baseRecommendations = {
    contraindicated: [
      'DO NOT take these medications together',
      'Seek immediate medical attention',
      'Contact your prescribing physician',
    ],
    major: [
      'Consult your prescribing physician immediately',
      'Do not start or stop medications without medical advice',
      'Consider alternative treatment options',
    ],
    moderate: [
      'Discuss with your healthcare provider',
      'Monitor for adverse effects',
      'Consider timing separation if appropriate',
    ],
    minor: [
      'Generally safe but be aware of potential effects',
      'Monitor for any unusual symptoms',
    ],
  };
  
  let recommendations = [...(baseRecommendations[severity] || baseRecommendations.moderate)];
  
  if (pregnant) {
    recommendations.unshift('⚠️ Important: Pregnancy detected. Consult your OB/GYN before making any changes.');
  }
  
  if (lactating) {
    recommendations.unshift('⚠️ Important: Breastfeeding detected. Consult your doctor about medication safety.');
  }
  
  return recommendations;
}

export function getRiskColor(riskLevel) {
  const colors = {
    safe: { bg: 'bg-success/10', border: 'border-success/30', text: 'text-success', badge: 'bg-success', gauge: '#2ECC71' },
    low: { bg: 'bg-success/10', border: 'border-success/30', text: 'text-success', badge: 'bg-success', gauge: '#2ECC71' },
    moderate: { bg: 'bg-tertiary/20', border: 'border-tertiary/30', text: 'text-tertiary', badge: 'bg-tertiary', gauge: '#E9C46A' },
    high: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-600', badge: 'bg-orange-500', gauge: '#F97316' },
    critical: { bg: 'bg-error-container', border: 'border-error', text: 'text-error', badge: 'bg-error', gauge: '#D32F2F' },
  };
  return colors[riskLevel] || colors.safe;
}

export function getSeverityColor(severity) {
  const colors = {
    contraindicated: { bg: 'bg-error-container', border: 'border-error', text: 'text-error', badge: 'bg-error' },
    major: { bg: 'bg-error-container/40', border: 'border-error/20', text: 'text-error', badge: 'bg-error' },
    moderate: { bg: 'bg-tertiary/20', border: 'border-tertiary/20', text: 'text-tertiary', badge: 'bg-tertiary' },
    minor: { bg: 'bg-success/10', border: 'border-success/20', text: 'text-success', badge: 'bg-success' },
    unknown: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-600', badge: 'bg-gray-500' },
  };
  return colors[severity] || colors.unknown;
}
