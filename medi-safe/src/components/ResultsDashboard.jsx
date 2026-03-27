import { useApp } from '../context/AppContext';
import { getRiskColor, getSeverityColor } from '../services/rxlabelguard';

export default function ResultsDashboard() {
  const { 
    analysisResults, 
    aiAnalysis,
    userData, 
    setCurrentScreen, 
    setSelectedInteraction,
    resetAnalysis,
  } = useApp();

  const hasResults = analysisResults && analysisResults.interactions !== undefined;
  const interactions = hasResults ? analysisResults.interactions : [];
  const summary = hasResults ? analysisResults.summary : null;
  const riskColors = summary ? getRiskColor(summary.riskLevel) : getRiskColor('safe');

  const handleViewDetails = (interaction) => {
    setSelectedInteraction(interaction);
    setCurrentScreen('deepdive');
  };

  const getRiskLabel = (level) => {
    const labels = {
      safe: 'Safe',
      low: 'Low Risk',
      moderate: 'Moderate',
      high: 'High Risk',
      critical: 'Critical',
    };
    return labels[level] || 'Unknown';
  };

  const getGaugeOffset = (percentage) => {
    const circumference = 691;
    return circumference - (percentage / 100) * circumference;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10 flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-[2.75rem] font-extrabold text-on-surface leading-tight tracking-tight mb-2">
            Here's what we found for your safety
          </h1>
          <p className="text-[1.125rem] text-on-surface-variant font-medium">
            {hasResults 
              ? `Analysis completed • ${new Date(analysisResults.analyzedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'No analysis available. Please complete the intake form.'
            }
          </p>
        </div>
        {hasResults && (
          <div className="flex items-center gap-3 bg-success/10 border border-success/20 px-4 py-2 rounded-full">
            <span className="material-symbols-outlined text-success text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span className="text-[0.75rem] font-bold tracking-widest uppercase text-success">Analysis Complete</span>
          </div>
        )}
      </header>

      {!hasResults ? (
        <div className="bg-surface-container-low rounded-3xl p-12 text-center border border-outline-variant/10">
          <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-on-surface/40 text-4xl">science</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-4">No Analysis Available</h2>
          <p className="text-on-surface/60 max-w-md mx-auto mb-8">
            Please complete the intake form to analyze your medications for potential drug interactions.
          </p>
          <button
            onClick={() => setCurrentScreen('intake')}
            className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all"
          >
            Go to Intake Form
          </button>
        </div>
      ) : (
        <>
          {/* Bento Layout Grid */}
          <div className="grid grid-cols-12 gap-8">
            {/* Risk Summary Card */}
            <section className="col-span-12 lg:col-span-5 bg-white rounded-3xl p-8 shadow-xl shadow-on-surface/5 flex flex-col items-center justify-center text-center border border-outline-variant/10">
              <h3 className="text-[0.75rem] font-bold tracking-widest uppercase text-on-surface-variant mb-8">
                Interaction Risk Index
              </h3>
              <div className="relative w-64 h-64 flex items-center justify-center mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle 
                    className="text-surface-container-high" 
                    cx="128" cy="128" 
                    fill="transparent" 
                    r="110" 
                    stroke="currentColor" 
                    strokeWidth="24" 
                  />
                  <circle
                    className={riskColors.gauge ? '' : 'text-surface-container-high'}
                    style={{ color: riskColors.gauge || '#FDEEDC' }}
                    cx="128"
                    cy="128"
                    fill="transparent"
                    r="110"
                    stroke="currentColor"
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
                  <span className="text-lg font-bold" style={{ color: riskColors.gauge }}>
                    {getRiskLabel(summary?.riskLevel || 'safe')}
                  </span>
                </div>
              </div>
              
              {summary?.riskLevel === 'safe' || summary?.riskLevel === 'low' ? (
                <div className="flex items-center gap-2 bg-success/10 px-6 py-3 rounded-full mb-4 border border-success/20">
                  <span className="material-symbols-outlined text-success" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-[1.125rem] font-bold text-success">Your medications appear safe</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-orange-100 px-6 py-3 rounded-full mb-4 border border-orange-200">
                  <span className="material-symbols-outlined text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  <span className="text-[1.125rem] font-bold text-orange-600">Attention Required</span>
                </div>
              )}
              
              <p className="text-[1rem] text-on-surface-variant leading-relaxed px-6">
                {summary?.message || 'Analyzing your medication combinations...'}
              </p>
            </section>

            {/* Medication List & AI Insights */}
            <section className="col-span-12 lg:col-span-7 space-y-6">
              {/* Medications */}
              <div className="bg-surface-container-low rounded-3xl p-8 h-full border border-outline-variant/10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[1.125rem] font-bold text-on-surface">Analyzed Medications</h3>
                  <span className="px-3 py-1 bg-white rounded-lg border border-outline-variant/15 text-xs font-bold text-on-surface-variant">
                    {analysisResults.medications?.length || 0} ITEMS
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResults.medications?.map((med) => (
                    <div key={med.id || med.name} className="bg-white p-6 rounded-2xl flex items-start gap-4 border border-outline-variant/5">
                      <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <span className="material-symbols-outlined">pill</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface">{med.name}</h4>
                        <p className="text-sm text-on-surface-variant">{med.category || 'Medication'} • {med.dosage || 'As directed'}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {userData.conditions?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-outline-variant/20">
                    <span className="text-xs font-bold text-on-surface/50 uppercase tracking-widest block mb-3">Health Context</span>
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

              {/* AI Insights - Only show when there's actual analysis data */}
              {hasResults && aiAnalysis && (
                <div className="bg-gradient-to-br from-primary/5 to-primary-container/10 rounded-3xl p-6 border border-primary/20">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                    <h3 className="text-lg font-bold text-primary">AI Analysis Summary</h3>
                  </div>
                  <p className="text-on-surface leading-relaxed mb-4">{aiAnalysis.overview}</p>
                  {aiAnalysis.keyConcerns?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-bold text-on-surface/70">Key Concerns:</span>
                      {aiAnalysis.keyConcerns.map((concern, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-primary">•</span>
                          <span className="text-on-surface-variant">{concern}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Interactions Section - Only show when we have actual analysis results */}
            {hasResults && interactions.length > 0 && (
              <section className="col-span-12">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-on-surface">Detected Interactions</h2>
                  <span className="px-3 py-1 bg-error/10 text-error rounded-full text-sm font-bold">
                    {interactions.length} Found
                  </span>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-outline-variant/30 to-transparent" />
                </div>

                {interactions.map((interaction) => {
                  const severity = getSeverityColor(interaction.severity);
                  return (
                    <div
                      key={interaction.id}
                      className={`${severity.bg} rounded-3xl overflow-hidden border ${severity.border} mb-4 shadow-lg`}
                    >
                      <div
                        className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => handleViewDetails(interaction)}
                      >
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 ${severity.text === 'text-error' ? 'bg-error' : severity.text === 'text-tertiary' ? 'bg-tertiary' : 'bg-success'} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
                            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {interaction.severity === 'major' || interaction.severity === 'contraindicated' ? 'warning' : 'info'}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-extrabold text-on-surface">
                              {interaction.drugs.join(' + ')}
                            </h3>
                            <p className={`${severity.text} font-medium flex items-center gap-2`}>
                              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {interaction.severity === 'major' || interaction.severity === 'contraindicated' ? 'error' : 'info'}
                              </span>
                              {interaction.risk} ({interaction.severity.charAt(0).toUpperCase() + interaction.severity.slice(1)})
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`${severity.badge} px-4 py-2 rounded-full font-bold text-sm uppercase`}>
                            {interaction.severity}
                          </span>
                          <button className="bg-white border border-outline-variant/30 px-6 py-2 rounded-xl font-bold hover:bg-surface-container-low transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            View Details
                          </button>
                        </div>
                      </div>
                      <div className="px-8 pb-8 pt-2 border-t border-on-surface/10">
                        <p className="text-[1rem] leading-relaxed text-on-surface-variant mb-4">
                          {interaction.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            {/* No Interactions Found - Only show when we have results but no interactions */}
            {hasResults && interactions.length === 0 && (
              <section className="col-span-12">
                <div className="bg-success/10 rounded-3xl p-12 text-center border border-success/20">
                  <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-success text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <h2 className="text-2xl font-bold text-on-surface mb-2">No Interactions Found</h2>
                  <p className="text-on-surface/60 max-w-md mx-auto">
                    Your current medication combination appears to be safe based on our analysis. Continue taking your medications as prescribed.
                  </p>
                </div>
              </section>
            )}

            {/* Action Buttons */}
            <section className="col-span-12 flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setCurrentScreen('recommendations')}
                className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">medical_services</span>
                View Recommendations
              </button>
              <button
                onClick={resetAnalysis}
                className="bg-surface-container-high text-on-surface px-8 py-4 rounded-xl font-bold hover:bg-surface-container-low transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">refresh</span>
                Start New Analysis
              </button>
            </section>
          </div>

          {/* Footer */}
          <footer className="mt-12 py-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-on-surface-variant text-sm font-medium">
              <p>© 2024 ConflictDetector Clinical Suite. v4.2.0-stable</p>
            </div>
            <div className="flex gap-8">
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-bold">
                <span className="material-symbols-outlined">print</span>
                Print Report
              </button>
              <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-bold">
                <span className="material-symbols-outlined">share</span>
                Share Results
              </button>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
