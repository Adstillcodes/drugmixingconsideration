import { CreateMLCEngine } from '@mlc-ai/web-llm';

const WebLLMModel = 'Llama-3.2-3B-Instruct-q4f16_1-MLC';

let engine = null;
let isModelLoaded = false;
let isLoading = false;

export async function initializeAIEngine(onProgress) {
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

export async function generateAnalysisSummary(analysisResults, userData, onProgress) {
  const { interactions = [], summary = {} } = analysisResults;
  const medications = analysisResults.medications || userData.medications || [];

  if (!engine) {
    await initializeAIEngine(onProgress);
  }

  if (!engine) {
    return generateFallbackSummary({ ...analysisResults, medications, summary }, userData);
  }

  const medicationsList = medications.length > 0
    ? medications.map((m) => `${m.name}${m.dosage ? ` (${m.dosage})` : ''}`).join(', ')
    : 'No medications specified';

  const interactionsList = interactions
    .map((i) => `${i.drugs.join(' + ')}: ${i.severity} - ${i.risk}`)
    .join('; ');

  const systemPrompt = `You are a clinical pharmacist assistant providing a clear, empathetic summary of drug interactions.
Format your response as JSON with this exact structure:
{
  "summary": "A 2-3 sentence overview of the patient's medication safety",
  "keyConcerns": ["Concern 1", "Concern 2", "Concern 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "riskExplanation": "Explanation of the overall risk level",
  "alerts": ["Urgent alert if any", "Optional additional alert"]
}

Be concise, empathetic, and clinically accurate. Prioritize patient safety.`;

  const userPrompt = `Patient Context:
- Medications: ${medicationsList}
- Demographics: ${userData.gender || 'Not specified'}, Age: ${userData.age || 'Not specified'}
- Conditions: ${userData.conditions?.length > 0 ? userData.conditions.join(', ') : 'None specified'}
- Pregnancy Status: ${userData.pregnant ? 'Yes' : 'Not pregnant'}
- Breastfeeding: ${userData.lactating ? 'Yes' : 'Not breastfeeding'}

Interaction Analysis Results:
- Overall Risk Level: ${summary.riskLevel}
- Total Interactions Found: ${interactions.length}
${interactions.length > 0 ? `- Interactions: ${interactionsList}` : '- No significant interactions detected'}

Generate a clear, patient-friendly summary.`;

  try {
    const response = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          summary: parsed.summary || generateFallbackSummary(analysisResults, userData).summary,
          keyConcerns: parsed.keyConcerns || [],
          personalizedAdvice: parsed.recommendations || [],
          riskExplanation: parsed.riskExplanation || '',
          alerts: parsed.alerts || [],
          source: 'webllm',
        };
      } catch (e) {
        console.warn('Failed to parse JSON from WebLLM:', e);
      }
    }

    return generateFallbackSummary(analysisResults, userData);
  } catch (error) {
    console.error('AI summary generation error:', error);
    return generateFallbackSummary(analysisResults, userData);
  }
}

function generateFallbackSummary(analysisResults, userData) {
  const { interactions = [], summary = {} } = analysisResults;
  const medications = analysisResults.medications || userData.medications || [];

  let summaryText = '';
  const keyConcerns = [];
  const personalizedAdvice = [];
  const alerts = [];

  if (interactions.length === 0) {
    summaryText = `Based on our analysis of your ${medications.length} medications, no significant drug interactions were detected. Your current medication combination appears to be generally safe when taken as prescribed.`;
    keyConcerns.push('No significant interactions found');
    personalizedAdvice.push('Continue taking medications as prescribed');
    personalizedAdvice.push('Report any unusual symptoms to your doctor');
    personalizedAdvice.push('Keep a current list of all medications for healthcare visits');
  } else if (summary.riskLevel === 'critical' || summary.riskLevel === 'high') {
    const severeInteractions = interactions.filter(
      (i) => i.severity === 'contraindicated' || i.severity === 'major'
    );
    summaryText = `⚠️ Alert: We detected ${severeInteractions.length} serious interaction(s) that require immediate medical attention. Some combinations may be harmful and should not be taken together without consulting your healthcare provider.`;

    severeInteractions.forEach((i) => {
      keyConcerns.push(`${i.drugs.join(' + ')}: ${i.risk}`);
    });

    alerts.push('Consult your healthcare provider immediately');
    personalizedAdvice.push('Do not combine these medications without medical supervision');
    personalizedAdvice.push('Consider visiting urgent care if experiencing adverse effects');
  } else if (summary.riskLevel === 'moderate') {
    summaryText = `We found ${interactions.length} moderate interaction(s) between your medications. While not immediately dangerous, these combinations should be monitored and discussed with your healthcare provider.`;

    interactions.forEach((i) => {
      keyConcerns.push(`${i.drugs.join(' + ')}: ${i.risk}`);
    });

    personalizedAdvice.push('Schedule a consultation with your doctor');
    personalizedAdvice.push('Monitor for specific symptoms listed in the details');
    personalizedAdvice.push('Do not stop medications without medical advice');
  } else {
    summaryText = `Your medication combination shows ${interactions.length} minor interaction(s) that are generally manageable with awareness and appropriate monitoring.`;

    interactions.forEach((i) => {
      keyConcerns.push(`${i.drugs.join(' + ')}: ${i.risk} (minor)`);
    });

    personalizedAdvice.push('Be aware of potential mild effects');
    personalizedAdvice.push('Continue regular check-ups');
    personalizedAdvice.push('Inform all healthcare providers about your medications');
  }

  if (userData.pregnant) {
    alerts.unshift('⚠️ Pregnancy detected: Consult your OB/GYN about medication safety');
  }

  if (userData.lactating) {
    alerts.unshift('⚠️ Breastfeeding: Some medications may pass through breast milk');
  }

  return {
    success: true,
    summary: summaryText,
    keyConcerns,
    personalizedAdvice,
    riskExplanation: `Risk Level: ${summary.riskLevel?.toUpperCase() || 'UNKNOWN'} (${summary.riskPercentage || 0}% risk score)`,
    alerts,
    source: 'fallback',
  };
}

