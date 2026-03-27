import { useApp } from '../context/AppContext';

const bottomNavItems = [
  { id: 'intake', icon: 'edit_note', label: 'Intake' },
  { id: 'processing', icon: 'analytics', label: 'Analysis' },
  { id: 'results', icon: 'history', label: 'History' },
  { id: 'profile', icon: 'account_circle', label: 'Profile' },
];

export default function BottomNav() {
  const { currentScreen, setCurrentScreen } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-surface-container-high flex justify-around items-center py-4 px-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      {bottomNavItems.map((item) => (
        <div
          key={item.id}
          className={`flex flex-col items-center cursor-pointer transition-colors ${
            currentScreen === item.id ? 'text-primary font-bold' : 'text-on-surface/50'
          }`}
          onClick={() => setCurrentScreen(item.id)}
        >
          <span className="material-symbols-outlined" data-icon={item.icon}>
            {item.icon}
          </span>
          <span className="text-[10px] mt-1">{item.label}</span>
        </div>
      ))}
    </nav>
  );
}
