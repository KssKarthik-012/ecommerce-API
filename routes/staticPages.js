const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Static content (can be replaced with DB/file content later)
const pages = {
  about: {
    title: 'About Us',
    content: 'RTQ Foods is dedicated to providing healthy, high-quality food products...'
  },
  contact: {
    title: 'Contact Us',
    content: 'For inquiries, email us at support@rtqfoods.com or WhatsApp us at +91-XXXXXXXXXX.'
  },
  privacy: {
    title: 'Privacy Policy',
    content: 'We value your privacy. Read our full privacy policy here...'
  },
  terms: {
    title: 'Terms & Conditions',
    content: 'By using our platform, you agree to the following terms...'
  }
};

router.get('/:page', (req, res) => {
  const { page } = req.params;
  if (pages[page]) {
    res.json({ success: true, page: pages[page] });
  } else {
    res.status(404).json({ success: false, message: 'Page not found' });
  }
});

// POST /contact - receive contact form and send email
router.post('/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Create transport using env config. Ensure these are set in your .env
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const toEmail = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;

    const mailOptions = {
      from: `${name} <${email}>`,
      to: toEmail,
      subject: `[Contact Form] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\n\nMessage:\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Phone:</strong> ${phone || '-'}</p>
             <hr />
             <p>${message.replace(/\n/g, '<br/>')}</p>`
    };

    const info = await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: 'Enquiry sent', info });
  } catch (err) {
    console.error('Error sending contact email', err);
    return res.status(500).json({ success: false, message: 'Failed to send enquiry', error: err.message });
  }
});

module.exports = router; 