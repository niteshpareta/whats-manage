const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

/**
 * Creates an email transporter using configuration from environment variables
 * @returns {Object} Nodemailer transporter instance
 */
const createTransporter = () => {
  const transportConfig = {
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  };

  return nodemailer.createTransport(transportConfig);
};

/**
 * Saves a base64 encoded PDF to the file system
 * @param {string} base64Data - Base64 encoded PDF data
 * @param {string} fileName - Name to save the file as
 * @returns {string} Path to the saved file
 */
const savePdfFromBase64 = (base64Data, fileName = 'invoice.pdf') => {
  // Remove data:application/pdf;base64, prefix if it exists
  const dataPart = base64Data.split(',')[1] || base64Data;
  
  const uploadDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, Buffer.from(dataPart, 'base64'));
  
  return filePath;
};

/**
 * Prepares email data with all necessary fields and attachments
 * @param {Object} emailData - Basic email information (to, subject, etc.)
 * @param {Object|null} attachmentInfo - Information about the attachment
 * @returns {Object} Complete email data object for nodemailer
 */
const prepareEmailData = (emailData, attachmentInfo = null) => {
  const { to, cc, bcc, subject, message } = emailData;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: message.replace(/\n/g, '<br>'),
    attachments: []
  };
  
  // Add CC and BCC if provided
  if (cc) mailOptions.cc = cc;
  if (bcc) mailOptions.bcc = bcc;
  
  // Add attachment if provided
  if (attachmentInfo) {
    if (attachmentInfo.path) {
      // File already exists
      mailOptions.attachments.push({
        filename: attachmentInfo.filename || 'attachment',
        path: attachmentInfo.path
      });
    } else if (attachmentInfo.base64Data) {
      // Save base64 data to file
      const filePath = savePdfFromBase64(
        attachmentInfo.base64Data, 
        attachmentInfo.filename || 'invoice.pdf'
      );
      
      mailOptions.attachments.push({
        filename: attachmentInfo.filename || 'invoice.pdf',
        path: filePath
      });
    }
  }
  
  return mailOptions;
};

/**
 * Cleans up temporary files after sending an email
 * @param {string|null} filePath - Path to the file to delete
 */
const cleanupTempFiles = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  createTransporter,
  savePdfFromBase64,
  prepareEmailData,
  cleanupTempFiles
}; 