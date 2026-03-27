import { createContext, useContext, useState, useCallback } from 'react';
import { checkDrugInteractions } from '../services/rxlabelguard';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentScreen, setCurrentScreen] = useState('intake');
  const [userData, setUserData] = useState({
    prescriptionType: null,
    gender: '',
    age: '',
    pregnant: null,
    lactating: null,
    medications: [],
    conditions: [],
    prescriptionFile: null,
  });
  const [analysisResults, setAnalysisResults] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [error, setError] = useState(null);

  const updateUserData = (updates) => {
    setUserData((prev) => ({ ...prev, ...updates }));
  };

  const addMedication = (medication) => {
    if (!userData.medications.find((m) => m.name === medication.name)) {
      setUserData((prev) => ({
        ...prev,
        medications: [...prev.medications, medication],
      }));
    }
  };

  const removeMedication = (medicationName) => {
    setUserData((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m.name !== medicationName),
    }));
  };

  const addCondition = (condition) => {
    if (!userData.conditions.includes(condition)) {
      setUserData((prev) => ({
        ...prev,
        conditions: [...prev.conditions, condition],
      }));
    }
  };

  const removeCondition = (condition) => {
    setUserData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((c) => c !== condition),
    }));
  };

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
  };

  const clearAnalysis = () => {
    setAnalysisResults(null);
    setAiAnalysis(null);
    setSelectedInteraction(null);
    setError(null);
  };

  const startAnalysis = useCallback(async (medications, conditions) => {
    if (!medications || medications.length < 2) {
      setError('Please add at least 2 medications to analyze interactions.');
      return;
    }

    setIsProcessing(true);
    setProcessingStep(0);
    setProcessingMessage('Initializing analysis...');
    setError(null);

    try {
      setProcessingStep(10);
      setProcessingMessage('Connecting to FDA drug database...');
      await sleep(300);

      setProcessingStep(25);
      setProcessingMessage('Analyzing medication combinations...');
      await sleep(300);

      setProcessingStep(40);
      setProcessingMessage('Checking for drug-drug interactions...');
      
      const userContext = {
        gender: userData.gender,
        age: userData.age,
        pregnant: userData.pregnant,
        lactating: userData.lactating,
        conditions: conditions || userData.conditions,
      };

      const result = await checkDrugInteractions(medications, userContext);
      
      setProcessingStep(60);
      setProcessingMessage('Processing results...');
      await sleep(300);

      if (!result.success) {
        throw new Error('Analysis failed');
      }

      setProcessingStep(75);
      setProcessingMessage('Generating AI-powered insights...');
      
      const aiInsights = generateAIInsights(result, medications, userContext);
      setAiAnalysis(aiInsights);

      setProcessingStep(90);
      setProcessingMessage('Finalizing report...');
      await sleep(300);

      setProcessingStep(100);
      setProcessingMessage('Analysis complete!');

      setAnalysisResults({
        ...result,
        medications: medications,
        analyzedAt: new Date().toISOString(),
        userContext: userContext,
      });

      await sleep(500);

      setIsProcessing(false);
      setCurrentScreen('results');
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze medications. Please try again.');
      setIsProcessing(false);
      setCurrentScreen('intake');
    }
  }, [userData, setCurrentScreen]);

  const resetAnalysis = () => {
    clearAnalysis();
    setCurrentScreen('intake');
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen: navigateTo,
        userData,
        updateUserData,
        addMedication,
        removeMedication,
        addCondition,
        removeCondition,
        analysisResults,
        setAnalysisResults,
        aiAnalysis,
        setAiAnalysis,
        selectedInteraction,
        setSelectedInteraction,
        isProcessing,
        setIsProcessing,
        processingStep,
        processingMessage,
        startAnalysis,
        clearAnalysis,
        resetAnalysis,
        error,
        setError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateAIInsights(results, medications, userContext) {
  const { summary, interactions } = results;
  
  let insights = {
    overview: '',
    keyConcerns: [],
    personalizedAdvice: [],
    riskExplanation: '',
  };

  if (summary.riskLevel === 'safe' || summary.riskLevel === 'low') {
    insights.overview = `Good news! Based on our analysis of ${medications.length} medications, no significant interactions were detected. Your medication combination appears to be generally safe.`;
    
    insights.keyConcerns = [
      'Continue taking medications as prescribed',
      'Report any unusual symptoms to your doctor',
      'Keep a list of all medications for healthcare visits',
    ];
    
    insights.personalizedAdvice = [
      'Take each medication at the recommended time',
      'Maintain consistent dosing schedule',
      'Stay hydrated and maintain a healthy lifestyle',
    ];
  } else if (summary.riskLevel === 'moderate') {
    insights.overview = `We found ${summary.totalInteractions} moderate interaction(s) between your medications. While not immediately dangerous, these combinations should be monitored.`;
    
    insights.keyConcerns = interactions
      .filter(i => i.severity === 'moderate')
      .map(i => `${i.drugs[0]} + ${i.drugs[1]}: ${i.risk}`);
    
    insights.personalizedAdvice = [
      'Schedule a consultation with your doctor',
      'Monitor for specific symptoms listed in the details',
      'Do not stop medications without medical advice',
    ];
  } else if (summary.riskLevel === 'high' || summary.riskLevel === 'critical') {
    const severity = summary.riskLevel === 'critical' ? 'serious' : 'significant';
    insights.overview = `⚠️ Alert: We detected ${summary.totalInteractions} ${severity} interaction(s) that require immediate attention. Some combinations may be harmful.`;
    
    insights.keyConcerns = interactions
      .filter(i => i.severity === 'major' || i.severity === 'contraindicated')
      .map(i => `${i.drugs[0]} + ${i.drugs[1]}: ${i.risk} (${i.severity.toUpperCase()})`);
    
    insights.personalizedAdvice = [
      'Contact your healthcare provider immediately',
      'Do not combine these medications without medical supervision',
      'Consider the alternative medications suggested',
    ];
  }

  if (userContext.gender === 'female' && (userContext.pregnant || userContext.lactating)) {
    insights.personalizedAdvice.unshift(
      'Important: Given your pregnancy/breastfeeding status, consult your OB/GYN before making any medication changes.'
    );
  }

  if (userContext.conditions?.length > 0) {
    insights.riskExplanation = `Your listed conditions (${userContext.conditions.join(', ')}) have been factored into this analysis.`;
  }

  return insights;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
