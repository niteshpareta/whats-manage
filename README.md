# WhatsManage Invoice Generator

A professional invoice generator application with email capabilities for sending invoices directly from your work email.

## Quick Start

Use the convenient startup script to launch both frontend and backend:

```bash
./start-app.sh
```

This will start:
- Email server on port 8000
- Frontend application on port 3000

## Features

- Create professional tax-compliant GST invoices
- Support for both IGST and CGST+SGST calculations
- Real-time invoice preview
- Partner database integration
- Print and download invoices as PDFs
- Send invoices via email directly from your work email
- Business settings to customize company information

## Manual Setup Instructions

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the frontend development server:
```bash
npm start
```

### Email Backend Setup

1. Set up the email server:
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

4. Start the email server:
```bash
cd server
npm run dev
```

### Running Both Frontend and Backend Manually

To run both the frontend and backend simultaneously:

```bash
npm run dev
```

## Using the Email Feature

1. Fill out the invoice form with all required details
2. Click "Generate Invoice" to create the invoice
3. Click "Email Invoice" in the sidebar
4. Fill out the email form (recipient, subject, message)
5. Click "Send Email" to send the invoice

## Development

### Project Structure

- `/src` - Frontend React application
- `/server` - Email backend service
- `/public` - Static assets and CSV data

### Technologies Used

- React for the frontend UI
- Node.js and Express for the email backend
- Nodemailer for email functionality
- HTML2PDF for PDF generation
- Tailwind CSS for styling

## License

[MIT License](LICENSE)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines. 