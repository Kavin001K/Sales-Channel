import React from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export const OfflineBadge: React.FC = () => {
  const { isOnline, lastChange } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 12,
        right: 12,
        background: '#FDE68A',
        color: '#92400E',
        border: '1px solid #F59E0B',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12,
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        zIndex: 9999,
      }}
      title={`Last change: ${lastChange.toLocaleString()}`}
    >
      Offline mode: changes are saved locally and will sync when back online
    </div>
  );
};

export default OfflineBadge;


