
import { CollectionAfterChangeHook } from 'payload'
import nodemailer from 'nodemailer'

export const sendLeadEmail: CollectionAfterChangeHook = async ({
  doc, // full document data
  req, // full express request
  operation, // name of the operation ie. 'create', 'update'
}) => {
  if (operation === 'create') {
    try {
      // Create a transporter using Zoho Mail SMTP settings
      // You should add these variables to your .env file
      const transporter = nodemailer.createTransport({
        host: 'smtppro.zoho.in', // or smtp.zoho.com check your region
        port: 465,
        secure: true, // ssl
        auth: {
          user: process.env.SMTP_USER || process.env.ZOHO_USER,
          pass: process.env.SMTP_PASS || process.env.ZOHO_PASS,
        },
      })

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.ZOHO_USER,
        to: process.env.LEAD_NOTIFICATION_EMAIL || process.env.SMTP_USER || process.env.ZOHO_USER, // Send to yourself
        subject: `New Lead: ${doc.formType || 'Custom Trip'} Request`,
        html: `
          <h1>New Lead Received</h1>
          <p><strong>Form Type:</strong> ${doc.formType || 'Custom Trip'}</p>
          <p><strong>Number of People:</strong> ${doc.numPeople}</p>
          <p><strong>Destination:</strong> ${doc.destination || 'Not specified'}</p>
          <p><strong>Dates:</strong> ${doc.startDate} - ${doc.endDate}</p>
          <p><strong>Budget:</strong> ${doc.budgetMin} - ${doc.budgetMax}</p>
          <p><strong>Preferences:</strong><br/>${doc.preferences}</p>
          <p><strong>Contact Details (if available in user relation):</strong> User ID: ${typeof doc.user === 'object' ? doc.user?.id : doc.user}</p>
          <hr/>
          <pre>${JSON.stringify(doc, null, 2)}</pre>
        `,
      }

      const info = await transporter.sendMail(mailOptions)
      req.payload.logger.info(`📧 Email sent: ${info.messageId}`)
    } catch (error) {
      req.payload.logger.error(`❌ Failed to send email: ${error}`)
    }
  }

  return doc
}
