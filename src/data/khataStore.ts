import {
  KhataCustomer,
  KhataEntry,
  KhataItemBreakdown,
  MonthlyKhataInvoice,
  IvaBreakdownRow,
} from "@/types/khata";

// Datos Fiscales de la Empresa Emisora (Aap Ki Company)
export const SUPERBARRIO_FISCAL_DATA = {
  companyName: "SUPERMERCADO DEL BARRIO SL",
  cif: "B26695643",
  address: "CL/MARTIN EL HUMANO N11",
  postalCode: "46008",
  city: "VALENCIA",
  province: "VALENCIA (ESPAÑA)",
  phone: "+34 962 455 939 / +34 612 345 678",
  email: "pedidos@superbarrio.es",
  registroMercantil: "R.M. de Valencia, Tomo 8.941, Folio 120, Hoja V-40401",
  iban: "ES91 2100 0418 4502 0005 1234",
};

// Seeded Bars, Restaurants & Hotels in Valencia (Aap Ke B2B Customers)
export const SEEDED_KHATA_CUSTOMERS: KhataCustomer[] = [
  {
    id: "khata-bar-01",
    commercialName: "Bar Cervecería El Rincón",
    legalName: "Hostelería El Rincón de Valencia SL",
    cifNif: "B-46892341",
    contactPerson: "Manolo Gómez / Antonio",
    phone: "+34 622 114 477",
    email: "elrincon.valencia@gmail.com",
    address: "Calle de Ruzafa, 18",
    postalCode: "46006",
    city: "Valencia",
    province: "Valencia",
    businessType: "bar",
    creditDays: 15,
    creditLimit: 1500,
    currentBalance: 642.8,
    joinedDate: "2026-03-10",
    status: "active",
    notes: "Bar muy concurrido en Ruzafa. Pide cerveza, café, leche y snacks cada semana. Pago a 15 días.",
  },
  {
    id: "khata-bar-02",
    commercialName: "Cafetería & Tapas Plaza Central",
    legalName: "Restauración Plaza Central CB",
    cifNif: "E-98442115",
    contactPerson: "Paco Martínez",
    phone: "+34 685 330 912",
    email: "plazacentral.tapas@hotmail.com",
    address: "Plaza del Carmen, 7",
    postalCode: "46003",
    city: "Valencia",
    province: "Valencia",
    businessType: "cafeteria",
    creditDays: 30,
    creditLimit: 2000,
    currentBalance: 1120.45,
    joinedDate: "2026-01-15",
    status: "active",
    notes: "Desayunos y tapas. Consume mucho aceite de oliva, leche entera, pan y refrescos. Factura mensual.",
  },
  {
    id: "khata-bar-03",
    commercialName: "Hotel Boutique Ciutat Vella",
    legalName: "Inversiones Hoteleras del Turia SA",
    cifNif: "A-46119876",
    contactPerson: "Laura Benítez (Jefa de Compras)",
    phone: "+34 963 881 200",
    email: "compras@hotelciutatvella.es",
    address: "Calle Caballeros, 32",
    postalCode: "46001",
    city: "Valencia",
    province: "Valencia",
    businessType: "hotel",
    creditDays: 30,
    creditLimit: 3500,
    currentBalance: 1507.61,
    joinedDate: "2025-11-20",
    status: "active",
    notes: "Hotel de 24 habitaciones. Desayunos buffet: fruta fresca, zumos, embutidos y café. Facturación mensual por transferencia.",
  },
  {
    id: "khata-bar-04",
    commercialName: "Restaurante Asador Don Quijote",
    legalName: "Gastronomía Asador Quijote SL",
    cifNif: "B-98712340",
    contactPerson: "David Morales",
    phone: "+34 611 998 345",
    email: "reservas@asadorquijote.es",
    address: "Gran Vía Marqués del Turia, 54",
    postalCode: "46005",
    city: "Valencia",
    province: "Valencia",
    businessType: "restaurante",
    creditDays: 15,
    creditLimit: 2500,
    currentBalance: 875.2,
    joinedDate: "2026-05-01",
    status: "active",
    notes: "Carnes a la brasa y arroces. Compra arroz basmati/bomba, especias, aceite virgen extra y cajas de cerveza.",
  },
];

