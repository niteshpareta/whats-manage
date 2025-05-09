import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { generateInvoiceHTML, updateInvoicePaymentStatus } from '../utils/invoiceUtils';
import { invoiceTemplate } from '../utils/invoiceTemplate';
import PaymentModal from './PaymentModal';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
    
    // One-time migration to update older invoices
    migrateInvoicesBaseAmount();
  }, []);

  // Migration for existing invoices to use base amount
  const migrateInvoicesBaseAmount = () => {
    try {
      const savedInvoices = localStorage.getItem('generatedInvoices');
      if (!savedInvoices) return;
      
      const invoices = JSON.parse(savedInvoices);
      let updated = false;
      
      // Check each invoice to see if it needs to be updated
      invoices.forEach(invoice => {
        if (invoice.fullData && (!invoice.amount || invoice.amount === '0')) {
          try {
            const invoiceData = JSON.parse(invoice.fullData);
            
            // Extract base amount from full data
            let baseAmount = '0';
            if (invoiceData.original_BASE_AMOUNT) {
              baseAmount = invoiceData.original_BASE_AMOUNT;
            } else if (invoiceData.BASE_AMOUNT) {
              // Remove currency symbol and whitespace
              baseAmount = invoiceData.BASE_AMOUNT.replace(/[^\d.-]/g, '').trim();
              if (isNaN(parseFloat(baseAmount))) {
                baseAmount = '0';
              }
              
              // Add original_BASE_AMOUNT to the stored data
              invoiceData.original_BASE_AMOUNT = baseAmount;
              invoice.fullData = JSON.stringify(invoiceData);
            }
            
            // Update the invoice record with the correct amounts
            invoice.amount = baseAmount;
            invoice.totalAmount = invoice.totalAmount || invoice.amount;
            updated = true;
          } catch (error) {
            console.error('Error updating invoice:', error);
          }
        }
      });
      
      // Save updated invoices if changes were made
      if (updated) {
        localStorage.setItem('generatedInvoices', JSON.stringify(invoices));
        console.log('Updated invoice amounts to use base amount');
      }
    } catch (error) {
      console.error('Error migrating invoices:', error);
    }
  };

  const loadInvoices = () => {
    setLoading(true);
    try {
      const savedInvoices = localStorage.getItem('generatedInvoices');
      if (savedInvoices) {
        const parsedInvoices = JSON.parse(savedInvoices);
        setInvoices(parsedInvoices);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set to descending by default
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectInvoice = (id) => {
    setSelectedInvoices(prev => {
      if (prev.includes(id)) {
        return prev.filter(invId => invId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === filteredInvoices.length) {
      // Deselect all
      setSelectedInvoices([]);
    } else {
      // Select all
      setSelectedInvoices(filteredInvoices.map(inv => inv.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedInvoices.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedInvoices.length} selected invoice(s)?`)) {
      const updatedInvoices = invoices.filter(inv => !selectedInvoices.includes(inv.id));
      setInvoices(updatedInvoices);
      localStorage.setItem('generatedInvoices', JSON.stringify(updatedInvoices));
      setSelectedInvoices([]);
    }
  };

  const handleEmailSelected = () => {
    if (selectedInvoices.length === 0) return;
    
    if (selectedInvoices.length === 1) {
      // Email a single invoice
      const invoice = invoices.find(inv => inv.id === selectedInvoices[0]);
      if (invoice && invoice.fullData) {
        navigate('/email-invoice', { 
          state: { invoiceData: JSON.parse(invoice.fullData) } 
        });
      }
    } else {
      alert('Please select only one invoice to email.');
    }
  };

  const handleDownloadPDF = (invoice) => {
    if (!invoice?.fullData) return;
    
    try {
      const invoiceData = JSON.parse(invoice.fullData);
      const html = generateInvoiceHTML(invoiceTemplate, invoiceData);
      
      // Create an iframe to render the HTML
      const iframe = document.createElement('iframe');
      iframe.style.visibility = 'hidden';
      iframe.style.position = 'absolute';
      iframe.style.height = '0';
      document.body.appendChild(iframe);
      
      iframe.contentDocument.open();
      iframe.contentDocument.write(html);
      iframe.contentDocument.close();
      
      // Wait for iframe to load
      setTimeout(() => {
        const element = iframe.contentDocument.documentElement;
        
        const filename = invoice.referenceNumber 
          ? `Invoice_${invoice.referenceNumber}.pdf` 
          : `Invoice_${invoice.invoiceNumber}.pdf`;
          
        const options = {
          margin: 0.5,
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(options).from(element).save().then(() => {
          // Clean up the iframe
          document.body.removeChild(iframe);
        });
      }, 500);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF.');
    }
  };

  const handleViewInvoice = (invoice) => {
    if (!invoice?.fullData) return;
    
    try {
      const invoiceData = JSON.parse(invoice.fullData);
      
      // First check if we have the original_BASE_AMOUNT from our storage fix
      if (invoiceData.original_BASE_AMOUNT) {
        invoiceData.BASE_AMOUNT = invoiceData.original_BASE_AMOUNT;
      } 
      // If not, clean up the BASE_AMOUNT field by removing currency symbol
      else if (typeof invoiceData.BASE_AMOUNT === 'string' && invoiceData.BASE_AMOUNT.includes('₹')) {
        invoiceData.BASE_AMOUNT = invoiceData.BASE_AMOUNT.replace('₹', '').trim();
      }
      
      // Update the invoice data with cleaned base amount
      const cleanedInvoiceData = {
        ...invoiceData,
        BASE_AMOUNT: invoiceData.BASE_AMOUNT
      };
      
      navigate('/', { state: { invoiceData: cleanedInvoiceData } });
    } catch (error) {
      console.error('Error viewing invoice:', error);
      alert('Error viewing invoice details.');
    }
  };

  const handleDuplicateInvoice = (invoice) => {
    if (!invoice?.fullData) return;
    
    try {
      const invoiceData = JSON.parse(invoice.fullData);
      
      // First check if we have the original_BASE_AMOUNT from our storage fix
      let baseAmount;
      if (invoiceData.original_BASE_AMOUNT) {
        baseAmount = invoiceData.original_BASE_AMOUNT;
      } 
      // If not, clean up the BASE_AMOUNT field by removing currency symbol
      else if (typeof invoiceData.BASE_AMOUNT === 'string' && invoiceData.BASE_AMOUNT.includes('₹')) {
        baseAmount = invoiceData.BASE_AMOUNT.replace('₹', '').trim();
      } else {
        baseAmount = invoiceData.BASE_AMOUNT;
      }
      
      // Create a copy with a new invoice number and cleaned base amount
      const duplicatedData = {
        ...invoiceData,
        INVOICE_NO: '',  // Clear invoice number to get a new one
        BASE_AMOUNT: baseAmount // Set cleaned base amount
      };
      
      navigate('/', { state: { invoiceData: duplicatedData } });
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      alert('Error duplicating invoice.');
    }
  };

  const handleOpenPaymentModal = (invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedInvoiceForPayment(null);
  };

  const handleSavePayment = (paymentDetails) => {
    if (!selectedInvoiceForPayment) return;
    
    const success = updateInvoicePaymentStatus(selectedInvoiceForPayment.id, paymentDetails);
    
    if (success) {
      // Reload invoices to get the updated data
      loadInvoices();
      handleClosePaymentModal();
    } else {
      alert('Failed to update payment status. Please try again.');
    }
  };

  // Filter invoices based on search query and status filter
  const filteredInvoices = invoices.filter(invoice => {
    // Filter by payment status
    if (filterStatus !== 'all' && invoice.status !== filterStatus) {
      return false;
    }
    
    // Filter by search terms
    const searchTerms = searchQuery.toLowerCase().split(' ');
    
    // Check if all search terms are found in the invoice
    return searchTerms.every(term => 
      term === '' || // Skip empty search terms
      invoice.invoiceNumber?.toLowerCase().includes(term) ||
      invoice.vendorName?.toLowerCase().includes(term) ||
      invoice.vendorGst?.toLowerCase().includes(term) ||
      invoice.referenceNumber?.toLowerCase().includes(term) ||
      invoice.date?.includes(term) ||
      invoice.paymentDetails?.paymentReference?.toLowerCase().includes(term)
    );
  });

  // Sort filtered invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'invoiceNumber':
        comparison = a.invoiceNumber.localeCompare(b.invoiceNumber);
        break;
      case 'date':
        comparison = new Date(a.date) - new Date(b.date);
        break;
      case 'vendorName':
        comparison = a.vendorName.localeCompare(b.vendorName);
        break;
      case 'amount':
        comparison = parseFloat(a.amount || 0) - parseFloat(b.amount || 0);
        break;
      case 'status':
        // Custom sort order: paid, partial, unpaid
        const statusOrder = { paid: 0, partial: 1, unpaid: 2 };
        comparison = statusOrder[a.status || 'unpaid'] - statusOrder[b.status || 'unpaid'];
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Format currency
  const formatCurrency = (amount) => {
    // Handle invalid or non-numeric amounts
    if (!amount || isNaN(parseFloat(amount))) {
      return '₹ 0.00';
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(parseFloat(amount));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get payment status badge styles
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  // Get payment status display text
  const getStatusDisplayText = (status) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'partial':
        return 'Partial';
      case 'unpaid':
      default:
        return 'Unpaid';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          <span className="text-gradient">Invoice Management</span>
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:text-lg md:mt-4">
          View and manage all your generated invoices
        </p>
      </div>

      <div className="brand-card overflow-hidden mb-6">
        <div className="px-4 py-5 bg-white sm:p-6">
          {/* Search and Action Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <input
                  type="text"
                  className="brand-input pl-10 w-full"
                  placeholder="Search invoices by number, vendor, GST..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Payment Status Filter */}
              <select
                className="brand-input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="partial">Partially Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>

              <Link 
                to="/create"
                className="brand-button-secondary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Invoice
              </Link>
              
              <button
                onClick={handleEmailSelected}
                disabled={selectedInvoices.length !== 1}
                className={`brand-button-secondary ${selectedInvoices.length !== 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </button>
              
              <button
                onClick={handleDeleteSelected}
                disabled={selectedInvoices.length === 0}
                className={`brand-button-danger ${selectedInvoices.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>

          {/* Invoices Table */}
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No invoices found</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't generated any invoices yet. Create a new invoice to get started.
              </p>
              <div className="mt-6">
                <Link to="/create" className="brand-button">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create New Invoice
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                          onChange={handleSelectAll}
                        />
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('invoiceNumber')}
                    >
                      <div className="flex items-center">
                        <span>Invoice No.</span>
                        {sortField === 'invoiceNumber' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            {sortDirection === 'asc' ? (
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            ) : (
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            )}
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        <span>Date</span>
                        {sortField === 'date' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            {sortDirection === 'asc' ? (
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            ) : (
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            )}
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('vendorName')}
                    >
                      <div className="flex items-center">
                        <span>Vendor</span>
                        {sortField === 'vendorName' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            {sortDirection === 'asc' ? (
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            ) : (
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            )}
                          </svg>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center">
                        <span>Base Amount</span>
                        {sortField === 'amount' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            {sortDirection === 'asc' ? (
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            ) : (
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            )}
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        <span>Status</span>
                        {sortField === 'status' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            {sortDirection === 'asc' ? (
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            ) : (
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            )}
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedInvoices.map((invoice) => (
                    <tr 
                      key={invoice.id} 
                      className={`hover:bg-gray-50 ${selectedInvoices.includes(invoice.id) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-3 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => handleSelectInvoice(invoice.id)}
                        />
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(invoice.date)}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.vendorName}</div>
                        <div className="text-xs text-gray-500">{invoice.vendorGst}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(invoice.amount)}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{invoice.referenceNumber || '-'}</div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                            {getStatusDisplayText(invoice.status || 'unpaid')}
                          </span>
                          {invoice.status === 'paid' && invoice.paymentDetails?.paymentDate && (
                            <span className="text-xs text-gray-500 mt-1">
                              {formatDate(invoice.paymentDetails.paymentDate)}
                            </span>
                          )}
                          {invoice.paymentDetails?.paymentReference && (
                            <span className="text-xs text-gray-500 mt-1">
                              Ref: {invoice.paymentDetails.paymentReference}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleOpenPaymentModal(invoice)}
                            className="text-green-600 hover:text-green-900"
                            title="Record Payment"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleViewInvoice(invoice)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View/Edit Invoice"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(invoice)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Download PDF"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDuplicateInvoice(invoice)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Duplicate Invoice"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredInvoices.length === 0 && !loading && invoices.length > 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No invoices match your search criteria.</p>
            </div>
          )}

          {/* Pagination or Summary */}
          {invoices.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredInvoices.length}</span> of <span className="font-medium">{invoices.length}</span> invoices
              </div>
              <div className="text-sm text-gray-700">
                {sortedInvoices.filter(i => i.status === 'paid').length} paid, 
                {' '}{sortedInvoices.filter(i => i.status === 'partial').length} partially paid, 
                {' '}{sortedInvoices.filter(i => i.status === 'unpaid' || !i.status).length} unpaid
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        invoice={selectedInvoiceForPayment}
        onSavePayment={handleSavePayment}
      />
    </div>
  );
};

export default InvoiceList; 