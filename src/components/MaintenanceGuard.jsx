import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isMaintenanceMode, isRouteAllowed } from '../config/maintenance';

export default function MaintenanceGuard({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkMaintenanceMode = () => {
      // Skip check if already on maintenance page
      if (location.pathname === '/maintenance') {
        return;
      }

      // Check if maintenance mode is active
      if (isMaintenanceMode()) {
        // Check if current route is allowed during maintenance
        if (!isRouteAllowed(location.pathname)) {
          console.log('🔧 Maintenance mode active - redirecting to maintenance page');
          navigate('/maintenance', { replace: true });
        }
      }
    };

    checkMaintenanceMode();
  }, [location.pathname, navigate]);

  // If maintenance mode is active and current route is not allowed, don't render children
  if (isMaintenanceMode() && !isRouteAllowed(location.pathname) && location.pathname !== '/maintenance') {
    return null; // Guard will redirect, so don't render anything
  }

  return children;
}