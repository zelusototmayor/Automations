import { Platform } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';

const REVENUECAT_API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
};

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
    console.warn('RevenueCat API key not configured - running in development mode without subscriptions');
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
 * Check if user has premium entitlement
 */
export function isPremium(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active['premium'] !== undefined;
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
