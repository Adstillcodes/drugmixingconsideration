import { useApp } from '../context/AppContext';

export default function Recommendations() {
  const { selectedInteraction, analysisResults, aiAnalysis, userData, setCurrentScreen } = useApp();

  const interaction = selectedInteraction;
  const hasResults = analysisResults && analysisResults.interactions;

  const recommendations = {
    contraindicated: [
      {
        step: 1,
        title: 'STOP Taking These Together',
        desc: 'These medications should never be combined. Stop taking both and seek immediate medical attention.',
        icon: 'emergency',
        urgent: true,
      },
      {
        step: 2,
        title: 'Contact Your Doctor',
        desc: 'Call your prescribing physician or healthcare provider immediately to discuss alternative options.',
        icon: 'phone',
        urgent: true,
      },
      {
        step: 3,
        title: 'Seek Emergency Care',
        desc: 'If you are currently taking both medications, consider visiting an urgent care or emergency department.',
        icon: 'local_hospital',
        urgent: true,
      },
    ],
    major: [
      {
        step: 1,
        title: 'Consult Your Physician',
        desc: 'Schedule an appointment with your doctor immediately to discuss this interaction and possible alternatives.',
        icon: 'medical_information',
        urgent: true,
      },
      {
        step: 2,
        title: 'Do Not Stop Abruptly',
        desc: 'Do not stop taking any medications without medical supervision. Some medications require gradual discontinuation.',
        icon: 'warning',
        urgent: false,
      },
      {
        step: 3,
        title: 'Consider Alternatives',
        desc: 'Ask your doctor about safer alternatives that achieve the same therapeutic goals without the interaction risk.',
        icon: 'swap_horiz',
        urgent: false,
      },
    ],
    moderate: [
      {
        step: 1,
        title: 'Monitor for Symptoms',
        desc: 'Pay close attention to any unusual symptoms or side effects while taking these medications together.',
        icon: 'visibility',
        urgent: false,
      },
      {
        step: 2,
        title: 'Consider Timing Separation',
        desc: 'Ask your pharmacist if taking these medications at different times of day could reduce the interaction risk.',
        icon: 'schedule',
        urgent: false,
      },
      {
        step: 3,
        title: 'Schedule a Review',
        desc: 'Schedule a medication review with your doctor or pharmacist within the next week to discuss this combination.',
        icon: 'calendar_today',
        urgent: false,
      },
    ],
    minor: [
      {
        step: 1,
        title: 'Be Aware',
        desc: 'While generally safe, be aware of any mild side effects that may occur from this combination.',
        icon: 'info',
        urgent: false,
      },
      {
        step: 2,
        title: 'Regular Monitoring',
        desc: 'Continue with your regular check-ups. Inform your doctor about all medications you are taking.',
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
  const drugs = interaction ? interaction.drugs : ['Your Medications'];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <header className="mb-12">
        <h1 className="text-[3.5rem] font-extrabold text-on-surface leading-[1.1] mb-4">
          Your Path to Safety
        </h1>
        <p className="text-[1.125rem] text-on-surface-variant max-w-2xl leading-relaxed">
          Based on our analysis of your medication combination, here are the recommended next steps to ensure your safety and well-being.
        </p>
      </header>

      {/* Bento Grid Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Action Plan */}
        <section className="lg:col-span-8 bg-surface-container-low border border-surface-container-high rounded-xl p-8 space-y-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-[1.75rem] font-bold text-on-surface">What You Should Do Next</h2>
            <div className="flex gap-2">
              {hasResults && analysisResults.summary?.riskLevel === 'critical' || hasResults && analysisResults.summary?.riskLevel === 'high' ? (
                <span className="bg-error text-white px-4 py-1 rounded-full text-[0.75rem] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  Priority: Urgent
                </span>
              ) : (
                <span className="bg-tertiary text-white px-4 py-1 rounded-full text-[0.75rem] font-bold uppercase tracking-wider">
                  Priority: Moderate
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
                <h3 className="text-lg font-bold text-primary">AI Recommendations</h3>
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
            <button className="w-full bg-primary-container text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:opacity-95 transition-all shadow-lg shadow-primary-container/20">
              <span className="material-symbols-outlined">share</span>
              Share with Your Doctor
            </button>
            <button className="w-full bg-surface-container-high text-on-surface py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-secondary-container transition-all">
              <span className="material-symbols-outlined">download</span>
              Save Full Report
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="space-y-3">
            <a className="flex items-center justify-between p-4 bg-surface-container-low border border-surface-container-high rounded-xl hover:bg-surface-container-high transition-all group cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">calendar_today</span>
                <span className="font-semibold">Book Appointment</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
            </a>
            <a className="flex items-center justify-between p-4 bg-surface-container-low border border-surface-container-high rounded-xl hover:bg-surface-container-high transition-all group cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">local_pharmacy</span>
                <span className="font-semibold">Find Pharmacy</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:translate-x-1 transition-transform">chevron_right</span>
            </a>
          </div>

          {/* Trust Signals */}
          <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-6 text-white overflow-hidden relative shadow-lg">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </div>
                <div>
                  <p className="text-[0.75rem] font-bold uppercase tracking-widest opacity-80">HIPAA Compliant</p>
                  <p className="text-sm font-semibold">Your data is secure</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>medical_information</span>
                </div>
                <div>
                  <p className="text-[0.75rem] font-bold uppercase tracking-widest opacity-80">FDA Verified</p>
                  <p className="text-sm font-semibold">Based on drug labels</p>
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
            <h4 className="font-bold text-on-surface mb-2">Important Disclaimer</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              This analysis is for informational purposes only and does not replace professional medical advice. 
              Always consult with a qualified healthcare provider before making any changes to your medication regimen. 
              If you are experiencing any adverse effects, seek medical attention immediately.
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
          Back to Results
        </button>
        <button
          className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all"
          onClick={() => setCurrentScreen('intake')}
        >
          <span className="material-symbols-outlined">refresh</span>
          Start New Analysis
        </button>
      </div>
    </div>
  );
}
