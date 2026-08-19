import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  CurrencyCode,
  Product,
  CartItem,
  Order,
  FilterState,
  CustomPrintQuote,
  MaterialOption,
  ColorOption,
  ProductSize,
  StoreSettings,
  Coupon,
  HeroSlideData,
  PrintHub,
  CustomUploadRecord,
} from '../types';
import { CURRENCIES, formatCurrency } from '../data/currencies';
import { PRODUCTS } from '../data/products';
import { PRINT_HUBS } from '../data/hubs';
import { DEFAULT_STORE_SETTINGS } from '../data/defaultSettings';
import {
  initializeFirestoreCatalog,
  subscribeToProducts,
  saveOrderToFirestore,
  fetchOrdersFromFirestore,
  saveCustomUploadToFirestore,
  fetchCustomUploadsFromFirestore,
  updateOrderInFirestore,
  saveStoreSettingsToFirestore,
  fetchStoreSettingsFromFirestore,
  addProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  resetFirestoreCatalog,
} from '../services/firebaseService';

export type ViewType =
  | 'home'
  | 'catalog'
  | 'product-detail'
  | 'custom-upload'
  | 'cart'
  | 'checkout'
  | 'order-confirmation'
  | 'order-tracking'
  | 'account'
  | 'hubs'
  | 'dashboard';

interface StoreContextType {
  // Products Catalog (Firebase Synced)
  products: Product[];
  isLoadingProducts: boolean;
  isFirebaseConnected: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  resetCatalogToDefaults: () => Promise<void>;

  // Store & UI Customizer Settings
  storeSettings: StoreSettings;
  updateStoreSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  resetStoreSettings: () => Promise<void>;

  // Print Hubs Fleet Management
  printHubs: PrintHub[];
  updatePrintHub: (id: string, updates: Partial<PrintHub>) => void;
  addPrintHub: (hub: PrintHub) => void;

  // Navigation & View
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedProduct: Product;
  setSelectedProduct: (product: Product) => void;
  openProductDetail: (product: Product) => void;

  // Manage Models Modal (Firebase CRUD)
  isManageModalOpen: boolean;
  setIsManageModalOpen: (open: boolean) => void;

