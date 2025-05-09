/**
 * Convert number to words
 * @param {number} num - The number to convert
 * @returns {string} The number in words
 */
export function numberToWords(num) {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

  if (num === 0) return 'Zero';

  const numStr = num.toString().padStart(2, '0');
  let rupees = parseInt(numStr.split('.')[0]);
  const paise = numStr.includes('.') ? Math.round(parseFloat('0.' + numStr.split('.')[1]) * 100) : 0;

  let words = '';

  // Convert rupees to words
  if (rupees > 0) {
    let i = 0;
    const parts = [];
    
    while (rupees > 0) {
      const chunk = rupees % 1000;
      if (chunk !== 0) {
        const chunkWords = convertChunkToWords(chunk);
        parts.unshift(`${chunkWords} ${scales[i]}`);
      }
      rupees = Math.floor(rupees / 1000);
      i++;
    }
    
    words = parts.join(' ');
    words += ' Rupees';
  }

  // Convert paise to words
  if (paise > 0) {
    const paiseWords = convertChunkToWords(paise);
    words += ` and ${paiseWords} Paise`;
  }

  return words.trim();

  function convertChunkToWords(chunk) {
    let chunkWords = '';
    
    // Process hundreds
    if (chunk >= 100) {
      chunkWords += `${units[Math.floor(chunk / 100)]} Hundred`;
      chunk %= 100;
      if (chunk > 0) chunkWords += ' and ';
    }
    
    // Process tens and units
    if (chunk >= 10 && chunk < 20) {
      chunkWords += teens[chunk - 10];
    } else {
      if (chunk >= 20) {
        chunkWords += tens[Math.floor(chunk / 10)];
        chunk %= 10;
        if (chunk > 0) chunkWords += ' ';
      }
      if (chunk > 0) {
        chunkWords += units[chunk];
      }
    }
    
    return chunkWords;
  }
}

/**
 * Mask sensitive information like bank account numbers
 * @param {string} value - The value to mask
 * @param {number} visibleDigits - Number of digits to keep visible at the end
 * @param {boolean} isIFSC - Whether the value is an IFSC code (special masking rules)
 * @returns {string} Masked value
 */
function maskValue(value, visibleDigits = 4, isIFSC = false) {
  if (!value) return '';
  
  if (isIFSC) {
    // For IFSC, keep first 4 characters (bank code) visible and mask the rest
    // Format: AAAA0000000 - first 4 are bank code, rest is branch code
    if (value.length <= 4) return value;
    
    const bankCode = value.substring(0, 4);
    const branchCode = value.substring(4);
    
    // Show bank code and last character of branch code
    return bankCode + 'XXXX' + branchCode.slice(-1);
  } else {
    // Regular masking for account numbers, etc.
    // Convert to string and remove any non-alphanumeric characters
    const cleanValue = value.toString().replace(/\D/g, '');
    
    if (cleanValue.length <= visibleDigits) {
      return cleanValue; // Don't mask if too short
    }
    
    const hiddenPortion = cleanValue.slice(0, -visibleDigits);
    const visiblePortion = cleanValue.slice(-visibleDigits);
    
    // Replace hidden portion with X's
    return 'X'.repeat(hiddenPortion.length) + visiblePortion;
  }
}

/**
 * Prepare form data for invoice generation
 * @param {Object} formData - The form data
 * @returns {Object} The prepared data for invoice
 */
