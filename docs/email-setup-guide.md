# Email Setup Guide

This guide provides instructions for setting up the email functionality with different email providers in the WhatsManage Invoice Generator.

## Table of Contents

1. [General Setup](#general-setup)
2. [Gmail Setup](#gmail-setup)
3. [Outlook/Office 365 Setup](#outlookoffice-365-setup)
4. [Yahoo Mail Setup](#yahoo-mail-setup)
5. [Custom SMTP Setup](#custom-smtp-setup)
6. [Troubleshooting](#troubleshooting)

## General Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Create an environment file by copying the example:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your email credentials following the provider-specific instructions below.

4. Start the email server:
   ```bash
   cd ..
   npm run dev
   ```

## Gmail Setup

Gmail requires you to use an "App Password" when accessing your account from third-party applications.

1. Set up 2-Step Verification:
   - Go to your [Google Account > Security](https://myaccount.google.com/security)
   - Enable "2-Step Verification" if not already enabled

2. Create an App Password:
   - Go to [App passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app and "Other" as the device (name it "WhatsManage")
   - Copy the 16-character password that appears

3. Update your `.env` file:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=nitesh.kumar@voltmoney.in
   EMAIL_PASS=tywbolrfnyvakafp
   EMAIL_FROM=Nitesh Kumar <nitesh.kumar@voltmoney.in>
   ```

## Outlook/Office 365 Setup

For Outlook or Office 365, you can use their dedicated service:

1. Update your `.env` file:
   ```
   EMAIL_SERVICE=outlook
   EMAIL_USER=your-outlook-email@outlook.com
   EMAIL_PASS=your-regular-password
   EMAIL_FROM=Your Name <your-outlook-email@outlook.com>
   ```

For Office 365 accounts with required MFA, you may need to:
- Create an [app password](https://account.microsoft.com/security) similarly to Gmail

## Yahoo Mail Setup

For Yahoo Mail:

1. Enable "Allow apps that use less secure sign-in" in your Yahoo account settings:
   - Go to [Account Security](https://login.yahoo.com/account/security)
   - Toggle "Allow apps that use less secure sign-in" to ON

2. Update your `.env` file:
   ```
   EMAIL_SERVICE=yahoo
   EMAIL_USER=your-yahoo-email@yahoo.com
   EMAIL_PASS=your-password
   EMAIL_FROM=Your Name <your-yahoo-email@yahoo.com>
   ```

## Custom SMTP Setup

If your company uses its own email server or a different provider:

1. Update your `.env` file with SMTP details:
   ```
   EMAIL_HOST=smtp.yourcompany.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@yourcompany.com
   EMAIL_PASS=your-password
   EMAIL_FROM=Your Name <your-email@yourcompany.com>
   ```

2. Update the `server/server.js` file to use custom SMTP settings:

   Find the `createTransporter` function and replace it with:
   ```javascript
   const createTransporter = () => {
     const transportConfig = {
       host: process.env.EMAIL_HOST,
       port: process.env.EMAIL_PORT,
       secure: process.env.EMAIL_SECURE === 'true',
       auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASS
       }
     };

     return nodemailer.createTransport(transportConfig);
   };
   ```

## Troubleshooting

### Email Not Sending

1. Check your credentials in the `.env` file
2. Verify your email provider allows third-party access
3. Check the server logs for specific error messages
4. Ensure you're using the correct service name or SMTP settings

### Authentication Failed

1. Double-check your password or app password
2. Verify your email address is correct
3. Check if your email provider requires additional security settings

### Connection Errors

1. Check your internet connection
2. Verify the SMTP server details (for custom SMTP)
3. Ensure your firewall isn't blocking outgoing mail connections

### Content Issues

If emails are sending but with formatting issues:

1. Check the HTML content in the email template
2. Verify the PDF attachment is being generated correctly
3. Test with plain text content to isolate the issue

## Testing Email Configuration

You can use the built-in health check to verify your server is running:

1. Navigate to: `http://localhost:5000/api/health`
2. You should see a status message: `{"status":"OK","timestamp":"..."}`

To test email sending specifically, generate an invoice and use the "Email Invoice" feature from the application.