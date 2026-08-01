import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Menu,
  Bell,
  Search,
  User,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  showSidebarToggle?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  showSidebarToggle = true,
}) => {
  const location = useLocation();
  const publicRoutes = ['/', '/login', '/forgot-password', '/technology', '/about'];
  const isAuthenticatedRoute = !publicRoutes.includes(location.pathname);

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="
        fixed top-0 left-0 right-0 z-40
        h-16 px-4 md:px-6
        glass-strong
        border-b border-border/40
        flex items-center justify-between
      "
    >
      {/* Left section */}
      <div className="flex items-center gap-3">
        {showSidebarToggle && isAuthenticatedRoute && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-gray-100/80 transition-colors lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link to="/" className="flex items-center gap-3 group">
          {/* Logo mark */}
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
            <span className="text-white font-bold text-sm">FF</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-foreground leading-none tracking-tight">
              FEMFLOU
            </h1>
            <p className="text-[0.625rem] text-muted leading-tight mt-0.5 max-w-[200px] truncate">
              Empowering Every Pregnancy Through Intelligent Screening
            </p>
          </div>
        </Link>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1.5">
        {isAuthenticatedRoute && (
          <>
            <button
              className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-gray-100/80 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-xl text-muted hover:text-foreground hover:bg-gray-100/80 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-critical rounded-full" />
            </button>
            <div className="w-px h-6 bg-border mx-1.5 hidden sm:block" />
            <button
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-gray-100/80 transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-body-sm font-medium text-foreground hidden sm:block">
                Dr. User
              </span>
            </button>
          </>
        )}

        {!isAuthenticatedRoute && (
          <Link
            to="/login"
            className="
              inline-flex items-center h-9 px-4 text-sm font-medium
              text-white bg-primary rounded-xl
              hover:bg-primary-600 transition-colors shadow-soft
            "
          >
            Sign In
          </Link>
        )}
      </div>
    </motion.header>
  );
};

export default Navbar;
