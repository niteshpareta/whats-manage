import React, { useState, useEffect, useRef } from 'react';
import { numberToWords, prepareInvoiceData, generateInvoiceHTML, generateInvoiceNumber, saveGeneratedInvoice } from '../utils/invoiceUtils';
import { invoiceTemplate } from '../utils/invoiceTemplate';
import { loadPartnerData, findPartnerById, mapPartnerToInvoiceData } from '../utils/csvUtils';
import useFormValidation from '../hooks/useFormValidation';
import html2pdf from 'html2pdf.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateReferenceNumber } from '../utils/invoiceUtils';

// List of Indian states and union territories
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", 
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

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

const InvoiceForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Load business settings once when component mounts
  const [businessSettings, setBusinessSettings] = useState(null);
  
  useEffect(() => {
    const loadBusinessSettings = () => {
      const savedSettings = localStorage.getItem('businessSettings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
      return null;
    };
    
    setBusinessSettings(loadBusinessSettings());
  }, []);
  
  // Determine place of supply from business settings
  const getDefaultPlaceOfSupply = () => {
    if (businessSettings && businessSettings.gstn) {
      return getPlaceOfSupply(businessSettings.gstn);
    }
    return 'Karnataka(29)'; // Default if no business settings available
  };
  
  // Initialize form data with navigation state if available
  const [formData, setFormData] = useState(() => {
    // Check if we need to clear the form based on location state
    if (location.state?.clearForm) {
      // Clear localStorage
      localStorage.removeItem('invoiceFormData');
      localStorage.removeItem('invoiceData');
      localStorage.removeItem('partnerId');
      
      // Return default form data with a new invoice number
      return {
        Vendor_name: '',
        STATE: '',
        COUNTRY: 'India',
        GSTN: '',
        INVOICE_NO: generateInvoiceNumber(), // Generate invoice number
        INVOICE_DATE: new Date().toISOString().split('T')[0],
        TERMS: 'Net 30 days',
        PLACE_OF_SUPPLY: 'Karnataka(29)', // Will be updated in useEffect after business settings load
        BASE_AMOUNT: '',
        CGST_AMT: '',
        SGST_AMT: '',
        IGST_AMT: '',
        TOTAL_WITH_TAX: '',
        AMOUNT_IN_WORDS: '',
        TAX_NOTE: '',
        Bank_name: '',
        partner_bank_account: '',
        UTR: '',
        ADJUSTMENT: '0.00',
        TOTAL_AMOUNT: '',
        is_igst: false,
        SERVICE_DESCRIPTION: 'Financial intermediation services',
        masked_account_number: 'XXXXXXXX0000',
        masked_ifsc: 'ABCDXXXXx',
        service_month: '',
        service_year: new Date().getFullYear() + 1,
        REFERENCE_NO: '',
        HSN_SAC: '998719', // Default HSN/SAC code for financial intermediation services
        TAX_RATE: '18' // Default tax rate (percentage)
      };
    }
    
    // First check if we have data from navigation state
    if (location.state?.invoiceData) {
      // Save to localStorage when we get new data from navigation
      localStorage.setItem('invoiceFormData', JSON.stringify(location.state.invoiceData));
      return location.state.invoiceData;
    }
    
    // Then check if we have saved data in localStorage
    const savedData = localStorage.getItem('invoiceFormData');
    if (savedData) {
      return JSON.parse(savedData);
    }
    
    // If no saved data, use defaults with a new invoice number
    return {
      Vendor_name: '',
      STATE: '',
      COUNTRY: 'India',
      GSTN: '',
      INVOICE_NO: generateInvoiceNumber(), // Generate invoice number
      INVOICE_DATE: new Date().toISOString().split('T')[0],
      TERMS: 'Net 30 days',
      PLACE_OF_SUPPLY: 'Karnataka(29)', // Will be updated in useEffect after business settings load
      BASE_AMOUNT: '',
      CGST_AMT: '',
      SGST_AMT: '',
      IGST_AMT: '',
      TOTAL_WITH_TAX: '',
      AMOUNT_IN_WORDS: '',
      TAX_NOTE: '',
      Bank_name: '',
      partner_bank_account: '',
      UTR: '',
      ADJUSTMENT: '0.00',
      TOTAL_AMOUNT: '',
      is_igst: false,
      SERVICE_DESCRIPTION: 'Financial intermediation services',
      masked_account_number: 'XXXXXXXX0000',
      masked_ifsc: 'ABCDXXXXx',
      service_month: '',
      service_year: new Date().getFullYear() + 1,
      REFERENCE_NO: '',
      HSN_SAC: '998719', // Default HSN/SAC code for financial intermediation services
      TAX_RATE: '18' // Default tax rate (percentage)
    };
  });

  // Update Place of Supply and other business settings fields when business settings are loaded
  useEffect(() => {
    if (businessSettings) {
      const placeOfSupply = businessSettings.gstn ? getPlaceOfSupply(businessSettings.gstn) : 'Karnataka(29)';
      
      setFormData(prevData => ({
        ...prevData,
        PLACE_OF_SUPPLY: placeOfSupply,
        HSN_SAC: businessSettings.hsnSacCode || prevData.HSN_SAC,
        TAX_RATE: businessSettings.taxRate || prevData.TAX_RATE
      }));
    }
  }, [businessSettings]);

  // Initialize invoice data with navigation state if available
  const [invoiceData, setInvoiceData] = useState(() => {
    // Check if we need to clear the invoice data based on location state
    if (location.state?.clearForm) {
      localStorage.removeItem('invoiceData');
      return null;
    }
    
    if (location.state?.invoiceData) {
      localStorage.setItem('invoiceData', JSON.stringify(location.state.invoiceData));
      return location.state.invoiceData;
    }
    
    const savedData = localStorage.getItem('invoiceData');
    return savedData ? JSON.parse(savedData) : null;
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('invoiceFormData', JSON.stringify(formData));
  }, [formData]);

  // Save invoice data to localStorage whenever it changes
  useEffect(() => {
    if (invoiceData) {
      localStorage.setItem('invoiceData', JSON.stringify(invoiceData));
    }
  }, [invoiceData]);

  // Save partner ID to localStorage
  const [partnerId, setPartnerId] = useState(() => {
    const savedPartnerId = localStorage.getItem('partnerId');
    return savedPartnerId || '';
  });

  // Save partner ID to localStorage whenever it changes
  useEffect(() => {
    if (partnerId) {
      localStorage.setItem('partnerId', partnerId);
    }
  }, [partnerId]);

  const [partnersList, setPartnersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');
  const [showPartnerResults, setShowPartnerResults] = useState(false);
  
  const { handleChange: validateChange, errors, validateForm } = useFormValidation(formData);
  const previewIframeRef = useRef(null);

  // Load partner data when component mounts
  useEffect(() => {
    const fetchPartnerData = async () => {
      setIsLoading(true);
      try {
        const partners = await loadPartnerData();
        setPartnersList(partners);
      } catch (error) {
        console.error('Failed to load partner data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartnerData();
  }, []);

  // Check for clearForm parameter in URL when component mounts
  useEffect(() => {
    // Check if we're on the home page and there's no saved data
    if (location.pathname === '/' && !localStorage.getItem('invoiceFormData')) {
      // This means we just reloaded the page after clicking "New Invoice"
      // The form is already initialized with default values, so we don't need to do anything
      console.log('New invoice form initialized');
    }
  }, [location.pathname]);

  useEffect(() => {
    // Parse URL parameters to get partnerId
    const queryParams = new URLSearchParams(location.search);
    const partnerIdFromUrl = queryParams.get('partnerId');
    
    if (partnerIdFromUrl) {
      // Set the partner ID and trigger the data loading
      setPartnerId(partnerIdFromUrl);
      handlePartnerIdChange({ target: { value: partnerIdFromUrl } });
    }
  }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

  // New function to filter partners based on search query
  const filteredPartners = partnerSearchQuery.trim() === '' 
    ? [] 
    : partnersList.filter(partner => {
        const query = partnerSearchQuery.toLowerCase();
        return (
          (partner.partner_name && partner.partner_name.toLowerCase().includes(query)) ||
          (partner.account_id && partner.account_id.toLowerCase().includes(query)) ||
          (partner.gst_no && partner.gst_no.toLowerCase().includes(query))
        );
      }).slice(0, 5); // Limit to top 5 matches for performance

  // Update the existing handlePartnerIdChange to also work with full partner objects
  const handlePartnerIdChange = (e) => {
    const id = e.target.value;
    setPartnerId(id);
    
    if (id.trim() === '') return;
    
    const partner = findPartnerById(id);
    if (partner) {
      console.log('Applying partner data for ID:', id);
      const partnerFormData = mapPartnerToInvoiceData(partner);
      console.log('Mapped form data:', partnerFormData);
      
      if (partnerFormData) {
        setFormData(prevData => {
          const newData = {
            ...prevData,
            ...partnerFormData,
            REFERENCE_NO: generateReferenceNumber(
              id,
              prevData.service_month,
              prevData.service_year
            )
          };
          console.log('Updated form data:', newData);
          return newData;
        });
      }
    } else {
      console.warn('No partner found with ID:', id);
    }
  };

  // Add new function to handle partner search
  const handlePartnerSearch = (e) => {
    setPartnerSearchQuery(e.target.value);
    setShowPartnerResults(true);
  };

  // Add new function to select partner from search results
  const handleSelectPartner = (partner) => {
    // Set the partner ID
    setPartnerId(partner.account_id);
    
    // Clear search
    setPartnerSearchQuery('');
    setShowPartnerResults(false);
    
    // Apply partner data to form
    const partnerFormData = mapPartnerToInvoiceData(partner);
    
    if (partnerFormData) {
      setFormData(prevData => {
        const newData = {
          ...prevData,
          ...partnerFormData,
          REFERENCE_NO: generateReferenceNumber(
            partner.account_id,
            prevData.service_month,
            prevData.service_year
          )
        };
        return newData;
      });
    }
  };

  // Add click outside handler to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close search results if clicked outside
      if (showPartnerResults && !event.target.closest('.partner-search-container')) {
        setShowPartnerResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPartnerResults]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Update the form data
    setFormData(prevData => {
      const updatedData = {
      ...prevData,
        [name]: newValue
      };
      
      // Auto determine IGST vs CGST+SGST based on GSTN state code
      if (name === 'GSTN' && value.length >= 2) {
        const vendorStateCode = value.substring(0, 2);
        console.log('Vendor GSTN state code detected:', vendorStateCode);
        
        // Get business state code from settings
        let businessStateCode = '29'; // Default to Karnataka
        if (businessSettings && businessSettings.gstn && businessSettings.gstn.length >= 2) {
          businessStateCode = businessSettings.gstn.substring(0, 2);
        }
        console.log('Business GSTN state code:', businessStateCode);
        
        // If state codes are different, apply IGST; otherwise apply CGST+SGST
        updatedData.is_igst = vendorStateCode !== businessStateCode;
        console.log('Auto-setting is_igst to:', updatedData.is_igst);
        
        // Auto-select the state based on GST number
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
        
        updatedData.STATE = stateMap[vendorStateCode] || '';
        console.log('Auto-setting STATE to:', updatedData.STATE);
      }

      // Auto-generate reference number when service month, year, or partner ID changes
      if ((name === 'service_month' || name === 'service_year') && partnerId && 
          updatedData.service_month && updatedData.service_year) {
        updatedData.REFERENCE_NO = generateReferenceNumber(
          partnerId,
          updatedData.service_month,
          updatedData.service_year
        );
      }
      
      return updatedData;
    });
    
    // Also validate the field
    validateChange(e);
  };

  const calculateTaxes = () => {
    if (formData.BASE_AMOUNT) {
      const baseAmount = parseFloat(formData.BASE_AMOUNT);
      const taxRate = parseFloat(formData.TAX_RATE || 18) / 100; // Use form's tax rate, default to 18% if not set
      
      if (formData.is_igst) {
        // IGST calculation (using the tax rate from form)
        const igstAmount = (baseAmount * taxRate).toFixed(2);
        const totalWithTax = (baseAmount + parseFloat(igstAmount)).toFixed(2);
        
        setFormData(prev => ({
          ...prev,
          IGST_AMT: igstAmount,
          CGST_AMT: '0.00',
          SGST_AMT: '0.00',
          TOTAL_WITH_TAX: totalWithTax,
          TOTAL_AMOUNT: totalWithTax,
          AMOUNT_IN_WORDS: numberToWords(parseFloat(totalWithTax))
        }));
      } else {
        // CGST and SGST calculation (half of the tax rate each)
        const halfTaxRate = taxRate / 2;
        const cgstAmount = (baseAmount * halfTaxRate).toFixed(2);
        const sgstAmount = (baseAmount * halfTaxRate).toFixed(2);
        const totalWithTax = (baseAmount + parseFloat(cgstAmount) + parseFloat(sgstAmount)).toFixed(2);
        
        setFormData(prev => ({
          ...prev,
          CGST_AMT: cgstAmount,
          SGST_AMT: sgstAmount,
          IGST_AMT: '0.00',
          TOTAL_WITH_TAX: totalWithTax,
          TOTAL_AMOUNT: totalWithTax,
          AMOUNT_IN_WORDS: numberToWords(parseFloat(totalWithTax))
        }));
      }
    }
  };

  // Recalculate when is_igst, BASE_AMOUNT, or TAX_RATE changes
  useEffect(() => {
    calculateTaxes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.is_igst, formData.BASE_AMOUNT, formData.TAX_RATE]);

  // Update preview in real-time as user types
  useEffect(() => {
    // Prepare invoice data even if BASE_AMOUNT is not yet filled
    const preparedData = prepareInvoiceData(formData);
    setInvoiceData(preparedData);
  }, [formData]);

  // Update service description when month/year change
  useEffect(() => {
    const baseDescription = 'Financial intermediation services';
    let description = baseDescription;
    
    if (formData.service_month || formData.service_year) {
      description += '-';
      if (formData.service_month) {
        description += formData.service_month;
      }
      if (formData.service_year) {
        description += (formData.service_month ? ' ' : '') + formData.service_year;
      }
    }
    
    if (description !== formData.SERVICE_DESCRIPTION) {
      setFormData(prev => ({
        ...prev,
        SERVICE_DESCRIPTION: description
      }));
    }
  }, [formData.service_month, formData.service_year]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log("Submit button clicked, validating form...");
    console.log("Current form data:", formData);
    
    // CRITICAL FIX - Ensure formData is properly updated before validation
    // Force update the formData from the actual DOM form elements to ensure latest values
    const form = e.target;
    const vendorNameInput = form.querySelector('#Vendor_name');
    const gstnInput = form.querySelector('#GSTN');
    const stateSelect = form.querySelector('#STATE');
    
    if (vendorNameInput && vendorNameInput.value && vendorNameInput.value.trim() !== '') {
      formData.Vendor_name = vendorNameInput.value.trim();
    }
    
    if (gstnInput && gstnInput.value && gstnInput.value.trim() !== '') {
      formData.GSTN = gstnInput.value.trim();
    }
    
    if (stateSelect && stateSelect.value && stateSelect.value.trim() !== '') {
      formData.STATE = stateSelect.value.trim();
    }
    
    // Check for important missing fields manually to provide better error messages
    const criticalFields = {
      'Vendor_name': 'Vendor Name',
      'STATE': 'State',
      'GSTN': 'GSTN',
      'BASE_AMOUNT': 'Base Amount'
    };
    
    let missingFields = [];
    for (const [field, label] of Object.entries(criticalFields)) {
      if (!formData[field] || (typeof formData[field] === 'string' && formData[field].trim() === '')) {
        missingFields.push(label);
      }
    }
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    try {
      console.log("Generating invoice with data:", formData);
      
      // Generate reference number using service month and year if needed
      let referenceNo = formData.REFERENCE_NO;
      if (!referenceNo && partnerId && formData.service_month && formData.service_year) {
        referenceNo = generateReferenceNumber(
          partnerId,
          formData.service_month,
          formData.service_year
        );
      }
      
      // Prepare invoice data with reference number
      const preparedData = prepareInvoiceData({
        ...formData,
        REFERENCE_NO: referenceNo
      });
      
      console.log("Invoice data generated successfully");
      setInvoiceData(preparedData);
      
      // Save the generated invoice data for tracking and management
      saveGeneratedInvoice(preparedData);
      
      // After successfully generating the invoice, wait a moment for the preview to update,
      // then trigger the PDF download automatically
      setTimeout(() => {
        if (previewIframeRef.current) {
          const element = previewIframeRef.current.contentDocument.documentElement;
          
          // Use reference number for filename if available, then invoice number, then date
          const filename = formData.REFERENCE_NO 
            ? `Invoice_${formData.REFERENCE_NO}.pdf` 
            : formData.INVOICE_NO 
              ? `Invoice_${formData.INVOICE_NO}.pdf` 
              : `Invoice_${new Date().toISOString().slice(0, 10)}.pdf`;

          const options = {
            margin: 0.5,
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
          };

          html2pdf().set(options).from(element).save();
          
          // Show a success message
          alert('Invoice generated successfully! Your PDF download should begin automatically.');
        }
      }, 500); // Wait 500ms for the iframe to update
      
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert(`Error generating invoice: ${error.message}`);
    }
  };

  const handlePrint = () => {
    if (previewIframeRef.current) {
      const iframeWindow = previewIframeRef.current.contentWindow;
      try {
        iframeWindow.focus();
        iframeWindow.print();
      } catch (error) {
        console.error('Error printing invoice:', error);
        alert('Error printing invoice. Please try again.');
      }
    }
  };

  const handleDownloadPDF = () => {
    if (!previewIframeRef.current) {
      alert('Invoice preview not ready. Please wait and try again.');
      return;
    }

    const element = previewIframeRef.current.contentDocument.documentElement;
    
    // Use reference number for filename if available, then invoice number, then date
    const filename = formData.REFERENCE_NO 
      ? `Invoice_${formData.REFERENCE_NO}.pdf` 
      : formData.INVOICE_NO 
        ? `Invoice_${formData.INVOICE_NO}.pdf` 
        : `Invoice_${new Date().toISOString().slice(0, 10)}.pdf`;

    const options = {
      margin: 0.5,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(options).from(element).save();
  };

  const handleEmailInvoice = () => {
    if (!invoiceData) {
      alert('Please generate an invoice first');
      return;
    }
    
    // Navigate to the email page with invoice data
    navigate('/email-invoice', { state: { invoiceData } });
  };

  // Add a function to clear saved data
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all invoice data? This cannot be undone.')) {
      localStorage.removeItem('invoiceFormData');
      localStorage.removeItem('invoiceData');
      localStorage.removeItem('partnerId');
      setFormData({
        Vendor_name: '',
        STATE: '',
        COUNTRY: 'India',
        GSTN: '',
        INVOICE_NO: '',
        INVOICE_DATE: new Date().toISOString().split('T')[0],
        TERMS: 'Net 30 days',
        PLACE_OF_SUPPLY: 'Karnataka(29)',
        BASE_AMOUNT: '',
        CGST_AMT: '',
        SGST_AMT: '',
        IGST_AMT: '',
        TOTAL_WITH_TAX: '',
        AMOUNT_IN_WORDS: '',
        TAX_NOTE: '',
        Bank_name: '',
        partner_bank_account: '',
        UTR: '',
        ADJUSTMENT: '0.00',
        TOTAL_AMOUNT: '',
        is_igst: false,
        SERVICE_DESCRIPTION: 'Financial intermediation services',
        masked_account_number: 'XXXXXXXX0000',
        masked_ifsc: 'ABCDXXXXx',
        service_month: '',
        service_year: new Date().getFullYear() + 1,
        REFERENCE_NO: '',
        HSN_SAC: businessSettings?.hsnSacCode || '998719', // Use business settings if available
        TAX_RATE: businessSettings?.taxRate || '18' // Use business settings if available
      });
      setInvoiceData(null);
      setPartnerId('');
    }
  };

  // Handle New Invoice button click
  const handleNewInvoice = () => {
    if (window.confirm('Are you sure you want to start a new invoice? This will clear your current progress.')) {
      // Clear localStorage
      localStorage.removeItem('invoiceFormData');
      localStorage.removeItem('invoiceData');
      localStorage.removeItem('partnerId');
      
      // Reset form with new invoice number
      setFormData({
        Vendor_name: '',
        STATE: '',
        COUNTRY: 'India',
        GSTN: '',
        INVOICE_NO: generateInvoiceNumber(), // Generate new invoice number
        INVOICE_DATE: new Date().toISOString().split('T')[0],
        TERMS: 'Net 30 days',
        PLACE_OF_SUPPLY: businessSettings ? 
          getPlaceOfSupply(businessSettings.gstn) : 'Karnataka(29)',
        BASE_AMOUNT: '',
        CGST_AMT: '',
        SGST_AMT: '',
        IGST_AMT: '',
        TOTAL_WITH_TAX: '',
        AMOUNT_IN_WORDS: '',
        TAX_NOTE: '',
        Bank_name: '',
        partner_bank_account: '',
        UTR: '',
        ADJUSTMENT: '0.00',
        TOTAL_AMOUNT: '',
        is_igst: false,
        SERVICE_DESCRIPTION: 'Financial intermediation services',
        masked_account_number: 'XXXXXXXX0000',
        masked_ifsc: 'ABCDXXXXx',
        service_month: '',
        service_year: new Date().getFullYear() + 1,
        REFERENCE_NO: '',
        HSN_SAC: businessSettings?.hsnSacCode || '998719',
        TAX_RATE: businessSettings?.taxRate || '18'
      });
      
      setInvoiceData(null);
      setPartnerId('');
      setPartnerSearchQuery('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          <span className="text-gradient">Professional Invoice Generator</span>
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:text-lg md:mt-4">
          Create tax-compliant GST invoices in seconds, with automatic calculations and professional formatting.
        </p>
      </div>

      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="brand-sidebar">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice Tools</h2>
            
            {/* Updated Partner Search Section */}
            <div className="mb-6 border-b border-gray-200 pb-4">
              <h3 className="text-md font-medium text-gray-900 mb-3">Partner Lookup</h3>
              
              <div className="form-group partner-search-container">
                <label htmlFor="partnerSearch" className="brand-label">
                  Search Partner
                </label>
                <input
                  type="text"
                  id="partnerSearch"
                  className="brand-input"
                  value={partnerSearchQuery}
                  onChange={handlePartnerSearch}
                  placeholder="Search by name, ID, or GST number"
                  autoComplete="off"
                />
                
                {showPartnerResults && filteredPartners.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto">
                    <ul className="py-1">
                      {filteredPartners.map((partner) => (
                        <li 
                          key={partner.account_id}
                          onClick={() => handleSelectPartner(partner)}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          <div className="font-medium">{partner.partner_name || 'Unnamed Partner'}</div>
                          <div className="text-xs text-gray-500">
                            ID: {partner.account_id || 'N/A'} | GST: {partner.gst_no || 'Not provided'}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {showPartnerResults && partnerSearchQuery && filteredPartners.length === 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
                    <p className="p-3 text-sm text-gray-500">No partners found</p>
                  </div>
                )}
                
                <p className="mt-2 text-xs text-gray-500">
                  {isLoading ? 'Loading partner data...' : 
                  partnersList.length ? `${partnersList.length} partners available` : 
                  'No partner data available'}
                </p>
              </div>
              
              {partnerId && (
                <div className="mt-3 p-2 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    Selected Partner: <span className="font-medium">{formData.Vendor_name}</span>
                  </p>
                  <p className="text-xs text-blue-700">
                    ID: {partnerId}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleNewInvoice}
                className="w-full brand-button-secondary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Invoice
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="w-full brand-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                Print Invoice
              </button>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="w-full brand-button brand-button-success"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download PDF
              </button>
              <button
                type="button"
                onClick={handleEmailInvoice}
                className="w-full brand-button-secondary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Email Invoice
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1 md:flex md:justify-between">
                    <p className="text-sm text-blue-700">
                      GST tax is automatically calculated based on your inputs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="brand-card overflow-hidden">
              <div className="px-4 py-5 bg-white sm:p-6">
                <div className="grid grid-cols-6 gap-6">
                  {/* Vendor Information Section */}
                  <div className="col-span-6">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Vendor Information</h3>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="Vendor_name" className="brand-label">
                      Vendor Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="Vendor_name"
                        id="Vendor_name"
                        value={formData.Vendor_name}
                        onChange={handleChange}
                        className={`brand-input ${errors.Vendor_name ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.Vendor_name && (
                        <p className="mt-1 text-sm text-red-500">{errors.Vendor_name}</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="GSTN" className="brand-label">
                      GSTN
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="GSTN"
                        id="GSTN"
                        value={formData.GSTN}
                        onChange={handleChange}
                        className={`brand-input ${errors.GSTN ? 'border-red-500' : ''}`}
                        required
                      />
                      {errors.GSTN && (
                        <p className="mt-1 text-sm text-red-500">{errors.GSTN}</p>
                      )}
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="STATE" className="brand-label">
                      State
                    </label>
                    <div className="mt-1">
                      <select
                        id="STATE"
                        name="STATE"
                        value={formData.STATE}
                        onChange={handleChange}
                        className="brand-input"
                        required
                      >
                        <option value="">Select State</option>
                        {indianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="COUNTRY" className="brand-label">
                      Country
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="COUNTRY"
                        id="COUNTRY"
                        value={formData.COUNTRY}
                        readOnly
                        className="brand-input bg-gray-100"
                      />
                    </div>
                  </div>

                  {/* Invoice Details Section */}
                  <div className="col-span-6">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 mt-6">Invoice Details</h3>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="INVOICE_NO" className="brand-label">
                      Invoice Number
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        name="INVOICE_NO"
                        id="INVOICE_NO"
                        value={formData.INVOICE_NO}
                        onChange={handleChange}
                        className="brand-input"
                      />
                      <div className="absolute inset-y-0 right-0 px-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              INVOICE_NO: generateInvoiceNumber()
                            }));
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Auto-generated based on your business settings
                    </p>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="REFERENCE_NO" className="brand-label">
                      Reference Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="REFERENCE_NO"
                        id="REFERENCE_NO"
                        value={formData.REFERENCE_NO}
                        onChange={handleChange}
                        className="brand-input"
                        placeholder="Auto-generated reference number"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Format: Partner ID - Month - Year (e.g., a629c123-03-25)
                      </p>
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="INVOICE_DATE" className="brand-label">
                      Invoice Date
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        name="INVOICE_DATE"
                        id="INVOICE_DATE"
                        value={formData.INVOICE_DATE}
                        onChange={handleChange}
                        className="brand-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="TERMS" className="brand-label">
                      Payment Terms
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="TERMS"
                        id="TERMS"
                        value={formData.TERMS}
                        onChange={handleChange}
                        className="brand-input"
                      />
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="PLACE_OF_SUPPLY" className="brand-label">
                      Place of Supply
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="PLACE_OF_SUPPLY"
                        id="PLACE_OF_SUPPLY"
                        value={formData.PLACE_OF_SUPPLY}
                        readOnly
                        className="brand-input bg-gray-100"
                      />
                    </div>
                  </div>
                
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="Bank_name" className="brand-label">
                      Bank IFSC
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="Bank_name"
                        id="Bank_name"
                        value={formData.Bank_name}
                        onChange={handleChange}
                        className="brand-input"
                      />
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="partner_bank_account" className="brand-label">
                      Bank Account Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="partner_bank_account"
                        id="partner_bank_account"
                        value={formData.partner_bank_account}
                        onChange={handleChange}
                        className="brand-input"
                      />
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="UTR" className="brand-label">
                      Payment Reference <span className="text-xs text-gray-500">(optional)</span>
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="UTR"
                        id="UTR"
                        value={formData.UTR}
                        onChange={handleChange}
                        className="brand-input"
                      />
                    </div>
                  </div>

                  {/* Service Information Section */}
                  <div className="col-span-6">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 mt-6">Service Information</h3>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="HSN_SAC" className="brand-label">
                      HSN/SAC Code
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="HSN_SAC"
                        id="HSN_SAC"
                        value={formData.HSN_SAC}
                        onChange={handleChange}
                        className="brand-input"
                        placeholder="e.g., 998719"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        HSN/SAC code for the service being provided
                      </p>
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="TAX_RATE" className="brand-label">
                      Tax Rate (%)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="TAX_RATE"
                        id="TAX_RATE"
                        value={formData.TAX_RATE}
                        onChange={handleChange}
                        className="brand-input"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Tax percentage applicable for this service
                      </p>
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="service_month" className="brand-label">
                      Service Month <span className="text-xs text-gray-500">(optional)</span>
                    </label>
                    <div className="mt-1">
                      <select
                        id="service_month"
                        name="service_month"
                        value={formData.service_month}
                        onChange={handleChange}
                        className="brand-input"
                      >
                        <option value="">Select Month</option>
                        <option value="January">January</option>
                        <option value="February">February</option>
                        <option value="March">March</option>
                        <option value="April">April</option>
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                        <option value="August">August</option>
                        <option value="September">September</option>
                        <option value="October">October</option>
                        <option value="November">November</option>
                        <option value="December">December</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="service_year" className="brand-label">
                      Service Year <span className="text-xs text-gray-500">(optional)</span>
                    </label>
                    <div className="mt-1">
                      <select
                        id="service_year"
                        name="service_year"
                        value={formData.service_year}
                        onChange={handleChange}
                        className="brand-input"
                      >
                        <option value="">Select Year</option>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-6">
                    <label htmlFor="SERVICE_DESCRIPTION" className="brand-label">
                      Service Description
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="SERVICE_DESCRIPTION"
                        id="SERVICE_DESCRIPTION"
                        value={formData.SERVICE_DESCRIPTION}
                        onChange={handleChange}
                        className="brand-input"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">Includes month/year if selected above</p>
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="BASE_AMOUNT" className="brand-label">
                      Base Amount
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="BASE_AMOUNT"
                        id="BASE_AMOUNT"
                        value={formData.BASE_AMOUNT}
                        onChange={handleChange}
                        className="brand-input"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <div className="flex items-center h-full mt-6">
                      <div className="flex items-center">
                        <input
                          id="is_igst"
                          name="is_igst"
                          type="checkbox"
                          checked={formData.is_igst}
                          onChange={handleChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_igst" className="ml-2 block text-sm text-gray-700">
                          Apply IGST (Interstate GST) instead of CGST+SGST
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Tax Information Section */}
                  <div className="col-span-6">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 mt-6">Tax Information</h3>
                  </div>

                  {/* Always show all tax fields, but only IGST or CGST+SGST will have values based on checkbox */}
                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor="IGST_AMT" className="brand-label">
                      IGST Amount ({formData.TAX_RATE}%)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="IGST_AMT"
                        id="IGST_AMT"
                        value={formData.IGST_AMT}
                        readOnly
                        className="brand-input bg-gray-100"
                      />
                    </div>
                  </div>
                
                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor="CGST_AMT" className="brand-label">
                      CGST Amount ({(parseFloat(formData.TAX_RATE || 18) / 2).toFixed(1)}%)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="CGST_AMT"
                        id="CGST_AMT"
                        value={formData.CGST_AMT}
                        readOnly
                        className="brand-input bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label htmlFor="SGST_AMT" className="brand-label">
                      SGST Amount ({(parseFloat(formData.TAX_RATE || 18) / 2).toFixed(1)}%)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="SGST_AMT"
                        id="SGST_AMT"
                        value={formData.SGST_AMT}
                        readOnly
                        className="brand-input bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="ADJUSTMENT" className="brand-label">
                      Adjustment
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="ADJUSTMENT"
                        id="ADJUSTMENT"
                        value={formData.ADJUSTMENT}
                        onChange={handleChange}
                        className="brand-input"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="TOTAL_WITH_TAX" className="brand-label">
                      Total Amount
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="TOTAL_WITH_TAX"
                        id="TOTAL_WITH_TAX"
                        value={formData.TOTAL_WITH_TAX}
                        readOnly
                        className="brand-input bg-gray-100 font-bold"
                      />
                    </div>
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="AMOUNT_IN_WORDS" className="brand-label">
                      Amount in Words
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="AMOUNT_IN_WORDS"
                        id="AMOUNT_IN_WORDS"
                        value={formData.AMOUNT_IN_WORDS}
                        onChange={handleChange}
                        className="brand-input bg-gray-100"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="TAX_NOTE" className="brand-label">
                      Tax Note
                    </label>
                    <div className="mt-1">
                      <textarea
                        name="TAX_NOTE"
                        id="TAX_NOTE"
                        value={formData.TAX_NOTE}
                        onChange={handleChange}
                        rows="2"
                        className="brand-input"
                        placeholder={formData.is_igst 
                          ? "IGST is applicable as the place of supply is outside the state of the supplier."
                          : "CGST and SGST are applicable as the place of supply is within the state of the supplier."}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 sm:px-6 flex justify-end">
                <button
                  type="submit"
                  className="brand-button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                  </svg>
                  Generate Invoice
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Invoice Preview Section */}
      <div className="mt-8">
        <div className="brand-card">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Invoice Preview</h2>
            <p className="mt-1 text-sm text-gray-500">Real-time preview of your invoice document</p>
                </div>
          <div className="preview-container">
            <div className="relative h-[800px]">
              <div id="invoice-preview" className="w-full h-full">
                <iframe
                  ref={previewIframeRef}
                  srcDoc={invoiceData 
                    ? generateInvoiceHTML(invoiceTemplate, invoiceData)
                    : generateInvoiceHTML(invoiceTemplate, {
                        Vendor_name: 'Your Company Name',
                        GSTN: 'GSTIN12345678',
                        STATE: 'State',
                        COUNTRY: 'India',
                        INVOICE_NO: 'INV-XXXX',
                        INVOICE_DATE: new Date().toLocaleDateString(),
                        TERMS: 'Net 30 days',
                        PLACE_OF_SUPPLY: 'Place of Supply',
                        BASE_AMOUNT: '0.00',
                        CGST_AMT: '0.00',
                        SGST_AMT: '0.00',
                        IGST_AMT: '0.00',
                        TOTAL_WITH_TAX: '0.00',
                        TOTAL_TAX: '0.00',
                        AMOUNT_IN_WORDS: 'Zero rupees only',
                        Bank_name: 'ABCD0123456',
                        masked_ifsc: 'ABCDXXXXx',
                        partner_bank_account: 'XXXXXXXXXXXX',
                        masked_account_number: 'XXXXXXXX0000',
                        UTR: '',
                        ADJUSTMENT: '0.00',
                        TOTAL_AMOUNT: '0.00',
                        SERVICE_DESCRIPTION: 'Financial intermediation services',
                        TAX_NOTE: 'Fill out the form to create your invoice'
                      })
                  }
                  className="w-full h-full border-0"
                  title="Invoice Preview"
                />
              </div>
            </div>
          </div>
          </div>
      </div>
    </div>
  );
};

export default InvoiceForm; 