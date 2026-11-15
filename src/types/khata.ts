export interface KhataItemBreakdown {
  id: string;
  code?: string; // Código de producto e.g. 0763620
  name: string;
  nameEs?: string;
  nameUrdu?: string;
  boxes?: number; // Cajas
  unitsPerBox?: number; // Unidades por caja
  quantity: number; // Total unidades
  unit: string;
  ivaRate?: 4 | 10 | 21; // Tipo IVA % (4% basic food, 10% groceries, 21% drinks/beer)
  priceWithoutIva?: number; // Pvp S/Iva
  priceWithIva?: number; // Pvp C/Iva
  price?: number;
  total: number; // Total con IVA
}

export interface KhataEntry {
  id: string;
  customerId: string;
  customerName: string;
  cifNif?: string;
  date: string; // ISO date string
  type: "purchase" | "payment";
  orderId?: string;
  facturaNumber?: string;
  description: string;
  items?: KhataItemBreakdown[];
  debit: number; // Total factura (€)
  credit: number; // Pago recibido / wasooli (€)
  balance: number; // Saldo pendiente (€)
  paymentMode?: "cash" | "bank_transfer" | "bizum" | "card" | "domiciliacion";
  notes?: string;
}

export interface KhataCustomer {
  id: string;
  name?: string;
  commercialName: string; // e.g. "Bar Cervecería El Rincón" / "Hotel & Tapas Valencia"
  legalName: string; // Razón Social: e.g. "Hostelería Valenciana SL"
  cifNif: string; // NIF / CIF español: e.g. "B-46892341"
  contactPerson: string; // e.g. "Manolo Gómez" / "Malik Tariq"
  phone: string;
  email?: string;
  address: string;
  postalCode: string;
  city: string; // e.g. "Valencia"
  province: string; // e.g. "Valencia"
  businessType: "bar" | "restaurante" | "hotel" | "cafeteria" | "particular";
  creditDays: 15 | 30 | 0; // Condición de cobro: 15 días, 30 días (Crédito)
  creditLimit: number; // Límite de crédito (€)
  currentBalance: number; // Saldo pendiente actual (€)
  joinedDate: string;
  status: "active" | "blocked";
  notes?: string;
}

export interface IvaBreakdownRow {
  rate: 4 | 10 | 21;
  base: number; // Base imponible
  cuota: number; // Cuota IVA
}

export interface MonthlyKhataInvoice {
  invoiceNumber: string; // e.g. "FAC-2026/00248"
  customer: KhataCustomer;
  billingMonth: string; // e.g. "Noviembre 2026"
  issueDate: string;
  dueDate: string; // Fecha de Vencimiento (e.g. 15 días / 30 días)
  paymentTerms: string; // e.g. "Crédito a 15 Días" / "Crédito a 30 Días"
  openingBalance: number;
  totalBaseImponible: number; // Total sin IVA
  totalCuotaIva: number; // Total IVA
  totalPurchases: number; // Total con IVA de este periodo
  totalPayments: number; // Pagos recibidos
  closingBalance: number; // Total a pagar / pendiente (€)
  ivaBreakdown: IvaBreakdownRow[];
  entries: KhataEntry[];
  itemizedSummary: {
    code: string;
    name: string;
    totalQuantity: number;
    unit: string;
    ivaRate: 4 | 10 | 21;
    priceWithoutIva: number;
    priceWithIva: number;
    totalAmount: number;
  }[];
}
