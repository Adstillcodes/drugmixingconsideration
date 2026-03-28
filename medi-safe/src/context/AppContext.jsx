import { createContext, useContext, useState, useCallback } from 'react';
import { checkDrugInteractions } from '../services/rxlabelguard';
import { generateAnalysisSummary, initializeAIEngine } from '../services/aiSummary';

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
  const [aiDownloadProgress, setAiDownloadProgress] = useState(0);
  const [isAiDownloading, setIsAiDownloading] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [error, setError] = useState(null);

  const updateUserData = useCallback((updates) => {
    setUserData((prev) => ({ ...prev, ...updates }));
  }, []);

  const addMedication = useCallback((medication) => {
    setUserData((prev) => {
      if (prev.medications.find((m) => m.name === medication.name)) {
        return prev;
      }
      return {
        ...prev,
        medications: [...prev.medications, medication],
      };
    });
  }, []);

  const removeMedication = useCallback((medicationName) => {
    setUserData((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m.name !== medicationName),
    }));
  }, []);

  const addCondition = useCallback((condition) => {
    setUserData((prev) => {
      if (prev.conditions.includes(condition)) {
        return prev;
      }
      return {
        ...prev,
        conditions: [...prev.conditions, condition],
      };
    });
  }, []);

  const removeCondition = useCallback((condition) => {
    setUserData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((c) => c !== condition),
    }));
  }, []);

  const navigateTo = useCallback((screen) => {
    setCurrentScreen(screen);
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysisResults(null);
    setAiAnalysis(null);
    setSelectedInteraction(null);
    setError(null);
  }, []);

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
      setProcessingMessage('Connecting to drug database...');
      await sleep(200);

      setProcessingStep(20);
      setProcessingMessage('Analyzing medication combinations...');
      await sleep(200);

      setProcessingStep(30);
      setProcessingMessage('Checking for drug-drug interactions...');

      const userContext = {
        gender: userData.gender,
        age: userData.age,
        pregnant: userData.pregnant,
        lactating: userData.lactating,
        conditions: conditions || userData.conditions,
      };

      const result = await checkDrugInteractions(medications, userContext);

      setProcessingStep(50);
      setProcessingMessage('Processing results...');
      await sleep(200);

      if (!result.success) {
        throw new Error('Analysis failed');
      }

      setProcessingStep(60);
      setProcessingMessage('Initializing AI engine...');
      
      setIsAiDownloading(true);
      setAiDownloadProgress(0);
      
      await initializeAIEngine((progress) => {
        setAiDownloadProgress(progress);
      });

      setIsAiDownloading(false);
      setProcessingStep(70);
      setProcessingMessage('Generating AI-powered insights...');
      await sleep(200);

      const aiInsights = await generateAnalysisSummary(result, { ...userData, conditions, medications });

      setAiAnalysis(aiInsights);

      setProcessingStep(90);
      setProcessingMessage('Finalizing report...');
      await sleep(200);

      setProcessingStep(100);
      setProcessingMessage('Analysis complete!');

      setAnalysisResults({
        ...result,
        medications: medications,
        analyzedAt: new Date().toISOString(),
        userContext: userContext,
      });

      await sleep(300);

      setIsProcessing(false);
      setCurrentScreen('results');
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze medications. Please try again.');
      setIsProcessing(false);
      setCurrentScreen('intake');
    }
  }, [userData, setCurrentScreen]);

  const resetAnalysis = useCallback(() => {
    clearAnalysis();
    setCurrentScreen('intake');
  }, [clearAnalysis, setCurrentScreen]);

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
        aiDownloadProgress,
        isAiDownloading,
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
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
