// Environment configuration for the application
export interface Config {
  database: {
    url: string;
    ssl: boolean;
  };
  app: {
    name: string;
    version: string;
    environment: 'development' | 'production' | 'test';
  };
  security: {
    jwtSecret: string;
    bcryptRounds: number;
  };
}

// Validate required environment variables
const validateEnvVar = (name: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

// Get configuration from environment variables
export const getConfig = (): Config => {
  const environment = (import.meta.env.MODE || 'development') as Config['app']['environment'];
  
  return {
    database: {
      url: validateEnvVar('VITE_DATABASE_URL', import.meta.env.VITE_DATABASE_URL),
      ssl: environment === 'production'
    },
    app: {
      name: 'Sales Channel POS',
      version: '1.0.0',
      environment
    },
    security: {
      jwtSecret: validateEnvVar('VITE_JWT_SECRET', import.meta.env.VITE_JWT_SECRET || 'default-secret-change-in-production'),
      bcryptRounds: 10
    }
  };
};

// Export a singleton instance
export const config = getConfig();

// Helper function to check if we're in development
export const isDevelopment = (): boolean => config.app.environment === 'development';

// Helper function to check if we're in production
export const isProduction = (): boolean => config.app.environment === 'production';
