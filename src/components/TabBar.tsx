import { useApp } from '../context/AppContext';
import type { Screen } from '../context/AppContext';
import { Home, Plan, Play, Chart, Gear } from './Icons';

const items: { id: Screen; label: string; Icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { id: 'home',      label: 'Today',    Icon: Home },
  { id: 'plan',      label: 'Plan',     Icon: Plan },
  { id: 'workout',   label: 'Workout',  Icon: Play },
  { id: 'dashboard', label: 'Progress', Icon: Chart },
  { id: 'settings',  label: 'Settings', Icon: Gear },
];

export default function TabBar() {
  const { screen, setScreen } = useApp();
  return (
    <nav className="tabbar">
      {items.map(({ id, label, Icon }) => (
        <button key={id} className={screen === id ? 'on' : ''} onClick={() => setScreen(id)}>
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
