import { useState, useEffect } from 'react';
import { getDeviceType, throttle } from '../utils/performance';

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  isTouchDevice: boolean;
  isLowEndDevice: boolean;
  connectionType: 'slow' | 'fast' | 'unknown';
}

export const useDeviceOptimization = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: getDeviceType(),
    width: window.innerWidth,
    height: window.innerHeight,
    isTouchDevice: 'ontouchstart' in window,
    isLowEndDevice: false,
    connectionType: 'unknown'
  });

  useEffect(() => {
    // Detect low-end devices (simplified heuristic)
    const isLowEnd = navigator.hardwareConcurrency <= 2 || 
                     navigator.deviceMemory <= 2;
    
    // Detect connection type
    const connection = (navigator as any).connection;
    let connectionType: 'slow' | 'fast' | 'unknown' = 'unknown';
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      connectionType = effectiveType === '4g' ? 'fast' : 'slow';
    }

    const updateDeviceInfo = throttle(() => {
      setDeviceInfo({
        type: getDeviceType(),
        width: window.innerWidth,
        height: window.innerHeight,
        isTouchDevice: 'ontouchstart' in window,
        isLowEndDevice: isLowEnd,
        connectionType
      });
    }, 250);

    window.addEventListener('resize', updateDeviceInfo);
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  // Optimization recommendations based on device
  const getOptimizations = () => {
    return {
      shouldVirtualize: deviceInfo.type === 'mobile' && deviceInfo.isLowEndDevice,
      shouldLazyLoad: deviceInfo.connectionType === 'slow',
      chunkSize: deviceInfo.type === 'mobile' ? 20 : 50,
      animationDuration: deviceInfo.isLowEndDevice ? 150 : 300,
      shouldPreloadImages: deviceInfo.connectionType === 'fast' && deviceInfo.type === 'desktop',
      maxConcurrentRequests: deviceInfo.isLowEndDevice ? 2 : 6
    };
  };

  return { deviceInfo, optimizations: getOptimizations() };
};