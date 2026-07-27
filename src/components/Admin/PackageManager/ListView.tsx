'use client'

import React, { useMemo, useState } from 'react'
import { colors, statusColor, styles } from './styles'
import type { DepartureRow } from './types'

type SortKey = 'packageName' | 'startDate' | 'status' | 'seats' | 'price'
type SortDir = 'asc' | 'desc'

const fmtDate = (iso: string | null): string =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

const fmtPrice = (amount: number | null, currency: string): string => {
  if (amount == null) return '—'
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : ''
  return `${symbol}${amount.toLocaleString('en-IN')}`
}

type Props = {
  departures: DepartureRow[]
  paymentsEnabled: boolean
  pendingId: string | null
  onTogglePg: (id: string, next: boolean) => void
}

export const ListView: React.FC<Props> = ({ departures, paymentsEnabled, pendingId, onTogglePg }) => {
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'startDate', dir: 'asc' })

  const sorted = useMemo(() => {
    const rows = [...departures]
    const { key, dir } = sort
    const mul = dir === 'asc' ? 1 : -1
    rows.sort((a, b) => {
      let av: string | number = ''
      let bv: string | number = ''
      switch (key) {
        case 'packageName':
          av = a.packageName.toLowerCase()
          bv = b.packageName.toLowerCase()
          break
        case 'startDate':
          av = a.startDate || ''
          bv = b.startDate || ''
          break
        case 'status':
          av = a.status
          bv = b.status
          break
        case 'seats':
          av = a.seatsBooked
          bv = b.seatsBooked
          break
        case 'price':
          av = a.price ?? -1
          bv = b.price ?? -1
          break
      }
      if (av < bv) return -1 * mul
      if (av > bv) return 1 * mul
      return 0
    })
    return rows
  }, [departures, sort])

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  const arrow = (key: SortKey) => (sort.key === key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '')

  if (sorted.length === 0) {
    return (
      <div style={styles.panel}>
        <div style={styles.empty}>No departures match the current filters.</div>
      </div>
    )
  }

  return (
    <div style={{ ...styles.panel, overflowX: 'auto' }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, ...styles.thSortable }} onClick={() => toggleSort('packageName')}>
              Package{arrow('packageName')}
            </th>
            <th style={{ ...styles.th, ...styles.thSortable }} onClick={() => toggleSort('startDate')}>
              Start{arrow('startDate')}
            </th>
            <th style={styles.th}>End</th>
            <th style={{ ...styles.th, ...styles.thSortable }} onClick={() => toggleSort('status')}>
              Status{arrow('status')}
            </th>
            <th style={{ ...styles.th, ...styles.thSortable }} onClick={() => toggleSort('seats')}>
              Seats{arrow('seats')}
            </th>
            <th style={{ ...styles.th, ...styles.thSortable }} onClick={() => toggleSort('price')}>
              Price{arrow('price')}
            </th>
            <th style={styles.th}>Payment Gateway</th>
            <th style={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((d) => {
            const isPending = pendingId === d.id
            const on = d.acceptOnlinePayment
            const disabled = !paymentsEnabled || isPending
            return (
              <tr key={d.id}>
                <td style={styles.td}>
                  <a
                    href={`/admin/collections/package-departures/${d.id}`}
                    style={{ color: colors.text, fontWeight: 600, textDecoration: 'none' }}
                  >
                    {d.packageName}
                  </a>
                </td>
                <td style={styles.td}>{fmtDate(d.startDate)}</td>
                <td style={styles.td}>{fmtDate(d.endDate)}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: statusColor[d.status] || colors.textMuted }}>
                    {d.status}
                  </span>
                </td>
                <td style={styles.td}>{d.capacity != null ? `${d.seatsBooked}/${d.capacity}` : '—'}</td>
                <td style={styles.td}>{fmtPrice(d.price, d.currency)}</td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      disabled={disabled}
                      onClick={() => onTogglePg(d.id, !on)}
                      title={
                        !paymentsEnabled
                          ? 'Online payments are globally disabled (PAYMENTS_ENABLED=false)'
                          : on
                            ? 'Online payment enabled — click to disable'
                            : 'Online payment disabled — click to enable'
                      }
                      style={{
                        ...styles.toggle,
                        background: on ? colors.success : colors.panelBorder,
                        opacity: disabled ? 0.5 : 1,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <span style={{ ...styles.toggleKnob, left: on ? '20px' : '2px' }} />
                    </button>
                    <span style={{ fontSize: '0.75rem', color: colors.textMuted }}>
                      {isPending ? 'Saving…' : on ? 'On' : 'Off'}
                    </span>
                  </div>
                </td>
                <td style={styles.td}>
                  <a
                    href={`/admin/collections/package-departures/${d.id}`}
                    style={{ color: colors.primary, fontSize: '0.8rem', textDecoration: 'none' }}
                  >
                    Edit →
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {!paymentsEnabled && (
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.75rem', color: colors.textMuted }}>
          Online payments are globally disabled. Set <code>PAYMENTS_ENABLED=true</code> to enable the
          gateway toggles.
        </p>
      )}
    </div>
  )
}

export default ListView
