import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { generateInvoiceHTML } from '../utils/invoiceUtils';
import { invoiceTemplate } from '../utils/invoiceTemplate';

const EmailInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { invoiceData } = location.state || {};
  const pdfIframeRef = useRef(null);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [pdfBase64, setPdfBase64] = useState('');
  
  // Get partner email from invoice data
  const partnerEmail = invoiceData?.partner_email || '';
  
  // Load saved email settings
  const [emailSettings, setEmailSettings] = useState(null);
  useEffect(() => {
    const savedSettings = localStorage.getItem('emailSettings');
    if (savedSettings) {
      setEmailSettings(JSON.parse(savedSettings));
    }
  }, []);
  
  // Initialize email form with templates
  const [emailForm, setEmailForm] = useState({
    to: partnerEmail,
    cc: '',
    bcc: '',
    subject: '',
    message: ''
  });

  // Apply templates when email settings or invoice data changes
  useEffect(() => {
    if (emailSettings && invoiceData) {
      let subject = emailSettings.defaultSubjectTemplate;
      let message = emailSettings.defaultMessageTemplate;
      
      // Get the amount with the Rupee symbol for display
      const amount = invoiceData.TOTAL_WITH_TAX || '₹ 0.00';
      
      // Replace variables in subject
      subject = subject
        .replace('{{invoiceNumber}}', invoiceData.INVOICE_NO || '')
        .replace('{{serviceDescription}}', invoiceData.SERVICE_DESCRIPTION || 'financial intermediation services')
        .replace('{{companyName}}', emailSettings.companyName || '');
      
      // Replace variables in message
      message = message
        .replace('{{vendorName}}', invoiceData.Vendor_name || '')
        .replace('{{invoiceNumber}}', invoiceData.INVOICE_NO || '')
        .replace('{{invoiceDate}}', invoiceData.INVOICE_DATE || '')
        .replace('{{amount}}', amount)
        .replace('{{serviceDescription}}', invoiceData.SERVICE_DESCRIPTION || 'financial intermediation services')
        .replace('{{companyName}}', emailSettings.companyName || '');
      
      setEmailForm(prev => ({
        ...prev,
        subject,
        message
      }));
    }
  }, [emailSettings, invoiceData]);

  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);

  // Generate PDF when component mounts
  useEffect(() => {
    if (invoiceData) {
      generatePdf();
    }
  }, [invoiceData]); // eslint-disable-line react-hooks/exhaustive-deps

  const generatePdf = async () => {
    if (!invoiceData) return;
    
    try {
      // Create a hidden iframe to render the invoice
      const iframeContent = generateInvoiceHTML(invoiceTemplate, invoiceData);
      if (pdfIframeRef.current) {
        pdfIframeRef.current.srcdoc = iframeContent;
        
        // Wait for iframe to load
        await new Promise(resolve => {
          pdfIframeRef.current.onload = resolve;
        });
        
        // Generate PDF from iframe content
        const element = pdfIframeRef.current.contentDocument.documentElement;
        const filename = invoiceData.INVOICE_NO 
          ? `Invoice_${invoiceData.INVOICE_NO}.pdf`
          : `Invoice_${new Date().toISOString().slice(0, 10)}.pdf`;

        const options = {
          margin: 0.5,
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
          output: 'datauristring'
        };

        const pdfOutput = await html2pdf().set(options).from(element).outputPdf('datauristring');
        setPdfBase64(pdfOutput);
        setPdfGenerated(true);
      }
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF attachment. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pdfGenerated || !pdfBase64) {
      setError('PDF attachment is not ready. Please wait or try again.');
      return;
    }
    
    setIsSending(true);
    setError(null);
    
    try {
      // Prepare the email data
      const emailData = {
        to: emailForm.to,
        cc: emailForm.cc,
        bcc: emailForm.bcc,
        subject: emailForm.subject,
        message: emailForm.message,
        attachmentData: pdfBase64,
        attachmentName: invoiceData.INVOICE_NO 
          ? `Invoice_${invoiceData.INVOICE_NO}.pdf`
          : `Invoice_${new Date().toISOString().slice(0, 10)}.pdf`
      };
      
      // Send to backend API
      const response = await fetch('http://localhost:8000/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
        mode: 'cors'
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }
      
      // Success scenario
      setEmailSent(true);
      console.log('Email sent successfully:', result);
      
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err.message || 'Failed to send email. Please try again later.');
    } finally {
      setIsSending(false);
    }
  };

  if (!invoiceData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="brand-card overflow-hidden">
          <div className="px-6 py-4">
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Invoice Data</h2>
              <p className="text-gray-600 mb-6">Please generate an invoice first before trying to send it via email.</p>
              <button 
                onClick={() => navigate('/', { state: { invoiceData } })}
                className="brand-button"
              >
                Create an Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="brand-card overflow-hidden">
          <div className="px-6 py-4">
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Email Sent Successfully!</h2>
              <p className="text-gray-600 mb-6">Your invoice has been sent to {emailForm.to}.</p>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => navigate('/', { state: { invoiceData } })}
                  className="brand-button-secondary"
                >
                  Back to Invoice Generator
                </button>
                <button 
                  onClick={() => {
                    setEmailSent(false);
                    setEmailForm(prev => ({...prev, to: partnerEmail, cc: '', bcc: ''}));
                  }}
                  className="brand-button"
                >
                  Send Another Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          <span className="text-gradient">Send Invoice via Email</span>
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:text-lg md:mt-4">
          Fill out the form below to email your invoice as a PDF attachment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main email form */}
        <div className="lg:col-span-2">
          <div className="brand-card overflow-hidden">
            <div className="px-4 py-5 bg-gray-50 border-b border-gray-200 sm:px-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Email Details</h2>
                <div className="text-sm font-medium text-gray-500">
                  Invoice: {invoiceData.INVOICE_NO || 'Draft Invoice'}
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  <p>{error}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="to" className="brand-label">
                    To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="to"
                    name="to"
                    value={emailForm.to}
                    onChange={handleChange}
                    className="brand-input"
                    required
                    placeholder="recipient@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="cc" className="brand-label">
                    CC
                  </label>
                  <input
                    type="text"
                    id="cc"
                    name="cc"
                    value={emailForm.cc}
                    onChange={handleChange}
                    className="brand-input"
                    placeholder="cc@example.com, another@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="bcc" className="brand-label">
                    BCC
                  </label>
                  <input
                    type="text"
                    id="bcc"
                    name="bcc"
                    value={emailForm.bcc}
                    onChange={handleChange}
                    className="brand-input"
                    placeholder="bcc@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="brand-label">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={emailForm.subject}
                    onChange={handleChange}
                    className="brand-input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="brand-label">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={emailForm.message}
                    onChange={handleChange}
                    className="brand-input"
                    rows="10"
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/', { state: { invoiceData } })}
                    className="brand-button-secondary"
                  >
                    Back to Invoice
                  </button>
                  
                  <button
                    type="submit"
                    className="brand-button"
                    disabled={isSending || !pdfGenerated}
                  >
                    {isSending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : !pdfGenerated ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Preparing PDF...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        Send Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Partner details sidebar */}
        <div className="lg:col-span-1">
          <div className="brand-card overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Vendor Details</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Vendor Name:</p>
                  <p className="font-medium">{invoiceData.Vendor_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">GST Number:</p>
                  <p className="font-medium">{invoiceData.GSTN}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">State:</p>
                  <p className="font-medium">{invoiceData.STATE}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email:</p>
                  <p className="font-medium">{partnerEmail || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bank Account:</p>
                  <p className="font-medium">{invoiceData.masked_account_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">IFSC Code:</p>
                  <p className="font-medium">{invoiceData.masked_ifsc}</p>
                </div>
              </div>
              
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Invoice Number:</span>
                    <span className="font-medium">{invoiceData.INVOICE_NO || 'Draft Invoice'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Invoice Date:</span>
                    <span className="font-medium">{invoiceData.INVOICE_DATE}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Amount:</span>
                    <span className="font-medium">{invoiceData.TOTAL_WITH_TAX}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500">
                  {pdfGenerated 
                    ? "PDF attachment is ready to be sent" 
                    : "Preparing PDF attachment..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden iframe for PDF generation */}
      <iframe 
        ref={pdfIframeRef}
        style={{ display: 'none' }}
        title="PDF Generator"
      />
    </div>
  );
};

export default EmailInvoice; 