import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { downloadReport, printReport } from '../services/reportGenerator';

export default function Recommendations() {
  const { t } = useTranslation();
  const { selectedInteraction, analysisResults, aiAnalysis, userData, setCurrentScreen } = useApp();

  const handleDownloadReport = () => {
    downloadReport(analysisResults, aiAnalysis, userData);
  };

  const handlePrintReport = () => {
    printReport(analysisResults, aiAnalysis, userData);
  };

  const interaction = selectedInteraction;
  const hasResults = analysisResults && analysisResults.interactions;

  const recommendations = {
    contraindicated: [
      {
        step: 1,
        title: t('recommendations.steps.contraindicated.1.title'),
        desc: t('recommendations.steps.contraindicated.1.desc'),
        icon: 'emergency',
        urgent: true,
      },
      {
        step: 2,
        title: t('recommendations.steps.contraindicated.2.title'),
        desc: t('recommendations.steps.contraindicated.2.desc'),
        icon: 'phone',
        urgent: true,
      },
      {
        step: 3,
        title: t('recommendations.steps.contraindicated.3.title'),
        desc: t('recommendations.steps.contraindicated.3.desc'),
        icon: 'local_hospital',
        urgent: true,
      },
    ],
    major: [
      {
        step: 1,
        title: t('recommendations.steps.major.1.title'),
        desc: t('recommendations.steps.major.1.desc'),
        icon: 'medical_information',
        urgent: true,
      },
      {
        step: 2,
        title: t('recommendations.steps.major.2.title'),
        desc: t('recommendations.steps.major.2.desc'),
        icon: 'warning',
        urgent: false,
      },
      {
        step: 3,
        title: t('recommendations.steps.major.3.title'),
        desc: t('recommendations.steps.major.3.desc'),
        icon: 'swap_horiz',
        urgent: false,
      },
    ],
    moderate: [
      {
        step: 1,
        title: t('recommendations.steps.moderate.1.title'),
        desc: t('recommendations.steps.moderate.1.desc'),
        icon: 'visibility',
        urgent: false,
      },
      {
        step: 2,
        title: t('recommendations.steps.moderate.2.title'),
        desc: t('recommendations.steps.moderate.2.desc'),
        icon: 'schedule',
        urgent: false,
      },
      {
        step: 3,
        title: t('recommendations.steps.moderate.3.title'),
        desc: t('recommendations.steps.moderate.3.desc'),
        icon: 'calendar_today',
        urgent: false,
      },
    ],
    minor: [
      {
        step: 1,
        title: t('recommendations.steps.minor.1.title'),
        desc: t('recommendations.steps.minor.1.desc'),
        icon: 'info',
        urgent: false,
      },
      {
        step: 2,
        title: t('recommendations.steps.minor.2.title'),
        desc: t('recommendations.steps.minor.2.desc'),
        icon: 'check_circle',
        urgent: false,
      },
    ],
  };

  const getRecommendations = () => {
    if (interaction) {
      return recommendations[interaction.severity] || recommendations.moderate;
    }
    if (hasResults && analysisResults.interactions.length > 0) {
      const severities = analysisResults.interactions.map(i => i.severity);
      if (severities.includes('contraindicated')) return recommendations.contraindicated;
      if (severities.includes('major')) return recommendations.major;
      if (severities.includes('moderate')) return recommendations.moderate;
      return recommendations.minor;
    }
    return recommendations.minor;
  };

  const currentRecs = getRecommendations();
  const hasMedications = userData.medications && userData.medications.length > 0;

  if (!hasMedications) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface-container-low rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-6xl mb-6">info</span>
          <h2 className="text-3xl font-bold text-on-surface mb-4">{t('recommendations.noData.title')}</h2>
          <p className="text-on-surface-variant text-lg mb-8">
            {t('recommendations.noData.message')}
          </p>
          <button
            onClick={() => setCurrentScreen('intake')}
            className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all"
          >
            {t('recommendations.noData.button')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <header className="mb-12">
        <h1 className="text-[3.5rem] font-extrabold text-on-surface leading-[1.1] mb-4">
          {t('recommendations.header.title')}
        </h1>
        <p className="text-[1.125rem] text-on-surface-variant max-w-2xl leading-relaxed">
          {t('recommendations.header.subtitle')}
        </p>
      </header>

      {/* Bento Grid Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Action Plan */}
        <section className="lg:col-span-8 bg-surface-container-low border border-surface-container-high rounded-xl p-8 space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-[1.75rem] font-bold text-on-surface">{t('recommendations.actionPlan.title')}</h2>
            <div className="flex gap-2">
              {hasResults && analysisResults.summary?.riskLevel === 'critical' || hasResults && analysisResults.summary?.riskLevel === 'high' ? (
                <span className="bg-error text-white px-4 py-1 rounded-full text-[0.75rem] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  {t('recommendations.priority.urgent')}
                </span>
              ) : (
                <span className="bg-tertiary text-white px-4 py-1 rounded-full text-[0.75rem] font-bold uppercase tracking-wider">
                  {t('recommendations.priority.moderate')}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-6">
            {currentRecs.map((rec) => (
              <div key={rec.step} className="flex gap-6 items-start">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  rec.urgent ? 'bg-error text-white' : 'bg-primary-container text-white'
                }`}>
                  {rec.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    {rec.title}
                    {rec.urgent && (
                      <span className="px-2 py-0.5 bg-error/10 text-error text-xs font-bold rounded-full uppercase">
                        Urgent
                      </span>
                    )}
                  </h3>
                  <p className="text-[1.125rem] text-on-surface-variant leading-relaxed">{rec.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sidebar Actions & Trust */}
        <aside className="lg:col-span-4 space-y-8">
          {/* AI Personalized Advice */}
          {aiAnalysis && (
            <div className="bg-gradient-to-br from-primary/10 to-primary-container/20 rounded-xl p-6 border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                <h3 className="text-lg font-bold text-primary">{t('recommendations.aiAdvice.title')}</h3>
              </div>
              <div className="space-y-3">
                {aiAnalysis.personalizedAdvice?.slice(0, 3).map((advice, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-on-surface leading-relaxed">{advice}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Primary Actions Card */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-xl shadow-primary-container/5 space-y-4 border border-surface-container-high">
            <button 
              onClick={handlePrintReport}
              className="w-full bg-primary-container text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:opacity-95 transition-all shadow-lg shadow-primary-container/20 cursor-pointer"
            >
              <span className="material-symbols-outlined">print</span>
              {t('recommendations.actions.print')}
            </button>
            <button 
              onClick={handleDownloadReport}
              className="w-full bg-surface-container-high text-on-surface py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-secondary-container transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined">download</span>
              {t('recommendations.actions.download')}
            </button>
          </div>



          {/* Trust Signals */}
          <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-6 text-white overflow-hidden relative shadow-lg">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </div>
                <div>
                  <p className="text-[0.75rem] font-bold uppercase tracking-widest opacity-80">{t('recommendations.trust.hipaa')}</p>
                  <p className="text-sm font-semibold">{t('recommendations.trust.hipaaSub')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medical_information</span>
                </div>
                <div>
                  <p className="text-[0.75rem] font-bold uppercase tracking-widest opacity-80">{t('recommendations.trust.fda')}</p>
                  <p className="text-sm font-semibold">{t('recommendations.trust.fdaSub')}</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 opacity-20">
              <span className="material-symbols-outlined text-[120px]">health_and_safety</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Disclaimer */}
      <div className="mt-12 p-6 bg-surface-container-low rounded-xl border border-outline-variant/20">
        <div className="flex items-start gap-4">
          <span className="material-symbols-outlined text-on-surface-variant mt-1">info</span>
          <div>
            <h4 className="font-bold text-on-surface mb-2">{t('recommendations.disclaimer.title')}</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {t('recommendations.disclaimer.text')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between items-center flex-wrap gap-4">
        <button
          className="flex items-center gap-2 text-primary font-bold hover:underline"
          onClick={() => setCurrentScreen('results')}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          {t('recommendations.navigation.back')}
        </button>
        <button
          className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
          onClick={() => setCurrentScreen('intake')}
        >
          <span className="material-symbols-outlined">refresh</span>
          {t('recommendations.navigation.newAnalysis')}
        </button>
      </div>
    </div>
  );
}
