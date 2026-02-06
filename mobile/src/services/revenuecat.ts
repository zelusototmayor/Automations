import { Platform } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesPackage, PurchasesStoreProduct } from 'react-native-purchases';

const REVENUECAT_API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || 'appl_YQmbrqiyxQhHAEMWTgHWZZYhSMY',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
};

// Product IDs for each price tier (lifetime purchases)
export const PRODUCT_IDS = {
  TIER_1: 'tire_1',  // $19.99
  TIER_2: 'tier_2',  // $49.99
  TIER_3: 'tier_3',  // $99.99
} as const;

export type PriceTier = keyof typeof PRODUCT_IDS;

let isInitialized = false;
let isConfigured = false;

/**
 * Check if RevenueCat is properly configured
 */
export function isRevenueCatConfigured(): boolean {
  return isConfigured;
}

/**
 * Initialize RevenueCat SDK
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
  if (isInitialized) return;

  const apiKey = Platform.OS === 'ios'
    ? REVENUECAT_API_KEYS.ios
    : REVENUECAT_API_KEYS.android;

  if (!apiKey) {
    console.warn('RevenueCat API key not configured - running in development mode without purchases');
    isInitialized = true;
    isConfigured = false;
    return;
  }

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.ERROR);

  if (userId) {
    await Purchases.configure({ apiKey, appUserID: userId });
  } else {
    await Purchases.configure({ apiKey });
  }

  isInitialized = true;
  isConfigured = true;
}

/**
 * Identify user after login
 */
export async function identifyUser(userId: string): Promise<CustomerInfo | null> {
  if (!isConfigured) {
    console.warn('RevenueCat not configured - skipping user identification');
    return null;
  }
  const { customerInfo } = await Purchases.logIn(userId);
  return customerInfo;
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<CustomerInfo | null> {
  if (!isConfigured) return null;
  return Purchases.logOut();
}

/**
 * Get current customer info
 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!isConfigured) return null;
  return Purchases.getCustomerInfo();
}

/**
 * Check if user has purchased a specific product
 */
export function hasProduct(customerInfo: CustomerInfo, productId: string): boolean {
  // For lifetime (non-consumable) purchases, check allPurchasedProductIdentifiers
  return customerInfo.allPurchasedProductIdentifiers.includes(productId);
}

/**
 * Get available offerings
 */
export async function getOfferings() {
  if (!isConfigured) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

/**
 * Purchase a package
 */
export async function purchasePackage(pkg: PurchasesPackage): Promise<{
  customerInfo: CustomerInfo;
  productIdentifier: string;
} | null> {
  if (!isConfigured) return null;
  const { customerInfo, productIdentifier } = await Purchases.purchasePackage(pkg);
  return { customerInfo, productIdentifier };
}

/**
 * Restore purchases
 */
export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!isConfigured) return null;
  return Purchases.restorePurchases();
}

/**
 * Get RevenueCat user ID
 */
export async function getRevenueCatUserId(): Promise<string | null> {
  if (!isConfigured) return null;
  const customerInfo = await Purchases.getCustomerInfo();
  return customerInfo.originalAppUserId;
}

/**
 * Add customer info update listener
 */
export function addCustomerInfoUpdateListener(
  listener: (customerInfo: CustomerInfo) => void
) {
  if (!isConfigured) return null;
  Purchases.addCustomerInfoUpdateListener(listener);
}

// ============================================
// COACH PURCHASE FUNCTIONS (Per-coach lifetime access)
// ============================================

/**
 * Get product by ID
 */
export async function getProduct(productId: string): Promise<PurchasesStoreProduct | null> {
  if (!isConfigured) return null;
  try {
    const products = await Purchases.getProducts([productId]);
    return products.find((p) => p.identifier === productId) || null;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
}

/**
 * Get all coach purchase products
 */
export async function getCoachProducts(): Promise<PurchasesStoreProduct[]> {
  if (!isConfigured) return [];
  try {
    const productIds = Object.values(PRODUCT_IDS);
    return await Purchases.getProducts(productIds);
  } catch (error) {
    console.error('Error getting coach products:', error);
    return [];
  }
}

/**
 * Get product for a specific price tier
 */
export async function getProductForTier(tier: PriceTier): Promise<PurchasesStoreProduct | null> {
  const productId = PRODUCT_IDS[tier];
  return getProduct(productId);
}

/**
 * Purchase a specific product by ID (for coach lifetime purchases)
 */
export async function purchaseProduct(productId: string): Promise<{
  customerInfo: CustomerInfo;
  productIdentifier: string;
  transactionId?: string;
} | null> {
  if (!isConfigured) return null;

  try {
    // Get the product first
    const products = await Purchases.getProducts([productId]);
    const product = products.find((p) => p.identifier === productId);

    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    // Purchase the product
    const { customerInfo, productIdentifier } = await Purchases.purchaseStoreProduct(product);

    // Try to get transaction ID from the purchase
  const transaction = (customerInfo as any).nonSubscriptionTransactions?.find(
    (t: any) => t.productIdentifier === productIdentifier
  );
  const transactionId = transaction?.transactionIdentifier || transaction?.originalTransactionIdentifier;

  return { customerInfo, productIdentifier, transactionId };
  } catch (error: any) {
    // Re-throw with userCancelled flag for handling in UI
    if (error.userCancelled) {
      throw { userCancelled: true, message: 'Purchase cancelled' };
    }
    throw error;
  }
}

/**
 * Purchase coach access by price tier
 */
export async function purchaseCoachAccess(tier: PriceTier): Promise<{
  customerInfo: CustomerInfo;
  productIdentifier: string;
  transactionId?: string;
} | null> {
  const productId = PRODUCT_IDS[tier];
  return purchaseProduct(productId);
}

/**
 * Get product ID for a price tier
 */
export function getProductIdForTier(tier: PriceTier): string {
  return PRODUCT_IDS[tier];
}
