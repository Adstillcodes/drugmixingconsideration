import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { downloadReport, printReport } from '../services/reportGenerator';

function getRiskColor(level) {
  const colors = {
    safe: '#2ECC71',
    low: '#2ECC71',
    moderate: '#E9C46A',
    high: '#F97316',
    critical: '#D32F2F',
  };
  return colors[level] || colors.safe;
}

function getSeverityColor(severity) {
  const colors = {
    contraindicated: { bg: '#FFEBEE', text: '#D32F2F', border: '#D32F2F' },
    major: { bg: '#FFCDD2', text: '#C62828', border: '#EF5350' },
    moderate: { bg: '#FFF8E1', text: '#F57F17', border: '#FFB74D' },
    minor: { bg: '#E8F5E9', text: '#2E7D32', border: '#81C784' },
    unknown: { bg: '#ECEFF1', text: '#546E7A', border: '#90A4AE' },
  };
  return colors[severity] || colors.unknown;
}

export default function ResultsDashboard() {
  const { t } = useTranslation();
  const { 
    analysisResults, 
    aiAnalysis,
    userData, 
    setCurrentScreen, 
    setSelectedInteraction,
    resetAnalysis,
  } = useApp();

  const handleDownloadReport = () => {
    downloadReport(analysisResults, aiAnalysis, userData);
  };

  const handlePrintReport = () => {
    printReport(analysisResults, aiAnalysis, userData);
  };

  const handleViewAlternatives = () => {
    setCurrentScreen('alternatives');
  };

  const hasResults = analysisResults && (analysisResults.interactions !== undefined || analysisResults.summary !== undefined || analysisResults.success);
  const interactions = hasResults ? analysisResults.interactions : [];
  const summary = hasResults ? analysisResults.summary : null;
  const riskColors = summary ? getRiskColor(summary.riskLevel) : getRiskColor('safe');

  const hasModerateOrSevereInteractions = interactions.some(
    i => ['contraindicated', 'major', 'moderate'].includes(i.severity)
  );
  const hasSevereInteractions = interactions.some(
    i => ['contraindicated', 'major'].includes(i.severity)
  );

  const handleViewDetails = (interaction) => {
    setSelectedInteraction(interaction);
    setCurrentScreen('deepdive');
  };

  const getRiskLabel = (level) => {
    const labels = {
      safe: t('results.riskSummary.riskLevel.safe'),
      low: t('results.riskSummary.riskLevel.low'),
      moderate: t('results.riskSummary.riskLevel.moderate'),
      high: t('results.riskSummary.riskLevel.high'),
      critical: t('results.riskSummary.riskLevel.critical'),
    };
    return labels[level] || 'Unknown';
  };

  const getGaugeOffset = (percentage) => {
    const circumference = 691;
    return circumference - (percentage / 100) * circumference;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6 md:mb-10 flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-[2.75rem] font-extrabold text-on-surface leading-tight tracking-tight mb-2">
            {t('results.header.title')}
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant font-medium">
            {hasResults 
              ? `${t('results.header.analysisComplete')} • ${new Date(analysisResults.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : t('results.header.noAnalysis')
            }
          </p>
        </div>
        {hasResults && (
          <div className="flex items-center gap-3 bg-success/10 border border-success/20 px-4 py-2 rounded-full">
            <span className="material-symbols-outlined text-success text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span className="text-[0.75rem] font-bold tracking-widest uppercase text-success">{t('results.header.analysisCompleteBadge')}</span>
          </div>
        )}
      </header>

      {!hasResults ? (
        <div className="bg-surface-container-low rounded-3xl p-6 md:p-12 text-center border border-outline-variant/10">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <span className="material-symbols-outlined text-on-surface/40 text-3xl md:text-4xl">science</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-on-surface mb-4">{t('results.noAnalysis.title')}</h2>
          <p className="text-on-surface/60 max-w-md mx-auto mb-8">
            {t('results.noAnalysis.message')}
          </p>
          <button
            onClick={() => setCurrentScreen('intake')}
            className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all"
          >
            {t('results.noAnalysis.button')}
          </button>
        </div>
      ) : (
        <>
          {/* Bento Layout Grid */}
          <div className="grid grid-cols-12 gap-4 md:gap-6 lg:gap-8">
            {/* Risk Summary Card */}
            <section className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-4 md:p-6 lg:p-8 shadow-xl shadow-on-surface/5 flex flex-col items-center justify-center text-center border border-outline-variant/10">
              <h3 className="text-[0.75rem] font-bold tracking-widest uppercase text-on-surface-variant mb-4 md:mb-8">
                {t('results.riskSummary.title')}
              </h3>
              <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center mb-4 md:mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle 
                    cx="128" cy="128" 
                    fill="transparent" 
                    r="110" 
                    stroke="#E5E7EB" 
                    strokeWidth="24" 
                  />
                  <circle
                    cx="128"
                    cy="128"
                    fill="transparent"
                    r="110"
                    stroke={riskColors}
                    strokeDasharray="691"
                    strokeDashoffset={getGaugeOffset(summary?.riskPercentage || 0)}
                    strokeLinecap="round"
                    strokeWidth="24"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-on-surface">
                    {summary?.riskPercentage || 0}%
                  </span>
                  <span className="text-lg font-bold" style={{ color: riskColors }}>
                    {getRiskLabel(summary?.riskLevel || 'safe')}
                  </span>
                </div>
              </div>
              
              {summary?.riskLevel === 'safe' || summary?.riskLevel === 'low' ? (
                <div className="flex items-center gap-2 bg-success/10 px-6 py-3 rounded-full mb-4 border border-success/20">
                  <span className="material-symbols-outlined text-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-[1.125rem] font-bold text-success">{t('results.riskSummary.safeMessage')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-orange-100 px-6 py-3 rounded-full mb-4 border border-orange-200">
                  <span className="material-symbols-outlined text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  <span className="text-[1.125rem] font-bold text-orange-600">{t('results.riskSummary.attentionMessage')}</span>
                </div>
              )}
              
              <p className="text-[1rem] text-on-surface-variant leading-relaxed px-6">
                {summary?.message || t('processing.title')}
              </p>
            </section>

            {/* Medication List & AI Insights */}
            <section className="col-span-12 lg:col-span-7 space-y-4 md:space-y-6">
              {/* Medications */}
              <div className="bg-surface-container-low rounded-3xl p-4 md:p-6 lg:p-8 h-full border border-outline-variant/10">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h3 className="text-[1.125rem] font-bold text-on-surface">{t('results.medications.title')}</h3>
                  <span className="px-3 py-1 bg-white rounded-lg border border-outline-variant/15 text-xs font-bold text-on-surface-variant">
                    {analysisResults.medications?.length || 0} {t('results.medications.count').replace('{{count}}', '')}
                  </span>
                </div>
                
                {/* Prescription source indicator */}
                {analysisResults.medications?.some(m => m.fromOCR) && (
                  <div className="mb-4 p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    <span className="text-sm text-primary font-medium">
                      {t('results.medications.aiExtracted', { count: analysisResults.medications.filter(m => m.fromOCR).length })}
                    </span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {analysisResults.medications?.map((med) => (
                    <div key={med.id || med.name} className="bg-white p-3 md:p-6 rounded-2xl flex items-start gap-3 md:gap-4 border border-outline-variant/5 relative">
                      <div className={`p-3 rounded-xl ${med.fromOCR ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                        <span className="material-symbols-outlined">{med.fromOCR ? 'description' : 'pill'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-on-surface">{med.name}</h4>
                          {med.fromOCR && (
                            <span className="px-2 py-0.5 bg-success/20 text-success text-[10px] font-bold rounded-full">
                              {t('results.medications.fromPrescription')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-on-surface-variant">{med.category || 'Medication'} • {med.dosage || 'As directed'}</p>
                        {med.timing && (
                          <p className="text-sm text-primary font-medium mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">schedule</span>
                            {med.timing}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {userData.conditions?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-outline-variant/20">
                    <span className="text-xs font-bold text-on-surface/50 uppercase tracking-widest block mb-3">{t('results.medications.healthContext')}</span>
                    <div className="flex flex-wrap gap-2">
                      {userData.conditions.map((condition) => (
                        <span key={condition} className="px-4 py-2 bg-secondary-container/30 text-on-secondary-container rounded-full text-xs font-bold">
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* AI Insights - Full width section */}
            {hasResults && aiAnalysis && (
              <section className="col-span-12">
                <div className="bg-gradient-to-br from-primary/5 to-primary-container/10 rounded-3xl p-4 md:p-6 border border-primary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                    <h3 className="text-lg font-bold text-primary">{t('results.aiAnalysis.title')}</h3>
                  </div>
                  <p className="text-on-surface leading-relaxed mb-4">{aiAnalysis.overview}</p>
                  {aiAnalysis.keyConcerns?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-bold text-on-surface/70">{t('results.aiAnalysis.keyConcerns')}:</span>
                      {aiAnalysis.keyConcerns.map((concern, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-primary">•</span>
                          <span className="text-on-surface-variant">{concern}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* All Interactions Section - Always show with color coding */}
            <section className="col-span-12">
              <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-6">
                <h2 className="text-lg md:text-2xl font-bold text-on-surface">{t('results.interactions.title')}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  interactions.length > 0 
                    ? 'bg-error/10 text-error' 
                    : 'bg-success/10 text-success'
                }`}>
                  {interactions.length} {t('results.interactions.found').replace('{{count}}', '')}
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-outline-variant/30 to-transparent" />
              </div>

              {interactions.length === 0 ? (
                <div className="bg-success/10 rounded-3xl p-6 md:p-12 text-center border border-success/20">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <span className="material-symbols-outlined text-success text-3xl md:text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-on-surface mb-2">{t('results.interactions.noInteractions.title')}</h3>
                  <p className="text-on-surface/60 max-w-md mx-auto">
                    {t('results.interactions.noInteractions.message')}
                  </p>
                </div>
              ) : (
                interactions.map((interaction) => {
                  const severity = getSeverityColor(interaction.severity);
                  return (
                    <div
                      key={interaction.id}
                      className={`${severity.bg} rounded-3xl overflow-hidden border ${severity.border} mb-4 shadow-lg`}
                    >
                      <div
                        className="p-4 md:p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-6 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleViewDetails(interaction)}
                      >
                        <div className="flex items-center gap-3 md:gap-6">
                          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                            interaction.severity === 'contraindicated' ? 'bg-error' :
                            interaction.severity === 'major' ? 'bg-orange-500' :
                            interaction.severity === 'moderate' ? 'bg-yellow-500' :
                            'bg-success'
                          } text-white`}>
                            <span className="material-symbols-outlined text-2xl md:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {interaction.severity === 'contraindicated' || interaction.severity === 'major' ? 'warning' : 'info'}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-base md:text-xl lg:text-2xl font-extrabold text-on-surface">
                              {interaction.drugs.join(' + ')}
                            </h3>
                            <p className={`text-sm font-medium flex items-center gap-1 md:gap-2 ${
                              interaction.severity === 'contraindicated' || interaction.severity === 'major' ? 'text-error' :
                              interaction.severity === 'moderate' ? 'text-yellow-700' :
                              'text-success'
                            }`}>
                              <span className="material-symbols-outlined text-base md:text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {interaction.severity === 'contraindicated' || interaction.severity === 'major' ? 'error' : 'info'}
                              </span>
                              <span className="hidden sm:inline">{interaction.risk}</span>
                              <span className="sm:hidden">{interaction.severity.charAt(0).toUpperCase() + interaction.severity.slice(1)}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4 mt-2 md:mt-0">
                          <span className={`px-2 md:px-4 py-1 md:py-2 rounded-full font-bold text-xs md:text-sm uppercase ${
                            interaction.severity === 'contraindicated' ? 'bg-error text-white' :
                            interaction.severity === 'major' ? 'bg-orange-500 text-white' :
                            interaction.severity === 'moderate' ? 'bg-yellow-500 text-white' :
                            'bg-success text-white'
                          }`}>
                            {interaction.severity}
                          </span>
                          <button className="bg-white border border-outline-variant/30 px-3 md:px-6 py-2 rounded-xl font-bold hover:bg-surface-container-low transition-all flex items-center gap-1 md:gap-2 text-sm">
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            <span className="hidden sm:inline">{t('results.interactions.viewDetails')}</span>
                          </button>
                        </div>
                      </div>
                      <div className="px-4 md:px-6 lg:px-8 pb-4 md:pb-6 lg:pb-8 pt-2 border-t border-on-surface/10">
                        <p className="text-sm md:text-[1rem] leading-relaxed text-on-surface-variant mb-4">
                          {interaction.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </section>

            {/* Action Buttons */}
            <section className="col-span-12 flex flex-wrap gap-3 md:gap-4 justify-center">
              {hasModerateOrSevereInteractions && (
                <button
                  onClick={handleViewAlternatives}
                  className={`px-4 md:px-6 py-3 md:py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2 text-sm md:text-base ${
                    hasSevereInteractions
                      ? 'bg-error text-white animate-pulse'
                      : 'bg-secondary text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg md:text-xl">medication</span>
                  <span className="hidden sm:inline">View Safer Alternatives</span>
                  <span className="sm:hidden">Alternatives</span>
                  {hasSevereInteractions && (
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                      Urgent
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={() => setCurrentScreen('recommendations')}
                className="bg-primary text-white px-4 md:px-6 py-3 md:py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2 text-sm md:text-base"
              >
                <span className="material-symbols-outlined text-lg md:text-xl">medical_services</span>
                <span className="hidden sm:inline">{t('results.actions.viewRecommendations')}</span>
                <span className="sm:hidden">Recommendations</span>
              </button>
              <button
                onClick={resetAnalysis}
                className="bg-surface-container-high text-on-surface px-4 md:px-6 py-3 md:py-4 rounded-xl font-bold hover:bg-surface-container-low transition-all flex items-center gap-2 text-sm md:text-base"
              >
                <span className="material-symbols-outlined text-lg md:text-xl">refresh</span>
                <span className="hidden sm:inline">{t('results.actions.startNew')}</span>
                <span className="sm:hidden">New</span>
              </button>
            </section>
          </div>

          {/* Footer */}
          <footer className="mt-8 md:mt-12 py-6 md:py-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <div className="text-on-surface-variant text-sm font-medium">
              <p>© 2026 Dose-Wise. All rights reserved.</p>
            </div>
            <div className="flex gap-4 md:gap-8">
              <button 
                onClick={handlePrintReport}
                className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined">print</span>
                {t('results.actions.print')}
              </button>
              <button 
                onClick={handleDownloadReport}
                className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined">download</span>
                {t('results.actions.download')}
              </button>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
