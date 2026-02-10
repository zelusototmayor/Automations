const WEB_BASE_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://bettercoachingapp.com';

export const PROFILE_LINKS = {
  creatorPortal: process.env.EXPO_PUBLIC_CREATOR_PORTAL_URL || `${WEB_BASE_URL}/become-creator`,
  privacyPolicy: `${WEB_BASE_URL}/privacy`,
  termsOfService: `${WEB_BASE_URL}/terms`,
};

export const SUPPORT_EMAIL = 'max@zelusottomayor.com';

