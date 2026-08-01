import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Upload,
  History,
  Settings,
  BarChart3,
  Stethoscope,
  ChevronLeft,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/history', label: 'History', icon: History },
  { to: '/calibration', label: 'Calibration', icon: BarChart3 },
  { to: '/doctor-portal', label: 'Doctor Portal', icon: Stethoscope },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const isAuthenticatedRoute =
    location.pathname !== '/' && location.pathname !== '/login';

  if (!isAuthenticatedRoute) return null;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        className={`
          fixed top-16 left-0 bottom-0 z-30
          bg-surface border-r border-border/60
          flex flex-col
          transition-all duration-300 ease-out
          ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-[260px]'}
          ${isOpen ? 'w-[260px] translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile close & collapse toggle */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-border/40">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-gray-100 transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-gray-100 transition-colors hidden lg:flex"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `
                flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-body-sm font-medium transition-all duration-200
                group relative
                ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted hover:text-foreground hover:bg-gray-100/80'
                }
                ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
              `.trim()
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="hidden lg:block">{item.label}</span>
                  )}
                  <span className="lg:hidden">{item.label}</span>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <span className="
                      absolute left-full ml-2 px-2 py-1 text-xs font-medium
                      bg-foreground text-white rounded-md
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all duration-200 whitespace-nowrap
                      hidden lg:block z-50
                    ">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-border/40">
          <NavLink
            to="/calibration"
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-body-sm font-medium text-muted
              hover:text-foreground hover:bg-gray-100/80 transition-all
              ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}
            `}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="hidden lg:block">Settings</span>}
            <span className="lg:hidden">Settings</span>
          </NavLink>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
