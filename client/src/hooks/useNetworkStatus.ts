import { useEffect, useState } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastChange, setLastChange] = useState<Date>(new Date());

  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      setLastChange(new Date());
    };
    const onOffline = () => {
      setIsOnline(false);
      setLastChange(new Date());
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return { isOnline, lastChange };
};


