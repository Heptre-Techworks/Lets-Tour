import 'dotenv/config'

// You can either put this in your .env file or replace it here directly
const ENDPOINT_URL = process.env.GOOGLE_SHEETS_ENDPOINT || 'YOUR_ENDPOINT_URL_HERE'

async function sendData(label: string, payload: any) {
  console.log(`\n📝 --- Sending ${label} ---`)
  console.log('Payload:', JSON.stringify(payload, null, 2))
  
  try {
    const response = await fetch(ENDPOINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${process.env.SHEETS_API_TOKEN}` // uncomment if needed
      },
      body: JSON.stringify(payload),
    })

    const text = await response.text()
    console.log(`✅ Response Status: ${response.status} ${response.statusText}`)
    console.log('Response Body:', text)
  } catch (error) {
    console.error('❌ Error sending data:', error)
  }
}

async function runTests() {
  if (ENDPOINT_URL === 'YOUR_ENDPOINT_URL_HERE' || !ENDPOINT_URL) {
    console.error('❌ Please set GOOGLE_SHEETS_ENDPOINT in your .env file or replace YOUR_ENDPOINT_URL_HERE in this script.')
    process.exit(1)
  }

  console.log(`🚀 Starting tests against endpoint: ${ENDPOINT_URL}`)

  // 1. Flat JSON Test
  const flatJson = {
    contactName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    destination: 'Paris',
    numPeople: 2,
    message: 'Looking for a relaxing trip.',
    timestamp: new Date().toISOString()
  }

  await sendData('Flat JSON Payload', flatJson)

  // 2. Nested JSON Test
  const nestedJson = {
    customerDetails: {
      firstName: 'Jane',
      lastName: 'Smith',
      contactInfo: {
        email: 'jane.smith@example.com',
        phone: '+0987654321'
      }
    },
    tripDetails: {
      destination: {
        id: 'dest-123',
        name: 'Tokyo, Japan',
        continent: 'Asia'
      },
      preferences: {
        numPeople: 4,
        budget: 'High',
        activities: ['Sightseeing', 'Food Tours']
      }
    },
    metadata: {
      source: 'website_test_script',
      submittedAt: new Date().toISOString()
    }
  }

  await sendData('Nested JSON Payload', nestedJson)
}

runTests()
