import { useState, useCallback } from 'react';

const WebLLMModel = 'Llama-3.2-3B-Instruct-q4f16_1-MLC';

export function useWebLLM() {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [interceptor, setInterceptor] = useState(null);

  const initializeModel = useCallback(async () => {
    if (isReady || isLoading) return;

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      const { Pipeline, pipeline } = await import('@huggingface/progress');

      const { MLCEngine } = await import('@mlc-ai/web-llm');
      
      const engine = new MLCEngine();

      engine.on('progress', (progressData) => {
        if (progressData.progress) {
          setProgress(Math.round(progressData.progress));
        }
      });

      setInterceptor(engine);
      
      await engine.reload(WebLLMModel);
      
      setIsReady(true);
      setProgress(100);
    } catch (err) {
      console.error('WebLLM initialization error:', err);
      setError('Failed to load AI model. Analysis will use standard database lookups.');
    } finally {
      setIsLoading(false);
    }
  }, [isReady, isLoading]);

  const generateAnalysis = useCallback(async (drugs, interactions, userContext) => {
    if (!isReady || !interceptor) {
      return generateFallbackAnalysis(drugs, interactions, userContext);
    }

    try {
      const prompt = buildAnalysisPrompt(drugs, interactions, userContext);
      
      const response = await interceptor.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful clinical pharmacist assistant. Provide clear, accurate health information in plain language. Always remind users to consult healthcare professionals.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return {
        success: true,
        analysis: response.choices[0].message.content,
        model: 'WebLLM (Local)',
      };
    } catch (err) {
      console.error('WebLLM generation error:', err);
      return generateFallbackAnalysis(drugs, interactions, userContext);
    }
  }, [isReady, interceptor]);

  const generateFallbackAnalysis = (drugs, interactions, userContext) => {
    let analysis = `# Medication Safety Analysis\n\n`;
    analysis += `## Your Medications\n`;
    drugs.forEach((drug, i) => {
      analysis += `${i + 1}. **${drug.name}** (${drug.category || 'Unknown category'})${drug.dosage ? ` - ${drug.dosage}` : ''}\n`;
    });
    analysis += `\n`;

    if (interactions.length === 0) {
      analysis += `## Summary\n`;
      analysis += `**Good news!** No significant drug interactions were detected between your current medications.\n\n`;
      analysis += `### General Recommendations\n`;
      analysis += `- Continue taking your medications as prescribed\n`;
      analysis += `- Take medications at the same time each day\n`;
      analysis += `- Keep a list of all your medications to share with healthcare providers\n`;
    } else {
      analysis += `## Detected Interactions\n\n`;
      
      const highSeverity = interactions.filter(i => i.severity === 'major' || i.severity === 'contraindicated');
      const moderateSeverity = interactions.filter(i => i.severity === 'moderate');
      const minorSeverity = interactions.filter(i => i.severity === 'minor' || i.severity === 'unknown');

      if (highSeverity.length > 0) {
        analysis += `### ⚠️ High Priority Interactions\n`;
        highSeverity.forEach((interaction, i) => {
          analysis += `**${i + 1}. ${interaction.drugs.join(' & ')}**\n`;
          analysis += `- Risk: ${interaction.risk}\n`;
          analysis += `- ${interaction.description}\n\n`;
        });
      }

      if (moderateSeverity.length > 0) {
        analysis += `### ⚡ Moderate Priority Interactions\n`;
        moderateSeverity.forEach((interaction, i) => {
          analysis += `**${i + 1}. ${interaction.drugs.join(' & ')}**\n`;
          analysis += `- Risk: ${interaction.risk}\n`;
          analysis += `- ${interaction.description}\n\n`;
        });
      }

      if (minorSeverity.length > 0) {
        analysis += `### ℹ️ Lower Priority Interactions\n`;
        minorSeverity.forEach((interaction, i) => {
          analysis += `**${i + 1}. ${interaction.drugs.join(' & ')}**\n`;
          analysis += `- Risk: ${interaction.risk}\n\n`;
        });
      }

      analysis += `## Recommendations\n`;
      analysis += `Based on the detected interactions:\n\n`;
      
      const allRecommendations = interactions.flatMap(i => i.recommendations || []);
      const uniqueRecommendations = [...new Set(allRecommendations)];
      uniqueRecommendations.slice(0, 5).forEach((rec, i) => {
        analysis += `${i + 1}. ${rec}\n`;
      });
    }

    if (userContext.gender === 'female') {
      analysis += `\n## Women's Health Considerations\n`;
      if (userContext.pregnant) {
        analysis += `⚠️ **Important:** You indicated you may be pregnant. Some medications can be harmful during pregnancy.\n`;
        analysis += `- Please consult with your OB/GYN before taking any new medications\n`;
        analysis += `- Some medications may need to be adjusted during pregnancy\n`;
      }
      if (userContext.lactating) {
        analysis += `⚠️ **Important:** You indicated you may be breastfeeding. Some medications can pass through breast milk.\n`;
        analysis += `- Consult your doctor about medication safety while breastfeeding\n`;
        analysis += `- Some medications may affect milk production or pass to the baby\n`;
      }
    }

    analysis += `\n---\n`;
    analysis += `**Disclaimer:** This analysis is for informational purposes only. Always consult with a qualified healthcare professional before making any changes to your medication regimen.\n`;

    return {
      success: true,
      analysis,
      model: 'Rule-based Analysis',
    };
  };

  const reset = useCallback(() => {
    if (interceptor) {
      interceptor.terminate?.();
    }
    setIsReady(false);
    setProgress(0);
    setError(null);
  }, [interceptor]);

  return {
    initializeModel,
    generateAnalysis,
    isLoading,
    isReady,
    error,
    progress,
    reset,
  };
}

