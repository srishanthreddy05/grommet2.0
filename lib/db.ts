import { db } from "./firebase";
import {
  ref,
  get,
  set,
  push,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
  onValue,
  off,
  runTransaction,
} from "firebase/database";
import type { Product, Order, Category, Review, SiteSettings, CartItem, DMProof } from "@/types";
import { slugify } from "@/lib/slug";

function toBestSellerFlag(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === "string") {
    return value.trim().toLowerCase() === "true";
  }
  return false;
}

function mapCategory(id: string, raw: any): Category {
  const orderValue = Number(raw?.order);
  const imageStr = raw?.image ? String(raw.image).trim() : "";
  const name = String(raw?.name || "Unnamed Category");
  const slug = String(raw?.slug || "").trim() || slugify(name);
  return {
    id,
    slug: slug || id,
    name,
    order: Number.isFinite(orderValue) && orderValue > 0 ? orderValue : undefined,
    image: imageStr || undefined,
    createdAt: raw?.createdAt ? Number(raw.createdAt) : undefined,
    updatedAt: raw?.updatedAt ? Number(raw.updatedAt) : undefined,
  };
}

function mapProduct(id: string, raw: any): Product {
  const source = raw?.album && typeof raw.album === "object" ? { ...raw, ...raw.album } : raw;
  const imageUrl = String(source?.imageUrl || source?.displayImage || source?.images?.[0] || "");
  const categoryId = String(source?.categoryId || source?.category || "");
  const productName = String(source?.name || "Untitled Product");
  const slug = String(source?.slug || "").trim() || slugify(productName);

  return {
    id,
    slug: slug || id,
    name: productName,
    description: String(source?.description || ""),
    price: Number(source?.price || 0),
    salePrice:
      typeof source?.salePrice === "number"
        ? Number(source.salePrice)
        : source?.salePrice
          ? Number(source.salePrice)
          : null,
    bestSeller: toBestSellerFlag(source?.bestSeller),
    soldCount: typeof source?.soldCount === "number" ? Number(source.soldCount) : undefined,
    tags: Array.isArray(source?.tags)
      ? source.tags.map((tag: unknown) => String(tag || "").trim()).filter(Boolean)
      : [],
    categoryId,
    imageUrl,
    stock: Number(source?.stock || 0),
    createdAt: Number(source?.createdAt || Date.now()),
    updatedAt: source?.updatedAt ? Number(source.updatedAt) : undefined,
  };
}

function mapOrder(id: string, raw: any): Order {
  return {
    id,
    userId: String(raw?.userId || ""),
    name: String(raw?.name || ""),
    email: String(raw?.email || ""),
    mobile: String(raw?.mobile || ""),
    products: Array.isArray(raw?.products)
      ? raw.products.map((item: any) => ({
          productId: String(item?.productId || ""),
          quantity: Number(item?.quantity || 0),
        }))
      : [],
    totalPrice: Number(raw?.totalPrice || 0),
    status:
      raw?.status === "confirmed" || raw?.status === "shipped" || raw?.status === "delivered"
        ? raw.status
        : "pending",
    createdAt: Number(raw?.createdAt || Date.now()),
  };
}

function mapDMProof(id: string, raw: any): DMProof {
  return {
    id,
    image: String(raw?.image || ""),
    createdAt: Number(raw?.createdAt || Date.now()),
  };
}

async function resolveStockPath(productId: string): Promise<`stock/${string}/stock` | `stock/${string}/album/stock`> {
  const productSnap = await get(ref(db, `stock/${productId}`));
  if (!productSnap.exists()) {
    return `stock/${productId}/stock`;
  }

  const raw = productSnap.val() as any;
  if (raw && typeof raw.stock !== "undefined") {
    return `stock/${productId}/stock`;
  }

  if (raw?.album && typeof raw.album.stock !== "undefined") {
    return `stock/${productId}/album/stock`;
  }

  return `stock/${productId}/stock`;
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const snap = await get(ref(db, "stock"));
  if (!snap.exists()) return [];
  const products = Object.entries(snap.val())
    .map(([id, val]) => mapProduct(id, val))
    .sort((a, b) => b.createdAt - a.createdAt);
  console.log(`[Firebase] LIVE PRODUCTS (stock): ${products.length}`);
  return products;
}

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await get(ref(db, `stock/${id}`));
  if (!snap.exists()) return null;
  return mapProduct(id, snap.val());
}

