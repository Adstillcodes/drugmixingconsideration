import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';

export default function ProcessingScreen() {
  const { t } = useTranslation();
  const { processingStep, setCurrentScreen, userData, aiDownloadProgress, isAiDownloading } = useApp();
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const messages = [
      t('processing.title'),
      'Checking drug interactions...',
      'Cross-referencing FDA database...',
      'Evaluating safety profiles...',
      'Generating personalized report...',
    ];
    
    const interval = setInterval(() => {
      const index = Math.min(Math.floor(processingStep / 20), messages.length - 1);
      setStatusMessage(messages[index]);
    }, 500);

    return () => clearInterval(interval);
  }, [processingStep, t]);

  useEffect(() => {
    if (processingStep >= 100) {
      const timer = setTimeout(() => {
        setCurrentScreen('results');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [processingStep, setCurrentScreen]);

  const displayProgress = isAiDownloading ? aiDownloadProgress : processingStep;
  const isDownloading = isAiDownloading;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-surface-container-lowest rounded-[24px] p-12 shadow-xl border border-surface-container-high text-center">
        {/* Animated Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center relative">
            {isDownloading ? (
              <>
                <span className="material-symbols-outlined text-primary text-5xl animate-pulse">
                  download
                </span>
                <div 
                  className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
                  style={{ animationDuration: '1s' }}
                />
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-primary text-5xl animate-pulse">
                  analytics
                </span>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </>
            )}
          </div>
        </div>

        {/* Status Message */}
        <h2 className="text-3xl font-bold text-on-surface mb-4">
          {isDownloading 
            ? t('processing.downloadingAI') 
            : (statusMessage || t('processing.title'))
          }
        </h2>
        <p className="text-on-surface/60 text-lg mb-2">
          {isDownloading 
            ? t('processing.downloadingAISubtitle')
            : t('processing.subtitle')
          }
        </p>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-4">
          <div className="h-4 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                isDownloading 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                  : 'bg-gradient-to-r from-primary to-primary-container'
              }`}
              style={{ width: `${displayProgress}%` }}
            />
          </div>
          <p className="text-sm text-on-surface/50 mt-2">
            {displayProgress}% {isDownloading ? 'downloaded' : 'complete'}
          </p>
        </div>

        {/* Download Info for AI Model */}
        {isDownloading && aiDownloadProgress < 100 && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6 max-w-sm mx-auto">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <span className="material-symbols-outlined text-sm animate-pulse">info</span>
              <span className="text-sm font-medium">
                Downloading AI Model (~1.8GB)
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {aiDownloadProgress < 30 && 'This only happens once. The model is cached for future use.'}
              {aiDownloadProgress >= 30 && aiDownloadProgress < 60 && 'Download is progressing...'}
              {aiDownloadProgress >= 60 && aiDownloadProgress < 90 && 'Almost done...'}
              {aiDownloadProgress >= 90 && 'Finalizing...'}
            </p>
          </div>
        )}

        {userData.medications.length === 0 ? (
          <div className="bg-surface-container-low rounded-2xl p-6 max-w-md mx-auto">
            <p className="text-lg text-on-surface mb-4">{t('processing.noMedications.title')}</p>
            <button
              onClick={() => setCurrentScreen('intake')}
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
            >
              {t('processing.noMedications.button')}
            </button>
          </div>
        ) : !isDownloading && processingStep > 20 && processingStep < 70 ? (
          <div className="bg-surface-container-low rounded-2xl p-6 max-w-md mx-auto">
            <h3 className="text-sm font-bold text-on-surface/50 uppercase tracking-widest mb-4">
              {t('processing.analyzing', { count: userData.medications.length })}
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {userData.medications.map((med) => (
                <span
                  key={med.id || med.name}
                  className="bg-secondary-container/50 text-on-secondary-container px-3 py-1 rounded-full text-sm font-medium"
                >
                  {med.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Privacy Note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-on-surface/40 text-sm">
          <span className="material-symbols-outlined text-primary" data-icon="shield">shield</span>
          <span>{t('processing.privacyNote')}</span>
        </div>
      </div>
    </div>
  );
}