export function prepareInvoiceData(formData) {
  const data = { ...formData };
  
  // Mask sensitive data
  data.masked_account_number = maskValue(data.partner_bank_account);
  data.masked_ifsc = maskValue(data.Bank_name, 4, true);
  
  // Get tax rate from data or default to 18%
  const taxRate = parseFloat(data.TAX_RATE || 18) / 100;
  const halfTaxRate = taxRate / 2;
  
  // Clean BASE_AMOUNT if it contains currency symbol
  let baseAmount = data.BASE_AMOUNT;
  if (typeof baseAmount === 'string' && baseAmount.includes('₹')) {
    baseAmount = baseAmount.replace(/[^\d.-]/g, '').trim();
  }
  
  // Ensure baseAmount is a valid number
  baseAmount = parseFloat(baseAmount);
  if (isNaN(baseAmount)) {
    baseAmount = 0;
  }
  
  // Calculate tax and total amounts
  if (data.is_igst) {
    // IGST calculation
    data.IGST_AMT = '₹ ' + (baseAmount * taxRate).toFixed(2);
    data.CGST_AMT = '₹ 0.00';
    data.SGST_AMT = '₹ 0.00';
    data.cgst_sgst_style = 'style="display:none;"';
    data.igst_style = '';
    data.IGST_RATE = (taxRate * 100).toFixed(1) + '%'; // For display in invoice
  } else {
    // CGST and SGST calculation
    data.CGST_AMT = '₹ ' + (baseAmount * halfTaxRate).toFixed(2);
    data.SGST_AMT = '₹ ' + (baseAmount * halfTaxRate).toFixed(2);
    data.IGST_AMT = '₹ 0.00';
    data.cgst_sgst_style = '';
    data.igst_style = 'style="display:none;"';
    data.CGST_RATE = (halfTaxRate * 100).toFixed(1) + '%'; // For display in invoice
    data.SGST_RATE = (halfTaxRate * 100).toFixed(1) + '%'; // For display in invoice
  }
  
  // Calculate total tax amount
  const totalTax = parseFloat(data.IGST_AMT.replace('₹ ', '')) || 
                  (parseFloat(data.CGST_AMT.replace('₹ ', '')) || 0) + 
                  (parseFloat(data.SGST_AMT.replace('₹ ', '')) || 0);
  data.TOTAL_TAX = '₹ ' + totalTax.toFixed(2);
  
  // Calculate total amount
  const adjustment = parseFloat(data.ADJUSTMENT || 0);
  data.TOTAL_WITH_TAX = '₹ ' + (baseAmount + totalTax + adjustment).toFixed(2);
  
  // Format base amount with Rupee symbol
  data.BASE_AMOUNT = '₹ ' + baseAmount.toFixed(2);
  
  // Format adjustment with Rupee symbol if it exists
  if (data.ADJUSTMENT) {
    data.ADJUSTMENT = '₹ ' + parseFloat(data.ADJUSTMENT).toFixed(2);
  }
  
  // Set default tax note if empty
  if (!data.TAX_NOTE) {
    data.TAX_NOTE = data.is_igst
      ? 'IGST is applicable as the place of supply is outside the state of the supplier.'
      : 'CGST and SGST are applicable as the place of supply is within the state of the supplier.';
  }
  
  // Generate amount in words if not provided
  if (!data.AMOUNT_IN_WORDS) {
    data.AMOUNT_IN_WORDS = numberToWords(parseFloat(data.TOTAL_WITH_TAX.replace('₹ ', '')));
  }
  
  // Add client details from localStorage
  try {
    const savedSettings = localStorage.getItem('businessSettings');
    if (savedSettings) {
      const businessSettings = JSON.parse(savedSettings);
      
      // Add client details to invoice data
      data.CLIENT_NAME = businessSettings.companyName || 'Salter Technologies Private Limited';
      data.CLIENT_GSTN = businessSettings.gstn || '29ABICS0071M1ZY';
      data.CLIENT_ADDRESS_LINE1 = businessSettings.addressLine1 || 'T-9 Shirping Chirping Woods, Villament103, Tower-9, Haralur Road,';
      data.CLIENT_ADDRESS_LINE2 = businessSettings.addressLine2 || 'Shubh Enclave, Ambalipura, Bengaluru,';
      data.CLIENT_ADDRESS_LINE3 = businessSettings.addressLine3 || 'Bengaluru Urban, Karnataka, 560102';
    } else {
      // Set default values if no saved settings
      data.CLIENT_NAME = 'Salter Technologies Private Limited';
      data.CLIENT_GSTN = '29ABICS0071M1ZY';
      data.CLIENT_ADDRESS_LINE1 = 'T-9 Shirping Chirping Woods, Villament103, Tower-9, Haralur Road,';
      data.CLIENT_ADDRESS_LINE2 = 'Shubh Enclave, Ambalipura, Bengaluru,';
      data.CLIENT_ADDRESS_LINE3 = 'Bengaluru Urban, Karnataka, 560102';
    }
  } catch (error) {
    console.error('Error loading business settings:', error);
    // Set default values if there's an error
    data.CLIENT_NAME = 'Salter Technologies Private Limited';
    data.CLIENT_GSTN = '29ABICS0071M1ZY';
    data.CLIENT_ADDRESS_LINE1 = 'T-9 Shirping Chirping Woods, Villament103, Tower-9, Haralur Road,';
    data.CLIENT_ADDRESS_LINE2 = 'Shubh Enclave, Ambalipura, Bengaluru,';
    data.CLIENT_ADDRESS_LINE3 = 'Bengaluru Urban, Karnataka, 560102';
  }
  
  // Check if we have payment information for this invoice
  let paymentInfo = { status: 'unpaid' };
  try {
    const savedInvoices = localStorage.getItem('generatedInvoices');
    if (savedInvoices && data.INVOICE_NO) {
      const invoices = JSON.parse(savedInvoices);
      const existingInvoice = invoices.find(inv => inv.invoiceNumber === data.INVOICE_NO);
      
      if (existingInvoice) {
        paymentInfo = {
          status: existingInvoice.status || 'unpaid',
          paymentDetails: existingInvoice.paymentDetails || {}
        };
      }
    }
  } catch (error) {
    console.error('Error loading payment information:', error);
  }
  
  // Add payment information to the invoice data
  const paymentStatusMap = {
    'paid': 'PAID',
    'partial': 'PARTIALLY PAID',
    'unpaid': 'UNPAID'
  };
  
  const paymentStatusClassMap = {
    'paid': 'payment-status-paid',
    'partial': 'payment-status-partial',
    'unpaid': 'payment-status-unpaid'
  };

  data.PAYMENT_STATUS_TEXT = paymentStatusMap[paymentInfo.status] || 'UNPAID';
  data.PAYMENT_STATUS_CLASS = paymentStatusClassMap[paymentInfo.status] || 'payment-status-unpaid';
  
  // Generate payment details text
  let paymentDetailsText = '';
  if (paymentInfo.status === 'paid' || paymentInfo.status === 'partial') {
    if (paymentInfo.paymentDetails?.paymentDate) {
      const date = new Date(paymentInfo.paymentDetails.paymentDate);
      const formattedDate = date.toLocaleDateString('en-IN', {
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      });
      paymentDetailsText += `Payment Date: ${formattedDate}<br>`;
    }
    
    if (paymentInfo.paymentDetails?.paymentReference) {
      paymentDetailsText += `Reference Number: ${paymentInfo.paymentDetails.paymentReference}<br>`;
    }
    
    if (paymentInfo.paymentDetails?.paymentType) {
      const paymentTypeMap = {
        'bank_transfer': 'Bank Transfer',
        'cash': 'Cash',
        'cheque': 'Cheque',
        'upi': 'UPI',
        'online': 'Online Payment',
        'other': 'Other'
      };
      paymentDetailsText += `Payment Method: ${paymentTypeMap[paymentInfo.paymentDetails.paymentType] || paymentInfo.paymentDetails.paymentType}<br>`;
    }
    
    if (paymentInfo.paymentDetails?.notes) {
      paymentDetailsText += `Notes: ${paymentInfo.paymentDetails.notes}<br>`;
    }
  } else {
    paymentDetailsText = 'No payment recorded yet.';
  }
  
  data.PAYMENT_DETAILS_TEXT = paymentDetailsText;
  
  // Set payment section visibility based on payment status
  data.PAYMENT_SECTION_STYLE = '';
  
  return data;
}

