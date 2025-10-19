import { revalidateSite, revalidateSiteOnDelete } from '@/hooks/revalidateSite'
import type { CollectionConfig } from 'payload'

const isAdmin = (u?: { role?: string }) => u?.role === 'admin'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
  },
  access: {
    // Admin UI access
    admin: ({ req }) => isAdmin(req.user as any),

    // Anyone authenticated may read users, but you can further restrict with a query if needed
    read: ({ req }) => !!req.user,

    // Only admins can create users
    create: ({ req }) => isAdmin(req.user as any),

    // Admins can update any; non-admins can only update themselves by comparing id
    update: ({ req, id }) => isAdmin(req.user as any) || (req.user as any)?.id === id,

    // Only admins can delete
    delete: ({ req }) => isAdmin(req.user as any),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Customer', value: 'customer' },
        { label: 'Agent', value: 'agent' },
        { label: 'Admin', value: 'admin' },
      ],
      defaultValue: 'customer',
      required: true,
      saveToJWT: true,
      admin: {
        position: 'sidebar',
      },
      access: {
        create: ({ req }) => isAdmin(req.user as any),
        update: ({ req }) => isAdmin(req.user as any),
      },
    },
    { name: 'phone', type: 'text' },
    { name: 'marketingOptIn', type: 'checkbox', defaultValue: false },
  ],
  timestamps: true,
}
export default Users
