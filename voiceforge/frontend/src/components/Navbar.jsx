import { NavLink } from 'react-router-dom';
import { Home, Mic, Brain, Package, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'الرئيسية' },
  { to: '/inference', icon: Mic, label: 'تحويل' },
  { to: '/training', icon: Brain, label: 'تدريب' },
  { to: '/models', icon: Package, label: 'نماذج' },
  { to: '/settings', icon: Settings, label: 'إعدادات' },
];

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-surface-light z-50">
      <div className="max-w-2xl mx-auto flex justify-around items-center h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-text-muted hover:text-text'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-xs">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
