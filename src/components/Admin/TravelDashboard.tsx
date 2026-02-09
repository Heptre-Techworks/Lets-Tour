
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import React from 'react'

const TravelDashboard = async () => {
  const payload = await getPayload({ config: configPromise })
  
  const packages = await payload.count({ collection: 'packages' })
  const destinations = await payload.count({ collection: 'destinations' })
  const places = await payload.count({ collection: 'places' })

  return (
    <div className="travel-dashboard" style={{ padding: '4rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Travel Management Status</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        <DashboardCard 
            title="Packages" 
            count={packages.totalDocs} 
            href="/admin/collections/packages" 
            createHref="/admin/collections/packages/create" 
        />
        <DashboardCard 
            title="Destinations" 
            count={destinations.totalDocs} 
            href="/admin/collections/destinations" 
            createHref="/admin/collections/destinations/create" 
        />
        <DashboardCard 
            title="Places" 
            count={places.totalDocs} 
            href="/admin/collections/places" 
            createHref="/admin/collections/places/create" 
        />
      </div>
    </div>
  )
}

const DashboardCard = ({ title, count, href, createHref }: { title: string, count: number, href: string, createHref: string }) => (
  <div style={{ 
      padding: '2rem', 
      backgroundColor: 'var(--theme-elevation-50)', 
      borderRadius: '12px', 
      border: '1px solid var(--theme-elevation-150)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  }}>
    <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--theme-elevation-800)' }}>{title}</h3>
    <p style={{ fontSize: '3rem', fontWeight: 'bold', margin: '0 0 1.5rem 0', color: 'var(--theme-primary-500)' }}>{count}</p>
    <div style={{ display: 'flex', gap: '1.5rem' }}>
      <a href={createHref} className="btn btn--style-primary btn--size-small" style={{ 
          textDecoration: 'none', 
          backgroundColor: 'var(--theme-primary-500)', 
          color: 'white', 
          padding: '0.5rem 1rem', 
          borderRadius: '4px',
          fontWeight: 'bold'
      }}>
        + Create New
      </a>
      <a href={href} style={{ 
          textDecoration: 'none', 
          color: 'var(--theme-elevation-800)', 
          alignSelf: 'center',
          fontSize: '0.9rem'
      }}>
        View All &rarr;
      </a>
    </div>
  </div>
)

export default TravelDashboard