// Seeded Purchases for "Hotel Boutique Ciutat Vella" matching the user's Dialsur style invoice
export const SEEDED_KHATA_ENTRIES: KhataEntry[] = [
  {
    id: "entry-h01",
    customerId: "khata-bar-03",
    customerName: "Hotel Boutique Ciutat Vella",
    cifNif: "A-46119876",
    date: "2026-10-23T10:15:00.000Z",
    type: "purchase",
    facturaNumber: "FAC-2026-00248",
    description: "Cervezas, Agua Mineral, Caldos y Cafetería",
    items: [
      {
        id: "p-01",
        code: "0763620",
        name: "Cerveza Lata Alhambra 33 cl",
        nameEs: "CERVEZA LATA ALHAMBRA 33 CL",
        boxes: 2,
        unitsPerBox: 24,
        quantity: 48,
        unit: "Latas",
        ivaRate: 21,
        priceWithoutIva: 0.342,
        priceWithIva: 0.414,
        total: 19.87,
      },
      {
        id: "p-02",
        code: "0763910",
        name: "Cerveza Alhambra 50 cl",
        nameEs: "CERVEZA ALHAMBRA 50 CL",
        boxes: 2,
        unitsPerBox: 24,
        quantity: 48,
        unit: "Botellines",
        ivaRate: 21,
        priceWithoutIva: 0.653,
        priceWithIva: 0.79,
        total: 37.92,
      },
      {
        id: "p-03",
        code: "0762790",
        name: "Cerveza Amstel 1 Litro",
        nameEs: "CERVEZA AMSTEL 1 L",
        boxes: 10,
        unitsPerBox: 6,
        quantity: 60,
        unit: "Botellas",
        ivaRate: 21,
        priceWithoutIva: 0.884,
        priceWithIva: 1.07,
        total: 64.2,
      },
      {
        id: "p-04",
        code: "0764170",
        name: "Cerveza Radler Limón Amstel 33 cl",
        nameEs: "CERVEZA CON ZUMO LIMON AMSTEL RADLER 33 CL",
        boxes: 2,
        unitsPerBox: 24,
        quantity: 48,
        unit: "Latas",
        ivaRate: 21,
        priceWithoutIva: 0.33,
        priceWithIva: 0.4,
        total: 19.2,
      },
      {
        id: "p-05",
        code: "0763500",
        name: "Cerveza Lata Amstel 33 cl",
        nameEs: "CERVEZA LATA AMSTEL 33 CL",
        boxes: 7,
        unitsPerBox: 24,
        quantity: 168,
        unit: "Latas",
        ivaRate: 21,
        priceWithoutIva: 0.289,
        priceWithIva: 0.35,
        total: 58.8,
      },
      {
        id: "p-06",
        code: "0320580",
        name: "Agua Mineral La Serreta 8 Litros",
        nameEs: "AGUA MINERAL LA SERRETA 8LT",
        boxes: 16,
        unitsPerBox: 1,
        quantity: 16,
        unit: "Garrafas 8L",
        ivaRate: 10,
        priceWithoutIva: 0.8,
        priceWithIva: 0.88,
        total: 14.08,
      },
      {
        id: "p-07",
        code: "0646485",
        name: "Café Molido Natural Alteza 250 g",
        nameEs: "CAFE MOLIDO NATURAL ALTEZA 250 G",
        boxes: 1,
        unitsPerBox: 20,
        quantity: 20,
        unit: "Paquetes",
        ivaRate: 10,
        priceWithoutIva: 2.045,
        priceWithIva: 2.25,
        total: 45.0,
      },
      {
        id: "p-08",
        code: "0282640",
        name: "Caldo Casero 100% Pollo Gallina Blanca 1L",
        nameEs: "CALDO CASER.100% POLLO GALLINA BLANCA 1 L",
        boxes: 1,
        unitsPerBox: 12,
        quantity: 12,
        unit: "Bricks 1L",
        ivaRate: 10,
        priceWithoutIva: 1.472,
        priceWithIva: 1.62,
        total: 19.44,
      },
      {
        id: "p-09",
        code: "0708670",
        name: "Tónica Schweppes 1 Litro",
        nameEs: "TONICA SCHWEPPES 1 L",
        boxes: 1,
        unitsPerBox: 12,
        quantity: 12,
        unit: "Botellas",
        ivaRate: 21,
        priceWithoutIva: 0.909,
        priceWithIva: 1.1,
        total: 13.2,
      },
      {
        id: "p-10",
        code: "0380310",
        name: "Sal Fina Seca Bueno 1 Kg",
        nameEs: "SAL FINA SECA BUENO 1 KG",
        boxes: 1,
        unitsPerBox: 10,
        quantity: 10,
        unit: "Kilos",
        ivaRate: 10,
        priceWithoutIva: 0.224,
        priceWithIva: 0.246,
        total: 2.46,
      },
    ],
    debit: 294.17,
    credit: 0,
    balance: 294.17,
    notes: "Albarán nº 4410 entregado en cafetería del hotel",
  },
  {
    id: "entry-h02",
    customerId: "khata-bar-03",
    customerName: "Hotel Boutique Ciutat Vella",
    cifNif: "A-46119876",
    date: "2026-10-27T11:30:00.000Z",
    type: "purchase",
    facturaNumber: "FAC-2026-00255",
    description: "Leche Entera Granja, Zumo Naranja y Huevos Camperos",
    items: [
      {
        id: "p-11",
        code: "0100412",
        name: "Leche Entera Pura Granja 1 Litro",
        nameEs: "LECHE ENTERA PURA DE GRANJA 1 L",
        boxes: 10,
        unitsPerBox: 12,
        quantity: 120,
        unit: "Litros",
        ivaRate: 4,
        priceWithoutIva: 1.586,
        priceWithIva: 1.65,
        total: 198.0,
      },
      {
        id: "p-12",
        code: "0100854",
        name: "Huevos Camperos Granjas España",
        nameEs: "HUEVOS CAMPEROS PACK 12",
        boxes: 5,
        unitsPerBox: 10,
        quantity: 50,
        unit: "Docenas",
        ivaRate: 4,
        priceWithoutIva: 2.98,
        priceWithIva: 3.1,
        total: 155.0,
      },
      {
        id: "p-13",
        code: "0100998",
        name: "Zumo Naranja Natural Valencia 1L",
        nameEs: "ZUMO DE NARANJA VALENCIA 1 L",
        boxes: 8,
        unitsPerBox: 6,
        quantity: 48,
        unit: "Botellas",
        ivaRate: 21,
        priceWithoutIva: 2.81,
        priceWithIva: 3.4,
        total: 163.2,
      },
    ],
    debit: 516.2,
    credit: 0,
    balance: 810.37,
    notes: "Suministro semanal de desayunos buffet",
  },
  {
    id: "entry-h03",
    customerId: "khata-bar-03",
    customerName: "Hotel Boutique Ciutat Vella",
    cifNif: "A-46119876",
    date: "2026-11-02T15:00:00.000Z",
    type: "purchase",
    facturaNumber: "FAC-2026-00263",
    description: "Aceite de Oliva Virgen Extra 5L y Arroz Basmati",
    items: [
      {
        id: "p-14",
        code: "0500121",
        name: "Aceite de Oliva Virgen Extra Jaén 5 Litros",
        nameEs: "ACEITE DE OLIVA VIRGEN EXTRA 5 L",
        boxes: 10,
        unitsPerBox: 1,
        quantity: 10,
        unit: "Garrafas 5L",
        ivaRate: 10,
        priceWithoutIva: 40.9,
        priceWithIva: 45.0,
        total: 450.0,
      },
      {
        id: "p-15",
        code: "0500332",
        name: "Arroz Basmati Royal 5 Kg",
        nameEs: "ARROZ BASMATI ROYAL 5 KG",
        boxes: 6,
        unitsPerBox: 1,
        quantity: 6,
        unit: "Sacos 5kg",
        ivaRate: 10,
        priceWithoutIva: 7.45,
        priceWithIva: 8.2,
        total: 49.2,
      },
      {
        id: "p-16",
        code: "0500445",
        name: "Almendras Tostadas con Sal Marina 1 Kg",
        nameEs: "ALMENDRAS TOSTADAS SELECCION 1 KG",
        boxes: 1,
        unitsPerBox: 12,
        quantity: 12,
        unit: "Kilos",
        ivaRate: 21,
        priceWithoutIva: 13.62,
        priceWithIva: 16.48,
        total: 197.84,
      },
    ],
    debit: 697.04,
    credit: 0,
    balance: 1507.41,
    notes: "Entrega en cocina del hotel",
  },
];

