import fs from "fs";
import path from "path";
import { adminDb } from "./admin";
import { GROCERY_PRODUCTS, GROCERY_CATEGORIES } from "@/data/groceryData";
import { SEEDED_ORDERS } from "@/data/groceryAdminStore";
import { GroceryProduct, CustomerOrder, CartItem, GroceryCategory } from "@/types/grocery";
import { CustomerRecord } from "@/types/customer";
import { CreateOrderInput } from "../validations/grocery";
import { DEFAULT_ADMIN_PROFILE, AdminProfileData } from "../validations/profile";

const PRODUCTS_COLLECTION = "products";
const ORDERS_COLLECTION = "orders";
const COUPONS_COLLECTION = "coupons";
const CATEGORIES_COLLECTION = "categories";
const LOCAL_ORDERS_FILE = path.join(process.cwd(), "src", "data", "orders.json");

// Seeded active coupons (clean slate for live production)
const SEEDED_COUPONS: { code: string; discountPercent: number; minOrderAmount: number; active: boolean }[] = [];

/**
 * Fetch all products from Firestore (or fallback to seeded data)
 */
export async function getProducts(category?: string): Promise<GroceryProduct[]> {
  try {
    if (adminDb && process.env.FIREBASE_PROJECT_ID) {
      let queryRef: FirebaseFirestore.Query = adminDb.collection(PRODUCTS_COLLECTION);
      if (category && category !== "all") {
        queryRef = queryRef.where("category", "==", category);
      }
      const snapshot = await queryRef.get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as GroceryProduct));
      }
    }
  } catch (error) {
    console.warn("Firestore query failed, using seeded products fallback:", error);
  }

  // Fallback to static seed
  if (category && category !== "all") {
    return GROCERY_PRODUCTS.filter((p) => p.category === category);
  }
  return GROCERY_PRODUCTS;
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(id: string): Promise<GroceryProduct | null> {
  try {
    if (adminDb && process.env.FIREBASE_PROJECT_ID) {
      const doc = await adminDb.collection(PRODUCTS_COLLECTION).doc(id).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() } as GroceryProduct;
      }
    }
  } catch (error) {
    console.warn("Firestore getProductById error:", error);
  }

  return GROCERY_PRODUCTS.find((p) => p.id === id) || null;
}

/**
 * Save or update a product in Firestore
 */
export async function saveProduct(product: Partial<GroceryProduct> & { name: string; price: number }): Promise<GroceryProduct> {
  const productId = product.id || `prod-${Date.now()}`;
  const fullProduct: GroceryProduct = {
    id: productId,
    name: product.name,
    nameEn: product.nameEn || product.name,
    category: product.category || "fruits-vegetables",
    price: Number(product.price),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
    costPrice: product.costPrice ? Number(product.costPrice) : undefined,
    unit: product.unit || "1 unit",
    unitEn: product.unitEn || "1 unit",
    rating: product.rating || 5,
    reviewsCount: product.reviewsCount || 0,
    inStock: product.inStock !== false,
    stockQuantity: product.stockQuantity ?? 50,
    lowStockThreshold: product.lowStockThreshold ?? 10,
    sku: product.sku || `SB-${Date.now().toString().slice(-4)}`,
    expiryDate: product.expiryDate,
    badge: product.badge,
    badgeEn: product.badgeEn,
    emoji: product.emoji || "",
    imageUrl: product.imageUrl || "",
    description: product.description || "",
    descriptionEn: product.descriptionEn,
    origin: product.origin || "SuperBarrio",
    originEn: product.originEn,
  };

  try {
    if (adminDb && process.env.FIREBASE_PROJECT_ID) {
      await adminDb.collection(PRODUCTS_COLLECTION).doc(productId).set(fullProduct, { merge: true });
    }
  } catch (error) {
    console.warn("Firestore saveProduct error:", error);
  }

  return fullProduct;
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    if (adminDb && process.env.FIREBASE_PROJECT_ID) {
      await adminDb.collection(PRODUCTS_COLLECTION).doc(id).delete();
      return true;
    }
  } catch (error) {
    console.warn("Firestore deleteProduct error:", error);
  }
  return true;
}

/**
 * Fetch all orders
 */
