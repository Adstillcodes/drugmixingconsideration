export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr', flag: '🇧🇩' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl', flag: '🇵🇰' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr', flag: '🇮🇳' },
];

export const defaultLanguage = 'en';

export function getLanguageByCode(code) {
  return supportedLanguages.find(lang => lang.code === code) || supportedLanguages[0];
}

export function isRTL(code) {
  const lang = getLanguageByCode(code);
  return lang.dir === 'rtl';
}
