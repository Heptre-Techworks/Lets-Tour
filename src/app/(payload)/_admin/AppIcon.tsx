import React from 'react'

/** Hexagon-cube mark used as the admin icon (top-left of the header / breadcrumb home). */
export const AppIcon: React.FC = () => (
  <svg
    aria-label="Lets Tour"
    className="lt-app-icon"
    fill="none"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2.2 20 6.8v9.4L12 21.8 4 16.2V6.8L12 2.2Z"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
    <path d="M12 12 4.4 7.4M12 12l7.6-4.6M12 12v9.4" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
  </svg>
)

export default AppIcon
