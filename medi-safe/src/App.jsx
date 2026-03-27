import { AppProvider, useApp } from './context/AppContext';
import TopNav from './components/TopNav';
import SideNav from './components/SideNav';
import BottomNav from './components/BottomNav';
import IntakeForm from './components/IntakeForm';
import ProcessingScreen from './components/ProcessingScreen';
import ResultsDashboard from './components/ResultsDashboard';
import InteractionDeepDive from './components/InteractionDeepDive';
import Recommendations from './components/Recommendations';

function AppContent() {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'intake':
        return <IntakeForm />;
      case 'processing':
        return <ProcessingScreen />;
      case 'results':
        return <ResultsDashboard />;
      case 'deepdive':
        return <InteractionDeepDive />;
      case 'recommendations':
        return <Recommendations />;
      default:
        return <IntakeForm />;
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <TopNav />
      <SideNav />
      <main className="lg:ml-64 pt-24 pb-12 px-6">
        {renderScreen()}
      </main>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
