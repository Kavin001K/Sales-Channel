import { useEffect, useState, useCallback } from 'react';

interface DashboardMetrics {
  todayRevenue: number;
  todayTransactions: number;
  todayCustomers: number;
  recentTransaction?: {
    id: string;
    total: number;
    items: number;
    customer?: string;
    timestamp: Date;
  };
}

interface WebSocketMessage {
  type: 'transaction_completed' | 'metrics_update';
  data: any;
}

export function useRealtimeDashboard(companyId: string) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todayRevenue: 0,
    todayTransactions: 0,
    todayCustomers: 0,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Fetch initial metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}/dashboard/today`);
      if (response.ok) {
        const data = await response.json();
        setMetrics({
          todayRevenue: data.total_revenue || 0,
          todayTransactions: data.transaction_count || 0,
          todayCustomers: data.unique_customers || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error);
    }
  }, [companyId]);

  // Connect to WebSocket
  useEffect(() => {
    // Fetch initial data
    fetchMetrics();

    // WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('✅ Dashboard WebSocket connected');
      setIsConnected(true);

      // Subscribe to company events
      websocket.send(JSON.stringify({
        type: 'subscribe',
        companyId,
      }));
    };

    websocket.onclose = () => {
      console.log('❌ Dashboard WebSocket disconnected');
      setIsConnected(false);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        if (message.type === 'transaction_completed') {
          const transaction = message.data;

          // Update metrics incrementally
          setMetrics(prev => ({
            todayRevenue: prev.todayRevenue + transaction.total,
            todayTransactions: prev.todayTransactions + 1,
            todayCustomers: transaction.customerId
              ? prev.todayCustomers + 1 // Simplified - in reality, check if new customer
              : prev.todayCustomers,
            recentTransaction: {
              id: transaction.id,
              total: transaction.total,
              items: transaction.items?.length || 0,
              customer: transaction.customerName,
              timestamp: new Date(transaction.timestamp),
            },
          }));

          console.log('📊 Dashboard updated with new transaction');
        } else if (message.type === 'metrics_update') {
          // Full metrics update from server
          setMetrics(prev => ({
            ...prev,
            ...message.data,
          }));
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [companyId, fetchMetrics]);

  // Manual refresh
  const refresh = useCallback(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    metrics,
    isConnected,
    refresh,
  };
}
