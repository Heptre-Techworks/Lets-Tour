'use client'

import React, { useMemo, useState } from 'react'
import { colors, statusColor, styles } from './styles'
import type { DepartureRow } from './types'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const pad = (n: number) => String(n).padStart(2, '0')

// The day key a departure belongs to, taken from the ISO date substring so it
// matches the intended calendar day regardless of timezone.
const dayKeyOf = (iso: string | null): string | null => (iso ? iso.slice(0, 10) : null)

type Props = {
  departures: DepartureRow[]
  todayKey: string
  initialMonth: string // YYYY-MM
}

export const CalendarView: React.FC<Props> = ({ departures, todayKey, initialMonth }) => {
  const [year, setYear] = useState<number>(() => Number(initialMonth.slice(0, 4)))
  const [month, setMonth] = useState<number>(() => Number(initialMonth.slice(5, 7)) - 1) // 0-indexed

  // Bucket departures by YYYY-MM-DD.
  const byDay = useMemo(() => {
    const map: Record<string, DepartureRow[]> = {}
    for (const d of departures) {
      const key = dayKeyOf(d.startDate)
      if (!key) continue
      ;(map[key] ||= []).push(d)
    }
    return map
  }, [departures])

  const goPrev = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else setMonth((m) => m - 1)
  }
  const goNext = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else setMonth((m) => m + 1)
  }
  const goToday = () => {
    setYear(Number(todayKey.slice(0, 4)))
    setMonth(Number(todayKey.slice(5, 7)) - 1)
  }

  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthDepartureCount = departures.filter((d) => {
    const k = dayKeyOf(d.startDate)
    return k && k.slice(0, 7) === `${year}-${pad(month + 1)}`
  }).length

  const cells: Array<{ day: number; key: string } | null> = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, key: `${year}-${pad(month + 1)}-${pad(d)}` })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <button type="button" onClick={goPrev} style={navBtn} aria-label="Previous month">
          ‹
        </button>
        <button type="button" onClick={goNext} style={navBtn} aria-label="Next month">
          ›
        </button>
        <button type="button" onClick={goToday} style={{ ...navBtn, width: 'auto', padding: '0 0.75rem' }}>
          Today
        </button>
        <h2 style={{ margin: 0, fontSize: '1.15rem', color: colors.text }}>
          {MONTHS[month]} {year}
        </h2>
        <span style={{ color: colors.textMuted, fontSize: '0.85rem' }}>
          {monthDepartureCount} departure{monthDepartureCount === 1 ? '' : 's'}
        </span>
      </div>

      <div style={styles.panel}>
        <div style={styles.calGrid}>
          {WEEKDAYS.map((w) => (
            <div key={w} style={styles.calWeekday}>
              {w}
            </div>
          ))}
        </div>
        <div style={{ ...styles.calGrid, marginTop: '4px' }}>
          {cells.map((cell, i) => {
            if (!cell) return <div key={`e${i}`} style={styles.calCellEmpty} />
            const isToday = cell.key === todayKey
            const events = byDay[cell.key] || []
            return (
              <div
                key={cell.key}
                style={{
                  ...styles.calCell,
                  ...(isToday ? { boxShadow: `inset 0 0 0 2px ${colors.primary}` } : {}),
                }}
              >
                <div style={styles.calDayNum}>{cell.day}</div>
                {events.map((ev) => (
                  <a
                    key={ev.id}
                    href={`/admin/collections/package-departures/${ev.id}`}
                    title={`${ev.packageName} · ${ev.status}${
                      ev.capacity != null ? ` · ${ev.seatsBooked}/${ev.capacity} seats` : ''
                    }`}
                    style={{
                      ...styles.chip,
                      borderLeftColor: statusColor[ev.status] || colors.textMuted,
                    }}
                  >
                    <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.packageName}
                    </strong>
                    <span style={{ color: colors.textMuted }}>
                      {ev.capacity != null ? `${ev.seatsBooked}/${ev.capacity}` : '—'}
                      {' · '}
                      {ev.acceptOnlinePayment ? '💳' : '✕'}
                    </span>
                  </a>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const navBtn: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  border: `1px solid ${colors.panelBorder}`,
  background: colors.bg,
  color: colors.text,
  cursor: 'pointer',
  fontSize: '1rem',
  lineHeight: 1,
}

export default CalendarView
