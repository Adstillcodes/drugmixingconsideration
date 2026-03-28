import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { downloadReport, printReport } from '../services/reportGenerator';

export default function InteractionDeepDive() {
  const { t } = useTranslation();
  const { selectedInteraction, setSelectedInteraction, setCurrentScreen, analysisResults, aiAnalysis, userData } = useApp();

  const interaction = selectedInteraction;
  const interactions = analysisResults?.interactions || [];

  const handleDownloadReport = () => {
    downloadReport(analysisResults, aiAnalysis, userData);
  };

  const handlePrintReport = () => {
    printReport(analysisResults, aiAnalysis, userData);
  };

  const severityInfo = {
    contraindicated: { level: 'Critical', percent: 95, label: 'Do Not Combine' },
    major: { level: 'High', percent: 75, label: 'High Risk' },
    moderate: { level: 'Moderate', percent: 50, label: 'Monitor Closely' },
    minor: { level: 'Low', percent: 25, label: 'Generally Safe' },
    unknown: { level: 'Unknown', percent: 10, label: 'Limited Data' },
  };

  const info = interaction ? severityInfo[interaction.severity] || severityInfo.unknown : severityInfo.unknown;

  const interactionsListText = interactions.length > 0 
    ? `${interactions.length} ${t('results.interactions.found').replace('{{count}}', '')}`
    : t('results.interactions.noInteractions.title');

  if (!interaction) {
    return (
      <div className="max-w-5xl mx-auto">
        <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold mb-4 sm:mb-6">
              <div className="flex items-center gap-2 bg-secondary-container/30 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">
                <span className="material-symbols-outlined text-xs sm:text-sm" data-icon="favorite">favorite</span>
                <span className="text-[10px] sm:text-xs tracking-wider uppercase">{t('deepDive.header.safetyBanner')}</span>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-[2.5rem] font-bold text-on-surface leading-tight tracking-tight mb-3 sm:mb-4">
              {t('results.interactions.title')}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-on-surface-variant max-w-2xl font-normal">
              {interactionsListText}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-1 sm:gap-2 bg-surface-container-high text-on-surface px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:bg-surface-container-low transition-all cursor-pointer text-xs sm:text-sm"
            >
              <span className="material-symbols-outlined">print</span>
              {t('results.actions.print')}
            </button>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-1 sm:gap-2 bg-primary text-white px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:opacity-90 transition-all cursor-pointer text-xs sm:text-sm"
            >
              <span className="material-symbols-outlined">download</span>
              {t('results.actions.download')}
            </button>
          </div>
        </header>

        {interactions.length === 0 ? (
          <div className="bg-success/10 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center border border-success/20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="material-symbols-outlined text-success text-3xl sm:text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface mb-2">{t('results.interactions.noInteractions.title')}</h2>
            <p className="text-on-surface/60 max-w-md mx-auto mb-6 sm:mb-8 text-sm sm:text-base">
              {t('results.interactions.noInteractions.message')}
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {interactions.map((intx) => (
              <div
                key={intx.id}
                className={`rounded-2xl sm:rounded-3xl overflow-hidden border shadow-lg cursor-pointer hover:shadow-xl transition-all ${
                  intx.severity === 'contraindicated' ? 'border-error bg-error-container/30' :
                  intx.severity === 'major' ? 'border-orange-400 bg-orange-50' :
                  intx.severity === 'moderate' ? 'border-yellow-400 bg-yellow-50' :
                  'border-success/30 bg-success/10'
                }`}
                onClick={() => {
                  setSelectedInteraction(intx);
                }}
              >
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center ${
                      intx.severity === 'contraindicated' ? 'bg-error text-white' :
                      intx.severity === 'major' ? 'bg-orange-500 text-white' :
                      intx.severity === 'moderate' ? 'bg-yellow-500 text-white' :
                      'bg-success text-white'
                    }`}>
                      <span className="material-symbols-outlined text-lg sm:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {intx.severity === 'contraindicated' || intx.severity === 'major' ? 'warning' : 'info'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-xl font-bold text-on-surface truncate">{intx.drugs.join(' + ')}</h3>
                      <p className={`text-xs sm:text-sm ${
                        intx.severity === 'contraindicated' ? 'text-error' :
                        intx.severity === 'major' ? 'text-orange-600' :
                        intx.severity === 'moderate' ? 'text-yellow-700' :
                        'text-success'
                      }`}>{intx.risk}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-sm font-bold uppercase ${
                      intx.severity === 'contraindicated' ? 'bg-error text-white' :
                      intx.severity === 'major' ? 'bg-orange-500 text-white' :
                      intx.severity === 'moderate' ? 'bg-yellow-500 text-white' :
                      'bg-success text-white'
                    }`}>
                      {intx.severity}
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 sm:mt-8 text-center">
          <button
            onClick={() => setCurrentScreen('results')}
            className="bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:opacity-90 transition-all text-sm sm:text-base"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <header className="mb-6 sm:mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold mb-4 sm:mb-6">
            <div className="flex items-center gap-2 bg-secondary-container/30 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">
              <span className="material-symbols-outlined text-xs sm:text-sm" data-icon="favorite">favorite</span>
              <span className="text-[10px] sm:text-xs tracking-wider uppercase">{t('deepDive.header.safetyBanner')}</span>
            </div>
          </div>
          <div
            className="flex items-center gap-2 text-on-surface-variant/60 mb-3 sm:mb-4 hover:text-primary cursor-pointer transition-colors w-fit"
            onClick={() => setCurrentScreen('results')}
          >
            <span className="material-symbols-outlined text-xs sm:text-sm font-bold">arrow_back</span>
            <span className="text-[10px] sm:text-sm font-bold tracking-wider uppercase">{t('deepDive.header.backToSummary')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[3rem] font-bold text-on-surface leading-tight tracking-tight mb-3 sm:mb-4">
            {t('deepDive.header.title')}
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-on-surface-variant max-w-2xl font-normal">
            {t('deepDive.header.subtitle', { drug1: interaction.drugs[0], drug2: interaction.drugs[1] })}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1 sm:gap-2 bg-surface-container-high text-on-surface px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:bg-surface-container-low transition-all cursor-pointer text-xs sm:text-sm"
          >
            <span className="material-symbols-outlined">print</span>
            {t('results.actions.print')}
          </button>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-1 sm:gap-2 bg-primary text-white px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold hover:opacity-90 transition-all cursor-pointer text-xs sm:text-sm"
          >
            <span className="material-symbols-outlined">download</span>
            {t('results.actions.download')}
          </button>
        </div>
      </header>

      {/* Interaction Alert Hero Card - Color Coded by Severity */}
      <section className={`mb-6 sm:mb-12 rounded-2xl sm:rounded-3xl overflow-hidden p-1 shadow-sm ${
        interaction.severity === 'contraindicated' ? 'bg-gradient-to-br from-red-500 to-red-700' :
        interaction.severity === 'major' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
        interaction.severity === 'moderate' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
        'bg-gradient-to-br from-green-500 to-green-600'
      }`}>
        <div className="bg-surface-container-lowest rounded-[1rem] sm:rounded-[1.25rem] p-4 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-8">
          <div className="flex items-center gap-4 sm:gap-6 w-full">
            <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center ${
              interaction.severity === 'contraindicated' ? 'bg-red-100' :
              interaction.severity === 'major' ? 'bg-orange-100' :
              interaction.severity === 'moderate' ? 'bg-yellow-100' :
              'bg-green-100'
            }`}>
              <span className={`material-symbols-outlined text-2xl sm:text-4xl ${
                interaction.severity === 'contraindicated' || interaction.severity === 'major' ? 'text-red-600' :
                interaction.severity === 'moderate' ? 'text-yellow-600' :
                'text-green-600'
              }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {interaction.severity === 'contraindicated' || interaction.severity === 'major' ? 'warning' : 'info'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                <span className="text-base sm:text-lg md:text-[1.75rem] font-bold text-on-surface truncate">{interaction.drugs[0]}</span>
                <span className="material-symbols-outlined text-on-surface-variant/40 text-sm sm:text-lg">swap_horiz</span>
                <span className="text-base sm:text-lg md:text-[1.75rem] font-bold text-on-surface truncate">{interaction.drugs[1]}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className={`px-2 sm:px-4 py-1 rounded-lg font-black text-[10px] sm:text-sm uppercase tracking-wider ${
                  interaction.severity === 'contraindicated' ? 'bg-red-600 text-white' :
                  interaction.severity === 'major' ? 'bg-orange-500 text-white' :
                  interaction.severity === 'moderate' ? 'bg-yellow-500 text-white' :
                  'bg-green-500 text-white'
                }`}>
                  {info.label}
                </span>
                <span className={`text-xs sm:text-sm font-semibold ${
                  interaction.severity === 'contraindicated' ? 'text-red-600' :
                  interaction.severity === 'major' ? 'text-orange-600' :
                  interaction.severity === 'moderate' ? 'text-yellow-700' :
                  'text-green-600'
                }`}>
                  Risk: {interaction.risk}
                </span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[0.7rem] font-black text-on-surface-variant/40 tracking-widest uppercase mb-2">{t('deepDive.header.privacy')}</span>
            <div className="flex items-center gap-3 bg-surface-container-low border border-outline-variant/30 px-4 py-2 rounded-full">
              <span className="text-sm font-bold">Anonymous Mode</span>
              <div className="w-10 h-5 bg-primary-container rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Layout for Detailed Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Mechanism of Action (Large Content) */}
        <div className="md:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
          <section className="bg-surface-container-low border border-outline-variant/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
            <h3 className="text-base sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-primary">
              <span className="material-symbols-outlined">biotech</span>
              {t('deepDive.clinical.title')}
            </h3>
            <div className="space-y-4 sm:space-y-6 text-sm sm:text-base lg:text-[18px] leading-relaxed text-on-surface-variant">
              <p>{interaction.description}</p>
              
              {interaction.mechanism && (
                <div className="p-4 sm:p-6 bg-surface-container-high/40 rounded-xl sm:rounded-2xl border-l-4 border-primary">
                  <h4 className="font-bold text-on-surface mb-1 sm:mb-2 text-sm sm:text-base">{t('deepDive.mechanism.title')}</h4>
                  <p className="italic font-medium text-sm sm:text-base">{interaction.mechanism}</p>
                </div>
              )}

              {aiAnalysis?.riskExplanation && (
                <div className="p-4 sm:p-6 bg-secondary-container/20 rounded-xl sm:rounded-2xl border-l-4 border-secondary-container">
                  <h4 className="font-bold text-on-secondary-container mb-1 sm:mb-2 text-sm sm:text-base">{t('deepDive.personalized.title')}</h4>
                  <p className="text-on-surface-variant text-sm sm:text-base">{aiAnalysis.riskExplanation}</p>
                </div>
              )}
            </div>
          </section>

          {/* recommendations */}
          <section className="bg-surface-container-low border border-outline-variant/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
            <h3 className="text-base sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 text-primary">
              <span className="material-symbols-outlined">rule</span>
              {t('deepDive.recommendations.title')}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {interaction.recommendations?.map((rec, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-5 bg-surface-container-lowest border rounded-xl sm:rounded-2xl hover:border-primary-container transition-colors group ${
                    rec.startsWith('⚠️') ? 'border-orange-300 bg-orange-50' :
                    rec.includes('DO NOT') || rec.includes('Seek immediate') ? 
                      (interaction.severity === 'contraindicated' ? 'border-red-300 bg-red-50' : 'border-orange-300 bg-orange-50') :
                    'border-outline-variant/10'
                  }`}
                >
                  <span className={`material-symbols-outlined mt-0.5 sm:mt-1 text-lg sm:text-2xl group-hover:scale-110 transition-transform ${
                    rec.startsWith('⚠️') ? 'text-orange-600' :
                    rec.includes('DO NOT') || rec.includes('Seek immediate') ? 'text-red-600' :
                    'text-green-600'
                  }`}>
                    {rec.startsWith('⚠️') ? 'warning' : rec.includes('DO NOT') || rec.includes('Seek immediate') ? 'block' : 'check_circle'}
                  </span>
                  <p className={`text-on-surface font-medium text-sm sm:text-base ${
                    rec.startsWith('⚠️') ? 'text-orange-700' :
                    rec.includes('DO NOT') || rec.includes('Seek immediate') ? 'text-red-700' :
                    ''
                  }`}>{rec}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Side Panels */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Severity Meter */}
          <section className="bg-surface-container-low border border-outline-variant/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
            <h3 className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-on-surface-variant/60 mb-4 sm:mb-6">{t('deepDive.riskAssessment.title')}</h3>
            <div className={`relative h-2 sm:h-3 w-full rounded-full mb-6 sm:mb-8 overflow-hidden ${
              interaction.severity === 'contraindicated' ? 'bg-red-200' :
              interaction.severity === 'major' ? 'bg-orange-200' :
              interaction.severity === 'moderate' ? 'bg-yellow-200' :
              'bg-green-200'
            }`}>
              <div 
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${info.percent}%`,
                  backgroundColor: 
                    interaction.severity === 'contraindicated' ? '#D32F2F' :
                    interaction.severity === 'major' ? '#F97316' :
                    interaction.severity === 'moderate' ? '#EAB308' :
                    '#22C55E'
                }}
              />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="font-bold text-on-surface-variant">{t('deepDive.riskAssessment.severityLevel')}</span>
                <span className={`font-black ${
                  interaction.severity === 'contraindicated' ? 'text-red-600' :
                  interaction.severity === 'major' ? 'text-orange-600' :
                  interaction.severity === 'moderate' ? 'text-yellow-700' :
                  'text-green-600'
                }`}>{info.level}</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="font-bold text-on-surface-variant">{t('deepDive.riskAssessment.riskCategory')}</span>
                <span className="font-black text-on-surface">{info.label}</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="font-bold text-on-surface-variant">{t('deepDive.riskAssessment.evidence')}</span>
                <span className="font-black text-on-surface">{t('deepDive.riskAssessment.evidenceValue')}</span>
              </div>
            </div>
          </section>

          {/* AI Insights Panel */}
          {aiAnalysis && (
            <section className="bg-gradient-to-br from-primary/10 to-primary-container/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-primary/20">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                <h3 className="text-base sm:text-lg font-bold text-primary">{t('deepDive.aiAnalysis.title')}</h3>
              </div>
              <div className="space-y-2 sm:space-y-4">
                {aiAnalysis.personalizedAdvice?.map((advice, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                    <span className="text-primary mt-0.5 sm:mt-1">•</span>
                    <span className="text-on-surface leading-relaxed">{advice}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Human Escalation */}
          <section className="bg-primary text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl shadow-primary-container/30 relative overflow-hidden group">
            <div className="absolute -right-2 sm:-right-4 -top-2 sm:-top-4 w-16 sm:w-24 h-16 sm:h-24 bg-white/10 rounded-full blur-xl sm:blur-2xl group-hover:scale-150 transition-transform" />
            <span className="material-symbols-outlined text-3xl sm:text-4xl mb-3 sm:mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">{t('deepDive.consultation.title')}</h3>
            <p className="text-white/80 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed font-medium">
              {t('deepDive.consultation.subtitle')}
            </p>
            <button className="w-full bg-white text-primary py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black hover:bg-secondary-container transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 text-sm sm:text-base">
              <span className="material-symbols-outlined">phone</span>
              {t('deepDive.consultation.button')}
            </button>
          </section>

          {/* Data Control */}
          <section className="p-4 sm:p-6 border border-outline-variant/20 rounded-2xl sm:rounded-3xl bg-surface-container-lowest">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <span className="material-symbols-outlined text-primary-container font-bold">lock</span>
              <span className="text-[10px] sm:text-xs font-black text-on-surface uppercase tracking-widest">{t('deepDive.privacy.title')}</span>
            </div>
            <p className="text-[10px] sm:text-xs text-on-surface-variant leading-relaxed font-medium">
              {t('deepDive.privacy.message')}
            </p>
          </section>
        </div>
      </div>

      {/* Continue to Recommendations */}
      <div className="mt-6 sm:mt-12 text-center">
        <button
          onClick={() => setCurrentScreen('recommendations')}
          className="bg-primary text-white px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg hover:opacity-90 transition-all shadow-lg flex items-center gap-2 sm:gap-3 mx-auto"
        >
          <span className="material-symbols-outlined">arrow_forward</span>
          {t('deepDive.continue.button')}
        </button>
      </div>
    </div>
  );
}
