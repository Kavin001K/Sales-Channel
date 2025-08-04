// src/lib/database.ts

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
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage`, error);
      return null;
    }
  },
  setItem: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key} in localStorage`, error);
    }
  }
};

const cloudDB = {
  query: async (text: string, params?: any[]) => {
    const electronAPI = getElectronApi();
    if (!electronAPI) {
      throw new Error("Electron API is not available.");
    }
    return electronAPI.dbQuery(text, params);
  }
};

const createHybridService = (entityName: string, localKey: string) => {
  const pluralEntityName = `${entityName}s`;

  return {
    getAll: async () => {
      if (isOnline() && getElectronApi()) {
        try {
          const data = await cloudDB.query(`SELECT * FROM ${pluralEntityName}`);
          localDB.setItem(localKey, data);
          return data;
        } catch (error) {
          console.warn(`Could not fetch ${pluralEntityName} from cloud, falling back to local.`, error);
          return localDB.getItem(localKey) || [];
        }
      } else {
        return localDB.getItem(localKey) || [];
      }
    },
    
    getById: async (id: string) => {
       if (isOnline() && getElectronApi()) {
        try {
          const data = await cloudDB.query(`SELECT * FROM ${pluralEntityName} WHERE id = $1`, [id]);
          return data[0] || null;
        } catch (error) {
          console.warn(`Could not fetch ${entityName} from cloud, falling back to local.`, error);
        }
      }
      const allItems = localDB.getItem(localKey) || [];
      return allItems.find((item: any) => item.id === id) || null;
    },

    add: async (item: any) => {
        const newItem = { ...item, id: item.id || `local_${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
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
    },

    update: async (id: string, updates: any) => {
        const updatedItemData = { ...updates, updatedAt: new Date() };
      if (isOnline() && getElectronApi()) {
        try {
            const setClauses = Object.keys(updatedItemData).map((key, i) => `${key} = $${i + 1}`).join(', ');
            const values = [...Object.values(updatedItemData), id];
          await cloudDB.query(`UPDATE ${pluralEntityName} SET ${setClauses} WHERE id = $${Object.keys(updatedItemData).length + 1}`, values);
        } catch (error) {
          console.warn(`Could not update ${entityName} in cloud, updating locally.`, error);
        }
      }
      const allItems = localDB.getItem(localKey) || [];
      const updatedItems = allItems.map((item: any) => item.id === id ? { ...item, ...updatedItemData } : item);
      localDB.setItem(localKey, updatedItems);
       return updatedItems.find((item: any) => item.id === id);
    },

    delete: async (id: string) => {
      if (isOnline() && getElectronApi()) {
        try {
          await cloudDB.query(`UPDATE ${pluralEntityName} SET isActive = false WHERE id = $1`, [id]);
        } catch (error) {
          console.warn(`Could not delete ${entityName} in cloud, deleting locally.`, error);
        }
      }
      const allItems = localDB.getItem(localKey) || [];
      const updatedItems = allItems.map((item: any) => item.id === id ? { ...item, isActive: false } : item);
      localDB.setItem(localKey, updatedItems);
    }
  };
};

export const productService = createHybridService('product', 'products');
export const customerService = createHybridService('customer', 'customers');
export const employeeService = createHybridService('employee', 'employees');
export const transactionService = createHybridService('transaction', 'transactions');
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
