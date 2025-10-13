// Base interface for common fields
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// User interface
export interface User extends BaseEntity {
  fullName: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  password?: string; // Optional for security
}

// Category interface
export interface Category extends BaseEntity {
  name: string;
  description: string;
}

// Customer interface
export interface Customer extends BaseEntity {
  fullName: string;
  phone: string;
  email: string;
}

// Supplier interface
export interface Supplier extends BaseEntity {
  name: string;
  phone: string;
  email: string;
  address: string;
}

// Product interface
export interface Product extends BaseEntity {
  name: string;
  barcode: string;
  categoryId: number;
  category?: Category; // Optional populated field
  price: number;
  stock: number;
  averageCost: number;
  profitPercentage: number;
}

// Sale interface
export interface Sale extends BaseEntity {
  total: number;
  profit: number;
  userId: number;
  user?: User; // Optional populated field
  customerId: number;
  customer?: Customer; // Optional populated field
  paymentMethod: 'cash' | 'card' | 'mixed';
  status: 'pending' | 'completed' | 'cancelled';
  salesItems?: SaleItem[];
}

// Sale Item interface
export interface SaleItem extends BaseEntity {
  saleId: number;
  sale?: Sale; // Optional populated field
  productId: number;
  product?: Product; // Optional populated field
  quantity: number;
  total: number;
  unitPrice: number;
  costAtTimeOfSale: number;
}

// Purchase interface
export interface Purchase extends BaseEntity {
  total: number;
  supplierId: number;
  supplier?: Supplier; // Optional populated field
  userId: number;
  user?: User; // Optional populated field
  status: 'pending' | 'completed' | 'cancelled';
}

// Purchase Item interface
export interface PurchaseItem extends BaseEntity {
  purchaseId: number;
  purchase?: Purchase; // Optional populated field
  productId: number;
  product?: Product; // Optional populated field
  quantity: number;
  total: number;
  unitCost: number;
}

// Form interfaces for create/update operations
export interface CreateUser {
  fullName: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  password: string;
}

export interface CreateCategory {
  name: string;
  description: string;
}

export interface CreateCustomer {
  fullName: string;
  phone: string;
  email: string;
}

export interface CreateSupplier {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface CreateProduct {
  name: string;
  barcode: string;
  categoryId: number;
  price: number;
  stock: number;
  averageCost?: number; // Optional for backward compatibility
  profitPercentage?: number; // Optional, defaults to 25%
}

export interface CreateSale {
  customerId: number;
}

export interface CreateSaleItem {
  saleId: number;
  productId: number;
  quantity: number;
  total: number;
  unitPrice: number;
}

export interface CreatePurchase {
  total: number;
  supplierId: number;
  userId: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface CreatePurchaseItem {
  purchaseId: number;
  productId: number;
  quantity: number;
  total: number;
  unitCost: number;
}

// API Response interfaces
export interface ApiResponse<T> {
  data: T | null;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message?: string;
}

// Dashboard summary interface
export interface DashboardSummary {
  totalSales: number;
  totalPurchases: number;
  totalProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  totalSuppliers: number;
  recentSales: Sale[];
  topProducts: Product[];
  salesTrend?: {
    current: number;
    previous: number;
    percentage: number;
  };
  purchasesTrend?: {
    current: number;
    previous: number;
    percentage: number;
  };
}

// Analytics interfaces
export interface ProfitSummary {
  todayProfit: number;
  thisWeekProfit: number;
  thisMonthProfit: number;
}

export interface ProfitOverTime {
  date: string;
  profit: number;
}

export interface TopProfitableProduct {
  productId: number;
  productName: string;
  totalProfit: number;
}