export async function getProductBySlugOrId(identifier: string): Promise<Product | null> {
  const byId = await getProductById(identifier);
  if (byId) return byId;

  const all = await getProducts();
  return all.find((product) => product.slug === identifier) || null;
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const products = await getProducts();
  return products
    .filter((product) => product.categoryId === categoryId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts();
}

export async function createProduct(data: Omit<Product, "id">): Promise<string> {
  const newRef = push(ref(db, "stock"));
  const normalizedSlug = String(data.slug || "").trim() || slugify(data.name);
  await set(newRef, {
    ...data,
    slug: normalizedSlug,
    bestSeller: Boolean(data.bestSeller),
    ...(typeof data.soldCount === "number" ? { soldCount: Number(data.soldCount) } : {}),
    category: data.categoryId,
    displayImage: data.imageUrl,
    createdAt: data.createdAt || Date.now(),
    updatedAt: Date.now(),
  });
  return newRef.key!;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  const normalizedSlug =
    typeof data.slug === "string" && data.slug.trim().length > 0
      ? data.slug.trim()
      : typeof data.name === "string"
        ? slugify(data.name)
        : undefined;

  const payload: Record<string, unknown> = {
    ...data,
    ...(normalizedSlug ? { slug: normalizedSlug } : {}),
    updatedAt: Date.now(),
  };

  if (typeof data.categoryId === "string") {
    payload.category = data.categoryId;
  }

  if (typeof data.imageUrl === "string") {
    payload.displayImage = data.imageUrl;
  }

  await update(ref(db, `stock/${id}`), payload);
}

export async function deleteProduct(id: string): Promise<void> {
  await remove(ref(db, `stock/${id}`));
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  try {
    const snap = await get(ref(db, "categories"));
    if (!snap.exists()) {
      console.log("[Firebase] No categories found in database (server)");
      return [];
    }
    const categories = Object.entries(snap.val())
      .map(([id, val]) => mapCategory(id, val))
      .sort((a, b) => (a.order || 999) - (b.order || 999));
    console.log(`[Firebase] LIVE CATEGORIES: ${categories.length}`);
    return categories;
  } catch (error) {
    console.error("[Firebase] Error fetching categories (server):", error);
    return [];
  }
}

export async function createCategory(data: Omit<Category, "id">): Promise<string> {
  const id = String(Date.now());
  const newRef = ref(db, `categories/${id}`);
  const now = Date.now();
  const normalizedSlug = String(data.slug || "").trim() || slugify(data.name);
  await set(newRef, {
    name: data.name,
    slug: normalizedSlug,
    ...(typeof data.order === "number" && data.order > 0 ? { order: data.order } : {}),
    ...(typeof data.image === "string" ? { image: data.image } : {}),
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function updateCategory(id: string, data: Partial<Pick<Category, "name" | "slug" | "order" | "image">>): Promise<void> {
  const normalizedSlug =
    typeof data.slug === "string" && data.slug.trim().length > 0
      ? data.slug.trim()
      : typeof data.name === "string" && data.name.trim().length > 0
        ? slugify(data.name)
        : undefined;

  await update(ref(db, `categories/${id}`), {
    ...(typeof data.name === "string" ? { name: data.name } : {}),
    ...(normalizedSlug ? { slug: normalizedSlug } : {}),
    ...(typeof data.order === "number" && data.order > 0 ? { order: data.order } : {}),
    ...(typeof data.image === "string" ? { image: data.image } : {}),
    updatedAt: Date.now(),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await remove(ref(db, `categories/${id}`));
}

// ─── DM Proofs ───────────────────────────────────────────────────────────────

export async function createDMProof(data: Pick<DMProof, "image">): Promise<string> {
  const newRef = push(ref(db, "dmProofs"));
  const payload = {
    image: String(data.image || ""),
    createdAt: Date.now(),
  };
  await set(newRef, payload);
  return newRef.key || "";
}

export async function deleteDMProof(id: string): Promise<void> {
  await remove(ref(db, `dmProofs/${id}`));
}

export async function getDMProofs(): Promise<DMProof[]> {
  const snap = await get(ref(db, "dmProofs"));
  if (!snap.exists()) return [];
  return Object.entries(snap.val())
    .map(([id, val]) => mapDMProof(id, val))
    .filter((item) => Boolean(item.image))
    .sort((a, b) => b.createdAt - a.createdAt);
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function createOrder(data: Omit<Order, "id">): Promise<string> {
  const newRef = push(ref(db, "orders"));
  await set(newRef, { ...data, createdAt: data.createdAt || Date.now() });
  return newRef.key!;
}

export async function placeOrder(
  userId: string,
  name: string,
  email: string,
  mobile: string,
  items: CartItem[],
  status: Order["status"] = "confirmed"
): Promise<string> {
  if (!items.length) throw new Error("Cart is empty");

  const productRecords = await Promise.all(
    items.map(async (item) => {
      const product = await getProductById(item.product.id);
      if (!product) {
        throw new Error(`Product not found: ${item.product.id}`);
      }
      return { item, product };
    })
  );

  for (const record of productRecords) {
    if (record.product.stock < record.item.quantity) {
      throw new Error(`Insufficient stock for ${record.product.name}`);
    }
  }

  const products = items.map((item) => ({
    productId: item.product.id,
    quantity: item.quantity,
  }));
  const totalPrice = items.reduce((sum, item) => {
    const sellingPrice =
      typeof item.product.salePrice === "number" && item.product.salePrice > 0 && item.product.salePrice <= item.product.price
        ? item.product.salePrice
        : item.product.price;
    return sum + sellingPrice * item.quantity;
  }, 0);

  const stockPaths = new Map<string, `stock/${string}/stock` | `stock/${string}/album/stock`>();
  for (const item of items) {
    stockPaths.set(item.product.id, await resolveStockPath(item.product.id));
  }

  const decremented: Array<{ productId: string; quantity: number; path: `stock/${string}/stock` | `stock/${string}/album/stock` }> = [];

  try {
    for (const item of items) {
      const stockPath = stockPaths.get(item.product.id) || `stock/${item.product.id}/stock`;
      const productStockRef = ref(db, stockPath);
      try {
        const transaction = await runTransaction(productStockRef, (currentStock) => {
          const current = Number(currentStock || 0);
          if (current < item.quantity) {
            return;
          }
          return current - item.quantity;
        });

        if (transaction.committed) {
          decremented.push({ productId: item.product.id, quantity: item.quantity, path: stockPath });
          continue;
        }

        // Fallback: in some rule/config setups, transaction may abort while regular get/set works.
        const currentSnap = await get(productStockRef);
        const current = Number(currentSnap.val() || 0);
        if (current < item.quantity) {
          throw new Error(`Insufficient stock for ${item.product.name}`);
        }

        await set(productStockRef, current - item.quantity);
        decremented.push({ productId: item.product.id, quantity: item.quantity, path: stockPath });
      } catch (err) {
        const rawMessage = err instanceof Error ? err.message : String(err || "");
        const lower = rawMessage.toLowerCase();
        if (lower.includes("permission_denied") || lower.includes("permission denied")) {
          throw new Error("Stock update is blocked by Firebase rules. Allow read/write for stock during checkout.");
        }
        throw err;
      }
    }

    return createOrder({
      userId,
      name,
      email,
      mobile,
      products,
      totalPrice,
      status,
      createdAt: Date.now(),
    });
  } catch (error) {
    await Promise.all(
      decremented.map((entry) =>
        runTransaction(ref(db, entry.path), (currentStock) =>
          Number(currentStock || 0) + entry.quantity
        )
      )
    );
    throw error;
  }
}

export async function getOrders(): Promise<Order[]> {
  const snap = await get(ref(db, "orders"));
  if (!snap.exists()) return [];
  return Object.entries(snap.val())
    .map(([id, val]) => mapOrder(id, val))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const q = query(ref(db, "orders"), orderByChild("userId"), equalTo(userId));
  const snap = await get(q);
  if (!snap.exists()) return [];
  return Object.entries(snap.val())
    .map(([id, val]) => mapOrder(id, val))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getProductsByIds(ids: string[]): Promise<Record<string, Product>> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  const pairs = await Promise.all(
    uniqueIds.map(async (id) => {
      const product = await getProductById(id);
      return [id, product] as const;
    })
  );

  return pairs.reduce((acc, [id, product]) => {
    if (product) acc[id] = product;
    return acc;
  }, {} as Record<string, Product>);
}

export async function updateOrderStatus(id: string, status: Order["status"]): Promise<void> {
  await update(ref(db, `orders/${id}`), { status });
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function getReviews(): Promise<Review[]> {
  const snap = await get(ref(db, "reviews"));
  if (!snap.exists()) return [];
  return Object.entries(snap.val()).map(([id, val]) => ({ ...(val as Review), id }));
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const snap = await get(ref(db, "settings"));
  if (!snap.exists()) return null;
  return snap.val() as SiteSettings;
}

export async function updateSiteSettings(data: Partial<SiteSettings>): Promise<void> {
  await update(ref(db, "settings"), data);
}

// ─── Real-time listeners ──────────────────────────────────────────────────────

export function listenToOrders(callback: (orders: Order[]) => void) {
  const ordersRef = ref(db, "orders");
  const handler = (snap: any) => {
    if (!snap.exists()) return callback([]);
    const orders = Object.entries(snap.val())
      .map(([id, val]) => mapOrder(id, val))
      .sort((a: any, b: any) => b.createdAt - a.createdAt);
    callback(orders);
  };
  onValue(ordersRef, handler);
  return () => off(ordersRef, "value", handler);
}

export function listenToProducts(callback: (products: Product[]) => void) {
  const productsRef = ref(db, "stock");
  const handler = (snap: any) => {
    if (!snap.exists()) return callback([]);
    const products = Object.entries(snap.val())
      .map(([id, val]) => mapProduct(id, val))
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(products);
  };
  onValue(productsRef, handler);
  return () => off(productsRef, "value", handler);
}

export function listenToCategories(callback: (categories: Category[]) => void) {
  const categoriesRef = ref(db, "categories");
  const handler = (snap: any) => {
    try {
      if (!snap.exists()) {
        console.log("[Firebase] No categories found in database");
        return callback([]);
      }
      
      const rawData = snap.val();
      const categories = Object.entries(rawData)
        .map(([id, val]) => mapCategory(id, val))
        .sort((a, b) => (a.order || 999) - (b.order || 999));
      
      console.log(`[Firebase] Loaded ${categories.length} categories:`, categories.map(c => ({ id: c.id, name: c.name, order: c.order, hasImage: !!c.image })));
      callback(categories);
    } catch (error) {
      console.error("[Firebase] Error in listenToCategories handler:", error);
      return callback([]);
    }
  };
  
  onValue(categoriesRef, handler, (error) => {
    console.error("[Firebase] Error listening to categories:", error);
    callback([]);
  });
  
  return () => off(categoriesRef, "value", handler);
}

export function listenToDMProofs(callback: (proofs: DMProof[]) => void) {
  const dmProofsRef = ref(db, "dmProofs");
  const handler = (snap: any) => {
    if (!snap.exists()) return callback([]);
    const proofs = Object.entries(snap.val())
      .map(([id, val]) => mapDMProof(id, val))
      .filter((item) => Boolean(item.image))
      .sort((a, b) => b.createdAt - a.createdAt);
    callback(proofs);
  };
  onValue(dmProofsRef, handler);
  return () => off(dmProofsRef, "value", handler);
}
