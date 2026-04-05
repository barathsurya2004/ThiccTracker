import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Play, PieChart } from 'lucide-react';

const Navbar: React.FC = () => {
  const navItems = [
    { to: '/', icon: <Home size={22} />, label: 'Home' },
    { to: '/plan', icon: <ClipboardList size={22} />, label: 'Plan' },
    { to: '/workout', icon: <Play size={22} />, label: 'Workout' },
    { to: '/dashboard', icon: <PieChart size={22} />, label: 'Dashboard' },
  ];

  return (
    <nav className="fixed bottom-6 w-full flex justify-center items-center z-50 pointer-events-none px-4">
      <div className="bg-white/80 backdrop-blur-2xl w-full max-w-md rounded-full px-2 py-2 shadow-lg flex justify-around items-center pointer-events-auto border border-white/20">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center rounded-full px-5 py-2 transition-all duration-300 ${
                isActive 
                  ? 'bg-primary-container text-primary scale-105 shadow-sm' 
                  : 'text-on-surface-variant hover:bg-surface-container-low active:scale-95'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-medium tracking-wide uppercase mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
