import type { CSSProperties } from 'react'

// Shared inline-style tokens for the Package Manager admin view.
// The admin panel has NO Tailwind, so everything uses Payload CSS variables
// (var(--theme-*)) to stay theme-aware in light/dark mode.

export const colors = {
  bg: 'var(--theme-elevation-0)',
  panel: 'var(--theme-elevation-50)',
  panelBorder: 'var(--theme-elevation-150)',
  text: 'var(--theme-elevation-800)',
  textMuted: 'var(--theme-elevation-500)',
  primary: 'var(--theme-primary-500)',
  success: 'var(--theme-success-500)',
  error: 'var(--theme-error-500)',
  warning: 'var(--theme-warning-500)',
}

// Map a departure status to a color used for the dot/badge.
export const statusColor: Record<string, string> = {
  open: 'var(--theme-success-500)',
  waitlist: 'var(--theme-warning-500)',
  closed: 'var(--theme-elevation-400)',
  cancelled: 'var(--theme-error-500)',
  departed: 'var(--theme-elevation-600)',
}

export const styles: Record<string, CSSProperties> = {
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  segmented: {
    display: 'inline-flex',
    border: `1px solid ${colors.panelBorder}`,
    borderRadius: '6px',
    overflow: 'hidden',
  },
  segmentBtn: {
    padding: '0.4rem 0.9rem',
    background: 'transparent',
    color: colors.text,
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  segmentBtnActive: {
    background: colors.primary,
    color: '#fff',
  },
  select: {
    padding: '0.4rem 0.6rem',
    borderRadius: '6px',
    border: `1px solid ${colors.panelBorder}`,
    background: colors.bg,
    color: colors.text,
    fontSize: '0.85rem',
  },
  spacer: { flex: 1 },
  panel: {
    background: colors.panel,
    border: `1px solid ${colors.panelBorder}`,
    borderRadius: '10px',
    padding: '1rem',
  },
  // Calendar
  calGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
  },
  calWeekday: {
    textAlign: 'center',
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    color: colors.textMuted,
    padding: '0.25rem 0',
  },
  calCell: {
    minHeight: '104px',
    border: `1px solid ${colors.panelBorder}`,
    borderRadius: '8px',
    padding: '4px',
    background: colors.bg,
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  calCellEmpty: {
    minHeight: '104px',
    borderRadius: '8px',
    background: 'transparent',
  },
  calDayNum: {
    fontSize: '0.72rem',
    fontWeight: 600,
    color: colors.textMuted,
    marginBottom: '2px',
  },
  chip: {
    display: 'block',
    textDecoration: 'none',
    fontSize: '0.72rem',
    lineHeight: 1.25,
    padding: '3px 5px',
    borderRadius: '5px',
    background: colors.panel,
    border: `1px solid ${colors.panelBorder}`,
    color: colors.text,
    borderLeftWidth: '3px',
  },
  // Table
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
  },
  th: {
    textAlign: 'left',
    padding: '0.6rem 0.75rem',
    borderBottom: `2px solid ${colors.panelBorder}`,
    color: colors.textMuted,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  thSortable: {
    cursor: 'pointer',
  },
  td: {
    padding: '0.6rem 0.75rem',
    borderBottom: `1px solid ${colors.panelBorder}`,
    color: colors.text,
    verticalAlign: 'middle',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '999px',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#fff',
  },
  toggle: {
    position: 'relative',
    width: '38px',
    height: '20px',
    borderRadius: '999px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    padding: 0,
    flexShrink: 0,
  },
  toggleKnob: {
    position: 'absolute',
    top: '2px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '#fff',
    transition: 'left 0.15s ease',
  },
  empty: {
    padding: '3rem',
    textAlign: 'center',
    color: colors.textMuted,
  },
}
