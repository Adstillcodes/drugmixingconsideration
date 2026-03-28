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
      <div className="bg-surface-container-lowest rounded-[24px] p-12 shadow-xl border border-surface-container-high text-center">
        {error ? (
          <>
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-error/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-5xl">error</span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-error mb-4">{t('errors.generic')}</h2>
            <p className="text-on-surface/60 text-lg mb-8">{error}</p>
            <button
              onClick={() => setCurrentScreen('intake')}
              className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all"
            >
              {t('common.back')}
            </button>
          </>
        ) : (
          <>
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center relative">
                <span className="material-symbols-outlined text-primary text-5xl animate-pulse">
                  analytics
                </span>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-on-surface mb-4">
              {statusMessage || t('processing.title')}
            </h2>
            <p className="text-on-surface/60 text-lg mb-8">
              {t('processing.subtitle')}
            </p>

            <div className="max-w-md mx-auto mb-8">
              <div className="h-3 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${processingStep}%` }}
                />
              </div>
              <p className="text-sm text-on-surface/50 mt-2">{processingStep}% complete</p>
            </div>

            {userData.medications.length > 0 && processingStep < 80 && (
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
            )}

            <div className="mt-8 flex items-center justify-center gap-2 text-on-surface/40 text-sm">
              <span className="material-symbols-outlined text-primary" data-icon="shield">shield</span>
              <span>{t('processing.privacyNote')}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
