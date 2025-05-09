/**
 * CSV partner data utilities
 * This file contains functions for loading and parsing partner data from CSV files
 */

// Initialize the partner data cache
let partnerData = null;

/**
 * Generate a unique ID for a partner
 * @returns {string} A unique ID
 */
export function generateUniqueId() {
  return 'p_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

/**
 * Load and parse CSV data from a file
 * @returns {Promise<Array>} Array of partner objects
 */
export async function loadPartnerData() {
  try {
    console.log('Starting to load partner data...');
    
    // First check if we have uploaded partner data in localStorage
    const uploadedData = localStorage.getItem('partnerData');
    if (uploadedData) {
      console.log('Found partner data in localStorage');
      const parsedData = JSON.parse(uploadedData);
      partnerData = parsedData;
      return parsedData;
    }
    
    // If no uploaded data, fetch from server
    console.log('No uploaded data found in localStorage, fetching from server...');
    const response = await fetch('/partner_data.csv');
    if (!response.ok) {
      console.error('CSV file not found on server');
      throw new Error('Failed to fetch partner data');
    }
    
    const csvText = await response.text();
    
    // Parse CSV
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    const results = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // Skip empty lines
      
      const obj = {};
      const currentLine = lines[i].split(',');
      
      for (let j = 0; j < headers.length; j++) {
        // Clean header names to avoid issues
        const header = headers[j].trim();
        obj[header] = currentLine[j];
      }
      
      // Add a unique ID if not present
      if (!obj.account_id) {
        obj.account_id = generateUniqueId();
      }
      
      results.push(obj);
    }
    
    console.log(`Parsed ${results.length} partners from CSV`);
    partnerData = results;
    
    // Save to localStorage for future use
    localStorage.setItem('partnerData', JSON.stringify(results));
    
    return results;
  } catch (error) {
    console.error('Error loading partner data:', error);
    return [];
  }
}

/**
 * Save partner data to localStorage
 * @param {Array} data - Array of partner objects to save
 */
export function savePartnerData(data) {
  localStorage.setItem('partnerData', JSON.stringify(data));
  partnerData = data;
}

/**
 * Find a partner by their ID
 * @param {string} id - The partner ID to search for
 * @returns {Object|null} The partner object or null if not found
 */
export function findPartnerById(id) {
  // If we have cached partner data, search it
  if (partnerData) {
    return partnerData.find(partner => partner.account_id === id) || null;
  }
  
  // Otherwise check localStorage
  const savedData = localStorage.getItem('partnerData');
  if (savedData) {
    const partners = JSON.parse(savedData);
    return partners.find(partner => partner.account_id === id) || null;
  }
  
  return null;
}

/**
 * Map partner data to invoice form data
 * @param {Object} partner - Partner data object
 * @returns {Object} Invoice form data with partner details
 */
export function mapPartnerToInvoiceData(partner) {
  if (!partner) return null;
  
  // Ensure we have a GST number
  const gstNumber = partner.gst_no || '';
  
  // Get state from GST number
  let state = '';
  if (gstNumber && gstNumber.length >= 2) {
    const vendorStateCode = gstNumber.substring(0, 2);
    
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
    
    state = stateMap[vendorStateCode] || '';
  }
  
  // Get vendor state code
  const vendorStateCode = gstNumber.substring(0, 2);
  
  // Get business state code from settings
  let businessStateCode = '29'; // Default to Karnataka
  try {
    const savedSettings = localStorage.getItem('businessSettings');
    if (savedSettings) {
      const businessSettings = JSON.parse(savedSettings);
      if (businessSettings.gstn && businessSettings.gstn.length >= 2) {
        businessStateCode = businessSettings.gstn.substring(0, 2);
      }
    }
  } catch (error) {
    console.error('Error loading business settings:', error);
  }
  
  // If vendor state code is different from business state code, apply IGST
  const isIGST = vendorStateCode !== businessStateCode;
  
  return {
    Vendor_name: partner.partner_name || '',
    GSTN: gstNumber,
    STATE: state,
    Bank_name: partner.bank_accountifsccode || '',
    partner_bank_account: partner.bank_account_number || '',
    masked_account_number: partner.bank_account_number 
      ? 'XXXX' + partner.bank_account_number.slice(-4)
      : '',
    masked_ifsc: partner.bank_accountifsccode
      ? partner.bank_accountifsccode.slice(0, 4) + 'XXXXx'
      : '',
    is_igst: isIGST,
    partner_email: partner.partner_email || '',
    partner_phone: partner.partner_phone || ''
  };
}

/**
 * Get the list of all partner IDs
 * @returns {Array<string>} Array of account IDs
 */
export function getPartnerIds() {
  if (!partnerData) {
    console.warn('Partner data not loaded. Call loadPartnerData() first.');
    return [];
  }
  
  return partnerData.map(partner => partner.account_id);
}

/**
 * Extract state name from GST number
 * @param {string} gstNo - GST number
 * @returns {string} State name
 */
function getStateFromGST(gstNo) {
  if (!gstNo || gstNo.length < 2) {
    console.warn('Invalid GST number:', gstNo);
    return '';
  }
  
  // Get the first two digits
  const stateCode = gstNo.substring(0, 2);
  console.log('Extracted state code:', stateCode);
  
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
  
  return stateMap[stateCode] || '';
} 