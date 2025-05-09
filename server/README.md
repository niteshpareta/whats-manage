# Invoice Generator Email Server

A backend server for the Invoice Generator application that enables sending invoices via email.

## Setup

1. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

2. Create an environment file by copying the example:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your email credentials:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-work-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=Your Name <your-work-email@gmail.com>
   ```

   **For Gmail users:**
   - You need to use an App Password instead of your regular password
   - Enable 2-Step Verification in your Google Account
   - Create an App Password: Google Account > Security > App passwords
   - Use that password in the `.env` file

## Running the Server

Start the server in development mode:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will run on port 5000 by default, or you can specify a different port in the `.env` file.

## API Endpoints

### Send Email
- **URL**: `/api/send-email`
- **Method**: POST
- **Body**:
  ```json
  {
    "to": "recipient@example.com",
    "cc": "cc@example.com",
    "bcc": "bcc@example.com",
    "subject": "Invoice #12345",
    "message": "Please find attached invoice...",
    "attachmentData": "base64EncodedPdfData",
    "attachmentName": "invoice.pdf"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "messageId": "message-id-from-email-server"
  }
  ```

### Health Check
- **URL**: `/api/health`
- **Method**: GET
- **Response**:
  ```json
  {
    "status": "OK",
    "timestamp": "2023-04-02T12:34:56.789Z"
  }
  ```

## Troubleshooting

If you encounter issues sending emails:

1. Verify your email credentials in the `.env` file
2. Check that your email provider allows sending from third-party applications
3. For Gmail, ensure you're using an App Password if 2-Step Verification is enabled
4. Check server logs for detailed error messages 