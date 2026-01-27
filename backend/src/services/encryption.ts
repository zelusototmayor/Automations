import CryptoJS from 'crypto-js';

// ENCRYPTION_KEY MUST be set via environment variables
if (!process.env.ENCRYPTION_KEY) {
  throw new Error('FATAL: ENCRYPTION_KEY environment variable is not set. Server cannot start without it.');
}

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

/**
 * Encrypt sensitive data (like OAuth tokens) using AES-256
 */
export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

/**
 * Decrypt encrypted data
 */
export function decrypt(encryptedText: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Hash content for change detection (MD5 is sufficient for this use case)
 */
export function hashContent(content: string): string {
  return CryptoJS.MD5(content).toString();
}
