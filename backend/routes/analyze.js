import Groq from 'groq-sdk';
import { getAlternativesForInteraction, getDrugByName, LOCAL_DRUG_DATABASE } from './drugs.js';

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

const DANGEROUS_COMBINATIONS = {
  'warfarin-nsaid': {
    alternatives: [
      {
        for: 'nsaid',
        suggestions: ['Acetaminophen', 'Tramadol', 'Gabapentin'],
        reason: 'Safer pain options that do not increase bleeding risk'
      }
    ]
  },
  'ace-nsaid': {
    alternatives: [
      {
        for: 'nsaid',
        suggestions: ['Acetaminophen', 'Tramadol', 'Celecoxib'],
        reason: 'Lower kidney risk when combined with ACE inhibitors'
      },
      {
        for: 'ace',
        suggestions: ['Losartan', 'Valsartan', 'Olmesartan'],
        reason: 'ARBs have lower kidney interaction risk with NSAIDs'
      }
    ]
  },
  'ssri-opioid': {
    alternatives: [
      {
        for: 'opioid',
        suggestions: ['Acetaminophen', 'Gabapentin', 'NSAIDs'],
        reason: 'Avoids serotonin syndrome risk'
      }
    ]
  },
  'statin-calcium': {
    alternatives: [
      {
        for: 'statin',
        suggestions: ['Atorvastatin', 'Rosuvastatin', 'Pravastatin'],
        reason: 'Safer statins with calcium channel blockers'
      },
      {
        for: 'calcium',
        suggestions: ['Hydrochlorothiazide', 'Losartan'],
        reason: 'Alternative blood pressure medications without statin interaction'
      }
    ]
  },
  'metformin-nsaid': {
    alternatives: [
      {
        for: 'nsaid',
        suggestions: ['Acetaminophen', 'Celecoxib'],
        reason: 'Lower risk of lactic acidosis'
      }
    ]
  },
  'lisinopril-ibuprofen': {
    alternatives: [
      {
        for: 'nsaid',
        suggestions: ['Acetaminophen', 'Celecoxib', 'Tramadol'],
        reason: 'Lower kidney and blood pressure interaction risk'
      }
    ]
  }
};

function findKnownAlternative(drug1Name, drug2Name) {
  const key1 = `${drug1Name.toLowerCase()}-${drug2Name.toLowerCase()}`;
  const key2 = `${drug2Name.toLowerCase()}-${drug1Name.toLowerCase()}`;
  
  return DANGEROUS_COMBINATIONS[key1] || DANGEROUS_COMBINATIONS[key2] || null;
}