/**
 * Generate HTML invoice from template and data
 * @param {string} template - The HTML template
 * @param {Object} data - The data to fill in the template
 * @returns {string} The generated HTML invoice
 */
export function generateInvoiceHTML(template, data) {
  let html = template;
  
  // Replace all placeholders with actual data
  Object.keys(data).forEach(key => {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(placeholder, data[key]);
  });
  
  return html;
}

/**
 * Generate a reference number from partner ID and date
 * Format: partner ID - month - year
 * Example: a629c123-03-2025
 * @param {string} partnerId - The partner's ID
 * @param {string} serviceMonth - The service month
 * @param {string} serviceYear - The service year
 * @returns {string} The generated reference number
 */
export const generateReferenceNumber = (partnerId, serviceMonth, serviceYear) => {
  if (!partnerId || !serviceMonth || !serviceYear) return '';
  
  // Get month number (1-12)
  const monthMap = {
    'January': '01', 'February': '02', 'March': '03', 'April': '04',
    'May': '05', 'June': '06', 'July': '07', 'August': '08',
    'September': '09', 'October': '10', 'November': '11', 'December': '12'
  };
  const month = monthMap[serviceMonth] || '01';
  
  // Get year (last 2 digits)
  const year = serviceYear.toString().slice(-2);
  
  return `${partnerId}-${month}-${year}`;
};

