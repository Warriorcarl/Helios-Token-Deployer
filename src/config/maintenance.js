// Maintenance mode configuration
export const MAINTENANCE_CONFIG = {
  // Set this to true to enable maintenance mode
  IS_MAINTENANCE_MODE: false,
  
  // Alternative: Use environment variable (recommended for production)
  // IS_MAINTENANCE_MODE: import.meta.env.VITE_MAINTENANCE_MODE === 'true',
  
  // Maintenance message configuration
  MAINTENANCE_MESSAGE: {
    title: "Under Maintenance",
    subtitle: "We're currently performing scheduled maintenance to improve your experience.",
    description: "We'll be back online shortly. Thank you for your patience!",
    estimatedTime: "We're working as fast as we can!",
    contactInfo: null // Add contact info if needed
  },
  
  // Routes that should remain accessible during maintenance (admin routes, etc.)
  ALLOWED_ROUTES: [
    '/maintenance',
    // Add any admin routes that should remain accessible
  ],
  
  // IP addresses that can bypass maintenance mode (for testing)
  BYPASS_IPS: [
    // '127.0.0.1',
    // '::1',
  ]
};

// Helper function to check if maintenance mode is active
export const isMaintenanceMode = () => {
  // Check environment variable first (takes precedence)
  if (import.meta.env.VITE_MAINTENANCE_MODE !== undefined) {
    return import.meta.env.VITE_MAINTENANCE_MODE === 'true';
  }
  
  // Fall back to config setting
  return MAINTENANCE_CONFIG.IS_MAINTENANCE_MODE;
};

// Helper function to check if current route is allowed during maintenance
export const isRouteAllowed = (pathname) => {
  return MAINTENANCE_CONFIG.ALLOWED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
};