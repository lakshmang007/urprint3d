import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, ensureAuth } from '../lib/firebase';
import { Product, Order, ProductReview, CustomPrintQuote } from '../types';
import { PRODUCTS, REVIEWS_DATABASE } from '../data/products';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const REVIEWS_COLLECTION = 'reviews';
const UPLOADS_COLLECTION = 'customUploads';
const SETTINGS_COLLECTION = 'storeSettings';

let isInitialized = false;

// Helper to prevent hanging on network latency
function withTimeout<T>(promise: Promise<T>, ms: number, fallbackVal: T): Promise<T> {
  return new Promise((resolve) => {
    let completed = false;
    const timer = setTimeout(() => {
      if (!completed) {
        completed = true;
        resolve(fallbackVal);
      }
    }, ms);

    promise
      .then((res) => {
        if (!completed) {
          completed = true;
          clearTimeout(timer);
          resolve(res);
        }
      })
      .catch((err) => {
        if (!completed) {
          completed = true;
          clearTimeout(timer);
          resolve(fallbackVal);
        }
      });
  });
}

/**
 * Initialize and seed Firestore with default products if empty
 */
export async function initializeFirestoreCatalog(): Promise<Product[]> {
  if (isInitialized) {
    return PRODUCTS;
  }
  isInitialized = true;

  try {
    ensureAuth().catch(() => {});
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await withTimeout(getDocs(productsRef), 3500, null);

    if (!snapshot || snapshot.empty) {
      if (snapshot && snapshot.empty) {
        console.log('Seeding initial 3D models catalog into Firestore...');
        // Seed current products asynchronously
        for (const prod of PRODUCTS) {
          const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
          setDoc(docRef, {
            ...prod,
            createdAt: new Date().toISOString(),
          }).catch(() => {});
        }

        // Also seed sample reviews
        for (const [prodId, reviews] of Object.entries(REVIEWS_DATABASE)) {
          for (const rev of reviews) {
            const revRef = doc(db, REVIEWS_COLLECTION, rev.id);
            setDoc(revRef, {
              ...rev,
              createdAt: new Date().toISOString(),
            }).catch(() => {});
          }
        }
      }
      return PRODUCTS;
    } else {
      const loadedProducts: Product[] = [];
      snapshot.forEach((docSnap) => {
        loadedProducts.push(docSnap.data() as Product);
      });
      return loadedProducts;
    }
  } catch (error) {
    console.warn('Firestore catalog fallback to local:', error);
    return PRODUCTS;
  }
}

/**
 * Subscribe to real-time product updates from Firestore
 */
export function subscribeToProducts(onUpdate: (products: Product[]) => void) {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    return onSnapshot(
      productsRef,
      { includeMetadataChanges: false },
      (snapshot) => {
        if (!snapshot.empty) {
          const prods: Product[] = [];
          snapshot.forEach((docSnap) => {
            prods.push(docSnap.data() as Product);
          });
          onUpdate(prods);
        }
      },
      (error) => {
        // Silent recovery when running in offline/polling mode
      }
    );
  } catch (err) {
    return () => {};
  }
}

/**
 * Create a new 3D Model in Firestore
 */
