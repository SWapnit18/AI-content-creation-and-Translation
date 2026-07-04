const nodemailer = require('nodemailer');

/**
 * Utility to send emails via Nodemailer with a fallback to console logging
 * when SMTP environment variables are not configured.
 * 
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.message - Text body
 * @param {string} options.html - HTML body
 * @returns {Promise<Object>} Object containing delivery status and optional fallback URL (for testing)
 */
const sendEmail = async (options) => {
  const isSmtpConfigured = 
    process.env.SMTP_HOST && 
    process.env.SMTP_PORT && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS;

  if (isSmtpConfigured) {
    // Create reusable transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: parseInt(process.env.SMTP_PORT, 10) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'WordFlow Global'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email successfully sent to ${options.email}. Message ID: ${info.messageId}`);
    return { success: true, sent: true };
  } else {
    // Fallback: SMTP is not configured. Log the email structure to console
    console.log('\n=================== MOCK EMAIL SENDER ===================');
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log('---------------------------------------------------------');
    console.log(options.message);
    console.log('=========================================================\n');
    
    return {
      success: true,
      sent: false,
      message: 'SMTP credentials not configured. Email logged to server console.',
    };
  }
};

module.exports = sendEmail;
