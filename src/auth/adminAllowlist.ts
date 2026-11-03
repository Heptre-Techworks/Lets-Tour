// Google accounts allowed into the Payload admin. Anyone else is rejected right
// after their Google ID token is verified, before any database lookup or session
// cookie. An allowed email still needs a Users record with role 'admin'.
export const ALLOWED_ADMIN_EMAILS: readonly string[] = [
  'bgragavendiran@gmail.com',
  'a.mukesh2006@gmail.com',
  'letstour.in@gmail.com',
]

export function isAllowedAdminEmail(email: string | undefined | null): boolean {
  return !!email && ALLOWED_ADMIN_EMAILS.includes(email.trim().toLowerCase())
}
