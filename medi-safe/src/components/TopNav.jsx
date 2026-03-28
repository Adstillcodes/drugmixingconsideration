import { useApp } from '../context/AppContext';
import LanguageSwitcher from '../i18n/LanguageSwitcher';

export default function TopNav() {
  const { setCurrentScreen } = useApp();

  return (
    <nav className="bg-[#FFFBF7]/80 backdrop-blur-md fixed top-0 z-50 w-full flex justify-between items-center px-8 py-4 border-b border-surface-container-high">
      <div className="flex items-center gap-8">
        <span className="text-2xl font-bold text-primary tracking-tighter cursor-pointer" onClick={() => setCurrentScreen('intake')}>
          MediSafe
        </span>
        <div className="hidden md:flex items-center gap-8">
          <a className="text-on-surface/60 hover:text-primary transition-colors font-medium text-[16px]" href="#">Dashboard</a>
          <a className="text-on-surface/60 hover:text-primary transition-colors font-medium text-[16px]" href="#">History</a>
          <a className="text-on-surface/60 hover:text-primary transition-colors font-medium text-[16px]" href="#">Resources</a>
          <a className="text-on-surface/60 hover:text-primary transition-colors font-medium text-[16px]" href="#">Support</a>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <button className="material-symbols-outlined text-on-surface/60 p-2 hover:bg-surface-container-low rounded-lg transition-all">notifications</button>
        <button className="material-symbols-outlined text-on-surface/60 p-2 hover:bg-surface-container-low rounded-lg transition-all">account_circle</button>
        <button className="bg-primary-container text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-transform active:scale-95 shadow-sm">
          Save Report
        </button>
      </div>
    </nav>
  );
}
