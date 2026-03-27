import { useApp } from '../context/AppContext';
import { getSeverityColor } from '../services/rxlabelguard';

export default function InteractionDeepDive() {
  const { selectedInteraction, setCurrentScreen, analysisResults, aiAnalysis } = useApp();

  const interaction = selectedInteraction;
  const severity = interaction ? getSeverityColor(interaction.severity) : null;

  const severityInfo = {
    contraindicated: { level: 'Critical', percent: 95, label: 'Do Not Combine' },
    major: { level: 'High', percent: 75, label: 'High Risk' },
    moderate: { level: 'Moderate', percent: 50, label: 'Monitor Closely' },
    minor: { level: 'Low', percent: 25, label: 'Generally Safe' },
    unknown: { level: 'Unknown', percent: 10, label: 'Limited Data' },
  };

  const info = interaction ? severityInfo[interaction.severity] || severityInfo.unknown : severityInfo.unknown;

  if (!interaction) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-surface-container-low rounded-3xl p-12 text-center border border-outline-variant/10">
          <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-on-surface/40 text-4xl">search</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-4">No Interaction Selected</h2>
          <p className="text-on-surface/60 max-w-md mx-auto mb-8">
            Please select an interaction from the results page to view detailed information.
          </p>
          <button
            onClick={() => setCurrentScreen('results')}
            className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all"
          >
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <header className="mb-12">
        <div className="flex items-center gap-2 text-primary font-bold mb-6">
          <div className="flex items-center gap-2 bg-secondary-container/30 px-4 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-sm" data-icon="favorite">favorite</span>
            <span className="text-xs tracking-wider uppercase">Your safety matters</span>
          </div>
        </div>
        <div
          className="flex items-center gap-2 text-on-surface-variant/60 mb-4 hover:text-primary cursor-pointer transition-colors w-fit"
          onClick={() => setCurrentScreen('results')}
        >
          <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
          <span className="text-sm font-bold tracking-wider uppercase">Back to Summary</span>
        </div>
        <h1 className="text-[3rem] font-bold text-on-surface leading-tight tracking-tight mb-4">
          Detailed Interaction Analysis
        </h1>
        <p className="text-xl text-on-surface-variant max-w-2xl font-normal">
          In-depth clinical analysis of the interaction between <span className="font-bold text-primary">{interaction.drugs[0]}</span> and <span className="font-bold text-primary">{interaction.drugs[1]}</span>.
        </p>
      </header>

      {/* Interaction Alert Hero Card */}
      <section className="mb-12 rounded-3xl overflow-hidden bg-gradient-to-br from-error-container/50 to-surface-container-high p-1 shadow-sm">
        <div className="bg-surface-container-lowest rounded-[1.25rem] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl ${severity.text === 'text-error' ? 'bg-error/10' : severity.text === 'text-tertiary' ? 'bg-tertiary/10' : 'bg-success/10'} flex items-center justify-center`}>
              <span className={`material-symbols-outlined text-4xl ${severity.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {severity.text === 'text-error' ? 'warning' : 'info'}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <span className="text-[1.75rem] font-bold text-on-surface">{interaction.drugs[0]}</span>
                <span className="material-symbols-outlined text-on-surface-variant/40">swap_horiz</span>
                <span className="text-[1.75rem] font-bold text-on-surface">{interaction.drugs[1]}</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`${severity.badge} px-4 py-1 rounded-lg font-black text-sm uppercase tracking-wider`}>
                  {info.label}
                </span>
                <span className="text-on-surface-variant text-sm font-semibold">Risk: {interaction.risk}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[0.7rem] font-black text-on-surface-variant/40 tracking-widest uppercase mb-2">Data Privacy</span>
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
              Clinical Analysis
            </h3>
            <div className="space-y-6 text-[18px] leading-relaxed text-on-surface-variant">
              <p>{interaction.description}</p>
              
              {interaction.mechanism && (
                <div className="p-6 bg-surface-container-high/40 rounded-2xl border-l-4 border-primary">
                  <h4 className="font-bold text-on-surface mb-2">Mechanism of Interaction</h4>
                  <p className="italic font-medium">{interaction.mechanism}</p>
                </div>
              )}

              {aiAnalysis?.riskExplanation && (
                <div className="p-6 bg-secondary-container/20 rounded-2xl border-l-4 border-secondary-container">
                  <h4 className="font-bold text-on-secondary-container mb-2">Personalized Context</h4>
                  <p className="text-on-surface-variant">{aiAnalysis.riskExplanation}</p>
                </div>
              )}
            </div>
          </section>

          {/* Recommendations */}
          <section className="bg-surface-container-low border border-outline-variant/20 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined">rule</span>
              Safety Recommendations
            </h3>
            <div className="space-y-4">
              {interaction.recommendations?.map((rec, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 p-5 bg-surface-container-lowest border rounded-2xl hover:border-primary-container transition-colors group ${
                    rec.startsWith('⚠️') ? 'border-orange-300 bg-orange-50' : 'border-outline-variant/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-primary mt-1 group-hover:scale-110 transition-transform">
                    {rec.startsWith('⚠️') ? 'warning' : rec.includes('DO NOT') ? 'block' : 'check_circle'}
                  </span>
                  <p className={`text-on-surface font-medium ${rec.startsWith('⚠️') ? 'text-orange-700' : ''}`}>{rec}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Side Panels */}
        <div className="space-y-8">
          {/* Severity Meter */}
          <section className="bg-surface-container-low border border-outline-variant/20 rounded-3xl p-8">
            <h3 className="text-xs font-black tracking-widest uppercase text-on-surface-variant/60 mb-6">Risk Assessment</h3>
            <div className="relative h-3 w-full bg-surface-container-high rounded-full mb-8 overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${info.percent}%`,
                  backgroundColor: severity.text === 'text-error' ? '#D32F2F' : severity.text === 'text-tertiary' ? '#E9C46A' : '#2ECC71'
                }}
              />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-on-surface-variant">Severity Level</span>
                <span className={`font-black ${severity.text}`}>{info.level}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-on-surface-variant">Risk Category</span>
                <span className="font-black text-on-surface">{info.label}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-on-surface-variant">Evidence</span>
                <span className="font-black text-on-surface">FDA Label Data</span>
              </div>
            </div>
          </section>

          {/* AI Insights Panel */}
          {aiAnalysis && (
            <section className="bg-gradient-to-br from-primary/10 to-primary-container/20 rounded-3xl p-8 border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                <h3 className="text-lg font-bold text-primary">AI Analysis</h3>
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
            <h3 className="text-xl font-bold mb-2">Need Professional Help?</h3>
            <p className="text-white/80 text-sm mb-6 leading-relaxed font-medium">
              Connect with a clinical pharmacist to discuss how this interaction applies to your specific health history.
            </p>
            <button className="w-full bg-white text-primary py-4 rounded-2xl font-black hover:bg-secondary-container transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
              <span className="material-symbols-outlined">phone</span>
              Consult a Pharmacist
            </button>
          </section>

          {/* Data Control */}
          <section className="p-6 border border-outline-variant/20 rounded-3xl bg-surface-container-lowest">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary-container font-bold">lock</span>
              <span className="text-xs font-black text-on-surface uppercase tracking-widest">Privacy</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
              Your interaction data is processed locally. <span className="font-bold text-primary">Your data is never stored</span> on our servers.
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
          View Complete Recommendations
        </button>
      </div>
    </div>
  );
}
