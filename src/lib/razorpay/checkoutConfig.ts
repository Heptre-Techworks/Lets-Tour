// Client-safe Razorpay Checkout branding. Reads NEXT_PUBLIC_* env values (inlined
// at build time), so this file is safe to import into client components. Change
// the branding via env — no code edits needed.

export type CheckoutBranding = {
  name: string
  themeColor: string
  logo: string
}

export const getCheckoutBranding = (): CheckoutBranding => {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''
  return {
    name: process.env.NEXT_PUBLIC_RAZORPAY_BUSINESS_NAME || "Let's Tour",
    themeColor: process.env.NEXT_PUBLIC_RAZORPAY_THEME_COLOR || '#FBAE3D',
    logo: process.env.NEXT_PUBLIC_RAZORPAY_CHECKOUT_LOGO || (serverUrl ? `${serverUrl}/favicon.svg` : ''),
  }
}

export const RAZORPAY_CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'