export async function addProductToFirestore(product: Product): Promise<void> {
  try {
    ensureAuth().catch(() => {});
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    await setDoc(docRef, {
      ...product,
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Firestore add product notice:', e);
  }
}

/**
 * Modify an existing 3D Model in Firestore
 */
export async function updateProductInFirestore(
  productId: string,
  updates: Partial<Product>
): Promise<void> {
  try {
    ensureAuth().catch(() => {});
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Firestore update product notice:', e);
  }
}

/**
 * Delete a 3D Model from Firestore
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  try {
    ensureAuth().catch(() => {});
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Firestore delete product notice:', e);
  }
}

/**
 * Reset Firestore catalog to defaults
 */
export async function resetFirestoreCatalog(): Promise<void> {
  try {
    ensureAuth().catch(() => {});
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await withTimeout(getDocs(productsRef), 3000, null);
    if (snapshot) {
      for (const docSnap of snapshot.docs) {
        await deleteDoc(docSnap.ref).catch(() => {});
      }
    }
    for (const prod of PRODUCTS) {
      const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
      await setDoc(docRef, {
        ...prod,
        createdAt: new Date().toISOString(),
      }).catch(() => {});
    }
  } catch (e) {
    console.warn('Firestore reset catalog notice:', e);
  }
}

/**
 * Save an Order to Firestore
 */
export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    ensureAuth().catch(() => {});
    const docRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(docRef, {
      ...order,
      createdAt: order.createdAt || new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Notice saving order to Firestore:', error);
  }
}

/**
 * Fetch orders from Firestore
 */
export async function fetchOrdersFromFirestore(): Promise<Order[]> {
  try {
    ensureAuth().catch(() => {});
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const snapshot = await withTimeout(getDocs(ordersRef), 3000, null);
    if (!snapshot) return [];
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push(docSnap.data() as Order);
    });
    return orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    return [];
  }
}

/**
 * Save Review to Firestore
 */
export async function saveReviewToFirestore(review: ProductReview): Promise<void> {
  try {
    ensureAuth().catch(() => {});
    const docRef = doc(db, REVIEWS_COLLECTION, review.id);
    await setDoc(docRef, {
      ...review,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Notice saving review to Firestore:', error);
  }
}

/**
 * Save Custom Upload STL metadata to Firestore
 */
export async function saveCustomUploadToFirestore(quote: CustomPrintQuote): Promise<void> {
  try {
    ensureAuth().catch(() => {});
    const docRef = doc(db, UPLOADS_COLLECTION, `stl-${Date.now()}`);
    await setDoc(docRef, {
      id: `stl-${Date.now()}`,
      fileName: quote.fileName,
      fileSizeMb: quote.fileSizeMb,
      volumeCm3: quote.volumeCm3,
      dimensionsMm: quote.dimensionsMm,
      materialName: quote.selectedMaterial.name,
      colorName: quote.selectedColor.name,
      infillPercentage: quote.infillPercentage,
      layerHeightMm: quote.layerHeightMm,
      quantity: quote.quantity,
      priceINR: quote.totalPrice,
      status: 'Pending Review',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Notice saving custom upload to Firestore:', error);
  }
}

/**
 * Fetch Custom Uploads from Firestore
 */
export async function fetchCustomUploadsFromFirestore(): Promise<any[]> {
  try {
    ensureAuth().catch(() => {});
    const colRef = collection(db, UPLOADS_COLLECTION);
    const snap = await withTimeout(getDocs(colRef), 3000, null);
    if (!snap) return [];
    const uploads: any[] = [];
    snap.forEach((docSnap) => {
      uploads.push({ id: docSnap.id, ...docSnap.data() });
    });
    return uploads.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  } catch (err) {
    return [];
  }
}

/**
 * Update Order status in Firestore
 */
export async function updateOrderInFirestore(orderId: string, updates: Partial<Order>): Promise<void> {
  try {
    ensureAuth().catch(() => {});
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Notice updating order in Firestore:', err);
  }
}

/**
 * Save Store & UI Settings to Firestore
 */
export async function saveStoreSettingsToFirestore(settings: any): Promise<void> {
  try {
    ensureAuth().catch(() => {});
    const docRef = doc(db, SETTINGS_COLLECTION, 'main_config');
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Notice saving store settings:', err);
  }
}

/**
 * Fetch Store & UI Settings from Firestore
 */
export async function fetchStoreSettingsFromFirestore(): Promise<any | null> {
  try {
    ensureAuth().catch(() => {});
    const docRef = doc(db, SETTINGS_COLLECTION, 'main_config');
    const docSnap = await withTimeout(getDoc(docRef), 3000, null);
    if (docSnap && docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (err) {
    return null;
  }
}
