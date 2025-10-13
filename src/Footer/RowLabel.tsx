'use client'
import type { Footer } from '@/payload-types'
import type { RowLabelProps } from '@payloadcms/ui'
import { useRowLabel } from '@payloadcms/ui'

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<
    NonNullable<Footer['navItems']>[number] |
    NonNullable<Footer['legalLinks']>[number] |
    NonNullable<Footer['socialLinks']>[number] |
    NonNullable<Footer['navGroups']>[number]
  >()

  const groupLabel = (data?.data as any)?.groupLabel
  const linkLabel = (data?.data as any)?.link?.label
  const nestedLinkLabel = (data?.data as any)?.links ? undefined : linkLabel

  const label =
    groupLabel
      ? `Group: ${groupLabel}`
      : nestedLinkLabel
        ? `Link: ${nestedLinkLabel}`
        : linkLabel
          ? `Link: ${linkLabel}`
          : `Row ${data?.rowNumber !== undefined ? data.rowNumber + 1 : ''}`

  return <div>{label}</div>
}
