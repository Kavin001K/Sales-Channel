import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

// Real-time WebSocket Server for live data synchronization
export class RealtimeSync {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<WebSocket>> = new Map();
  private static instance: RealtimeSync;

  private constructor() {}

  static getInstance(): RealtimeSync {
    if (!RealtimeSync.instance) {
      RealtimeSync.instance = new RealtimeSync();
    }
    return RealtimeSync.instance;
  }

  initialize(server: Server): void {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      console.log('📡 New WebSocket connection');

      // Handle client messages
      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());

          switch (data.type) {
            case 'subscribe':
              this.handleSubscribe(ws, data.companyId);
              break;
            case 'unsubscribe':
              this.handleUnsubscribe(ws, data.companyId);
              break;
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('📡 WebSocket connection closed');
        this.removeClient(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.removeClient(ws);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'WebSocket connection established',
        timestamp: Date.now()
      }));
    });

    console.log('✅ WebSocket server initialized');
  }

  private handleSubscribe(ws: WebSocket, companyId: string): void {
    if (!this.clients.has(companyId)) {
      this.clients.set(companyId, new Set());
    }
    this.clients.get(companyId)!.add(ws);
    console.log(`📡 Client subscribed to company: ${companyId}`);

    ws.send(JSON.stringify({
      type: 'subscribed',
      companyId,
      timestamp: Date.now()
    }));
  }

  private handleUnsubscribe(ws: WebSocket, companyId: string): void {
    const companyClients = this.clients.get(companyId);
    if (companyClients) {
      companyClients.delete(ws);
      if (companyClients.size === 0) {
        this.clients.delete(companyId);
      }
    }
    console.log(`📡 Client unsubscribed from company: ${companyId}`);
  }

  private removeClient(ws: WebSocket): void {
    this.clients.forEach((clients, companyId) => {
      clients.delete(ws);
      if (clients.size === 0) {
        this.clients.delete(companyId);
      }
    });
  }

  // Broadcast data change to all subscribed clients
  broadcast(companyId: string, event: {
    type: 'create' | 'update' | 'delete';
    entity: 'product' | 'customer' | 'transaction' | 'employee';
    data: any;
  }): void {
    const clients = this.clients.get(companyId);
    if (!clients || clients.size === 0) return;

    const message = JSON.stringify({
      ...event,
      timestamp: Date.now()
    });

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });

    console.log(`📡 Broadcasted ${event.type} ${event.entity} to ${clients.size} clients`);
  }

  // Broadcast analytics update
  broadcastAnalytics(companyId: string, analytics: any): void {
    const clients = this.clients.get(companyId);
    if (!clients || clients.size === 0) return;

    const message = JSON.stringify({
      type: 'analytics',
      data: analytics,
      timestamp: Date.now()
    });

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Send message to specific client
  sendToClient(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  // Get connection stats
  getStats(): {
    totalConnections: number;
    companiesWithConnections: number;
    connectionsByCompany: Record<string, number>;
  } {
    const connectionsByCompany: Record<string, number> = {};
    let totalConnections = 0;

    this.clients.forEach((clients, companyId) => {
      connectionsByCompany[companyId] = clients.size;
      totalConnections += clients.size;
    });

    return {
      totalConnections,
      companiesWithConnections: this.clients.size,
      connectionsByCompany
    };
  }

  close(): void {
    if (this.wss) {
      this.wss.close();
      console.log('✅ WebSocket server closed');
    }
  }
}

export const realtimeSync = RealtimeSync.getInstance();
