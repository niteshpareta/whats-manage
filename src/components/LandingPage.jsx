import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

// Create a realistic invoice preview using SVG
const InvoicePreview = () => (
  <svg 
    viewBox="0 0 800 600" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
  >
    {/* Background */}
    <rect width="800" height="600" fill="white" />
    
    {/* Header Background */}
    <rect width="800" height="120" fill="#F7FAFC" />
    
    {/* Company Logo */}
    <rect x="40" y="30" width="60" height="60" rx="8" fill="#4F46E5" />
    <text x="60" y="65" fontFamily="Arial" fontSize="16" fill="white" textAnchor="middle" dominantBaseline="middle">WM</text>
    
    {/* Company Info */}
    <text x="120" y="45" fontFamily="Arial" fontSize="18" fontWeight="bold" fill="#1A202C">WhatsManage Services</text>
    <text x="120" y="65" fontFamily="Arial" fontSize="12" fill="#4A5568">123 Business Park, Mumbai, Maharashtra 400001</text>
    <text x="120" y="85" fontFamily="Arial" fontSize="12" fill="#4A5568">GSTIN: 27AABCU9603R1ZX | Contact: +91 98765 43210</text>
    
    {/* Invoice Title */}
    <text x="760" y="45" fontFamily="Arial" fontSize="22" fontWeight="bold" fill="#1A202C" textAnchor="end">TAX INVOICE</text>
    <text x="760" y="65" fontFamily="Arial" fontSize="12" fill="#4A5568" textAnchor="end">Invoice No: INV-2023-0042</text>
    <text x="760" y="85" fontFamily="Arial" fontSize="12" fill="#4A5568" textAnchor="end">Date: 05 May, 2023</text>
    
    {/* Divider */}
    <line x1="40" y1="120" x2="760" y2="120" stroke="#E2E8F0" strokeWidth="1" />
    
    {/* Client Info */}
    <text x="40" y="145" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="#4A5568">Bill To:</text>
    <text x="40" y="165" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="#1A202C">Tech Solutions Pvt. Ltd.</text>
    <text x="40" y="185" fontFamily="Arial" fontSize="12" fill="#4A5568">456 Corporate Tower, Bengaluru, Karnataka 560001</text>
    <text x="40" y="205" fontFamily="Arial" fontSize="12" fill="#4A5568">GSTIN: 29AADCT4599R1ZC</text>
    
    {/* Invoice Details */}
    <text x="500" y="145" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="#4A5568">Payment Details:</text>
    <text x="500" y="165" fontFamily="Arial" fontSize="12" fill="#4A5568">Due Date: 19 May, 2023</text>
    <text x="500" y="185" fontFamily="Arial" fontSize="12" fill="#4A5568">Payment Method: Bank Transfer</text>
    <text x="500" y="205" fontFamily="Arial" fontSize="12" fill="#4A5568">Status: <tspan fill="#EF4444">UNPAID</tspan></text>
    
    {/* Table Header */}
    <rect x="40" y="230" width="720" height="40" fill="#F7FAFC" />
    <text x="60" y="255" fontFamily="Arial" fontSize="12" fontWeight="bold" fill="#4A5568">Item Description</text>
    <text x="400" y="255" fontFamily="Arial" fontSize="12" fontWeight="bold" fill="#4A5568">Quantity</text>
    <text x="480" y="255" fontFamily="Arial" fontSize="12" fontWeight="bold" fill="#4A5568">Rate</text>
    <text x="560" y="255" fontFamily="Arial" fontSize="12" fontWeight="bold" fill="#4A5568">Tax</text>
    <text x="700" y="255" fontFamily="Arial" fontSize="12" fontWeight="bold" fill="#4A5568" textAnchor="end">Amount</text>
    
    {/* Table Rows */}
    <line x1="40" y1="270" x2="760" y2="270" stroke="#E2E8F0" strokeWidth="1" />
    <text x="60" y="295" fontFamily="Arial" fontSize="12" fill="#1A202C">Web Development Services</text>
    <text x="400" y="295" fontFamily="Arial" fontSize="12" fill="#1A202C">1</text>
    <text x="480" y="295" fontFamily="Arial" fontSize="12" fill="#1A202C">₹50,000.00</text>
    <text x="560" y="295" fontFamily="Arial" fontSize="12" fill="#1A202C">18%</text>
    <text x="700" y="295" fontFamily="Arial" fontSize="12" fill="#1A202C" textAnchor="end">₹50,000.00</text>
    
    <line x1="40" y1="310" x2="760" y2="310" stroke="#E2E8F0" strokeWidth="1" />
    <text x="60" y="335" fontFamily="Arial" fontSize="12" fill="#1A202C">UI/UX Design Package</text>
    <text x="400" y="335" fontFamily="Arial" fontSize="12" fill="#1A202C">1</text>
    <text x="480" y="335" fontFamily="Arial" fontSize="12" fill="#1A202C">₹35,000.00</text>
    <text x="560" y="335" fontFamily="Arial" fontSize="12" fill="#1A202C">18%</text>
    <text x="700" y="335" fontFamily="Arial" fontSize="12" fill="#1A202C" textAnchor="end">₹35,000.00</text>
    
    <line x1="40" y1="350" x2="760" y2="350" stroke="#E2E8F0" strokeWidth="1" />
    <text x="60" y="375" fontFamily="Arial" fontSize="12" fill="#1A202C">Maintenance Service (Monthly)</text>
    <text x="400" y="375" fontFamily="Arial" fontSize="12" fill="#1A202C">3</text>
    <text x="480" y="375" fontFamily="Arial" fontSize="12" fill="#1A202C">₹5,000.00</text>
    <text x="560" y="375" fontFamily="Arial" fontSize="12" fill="#1A202C">18%</text>
    <text x="700" y="375" fontFamily="Arial" fontSize="12" fill="#1A202C" textAnchor="end">₹15,000.00</text>
    
    <line x1="40" y1="390" x2="760" y2="390" stroke="#E2E8F0" strokeWidth="1" />
    
    {/* Subtotal and Tax */}
    <text x="580" y="415" fontFamily="Arial" fontSize="12" fill="#4A5568" textAnchor="end">Subtotal:</text>
    <text x="700" y="415" fontFamily="Arial" fontSize="12" fill="#1A202C" textAnchor="end">₹1,00,000.00</text>
    
    <text x="580" y="440" fontFamily="Arial" fontSize="12" fill="#4A5568" textAnchor="end">CGST (9%):</text>
    <text x="700" y="440" fontFamily="Arial" fontSize="12" fill="#1A202C" textAnchor="end">₹9,000.00</text>
    
    <text x="580" y="465" fontFamily="Arial" fontSize="12" fill="#4A5568" textAnchor="end">SGST (9%):</text>
    <text x="700" y="465" fontFamily="Arial" fontSize="12" fill="#1A202C" textAnchor="end">₹9,000.00</text>
    
    <line x1="480" y1="480" x2="760" y2="480" stroke="#CBD5E0" strokeWidth="1" />
    
    {/* Total */}
    <text x="580" y="505" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="#1A202C" textAnchor="end">Total Amount:</text>
    <text x="700" y="505" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="#1A202C" textAnchor="end">₹1,18,000.00</text>
    
    {/* Footer */}
    <rect x="40" y="530" width="720" height="50" rx="4" fill="#F7FAFC" />
    <text x="60" y="555" fontFamily="Arial" fontSize="12" fill="#4A5568">Notes: Thank you for your business. Payment is due within 14 days.</text>
    <text x="60" y="570" fontFamily="Arial" fontSize="10" fill="#718096">Bank Details: HDFC Bank | Account: 12345678901234 | IFSC: HDFC0001234</text>
    
    {/* QR Code Placeholder */}
    <rect x="680" y="520" width="60" height="60" rx="4" fill="#EDF2F7" />
    <line x1="690" y1="530" x2="730" y2="570" stroke="#A0AEC0" strokeWidth="1" />
    <line x1="730" y1="530" x2="690" y2="570" stroke="#A0AEC0" strokeWidth="1" />
    
    {/* Stamp */}
    <circle cx="100" cy="555" r="30" fill="#4F46E5" fillOpacity="0.1" />
    <text x="100" y="555" fontFamily="Arial" fontSize="10" fill="#4F46E5" textAnchor="middle" dominantBaseline="middle">PAID</text>
  </svg>
);

