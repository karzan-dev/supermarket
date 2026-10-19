export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER';

export interface User {
  id: number;
  name: string;
  username: string;
  role: UserRole;
  role_display?: string;
  role_id?: number;
  permissions?: string[];
  permissions_customized?: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  language_pref: 'ku' | 'en' | 'ar';
  phone?: string;
  email?: string;
  last_login?: string;
  created_at?: string;
}

export interface Category {
  id: number;
  name_ku: string;
  name_en: string;
  name_ar: string;
  icon?: string;
  status?: number;
  product_count?: number;
}

export interface Unit {
  id: number;
  name_ku: string;
  name_en: string;
  name_ar: string;
  short_code: string;
}

export interface Product {
  id: number;
  barcode: string;
  sku: string;
  name_ku: string;
  category_id: number;
  unit_id: number;
  purchase_price: number;
  selling_price: number;
  wholesale_price: number;
  quantity: number;
  min_stock: number;
  expiry_date?: string;
  image?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  category_ku?: string;
  category_en?: string;
  category_ar?: string;
  unit_ku?: string;
  unit_en?: string;
  unit_ar?: string;
  unit_code?: string;
}

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  total_purchases: number;
  total_paid: number;
  debt: number;
  created_at?: string;
}

export interface Supplier {
  id: number;
  name: string;
  company?: string;
  phone?: string;
  address?: string;
  notes?: string;
  total_purchases: number;
  total_paid: number;
  debt: number;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
}

export interface Sale {
  id: number;
  invoice_number: string;
  user_id: number;
  customer_id?: number | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  cost_of_goods: number;
  profit: number;
  cash_received: number;
  change_amount: number;
  payment_method: 'CASH' | 'CARD' | 'CREDIT' | 'OTHER';
  payment_status: 'PAID' | 'PARTIAL' | 'DUE';
  notes?: string;
  created_at: string;
  customer_name?: string;
  customer_phone?: string;
  cashier_name?: string;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  purchase_cost: number;
  discount: number;
  total: number;
  profit: number;
  barcode?: string;
  name_ku?: string;
  unit_code?: string;
}

export interface Purchase {
  id: number;
  invoice_number: string;
  receipt_image_url?: string | null;
  supplier_id: number;
  supplier?: Pick<Supplier, 'id' | 'name' | 'company'> | null;
  supplier_name?: string;
  supplier_company?: string;
  user_id: number;
  user_name?: string;
  total: number;
  paid_amount: number;
  remaining_amount: number;
  payment_status: 'PAID' | 'PARTIAL' | 'DUE';
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: number;
  category_id: number;
  category_ku?: string;
  category_en?: string;
  category_ar?: string;
  amount: number;
  date: string;
  description?: string;
  user_id: number;
  user_name?: string;
}

export interface ExpenseCategory {
  id: number;
  name_ku: string;
  name_en: string;
  name_ar: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  barcode?: string;
  name_ku?: string;
  movement_type: 'SALE' | 'PURCHASE' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGE' | 'EXPIRED' | 'OTHER';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reference_type?: string;
  reference_id?: number;
  user_name?: string;
  notes?: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  user_name?: string;
  action: string;
  entity: string;
  entity_id?: number;
  ip_address?: string;
  description: string;
  created_at: string;
}

export interface AppSettings {
  store_name: string;
  store_name_en?: string;
  store_name_ar?: string;
  store_phone: string;
  store_address: string;
  currency: string;
  invoice_prefix: string;
  receipt_footer: string;
  default_language: string;
  allow_negative_stock: string;
  low_stock_threshold: string;
  expiry_alerts_enabled: string;
  expiry_warning_days: string;
  expiry_urgent_days: string;
  expiry_alerts_expired: string;
  expiry_alerts_bell: string;
  expiry_alerts_dashboard: string;
}

export interface ExpiryAlert {
  id: number;
  name_ku: string;
  barcode: string;
  quantity: number;
  expiry_date: string;
  days_remaining: number;
  alert_type: 'expired' | 'today' | 'soon';
  severity: 'critical' | 'high' | 'warning';
  urgent: boolean;
  filter_status: string;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