export async function getOrders(): Promise<CustomerOrder[]> {
  try {
    if (adminDb && process.env.FIREBASE_PROJECT_ID) {
      const snapshot = await adminDb.collection(ORDERS_COLLECTION).orderBy("createdAt", "desc").get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => ({ orderId: doc.id, ...doc.data() } as CustomerOrder));
      }
    }
  } catch (error) {
    console.warn("Firestore getOrders error:", error);
  }

  // Persistent local orders fallback
  try {
    if (fs.existsSync(LOCAL_ORDERS_FILE)) {
      const content = fs.readFileSync(LOCAL_ORDERS_FILE, "utf-8");
      return JSON.parse(content) as CustomerOrder[];
    }
  } catch (err) {
    console.warn("Local orders read error:", err);
  }

  return [];
}

/**
 * SERVER-SIDE ORDER CALCULATION & CREATION
 * Strict Rule: Never trust client-sent prices, totals or discounts.
 */
export async function createOrder(input: CreateOrderInput): Promise<CustomerOrder> {
  const verifiedItems: CartItem[] = [];
  let calculatedSubtotal = 0;

  // Verify each item against real DB price and stock
  for (const itemInput of input.items) {
    const product = await getProductById(itemInput.id);
    if (!product) {
      throw new Error(`Product with ID ${itemInput.id} not found.`);
    }

    if (!product.inStock || (product.stockQuantity !== undefined && product.stockQuantity < itemInput.quantity)) {
      throw new Error(`Product "${product.name}" has insufficient stock.`);
    }

    const itemTotal = Number((product.price * itemInput.quantity).toFixed(2));
    calculatedSubtotal += itemTotal;

    verifiedItems.push({
      ...product,
      quantity: itemInput.quantity,
    });
  }

  calculatedSubtotal = Number(calculatedSubtotal.toFixed(2));

  // Server-side coupon verification
  let discountAmount = 0;
  let appliedPromo: string | undefined = undefined;

  if (input.couponCode) {
    const coupon = SEEDED_COUPONS.find(
      (c) => c.active && c.code.toUpperCase() === input.couponCode?.toUpperCase().trim()
    );
    if (coupon && calculatedSubtotal >= (coupon.minOrderAmount || 0)) {
      discountAmount = Number(((calculatedSubtotal * coupon.discountPercent) / 100).toFixed(2));
      appliedPromo = coupon.code;
    }
  }

  // Delivery fee rule: Free over €25, else €2.50
  const deliveryFee = calculatedSubtotal >= 25 ? 0 : 2.5;
  const calculatedTotal = Number((calculatedSubtotal - discountAmount + deliveryFee).toFixed(2));

  const newOrder: CustomerOrder = {
    orderId: `SB-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: input.customerName.trim(),
    email: input.email?.trim() || undefined,
    customerUid: input.customerUid?.trim() || undefined,
    phone: input.phone.trim(),
    address: input.address.trim(),
    streetAddress: input.streetAddress.trim(),
    apartment: input.apartment?.trim() || undefined,
    postalCode: input.postalCode.trim(),
    city: input.city.trim(),
    province: input.province.trim(),
    notes: input.notes?.trim() || undefined,
    deliverySlot: input.deliverySlot,
    paymentMethod: input.paymentMethod,
    items: verifiedItems,
    subtotal: calculatedSubtotal,
    discount: discountAmount > 0 ? discountAmount : undefined,
    promoCode: appliedPromo,
    deliveryFee,
    total: calculatedTotal,
    status: "placed",
    createdAt: new Date().toISOString(),
  };

  // 1. Persist to local disk for 100% reliable local/offline storage
  try {
    let localOrders: CustomerOrder[] = [];
    if (fs.existsSync(LOCAL_ORDERS_FILE)) {
      try {
        localOrders = JSON.parse(fs.readFileSync(LOCAL_ORDERS_FILE, "utf-8"));
      } catch {
        localOrders = [];
      }
    }
    localOrders.unshift(newOrder);
    fs.writeFileSync(LOCAL_ORDERS_FILE, JSON.stringify(localOrders, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to persist order locally:", err);
  }

  // 2. Persist to Firestore and decrement inventory
  try {
    if (adminDb && process.env.FIREBASE_PROJECT_ID) {
      const batch = adminDb.batch();
      const orderRef = adminDb.collection(ORDERS_COLLECTION).doc(newOrder.orderId);
      batch.set(orderRef, newOrder);

      // Decrement stock for purchased items
      for (const item of verifiedItems) {
        const prodRef = adminDb.collection(PRODUCTS_COLLECTION).doc(item.id);
        const newStock = Math.max(0, (item.stockQuantity || 50) - item.quantity);
        batch.update(prodRef, {
          stockQuantity: newStock,
          inStock: newStock > 0,
        });
      }

      await batch.commit();
    }
  } catch (error) {
    console.warn("Firestore order persistence error:", error);
  }

  // Update customer record with this new order
  await recordCustomerOrder(newOrder);

  return newOrder;
}

/**
 * Seed initial catalog to Firestore
 */
export async function seedInitialData(): Promise<{ productsCount: number; categoriesCount: number }> {
  let seededProducts = 0;
  let seededCategories = 0;

  try {
    if (adminDb && process.env.FIREBASE_PROJECT_ID) {
      const batch = adminDb.batch();

      for (const cat of GROCERY_CATEGORIES) {
        const catRef = adminDb.collection(CATEGORIES_COLLECTION).doc(cat.id);
        batch.set(catRef, cat, { merge: true });
        seededCategories++;
      }

      for (const prod of GROCERY_PRODUCTS) {
        const prodRef = adminDb.collection(PRODUCTS_COLLECTION).doc(prod.id);
        batch.set(prodRef, prod, { merge: true });
        seededProducts++;
      }

      for (const coup of SEEDED_COUPONS) {
        const coupRef = adminDb.collection(COUPONS_COLLECTION).doc(coup.code);
        batch.set(coupRef, coup, { merge: true });
      }

      await batch.commit();
    }
  } catch (error) {
    console.error("Firestore seeding error:", error);
    throw error;
  }

  return { productsCount: seededProducts, categoriesCount: seededCategories };
}

const SETTINGS_COLLECTION = "settings";
const ADMIN_PROFILE_DOC = "admin_profile";
const LOCAL_PROFILE_FILE = path.join(process.cwd(), "src", "data", "admin_profile.json");

export async function getAdminProfile(): Promise<AdminProfileData> {
  try {
    if (adminDb && process.env.FIREBASE_PROJECT_ID) {
      const doc = await adminDb.collection(SETTINGS_COLLECTION).doc(ADMIN_PROFILE_DOC).get();
      if (doc.exists) {
        return { ...DEFAULT_ADMIN_PROFILE, ...doc.data() };
      }
    }
  } catch (error) {
    console.warn("Firestore getAdminProfile error:", error);
  }

  // Persistent local file fallback
  try {
    if (fs.existsSync(LOCAL_PROFILE_FILE)) {
      const content = fs.readFileSync(LOCAL_PROFILE_FILE, "utf-8");
      return { ...DEFAULT_ADMIN_PROFILE, ...JSON.parse(content) };
    }
  } catch (err) {
    console.warn("Local profile read error:", err);
  }

  return DEFAULT_ADMIN_PROFILE;
}

export async function updateAdminProfile(data: Partial<AdminProfileData>): Promise<AdminProfileData> {
  const current = await getAdminProfile();
  const merged: AdminProfileData = { ...current, ...data };

  // 1. Save to local persistent file on disk
  try {
    fs.writeFileSync(LOCAL_PROFILE_FILE, JSON.stringify(merged, null, 2), "utf-8");
  } catch (err) {
    console.warn("Local profile write error:", err);
  }

  // 2. Mirror to Firestore if available
  try {
    if (adminDb && process.env.FIREBASE_PROJECT_ID) {
      await adminDb.collection(SETTINGS_COLLECTION).doc(ADMIN_PROFILE_DOC).set(merged, { merge: true });
    }
  } catch (error) {
    console.warn("Firestore updateAdminProfile error:", error);
  }

  return merged;
}

const LOCAL_CATEGORIES_FILE = path.join(process.cwd(), "src", "data", "categories.json");

export async function getCategories(): Promise<GroceryCategory[]> {
  try {
    if (adminDb && process.env.FIREBASE_PROJECT_ID) {
      const snapshot = await adminDb.collection(CATEGORIES_COLLECTION).get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as GroceryCategory));
      }
    }
  } catch (error) {
    console.warn("Firestore getCategories error:", error);
  }

  // Persistent local file fallback
  try {
    if (fs.existsSync(LOCAL_CATEGORIES_FILE)) {
      const content = fs.readFileSync(LOCAL_CATEGORIES_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn("Local categories read error:", err);
  }

  return GROCERY_CATEGORIES.filter((c) => c.id !== "all").map((c) => ({
    ...c,
    status: "active" as const,
  }));
}

export async function saveCategory(category: GroceryCategory): Promise<GroceryCategory> {
  const currentList = await getCategories();
  const existingIndex = currentList.findIndex((c) => c.id === category.id);
  const updatedCategory: GroceryCategory = {
    ...category,
    status: category.status || "active",
  };

  let newList: GroceryCategory[];
  if (existingIndex >= 0) {
    newList = [...currentList];
    newList[existingIndex] = { ...newList[existingIndex], ...updatedCategory };
  } else {
    newList = [...currentList, updatedCategory];
  }

  // 1. Write to local file on disk
  try {
    fs.writeFileSync(LOCAL_CATEGORIES_FILE, JSON.stringify(newList, null, 2), "utf-8");
  } catch (err) {
    console.warn("Local categories write error:", err);
  }

  // 2. Mirror to Firestore if available
  try {
    if (adminDb && process.env.FIREBASE_PROJECT_ID) {
      await adminDb.collection(CATEGORIES_COLLECTION).doc(updatedCategory.id).set(updatedCategory, { merge: true });
    }
  } catch (error) {
    console.warn("Firestore saveCategory error:", error);
  }

  return updatedCategory;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const currentList = await getCategories();
  const filtered = currentList.filter((c) => c.id !== id);

  // 1. Remove from local file on disk
  try {
    fs.writeFileSync(LOCAL_CATEGORIES_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  } catch (err) {
    console.warn("Local categories delete error:", err);
  }

  // 2. Remove from Firestore if available
  try {
    if (adminDb && process.env.FIREBASE_PROJECT_ID) {
      await adminDb.collection(CATEGORIES_COLLECTION).doc(id).delete();
    }
  } catch (error) {
    console.warn("Firestore deleteCategory error:", error);
  }

  return true;
}

const CUSTOMERS_COLLECTION = "customers";
const LOCAL_CUSTOMERS_FILE = path.join(process.cwd(), "src", "data", "customers.json");

/**
 * Fetch all registered / logged-in customers
 */
export async function getCustomers(): Promise<CustomerRecord[]> {
  try {
    if (adminDb && process.env.FIREBASE_PROJECT_ID) {
      const snapshot = await adminDb.collection(CUSTOMERS_COLLECTION).orderBy("lastLoginAt", "desc").get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CustomerRecord));
      }
    }
  } catch (error) {
    console.warn("Firestore getCustomers error:", error);
  }

  // Persistent local file fallback
  try {
    if (fs.existsSync(LOCAL_CUSTOMERS_FILE)) {
      const content = fs.readFileSync(LOCAL_CUSTOMERS_FILE, "utf-8");
      const list = JSON.parse(content) as CustomerRecord[];
      // Sort by lastLoginAt desc
      return list.sort((a, b) => new Date(b.lastLoginAt || 0).getTime() - new Date(a.lastLoginAt || 0).getTime());
    }
  } catch (err) {
    console.warn("Local customers read error:", err);
  }

  return [];
}

/**
 * Save or update customer record on login / authentication
 */
export async function saveCustomerLogin(data: {
  uid: string;
  name?: string;
  email: string;
  photoURL?: string;
  provider?: string;
  phone?: string;
  address?: string;
  city?: string;
}): Promise<CustomerRecord> {
  const currentList = await getCustomers();
  const normalizedEmail = (data.email || "").toLowerCase().trim();

  const existingIndex = currentList.findIndex(
    (c) => (c.uid && c.uid === data.uid) || (c.email && c.email.toLowerCase() === normalizedEmail)
  );

  let updatedCustomer: CustomerRecord;

  if (existingIndex >= 0) {
    const existing = currentList[existingIndex];
    updatedCustomer = {
      ...existing,
      uid: data.uid || existing.uid,
      name: data.name?.trim() || existing.name,
      photoURL: data.photoURL || existing.photoURL,
      provider: (data.provider as any) || existing.provider || "google",
      lastLoginAt: new Date().toISOString(),
      phone: data.phone || existing.phone,
      address: data.address || existing.address,
      city: data.city || existing.city,
      status: (existing.ordersCount || 0) >= 2 ? "vip" : existing.status || "active",
    };
    currentList[existingIndex] = updatedCustomer;
  } else {
    updatedCustomer = {
      id: data.uid || `cust-${Date.now()}`,
      uid: data.uid,
      name: data.name?.trim() || (normalizedEmail ? normalizedEmail.split("@")[0] : "Customer"),
      email: normalizedEmail,
      photoURL: data.photoURL || "",
      phone: data.phone || "",
      address: data.address || "",
      city: data.city || "",
      provider: (data.provider as any) || "google",
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      ordersCount: 0,
      totalSpent: 0,
      rewardPoints: 250,
      status: "active",
    };
    currentList.unshift(updatedCustomer);
  }

  // 1. Write to local file on disk
  try {
    fs.writeFileSync(LOCAL_CUSTOMERS_FILE, JSON.stringify(currentList, null, 2), "utf-8");
  } catch (err) {
    console.warn("Local customers write error:", err);
  }

  // 2. Mirror to Firestore if available
  try {
    if (adminDb && process.env.FIREBASE_PROJECT_ID) {
      await adminDb.collection(CUSTOMERS_COLLECTION).doc(updatedCustomer.id).set(updatedCustomer, { merge: true });
    }
  } catch (error) {
    console.warn("Firestore saveCustomer error:", error);
  }

  return updatedCustomer;
}

/**
 * Update customer stats after placing an order
 */
export async function recordCustomerOrder(order: CustomerOrder): Promise<void> {
  try {
    const currentList = await getCustomers();
    const customerEmail = (order.email || "").toLowerCase().trim();
    const customerPhone = (order.phone || "").trim();

    let targetIndex = -1;
    if (order.customerUid) {
      targetIndex = currentList.findIndex((c) => c.uid === order.customerUid);
    }
    if (targetIndex === -1 && customerEmail) {
      targetIndex = currentList.findIndex((c) => c.email.toLowerCase() === customerEmail);
    }
    if (targetIndex === -1 && customerPhone) {
      targetIndex = currentList.findIndex((c) => c.phone === customerPhone);
    }

    if (targetIndex >= 0) {
      const existing = currentList[targetIndex];
      const newOrdersCount = (existing.ordersCount || 0) + 1;
      const newTotalSpent = Number(((existing.totalSpent || 0) + order.total).toFixed(2));
      const newPoints = (existing.rewardPoints || 0) + Math.round(order.total * 10);

      currentList[targetIndex] = {
        ...existing,
        name: existing.name || order.customerName,
        phone: existing.phone || order.phone,
        address: existing.address || order.address,
        streetAddress: existing.streetAddress || order.streetAddress,
        city: existing.city || order.city,
        postalCode: existing.postalCode || order.postalCode,
        ordersCount: newOrdersCount,
        totalSpent: newTotalSpent,
        rewardPoints: newPoints,
        status: newOrdersCount >= 2 ? "vip" : existing.status,
      };

      try {
        fs.writeFileSync(LOCAL_CUSTOMERS_FILE, JSON.stringify(currentList, null, 2), "utf-8");
      } catch (err) {
        console.warn("Failed to update customer order locally:", err);
      }

      try {
        if (adminDb && process.env.FIREBASE_PROJECT_ID) {
          await adminDb.collection(CUSTOMERS_COLLECTION).doc(currentList[targetIndex].id).set(currentList[targetIndex], { merge: true });
        }
      } catch (err) {
        console.warn("Failed to sync customer order to Firestore:", err);
      }
    }
  } catch (e) {
    console.warn("recordCustomerOrder error:", e);
  }
}


