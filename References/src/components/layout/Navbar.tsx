import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, Layers, BarChart3 } from 'lucide-react';

const Navbar: React.FC = () => {
  const items = [
    { to: '/',          icon: Home,      label: 'Today',    end: true  },
    { to: '/workout',   icon: Dumbbell,  label: 'Workout',  end: false },
    { to: '/plan',      icon: Layers,    label: 'Plans',    end: false },
    { to: '/dashboard', icon: BarChart3, label: 'Progress', end: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/92 backdrop-blur-xl">
      <div className="mx-auto grid max-w-md grid-cols-4 px-4 pb-6 pt-2">
        {items.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg py-2 transition-colors ${
                isActive ? 'text-on-surface' : 'text-ink-3 hover:text-on-surface'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  strokeWidth={1.75}
                  className={isActive ? 'text-primary' : ''}
                />
                <span className="font-mono text-[10px] font-medium uppercase tracking-wider">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
