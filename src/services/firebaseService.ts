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

let isInitialized = false;

/**
 * Initialize and seed Firestore with default products if empty
 */
export async function initializeFirestoreCatalog(): Promise<Product[]> {
  if (isInitialized) {
    return PRODUCTS;
  }
  isInitialized = true;

  try {
    await ensureAuth().catch(() => {});
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const snapshot = await getDocs(productsRef);

    if (snapshot.empty) {
      console.log('Seeding initial 3D models catalog into Firestore...');
      // Seed current products
      for (const prod of PRODUCTS) {
        const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
        await setDoc(docRef, {
          ...prod,
          createdAt: new Date().toISOString(),
        }).catch((e) => console.warn('Product seed warning:', e));
      }

      // Also seed sample reviews
      for (const [prodId, reviews] of Object.entries(REVIEWS_DATABASE)) {
        for (const rev of reviews) {
          const revRef = doc(db, REVIEWS_COLLECTION, rev.id);
          await setDoc(revRef, {
            ...rev,
            createdAt: new Date().toISOString(),
          }).catch(() => {});
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
    console.warn('Firestore catalog init fallback to local:', error);
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
        console.warn('Firestore snapshot listener error:', error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to products:', err);
    return () => {};
  }
}

/**
 * Create a new 3D Model in Firestore
 */
export async function addProductToFirestore(product: Product): Promise<void> {
  await ensureAuth().catch(() => {});
  const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
  await setDoc(docRef, {
    ...product,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Modify an existing 3D Model in Firestore
 */
export async function updateProductInFirestore(
  productId: string,
  updates: Partial<Product>
): Promise<void> {
  await ensureAuth().catch(() => {});
  const docRef = doc(db, PRODUCTS_COLLECTION, productId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a 3D Model from Firestore
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  await ensureAuth().catch(() => {});
  const docRef = doc(db, PRODUCTS_COLLECTION, productId);
  await deleteDoc(docRef);
}

/**
 * Reset Firestore catalog to defaults
 */
export async function resetFirestoreCatalog(): Promise<void> {
  await ensureAuth().catch(() => {});
  const productsRef = collection(db, PRODUCTS_COLLECTION);
  const snapshot = await getDocs(productsRef);
  for (const docSnap of snapshot.docs) {
    await deleteDoc(docSnap.ref);
  }
  for (const prod of PRODUCTS) {
    const docRef = doc(db, PRODUCTS_COLLECTION, prod.id);
    await setDoc(docRef, {
      ...prod,
      createdAt: new Date().toISOString(),
    });
  }
}

/**
 * Save an Order to Firestore
 */
export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    await ensureAuth().catch(() => {});
    const docRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(docRef, {
      ...order,
      createdAt: order.createdAt || new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Failed to save order to Firestore:', error);
  }
}

/**
 * Fetch orders from Firestore
 */
export async function fetchOrdersFromFirestore(): Promise<Order[]> {
  try {
    await ensureAuth().catch(() => {});
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const snapshot = await getDocs(ordersRef);
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push(docSnap.data() as Order);
    });
    return orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.warn('Failed to fetch orders from Firestore:', error);
    return [];
  }
}

/**
 * Save Review to Firestore
 */
export async function saveReviewToFirestore(review: ProductReview): Promise<void> {
  try {
    await ensureAuth().catch(() => {});
    const docRef = doc(db, REVIEWS_COLLECTION, review.id);
    await setDoc(docRef, {
      ...review,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Failed to save review to Firestore:', error);
  }
}

/**
 * Save Custom Upload STL metadata to Firestore
 */
export async function saveCustomUploadToFirestore(quote: CustomPrintQuote): Promise<void> {
  try {
    await ensureAuth().catch(() => {});
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
    console.warn('Failed to save custom upload to Firestore:', error);
  }
}

/**
 * Fetch Custom Uploads from Firestore
 */
export async function fetchCustomUploadsFromFirestore(): Promise<any[]> {
  try {
    await ensureAuth().catch(() => {});
    const colRef = collection(db, UPLOADS_COLLECTION);
    const snap = await getDocs(colRef);
    const uploads: any[] = [];
    snap.forEach((docSnap) => {
      uploads.push({ id: docSnap.id, ...docSnap.data() });
    });
    return uploads.sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  } catch (err) {
    console.warn('Failed to fetch custom uploads:', err);
    return [];
  }
}

/**
 * Update Order status in Firestore
 */
export async function updateOrderInFirestore(orderId: string, updates: Partial<Order>): Promise<void> {
  try {
    await ensureAuth().catch(() => {});
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to update order in Firestore:', err);
  }
}

const SETTINGS_COLLECTION = 'storeSettings';

/**
 * Save Store & UI Settings to Firestore
 */
export async function saveStoreSettingsToFirestore(settings: any): Promise<void> {
  try {
    await ensureAuth().catch(() => {});
    const docRef = doc(db, SETTINGS_COLLECTION, 'main_config');
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to save store settings:', err);
  }
}

/**
 * Fetch Store & UI Settings from Firestore
 */
export async function fetchStoreSettingsFromFirestore(): Promise<any | null> {
  try {
    await ensureAuth().catch(() => {});
    const docRef = doc(db, SETTINGS_COLLECTION, 'main_config');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch store settings:', err);
    return null;
  }
}

