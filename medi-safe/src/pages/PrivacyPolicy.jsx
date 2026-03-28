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
              <h2 className="text-xl font-bold text-on-surface mb-4">{t('privacyPolicy.introduction.title')}</h2>
              <p className="text-on-surface-variant leading-relaxed">
                {t('privacyPolicy.introduction.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-4">{t('privacyPolicy.informationWeCollect.title')}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-on-surface mb-2">{t('privacyPolicy.informationWeCollect.personalInfo.subtitle')}</h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    {t('privacyPolicy.informationWeCollect.personalInfo.desc')}
                  </p>
                  <ul className="list-disc list-inside text-on-surface-variant mt-2 space-y-1 pl-4">
                    {t('privacyPolicy.informationWeCollect.personalInfo.items', { returnObjects: true }).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface mb-2">{t('privacyPolicy.informationWeCollect.prescriptionData.subtitle')}</h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    {t('privacyPolicy.informationWeCollect.prescriptionData.desc')}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-on-surface mb-2">{t('privacyPolicy.informationWeCollect.usageData.subtitle')}</h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    {t('privacyPolicy.informationWeCollect.usageData.desc')}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-4">{t('privacyPolicy.howWeUse.title')}</h2>
              <p className="text-on-surface-variant leading-relaxed">
                {t('privacyPolicy.howWeUse.desc')}
              </p>
              <ul className="list-disc list-inside text-on-surface-variant mt-2 space-y-1 pl-4">
                {t('privacyPolicy.howWeUse.items', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-4">{t('privacyPolicy.dataSecurity.title')}</h2>
              <p className="text-on-surface-variant leading-relaxed">
                {t('privacyPolicy.dataSecurity.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-4">{t('privacyPolicy.dataRetention.title')}</h2>
              <p className="text-on-surface-variant leading-relaxed">
                {t('privacyPolicy.dataRetention.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-4">{t('privacyPolicy.disclosure.title')}</h2>
              <p className="text-on-surface-variant leading-relaxed">
                {t('privacyPolicy.disclosure.desc')}
              </p>
              <ul className="list-disc list-inside text-on-surface-variant mt-2 space-y-1 pl-4">
                {t('privacyPolicy.disclosure.items', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-4">{t('privacyPolicy.thirdParty.title')}</h2>
              <p className="text-on-surface-variant leading-relaxed">
                {t('privacyPolicy.thirdParty.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-4">{t('privacyPolicy.yourRights.title')}</h2>
              <p className="text-on-surface-variant leading-relaxed">
                {t('privacyPolicy.yourRights.desc')}
              </p>
              <ul className="list-disc list-inside text-on-surface-variant mt-2 space-y-1 pl-4">
                {t('privacyPolicy.yourRights.items', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-4">{t('privacyPolicy.childrensPrivacy.title')}</h2>
              <p className="text-on-surface-variant leading-relaxed">
                {t('privacyPolicy.childrensPrivacy.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-4">{t('privacyPolicy.changes.title')}</h2>
              <p className="text-on-surface-variant leading-relaxed">
                {t('privacyPolicy.changes.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-on-surface mb-4">{t('privacyPolicy.contact.title')}</h2>
              <p className="text-on-surface-variant leading-relaxed">
                {t('privacyPolicy.contact.desc')}
              </p>
              <ul className="list-disc list-inside text-on-surface-variant mt-2 space-y-1 pl-4">
                {t('privacyPolicy.contact.items', { returnObjects: true }).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-outline-variant/20 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-on-surface-variant text-sm">
          <p>{t('privacyPolicy.footer')}</p>
        </div>
      </footer>
    </div>
  );
}