  // Currency
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amountInUSD: number) => string;

  // Cart & Drawer
  cart: CartItem[];
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (
    product: Product,
    material: MaterialOption,
    color: ColorOption,
    size: ProductSize,
    customDimensions?: { widthMm: number; depthMm: number; heightMm: number },
    quantity?: number
  ) => void;
  addCustomQuoteToCart: (quote: CustomPrintQuote) => void;
  updateCartQuantity: (itemId: string, newQty: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartTotalItems: number;
  cartSubtotalUSD: number;

  // Gift options
  giftWrapping: boolean;
  setGiftWrapping: (val: boolean) => void;
  giftNote: string;
  setGiftNote: (note: string) => void;

  // Wishlist
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Filters
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;

  // Orders & Checkout
  orders: Order[];
  lastOrder: Order | null;
  placeOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingNumber' | 'estimatedDeliveryDate' | 'printHubAssigned'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status'], printHubAssigned?: string) => Promise<void>;

  // Custom Uploads Queue
  customUploads: CustomUploadRecord[];
  refreshCustomUploads: () => Promise<void>;

  // Search
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Quick View Modal
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;

  // Print Hub Locator Modal
  isPrintHubModalOpen: boolean;
  setIsPrintHubModalOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products from Firebase Firestore with fallback
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const productsRef = useRef<Product[]>(PRODUCTS);
  productsRef.current = products;

  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Store & UI Settings State (Persisted in localStorage)
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('urprint_store_settings');
      return saved ? JSON.parse(saved) : DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  // Print Hubs Fleet State
  const [printHubs, setPrintHubs] = useState<PrintHub[]>(() => {
    try {
      const saved = localStorage.getItem('urprint_print_hubs');
      return saved ? JSON.parse(saved) : PRINT_HUBS;
    } catch {
      return PRINT_HUBS;
    }
  });

  // Persist Current View in sessionStorage so user never gets kicked to home on refresh or background sync
  const [currentView, setCurrentViewState] = useState<ViewType>(() => {
    try {
      const saved = sessionStorage.getItem('urprint_current_view');
      return (saved as ViewType) || 'home';
    } catch {
      return 'home';
    }
  });

  const setCurrentView = (view: ViewType) => {
    try {
      sessionStorage.setItem('urprint_current_view', view);
    } catch {}
    setCurrentViewState(view);
  };

  // Selected Product State (Persisted so detail view is persistent)
  const [selectedProduct, setSelectedProductState] = useState<Product>(() => {
    try {
      const savedId = sessionStorage.getItem('urprint_selected_prod_id');
      if (savedId) {
        const found = PRODUCTS.find((p) => p.id === savedId);
        if (found) return found;
      }
    } catch {}
    return PRODUCTS[0];
  });

  const setSelectedProduct = (product: Product) => {
    try {
      sessionStorage.setItem('urprint_selected_prod_id', product.id);
    } catch {}
    setSelectedProductState(product);
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [currency, setCurrencyState] = useState<CurrencyCode>('INR');

  // Manage Models Modal State
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Cart (Persisted in localStorage)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('forge3d_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [giftWrapping, setGiftWrapping] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  // Wishlist
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('forge3d_wishlist');
      return saved ? JSON.parse(saved) : ['prod-vortex-vase', 'prod-crystal-dragon'];
    } catch {
      return [];
    }
  });

  // Orders (Persisted in localStorage)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('forge3d_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Custom Uploads
  const [customUploads, setCustomUploads] = useState<CustomUploadRecord[]>([]);

  // Search & Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isPrintHubModalOpen, setIsPrintHubModalOpen] = useState(false);

  // Initialize Firebase Firestore catalog & Store Settings safely in background
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let isMounted = true;

    async function initCatalog() {
      try {
        const initialProds = await initializeFirestoreCatalog();
        if (isMounted && initialProds && initialProds.length > 0) {
          setProducts(initialProds);
          setIsFirebaseConnected(true);
        }

        // Fetch remote store settings if exists
        const remoteSettings = await fetchStoreSettingsFromFirestore();
        if (isMounted && remoteSettings) {
          setStoreSettings((prev) => ({ ...prev, ...remoteSettings }));
        }

        // Realtime updates from Firestore without causing looping blink
        unsubscribe = subscribeToProducts((updatedProds) => {
          if (!isMounted || !updatedProds || updatedProds.length === 0) return;
          // Check if data actually changed to prevent state churn
          const currentJson = JSON.stringify(productsRef.current.map((p) => ({ id: p.id, name: p.name, basePrice: p.basePrice, inStock: p.inStock })));
          const nextJson = JSON.stringify(updatedProds.map((p) => ({ id: p.id, name: p.name, basePrice: p.basePrice, inStock: p.inStock })));
          if (currentJson !== nextJson) {
            setProducts(updatedProds);
            setIsFirebaseConnected(true);
          }
        });

        // Load historical orders from Firestore
        const remoteOrders = await fetchOrdersFromFirestore();
        if (isMounted && remoteOrders && remoteOrders.length > 0) {
          setOrders((local) => {
            const combined = [...remoteOrders];
            for (const l of local) {
              if (!combined.some((r) => r.id === l.id)) combined.push(l);
            }
            return combined;
          });
        }

        // Load custom STL uploads
        const remoteUploads = await fetchCustomUploadsFromFirestore();
        if (isMounted && remoteUploads) {
          setCustomUploads(remoteUploads);
        }
      } catch (err) {
        console.warn('Firebase sync notice:', err);
      }
    }

    initCatalog();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Save Settings to LocalStorage & Firestore
  const updateStoreSettings = async (newSettings: Partial<StoreSettings>) => {
    setStoreSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('urprint_store_settings', JSON.stringify(updated));
      saveStoreSettingsToFirestore(updated).catch(() => {});
      return updated;
    });
  };

  const resetStoreSettings = async () => {
    setStoreSettings(DEFAULT_STORE_SETTINGS);
    localStorage.setItem('urprint_store_settings', JSON.stringify(DEFAULT_STORE_SETTINGS));
    await saveStoreSettingsToFirestore(DEFAULT_STORE_SETTINGS).catch(() => {});
  };

  // Hubs Management
  const updatePrintHub = (id: string, updates: Partial<PrintHub>) => {
    setPrintHubs((prev) => {
      const updated = prev.map((h) => (h.id === id ? { ...h, ...updates } : h));
      localStorage.setItem('urprint_print_hubs', JSON.stringify(updated));
      return updated;
    });
  };

  const addPrintHub = (hub: PrintHub) => {
    setPrintHubs((prev) => {
      const updated = [...prev, hub];
      localStorage.setItem('urprint_print_hubs', JSON.stringify(updated));
      return updated;
    });
  };

  // Product Operations
  const addProduct = async (product: Product) => {
    setProducts((prev) => [product, ...prev]);
    await addProductToFirestore(product);
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    if (selectedProduct.id === id) {
      setSelectedProductState((prev) => ({ ...prev, ...updates }));
    }
    await updateProductInFirestore(id, updates);
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    await deleteProductFromFirestore(id);
  };

  const resetCatalogToDefaults = async () => {
    setProducts(PRODUCTS);
    await resetFirestoreCatalog();
  };

  const refreshCustomUploads = async () => {
    const remoteUploads = await fetchCustomUploadsFromFirestore();
    if (remoteUploads) setCustomUploads(remoteUploads);
  };

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('forge3d_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Save Wishlist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('forge3d_wishlist', JSON.stringify(wishlistIds));
    } catch {}
  }, [wishlistIds]);

  // Save Orders to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('forge3d_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  // Currency handler
  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
  };

  const formatPrice = (amountInUSD: number) => {
    return formatCurrency(amountInUSD, currency);
  };

  // Cart operations
  const addToCart = (
    product: Product,
    material: MaterialOption,
    color: ColorOption,
    size: ProductSize,
    customDimensions?: { widthMm: number; depthMm: number; heightMm: number },
    quantity = 1
  ) => {
    const scale = size.scaleFactor || 1;
    const itemPriceUSD = product.basePrice * scale * (material.priceMultiplier || 1);
    const itemId = `item-${product.id}-${material.id}-${color.id}-${size.id}-${Date.now()}`;

    const dims = customDimensions || size.dimensions;

    const newItem: CartItem = {
      id: itemId,
      product,
      selectedMaterial: material,
      selectedColor: color,
      selectedSizeLabel: size.label,
      dimensions: dims,
      unitPrice: itemPriceUSD,
      quantity,
      isCustomUpload: false,
    };

    setCart((prev) => [...prev, newItem]);
    setIsCartDrawerOpen(true);
  };

  const addCustomQuoteToCart = (quote: CustomPrintQuote) => {
    const itemId = `custom-${quote.fileName}-${Date.now()}`;
    const dims = {
      widthMm: quote.dimensionsMm.x,
      depthMm: quote.dimensionsMm.y,
      heightMm: quote.dimensionsMm.z,
    };

    const newItem: CartItem = {
      id: itemId,
      customQuote: quote,
      selectedMaterial: quote.selectedMaterial,
      selectedColor: quote.selectedColor,
      selectedSizeLabel: `Custom (${quote.scalePercentage}%)`,
      dimensions: dims,
      unitPrice: quote.pricePerUnit,
      quantity: quote.quantity,
      isCustomUpload: true,
    };

    setCart((prev) => [...prev, newItem]);
    setIsCartDrawerOpen(true);
  };

  const updateCartQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotalUSD = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => {
    return wishlistIds.includes(productId);
  };

  // Filters State
  const [filterState, setFilterState] = useState<FilterState>({
    category: 'All',
    minPrice: 0,
    maxPrice: 5000,
    materials: [],
    colors: [],
    minRating: 0,
    sort: 'trending',
    searchQuery: '',
  });

  const resetFilters = () => {
    setFilterState({
      category: 'All',
      minPrice: 0,
      maxPrice: 5000,
      materials: [],
      colors: [],
      minRating: 0,
      sort: 'trending',
      searchQuery: '',
    });
  };

  // Order Placement
  const placeOrder = (
    orderData: Omit<
      Order,
      'id' | 'createdAt' | 'status' | 'trackingNumber' | 'estimatedDeliveryDate' | 'printHubAssigned'
    >
  ): Order => {
    const hubNames = printHubs.map((h) => h.name);
    const assignedHub = hubNames[Math.floor(Math.random() * hubNames.length)] || 'Bengaluru Tech & Additive Hub';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `URP-IND-${randomSuffix}`;
    const trackingNum = `IND-EXP-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      createdAt: new Date().toISOString(),
      status: 'Sliced',
      trackingNumber: trackingNum,
      estimatedDeliveryDate: formattedDelivery,
      printHubAssigned: assignedHub,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLastOrder(newOrder);
    clearCart();

    // Persist asynchronously in Firestore
    saveOrderToFirestore(newOrder).catch((e) => console.warn('Order sync warning:', e));

    return newOrder;
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order['status'],
    printHubAssigned?: string
  ) => {
    const updates: Partial<Order> = { status };
    if (printHubAssigned) updates.printHubAssigned = printHubAssigned;

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );

    await updateOrderInFirestore(orderId, updates);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        isLoadingProducts,
        isFirebaseConnected,
        addProduct,
        updateProduct,
        deleteProduct,
        resetCatalogToDefaults,
        storeSettings,
        updateStoreSettings,
        resetStoreSettings,
        printHubs,
        updatePrintHub,
        addPrintHub,
        currentView,
        setCurrentView,
        selectedProduct,
        setSelectedProduct,
        openProductDetail,
        isManageModalOpen,
        setIsManageModalOpen,
        currency,
        setCurrency,
        formatPrice,
        cart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        addCustomQuoteToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotalItems,
        cartSubtotalUSD,
        giftWrapping,
        setGiftWrapping,
        giftNote,
        setGiftNote,
        wishlistIds,
        toggleWishlist,
        isWishlisted,
        filterState,
        setFilterState,
        resetFilters,
        orders,
        lastOrder,
        placeOrder,
        updateOrderStatus,
        customUploads,
        refreshCustomUploads,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        quickViewProduct,
        setQuickViewProduct,
        isPrintHubModalOpen,
        setIsPrintHubModalOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
