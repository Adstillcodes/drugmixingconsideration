import { useApp } from '../context/AppContext';
import LanguageSwitcher from '../i18n/LanguageSwitcher';

export default function TopNav() {
  const { setCurrentScreen } = useApp();

  return (
    <nav className="bg-[#FFFBF7]/80 backdrop-blur-md fixed top-0 z-50 w-full flex justify-between items-center px-8 py-4 border-b border-surface-container-high">
      <div className="flex items-center gap-8">
        <span className="text-2xl font-bold text-primary tracking-tighter cursor-pointer" onClick={() => setCurrentScreen('intake')}>
          Dose-Wise
        </span>
        <div className="hidden md:flex items-center gap-8">
         
        </div>
      </div>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
       
      </div>
    </nav>
  );
}
