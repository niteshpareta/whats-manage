require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
});

// Middleware
app.use(cors({
  origin: '*',  // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],  // Allow all common methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add a simple root endpoint
app.get('/', (req, res) => {
  res.status(200).send('Email server is running');
});

// Create email transporter
const createTransporter = () => {
  // If specific SMTP settings are provided, use them
  if (process.env.EMAIL_HOST && process.env.EMAIL_PORT) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  // Otherwise use service-based configuration
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// API Routes
app.post('/api/send-email', upload.single('attachment'), async (req, res) => {
  try {
    const { to, cc, bcc, subject, message } = req.body;
    const emailData = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: message.replace(/\n/g, '<br>'),
      attachments: []
    };

    // Add CC and BCC if provided
    if (cc) emailData.cc = cc;
    if (bcc) emailData.bcc = bcc;

    // Add attachment if provided
    if (req.file) {
      emailData.attachments.push({
        filename: req.file.originalname,
        path: req.file.path
      });
    } else if (req.body.attachmentData) {
      // Handle base64 PDF data from request
      const pdfData = req.body.attachmentData.split(',')[1] || req.body.attachmentData; // Remove data:application/pdf;base64, if present
      const fileName = req.body.attachmentName || 'invoice.pdf';
      const filePath = path.join(__dirname, 'uploads', fileName);
      
      // Ensure uploads directory exists
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, Buffer.from(pdfData, 'base64'));
      
      emailData.attachments.push({
        filename: fileName,
        path: filePath
      });
    }

    // Create transporter and send email
    const transporter = createTransporter();
    const info = await transporter.sendMail(emailData);

    // Clean up temp files
    if (req.file) {
      fs.unlinkSync(req.file.path);
    } else if (req.body.attachmentData && fs.existsSync(path.join(__dirname, 'uploads', req.body.attachmentName || 'invoice.pdf'))) {
      fs.unlinkSync(path.join(__dirname, 'uploads', req.body.attachmentName || 'invoice.pdf'));
    }

    console.log('Email sent: %s', info.messageId);
    res.status(200).json({
      success: true,
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/email-settings', async (req, res) => {
  try {
    const { email, appPassword, senderName, companyName, defaultSubjectTemplate, defaultMessageTemplate } = req.body;
    
    // Update environment variables
    process.env.EMAIL_SERVICE = 'gmail';
    process.env.EMAIL_USER = email;
    process.env.EMAIL_PASS = appPassword;
    process.env.EMAIL_FROM = `${senderName} <${email}>`;
    
    // Test the connection
    const transporter = createTransporter();
    await transporter.verify();
    
    res.status(200).json({
      success: true,
      message: 'Email settings saved successfully'
    });
  } catch (error) {
    console.error('Error saving email settings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/test-email', async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    
    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: message.replace(/\n/g, '<br>')
    });
    
    res.status(200).json({
      success: true,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date(),
    config: {
      email_service: process.env.EMAIL_SERVICE || process.env.EMAIL_HOST || 'Not configured',
      email_from: process.env.EMAIL_FROM || 'Not configured'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/send-email`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
}); 