/**
 * Generate a new invoice number based on business settings
 * Manages the sequence tracking in localStorage and ensures uniqueness
 * @returns {string} The new invoice number
 */
export function generateInvoiceNumber(customSettings = null) {
  // Get business settings
  const defaultFormat = 'INV-{YYYY}{MM}{SEQ}';
  const defaultSettings = {
    invoiceNumberFormat: defaultFormat,
    invoiceNumberPrefix: 'INV-',
    invoiceNumberSuffix: '',
    invoiceNumberSequence: '1',
    useFinancialYear: false,
    resetSequenceMonthly: true,
    resetSequenceYearly: false
  };
  
  let businessSettings = defaultSettings;
  
  // Load settings from localStorage if customSettings not provided
  if (!customSettings) {
    try {
      const savedSettings = localStorage.getItem('businessSettings');
      if (savedSettings) {
        businessSettings = {
          ...defaultSettings,
          ...JSON.parse(savedSettings)
        };
      }
    } catch (error) {
      console.error('Error loading business settings:', error);
    }
  } else {
    // Use provided custom settings
    businessSettings = {
      ...defaultSettings,
      ...customSettings
    };
  }
  
  // Get current sequence from localStorage
  let sequences = {};
  try {
    const savedSequences = localStorage.getItem('invoiceSequences');
    if (savedSequences) {
      sequences = JSON.parse(savedSequences);
    }
  } catch (error) {
    console.error('Error loading invoice sequences:', error);
  }
  
  // Get list of used invoice numbers
  let usedInvoiceNumbers = [];
  try {
    const savedInvoices = localStorage.getItem('generatedInvoices');
    if (savedInvoices) {
      const invoices = JSON.parse(savedInvoices);
      usedInvoiceNumbers = invoices.map(invoice => invoice.invoiceNumber);
    }
  } catch (error) {
    console.error('Error loading used invoice numbers:', error);
  }
  
  // Get current date
  const today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1; // January is 0
  
  // Adjust year for financial year if enabled
  let financialYear = year;
  if (businessSettings.useFinancialYear) {
    if (month < 4) { // Jan, Feb, Mar are part of previous financial year
      financialYear = year - 1;
    }
    // Create financial year string (YYYY-YY format)
    financialYear = `${financialYear}-${(financialYear + 1).toString().slice(-2)}`;
  }
  
  // Format date components
  const yyyy = year.toString();
  const yy = yyyy.substring(2);
  const fy = businessSettings.useFinancialYear ? financialYear : yyyy;
  const mm = month.toString().padStart(2, '0');
  const dd = today.getDate().toString().padStart(2, '0');
  
  // Determine sequence key based on reset settings
  let sequenceKey = 'global';
  if (businessSettings.resetSequenceMonthly) {
    sequenceKey = `${yyyy}-${mm}`;
  } else if (businessSettings.resetSequenceYearly) {
    sequenceKey = businessSettings.useFinancialYear ? financialYear : yyyy;
  }
  
  // Get current sequence number for this key, or use starting sequence
  let currentSequence = parseInt(sequences[sequenceKey] || businessSettings.invoiceNumberSequence || 1);
  
  // Generate unique invoice number - incrementing if necessary to avoid duplicates
  let invoiceNumber;
  let isUnique = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 100; // Prevent infinite loops
  
  while (!isUnique && attempts < MAX_ATTEMPTS) {
    attempts++;
    
    // Format the sequence number with padding (default 3 digits)
    const paddingDigits = businessSettings.sequencePadding || 3;
    const paddedSequence = currentSequence.toString().padStart(paddingDigits, '0');
    
    // Create the invoice number from format
    let newInvoiceNumber = businessSettings.invoiceNumberFormat || defaultFormat;
    
    // Replace placeholders - support for more placeholders
    newInvoiceNumber = newInvoiceNumber
      .replace(/{YYYY}/g, yyyy)
      .replace(/{YY}/g, yy)
      .replace(/{FY}/g, fy) // Financial year
      .replace(/{MM}/g, mm)
      .replace(/{DD}/g, dd)
      .replace(/{SEQ}/g, paddedSequence)
      .replace(/{PREFIX}/g, businessSettings.invoiceNumberPrefix || '')
      .replace(/{SUFFIX}/g, businessSettings.invoiceNumberSuffix || '');
    
    // Apply prefix and suffix if they're not already in the format and not using placeholders
    if (businessSettings.invoiceNumberPrefix && 
        !newInvoiceNumber.includes(businessSettings.invoiceNumberPrefix) &&
        !businessSettings.invoiceNumberFormat.includes('{PREFIX}')) {
      newInvoiceNumber = businessSettings.invoiceNumberPrefix + newInvoiceNumber;
    }
    
    if (businessSettings.invoiceNumberSuffix && 
        !newInvoiceNumber.includes(businessSettings.invoiceNumberSuffix) &&
        !businessSettings.invoiceNumberFormat.includes('{SUFFIX}')) {
      newInvoiceNumber = newInvoiceNumber + businessSettings.invoiceNumberSuffix;
    }
    
    // Check if this invoice number is unique
    if (!usedInvoiceNumbers.includes(newInvoiceNumber)) {
      invoiceNumber = newInvoiceNumber;
      isUnique = true;
    } else {
      // If not unique, increment sequence and try again
      currentSequence++;
      console.warn(`Invoice number ${newInvoiceNumber} already exists, trying next sequence.`);
    }
  }
  
    if (!isUnique) {
    console.error(`Failed to generate a unique invoice number after ${MAX_ATTEMPTS} attempts.`);
    // Fallback to timestamp-based invoice number
    invoiceNumber = `INV-${Date.now()}`;
  }
  
  // Save the updated sequence (using the potentially incremented value if we had to avoid duplicates)
  sequences[sequenceKey] = currentSequence + 1;
  localStorage.setItem('invoiceSequences', JSON.stringify(sequences));
  
  return invoiceNumber;
}

