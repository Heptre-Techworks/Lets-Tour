// src/collections/Favorites.ts
import type { CollectionConfig } from 'payload'

export const Favorites: CollectionConfig = {
  slug: 'favorites',
  admin: { useAsTitle: 'id' },
  indexes: [
    // Unique per user + target combo. For polymorphic relationships,
    // index the field itself; the adapter will handle the underlying keys.
    { fields: ['user', 'target'], unique: true },
  ],
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    {
      name: 'target',
      type: 'relationship',
      relationTo: ['packages', 'destinations', 'places'],
      required: true,
    },
  ],
}
export default Favorites
