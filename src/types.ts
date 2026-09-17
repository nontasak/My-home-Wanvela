export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface UserSettings {
  expenseCategories: Category[];
  fridgeCategories: Category[];
  supplyCategories: Category[];
  navIcons?: Record<string, string>;
}

export interface Expense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  uid: string;
  createdAt?: number;
}

export interface BaseItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  uid: string;
  icon?: string;
  expiryDate?: string; // ISO string
  expiryType?: 'none' | 'expiry' | 'bbf';
  createdAt?: number;
}

export interface FridgeItem extends BaseItem {}
export interface SupplyItem extends BaseItem {
  minThreshold: number;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  lastDone: string;
  nextDue: string;
  notes: string;
  uid: string;
  icon?: string;
  createdAt?: string;
  alertType?: 'none' | 'specific_date' | 'days_before' | 'weeks_before' | 'months_before';
  alertValue?: number | string;
}

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: '1', name: 'อาหาร', color: '#6366f1', icon: 'Utensils' },
  { id: '2', name: 'ของใช้ในบ้าน', color: '#ec4899', icon: 'ShoppingBag' },
  { id: '3', name: 'ค่าน้ำ/ค่าไฟ', color: '#f59e0b', icon: 'Lightbulb' },
  { id: '4', name: 'อินเทอร์เน็ต', color: '#10b981', icon: 'Smartphone' },
  { id: '5', name: 'เดินทาง', color: '#3b82f6', icon: 'Car' },
  { id: '6', name: 'สุขภาพ', color: '#ef4444', icon: 'Heart' },
  { id: '7', name: 'สัตว์เลี้ยง', color: '#8b5cf6', icon: 'Dog' },
  { id: '8', name: 'อื่นๆ', color: '#64748b', icon: 'Package' }
];

export const DEFAULT_FRIDGE_CATEGORIES: Category[] = [
  { id: '1', name: 'ของสด', color: '#ef4444', icon: 'Beef' },
  { id: '2', name: 'เครื่องดื่ม', color: '#3b82f6', icon: 'Milk' },
  { id: '3', name: 'เครื่องปรุง', color: '#10b981', icon: 'Soup' },
  { id: '4', name: 'อื่นๆ', color: '#64748b', icon: 'Refrigerator' }
];

export const DEFAULT_SUPPLY_CATEGORIES: Category[] = [
  { id: '1', name: 'ของใช้', color: '#8b5cf6', icon: 'Package' },
  { id: '2', name: 'ของกิน', color: '#ec4899', icon: 'Coffee' }
];