const LandingPage = () => {
  // On component mount, scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Features grid content
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Error-Free Invoices',
      description: 'Generate perfect GST-compliant invoices with consistent formatting and all required tax details.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Faster Credit Recovery',
      description: 'Eliminate delays caused by incorrect vendor submissions and accelerate your GST credit claims.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: 'Bulk Invoice Generation',
      description: 'Create multiple perfect invoices at once, saving time and ensuring consistency across vendors.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Vendor Collaboration',
      description: 'Send professional invoices to vendors for verification and signature, ensuring accuracy and compliance.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      title: 'Simplified Compliance',
      description: 'Maintain proper documentation for seamless tax audits with automated GST calculations.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: 'Partner Management',
      description: 'Store and organize all vendor details in one secure location for easy invoice generation.'
    }
  ];

  // Testimonials content
  const testimonials = [
    {
      quote: "WhatsManage transformed how we handle vendor invoices. We now send them perfect GST documents to sign, eliminating the back-and-forth and errors.",
      author: "Priya Sharma",
      position: "Finance Manager, TechSolutions Ltd."
    },
    {
      quote: "Our GST credit recovery process is now 70% faster. No more incorrect invoices from vendors - we create them ourselves and get them signed.",
      author: "Rahul Mehta",
      position: "CFO, Digital Creatives"
    },
    {
      quote: "The time saved on invoice corrections alone justified switching to WhatsManage. Now our vendors just verify and sign the perfect invoices we create.",
      author: "Ananya Patel",
      position: "Accounts Manager, Startup Ventures"
    }
  ];

  return (
    <>
      <Helmet>
        <title>WhatsManage - Eliminate Vendor Invoice Errors for Faster GST Credit</title>
        <meta name="description" content="Stop waiting for incorrect vendor invoices after payment. WhatsManage lets you create perfect, GST-compliant invoices for vendors to sign, ensuring faster credit recovery and error-free compliance." />
        <meta name="keywords" content="GST invoice management, vendor invoice automation, tax credit recovery, GST compliance software, error-free invoice generator, proactive invoice management" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://whatsmange.com/" />
        <meta property="og:title" content="WhatsManage - Eliminate Vendor Invoice Errors for Faster GST Credit" />
        <meta property="og:description" content="Stop waiting for incorrect vendor invoices after payment. Create perfect, GST-compliant documents for vendors to sign, ensuring faster credit recovery." />
        <meta property="og:image" content="https://via.placeholder.com/1200x630?text=WhatsManage" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://whatsmange.com/" />
        <meta property="twitter:title" content="WhatsManage - Eliminate Vendor Invoice Errors for Faster GST Credit" />
        <meta property="twitter:description" content="Stop waiting for incorrect vendor invoices after payment. Create perfect, GST-compliant documents for vendors to sign, ensuring faster credit recovery." />
        <meta property="twitter:image" content="https://via.placeholder.com/1200x630?text=WhatsManage" />
        
        {/* Schema.org markup for Google */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "WhatsManage",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              },
              "description": "Stop waiting for incorrect vendor invoices after payment. WhatsManage lets you create perfect, GST-compliant invoices for vendors to sign, ensuring faster credit recovery and error-free compliance."
            }
          `}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 md:pr-10 mb-10 md:mb-0 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                Never Chase <span className="text-yellow-300">Incorrect Vendor Invoices</span> Again
              </h1>
              <p className="text-xl opacity-90 mb-8 max-w-lg">
                Stop waiting for vendors to submit error-filled invoices after payment. Generate perfect GST-compliant documents for them to sign, accelerating your tax credit recovery.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/create" 
                  className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 transform hover:-translate-y-1"
                >
                  Create Perfect Invoice
                </Link>
                <Link 
                  to="/partners" 
                  className="px-6 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-indigo-600 transition duration-300"
                >
                  Manage Vendors
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative animate-slide-in">
              <div className="bg-white rounded-lg shadow-2xl p-2 transform rotate-2 hover:rotate-0 transition-transform duration-300 z-10">
                <div className="bg-gray-50 rounded-lg overflow-hidden border">
                  <InvoicePreview />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-yellow-300 rounded-lg p-4 shadow-lg z-20 transform hover:scale-105 transition-transform duration-300">
                <p className="text-indigo-800 font-bold">Vendor-Ready</p>
              </div>
            </div>
          </div>
        </div>
        <div className="wave-divider">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full h-auto" preserveAspectRatio="none">
            <path fill="#ffffff" fillOpacity="1" d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Take Control of Your <span className="text-gradient">Vendor Invoice Process</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              WhatsManage flips the script on vendor invoice management - you create perfect invoices, vendors simply verify and sign.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="brand-card p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How <span className="text-gradient">WhatsManage</span> Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              A smarter approach to vendor invoice management
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-4 items-center justify-between">
            <div className="w-full md:w-1/3 text-center px-4">
              <div className="w-16 h-16 bg-indigo-600 text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Create Partner Profiles</h3>
              <p className="text-gray-600">Upload your vendor database or add partners individually with all their GST and banking details.</p>
            </div>
            
            <div className="hidden md:block w-16 h-0.5 bg-indigo-300"></div>
            
            <div className="w-full md:w-1/3 text-center px-4">
              <div className="w-16 h-16 bg-indigo-600 text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Generate Perfect Invoices</h3>
              <p className="text-gray-600">Create GST-compliant invoices with proper tax calculations for your vendors to approve.</p>
            </div>
            
            <div className="hidden md:block w-16 h-0.5 bg-indigo-300"></div>
            
            <div className="w-full md:w-1/3 text-center px-4">
              <div className="w-16 h-16 bg-indigo-600 text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Track & Claim GST Credit</h3>
              <p className="text-gray-600">Monitor invoice status, track payments, and easily claim your tax credits with error-free documentation.</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/create" 
              className="brand-button py-3 px-8 text-base"
            >
              Start Creating Invoices
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by <span className="text-gradient">Businesses</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Companies are eliminating vendor invoice headaches with WhatsManage
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="brand-card p-6 md:p-8 flex flex-col">
                <div className="mb-4 text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-6 flex-grow italic">{testimonial.quote}</p>
                <div>
                  <p className="font-semibold text-gray-800">{testimonial.author}</p>
                  <p className="text-gray-500 text-sm">{testimonial.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Eliminate Invoice Errors, Accelerate GST Credit Recovery</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join businesses across India who are taking control of their vendor invoice process.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/create" 
              className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 transform hover:-translate-y-1"
            >
              Get Started for Free
            </Link>
            <Link 
              to="/partners" 
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-indigo-600 transition duration-300"
            >
              Manage Vendors
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Common questions about our vendor invoice management solution
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="brand-card p-6">
              <h3 className="text-xl font-semibold mb-2">How does WhatsManage help with GST credit recovery?</h3>
              <p className="text-gray-600">WhatsManage allows you to create perfect vendor invoices with all GST compliance details, eliminating errors that typically delay credit claims. Your vendors simply verify and sign these documents instead of creating error-filled invoices themselves.</p>
            </div>
            
            <div className="brand-card p-6">
              <h3 className="text-xl font-semibold mb-2">Is WhatsManage free to use?</h3>
              <p className="text-gray-600">Yes, WhatsManage is currently free to use with all features included. You can create and manage unlimited vendor invoices at no cost.</p>
            </div>
            
            <div className="brand-card p-6">
              <h3 className="text-xl font-semibold mb-2">How do vendors sign the invoices I create?</h3>
              <p className="text-gray-600">You can send generated invoices to vendors via email for them to review, sign, and return. This ensures accuracy while still maintaining proper documentation for GST compliance.</p>
            </div>
            
            <div className="brand-card p-6">
              <h3 className="text-xl font-semibold mb-2">Is my data secure with WhatsManage?</h3>
              <p className="text-gray-600">WhatsManage stores all your data locally on your device, so you maintain complete control over your business and vendor information.</p>
            </div>
            
            <div className="brand-card p-6">
              <h3 className="text-xl font-semibold mb-2">Does WhatsManage support different GST tax structures?</h3>
              <p className="text-gray-600">Yes, WhatsManage supports both GST with CGST/SGST split and IGST calculation based on the vendor's location, ensuring full tax compliance.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage; 