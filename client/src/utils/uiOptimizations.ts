/**
 * UI Optimization utilities for enhanced user experience
 * Addresses: Touch interfaces, accessibility, performance
 */

// Touch-friendly sizing constants
export const TOUCH_TARGET_SIZE = {
  MINIMUM: 44, // iOS HIG minimum
  COMFORTABLE: 48, // Material Design recommendation
  LARGE: 56 // For primary actions
};

// Animation performance settings based on device capability
export const getAnimationConfig = (isLowEndDevice: boolean) => ({
  duration: isLowEndDevice ? 150 : 300,
  easing: 'ease-out',
  stagger: isLowEndDevice ? 50 : 100
});

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1440
} as const;

// UI enhancement utilities
export class UIOptimizer {
  static enhanceFormInputs(): void {
    // Prevent zoom on iOS for inputs
    const style = document.createElement('style');
    style.textContent = `
      input, textarea, select {
        font-size: 16px !important;
      }
      @media (max-width: ${BREAKPOINTS.mobile}px) {
        input, textarea, select {
          font-size: 16px !important;
          transform: translateZ(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  static optimizeScrolling(): void {
    // Enhanced scrolling for mobile
    const scrollContainers = document.querySelectorAll('.billing-scroll-container');
    scrollContainers.forEach(container => {
      (container as HTMLElement).style.webkitOverflowScrolling = 'touch';
      (container as HTMLElement).style.scrollBehavior = 'smooth';
    });
  }

  static enhanceAccessibility(): void {
    // Add focus indicators for keyboard navigation
    const style = document.createElement('style');
    style.textContent = `
      .focus-visible:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  static optimizeForPWA(): void {
    // Add viewport meta for PWA optimization
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(viewport);
    }

    // Add theme color
    if (!document.querySelector('meta[name="theme-color"]')) {
      const themeColor = document.createElement('meta');
      themeColor.name = 'theme-color';
      themeColor.content = '#3b82f6';
      document.head.appendChild(themeColor);
    }
  }
}

// Color scheme optimization
export const getOptimalColors = (deviceType: 'mobile' | 'tablet' | 'desktop') => {
  const baseColors = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#ffffff',
    surface: '#f8fafc'
  };

  // Mobile devices benefit from higher contrast
  if (deviceType === 'mobile') {
    return {
      ...baseColors,
      primary: '#2563eb', // Darker blue for better mobile visibility
      success: '#059669', // Darker green
      background: '#ffffff',
      text: '#111827' // Higher contrast text
    };
  }

  return baseColors;
};

// Typography optimization
export const getOptimalTypography = (deviceType: 'mobile' | 'tablet' | 'desktop') => ({
  body: {
    fontSize: deviceType === 'mobile' ? '14px' : '16px',
    lineHeight: deviceType === 'mobile' ? '1.4' : '1.6'
  },
  heading: {
    fontSize: {
      mobile: { h1: '24px', h2: '20px', h3: '18px' },
      tablet: { h1: '32px', h2: '24px', h3: '20px' },
      desktop: { h1: '36px', h2: '28px', h3: '24px' }
    }[deviceType]
  }
});

// Layout optimization helpers
export const getOptimalLayout = (deviceType: 'mobile' | 'tablet' | 'desktop') => ({
  spacing: {
    xs: deviceType === 'mobile' ? '4px' : '8px',
    sm: deviceType === 'mobile' ? '8px' : '12px',
    md: deviceType === 'mobile' ? '12px' : '16px',
    lg: deviceType === 'mobile' ? '16px' : '24px',
    xl: deviceType === 'mobile' ? '24px' : '32px'
  },
  grid: {
    columns: {
      mobile: 1,
      tablet: 2,
      desktop: 3
    }[deviceType]
  },
  sidebar: {
    width: deviceType === 'mobile' ? '100%' : '320px',
    position: deviceType === 'mobile' ? 'fixed' : 'relative'
  }
});

// Performance monitoring for UI elements
export class UIPerformanceMonitor {
  private static renderTimes = new Map<string, number[]>();

  static startRender(componentName: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (!this.renderTimes.has(componentName)) {
        this.renderTimes.set(componentName, []);
      }
      
      this.renderTimes.get(componentName)!.push(renderTime);
      
      // Log slow renders (>16ms for 60fps)
      if (renderTime > 16) {
        console.warn(`Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    };
  }

  static getReport(): Record<string, { average: number; max: number; count: number }> {
    const report: Record<string, { average: number; max: number; count: number }> = {};
    
    this.renderTimes.forEach((times, componentName) => {
      const average = times.reduce((a, b) => a + b, 0) / times.length;
      const max = Math.max(...times);
      
      report[componentName] = {
        average: Number(average.toFixed(2)),
        max: Number(max.toFixed(2)),
        count: times.length
      };
    });
    
    return report;
  }
}