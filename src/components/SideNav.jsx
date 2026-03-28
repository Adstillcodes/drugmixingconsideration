import { useApp } from '../context/AppContext';

const navItems = [
  { id: 'intake', icon: 'edit_note', label: 'Intake' },
  { id: 'processing', icon: 'hourglass_empty', label: 'Analysis' },
  { id: 'results', icon: 'analytics', label: 'Results' },
  { id: 'deepdive', icon: 'swap_horiz', label: 'Details' },
  { id: 'recommendations', icon: 'medical_services', label: 'Guidance' },
];

export default function SideNav() {
  const { currentScreen, setCurrentScreen } = useApp();

  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col pt-24 bg-surface-container-low w-64 border-r border-surface-container-high z-40 hidden lg:flex">
      <div className="px-6 mb-8">
        <h2 className="text-lg font-bold text-primary">Clinical Sanctuary</h2>
        <p className="text-[10px] text-on-surface/50 uppercase tracking-widest mt-1">System Active • FDA Verified</p>
      </div>
      <nav className="flex-1">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`py-3 pl-6 my-1 transition-transform flex items-center gap-3 cursor-pointer ${
              currentScreen === item.id
                ? 'bg-primary text-white rounded-r-full shadow-md'
                : 'text-on-surface/70 hover:translate-x-1'
            }`}
            onClick={() => setCurrentScreen(item.id)}
          >
            <span className="material-symbols-outlined" data-icon={item.icon}>
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </div>
        ))}
      </nav>
      <div className="p-6">
        <button
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold shadow-sm hover:opacity-90 transition-all"
          onClick={() => setCurrentScreen('intake')}
        >
          New Analysis
        </button>
      </div>
      <div className="p-4 border-t border-surface-container-high mt-auto">
        <div 
          className="text-on-surface/70 py-2 px-2 flex items-center gap-3 cursor-pointer hover:bg-surface-container-high rounded-lg transition-all"
          onClick={() => setCurrentScreen('privacy')}
        >
          <span className="material-symbols-outlined text-sm">privacy_tip</span>
          <span className="text-xs font-medium">Privacy Policy</span>
        </div>
        <div className="text-on-surface/70 py-2 px-2 flex items-center gap-3 cursor-pointer hover:bg-surface-container-high rounded-lg transition-all">
          
        </div>
      </div>
    </aside>
  );
}