function getSmartAlternatives(interaction) {
  const { drugs, severity } = interaction;
  const [drug1, drug2] = drugs;
  
  const drug1Info = getDrugByName(drug1);
  const drug2Info = getDrugByName(drug2);
  
  const alternatives = {
    drug1Alternatives: [],
    drug2Alternatives: [],
    generalAdvice: []
  };

  const knownAlt = findKnownAlternative(drug1, drug2);
  
  if (knownAlt) {
    for (const alt of knownAlt.alternatives) {
      if (alt.for === 'nsaid' || alt.for === drug2.toLowerCase()) {
        const drug2Alt = LOCAL_DRUG_DATABASE.filter(d => 
          alt.suggestions.some(s => d.name.toLowerCase() === s.toLowerCase())
        );
        alternatives.drug2Alternatives.push(...drug2Alt.map(d => ({
          name: d.name,
          class: d.class,
          reason: alt.reason,
          genericCost: d.genericCost,
          brandCost: d.brandCost
        })));
      }
      if (alt.for === 'statin' || alt.for === drug1.toLowerCase()) {
        const drug1Alt = LOCAL_DRUG_DATABASE.filter(d => 
          alt.suggestions.some(s => d.name.toLowerCase() === s.toLowerCase())
        );
        alternatives.drug1Alternatives.push(...drug1Alt.map(d => ({
          name: d.name,
          class: d.class,
          reason: alt.reason,
          genericCost: d.genericCost,
          brandCost: d.brandCost
        })));
      }
      if (alt.for === 'ace') {
        const aceAlts = LOCAL_DRUG_DATABASE.filter(d => 
          d.class === 'ARB'
        );
        alternatives.drug1Alternatives.push(...aceAlts.map(d => ({
          name: d.name,
          class: d.class,
          reason: alt.reason,
          genericCost: d.genericCost,
          brandCost: d.brandCost
        })));
      }
    }
  }

  const classAlt1 = LOCAL_DRUG_DATABASE
    .filter(d => drug1Info && d.class === drug1Info.class && d.name.toLowerCase() !== drug1.toLowerCase())
    .map(d => ({
      name: d.name,
      class: d.class,
      reason: `Alternative ${drug1Info.class} that may be safer`,
      genericCost: d.genericCost,
      brandCost: d.brandCost
    }));
  
  const classAlt2 = LOCAL_DRUG_DATABASE
    .filter(d => drug2Info && d.class === drug2Info.class && d.name.toLowerCase() !== drug2.toLowerCase())
    .map(d => ({
      name: d.name,
      class: d.class,
      reason: `Alternative ${drug2Info.class} that may be safer`,
      genericCost: d.genericCost,
      brandCost: d.brandCost
    }));

  alternatives.drug1Alternatives = [
    ...alternatives.drug1Alternatives,
    ...classAlt1
  ].slice(0, 5);
  
  alternatives.drug2Alternatives = [
    ...alternatives.drug2Alternatives,
    ...classAlt2
  ].slice(0, 5);

  const seen = new Set();
  alternatives.drug1Alternatives = alternatives.drug1Alternatives.filter(a => {
    const key = a.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  alternatives.drug2Alternatives = alternatives.drug2Alternatives.filter(a => {
    const key = a.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (severity === 'contraindicated' || severity === 'major') {
    alternatives.generalAdvice = [
      'Consult your doctor before switching medications',
      'Do not stop taking prescribed medications without medical advice',
      'Discuss these alternatives at your next appointment'
    ];
  }

  return alternatives;
}

async function generateAlternativesWithAI(medications, interactions, userContext) {
  const groq = getGroqClient();
  if (!groq) {
    return null;
  }

  const medicationsList = medications.map(m => m.name || m).join(', ');
  
  const systemPrompt = `You are a clinical pharmacist helping find safer medication alternatives.

Given a drug interaction, suggest safer alternatives considering:
1. Same therapeutic class alternatives
2. Patient conditions (diabetes, kidney disease, heart conditions)
3. Pregnancy and breastfeeding status
4. Age-appropriate medications

Return JSON format:
{
  "alternatives": [
    {
      "originalDrug": "Drug that has interaction",
      "alternatives": [
        {
          "name": "Alternative drug name",
          "class": "Drug class",
          "reason": "Why this is safer",
          "considerations": "Any specific considerations for this patient"
        }
      ]
    }
  ],
  "generalAdvice": ["General advice for the patient"]
}`;

  const userPrompt = `Current medications: ${medicationsList}

Interactions found:
${interactions.map(i => `- ${i.drugs.join(' + ')} (${i.severity}): ${i.risk}`).join('\n')}

Patient context:
- Age: ${userContext.age || 'unknown'}
- Gender: ${userContext.gender || 'not specified'}
${userContext.conditions?.length ? `- Medical conditions: ${userContext.conditions.join(', ')}` : ''}
${userContext.pregnant ? '- PREGNANT - avoid certain medications' : ''}
${userContext.lactating ? '- BREASTFEEDING - check medication passage' : ''}

Suggest safer alternatives in JSON format.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content || '';
    const parsed = extractJSON(content);
    
    return parsed;
  } catch (error) {
    console.error('AI alternatives generation error:', error);
    return null;
  }
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
  const severityCounts = { contraindicated: 0, major: 0, moderate: 0, minor: 0, unknown: 0 };

  interactions.forEach((interaction) => {
    const weight = severityWeights[interaction.severity] || 10;
    totalRisk += weight;
    severityCounts[interaction.severity] = (severityCounts[interaction.severity] || 0) + 1;
  });

  const riskScore = Math.min(100, totalRisk / interactions.length);
  let riskLevel = 'safe';

  if (severityCounts.contraindicated > 0) riskLevel = 'critical';
  else if (severityCounts.major > 0) riskLevel = 'high';
  else if (severityCounts.moderate > 0) riskLevel = 'moderate';
  else if (severityCounts.minor > 0) riskLevel = 'low';

  return { riskScore, riskLevel, severityCounts };
}

function extractJSON(text) {
  let jsonStr = null;
  
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  } else {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
  }
  
  if (jsonStr) {
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('JSON parse error:', e.message);
      return null;
    }
  }
  return null;
}

async function detectInteractionsWithGroq(medications, userContext) {
  const groq = getGroqClient();
  if (!groq) {
    console.error('Groq client not initialized - no API key');
    throw new Error('Groq API not configured');
  }

  const medicationsWithTiming = medications.map(m => {
    if (typeof m === 'string') return m;
    const timing = m.timing ? ` at ${m.timing}` : '';
    return `${m.name}${timing}`;
  });
  const medicationsList = medicationsWithTiming.join(', ');
  console.log('Analyzing interactions for:', medicationsList);

  const systemPrompt = `You are a precise drug interaction checker for clinical use.

KNOWLEDGE BASE - Common dangerous drug interactions you know:

WARFARIN interactions:
- Warfarin + Aspirin/ NSAIDs = MAJOR - Increased bleeding risk
- Warfarin + Ibuprofen = MAJOR - Increased bleeding risk
- Warfarin + Antibiotics (Ciprofloxacin, etc) = MAJOR - Altered anticoagulation
- Warfarin + Antifungals (Fluconazole) = MAJOR - Increased bleeding risk

ACE INHIBITOR interactions:
- Lisinopril + Ibuprofen/NSAIDs = MAJOR - Reduced efficacy, kidney risk
- Lisinopril + Potassium = MODERATE - Hyperkalemia risk
- Lisinopril + Lithium = MAJOR - Lithium toxicity
- Lisinopril + Spironolactone = MODERATE - Hyperkalemia

SSRI + OPIOID interactions:
- Sertraline/Fluoxetine/Escitalopram + Tramadol = MAJOR - Serotonin syndrome
- SSRIs + MAOIs = CONTRAINDICATED - Life-threatening serotonin syndrome

STATIN interactions:
- Simvastatin + Amlodipine/Diltiazem/Verapamil = MAJOR - Muscle damage risk
- Simvastatin + Gemfibrozil/Clarithromycin/Itraconazole/Ketoconazole = CONTRAINDICATED - Severe myopathy

BENZODIAZEPINE interactions:
- Alprazolam + Alcohol = CONTRAINDICATED - Respiratory depression, death possible
- Alprazolam + Fluoxetine = MODERATE - Increased sedation

OTHER important interactions:
- Metformin + Alcohol = MODERATE - Lactic acidosis
- Metoprolol + Amlodipine = MODERATE - Excessive hypotension
- Clopidogrel + Omeprazole = MODERATE - Reduced effectiveness
- Digoxin + Amlodipine = MODERATE - Digoxin toxicity
- Methotrexate + Ibuprofen = MAJOR - Methotrexate toxicity
- Lithium + Ibuprofen = MAJOR - Lithium toxicity
- Metronidazole + Alcohol = CONTRAINDICATED - Disulfiram reaction
- Ciprofloxacin + Metformin = MODERATE - Blood sugar abnormalities
- Levothyroxine + Omeprazole = MINOR - Reduced absorption

TASK: Check the provided medications against this knowledge base AND your general medical knowledge for ANY interactions.

Return this JSON format EXACTLY:
{
  "interactionsFound": true/false,
  "interactions": [
    {
      "drugs": ["Drug1", "Drug2"],
      "severity": "contraindicated|major|moderate|minor",
      "risk": "Brief risk description",
      "description": "Clinical explanation",
      "mechanism": "Pharmacological mechanism",
      "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
    }
  ]
}

CRITICAL RULES:
1. If drugs match known interactions, ALWAYS report them
2. severity: contraindicated=never use together, major=high risk, moderate=monitor, minor=low risk
3. Report ALL drug pairs that have ANY known interaction
4. Be thorough - miss an interaction = patient harm
5. Include 2-3 specific, actionable recommendations for each interaction`;

  const userPrompt = `Check these medications for interactions:
${medicationsList}

Patient context:
- Age: ${userContext.age || 'unknown'}
- Gender: ${userContext.gender || 'not specified'}
${userContext.conditions?.length ? `- Medical conditions: ${userContext.conditions.join(', ')}` : ''}
${userContext.pregnant ? '- PREGNANT - some drugs are contraindicated in pregnancy' : ''}
${userContext.lactating ? '- BREASTFEEDING - some drugs pass into breastmilk' : ''}

IMPORTANT: If medications are taken at different times of day (e.g., 4+ hours apart), this may reduce interaction risk. However, some interactions can still occur regardless of timing.

Return JSON with ALL interactions found.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0,
      max_tokens: 2048,
    });

    const content = completion.choices[0]?.message?.content || '';
    console.log('Groq response:', content);

    const parsed = extractJSON(content);
    
    if (!parsed) {
      console.error('Failed to parse Groq response');
      throw new Error('Failed to parse AI response');
    }

    if (!parsed.interactionsFound || !parsed.interactions || parsed.interactions.length === 0) {
      console.log('No interactions detected by Groq');
      return [];
    }

    const defaultRecommendations = {
      contraindicated: [
        'DO NOT combine these medications under any circumstances',
        'Seek immediate medical attention if currently taking both',
        'Consult your doctor for immediate alternatives'
      ],
      major: [
        'Consult your doctor immediately before continuing',
        'Do not stop medications without medical supervision',
        'Ask about safer alternative medications'
      ],
      moderate: [
        'Monitor for symptoms and side effects',
        'Discuss timing separation with your pharmacist',
        'Schedule a medication review within one week'
      ],
      minor: [
        'Be aware of potential mild effects',
        'Continue regular monitoring',
        'Inform your doctor of all medications'
      ],
      unknown: [
        'Consult your healthcare provider for personalized advice',
        'Monitor for any unusual symptoms'
      ]
    };

    return parsed.interactions.map((intx, idx) => {
      const severity = intx.severity || 'unknown';
      return {
        id: idx + 1,
        drugs: intx.drugs,
        severity: severity,
        risk: intx.risk || 'Potential interaction',
        description: intx.description || '',
        mechanism: intx.mechanism || '',
        recommendations: intx.recommendations || defaultRecommendations[severity] || defaultRecommendations.unknown,
        source: 'groq',
      };
    });
  } catch (error) {
    console.error('Groq error:', error.message);
    throw error;
  }
}

async function generateSummaryWithGroq(medications, interactions, userContext) {
  const groq = getGroqClient();
  if (!groq) {
    throw new Error('Groq API not configured');
  }

  const medicationsList = medications.map(m => m.name || m).join(', ');
  const hasInteractions = interactions.length > 0;
  const severityCounts = { contraindicated: 0, major: 0, moderate: 0, minor: 0 };
  
  interactions.forEach(i => {
    severityCounts[i.severity] = (severityCounts[i.severity] || 0) + 1;
  });

  const systemPrompt = `You are a clinical pharmacist. Provide clear, actionable advice about drug interactions.

Return JSON:
{
  "summary": "2-3 sentence overview of the interaction risks",
  "keyConcerns": ["specific concern 1", "specific concern 2"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2"],
  "riskExplanation": "explain the overall risk level",
  "alerts": ["urgent alert if needed"]
}`;

  const userPrompt = `Medications: ${medicationsList}
${hasInteractions ? `Interactions: ${interactions.map(i => `${i.drugs.join(' + ')} (${i.severity}): ${i.risk}`).join('; ')}` : 'No interactions detected'}
Patient: ${userContext.gender || 'Not specified'}, ${userContext.age || '?'} years old
${userContext.pregnant ? 'PREGNANT - extra caution needed' : ''}
${userContext.lactating ? 'BREASTFEEDING - check medication passage in breastmilk' : ''}

Generate JSON summary.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content || '';
    const parsed = extractJSON(content);

    if (parsed) {
      return {
        success: true,
        summary: parsed.summary || 'Analysis complete.',
        keyConcerns: parsed.keyConcerns || [],
        personalizedAdvice: parsed.recommendations || [],
        riskExplanation: parsed.riskExplanation || '',
        alerts: parsed.alerts || [],
        overview: parsed.summary || 'Analysis complete.',
        source: 'groq',
      };
    }

    throw new Error('Failed to parse summary response');
  } catch (error) {
    console.error('Summary generation error:', error.message);
    throw error;
  }
}

export async function analyzeInteractions(req, res) {
  try {
    const { medications, userContext = {} } = req.body;

    if (!medications || medications.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 medications required',
      });
    }

    const drugDetails = medications.map(m => typeof m === 'string' ? { name: m } : m);

    console.log('=== Starting Drug Interaction Analysis ===');
    console.log('Medications:', drugDetails.map(m => m.name).join(', '));

    const interactions = await detectInteractionsWithGroq(drugDetails, userContext);
    console.log('Detected interactions:', interactions.length);

    const { riskScore, riskLevel, severityCounts } = calculateRisk(interactions);
    console.log('Risk level:', riskLevel);

    const aiAnalysis = await generateSummaryWithGroq(drugDetails, interactions, userContext);

    let alternatives = null;
    const moderateOrSevereInteractions = interactions.filter(
      i => ['contraindicated', 'major', 'moderate'].includes(i.severity)
    );

    if (moderateOrSevereInteractions.length > 0) {
      console.log('Generating alternatives for', moderateOrSevereInteractions.length, 'interactions...');
      
      const interactionsWithAlternatives = moderateOrSevereInteractions.map(interaction => {
        const smartAlts = getSmartAlternatives(interaction);
        return {
          ...interaction,
          alternatives: smartAlts
        };
      });

      const aiAlts = await generateAlternativesWithAI(drugDetails, moderateOrSevereInteractions, userContext);

      alternatives = {
        interactionAlternatives: interactionsWithAlternatives,
        aiSuggestions: aiAlts,
        hasAlternatives: interactionsWithAlternatives.some(i => 
          i.alternatives.drug1Alternatives.length > 0 || 
          i.alternatives.drug2Alternatives.length > 0
        )
      };
    }

    console.log('=== Analysis Complete ===');

    const finalInteractions = interactions.map(interaction => {
      const altData = alternatives?.interactionAlternatives?.find(
        alt => alt.id === interaction.id
      );
      if (altData) {
        return {
          ...interaction,
          alternatives: altData.alternatives
        };
      }
      return interaction;
    });

    res.json({
      success: true,
      interactions: finalInteractions,
      alternatives,
      aiAnalysis,
      medications: drugDetails,
      summary: {
        riskLevel,
        riskScore,
        riskPercentage: Math.round(riskScore),
        totalInteractions: interactions.length,
        severityBreakdown: severityCounts,
        message: interactions.length === 0
          ? 'No significant interactions detected'
          : `${interactions.length} interaction(s) found - ${riskLevel} risk`,
        interactionSource: 'groq',
        hasAlternatives: alternatives?.hasAlternatives || false,
      },
    });
  } catch (error) {
    console.error('Analyze Error:', error);
    res.status(500).json({
      success: false,
      error: 'Analysis failed: ' + error.message,
      message: error.message,
    });
  }
}
