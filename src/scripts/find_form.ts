import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function findForm() {
  const payload = await getPayload({ config: configPromise })
  const forms = await payload.find({
    collection: 'forms',
    limit: 10,
  })
  console.log("Forms available:", JSON.stringify(forms.docs.map(f => ({ id: f.id, title: f.title })), null, 2))
}

findForm().catch(console.error)