function buildAnalysisPrompt(drugs, interactions, userContext) {
  let prompt = `Please analyze the following medication combination for a patient:\n\n`;
  
  prompt += `## Patient Information\n`;
  prompt += `- Gender: ${userContext.gender || 'Not specified'}\n`;
  if (userContext.gender === 'female') {
    prompt += `- Pregnancy Status: ${userContext.pregnant ? 'Pregnant' : 'Not pregnant'}\n`;
    prompt += `- Lactation Status: ${userContext.lactating ? 'Breastfeeding' : 'Not breastfeeding'}\n`;
  }
  prompt += `- Age: ${userContext.age || 'Not specified'}\n`;
  prompt += `- Conditions: ${userContext.conditions?.join(', ') || 'None specified'}\n\n`;

  prompt += `## Current Medications\n`;
  drugs.forEach((drug, i) => {
    prompt += `${i + 1}. ${drug.name} (${drug.category || 'Unknown category'})\n`;
  });
  prompt += `\n`;

  if (interactions.length > 0) {
    prompt += `## Detected Drug Interactions\n`;
    interactions.forEach((interaction, i) => {
      prompt += `${i + 1}. **${interaction.drugs.join(' + ')}**\n`;
      prompt += `   - Severity: ${interaction.severity}\n`;
      prompt += `   - Risk: ${interaction.risk}\n`;
      prompt += `   - Description: ${interaction.description}\n\n`;
    });
  } else {
    prompt += `## Drug Interactions\n`;
    prompt += `No significant interactions were detected in the database.\n\n`;
  }

  prompt += `Please provide:\n`;
  prompt += `1. A clear summary of any concerns\n`;
  prompt += `2. Plain-language explanation of interactions\n`;
  prompt += `3. Practical recommendations for the patient\n`;
  prompt += `4. When they should seek medical attention\n\n`;
  prompt += `Use simple, non-technical language that a general patient can understand.\n`;

  return prompt;
}

export default useWebLLM;
