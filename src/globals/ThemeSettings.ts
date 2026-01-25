import type { GlobalConfig } from 'payload'

export const ThemeSettings: GlobalConfig = {
  slug: 'theme-settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'fonts',
      type: 'array',
      label: 'Custom Google Fonts',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Font Name',
          required: true,
          admin: {
            description: 'The name of the font as it appears in Google Fonts (e.g. "Pacifico")',
          },
        },
        // Value removed - auto-generated
        {
          name: 'link',
          type: 'text',
          label: 'Google Fonts Link',
          required: true,
          admin: {
            description: 'The full URL from Google Fonts (e.g. https://fonts.googleapis.com/css2?family=Pacifico&display=swap)',
          },
        },
      ],
    },
  ],
}