// Helper to get customers from storage
export function getKhataCustomers(): KhataCustomer[] {
  if (typeof window === "undefined") return SEEDED_KHATA_CUSTOMERS;
  try {
    const raw = localStorage.getItem("tailgrocery_khata_customers_v2");
    if (!raw) {
      localStorage.setItem(
        "tailgrocery_khata_customers_v2",
        JSON.stringify(SEEDED_KHATA_CUSTOMERS),
      );
      return SEEDED_KHATA_CUSTOMERS;
    }
    return JSON.parse(raw);
  } catch {
    return SEEDED_KHATA_CUSTOMERS;
  }
}

// Helper to get entries from storage
export function getKhataEntries(): KhataEntry[] {
  if (typeof window === "undefined") return SEEDED_KHATA_ENTRIES;
  try {
    const raw = localStorage.getItem("tailgrocery_khata_entries_v2");
    if (!raw) {
      localStorage.setItem(
        "tailgrocery_khata_entries_v2",
        JSON.stringify(SEEDED_KHATA_ENTRIES),
      );
      return SEEDED_KHATA_ENTRIES;
    }
    return JSON.parse(raw);
  } catch {
    return SEEDED_KHATA_ENTRIES;
  }
}

// Save customers
export function saveKhataCustomers(customers: KhataCustomer[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      "tailgrocery_khata_customers_v2",
      JSON.stringify(customers),
    );
    window.dispatchEvent(new CustomEvent("khata-data-updated"));
  } catch (e) {
    console.error("Failed to save khata customers:", e);
  }
}

