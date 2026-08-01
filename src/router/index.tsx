import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { HomePage, LoginPage, PlaceholderPage, TechnologyPage } from '@/pages';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/technology',
        element: <TechnologyPage />,
      },
      {
        path: '/about',
        element: <TechnologyPage />,
      },
      {
        path: '/dashboard',
        element: (
          <PlaceholderPage
            title="Dashboard"
            description="Your screening overview and analytics will appear here."
          />
        ),
      },
      {
        path: '/upload',
        element: (
          <PlaceholderPage
            title="Upload"
            description="Upload patient data and imaging for AI-powered analysis."
          />
        ),
      },
      {
        path: '/results/:id',
        element: (
          <PlaceholderPage
            title="Results"
            description="Detailed screening results and risk assessment will be displayed here."
          />
        ),
      },
      {
        path: '/calibration',
        element: (
          <PlaceholderPage
            title="Calibration"
            description="Model calibration and configuration settings."
          />
        ),
      },
      {
        path: '/history',
        element: (
          <PlaceholderPage
            title="History"
            description="Browse and search your past screening records."
          />
        ),
      },
      {
        path: '/doctor-portal',
        element: (
          <PlaceholderPage
            title="Doctor Portal"
            description="Clinician-facing tools and patient management."
          />
        ),
      },
      {
        path: '/privacy',
        element: (
          <PlaceholderPage
            title="Privacy Policy"
            description="Our privacy and data protection policies."
          />
        ),
      },
      {
        path: '/terms',
        element: (
          <PlaceholderPage
            title="Terms of Service"
            description="Terms and conditions for using FEMFLOU."
          />
        ),
      },
      {
        path: '/contact',
        element: (
          <PlaceholderPage
            title="Contact"
            description="Get in touch with the FEMFLOU team."
          />
        ),
      },
      {
        path: '*',
        element: (
          <PlaceholderPage
            title="Page Not Found"
            description="The page you're looking for doesn't exist."
          />
        ),
      },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
