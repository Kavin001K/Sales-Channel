// src/lib/database.ts

// Security: Input validation and sanitization
const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, '');
  }
  return input;
};

// Security: Validate SQL table names to prevent injection
const isValidTableName = (tableName: string): boolean => {
  const validTables = ['products', 'customers', 'employees', 'transactions', 'companies', 'users', 'subscription_plans', 'company_subscriptions', 'support_tickets', 'support_messages'];
  return validTables.includes(tableName.toLowerCase());
};

// Security: Validate column names to prevent injection
const isValidColumnName = (columnName: string): boolean => {
  const validColumns = ['id', 'name', 'email', 'phone', 'address', 'companyId', 'employeeId', 'customerId', 'price', 'stock', 'category', 'sku', 'barcode', 'description', 'supplier', 'taxRate', 'isActive', 'createdAt', 'updatedAt', 'position', 'salary', 'hireDate', 'items', 'subtotal', 'tax', 'discount', 'total', 'paymentMethod', 'status', 'notes', 'timestamp', 'customerName', 'employeeName', 'receipt', 'paymentDetails', 'loyaltyPoints', 'totalSpent', 'visits', 'visitCount', 'gst', 'unit', 'mrp'];
  return validColumns.includes(columnName.toLowerCase());
};

const isOnline = () => navigator.onLine;

const getElectronApi = () => {
  if (window.electronAPI) {
    return window.electronAPI;
  }
  return null;
};

// --- Hybrid Data Service ---

const localDB = {
  getItem: (key: string) => {
    try {
      // Security: Validate key
      if (!key || typeof key !== 'string' || key.length > 100) {
        console.error('Invalid localStorage key:', key);
        return null;
      }
      
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage`, error);
      return null;
    }
  },
  setItem: (key: string, value: any) => {
    try {
      // Security: Validate key and value
      if (!key || typeof key !== 'string' || key.length > 100) {
        console.error('Invalid localStorage key:', key);
        return;
      }
      
      if (value === undefined || value === null) {
        localStorage.removeItem(key);
        return;
      }
      
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key} in localStorage`, error);
    }
  }
};