// Save entries
export function saveKhataEntries(entries: KhataEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      "tailgrocery_khata_entries_v2",
      JSON.stringify(entries),
    );
    window.dispatchEvent(new CustomEvent("khata-data-updated"));
  } catch (e) {
    console.error("Failed to save khata entries:", e);
  }
}

// Get customer by id
export function getKhataCustomerById(id: string): KhataCustomer | undefined {
  const customers = getKhataCustomers();
  return customers.find((c) => c.id === id);
}

// Add new B2B customer (Hotel / Club / Restaurant)
export function addKhataCustomer(data: {
  commercialName: string;
  legalName?: string;
  cifNif?: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  postalCode?: string;
  city?: string;
  province?: string;
  businessType?: "hotel" | "bar" | "restaurante" | "cafeteria" | "particular";
  creditDays?: 15 | 30 | 0;
  creditLimit: number;
  initialBalance?: number;
  notes?: string;
}): KhataCustomer {
  const customers = getKhataCustomers();
  const id = `khata-client-${Date.now()}`;
  const newCust: KhataCustomer = {
    id,
    commercialName: data.commercialName,
    legalName: data.legalName || data.commercialName,
    cifNif: data.cifNif || `B-${Math.floor(10000000 + Math.random() * 90000000)}`,
    contactPerson: data.contactPerson,
    phone: data.phone,
    email: data.email || "",
    address: data.address,
    postalCode: data.postalCode || "46001",
    city: data.city || "Valencia",
    province: data.province || "Valencia",
    businessType: data.businessType || "hotel",
    creditDays: data.creditDays !== undefined ? data.creditDays : 30,
    creditLimit: Number(data.creditLimit) || 1000,
    currentBalance: Number(data.initialBalance) || 0,
    joinedDate: new Date().toISOString().split("T")[0],
    status: "active",
    notes: data.notes || "",
  };

  customers.unshift(newCust);
  saveKhataCustomers(customers);

  // If initial balance is greater than 0, create an opening balance entry
  if (data.initialBalance && Number(data.initialBalance) > 0) {
    const entries = getKhataEntries();
    entries.push({
      id: `entry-init-${Date.now()}`,
      customerId: id,
      customerName: newCust.commercialName,
      cifNif: newCust.cifNif,
      date: new Date().toISOString(),
      type: "purchase",
      description: "Opening Balance / Ledger Transfer",
      debit: Number(data.initialBalance),
      credit: 0,
      balance: Number(data.initialBalance),
      notes: "Transferred from previous manual register",
    });
    saveKhataEntries(entries);
  }

  return newCust;
}

// Update existing customer
export function updateKhataCustomer(
  id: string,
  updates: Partial<KhataCustomer>,
): KhataCustomer | null {
  const customers = getKhataCustomers();
  const idx = customers.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  customers[idx] = { ...customers[idx], ...updates };
  saveKhataCustomers(customers);
  return customers[idx];
}

