'use client'

import React, { useMemo, useState } from 'react'
import { CalendarView } from './CalendarView'
import { ListView } from './ListView'
import { colors, styles } from './styles'
import { STATUS_OPTIONS, type PackageManagerData, type DepartureRow } from './types'

type ViewMode = 'calendar' | 'list'
type PgFilter = 'all' | 'on' | 'off'

export const PackageManagerClient: React.FC<{ data: PackageManagerData }> = ({ data }) => {
  const [view, setView] = useState<ViewMode>('calendar')
  const [rows, setRows] = useState<DepartureRow[]>(data.departures)
  const [packageId, setPackageId] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [pgFilter, setPgFilter] = useState<PgFilter>('all')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (packageId !== 'all' && r.packageId !== packageId) return false
      if (status !== 'all' && r.status !== status) return false
      if (pgFilter === 'on' && !r.acceptOnlinePayment) return false
      if (pgFilter === 'off' && r.acceptOnlinePayment) return false
      return true
    })
  }, [rows, packageId, status, pgFilter])

  const onTogglePg = async (id: string, next: boolean) => {
    setError(null)
    setPendingId(id)
    // Optimistic update.
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, acceptOnlinePayment: next } : r)))
    try {
      const res = await fetch(`/api/package-departures/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ acceptOnlinePayment: next }),
      })
      if (!res.ok) throw new Error(`Request failed (${res.status})`)
    } catch (e) {
      // Revert on failure.
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, acceptOnlinePayment: !next } : r)))
      setError(e instanceof Error ? e.message : 'Failed to update payment gateway')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: '0 0 0.25rem', color: colors.text }}>Package Manager</h1>
          <p style={{ margin: 0, color: colors.textMuted, fontSize: '0.9rem' }}>
            {rows.length} departure{rows.length === 1 ? '' : 's'} across{' '}
            {data.packages.length} package{data.packages.length === 1 ? '' : 's'}
          </p>
        </div>
        <a
          href="/admin/collections/package-departures/create"
          className="btn btn--style-primary btn--size-small"
          style={{
            textDecoration: 'none',
            background: colors.primary,
            color: '#fff',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          + New Departure
        </a>
      </div>

      <div style={styles.toolbar}>
        <div style={styles.segmented}>
          {(['calendar', 'list'] as ViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              style={{ ...styles.segmentBtn, ...(view === v ? styles.segmentBtnActive : {}) }}
            >
              {v === 'calendar' ? 'Calendar' : 'List'}
            </button>
          ))}
        </div>

        <select style={styles.select} value={packageId} onChange={(e) => setPackageId(e.target.value)} aria-label="Filter by package">
          <option value="all">All packages</option>
          {data.packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select style={styles.select} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select style={styles.select} value={pgFilter} onChange={(e) => setPgFilter(e.target.value as PgFilter)} aria-label="Filter by payment gateway">
          <option value="all">Payment: any</option>
          <option value="on">Payment: on</option>
          <option value="off">Payment: off</option>
        </select>

        <div style={styles.spacer} />

        {error && <span style={{ color: colors.error, fontSize: '0.8rem' }}>{error}</span>}
      </div>

      {view === 'calendar' ? (
        <CalendarView departures={filtered} todayKey={data.todayKey} initialMonth={data.initialMonth} />
      ) : (
        <ListView
          departures={filtered}
          paymentsEnabled={data.paymentsEnabled}
          pendingId={pendingId}
          onTogglePg={onTogglePg}
        />
      )}
    </div>
  )
}

export default PackageManagerClient
