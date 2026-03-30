import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';

export default function ProcessingScreen() {
  const { t } = useTranslation();
  const { processingStep, setCurrentScreen, userData, error, isProcessing } = useApp();
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!isProcessing && processingStep === 0) {
      setCurrentScreen('intake');
      return;
    }

    const messages = [
      t('processing.title'),
      'Checking drug interactions...',
      'Analyzing medication combinations...',
      'Generating insights...',
      'Finalizing report...',
    ];
    
    const interval = setInterval(() => {
      const index = Math.min(Math.floor(processingStep / 20), messages.length - 1);
      setStatusMessage(messages[index]);
    }, 500);

    return () => clearInterval(interval);
  }, [processingStep, t, isProcessing, setCurrentScreen]);

  useEffect(() => {
    if (processingStep >= 100) {
      const timer = setTimeout(() => {
        setCurrentScreen('results');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [processingStep, setCurrentScreen]);

  if (!isProcessing && processingStep === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-surface-container-lowest rounded-2xl sm:rounded-[24px] p-6 sm:p-12 shadow-xl border border-surface-container-high text-center">
        {error ? (
          <>
            <div className="mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-error/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-4xl sm:text-5xl">error</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-error mb-3 sm:mb-4">{t('errors.generic')}</h2>
            <p className="text-on-surface/60 text-sm sm:text-base md:text-lg mb-6 sm:mb-8">{error}</p>
            <button
              onClick={() => setCurrentScreen('intake')}
              className="bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:opacity-90 transition-all text-sm sm:text-base"
            >
              {t('common.back')}
            </button>
          </>
        ) : (
          <>
            <div className="mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center relative">
                <span className="material-symbols-outlined text-primary text-4xl sm:text-5xl animate-pulse">
                  analytics
                </span>
                <div className="absolute inset-0 rounded-full border-3 sm:border-4 border-primary border-t-transparent animate-spin" />
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-on-surface mb-3 sm:mb-4">
              {statusMessage || t('processing.title')}
            </h2>
            <p className="text-on-surface/60 text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
              {t('processing.subtitle')}
            </p>

            <div className="max-w-md mx-auto mb-6 sm:mb-8">
              <div className="h-2 sm:h-3 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${processingStep}%` }}
                />
              </div>
              <p className="text-xs sm:text-sm text-on-surface/50 mt-2">{processingStep}% complete</p>
            </div>

            {userData.medications.length > 0 && processingStep < 80 && (
              <div className="bg-surface-container-low rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md mx-auto">
                <h3 className="text-xs sm:text-sm font-bold text-on-surface/50 uppercase tracking-widest mb-3 sm:mb-4">
                  {t('processing.analyzing', { count: userData.medications.length })}
                </h3>
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                  {userData.medications.map((med) => (
                    <span
                      key={med.id || med.name}
                      className="bg-secondary-container/50 text-on-secondary-container px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium"
                    >
                      {med.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
