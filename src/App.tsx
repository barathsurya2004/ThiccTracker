import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import TabBar from './components/TabBar';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import PlanScreen from './screens/PlanScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import DashboardScreen from './screens/DashboardScreen';
import SettingsScreen from './screens/SettingsScreen';

function Root() {
  const { screen, isAuthed } = useApp();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && savedTheme !== 'system') {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    const savedAccent = localStorage.getItem('accent-name');
    const savedHue = localStorage.getItem('accent-hue');
    if (savedAccent && savedHue) {
      const isLime = savedAccent === 'Lime';
      document.documentElement.style.setProperty('--accent', `oklch(${isLime ? '0.88 0.19' : '0.74 0.17'} ${savedHue})`);
      document.documentElement.style.setProperty('--accent-ink', isLime ? 'oklch(0.20 0.05 130)' : 'oklch(0.99 0.005 240)');
    }
  }, []);

  const renderScreen = () => {
    if (!isAuthed || screen === 'login') return <LoginScreen />;
    switch (screen) {
      case 'home':      return <HomeScreen />;
      case 'plan':      return <PlanScreen />;
      case 'workout':   return <WorkoutScreen />;
      case 'dashboard': return <DashboardScreen />;
      case 'settings':  return <SettingsScreen />;
      default:          return <HomeScreen />;
    }
  };

  const showTabs = isAuthed && screen !== 'login';

  return (
    <div className="app">
      {renderScreen()}
      {showTabs && <TabBar />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}
