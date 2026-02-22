import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Append the 'Created at' timestamp per standard requirement
    body['Created at'] = new Date().toISOString()
    
    // Relay the request server-side to avoid CORS issues
    const response = await fetch('https://sheets-writer-1037202171762.us-central1.run.app/append', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error('Proxy to Sheets API failed with status:', response.status)
      return NextResponse.json({ error: 'Failed' }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error proxying to Sheets API:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