export async function generateReportContent(analysisResults, aiAnalysis, userData) {
  const { interactions, medications, summary } = analysisResults;

  if (!engine) {
    await initializeAIEngine();
  }

  if (!engine) {
    return generateFallbackReport(analysisResults, aiAnalysis, userData);
  }

  const systemPrompt = `You are a clinical pharmacist generating a comprehensive medication report.
Generate a detailed HTML-formatted report with sections:
1. Executive Summary
2. Medication List with Dosages
3. Drug Interactions (if any)
4. Personalized Recommendations
5. Safety Alerts
6. Disclaimer

Format as clean HTML with inline styles using colors:
- Red (#D32F2F) for critical/contraindicated
- Orange (#F97316) for major interactions
- Yellow (#EAB308) for moderate
- Green (#22C55E) for safe/minor

Return ONLY valid HTML content, no markdown or code blocks.`;

  const medicationsList = medications
    .map((m) => `<li><strong>${m.name}</strong> - ${m.dosage || 'Dosage not specified'}</li>`)
    .join('');

  const interactionsList = interactions.length > 0
    ? interactions
        .map(
          (i) => `
        <li style="margin-bottom: 12px; padding: 12px; border-radius: 8px; background: ${
          i.severity === 'contraindicated' ? '#FEE2E2' :
          i.severity === 'major' ? '#FFEDD5' :
          i.severity === 'moderate' ? '#FEF9C3' : '#DCFCE7'
        }">
          <strong>${i.drugs.join(' + ')}</strong> (${i.severity.toUpperCase()})<br>
          <em>${i.risk}</em><br>
          ${i.description}
        </li>`
        )
        .join('')
    : '<li style="color: #22C55E;">No significant drug interactions detected</li>';

  const userPrompt = `
Patient: ${userData.gender === 'female' ? 'Female' : userData.gender === 'male' ? 'Male' : 'Not specified'}, Age ${userData.age || 'not specified'}
Conditions: ${userData.conditions?.join(', ') || 'None'}
Pregnant: ${userData.pregnant ? 'Yes' : 'No'}
Breastfeeding: ${userData.lactating ? 'Yes' : 'No'}

Medications:
${medicationsList}

Interactions (${interactions.length} found):
Risk Level: ${summary.riskLevel}

${interactionsList}

AI Analysis Summary: ${aiAnalysis?.summary || 'N/A'}
Key Concerns: ${aiAnalysis?.keyConcerns?.join('; ') || 'N/A'}
Recommendations: ${aiAnalysis?.personalizedAdvice?.join('; ') || 'N/A'}
`;

  try {
    const response = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const content = response.choices[0].message.content;
    const htmlMatch = content.match(/<html[\s\S]*<\/html>/i) || content.match(/<body[\s\S]*<\/body>/i);

    if (htmlMatch) {
      return {
        success: true,
        html: wrapReportHtml(htmlMatch[0], analysisResults, aiAnalysis, userData),
        source: 'webllm',
      };
    }

    return {
      success: true,
      html: generateFallbackReport(analysisResults, aiAnalysis, userData),
      source: 'fallback',
    };
  } catch (error) {
    console.error('Report generation error:', error);
    return {
      success: true,
      html: generateFallbackReport(analysisResults, aiAnalysis, userData),
      source: 'fallback',
    };
  }
}

