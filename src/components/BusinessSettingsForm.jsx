import React, { useState, useEffect } from 'react';

const BusinessSettingsForm = () => {
  const [businessSettings, setBusinessSettings] = useState({
    companyName: 'ABC Technologies Private Limited',
    gstn: '29ABCDF0071XYZW',
    addressLine1: '123 Main Street, Building A, Floor 2,',
    addressLine2: 'Technology Park, Whitefield, Bengaluru,',
    addressLine3: 'Bengaluru Urban, Karnataka, 560102',
    hsnSacCode: '998719', // Default HSN/SAC code for financial intermediation services
    taxRate: '18', // Default tax rate percentage
    invoiceNumberFormat: 'INV-{YYYY}{MM}{SEQ}', // Default invoice number format
    invoiceNumberSequence: '1', // Starting sequence number
    invoiceNumberPrefix: 'INV-', // Optional prefix
    invoiceNumberSuffix: '', // Optional suffix
    useFinancialYear: false, // Whether to use financial year (Apr-Mar) instead of calendar year
    resetSequenceMonthly: true, // Whether to reset sequence monthly
    resetSequenceYearly: false, // Whether to reset sequence yearly
    sequencePadding: '3',
    financialYearFormat: '{YYYY}-{YY}',
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    businessWebsite: '',
    businessLogo: '',
    pan: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });

  const [isSaved, setIsSaved] = useState(false);
  const [formatPreview, setFormatPreview] = useState('');

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('businessSettings');
    if (savedSettings) {
      setBusinessSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Generate a preview of the invoice number format
  useEffect(() => {
    generateInvoiceNumberPreview();
  }, [
    businessSettings.invoiceNumberFormat,
    businessSettings.invoiceNumberPrefix,
    businessSettings.invoiceNumberSuffix,
    businessSettings.invoiceNumberSequence,
    businessSettings.useFinancialYear
  ]);

  const generateInvoiceNumberPreview = () => {
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1; // January is 0

    // Adjust for financial year if enabled
    let financialYear = year;
    if (businessSettings.useFinancialYear) {
      if (month < 4) { // Jan, Feb, Mar
        financialYear = year - 1; // Use previous year
      }
      // Create financial year string based on format
      financialYear = `${financialYear}-${(financialYear + 1).toString().slice(-2)}`;
    }

    // Format year and month
    const yyyy = year.toString();
    const yy = yyyy.substring(2);
    const fy = businessSettings.useFinancialYear ? financialYear : yyyy;
    const mm = month.toString().padStart(2, '0');
    const dd = today.getDate().toString().padStart(2, '0');
    
    // Create sequence number with padding
    const paddingDigits = parseInt(businessSettings.sequencePadding || '3');
    const sequence = (businessSettings.invoiceNumberSequence || '1').toString().padStart(paddingDigits, '0');
    
    // Create the preview with null checks
    const invoiceNumberFormat = businessSettings.invoiceNumberFormat || 'INV-{YYYY}{MM}{SEQ}';
    const invoiceNumberPrefix = businessSettings.invoiceNumberPrefix || '';
    const invoiceNumberSuffix = businessSettings.invoiceNumberSuffix || '';
    
    // Replace placeholders with values
    let preview = invoiceNumberFormat
      .replace(/{YYYY}/g, yyyy)
      .replace(/{YY}/g, yy)
      .replace(/{FY}/g, fy) // Financial year
      .replace(/{MM}/g, mm)
      .replace(/{DD}/g, dd)
      .replace(/{SEQ}/g, sequence)
      .replace(/{PREFIX}/g, invoiceNumberPrefix)
      .replace(/{SUFFIX}/g, invoiceNumberSuffix);
      
    // Apply prefix and suffix if they're not already in the format and not using placeholders
    if (invoiceNumberPrefix && 
        !invoiceNumberFormat.includes(invoiceNumberPrefix) && 
        !invoiceNumberFormat.includes('{PREFIX}')) {
      preview = invoiceNumberPrefix + preview;
    }
    
    if (invoiceNumberSuffix && 
        !invoiceNumberFormat.includes(invoiceNumberSuffix) && 
        !invoiceNumberFormat.includes('{SUFFIX}')) {
      preview = preview + invoiceNumberSuffix;
    }
    
    setFormatPreview(preview);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBusinessSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Reset saved message when changes are made
    setIsSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save to localStorage
    localStorage.setItem('businessSettings', JSON.stringify(businessSettings));
    setIsSaved(true);
    
    // Hide saved message after 3 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          <span className="text-gradient">Business Settings</span>
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:text-lg md:mt-4">
          Update your company information for invoices
        </p>
      </div>

      <div className="brand-card overflow-hidden">
        <div className="px-4 py-5 bg-white sm:p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              {/* Company Information Section */}
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Company Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="companyName" className="brand-label">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={businessSettings.companyName}
                      onChange={handleChange}
                      className="brand-input"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="gstn" className="brand-label">
                      GSTN
                    </label>
                    <input
                      type="text"
                      id="gstn"
                      name="gstn"
                      value={businessSettings.gstn}
                      onChange={handleChange}
                      className="brand-input"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="addressLine1" className="brand-label">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      id="addressLine1"
                      name="addressLine1"
                      value={businessSettings.addressLine1}
                      onChange={handleChange}
                      className="brand-input"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="addressLine2" className="brand-label">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      id="addressLine2"
                      name="addressLine2"
                      value={businessSettings.addressLine2}
                      onChange={handleChange}
                      className="brand-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="addressLine3" className="brand-label">
                      Address Line 3
                    </label>
                    <input
                      type="text"
                      id="addressLine3"
                      name="addressLine3"
                      value={businessSettings.addressLine3}
                      onChange={handleChange}
                      className="brand-input"
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Settings Section */}
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="hsnSacCode" className="brand-label">
                      Default HSN/SAC Code
                    </label>
                    <input
                      type="text"
                      id="hsnSacCode"
                      name="hsnSacCode"
                      value={businessSettings.hsnSacCode}
                      onChange={handleChange}
                      className="brand-input"
                      placeholder="e.g., 998719 for financial intermediation services"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      This is the default HSN/SAC code that will be used for all invoices
                    </p>
                  </div>

                  <div>
                    <label htmlFor="taxRate" className="brand-label">
                      Default Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      id="taxRate"
                      name="taxRate"
                      value={businessSettings.taxRate}
                      onChange={handleChange}
                      className="brand-input"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="e.g., 18 for 18% GST"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      This is the default tax percentage that will be applied to all invoices
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Number Format Section */}
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Number Format</h2>
                
                <div className="mb-4">
                  <label htmlFor="invoiceNumberFormat" className="brand-label">
                    Format Pattern
                  </label>
                  <input
                    type="text"
                    id="invoiceNumberFormat"
                    name="invoiceNumberFormat"
                    value={businessSettings.invoiceNumberFormat}
                    onChange={handleChange}
                    className="brand-input"
                    placeholder="e.g., INV-{YYYY}{MM}{SEQ}"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Available placeholders: {'{YYYY}'} (4-digit year), {'{YY}'} (2-digit year), {'{MM}'} (month), {'{SEQ}'} (sequence number)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="invoiceNumberPrefix" className="brand-label">
                      Prefix (optional)
                    </label>
                    <input
                      type="text"
                      id="invoiceNumberPrefix"
                      name="invoiceNumberPrefix"
                      value={businessSettings.invoiceNumberPrefix}
                      onChange={handleChange}
                      className="brand-input"
                      placeholder="e.g., INV-"
                    />
                  </div>

                  <div>
                    <label htmlFor="invoiceNumberSuffix" className="brand-label">
                      Suffix (optional)
                    </label>
                    <input
                      type="text"
                      id="invoiceNumberSuffix"
                      name="invoiceNumberSuffix"
                      value={businessSettings.invoiceNumberSuffix}
                      onChange={handleChange}
                      className="brand-input"
                      placeholder="e.g., -GST"
                    />
                  </div>

                  <div>
                    <label htmlFor="invoiceNumberSequence" className="brand-label">
                      Starting Sequence Number
                    </label>
                    <input
                      type="number"
                      id="invoiceNumberSequence"
                      name="invoiceNumberSequence"
                      value={businessSettings.invoiceNumberSequence}
                      onChange={handleChange}
                      className="brand-input"
                      min="1"
                      placeholder="e.g., 1"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id="useFinancialYear"
                        name="useFinancialYear"
                        checked={businessSettings.useFinancialYear}
                        onChange={handleChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="useFinancialYear" className="ml-2 block text-sm text-gray-700">
                        Use Financial Year (Apr-Mar) instead of Calendar Year
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="mr-4">
                        <input
                          type="checkbox"
                          id="resetSequenceMonthly"
                          name="resetSequenceMonthly"
                          checked={businessSettings.resetSequenceMonthly}
                          onChange={(e) => {
                            if (e.target.checked) {
                              // If monthly reset is enabled, disable yearly reset
                              setBusinessSettings(prev => ({
                                ...prev,
                                resetSequenceMonthly: true,
                                resetSequenceYearly: false
                              }));
                            } else {
                              setBusinessSettings(prev => ({
                                ...prev,
                                resetSequenceMonthly: false
                              }));
                            }
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="resetSequenceMonthly" className="ml-2 block text-sm text-gray-700">
                          Reset Monthly
                        </label>
                      </div>
                      
                      <div>
                        <input
                          type="checkbox"
                          id="resetSequenceYearly"
                          name="resetSequenceYearly"
                          checked={businessSettings.resetSequenceYearly}
                          onChange={(e) => {
                            if (e.target.checked) {
                              // If yearly reset is enabled, disable monthly reset
                              setBusinessSettings(prev => ({
                                ...prev,
                                resetSequenceYearly: true,
                                resetSequenceMonthly: false
                              }));
                            } else {
                              setBusinessSettings(prev => ({
                                ...prev,
                                resetSequenceYearly: false
                              }));
                            }
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="resetSequenceYearly" className="ml-2 block text-sm text-gray-700">
                          Reset Yearly
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="sequencePadding" className="brand-label">
                      Sequence Number Padding
                    </label>
                    <select
                      id="sequencePadding"
                      name="sequencePadding"
                      value={businessSettings.sequencePadding}
                      onChange={handleChange}
                      className="brand-input"
                    >
                      <option value="1">1 (e.g., 5)</option>
                      <option value="2">2 (e.g., 05)</option>
                      <option value="3">3 (e.g., 005)</option>
                      <option value="4">4 (e.g., 0005)</option>
                      <option value="5">5 (e.g., 00005)</option>
                    </select>
                  </div>

                  <div className="col-span-2 mt-4">
                    <label className="brand-label block mb-2">
                      Available Placeholders
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs bg-gray-50 p-3 rounded">
                      <div><code>{'{YYYY}'}</code> - 4-digit year (e.g., 2024)</div>
                      <div><code>{'{YY}'}</code> - 2-digit year (e.g., 24)</div>
                      <div><code>{'{FY}'}</code> - Financial year (e.g., 2023-24)</div>
                      <div><code>{'{MM}'}</code> - 2-digit month (e.g., 05)</div>
                      <div><code>{'{DD}'}</code> - 2-digit day (e.g., 15)</div>
                      <div><code>{'{SEQ}'}</code> - Sequence number</div>
                      <div><code>{'{PREFIX}'}</code> - Your set prefix</div>
                      <div><code>{'{SUFFIX}'}</code> - Your set suffix</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Preview: </span>
                    <span className="font-mono">{formatPreview}</span>
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    This is how your invoice numbers will be formatted. The sequence number will increment automatically for each new invoice.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <button type="submit" className="brand-button">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Save Settings
                </button>
                {isSaved && (
                  <span className="ml-3 text-sm text-green-600">Settings saved successfully!</span>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <div className="brand-card overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
            <p className="mt-1 text-sm text-gray-500">This is how your business information will appear on invoices</p>
          </div>
          <div className="p-6">
            <div className="border border-gray-300 p-4 rounded">
              <div className="section-title bg-gray-100 p-2 mb-2 font-bold">Bill To</div>
              <div className="preview-content">
                <p><strong>{businessSettings.companyName}</strong></p>
                <p><strong>GSTN: {businessSettings.gstn}</strong></p>
                <p>{businessSettings.addressLine1}</p>
                <p>{businessSettings.addressLine2}</p>
                <p>{businessSettings.addressLine3}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettingsForm; 