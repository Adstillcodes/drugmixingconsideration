import { useApp } from '../context/AppContext';

function getSeverityBadgeColor(severity) {
  const colors = {
    contraindicated: 'bg-error text-white',
    major: 'bg-orange-500 text-white',
    moderate: 'bg-yellow-500 text-white',
    minor: 'bg-success text-white',
    unknown: 'bg-gray-500 text-white',
  };
  return colors[severity] || colors.unknown;
}

function getCostBadgeColor(cost) {
  if (!cost) return 'bg-gray-100 text-gray-600';
  
  const costLower = cost.toLowerCase();
  
  if (costLower.includes('$5') || costLower.includes('$10')) {
    return 'bg-success/10 text-success border border-success/20';
  }
  if (costLower.includes('$50') || costLower.includes('$80') || costLower.includes('$100')) {
    return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
  }
  if (costLower.includes('$200') || costLower.includes('$300') || costLower.includes('$400')) {
    return 'bg-orange-100 text-orange-700 border border-orange-200';
  }
  if (costLower.includes('$500') || costLower.includes('$600') || costLower.includes('$800') || costLower.includes('$1000')) {
    return 'bg-error/10 text-error border border-error/20';
  }
  
  return 'bg-gray-100 text-gray-600';
}

export default function AlternativesDashboard() {
  const { analysisResults, setCurrentScreen, setSelectedInteraction } = useApp();

  const alternatives = analysisResults?.alternatives;
  const interactions = analysisResults?.interactions || [];

  const handleBackToResults = () => {
    setCurrentScreen('results');
  };

  const handleViewDetails = (interaction) => {
    setSelectedInteraction(interaction);
    setCurrentScreen('deepdive');
  };

  const getInteractionAlternatives = (interactionId) => {
    return alternatives?.interactionAlternatives?.find(alt => alt.id === interactionId)?.alternatives || null;
  };

  if (!analysisResults || !alternatives) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-surface-container-low rounded-3xl p-12 text-center border border-outline-variant/10">
          <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-on-surface/40 text-4xl">medication</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-4">No Alternatives Available</h2>
          <p className="text-on-surface/60 max-w-md mx-auto mb-8">
            There are no detected interactions requiring alternatives in your current medication list.
          </p>
          <button
            onClick={handleBackToResults}
            className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all"
          >
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  const moderateOrSevereInteractions = interactions.filter(
    i => ['contraindicated', 'major', 'moderate'].includes(i.severity)
  );

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleBackToResults}
            className="p-2 rounded-xl hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-[2.75rem] font-extrabold text-on-surface leading-tight tracking-tight">
            Safer Alternatives
          </h1>
        </div>
        <p className="text-on-surface-variant text-lg ml-14">
          Suggested medication alternatives based on detected interactions
        </p>
      </header>

      {!alternatives.hasAlternatives && moderateOrSevereInteractions.length === 0 ? (
        <div className="bg-success/10 rounded-3xl p-12 text-center border border-success/20">
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-success text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">No Alternatives Needed</h2>
          <p className="text-on-surface/60 max-w-md mx-auto">
            Your current medications don't have any moderate or severe interactions requiring alternatives.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {moderateOrSevereInteractions.map((interaction) => {
            const alts = getInteractionAlternatives(interaction.id);
            const hasAlts = alts && (alts.drug1Alternatives.length > 0 || alts.drug2Alternatives.length > 0);
            
            return (
              <div
                key={interaction.id}
                className="bg-white rounded-3xl overflow-hidden border border-outline-variant/10 shadow-lg"
              >
                <div
                  className="p-6 bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors"
                  onClick={() => handleViewDetails(interaction)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${interaction.severity === 'contraindicated' || interaction.severity === 'major' ? 'bg-error/10 text-error' : 'bg-yellow-100 text-yellow-700'}`}>
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {interaction.severity === 'contraindicated' || interaction.severity === 'major' ? 'warning' : 'info'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-on-surface">
                          {interaction.drugs.join(' + ')}
                        </h3>
                        <p className="text-on-surface-variant text-sm">
                          {interaction.risk}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getSeverityBadgeColor(interaction.severity)}`}>
                        {interaction.severity}
                      </span>
                      <button className="bg-white border border-outline-variant/30 px-4 py-2 rounded-xl text-sm font-bold hover:bg-surface-container-low transition-all flex items-center gap-2">
                        View Details
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>

                {hasAlts ? (
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>medication</span>
                      <h4 className="font-bold text-on-surface">Suggested Alternatives</h4>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {alts.drug1Alternatives.length > 0 && (
                        <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                          <h5 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                            <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-primary text-sm">swap_horiz</span>
                            </span>
                            Instead of <span className="text-primary font-extrabold">{interaction.drugs[0]}</span>
                          </h5>
                          <div className="space-y-3">
                            {alts.drug1Alternatives.map((alt, idx) => (
                              <div key={idx} className="bg-white rounded-xl p-4 border border-outline-variant/10">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold text-on-surface">{alt.name}</span>
                                      <span className="px-2 py-0.5 bg-surface-container-low rounded text-xs text-on-surface-variant">
                                        {alt.class}
                                      </span>
                                    </div>
                                    <p className="text-sm text-on-surface-variant">{alt.reason}</p>
                                  </div>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCostBadgeColor(alt.genericCost)}`}>
                                    Generic: {alt.genericCost || 'N/A'}
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCostBadgeColor(alt.brandCost)}`}>
                                    Brand: {alt.brandCost || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {alts.drug2Alternatives.length > 0 && (
                        <div className="bg-secondary/5 rounded-2xl p-5 border border-secondary/10">
                          <h5 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                            <span className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-secondary text-sm">swap_horiz</span>
                            </span>
                            Instead of <span className="text-secondary font-extrabold">{interaction.drugs[1]}</span>
                          </h5>
                          <div className="space-y-3">
                            {alts.drug2Alternatives.map((alt, idx) => (
                              <div key={idx} className="bg-white rounded-xl p-4 border border-outline-variant/10">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold text-on-surface">{alt.name}</span>
                                      <span className="px-2 py-0.5 bg-surface-container-low rounded text-xs text-on-surface-variant">
                                        {alt.class}
                                      </span>
                                    </div>
                                    <p className="text-sm text-on-surface-variant">{alt.reason}</p>
                                  </div>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCostBadgeColor(alt.genericCost)}`}>
                                    Generic: {alt.genericCost || 'N/A'}
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCostBadgeColor(alt.brandCost)}`}>
                                    Brand: {alt.brandCost || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {alts.generalAdvice && alts.generalAdvice.length > 0 && (
                      <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-orange-500 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                          <div>
                            <span className="font-bold text-orange-700">Important Note</span>
                            <ul className="mt-2 space-y-1">
                              {alts.generalAdvice.map((advice, idx) => (
                                <li key={idx} className="text-sm text-orange-700">• {advice}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-on-surface-variant">No specific alternatives found for this interaction.</p>
                    <p className="text-sm text-on-surface/60 mt-1">Consult your healthcare provider for personalized recommendations.</p>
                  </div>
                )}
              </div>
            );
          })}

          {alternatives.aiSuggestions && alternatives.aiSuggestions.generalAdvice && (
            <div className="bg-gradient-to-br from-primary/5 to-primary-container/10 rounded-3xl p-6 border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                <h3 className="text-lg font-bold text-primary">AI Recommendations</h3>
              </div>
              <ul className="space-y-2">
                {alternatives.aiSuggestions.generalAdvice.map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-on-surface">
                    <span className="text-primary">•</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleBackToResults}
          className="bg-surface-container-high text-on-surface px-8 py-4 rounded-xl font-bold hover:bg-surface-container-low transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Results
        </button>
      </div>
    </div>
  );
}
