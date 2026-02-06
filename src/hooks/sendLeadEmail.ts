
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

      let subject = `New Lead: ${doc.formType || 'Custom Trip'} Request`
      let htmlContent = ''

      // Check if it's a Booking (has bookingReference)
      if (doc.bookingReference) {
         subject = `New Booking Request: ${doc.bookingReference}`
         const pkgName = typeof doc.package === 'object' ? doc.package?.title || doc.package?.name : doc.package
         const guestName = doc.guestName || (typeof doc.user === 'object' ? doc.user?.name : 'Guest')
         const guestEmail = doc.guestEmail || (typeof doc.user === 'object' ? doc.user?.email : '')
         
         const adults = doc.numberOfPeople?.adults || 0
         const children = doc.numberOfPeople?.children || 0
         const infants = doc.numberOfPeople?.infants || 0

         htmlContent = `
           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
             <h2 style="color: #FBAE3D;">New Booking Received</h2>
             <p><strong>Booking Ref:</strong> ${doc.bookingReference}</p>
             <p><strong>Package:</strong> ${pkgName}</p>
             
             <h3>Guest Details</h3>
             <p><strong>Name:</strong> ${guestName}</p>
             <p><strong>Email:</strong> ${guestEmail}</p>
             <p><strong>Phone:</strong> ${doc.guestPhone || doc.contactDetails?.phone || 'N/A'}</p>
             
             <h3>Trip Details</h3>
             <p><strong>Dates:</strong> ${doc.startDate ? new Date(doc.startDate).toLocaleDateString() : 'TBD'} to ${doc.endDate ? new Date(doc.endDate).toLocaleDateString() : 'TBD'}</p>
             <p><strong>Travelers:</strong> ${adults} Adults, ${children} Children, ${infants} Infants</p>
             <p><strong>Total Price:</strong> ${doc.currency || 'INR'} ${doc.totalPrice}</p>
             <p><strong>Status:</strong> ${doc.status}</p>
           </div>
         `
      } else {
         // Default: Custom Trip Request
         subject = `New Custom Trip Request`
         const destName = typeof doc.destination === 'object' ? doc.destination?.name : (doc.destination || 'Not specified')
         const userName = typeof doc.user === 'object' ? doc.user?.name : 'Guest'
         
         htmlContent = `
           <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
             <h2 style="color: #2563EB;">New Custom Trip Request</h2>
             
             <p><strong>Customer:</strong> ${userName}</p>
             <p><strong>Destination:</strong> ${destName}</p>
             <p><strong>Travelers:</strong> ${doc.numPeople || 'N/A'}</p>
             
             <h3>Preferences</h3>
             <p><strong>Budget:</strong> ${doc.budgetMin || 0} - ${doc.budgetMax || 'No Limit'}</p>
             <p><strong>Dates:</strong> ${doc.startDate ? new Date(doc.startDate).toLocaleDateString() : 'Flexible'} - ${doc.endDate ? new Date(doc.endDate).toLocaleDateString() : 'Flexible'}</p>
             <p><strong>Notes:</strong><br/>${doc.preferences || 'None'}</p>
             
             <hr style="border-top: 1px solid #eee; margin: 20px 0;">
             <p style="font-size: 12px; color: #888;">Source: ${doc.source || 'Website'}</p>
           </div>
         `
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.ZOHO_USER,
        to: process.env.LEAD_NOTIFICATION_EMAIL || process.env.SMTP_USER || process.env.ZOHO_USER,
        subject: subject,
        html: htmlContent,
      }

      const info = await transporter.sendMail(mailOptions)
      req.payload.logger.info(`📧 Email sent: ${info.messageId}`)
    } catch (error) {
      req.payload.logger.error(`❌ Failed to send email: ${error}`)
    }
  }

  return doc
}
