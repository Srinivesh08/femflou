import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { HomePage, LoginPage, ForgotPasswordPage, DashboardPage, UploadPage, ResultsPage, CalibrationPage, HistoryPage, DoctorPortalPage, PlaceholderPage, TechnologyPage } from '@/pages';

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
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
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
        element: <DashboardPage />,
      },
      {
        path: '/upload',
        element: <UploadPage />,
      },
      {
        path: '/results/:id',
        element: <ResultsPage />,
      },
      {
        path: '/calibration',
        element: <CalibrationPage />,
      },
      {
        path: '/history',
        element: <HistoryPage />,
      },
      {
        path: '/doctor-portal',
        element: <DoctorPortalPage />,
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
