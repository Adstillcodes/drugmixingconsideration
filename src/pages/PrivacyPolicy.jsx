import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

export default function PrivacyPolicy() {
  const { setCurrentScreen } = useApp();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <header className="bg-white border-b border-outline-variant/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentScreen('intake')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-medium">{t('privacyPolicy.backToHome')}</span>
          </button>
          <h1 className="text-lg font-bold text-primary">Dose-Wise</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-outline-variant/10">
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-2">
            {t('privacyPolicy.title')}
          </h1>
          <p className="text-on-surface-variant mb-8">{t('privacyPolicy.lastUpdated')}</p>

          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <p className="text-on-surface-variant leading-relaxed text-lg">
                {t('privacyPolicy.intro')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-4">{t('privacyPolicy.whatWeDontDo.title')}</h2>
              <ul className="list-disc list-inside text-on-surface-variant space-y-2 pl-4">
                {t('privacyPolicy.whatWeDontDo.items', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-4">{t('privacyPolicy.howItWorks.title')}</h2>
              <p className="text-on-surface-variant leading-relaxed">
                {t('privacyPolicy.howItWorks.content')}
              </p>
            </section>

            <section>
              <p className="text-on-surface-variant leading-relaxed text-lg font-medium">
                {t('privacyPolicy.noCookies')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-4">{t('privacyPolicy.yourRights.title')}</h2>
              <p className="text-on-surface-variant leading-relaxed">
                {t('privacyPolicy.yourRights.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-4">{t('privacyPolicy.changes.title')}</h2>
              <p className="text-on-surface-variant leading-relaxed">
                {t('privacyPolicy.changes.content')}
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
