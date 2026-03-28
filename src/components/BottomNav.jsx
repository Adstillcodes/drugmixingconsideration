import { useApp } from '../context/AppContext';

const bottomNavItems = [
  { id: 'intake', icon: 'edit_note', label: 'Intake' },
  { id: 'processing', icon: 'hourglass_empty', label: 'Analysis' },
  { id: 'results', icon: 'analytics', label: 'Results' },
  { id: 'deepdive', icon: 'swap_horiz', label: 'Details' },
  { id: 'recommendations', icon: 'medical_services', label: 'Guidance' },
];

export default function BottomNav() {
  const { currentScreen, setCurrentScreen } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-surface-container-high flex justify-around items-center py-3 px-1 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {bottomNavItems.map((item) => (
        <div
          key={item.id}
          className={`flex flex-col items-center cursor-pointer transition-colors min-w-[60px] ${
            currentScreen === item.id ? 'text-primary font-bold' : 'text-on-surface/50'
          }`}
          onClick={() => setCurrentScreen(item.id)}
        >
          <span className="material-symbols-outlined text-xl" data-icon={item.icon}>
            {item.icon}
          </span>
          <span className="text-[9px] sm:text-[10px] mt-0.5">{item.label}</span>
        </div>
      ))}
    </nav>
  );
}
