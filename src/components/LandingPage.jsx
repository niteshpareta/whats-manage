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
      title: 'Professional Invoices',
      description: 'Create GST-compliant invoices that look professional and reflect your brand identity.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Payment Tracking',
      description: 'Track payment status, record partial payments, and manage outstanding invoices efficiently.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: 'Bulk Invoice Generation',
      description: 'Upload CSV data to generate multiple invoices at once, saving time and reducing errors.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Email Integration',
      description: 'Send invoices directly to clients via email with customizable templates.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      title: 'Custom Tax Calculation',
      description: 'Automatically calculate GST, CGST, SGST or IGST based on location and business rules.'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: 'Business Settings',
      description: 'Customize your invoice appearance with business logo, address, and contact details.'
    }
  ];

  // Testimonials content
  const testimonials = [
    {
      quote: "WhatsManage has streamlined our invoice process completely. What used to take hours now takes minutes.",
      author: "Priya Sharma",
      position: "Finance Manager, TechSolutions Ltd."
    },
    {
      quote: "The bulk invoice feature is a game changer for our agency. We've reduced billing time by 75%.",
      author: "Rahul Mehta",
      position: "CEO, Digital Creatives"
    },
    {
      quote: "The GST compliance features saved us from so many calculation errors. Highly recommended!",
      author: "Ananya Patel",
      position: "Accountant, Startup Ventures"
    }
  ];

  return (
    <>
      <Helmet>
        <title>WhatsManage - Professional GST Invoice Generator for Indian Businesses</title>
        <meta name="description" content="Create professional GST-compliant invoices in seconds. Track payments, generate bulk invoices, and manage your business finances with WhatsManage." />
        <meta name="keywords" content="invoice generator, GST invoice, invoice software, business invoicing, payment tracking, bulk invoice" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://whatsmange.com/" />
        <meta property="og:title" content="WhatsManage - Professional GST Invoice Generator" />
        <meta property="og:description" content="Create professional GST-compliant invoices in seconds. Track payments, generate bulk invoices, and manage your business finances." />
        <meta property="og:image" content="https://via.placeholder.com/1200x630?text=WhatsManage" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://whatsmange.com/" />
        <meta property="twitter:title" content="WhatsManage - Professional GST Invoice Generator" />
        <meta property="twitter:description" content="Create professional GST-compliant invoices in seconds. Track payments, generate bulk invoices, and manage your business finances." />
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
              "description": "Create professional GST-compliant invoices in seconds. Track payments, generate bulk invoices, and manage your business finances."
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
                Manage Invoices <span className="text-yellow-300">Effortlessly</span>
              </h1>
              <p className="text-xl opacity-90 mb-8 max-w-lg">
                Create professional GST-compliant invoices in seconds. Track payments, generate bulk invoices, and streamline your business finances.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/create" 
                  className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 transform hover:-translate-y-1"
                >
                  Get Started
                </Link>
                <Link 
                  to="/bulk-invoice" 
                  className="px-6 py-3 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-indigo-600 transition duration-300"
                >
                  Bulk Invoice
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
                <p className="text-indigo-800 font-bold">GST Compliant</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need for <span className="text-gradient">Invoice Management</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              WhatsManage provides a complete solution for creating, sending, and tracking invoices for your business.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple <span className="text-gradient">3-Step Process</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Get started with WhatsManage in just a few minutes
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-4 items-center justify-between">
            <div className="w-full md:w-1/3 text-center px-4">
              <div className="w-16 h-16 bg-indigo-600 text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Configure Your Business</h3>
              <p className="text-gray-600">Enter your business details, logo, and tax settings once, and they'll be applied to all your invoices.</p>
            </div>
            
            <div className="hidden md:block w-16 h-0.5 bg-indigo-300"></div>
            
            <div className="w-full md:w-1/3 text-center px-4">
              <div className="w-16 h-16 bg-indigo-600 text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Create Invoices</h3>
              <p className="text-gray-600">Generate professional invoices instantly, individually or in bulk, with automatic tax calculation.</p>
            </div>
            
            <div className="hidden md:block w-16 h-0.5 bg-indigo-300"></div>
            
            <div className="w-full md:w-1/3 text-center px-4">
              <div className="w-16 h-16 bg-indigo-600 text-white text-2xl font-bold rounded-full flex items-center justify-center mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Send & Track</h3>
              <p className="text-gray-600">Email invoices directly to clients and track payment status until completion.</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/create" 
              className="brand-button py-3 px-8 text-base"
            >
              Try It Now
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
              Here's what our users say about WhatsManage
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Creating Professional Invoices Today</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join businesses across India who trust WhatsManage for their invoicing needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/create" 
              className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 transform hover:-translate-y-1"
            >
              Get Started for Free
            </Link>
            <Link 
              to="/bulk-invoice" 
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-indigo-600 transition duration-300"
            >
              Try Bulk Invoice
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
              Got questions? We've got answers.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="brand-card p-6">
              <h3 className="text-xl font-semibold mb-2">Is WhatsManage free to use?</h3>
              <p className="text-gray-600">Yes, WhatsManage is currently free to use with all features included.</p>
            </div>
            
            <div className="brand-card p-6">
              <h3 className="text-xl font-semibold mb-2">Can I send invoices directly via email?</h3>
              <p className="text-gray-600">Yes, you can configure your email settings and send invoices directly to your clients from within WhatsManage.</p>
            </div>
            
            <div className="brand-card p-6">
              <h3 className="text-xl font-semibold mb-2">Is my data secure with WhatsManage?</h3>
              <p className="text-gray-600">WhatsManage stores all your data locally on your device, so you maintain complete control over your business information.</p>
            </div>
            
            <div className="brand-card p-6">
              <h3 className="text-xl font-semibold mb-2">Can I customize invoice numbers?</h3>
              <p className="text-gray-600">Yes, you can configure custom invoice number formats including prefixes, suffixes, and sequential numbering patterns.</p>
            </div>
            
            <div className="brand-card p-6">
              <h3 className="text-xl font-semibold mb-2">Does WhatsManage support different tax structures?</h3>
              <p className="text-gray-600">Yes, WhatsManage supports both GST with CGST/SGST split and IGST calculation based on the client's location.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage; 