// Get all entries for a specific customer
export function getCustomerKhataLedger(customerId: string): KhataEntry[] {
  const all = getKhataEntries();
  return all
    .filter((e) => e.customerId === customerId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Record a new purchase into Khata
export function recordKhataPurchase(
  customerId: string,
  items: KhataItemBreakdown[],
  totalAmount: number,
  description = "Suministro a Bar/Restaurante",
  orderId?: string,
  notes?: string,
): KhataEntry {
  const customers = getKhataCustomers();
  const customer = customers.find((c) => c.id === customerId);

  const prevBalance = customer ? customer.currentBalance : 0;
  const newBalance = Number((prevBalance + totalAmount).toFixed(2));

  const factNum = `FAC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newEntry: KhataEntry = {
    id: `entry-${Date.now()}`,
    customerId,
    customerName: customer ? customer.commercialName : "Cliente Hostelería",
    cifNif: customer?.cifNif,
    date: new Date().toISOString(),
    type: "purchase",
    facturaNumber: factNum,
    orderId,
    description,
    items,
    debit: totalAmount,
    credit: 0,
    balance: newBalance,
    notes,
  };

  const entries = getKhataEntries();
  entries.push(newEntry);
  saveKhataEntries(entries);

  if (customer) {
    customer.currentBalance = newBalance;
    saveKhataCustomers(customers);
  }

  return newEntry;
}

// Record a payment received from bar/hotel
export function recordKhataPayment(
  customerId: string,
  amount: number,
  paymentMode: KhataEntry["paymentMode"] = "bank_transfer",
  notes = "Cobro de Factura",
): KhataEntry {
  const customers = getKhataCustomers();
  const customer = customers.find((c) => c.id === customerId);

  const prevBalance = customer ? customer.currentBalance : 0;
  const newBalance = Number(Math.max(0, prevBalance - amount).toFixed(2));

  const newEntry: KhataEntry = {
    id: `entry-${Date.now()}`,
    customerId,
    customerName: customer ? customer.commercialName : "Cliente Hostelería",
    cifNif: customer?.cifNif,
    date: new Date().toISOString(),
    type: "payment",
    description: `Pago Recibido (${(paymentMode || "transferencia").toUpperCase()})`,
    debit: 0,
    credit: amount,
    balance: newBalance,
    paymentMode,
    notes,
  };

  const entries = getKhataEntries();
  entries.push(newEntry);
  saveKhataEntries(entries);

  if (customer) {
    customer.currentBalance = newBalance;
    saveKhataCustomers(customers);
  }

  return newEntry;
}

// Generate Official Spanish Factura (Modelo Factura España)
export function generateMonthlyInvoice(
  customerId: string,
  monthName = "Noviembre 2026",
  _filterMonth = 10,
  _filterYear = 2026,
): MonthlyKhataInvoice | null {
  const customer = getKhataCustomerById(customerId);
  if (!customer) return null;

  const entries = getCustomerKhataLedger(customerId);

  let totalPurchases = 0;
  let totalPayments = 0;

  // Group items
  const itemMap = new Map<
    string,
    {
      code: string;
      name: string;
      totalQuantity: number;
      unit: string;
      ivaRate: 4 | 10 | 21;
      priceWithoutIva: number;
      priceWithIva: number;
      totalAmount: number;
    }
  >();

  const ivaTaxes: Record<4 | 10 | 21, { base: number; cuota: number }> = {
    4: { base: 0, cuota: 0 },
    10: { base: 0, cuota: 0 },
    21: { base: 0, cuota: 0 },
  };

  for (const entry of entries) {
    if (entry.type === "purchase") {
      totalPurchases += entry.debit;
      if (entry.items) {
        for (const it of entry.items) {
          const key = it.code || it.name;
          const current = itemMap.get(key) || {
            code: it.code || "000000",
            name: it.nameEs || it.name,
            totalQuantity: 0,
            unit: it.unit,
            ivaRate: it.ivaRate || 10,
            priceWithoutIva:
              it.priceWithoutIva ||
              (it.price ? Number((it.price / 1.1).toFixed(3)) : 0),
            priceWithIva: it.priceWithIva || it.price || 0,
            totalAmount: 0,
          };
          current.totalQuantity += it.quantity;
          current.totalAmount += it.total;
          itemMap.set(key, current);

          // Tax calculation
          const rate = it.ivaRate || 10;
          const base = it.total / (1 + rate / 100);
          const cuota = it.total - base;
          ivaTaxes[rate].base += base;
          ivaTaxes[rate].cuota += cuota;
        }
      }
    } else if (entry.type === "payment") {
      totalPayments += entry.credit;
    }
  }

  const ivaBreakdown: IvaBreakdownRow[] = (
    [4, 10, 21] as Array<4 | 10 | 21>
  ).map((rate) => ({
    rate,
    base: Number(ivaTaxes[rate].base.toFixed(2)),
    cuota: Number(ivaTaxes[rate].cuota.toFixed(2)),
  }));

  const totalBaseImponible = Number(
    ivaBreakdown.reduce((sum, r) => sum + r.base, 0).toFixed(2),
  );
  const totalCuotaIva = Number(
    ivaBreakdown.reduce((sum, r) => sum + r.cuota, 0).toFixed(2),
  );

  const openingBalance = 0;
  const closingBalance = Number(
    (openingBalance + totalPurchases - totalPayments).toFixed(2),
  );

  const issueDateObj = new Date();
  const dueDateObj = new Date();
  dueDateObj.setDate(dueDateObj.getDate() + (customer.creditDays || 15));

  const issueDate = issueDateObj.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const dueDate = dueDateObj.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return {
    invoiceNumber: `FAC-2026-${String(
      customer.id.replace(/\D/g, "") || "0048",
    ).padStart(4, "0")}`,
    customer,
    billingMonth: monthName,
    issueDate,
    dueDate,
    paymentTerms:
      customer.creditDays > 0
        ? `CRÉDITO A ${customer.creditDays} DÍAS`
        : "AL CONTADO / EFECTIVO",
    openingBalance,
    totalBaseImponible,
    totalCuotaIva,
    totalPurchases: Number(totalPurchases.toFixed(2)),
    totalPayments: Number(totalPayments.toFixed(2)),
    closingBalance,
    ivaBreakdown,
    entries,
    itemizedSummary: Array.from(itemMap.values()),
  };
}

// Generate WhatsApp text formatted specifically for Spanish Bars & Hotels
export function generateWhatsAppBillText(invoice: MonthlyKhataInvoice): string {
  const itemsText = invoice.itemizedSummary
    .slice(0, 8)
    .map(
      (it, i) =>
        `${i + 1}. *${it.name}* (${it.totalQuantity} ${it.unit}) = €${it.totalAmount.toFixed(2)} (IVA ${it.ivaRate}%)`,
    )
    .join("\n");

  return `*FACTURA OFICIAL — SUPERMERCADO DEL BARRIO SL*
CIF: B26695643 • Valencia, España
━━━━━━━━━━━━━━━━━━━━━━━━
*Cliente:* ${invoice.customer.commercialName}
*Razón Social:* ${invoice.customer.legalName}
*CIF / NIF:* ${invoice.customer.cifNif}
*Factura Nº:* ${invoice.invoiceNumber}
*Fecha Emisión:* ${invoice.issueDate}
*Vencimiento:* ${invoice.dueDate} (${invoice.paymentTerms})
━━━━━━━━━━━━━━━━━━━━━━━━

*RESUMEN FISCAL (Para su Gestoría):*
• Base Imponible: €${invoice.totalBaseImponible.toFixed(2)}
• IVA Repercutido: €${invoice.totalCuotaIva.toFixed(2)}
────────────────────────
*TOTAL FACTURA: €${invoice.closingBalance.toFixed(2)}*
━━━━━━━━━━━━━━━━━━━━━━━━

*Principales Artículos Suministrados:*
${itemsText}
${
  invoice.itemizedSummary.length > 8
    ? `_...y ${invoice.itemizedSummary.length - 8} artículos más en la factura detallada._\n`
    : ""
}
━━━━━━━━━━━━━━━━━━━━━━━━
*Pago por Transferencia Bancaria:*
IBAN: ${SUPERBARRIO_FISCAL_DATA.iban}
Titular: Supermercado del Barrio SL

_Supermercado del Barrio SL • Atención Hostelería: +34 962 455 939_`;
}
