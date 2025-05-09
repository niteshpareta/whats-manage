import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Invoice Generator', href: '/create' },
    { name: 'Bulk Invoice', href: '/bulk-invoice' },
    { name: 'Invoices', href: '/invoices' },
    { name: 'Business Settings', href: '/settings' },
    { name: 'Partners', href: '/partners' },
    { name: 'Email Settings', href: '/email-settings' },
  ];

  const handleNewInvoice = () => {
    // Clear invoice data from localStorage
    localStorage.removeItem('invoiceFormData');
    localStorage.removeItem('invoiceData');
    localStorage.removeItem('partnerId');
    
    // Force a complete page reload to ensure the InvoiceForm component is reinitialized
    window.location.href = '/create';
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b border-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-2 rounded-lg shadow-md transition-all duration-300 group-hover:shadow-indigo-200 group-hover:shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">WhatsManage</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  pathname === item.href
                    ? 'text-indigo-600 border-indigo-600 font-medium'
                    : 'text-gray-700 border-transparent hover:text-indigo-600 hover:border-indigo-300'
                } px-3 py-2 text-sm border-b-2 transition-colors duration-200 flex items-center`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Desktop right buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-700 hover:text-indigo-600 flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Help
            </button>
            <button 
              onClick={handleNewInvoice} 
              className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Invoice
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="text-gray-700 hover:text-indigo-600 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 bg-white shadow-lg rounded-b-lg absolute left-0 right-0 z-10">
            <div className="space-y-1 px-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    pathname === item.href
                      ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-500'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 border-l-4 border-transparent'
                  } block py-2.5 px-3 rounded-md text-base font-medium transition-colors duration-200`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <button 
                onClick={handleNewInvoice}
                className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white px-4 py-2.5 w-full mt-3 rounded-md text-base font-medium shadow-sm flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Invoice
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 