export const buildCertificateVerificationUrl = (qrToken) => {
  if (!qrToken) throw new Error('qrToken is required to build a verification URL');

  const appUrl = import.meta.env.VITE_PUBLIC_APP_URL;
  
  if (!appUrl) {
    if (import.meta.env.PROD) {
      throw new Error('VITE_PUBLIC_APP_URL is not configured for production build.');
    }
    // Fallback for local development ONLY
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return `${origin}/verify/${qrToken}`;
  }

  // Validate absolute HTTPS URL (or HTTP if testing, but block localhost in prod)
  if (!appUrl.startsWith('http://') && !appUrl.startsWith('https://')) {
    throw new Error('VITE_PUBLIC_APP_URL must be an absolute URL (e.g., https://example.com)');
  }

  if (import.meta.env.PROD) {
    if (!appUrl.startsWith('https://')) {
      throw new Error('VITE_PUBLIC_APP_URL must be HTTPS in production');
    }
    if (appUrl.includes('localhost') || appUrl.includes('127.0.0.1')) {
      throw new Error('VITE_PUBLIC_APP_URL cannot be localhost in production');
    }
  }

  // Normalize trailing slash
  const cleanBase = appUrl.endsWith('/') ? appUrl.slice(0, -1) : appUrl;
  return `${cleanBase}/verify/${qrToken}`;
};