function generateFallbackReport(analysisResults, aiAnalysis, userData) {
  const { interactions, medications, summary } = analysisResults;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>MediSafe Medication Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #1a56db; border-bottom: 2px solid #1a56db; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; }
    .risk-critical { background: #FEE2E2; border-left: 4px solid #D32F2F; padding: 15px; margin: 15px 0; }
    .risk-major { background: #FFEDD5; border-left: 4px solid #F97316; padding: 15px; margin: 15px 0; }
    .risk-moderate { background: #FEF9C3; border-left: 4px solid #EAB308; padding: 15px; margin: 15px 0; }
    .risk-safe { background: #DCFCE7; border-left: 4px solid #22C55E; padding: 15px; margin: 15px 0; }
    .medication-item { padding: 10px; border-bottom: 1px solid #e5e7eb; }
    .disclaimer { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 30px; font-size: 12px; color: #6b7280; }
    ul { line-height: 1.8; }
  </style>
</head>
<body>
  <h1>📋 MediSafe Medication Analysis Report</h1>
  <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
  <p><strong>Patient:</strong> ${userData.gender || 'Not specified'}, Age: ${userData.age || 'Not specified'}</p>

  <h2>Overall Risk Assessment</h2>
  <div class="risk-${summary.riskLevel === 'critical' ? 'critical' : summary.riskLevel === 'high' || summary.riskLevel === 'major' ? 'major' : summary.riskLevel === 'moderate' ? 'moderate' : 'safe'}">
    <strong>Risk Level: ${summary.riskLevel?.toUpperCase() || 'UNKNOWN'}</strong>
    <p>${aiAnalysis?.summary || summary.message || 'No summary available.'}</p>
  </div>

  <h2>Your Medications (${medications.length})</h2>
  ${medications.map(m => `
    <div class="medication-item">
      <strong>${m.name}</strong>
      <span style="color: #6b7280;"> - ${m.dosage || 'Dosage not specified'}</span>
      ${m.category ? `<br><small style="color: #9ca3af;">Category: ${m.category}</small>` : ''}
    </div>
  `).join('')}

  <h2>Detected Interactions (${interactions.length})</h2>
  ${interactions.length === 0 ? '<p style="color: #22C55E;">No significant drug interactions detected.</p>' :
    interactions.map(i => `
      <div class="risk-${i.severity === 'contraindicated' ? 'critical' : i.severity === 'major' ? 'major' : i.severity === 'moderate' ? 'moderate' : 'safe'}">
        <strong>${i.drugs.join(' + ')}</strong> (${i.severity.toUpperCase()})<br>
        <em>${i.risk}</em>
        <p>${i.description || i.mechanism || ''}</p>
      </div>
    `).join('')}

  ${aiAnalysis?.keyConcerns?.length > 0 ? `
    <h2>Key Concerns</h2>
    <ul>${aiAnalysis.keyConcerns.map(c => `<li>${c}</li>`).join('')}</ul>
  ` : ''}

  ${aiAnalysis?.personalizedAdvice?.length > 0 ? `
    <h2>Recommendations</h2>
    <ul>${aiAnalysis.personalizedAdvice.map(r => `<li>${r}</li>`).join('')}</ul>
  ` : ''}

  ${aiAnalysis?.alerts?.length > 0 ? `
    <h2>⚠️ Safety Alerts</h2>
    <ul>${aiAnalysis.alerts.map(a => `<li style="color: #D32F2F;"><strong>${a}</strong></li>`).join('')}</ul>
  ` : ''}

  <div class="disclaimer">
    <strong>Important Disclaimer:</strong>
    This analysis is for informational purposes only and does not replace professional medical advice.
    Always consult with a qualified healthcare provider before making any changes to your medication regimen.
    If you are experiencing any adverse effects, seek medical attention immediately.
  </div>
</body>
</html>`;
}

function wrapReportHtml(content, analysisResults, aiAnalysis, userData) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>MediSafe Medication Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .report-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
    .disclaimer { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 30px; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="report-header">
    <h1>📋 MediSafe Medication Report</h1>
    <p>Generated: ${new Date().toLocaleDateString()}</p>
    <p>Patient: ${userData.gender || 'Not specified'}, Age: ${userData.age || 'Not specified'}</p>
  </div>
  ${content}
  <div class="disclaimer">
    <strong>Important Disclaimer:</strong>
    This analysis is for informational purposes only and does not replace professional medical advice.
    Always consult with a qualified healthcare provider before making any changes to your medication regimen.
  </div>
</body>
</html>`;
}

export function isAIEngineReady() {
  return isModelLoaded && engine !== null;
}

export function resetAIEngine() {
  if (engine) {
    engine.terminate?.();
  }
  engine = null;
  isModelLoaded = false;
  isLoading = false;
}
