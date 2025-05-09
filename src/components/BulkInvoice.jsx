import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { invoiceTemplate } from '../utils/invoiceTemplate';
import { generateInvoiceHTML, prepareInvoiceData, numberToWords, saveGeneratedInvoice, generateInvoiceNumber } from '../utils/invoiceUtils';
import html2pdf from 'html2pdf.js';
import JSZip from 'jszip';

const BulkInvoice = () => {
  const [invoiceData, setInvoiceData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'preview', 'generate', 'email'
  const [generatedPdfs, setGeneratedPdfs] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [emailStatus, setEmailStatus] = useState(null);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: 'Invoice from WhatsManage',
    message: 'Please find attached invoice for your reference.\n\nThank you for your business.\n\nRegards,\nWhatsManage Team'
  });
  const [businessSettings, setBusinessSettings] = useState(null);
  const fileInputRef = useRef(null);
  const previewIframeRef = useRef(null);
  
  // Load email settings and business settings when component mounts
  const [emailSettings, setEmailSettings] = useState(null);
  useEffect(() => {
    // Load email settings
    const savedEmailSettings = localStorage.getItem('emailSettings');
    if (savedEmailSettings) {
      setEmailSettings(JSON.parse(savedEmailSettings));
    }
    
    // Load business settings
    const savedBusinessSettings = localStorage.getItem('businessSettings');
    if (savedBusinessSettings) {
      setBusinessSettings(JSON.parse(savedBusinessSettings));
    }
    
    // Restore bulk invoice state from localStorage if available
    try {
      const savedBulkInvoiceState = localStorage.getItem('bulkInvoiceState');
      if (savedBulkInvoiceState) {
        const state = JSON.parse(savedBulkInvoiceState);
        if (state.invoiceData && state.invoiceData.length > 0) {
          setInvoiceData(state.invoiceData);
          setCurrentStep(state.currentStep || 'preview');
          if (state.generatedPdfs && state.generatedPdfs.length > 0) {
            setGeneratedPdfs(state.generatedPdfs);
            if (state.selectedInvoices) {
              setSelectedInvoices(state.selectedInvoices);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error restoring bulk invoice state:', error);
    }
  }, []);
  
  // Save bulk invoice state to localStorage when it changes
  useEffect(() => {
    try {
      // Only save state if we have data to save
      if (invoiceData.length > 0) {
        const stateToSave = {
          invoiceData,
          currentStep,
          generatedPdfs,
          selectedInvoices
        };
        localStorage.setItem('bulkInvoiceState', JSON.stringify(stateToSave));
      }
    } catch (error) {
      console.error('Error saving bulk invoice state:', error);
    }
  }, [invoiceData, currentStep, generatedPdfs, selectedInvoices]);

  // Function to get place of supply from GST number
  const getPlaceOfSupply = (gstNumber) => {
    if (!gstNumber || gstNumber.length < 2) return 'Karnataka(29)'; // Default
    
    const stateCode = gstNumber.substring(0, 2);
    const stateMap = {
      '01': 'Jammu and Kashmir',
      '02': 'Himachal Pradesh',
      '03': 'Punjab',
      '04': 'Chandigarh',
      '05': 'Uttarakhand',
      '06': 'Haryana',
      '07': 'Delhi',
      '08': 'Rajasthan',
      '09': 'Uttar Pradesh',
      '10': 'Bihar',
      '11': 'Sikkim',
      '12': 'Arunachal Pradesh',
      '13': 'Nagaland',
      '14': 'Manipur',
      '15': 'Mizoram',
      '16': 'Tripura',
      '17': 'Meghalaya',
      '18': 'Assam',
      '19': 'West Bengal',
      '20': 'Jharkhand',
      '21': 'Odisha',
      '22': 'Chhattisgarh',
      '23': 'Madhya Pradesh',
      '24': 'Gujarat',
      '26': 'Dadra and Nagar Haveli and Daman and Diu',
      '27': 'Maharashtra',
      '28': 'Andhra Pradesh',
      '29': 'Karnataka',
      '30': 'Goa',
      '31': 'Lakshadweep',
      '32': 'Kerala',
      '33': 'Tamil Nadu',
      '34': 'Puducherry',
      '35': 'Andaman and Nicobar Islands',
      '36': 'Telangana',
      '37': 'Ladakh',
      '38': 'Other Territory'
    };
    
    const stateName = stateMap[stateCode] || 'Unknown';
    return `${stateName}(${stateCode})`;
  };

  const downloadSampleTemplate = () => {
    window.location.href = '/bulk_invoice_template.csv';
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's a CSV file
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Read the file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target.result;
        
        // Parse CSV
        const lines = csvText.split('\n');
        if (lines.length < 2) {
          throw new Error('CSV file is empty or has no data rows');
        }

        const headers = lines[0].split(',').map(header => header.trim());
        const requiredFields = ['partner_id', 'partner_name', 'gst_no', 'amount', 'invoice_date'];
        
        // Validate headers
        for (const field of requiredFields) {
          if (!headers.includes(field)) {
            throw new Error(`CSV is missing required field: ${field}`);
          }
        }
        
        // Determine place of supply from business settings
        let placeOfSupply = 'Karnataka(29)'; // Default
        if (businessSettings && businessSettings.gstn) {
          placeOfSupply = getPlaceOfSupply(businessSettings.gstn);
        }
        
        const parsedData = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = lines[i].split(',');
          if (values.length !== headers.length) {
            console.warn(`Line ${i} has ${values.length} values, expected ${headers.length}. Skipping.`);
            continue;
          }
          
          const rowData = {};
          for (let j = 0; j < headers.length; j++) {
            rowData[headers[j]] = values[j].trim();
          }
          
          // Get the service description, month and year
          const serviceDescription = rowData.service_description || 'Financial intermediation services';
          const serviceMonth = rowData.service_month || '';
          const serviceYear = rowData.service_year || new Date().getFullYear();
          
          // Format the service description with month and year appended
          const formattedServiceDescription = serviceMonth && serviceYear 
            ? `${serviceDescription}-${serviceMonth}-${serviceYear}`
            : serviceDescription;
          
          // Process data into invoice format
          const invoiceFormData = {
            Vendor_name: rowData.partner_name,
            GSTN: rowData.gst_no,
            INVOICE_NO: rowData.invoice_no || '',
            INVOICE_DATE: rowData.invoice_date || new Date().toISOString().split('T')[0],
            TERMS: 'Net 30 days',
            PLACE_OF_SUPPLY: placeOfSupply,
            BASE_AMOUNT: rowData.amount || '0',
            CGST_AMT: '',
            SGST_AMT: '',
            IGST_AMT: '',
            TOTAL_WITH_TAX: '',
            AMOUNT_IN_WORDS: '',
            TAX_NOTE: '',
            Bank_name: rowData.bank_accountifsccode || '',
            partner_bank_account: rowData.bank_account_number || '',
            ADJUSTMENT: '0.00',
            TOTAL_AMOUNT: '',
            SERVICE_DESCRIPTION: formattedServiceDescription,
            service_month: serviceMonth,
            service_year: serviceYear,
            REFERENCE_NO: rowData.reference_no || '',
            partner_email: rowData.partner_email || '',
            COUNTRY: 'India',
            UTR: rowData.utr || '',
            HSN_SAC: rowData.hsn_sac || '9971', // Default HSN/SAC code for financial services
            QTY: rowData.qty || '1' // Default quantity to 1
          };
          
          // Determine if IGST should be applied based on GST number
          if (rowData.gst_no && rowData.gst_no.length >= 2) {
            // Get vendor state code
            const vendorStateCode = rowData.gst_no.substring(0, 2);
            
            // Get business state code from settings
            let businessStateCode = '29'; // Default to Karnataka
            if (businessSettings && businessSettings.gstn && businessSettings.gstn.length >= 2) {
              businessStateCode = businessSettings.gstn.substring(0, 2);
            }
            
            // If vendor state code is different from business state code, apply IGST
            invoiceFormData.is_igst = vendorStateCode !== businessStateCode;
            
            // Set state based on GST
            const stateMap = {
              '01': 'Jammu and Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
              '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
              '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
              '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
              '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
              '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
              '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
              '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
              '26': 'Dadra and Nagar Haveli and Daman and Diu', '27': 'Maharashtra',
              '28': 'Andhra Pradesh', '29': 'Karnataka', '30': 'Goa',
              '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu',
              '34': 'Puducherry', '35': 'Andaman and Nicobar Islands',
              '36': 'Telangana', '37': 'Ladakh', '38': 'Other Territory'
            };
            
            invoiceFormData.STATE = stateMap[vendorStateCode] || '';
          } else {
            invoiceFormData.is_igst = false;
            invoiceFormData.STATE = '';
          }

          parsedData.push(invoiceFormData);
        }
        
        if (parsedData.length === 0) {
          throw new Error('No valid data rows found in the CSV');
        }
        
        setInvoiceData(parsedData);
        setCurrentStep('preview');
      } catch (err) {
        console.error('Error processing CSV:', err);
        setError(err.message || 'Error processing CSV file');
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read the file');
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const generateAllInvoices = async () => {
    if (invoiceData.length === 0) {
      setError('No invoice data to process');
      return;
    }

    setIsLoading(true);
    setCurrentStep('generate');
    setGeneratedPdfs([]);
    setProgress({ current: 0, total: invoiceData.length, percentage: 0 });
    
    // Process invoices one by one
    const pdfs = [];
    
    for (let i = 0; i < invoiceData.length; i++) {
      try {
        // Create a copy of the invoice data before modifying
        const invoiceToProcess = { ...invoiceData[i] };

        // Generate invoice number if not provided in CSV
        if (!invoiceToProcess.INVOICE_NO) {
          invoiceToProcess.INVOICE_NO = generateInvoiceNumber();
        }
        
        // Prepare invoice data
        const preparedData = prepareInvoiceData(invoiceToProcess);
        
        // Save the generated invoice data to localStorage
        saveGeneratedInvoice(preparedData);
        
        // Generate invoice HTML
        const invoiceHtml = generateInvoiceHTML(invoiceTemplate, preparedData);
        
        // Create a hidden iframe with the invoice content
        if (previewIframeRef.current) {
          // Fix invoice HTML content before setting it to iframe
          let fixedInvoiceHtml = invoiceHtml.replace(
            '<div>Invoice No: </div>',
            `<div>Invoice No: <strong>${preparedData.INVOICE_NO}</strong></div>`
          );
          
          previewIframeRef.current.srcdoc = fixedInvoiceHtml;
          
          // Wait for iframe to load
          await new Promise(resolve => {
            previewIframeRef.current.onload = resolve;
          });
          
          // Generate PDF
          const element = previewIframeRef.current.contentDocument.documentElement;
          const filename = preparedData.INVOICE_NO 
            ? `Invoice_${preparedData.INVOICE_NO}.pdf`
            : `Invoice_${preparedData.Vendor_name}_${new Date().toISOString().slice(0, 10)}.pdf`;
          
          const options = {
            margin: 0.5,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
            output: 'datauristring'
          };
          
          const pdfOutput = await html2pdf().set(options).from(element).outputPdf('datauristring');
          
          pdfs.push({
            partnerName: preparedData.Vendor_name,
            invoiceNo: preparedData.INVOICE_NO,
            pdfData: pdfOutput,
            filename
          });
        }
      } catch (error) {
        console.error(`Error generating invoice ${i+1}:`, error);
      }
      
      // Update progress
      setProgress({
        current: i + 1,
        total: invoiceData.length,
        percentage: Math.round(((i + 1) / invoiceData.length) * 100)
      });
    }
    
    setGeneratedPdfs(pdfs);
    setIsLoading(false);
  };

  const downloadInvoice = (pdfData, filename) => {
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = pdfData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllInvoices = async () => {
    if (generatedPdfs.length === 0) {
      setError('No invoices available to download');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create a new zip file
      const zip = new JSZip();
      
      // Add all PDFs to the zip file
      for (const pdf of generatedPdfs) {
        // Convert data URI to binary
        const dataURI = pdf.pdfData;
        const binary = atob(dataURI.split(',')[1]);
        
        // Create array buffer
        const array = [];
        for (let i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i));
        }
        
        // Add to zip file
        zip.file(pdf.filename, new Uint8Array(array), { binary: true });
      }
      
      // Generate the zip file
      const zipContent = await zip.generateAsync({ type: 'blob' });
      
      // Create download link for the zip file
      const zipUrl = URL.createObjectURL(zipContent);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `invoices_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Release the URL object
      URL.revokeObjectURL(zipUrl);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error creating zip file:', error);
      setError('Error creating zip file: ' + error.message);
      setIsLoading(false);
    }
  };

  const resetProcess = () => {
    setInvoiceData([]);
    setGeneratedPdfs([]);
    setCurrentStep('upload');
    setError(null);
    setSelectedInvoices([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Clear the saved state from localStorage
    try {
      localStorage.removeItem('bulkInvoiceState');
    } catch (error) {
      console.error('Error clearing bulk invoice state:', error);
    }
  };

  // Add a function to handle checkbox selection
  const handleInvoiceSelection = (index) => {
    setSelectedInvoices(prevSelected => {
      const isSelected = prevSelected.includes(index);
      if (isSelected) {
        return prevSelected.filter(i => i !== index);
      } else {
        return [...prevSelected, index];
      }
    });
  };

  // Add a function to handle select/deselect all
  const handleSelectAll = (selectAll) => {
    if (selectAll) {
      setSelectedInvoices(generatedPdfs.map((_, index) => index));
    } else {
      setSelectedInvoices([]);
    }
  };

  // Add a function for email form input changes
  const handleEmailFormChange = (e) => {
    const { name, value } = e.target;
    setEmailForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to move to email step
  const goToEmailStep = () => {
    if (selectedInvoices.length === 0) {
      setError('Please select at least one invoice to email');
      return;
    }
    setError(null);
    setCurrentStep('email');
    
    // Apply templates if email settings exist
    if (emailSettings) {
      let subject = emailSettings.defaultSubjectTemplate || 'Invoice from {{companyName}}';
      let message = emailSettings.defaultMessageTemplate || 'Please find attached invoice for your reference.\n\nThank you for your business.\n\nRegards,\n{{companyName}} Team';
      
      subject = subject.replace('{{companyName}}', emailSettings.companyName || 'WhatsManage');
      message = message.replace('{{companyName}}', emailSettings.companyName || 'WhatsManage');
      
      setEmailForm(prev => ({
        ...prev,
        subject,
        message
      }));
    }
  };

  // Function to send batch emails
  const sendBatchEmails = async () => {
    if (selectedInvoices.length === 0) {
      setError('Please select at least one invoice to email');
      return;
    }
    
    setIsSendingEmails(true);
    setEmailStatus({ 
      sent: 0, 
      failed: 0, 
      total: selectedInvoices.length,
      details: []
    });
    
    for (let i = 0; i < selectedInvoices.length; i++) {
      const invoiceIndex = selectedInvoices[i];
      const invoice = generatedPdfs[invoiceIndex];
      
      if (!invoice || !invoice.pdfData) {
        // Skip if no valid data
        setEmailStatus(prev => ({
          ...prev,
          failed: prev.failed + 1,
          details: [...prev.details, { 
            name: invoice?.partnerName || 'Unknown',
            success: false, 
            error: 'No PDF data available'
          }]
        }));
        continue;
      }
      
      try {
        // Get recipient email from invoice data
        const recipientEmail = invoiceData[invoiceIndex]?.partner_email;
        if (!recipientEmail) {
          throw new Error('No recipient email address found');
        }
        
        // Prepare email data for this invoice
        const emailData = {
          to: recipientEmail,
          subject: emailForm.subject.replace('{{invoiceNumber}}', invoice.invoiceNo || ''),
          message: emailForm.message
            .replace('{{vendorName}}', invoiceData[invoiceIndex].Vendor_name || '')
            .replace('{{invoiceNumber}}', invoice.invoiceNo || '')
            .replace('{{invoiceDate}}', invoiceData[invoiceIndex].INVOICE_DATE || '')
            .replace('{{amount}}', `₹ ${parseFloat(invoiceData[invoiceIndex].BASE_AMOUNT || 0).toFixed(2)}`),
          attachmentData: invoice.pdfData,
          attachmentName: invoice.filename
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
        
        // Update status for success
        setEmailStatus(prev => ({
          ...prev,
          sent: prev.sent + 1,
          details: [...prev.details, { 
            name: invoice.partnerName,
            email: recipientEmail,
            success: true 
          }]
        }));
      } catch (err) {
        console.error(`Error sending email for invoice ${invoiceIndex}:`, err);
        
        // Update status for failure
        setEmailStatus(prev => ({
          ...prev,
          failed: prev.failed + 1,
          details: [...prev.details, { 
            name: invoice.partnerName || 'Unknown',
            success: false, 
            error: err.message || 'Error sending email'
          }]
        }));
      }
      
      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setIsSendingEmails(false);
  };
  
  // Add function to go back to invoices list
  const backToInvoicesList = () => {
    setCurrentStep('generate');
    setSelectedInvoices([]);
    setEmailStatus(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          <span className="text-gradient">Bulk Invoice Generator</span>
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:text-lg md:mt-4">
          Generate multiple invoices at once by uploading a CSV file
        </p>
      </div>

      <div className="brand-card overflow-hidden mb-6">
        <div className="px-4 py-5 bg-white sm:p-6">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700">
              {error}
            </div>
          )}

          {/* Step indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className={`flex-1 border-t-2 ${currentStep === 'upload' ? 'border-gray-300' : 'border-indigo-500'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 mx-2 ${currentStep === 'upload' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-indigo-500 bg-indigo-500 text-white'}`}>
                1
              </div>
              <div className={`flex-1 border-t-2 ${currentStep === 'upload' ? 'border-gray-300' : 'border-indigo-500'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 mx-2 ${currentStep === 'preview' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : currentStep === 'generate' || currentStep === 'email' ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300 bg-white text-gray-500'}`}>
                2
              </div>
              <div className={`flex-1 border-t-2 ${currentStep === 'upload' || currentStep === 'preview' ? 'border-gray-300' : 'border-indigo-500'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 mx-2 ${currentStep === 'generate' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : currentStep === 'email' ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300 bg-white text-gray-500'}`}>
                3
              </div>
              <div className={`flex-1 border-t-2 ${currentStep === 'email' ? 'border-indigo-500' : 'border-gray-300'}`}></div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 mx-2 ${currentStep === 'email' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 bg-white text-gray-500'}`}>
                4
              </div>
              <div className="flex-1 border-t-2 border-gray-300"></div>
            </div>
            <div className="flex justify-around text-sm mt-2">
              <div className="text-center">Upload CSV</div>
              <div className="text-center">Preview Data</div>
              <div className="text-center">Generate PDFs</div>
              <div className="text-center">Send Emails</div>
            </div>
          </div>

          {/* Upload step */}
          {currentStep === 'upload' && (
            <div className="text-center py-10">
              <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Upload CSV File</h2>
                <p className="text-gray-600 mb-6">Upload a CSV file with invoice data to generate multiple invoices at once</p>
                
                <div className="flex justify-center items-center gap-4">
                  <button 
                    onClick={downloadSampleTemplate}
                    className="brand-button-secondary flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download Template
                  </button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".csv"
                    className="hidden"
                  />
                  <button
                    onClick={handleUploadClick}
                    className="brand-button flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        Upload CSV
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview step */}
          {currentStep === 'preview' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Preview Invoice Data</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={resetProcess}
                    className="brand-button-tertiary"
                  >
                    Start Over
                  </button>
                  <button 
                    onClick={generateAllInvoices}
                    className="brand-button"
                    disabled={isLoading}
                  >
                    Generate Invoices
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Partner
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GST
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        HSN/SAC
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice No.
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoiceData.map((invoice, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.Vendor_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.GSTN}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹ {parseFloat(invoice.BASE_AMOUNT || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.is_igst ? 'IGST (18%)' : 'CGST+SGST (9%+9%)'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.HSN_SAC}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.QTY}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.INVOICE_DATE}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.INVOICE_NO || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Generate step */}
          {currentStep === 'generate' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Generated Invoices</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={resetProcess}
                    className="brand-button-tertiary"
                  >
                    Start Over
                  </button>
                  {generatedPdfs.length > 0 && (
                    <>
                      <button 
                        onClick={downloadAllInvoices}
                        className="brand-button-secondary"
                      >
                        Download All
                      </button>
                      <button 
                        onClick={goToEmailStep}
                        className="brand-button"
                        disabled={selectedInvoices.length === 0}
                      >
                        Email Selected
                      </button>
                    </>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-10">
                  <svg className="animate-spin h-10 w-10 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-gray-600 mb-4">Generating invoices... Please wait</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 max-w-md mx-auto">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {progress.current} of {progress.total} ({progress.percentage}%)
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {generatedPdfs.length > 0 ? (
                    <>
                      <div className="flex items-center mb-4">
                        <input 
                          id="select-all" 
                          type="checkbox" 
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          checked={selectedInvoices.length === generatedPdfs.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                        <label htmlFor="select-all" className="ml-2 block text-sm text-gray-900">
                          Select All
                        </label>
                        <span className="ml-4 text-sm text-gray-500">
                          {selectedInvoices.length} of {generatedPdfs.length} selected
                        </span>
                      </div>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Select
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Partner
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Invoice No.
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {generatedPdfs.map((pdf, index) => (
                            <tr key={index} className={selectedInvoices.includes(index) ? "bg-indigo-50" : ""}>
                              <td className="px-3 py-4 whitespace-nowrap">
                                <input 
                                  type="checkbox" 
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  checked={selectedInvoices.includes(index)}
                                  onChange={() => handleInvoiceSelection(index)}
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {pdf.partnerName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {pdf.invoiceNo || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {invoiceData[index]?.partner_email || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => downloadInvoice(pdf.pdfData, pdf.filename)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                  Download
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <div className="text-center py-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-600">No invoices have been generated yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Email step */}
          {currentStep === 'email' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Email Invoices</h2>
                <button 
                  onClick={backToInvoicesList}
                  className="brand-button-tertiary"
                >
                  Back to Invoices
                </button>
              </div>

              {/* Email form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="mb-4 text-sm text-gray-600">
                  You are about to send {selectedInvoices.length} invoice(s) to their respective recipients.
                </p>
                <div className="mb-4">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    className="brand-input w-full"
                    value={emailForm.subject}
                    onChange={handleEmailFormChange}
                    placeholder="Invoice from WhatsManage"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Message
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={6}
                    className="brand-input w-full"
                    value={emailForm.message}
                    onChange={handleEmailFormChange}
                    placeholder="Please find attached invoice for your reference."
                  ></textarea>
                  <p className="mt-1 text-xs text-gray-500">
                    You can use the following variables: {"{{vendorName}}, {{invoiceNumber}}, {{invoiceDate}}, {{amount}}"}
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={sendBatchEmails}
                    className="brand-button"
                    disabled={isSendingEmails || selectedInvoices.length === 0}
                  >
                    {isSendingEmails ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending Emails...
                      </>
                    ) : (
                      <>Send {selectedInvoices.length} Email{selectedInvoices.length !== 1 ? 's' : ''}</>
                    )}
                  </button>
                </div>
              </div>

              {/* Email status results */}
              {emailStatus && (
                <div className={`p-4 rounded-lg mb-6 ${
                  emailStatus.failed === 0 ? 'bg-green-50' : 
                  emailStatus.sent === 0 ? 'bg-red-50' : 'bg-yellow-50'
                }`}>
                  <h3 className="text-lg font-medium mb-2">Email Status</h3>
                  <div className="flex justify-between mb-4">
                    <span className="text-green-700">✓ {emailStatus.sent} sent successfully</span>
                    {emailStatus.failed > 0 && (
                      <span className="text-red-700">✗ {emailStatus.failed} failed</span>
                    )}
                  </div>
                  
                  <h4 className="text-sm font-medium mb-2">Details:</h4>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Partner
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {emailStatus.details.map((detail, i) => (
                          <tr key={i}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {detail.name}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                              {detail.email || '-'}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {detail.success ? (
                                <span className="text-green-700">✓ Sent</span>
                              ) : (
                                <span className="text-red-700" title={detail.error}>✗ Failed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden iframe for PDF generation */}
      <iframe 
        ref={previewIframeRef}
        style={{ display: 'none' }}
        title="Invoice Preview"
      />
    </div>
  );
};

export default BulkInvoice; 