const cloudDB = {
  query: async (text: string, params?: any[]) => {
    try {
      // Security: Validate SQL query
      if (!text || typeof text !== 'string') {
        throw new Error("Invalid SQL query");
      }
      
      // Security: Prevent SQL injection by validating table names
      const tableMatch = text.match(/FROM\s+(\w+)/i);
      if (tableMatch && !isValidTableName(tableMatch[1])) {
        throw new Error("Invalid table name in query");
      }
      
      // Security: Validate parameters
      if (params && !Array.isArray(params)) {
        throw new Error("Invalid parameters format");
      }
      
      const electronAPI = getElectronApi();
      if (!electronAPI) {
        throw new Error("Electron API is not available.");
      }
      
      return electronAPI.dbQuery(text, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
};

const createHybridService = (entityName: string, localKey: string) => {
  // Security: Validate entity name
  if (!isValidTableName(entityName + 's')) {
    throw new Error(`Invalid entity name: ${entityName}`);
  }
  
  const pluralEntityName = `${entityName}s`;

  return {
    getAll: async (companyId?: string) => {
      try {
        // Security: Validate companyId
        if (companyId && (typeof companyId !== 'string' || companyId.length > 100)) {
          console.error('Invalid companyId:', companyId);
          return [];
        }
        
        if (isOnline() && getElectronApi()) {
          try {
            let query = `SELECT * FROM ${pluralEntityName}`;
            let params: any[] = [];
            
            if (companyId) {
              query += ` WHERE companyId = $1`;
              params.push(sanitizeInput(companyId));
            }
            
            const data = await cloudDB.query(query, params);
            
            // Security: Validate returned data
            if (Array.isArray(data)) {
              localDB.setItem(localKey, data);
              return data;
            } else {
              console.error('Invalid data format returned from cloud database');
              throw new Error('Invalid data format');
            }
          } catch (error) {
            console.warn(`Could not fetch ${pluralEntityName} from cloud, falling back to local.`, error);
            const localData = localDB.getItem(localKey) || [];
            if (companyId) {
              return localData.filter((item: any) => item.companyId === companyId);
            }
            return localData;
          }
        } else {
          const localData = localDB.getItem(localKey) || [];
          if (companyId) {
            return localData.filter((item: any) => item.companyId === companyId);
          }
          return localData;
        }
      } catch (error) {
        console.error(`Error in getAll for ${pluralEntityName}:`, error);
        return [];
      }
    },
    
    getById: async (id: string, companyId?: string) => {
      try {
        // Security: Validate id and companyId
        if (!id || typeof id !== 'string' || id.length > 100) {
          console.error('Invalid id:', id);
          return null;
        }
        
        if (companyId && (typeof companyId !== 'string' || companyId.length > 100)) {
          console.error('Invalid companyId:', companyId);
          return null;
        }
        
        if (isOnline() && getElectronApi()) {
          try {
            let query = `SELECT * FROM ${pluralEntityName} WHERE id = $1`;
            let params = [sanitizeInput(id)];
            
            if (companyId) {
              query += ` AND companyId = $2`;
              params.push(sanitizeInput(companyId));
            }
            
            const data = await cloudDB.query(query, params);
            return data[0] || null;
          } catch (error) {
            console.warn(`Could not fetch ${entityName} from cloud, falling back to local.`, error);
          }
        }
        
        const allItems = localDB.getItem(localKey) || [];
        let item = allItems.find((item: any) => item.id === id);
        if (companyId && item) {
          item = item.companyId === companyId ? item : null;
        }
        return item || null;
      } catch (error) {
        console.error(`Error in getById for ${entityName}:`, error);
        return null;
      }
    },

    add: async (item: any) => {
      try {
        // Security: Validate item
        if (!item || typeof item !== 'object') {
          throw new Error('Invalid item data');
        }
        
        // Security: Sanitize item data
        const sanitizedItem = Object.keys(item).reduce((acc, key) => {
          if (isValidColumnName(key)) {
            acc[key] = sanitizeInput(item[key]);
          }
          return acc;
        }, {} as any);
        
        const newItem = { 
          ...sanitizedItem, 
          id: sanitizedItem.id || `local_${Date.now()}`, 
          createdAt: new Date(), 
          updatedAt: new Date() 
        };
        
        if (isOnline() && getElectronApi()) {
          try {
            const columns = Object.keys(newItem).join(', ');
            const placeholders = Object.keys(newItem).map((_, i) => `$${i + 1}`).join(', ');
            const values = Object.values(newItem);
            await cloudDB.query(`INSERT INTO ${pluralEntityName} (${columns}) VALUES (${placeholders})`, values);
          } catch (error) {
            console.warn(`Could not add ${entityName} to cloud, saving locally.`, error);
          }
        }
        
        const allItems = localDB.getItem(localKey) || [];
        localDB.setItem(localKey, [...allItems, newItem]);
        return newItem;
      } catch (error) {
        console.error(`Error in add for ${entityName}:`, error);
        throw error;
      }
    },

    update: async (id: string, updates: any) => {
      try {
        // Security: Validate id and updates
        if (!id || typeof id !== 'string' || id.length > 100) {
          throw new Error('Invalid id');
        }
        
        if (!updates || typeof updates !== 'object') {
          throw new Error('Invalid updates data');
        }
        
        // Security: Sanitize updates data
        const sanitizedUpdates = Object.keys(updates).reduce((acc, key) => {
          if (isValidColumnName(key)) {
            acc[key] = sanitizeInput(updates[key]);
          }
          return acc;
        }, {} as any);
        
        const updatedItemData = { ...sanitizedUpdates, updatedAt: new Date() };
        
        if (isOnline() && getElectronApi()) {
          try {
            const setClauses = Object.keys(updatedItemData).map((key, i) => `${key} = $${i + 1}`).join(', ');
            const values = [...Object.values(updatedItemData), sanitizeInput(id)];
            await cloudDB.query(`UPDATE ${pluralEntityName} SET ${setClauses} WHERE id = $${Object.keys(updatedItemData).length + 1}`, values);
          } catch (error) {
            console.warn(`Could not update ${entityName} in cloud, updating locally.`, error);
          }
        }
        
        const allItems = localDB.getItem(localKey) || [];
        const updatedItems = allItems.map((item: any) => item.id === id ? { ...item, ...updatedItemData } : item);
        localDB.setItem(localKey, updatedItems);
        return updatedItems.find((item: any) => item.id === id);
      } catch (error) {
        console.error(`Error in update for ${entityName}:`, error);
        throw error;
      }
    },

    delete: async (id: string) => {
      try {
        // Security: Validate id
        if (!id || typeof id !== 'string' || id.length > 100) {
          throw new Error('Invalid id');
        }
        
        if (isOnline() && getElectronApi()) {
          try {
            await cloudDB.query(`UPDATE ${pluralEntityName} SET isActive = false WHERE id = $1`, [sanitizeInput(id)]);
          } catch (error) {
            console.warn(`Could not delete ${entityName} in cloud, deleting locally.`, error);
          }
        }
        
        const allItems = localDB.getItem(localKey) || [];
        const updatedItems = allItems.map((item: any) => item.id === id ? { ...item, isActive: false } : item);
        localDB.setItem(localKey, updatedItems);
      } catch (error) {
        console.error(`Error in delete for ${entityName}:`, error);
        throw error;
      }
    }
  };
};

// Subscription management services
const subscriptionService = {
  getPlans: async () => {
    if (isOnline() && getElectronApi()) {
      try {
        const data = await cloudDB.query('SELECT * FROM subscription_plans WHERE isActive = true');
        localDB.setItem('subscription_plans', data);
        return data;
      } catch (error) {
        console.warn('Could not fetch subscription plans from cloud, falling back to local.', error);
        return localDB.getItem('subscription_plans') || [];
      }
    } else {
      return localDB.getItem('subscription_plans') || [];
    }
  },

  getCompanySubscription: async (companyId: string) => {
    if (isOnline() && getElectronApi()) {
      try {
        const data = await cloudDB.query(`
          SELECT cs.*, sp.name as planName, sp.description as planDescription, sp.features
          FROM company_subscriptions cs
          JOIN subscription_plans sp ON cs.planId = sp.id
          WHERE cs.companyId = $1 AND cs.status = 'active'
          ORDER BY cs.createdAt DESC
          LIMIT 1
        `, [companyId]);
        return data[0] || null;
      } catch (error) {
        console.warn('Could not fetch company subscription from cloud, falling back to local.', error);
        return localDB.getItem(`company_subscription_${companyId}`) || null;
      }
    } else {
      return localDB.getItem(`company_subscription_${companyId}`) || null;
    }
  },

  createSubscription: async (subscription: any) => {
    const newSubscription = { ...subscription, id: subscription.id || `sub_${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
    if (isOnline() && getElectronApi()) {
      try {
        const columns = Object.keys(newSubscription).join(', ');
        const placeholders = Object.keys(newSubscription).map((_, i) => `$${i + 1}`).join(', ');
        const values = Object.values(newSubscription);
        await cloudDB.query(`INSERT INTO company_subscriptions (${columns}) VALUES (${placeholders})`, values);
      } catch (error) {
        console.warn('Could not create subscription in cloud, saving locally.', error);
      }
    }
    localDB.setItem(`company_subscription_${newSubscription.companyId}`, newSubscription);
    return newSubscription;
  }
};

// Support ticket service
const supportService = {
  getTickets: async (companyId?: string) => {
    if (isOnline() && getElectronApi()) {
      try {
        let query = 'SELECT * FROM support_tickets';
        let params: any[] = [];
        
        if (companyId) {
          query += ' WHERE companyId = $1';
          params.push(sanitizeInput(companyId));
        }
        
        query += ' ORDER BY createdAt DESC';
        const data = await cloudDB.query(query, params);
        localDB.setItem('support_tickets', data);
        return data;
      } catch (error) {
        console.warn('Could not fetch support tickets from cloud, falling back to local.', error);
        const localData = localDB.getItem('support_tickets') || [];
        if (companyId) {
          return localData.filter((ticket: any) => ticket.companyId === companyId);
        }
        return localData;
      }
    } else {
      const localData = localDB.getItem('support_tickets') || [];
      if (companyId) {
        return localData.filter((ticket: any) => ticket.companyId === companyId);
      }
      return localData;
    }
  },

  createTicket: async (ticket: any) => {
    const newTicket = { ...ticket, id: ticket.id || `ticket_${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
    if (isOnline() && getElectronApi()) {
      try {
        const columns = Object.keys(newTicket).join(', ');
        const placeholders = Object.keys(newTicket).map((_, i) => `$${i + 1}`).join(', ');
        const values = Object.values(newTicket);
        await cloudDB.query(`INSERT INTO support_tickets (${columns}) VALUES (${placeholders})`, values);
      } catch (error) {
        console.warn('Could not create support ticket in cloud, saving locally.', error);
      }
    }
    const allTickets = localDB.getItem('support_tickets') || [];
    localDB.setItem('support_tickets', [...allTickets, newTicket]);
    return newTicket;
  },

  addMessage: async (message: any) => {
    const newMessage = { ...message, id: message.id || `msg_${Date.now()}`, createdAt: new Date() };
    const all = localDB.getItem('support_messages') || [];
    localDB.setItem('support_messages', [...all, newMessage]);
    return newMessage;
  },
  getMessagesForConversation: async (conversationId: string) => {
    const all = localDB.getItem('support_messages') || [];
    return all.filter((m: any) => m.conversationId === conversationId).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
};

// User authentication service
const userService = {
  // Simple password hashing (in production, use bcrypt)
  hashPassword: (password: string) => {
    return btoa(password); // Base64 encoding for demo (use bcrypt in production)
  },

  verifyPassword: (password: string, hashedPassword: string) => {
    return btoa(password) === hashedPassword;
  },

  createUser: async (userData: any) => {
    const hashedPassword = userService.hashPassword(userData.password);
    const newUser = {
      ...userData,
      id: userData.id || `user_${Date.now()}`,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isOnline() && getElectronApi()) {
      try {
        const columns = Object.keys(newUser).join(', ');
        const placeholders = Object.keys(newUser).map((_, i) => `$${i + 1}`).join(', ');
        const values = Object.values(newUser);
        await cloudDB.query(`INSERT INTO users (${columns}) VALUES (${placeholders})`, values);
      } catch (error) {
        console.warn('Could not create user in cloud, saving locally.', error);
      }
    }
    
    const allUsers = localDB.getItem('users') || [];
    localDB.setItem('users', [...allUsers, newUser]);
    return { ...newUser, password: undefined }; // Don't return password
  },

  authenticateUser: async (email: string, password: string) => {
    if (isOnline() && getElectronApi()) {
      try {
        const data = await cloudDB.query('SELECT * FROM users WHERE email = $1 AND isActive = true', [sanitizeInput(email)]);
        if (data.length > 0) {
          const user = data[0];
          if (userService.verifyPassword(password, user.password)) {
            // Update last login
            await cloudDB.query('UPDATE users SET lastLogin = NOW() WHERE id = $1', [user.id]);
            return { ...user, password: undefined };
          }
        }
        return null;
      } catch (error) {
        console.warn('Could not authenticate user from cloud, trying local.', error);
      }
    }
    
    const allUsers = localDB.getItem('users') || [];
    const user = allUsers.find((u: any) => u.email === email && u.isActive);
    if (user && userService.verifyPassword(password, user.password)) {
      // Update last login locally
      const updatedUsers = allUsers.map((u: any) => 
        u.id === user.id ? { ...u, lastLogin: new Date() } : u
      );
      localDB.setItem('users', updatedUsers);
      return { ...user, password: undefined };
    }
    return null;
  },

  getUserById: async (id: string) => {
    if (isOnline() && getElectronApi()) {
      try {
        const data = await cloudDB.query('SELECT * FROM users WHERE id = $1 AND isActive = true', [sanitizeInput(id)]);
        if (data.length > 0) {
          return { ...data[0], password: undefined };
        }
      } catch (error) {
        console.warn('Could not fetch user from cloud, trying local.', error);
      }
    }
    
    const allUsers = localDB.getItem('users') || [];
    const user = allUsers.find((u: any) => u.id === id && u.isActive);
    return user ? { ...user, password: undefined } : null;
  },

  updateUser: async (id: string, updates: any) => {
    const updatedUserData = { ...updates, updatedAt: new Date() };
    
    if (isOnline() && getElectronApi()) {
      try {
        const setClauses = Object.keys(updatedUserData).map((key, i) => `${key} = $${i + 1}`).join(', ');
        const values = [...Object.values(updatedUserData), sanitizeInput(id)];
        await cloudDB.query(`UPDATE users SET ${setClauses} WHERE id = $${Object.keys(updatedUserData).length + 1}`, values);
      } catch (error) {
        console.warn('Could not update user in cloud, updating locally.', error);
      }
    }
    
    const allUsers = localDB.getItem('users') || [];
    const updatedUsers = allUsers.map((user: any) => 
      user.id === id ? { ...user, ...updatedUserData } : user
    );
    localDB.setItem('users', updatedUsers);
    
    const updatedUser = updatedUsers.find((u: any) => u.id === id);
    return updatedUser ? { ...updatedUser, password: undefined } : null;
  },

  getAllUsers: async (companyId?: string) => {
    if (isOnline() && getElectronApi()) {
      try {
        let query = 'SELECT * FROM users WHERE isActive = true';
        let params: any[] = [];
        
        if (companyId) {
          query += ' AND companyId = $1';
          params.push(sanitizeInput(companyId));
        }
        
        const data = await cloudDB.query(query, params);
        return data.map((user: any) => ({ ...user, password: undefined }));
      } catch (error) {
        console.warn('Could not fetch users from cloud, falling back to local.', error);
      }
    }
    
    const allUsers = localDB.getItem('users') || [];
    let users = allUsers.filter((user: any) => user.isActive);
    
    if (companyId) {
      users = users.filter((user: any) => user.companyId === companyId);
    }
    
    return users.map((user: any) => ({ ...user, password: undefined }));
  }
};

export const productService = createHybridService('product', 'products');
export const customerService = createHybridService('customer', 'customers');
export const employeeService = createHybridService('employee', 'employees');
export const transactionService = createHybridService('transaction', 'transactions');
export const companyService = createHybridService('company', 'companies');
export const subscriptionPlanService = subscriptionService;
export const supportTicketService = supportService;
export const authService = userService;

// Settings service
export const settingsService = {
    getAll: async () => {
        if (isOnline() && getElectronApi()) {
            try {
                const data = await cloudDB.query(`SELECT key, value FROM settings`);
                const settingsObject = data.reduce((acc: any, row: any) => {
                    acc[row.key] = row.value;
                    return acc;
                }, {});
                localDB.setItem('settings', settingsObject);
                return settingsObject;
            } catch (error) {
                console.warn('Could not fetch settings from cloud, falling back to local.', error);
                return localDB.getItem('settings') || {};
            }
        } else {
            return localDB.getItem('settings') || {};
        }
    },
    update: async (settings: any) => {
        if (isOnline() && getElectronApi()) {
            try {
                const client = await getElectronApi().dbQuery('BEGIN');
                for(const [key, value] of Object.entries(settings)) {
                    await getElectronApi().dbQuery('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2', [key, value]);
                }
                await getElectronApi().dbQuery('COMMIT');

            } catch (error) {
                 await getElectronApi().dbQuery('ROLLBACK');
                console.warn('Could not update settings in cloud, updating locally.', error);
            }
        }
        const currentSettings = localDB.getItem('settings') || {};
        const newSettings = { ...currentSettings, ...settings };
        localDB.setItem('settings', newSettings);
        return newSettings;
    }
};

// Extend the window interface
declare global {
  interface Window {
    electronAPI: {
      dbQuery: (text: string, params?: any[]) => Promise<any>;
    };
  }
}