/**
 * Save generated invoice data to localStorage for tracking and management
 * @param {Object} invoiceData - The complete invoice data
 * @returns {boolean} Success status
 */
export function saveGeneratedInvoice(invoiceData) {
  if (!invoiceData) return false;
  
  try {
    // Get existing invoices
    let invoices = [];
    const savedInvoices = localStorage.getItem('generatedInvoices');
    if (savedInvoices) {
      invoices = JSON.parse(savedInvoices);
    }
    
    // Parse the total amount correctly from the total with tax
    let totalAmount = '0';
    if (invoiceData.TOTAL_WITH_TAX) {
      // Remove currency symbol and whitespace
      totalAmount = invoiceData.TOTAL_WITH_TAX.replace(/[^\d.-]/g, '');
      // If not a valid number, default to 0
      if (isNaN(parseFloat(totalAmount))) {
        totalAmount = '0';
      }
    }
    
    // Parse the base amount correctly from BASE_AMOUNT
    let baseAmount = '0';
    if (invoiceData.BASE_AMOUNT) {
      // Remove currency symbol and whitespace
      baseAmount = invoiceData.BASE_AMOUNT.replace(/[^\d.-]/g, '');
      // If not a valid number, default to 0
      if (isNaN(parseFloat(baseAmount))) {
        baseAmount = '0';
      }
    } else if (invoiceData.original_BASE_AMOUNT) {
      baseAmount = invoiceData.original_BASE_AMOUNT;
    }
    
    // Create a more compact invoice record with essential information
    const invoiceRecord = {
      id: Date.now().toString(), // Unique ID for this invoice
      invoiceNumber: invoiceData.INVOICE_NO,
      date: invoiceData.INVOICE_DATE,
      vendorName: invoiceData.Vendor_name,
      vendorGst: invoiceData.GSTN,
      amount: baseAmount, // Use base amount instead of total amount
      totalAmount: totalAmount, // Store total amount separately
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      referenceNumber: invoiceData.REFERENCE_NO || '',
      // Payment status fields
      status: 'unpaid', // 'unpaid', 'paid', 'partial'
      paymentDetails: {
        paymentDate: '',
        paymentReference: '',
        paymentType: '', // 'bank_transfer', 'cash', 'cheque', 'online'
        notes: ''
      },
    };
    
    // Store a copy of the invoice data with original BASE_AMOUNT preserved
    // This ensures when editing the invoice later, we have the correct base amount
    let invoiceDataForStorage = { ...invoiceData };
    
    // Check if BASE_AMOUNT has currency symbol and save the numeric value
    if (typeof invoiceDataForStorage.BASE_AMOUNT === 'string' && invoiceDataForStorage.BASE_AMOUNT.includes('₹')) {
      // Extract numeric value for later use in invoice editing
      const originalBaseAmount = invoiceDataForStorage.BASE_AMOUNT.replace(/[^\d.-]/g, '').trim();
      // Store both formatted and original value
      invoiceDataForStorage.original_BASE_AMOUNT = originalBaseAmount;
    }
    
    // Store the full data in a compressed format for later retrieval
    invoiceRecord.fullData = JSON.stringify(invoiceDataForStorage);
    
    // Add to or update the invoices array
    const existingIndex = invoices.findIndex(inv => inv.invoiceNumber === invoiceRecord.invoiceNumber);
    if (existingIndex >= 0) {
      // Update existing invoice but preserve payment status
      const existingInvoice = invoices[existingIndex];
      invoiceRecord.id = existingInvoice.id; // Preserve original ID
      if (existingInvoice.status) {
        invoiceRecord.status = existingInvoice.status;
        invoiceRecord.paymentDetails = existingInvoice.paymentDetails || invoiceRecord.paymentDetails;
      }
      invoiceRecord.updatedAt = new Date().toISOString();
      invoices[existingIndex] = invoiceRecord;
    } else {
      // Add new invoice
      invoices.push(invoiceRecord);
    }
    
    // Save back to localStorage
    localStorage.setItem('generatedInvoices', JSON.stringify(invoices));
    
    return true;
  } catch (error) {
    console.error('Error saving generated invoice:', error);
    return false;
  }
}

/**
 * Update payment status and details for an invoice
 * @param {string} invoiceId - The invoice ID
 * @param {Object} paymentInfo - Object containing payment details
 * @returns {boolean} Success status
 */
export function updateInvoicePaymentStatus(invoiceId, paymentInfo) {
  if (!invoiceId || !paymentInfo) return false;
  
  try {
    // Get existing invoices
    const savedInvoices = localStorage.getItem('generatedInvoices');
    if (!savedInvoices) return false;
    
    const invoices = JSON.parse(savedInvoices);
    const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
    
    if (invoiceIndex === -1) return false;
    
    // Update payment information
    invoices[invoiceIndex].status = paymentInfo.status;
    invoices[invoiceIndex].paymentDetails = {
      paymentDate: paymentInfo.paymentDate || '',
      paymentReference: paymentInfo.paymentReference || '',
      paymentType: paymentInfo.paymentType || '',
      notes: paymentInfo.notes || ''
    };
    invoices[invoiceIndex].updatedAt = new Date().toISOString();
    
    // Save back to localStorage
    localStorage.setItem('generatedInvoices', JSON.stringify(invoices));
    
    return true;
  } catch (error) {
    console.error('Error updating invoice payment status:', error);
    return false;
  }
} 