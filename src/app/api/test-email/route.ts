
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = process.env.ZOHO_USER
    const pass = process.env.ZOHO_PASS

    if (!user || !pass) {
      return NextResponse.json(
        { error: 'Missing ZOHO_USER or ZOHO_PASS env variables' },
        { status: 500 },
      )
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtppro.zoho.in',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    })

    // Verify connection config
    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        if (error) {
          console.log(error)
          reject(error)
        } else {
          console.log('Server is ready to take our messages')
          resolve(success)
        }
      })
    })

    const mailOptions = {
      from: `"Test Server" <${user}>`,
      to: user, // Send to self to test
      subject: 'Test Email from Lets Tour Config',
      text: 'If you are reading this, the mail configuration is working correctly! 🚀',
      html: '<b>If you are reading this, the mail configuration is working correctly! 🚀</b>',
    }

    const info = await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      recipient: user,
    })
  } catch (error: any) {
    console.error('Test email failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
        details: error,
      },
      { status: 500 },
    )
  }
}
