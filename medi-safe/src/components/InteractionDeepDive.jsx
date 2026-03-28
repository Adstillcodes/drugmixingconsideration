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
        <header className="mb-8 flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold mb-6">
              <div className="flex items-center gap-2 bg-secondary-container/30 px-4 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-sm" data-icon="favorite">favorite</span>
                <span className="text-xs tracking-wider uppercase">{t('deepDive.header.safetyBanner')}</span>
              </div>
            </div>
            <h1 className="text-[2.5rem] font-bold text-on-surface leading-tight tracking-tight mb-4">
              {t('results.interactions.title')}
            </h1>
            <p className="text-lg text-on-surface-variant max-w-2xl font-normal">
              {interactionsListText}
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handlePrintReport}
              className="flex items-center gap-2 bg-surface-container-high text-on-surface px-5 py-3 rounded-xl font-bold hover:bg-surface-container-low transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined">print</span>
              {t('results.actions.print')}
            </button>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold hover:opacity-90 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined">download</span>
              {t('results.actions.download')}
            </button>
          </div>
        </header>

        {interactions.length === 0 ? (
          <div className="bg-success/10 rounded-3xl p-12 text-center border border-success/20">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-success text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">{t('results.interactions.noInteractions.title')}</h2>
            <p className="text-on-surface/60 max-w-md mx-auto mb-8">
              {t('results.interactions.noInteractions.message')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {interactions.map((intx) => (
              <div
                key={intx.id}
                className={`rounded-3xl overflow-hidden border shadow-lg cursor-pointer hover:shadow-xl transition-all ${
                  intx.severity === 'contraindicated' ? 'border-error bg-error-container/30' :
                  intx.severity === 'major' ? 'border-orange-400 bg-orange-50' :
                  intx.severity === 'moderate' ? 'border-yellow-400 bg-yellow-50' :
                  'border-success/30 bg-success/10'
                }`}
                onClick={() => {
                  setSelectedInteraction(intx);
                }}
              >
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      intx.severity === 'contraindicated' ? 'bg-error text-white' :
                      intx.severity === 'major' ? 'bg-orange-500 text-white' :
                      intx.severity === 'moderate' ? 'bg-yellow-500 text-white' :
                      'bg-success text-white'
                    }`}>
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {intx.severity === 'contraindicated' || intx.severity === 'major' ? 'warning' : 'info'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-on-surface">{intx.drugs.join(' + ')}</h3>
                      <p className={`text-sm ${
                        intx.severity === 'contraindicated' ? 'text-error' :
                        intx.severity === 'major' ? 'text-orange-600' :
                        intx.severity === 'moderate' ? 'text-yellow-700' :
                        'text-success'
                      }`}>{intx.risk}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${
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

        <div className="mt-8 text-center">
          <button
            onClick={() => setCurrentScreen('results')}
            className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all"
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
      <header className="mb-12 flex flex-wrap justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold mb-6">
            <div className="flex items-center gap-2 bg-secondary-container/30 px-4 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-sm" data-icon="favorite">favorite</span>
              <span className="text-xs tracking-wider uppercase">{t('deepDive.header.safetyBanner')}</span>
            </div>
          </div>
          <div
            className="flex items-center gap-2 text-on-surface-variant/60 mb-4 hover:text-primary cursor-pointer transition-colors w-fit"
            onClick={() => setCurrentScreen('results')}
          >
            <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
            <span className="text-sm font-bold tracking-wider uppercase">{t('deepDive.header.backToSummary')}</span>
          </div>
          <h1 className="text-[3rem] font-bold text-on-surface leading-tight tracking-tight mb-4">
            {t('deepDive.header.title')}
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl font-normal">
            {t('deepDive.header.subtitle', { drug1: interaction.drugs[0], drug2: interaction.drugs[1] })}
          </p>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-2 bg-surface-container-high text-on-surface px-5 py-3 rounded-xl font-bold hover:bg-surface-container-low transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined">print</span>
            {t('results.actions.print')}
          </button>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold hover:opacity-90 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined">download</span>
            {t('results.actions.download')}
          </button>
        </div>
      </header>

      {/* Interaction Alert Hero Card - Color Coded by Severity */}
      <section className={`mb-12 rounded-3xl overflow-hidden p-1 shadow-sm ${
        interaction.severity === 'contraindicated' ? 'bg-gradient-to-br from-red-500 to-red-700' :
        interaction.severity === 'major' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
        interaction.severity === 'moderate' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
        'bg-gradient-to-br from-green-500 to-green-600'
      }`}>
        <div className="bg-surface-container-lowest rounded-[1.25rem] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
              interaction.severity === 'contraindicated' ? 'bg-red-100' :
              interaction.severity === 'major' ? 'bg-orange-100' :
              interaction.severity === 'moderate' ? 'bg-yellow-100' :
              'bg-green-100'
            }`}>
              <span className={`material-symbols-outlined text-4xl ${
                interaction.severity === 'contraindicated' || interaction.severity === 'major' ? 'text-red-600' :
                interaction.severity === 'moderate' ? 'text-yellow-600' :
                'text-green-600'
              }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {interaction.severity === 'contraindicated' || interaction.severity === 'major' ? 'warning' : 'info'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <span className="text-[1.75rem] font-bold text-on-surface">{interaction.drugs[0]}</span>
                <span className="material-symbols-outlined text-on-surface-variant/40">swap_horiz</span>
                <span className="text-[1.75rem] font-bold text-on-surface">{interaction.drugs[1]}</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-4 py-1 rounded-lg font-black text-sm uppercase tracking-wider ${
                  interaction.severity === 'contraindicated' ? 'bg-red-600 text-white' :
                  interaction.severity === 'major' ? 'bg-orange-500 text-white' :
                  interaction.severity === 'moderate' ? 'bg-yellow-500 text-white' :
                  'bg-green-500 text-white'
                }`}>
                  {info.label}
                </span>
                <span className={`text-sm font-semibold ${
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
          <div className="flex flex-col items-end">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Mechanism of Action (Large Content) */}
        <div className="md:col-span-2 space-y-8">
          <section className="bg-surface-container-low border border-outline-variant/20 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined">biotech</span>
              {t('deepDive.clinical.title')}
            </h3>
            <div className="space-y-6 text-[18px] leading-relaxed text-on-surface-variant">
              <p>{interaction.description}</p>
              
              {interaction.mechanism && (
                <div className="p-6 bg-surface-container-high/40 rounded-2xl border-l-4 border-primary">
                  <h4 className="font-bold text-on-surface mb-2">{t('deepDive.mechanism.title')}</h4>
                  <p className="italic font-medium">{interaction.mechanism}</p>
                </div>
              )}

              {aiAnalysis?.riskExplanation && (
                <div className="p-6 bg-secondary-container/20 rounded-2xl border-l-4 border-secondary-container">
                  <h4 className="font-bold text-on-secondary-container mb-2">{t('deepDive.personalized.title')}</h4>
                  <p className="text-on-surface-variant">{aiAnalysis.riskExplanation}</p>
                </div>
              )}
            </div>
          </section>

          {/* recommendations */}
          <section className="bg-surface-container-low border border-outline-variant/20 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined">rule</span>
              {t('deepDive.recommendations.title')}
            </h3>
            <div className="space-y-4">
              {interaction.recommendations?.map((rec, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 p-5 bg-surface-container-lowest border rounded-2xl hover:border-primary-container transition-colors group ${
                    rec.startsWith('⚠️') ? 'border-orange-300 bg-orange-50' :
                    rec.includes('DO NOT') || rec.includes('Seek immediate') ? 
                      (interaction.severity === 'contraindicated' ? 'border-red-300 bg-red-50' : 'border-orange-300 bg-orange-50') :
                    'border-outline-variant/10'
                  }`}
                >
                  <span className={`material-symbols-outlined mt-1 group-hover:scale-110 transition-transform ${
                    rec.startsWith('⚠️') ? 'text-orange-600' :
                    rec.includes('DO NOT') || rec.includes('Seek immediate') ? 'text-red-600' :
                    'text-green-600'
                  }`}>
                    {rec.startsWith('⚠️') ? 'warning' : rec.includes('DO NOT') || rec.includes('Seek immediate') ? 'block' : 'check_circle'}
                  </span>
                  <p className={`text-on-surface font-medium ${
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
        <div className="space-y-8">
          {/* Severity Meter */}
          <section className="bg-surface-container-low border border-outline-variant/20 rounded-3xl p-8">
            <h3 className="text-xs font-black tracking-widest uppercase text-on-surface-variant/60 mb-6">{t('deepDive.riskAssessment.title')}</h3>
            <div className={`relative h-3 w-full rounded-full mb-8 overflow-hidden ${
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
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-on-surface-variant">{t('deepDive.riskAssessment.severityLevel')}</span>
                <span className={`font-black ${
                  interaction.severity === 'contraindicated' ? 'text-red-600' :
                  interaction.severity === 'major' ? 'text-orange-600' :
                  interaction.severity === 'moderate' ? 'text-yellow-700' :
                  'text-green-600'
                }`}>{info.level}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-on-surface-variant">{t('deepDive.riskAssessment.riskCategory')}</span>
                <span className="font-black text-on-surface">{info.label}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-on-surface-variant">{t('deepDive.riskAssessment.evidence')}</span>
                <span className="font-black text-on-surface">{t('deepDive.riskAssessment.evidenceValue')}</span>
              </div>
            </div>
          </section>

          {/* AI Insights Panel */}
          {aiAnalysis && (
            <section className="bg-gradient-to-br from-primary/10 to-primary-container/20 rounded-3xl p-8 border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                <h3 className="text-lg font-bold text-primary">{t('deepDive.aiAnalysis.title')}</h3>
              </div>
              <div className="space-y-4">
                {aiAnalysis.personalizedAdvice?.map((advice, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-on-surface leading-relaxed">{advice}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Human Escalation */}
          <section className="bg-primary text-white rounded-3xl p-8 shadow-xl shadow-primary-container/30 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            <span className="material-symbols-outlined text-4xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
            <h3 className="text-xl font-bold mb-2">{t('deepDive.consultation.title')}</h3>
            <p className="text-white/80 text-sm mb-6 leading-relaxed font-medium">
              {t('deepDive.consultation.subtitle')}
            </p>
            <button className="w-full bg-white text-primary py-4 rounded-2xl font-black hover:bg-secondary-container transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
              <span className="material-symbols-outlined">phone</span>
              {t('deepDive.consultation.button')}
            </button>
          </section>

          {/* Data Control */}
          <section className="p-6 border border-outline-variant/20 rounded-3xl bg-surface-container-lowest">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary-container font-bold">lock</span>
              <span className="text-xs font-black text-on-surface uppercase tracking-widest">{t('deepDive.privacy.title')}</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
              {t('deepDive.privacy.message')}
            </p>
          </section>
        </div>
      </div>

      {/* Continue to Recommendations */}
      <div className="mt-12 text-center">
        <button
          onClick={() => setCurrentScreen('recommendations')}
          className="bg-primary text-white px-12 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg flex items-center gap-3 mx-auto"
        >
          <span className="material-symbols-outlined">arrow_forward</span>
          {t('deepDive.continue.button')}
        </button>
      </div>
    </div>
  );
}
