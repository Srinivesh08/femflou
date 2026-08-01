import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

const PUBLIC_ROUTES = ['/', '/login', '/forgot-password', '/technology', '/about'];
const FULL_BLEED_ROUTES = ['/', '/login', '/forgot-password', '/technology', '/about'];

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);
  const isFullBleed = FULL_BLEED_ROUTES.includes(location.pathname);
  const isAuthenticatedRoute = !isPublicRoute;

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        showSidebarToggle={isAuthenticatedRoute}
      />

      <Sidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <main
        className={`
          min-h-screen transition-all duration-300
          ${isFullBleed ? '' : 'pt-16'}
          ${
            isAuthenticatedRoute
              ? sidebarCollapsed
                ? 'lg:pl-[72px]'
                : 'lg:pl-[260px]'
              : ''
          }
        `}
      >
        <div className={`${isAuthenticatedRoute ? 'p-4 md:p-6 lg:p-8' : ''}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
