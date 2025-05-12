import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { loadPartnerData, savePartnerData } from '../utils/csvUtils';

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [newPartner, setNewPartner] = useState({
    partner_name: '',
    account_id: '',
    gst_no: '',
    partner_phone: '',
    partner_email: '',
    bank_account_number: '',
    bank_accountifsccode: ''
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        console.log('Partners component: Starting to fetch partners...');
        setIsLoading(true);
        setError(null);
        
        const data = await loadPartnerData();
        console.log('Partners component: Data loaded, count:', data.length);
        
        if (!data || data.length === 0) {
          throw new Error('No partner data was loaded');
        }
        
        setPartners(data);
      } catch (err) {
        console.error('Partners component: Error loading partners:', err);
        setError(err.message || 'Failed to load partner data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const filteredPartners = partners.filter(partner => {
    const query = searchQuery.toLowerCase();
    return (
      (partner.partner_name && partner.partner_name.toLowerCase().includes(query)) ||
      (partner.account_id && partner.account_id.toLowerCase().includes(query)) ||
      (partner.gst_no && partner.gst_no.toLowerCase().includes(query))
    );
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Generate a unique ID for a partner
  const generateUniqueId = () => {
    return 'p_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's a CSV file
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setUploadStatus({ success: false, message: 'Please upload a valid CSV file' });
      return;
    }

    try {
      setUploadStatus({ success: null, message: 'Uploading and processing CSV...' });
      
      // Read the file
      const reader = new FileReader();
      reader.onload = async (event) => {
        const csvText = event.target.result;
        
        // Parse CSV
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        const newPartners = [];
        const invalidRows = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const obj = {};
          const currentLine = lines[i].split(',');
          
          for (let j = 0; j < headers.length; j++) {
            // Clean header names to avoid issues
            const header = headers[j].trim();
            obj[header] = currentLine[j];
          }
          
          // Validate required fields
          if (!obj.partner_name || !obj.partner_name.trim()) {
            invalidRows.push(`Row ${i}: Missing Partner Name`);
            continue;
          }
          
          // GST is required
          if (!obj.gst_no || !obj.gst_no.trim()) {
            invalidRows.push(`Row ${i}: Missing GST Number`);
            continue;
          }
          
          // Generate a unique ID only if account_id is not provided or is empty
          if (!obj.account_id || !obj.account_id.trim()) {
            obj.account_id = generateUniqueId();
          }
          
          newPartners.push(obj);
        }
        
        // Get existing partners data
        const existingPartners = [...partners];
        
        // Merge the new and existing data
        // Create a set of existing account IDs to avoid duplicates
        const existingAccountIds = new Set(
          existingPartners
            .filter(p => p.account_id)
            .map(p => p.account_id)
        );
        
        // Create a set of existing GST numbers to avoid duplicates
        const existingGstNumbers = new Set(
          existingPartners
            .filter(p => p.gst_no) // Filter out partners without GST numbers
            .map(p => p.gst_no.toLowerCase()) // Normalize to lowercase for case-insensitive comparison
        );
        
        // Filter out duplicates and append new partners (based on account_id or GST number)
        const partnersToAdd = newPartners.filter(newP => {
          // Check if this partner's account_id already exists
          if (newP.account_id && existingAccountIds.has(newP.account_id)) {
            return false;
          }
          
          // If GST exists, check if it's a duplicate
          if (newP.gst_no && existingGstNumbers.has(newP.gst_no.toLowerCase())) {
            return false;
          }
          
          return true;
        });
        
        const combinedPartners = [...existingPartners, ...partnersToAdd];
        
        // Save to localStorage
        savePartnerData(combinedPartners);
        
        // Update state
        setPartners(combinedPartners);
        
        // Create status message
        let statusMessage = '';
        if (partnersToAdd.length > 0) {
          statusMessage = `Successfully added ${partnersToAdd.length} new partners`;
        } else {
          statusMessage = 'No new partners added';
        }
        
        if (newPartners.length - partnersToAdd.length > 0) {
          statusMessage += ` (${newPartners.length - partnersToAdd.length} partners with duplicate account ID or GST number skipped)`;
        }
        
        if (invalidRows.length > 0) {
          statusMessage += `. Skipped ${invalidRows.length} invalid rows: ${invalidRows.slice(0, 3).join('; ')}`;
          if (invalidRows.length > 3) {
            statusMessage += ` and ${invalidRows.length - 3} more`;
          }
        }
        
        setUploadStatus({ 
          success: true, 
          message: statusMessage 
        });
        
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      
      reader.readAsText(file);
    } catch (err) {
      console.error('Error processing CSV:', err);
      setUploadStatus({ 
        success: false, 
        message: `Error processing CSV: ${err.message}` 
      });
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const downloadSampleCSV = () => {
    // Updated sample CSV that includes account_id
    const csvHeaders = "partner_name,account_id,partner_phone,partner_email,bank_account_number,bank_accountifsccode,gst_no";
    const sampleData = [
      "Example Partner Ltd,p_sample123,9876543210,contact@example.com,12345678901,HDFC0000123,27ABCDE1234F1Z5",
      "Test Company,,9876543211,info@testcompany.com,98765432101,SBIN0001234,29FGHIJ5678K1Z7"
    ].join('\n');
    
    const csvContent = `${csvHeaders}\n${sampleData}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Update the message to mention account_id is optional and GST is required
    setUploadStatus({ 
      success: true, 
      message: 'Sample CSV downloaded. Note: Partner Name and GST Number are required fields. You can provide account_id or leave it blank to auto-generate.'
    });
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'partner_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Hide the message after 5 seconds
    setTimeout(() => {
      setUploadStatus(null);
    }, 5000);
  };

  const handleNewPartnerChange = (e) => {
    const { name, value } = e.target;
    setNewPartner(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPartner = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newPartner.partner_name.trim()) {
      setUploadStatus({
        success: false,
        message: 'Partner Name is required'
      });
      return;
    }

    // GST number is required
    if (!newPartner.gst_no.trim()) {
      setUploadStatus({
        success: false,
        message: 'GST Number is required'
      });
      return;
    }
    
    // Always generate a unique ID for new partners
    const newPartnerWithId = {
      ...newPartner,
      account_id: newPartner.account_id.trim() || generateUniqueId()
    };
    
    // Add the new partner to the array
    const updatedPartners = [...partners, newPartnerWithId];
    
    // Save to localStorage
    savePartnerData(updatedPartners);
    
    // Update state
    setPartners(updatedPartners);
    setShowAddForm(false);
    setNewPartner({
      partner_name: '',
      account_id: '',
      gst_no: '',
      partner_phone: '',
      partner_email: '',
      bank_account_number: '',
      bank_accountifsccode: ''
    });
    
    setUploadStatus({ 
      success: true, 
      message: 'Partner added successfully' 
    });
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setUploadStatus(null);
    }, 3000);
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
  };

  const handleEditPartner = (partner) => {
    setEditingPartner({...partner});
    setShowEditForm(true);
  };

  const handleEditPartnerChange = (e) => {
    const { name, value } = e.target;
    setEditingPartner(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditPartnerSubmit = (e) => {
    e.preventDefault();
    
    // Update partners array
    const updatedPartners = partners.map(partner => 
      partner.account_id === editingPartner.account_id ? editingPartner : partner
    );
    
    // Save to localStorage
    savePartnerData(updatedPartners);
    
    // Update state
    setPartners(updatedPartners);
    setShowEditForm(false);
    setEditingPartner(null);
    
    setUploadStatus({ 
      success: true, 
      message: 'Partner updated successfully' 
    });
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setUploadStatus(null);
    }, 3000);
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingPartner(null);
  };

  const handleDeletePartner = (partnerId) => {
    if (window.confirm('Are you sure you want to delete this partner? This action cannot be undone.')) {
      // Filter out the partner with the given ID
      const updatedPartners = partners.filter(partner => partner.account_id !== partnerId);
      
      // Save to localStorage
      savePartnerData(updatedPartners);
      
      // Update state
      setPartners(updatedPartners);
      
      setUploadStatus({ 
        success: true, 
        message: 'Partner deleted successfully' 
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setUploadStatus(null);
      }, 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          <span className="text-gradient">Partners Database</span>
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:text-lg md:mt-4">
          View and manage your partner information for invoice generation
        </p>
      </div>

      <div className="brand-card overflow-hidden mb-6">
        <div className="px-4 py-5 bg-white sm:p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-6">
            <div className="w-full lg:w-1/2">
              <div className="relative">
                <input
                  type="text"
                  className="brand-input pl-10 w-full"
                  placeholder="Search partners by name, ID, or GST number..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="flex-shrink-0 text-sm text-gray-500 self-center mb-2 sm:mb-0">
                {filteredPartners.length} partners found
              </div>
              
              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <button
                  onClick={downloadSampleCSV}
                  className="brand-button-secondary flex items-center justify-center whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Sample
                </button>

              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv"
                  className="hidden"
                />
                <button
                  onClick={handleUploadClick}
                    className="brand-button-secondary flex items-center justify-center whitespace-nowrap"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    Upload CSV
                  </button>
                </div>

                <button
                  onClick={toggleAddForm}
                  className="brand-button flex items-center justify-center whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Partner
                </button>
              </div>
            </div>
          </div>

          {uploadStatus && (
            <div className={`mb-4 p-3 rounded-md ${
              uploadStatus.success === true ? 'bg-green-50 text-green-700' : 
              uploadStatus.success === false ? 'bg-red-50 text-red-700' : 
              'bg-blue-50 text-blue-700'
            }`}>
              {uploadStatus.message}
            </div>
          )}

          {showAddForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Partner</h3>
              <form onSubmit={handleAddPartner}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="partner_name" className="block text-sm font-medium text-gray-700">
                      Partner Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="partner_name"
                      id="partner_name"
                      required
                      value={newPartner.partner_name}
                      onChange={handleNewPartnerChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="account_id" className="block text-sm font-medium text-gray-700">
                      Account ID (optional)
                    </label>
                    <input
                      type="text"
                      name="account_id"
                      id="account_id"
                      value={newPartner.account_id}
                      onChange={handleNewPartnerChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder="Will be auto-generated if left blank"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="gst_no" className="block text-sm font-medium text-gray-700">
                      GST Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="gst_no"
                      id="gst_no"
                      required
                      value={newPartner.gst_no}
                      onChange={handleNewPartnerChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="partner_phone" className="block text-sm font-medium text-gray-700">
                      Phone Number (optional)
                    </label>
                    <input
                      type="text"
                      name="partner_phone"
                      id="partner_phone"
                      value={newPartner.partner_phone}
                      onChange={handleNewPartnerChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="partner_email" className="block text-sm font-medium text-gray-700">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      name="partner_email"
                      id="partner_email"
                      value={newPartner.partner_email}
                      onChange={handleNewPartnerChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bank_account_number" className="block text-sm font-medium text-gray-700">
                      Bank Account Number (optional)
                    </label>
                    <input
                      type="text"
                      name="bank_account_number"
                      id="bank_account_number"
                      value={newPartner.bank_account_number}
                      onChange={handleNewPartnerChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bank_accountifsccode" className="block text-sm font-medium text-gray-700">
                      Bank IFSC Code (optional)
                    </label>
                    <input
                      type="text"
                      name="bank_accountifsccode"
                      id="bank_accountifsccode"
                      value={newPartner.bank_accountifsccode}
                      onChange={handleNewPartnerChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={toggleAddForm}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    style={{ backgroundColor: "var(--color-primary, #4F46E5)" }}
                  >
                    Save Partner
                  </button>
                </div>
              </form>
            </div>
          )}

          {showEditForm && editingPartner && (
            <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Partner</h3>
              <form onSubmit={handleEditPartnerSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="partner_name" className="block text-sm font-medium text-gray-700">
                      Partner Name
                    </label>
                    <input
                      type="text"
                      name="partner_name"
                      id="partner_name"
                      value={editingPartner.partner_name}
                      onChange={handleEditPartnerChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="account_id" className="block text-sm font-medium text-gray-700">
                      Account ID (read-only)
                    </label>
                    <input
                      type="text"
                      name="account_id"
                      id="account_id"
                      value={editingPartner.account_id}
                      readOnly
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-100 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="gst_no" className="block text-sm font-medium text-gray-700">
                      GST Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="gst_no"
                      id="gst_no"
                      required
                      value={editingPartner.gst_no}
                      onChange={handleEditPartnerChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="partner_phone" className="block text-sm font-medium text-gray-700">
                      Phone Number (optional)
                    </label>
                    <input
                      type="text"
                      name="partner_phone"
                      id="partner_phone"
                      value={editingPartner.partner_phone}
                      onChange={handleEditPartnerChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="partner_email" className="block text-sm font-medium text-gray-700">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      name="partner_email"
                      id="partner_email"
                      value={editingPartner.partner_email}
                      onChange={handleEditPartnerChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bank_account_number" className="block text-sm font-medium text-gray-700">
                      Bank Account Number (optional)
                    </label>
                    <input
                      type="text"
                      name="bank_account_number"
                      id="bank_account_number"
                      value={editingPartner.bank_account_number}
                      onChange={handleEditPartnerChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="bank_accountifsccode" className="block text-sm font-medium text-gray-700">
                      Bank IFSC Code (optional)
                    </label>
                    <input
                      type="text"
                      name="bank_accountifsccode"
                      id="bank_accountifsccode"
                      value={editingPartner.bank_accountifsccode}
                      onChange={handleEditPartnerChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="brand-button-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="brand-button"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-10">
              <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-3 text-gray-600">Loading partners data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-500 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-700">{error}</p>
              <button 
                className="mt-4 brand-button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No partners found matching your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Number</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Details</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPartners.map((partner, index) => (
                    <tr key={partner.account_id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{partner.partner_name || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{partner.account_id || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{partner.gst_no || 'Not provided'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {partner.partner_phone && (
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {partner.partner_phone}
                            </div>
                          )}
                          {partner.partner_email && (
                            <div className="flex items-center mt-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {partner.partner_email}
                            </div>
                          )}
                          {!partner.partner_phone && !partner.partner_email && 'No contact info'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {partner.bank_accountifsccode ? (
                            <>IFSC: {partner.bank_accountifsccode}<br /></>
                          ) : null}
                          {partner.bank_account_number ? (
                            <>Acc: {partner.bank_account_number.substring(0, 3)}...{partner.bank_account_number.slice(-4)}</>
                          ) : 'No bank details'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-3">
                          <Link 
                            to={`/?partnerId=${partner.account_id}`}
                            className="text-primary hover:text-primary-dark flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Generate Invoice
                          </Link>
                          <button 
                            onClick={() => handleEditPartner(partner)}
                            className="text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeletePartner(partner.account_id)}
                            className="text-red-600 hover:text-red-800 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <div className="brand-card overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Help</h2>
          <p className="mt-1 text-sm text-gray-500">Using the partners database</p>
        </div>
        <div className="p-6">
          <div className="text-sm text-gray-600">
            <p className="mb-3">The partners database allows you to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>View all your partners in one place</li>
              <li>Search for partners by name, ID, or GST number</li>
              <li>Download a sample CSV template</li>
              <li>Upload a CSV file with partner data</li>
              <li>Add new partners directly through the form</li>
              <li>Edit or delete existing partner information</li>
              <li>Click "Generate Invoice" to create an invoice for a specific partner</li>
            </ul>
            <p className="mt-4">Partner data is stored in your browser's local storage, so it will persist between visits to this page.</p>
            <p className="mt-2">Partner Name and GST Number are required. All other fields including Account ID, Phone, Email, and Bank details are optional.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partners; 