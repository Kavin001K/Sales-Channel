// Offline-first local storage adapter (localStorage-based)
// Provides CRUD operations and simple sync helpers for company-scoped data.

import { Product, Customer, Transaction, Employee } from '@/lib/types';

const STORAGE_PREFIX = 'scpos';

type Storable = Record<string, unknown> & { id: string };

type CollectionName = 'products' | 'customers' | 'transactions' | 'employees' | 'settings';

const buildKey = (companyId: string, collection: CollectionName) => `${STORAGE_PREFIX}:${companyId}:${collection}`;

const safeParse = <T>(value: string | null, fallback: T): T => {
	try {
		return value ? (JSON.parse(value) as T) : fallback;
	} catch {
		return fallback;
	}
};

const write = (key: string, value: unknown) => {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (e) {
		console.error('LocalStore write error', key, e);
	}
};

const read = <T>(key: string, fallback: T): T => safeParse<T>(localStorage.getItem(key), fallback);

const upsert = <T extends Storable>(items: T[], entity: T): T[] => {
	const idx = items.findIndex(i => i.id === entity.id);
	if (idx >= 0) {
		const updated = [...items];
		updated[idx] = entity;
		return updated;
	}
	return [entity, ...items];
};

export class LocalStore {
	static getProducts(companyId: string): Product[] {
		return read<Product[]>(buildKey(companyId, 'products'), []);
	}
	static saveProduct(product: Product): Product {
		const key = buildKey(product.companyId, 'products');
		const all = read<Product[]>(key, []);
		const updated = upsert(all, product);
		write(key, updated);
		return product;
	}
	static deleteProduct(companyId: string, id: string): void {
		const key = buildKey(companyId, 'products');
		const all = read<Product[]>(key, []);
		write(key, all.filter(p => p.id !== id));
	}

	static getCustomers(companyId: string): Customer[] {
		return read<Customer[]>(buildKey(companyId, 'customers'), []);
	}
	static saveCustomer(customer: Customer): Customer {
		const key = buildKey(customer.companyId, 'customers');
		const all = read<Customer[]>(key, []);
		const updated = upsert(all, customer);
		write(key, updated);
		return customer;
	}
	static deleteCustomer(companyId: string, id: string): void {
		const key = buildKey(companyId, 'customers');
		const all = read<Customer[]>(key, []);
		write(key, all.filter(c => c.id !== id));
	}

	static getTransactions(companyId: string): Transaction[] {
		return read<Transaction[]>(buildKey(companyId, 'transactions'), []);
	}
	static saveTransaction(tx: Transaction): Transaction {
		const key = buildKey(tx.companyId, 'transactions');
		const all = read<Transaction[]>(key, []);
		const updated = upsert(all, tx);
		write(key, updated);
		return tx;
	}
	static deleteTransaction(companyId: string, id: string): void {
		const key = buildKey(companyId, 'transactions');
		const all = read<Transaction[]>(key, []);
		write(key, all.filter(t => t.id !== id));
	}

	static getEmployees(companyId: string): Employee[] {
		return read<Employee[]>(buildKey(companyId, 'employees'), []);
	}
	static saveEmployee(employee: Employee): Employee {
		const key = buildKey(employee.companyId, 'employees');
		const all = read<Employee[]>(key, []);
		const updated = upsert(all, employee);
		write(key, updated);
		return employee;
	}

	// Settings are key-value
	static getSettings(companyId: string): Record<string, string> {
		return read<Record<string, string>>(buildKey(companyId, 'settings'), {});
	}
	static saveSettings(companyId: string, updates: Record<string, string>): Record<string, string> {
		const key = buildKey(companyId, 'settings');
		const current = read<Record<string, string>>(key, {});
		const merged = { ...current, ...updates };
		write(key, merged);
		return merged;
	}
}

export const isOnline = (): boolean => typeof navigator !== 'undefined' && navigator.onLine;
