import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import InvoiceForm from './components/InvoiceForm';
import BusinessSettingsForm from './components/BusinessSettingsForm';
import Partners from './components/Partners';
import EmailInvoice from './components/EmailInvoice';
import EmailSettings from './components/EmailSettings';
import BulkInvoice from './components/BulkInvoice';
import InvoiceList from './components/InvoiceList';
import LandingPage from './components/LandingPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create" element={<InvoiceForm />} />
            <Route path="/settings" element={<BusinessSettingsForm />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/email-invoice" element={<EmailInvoice />} />
            <Route path="/email-settings" element={<EmailSettings />} />
            <Route path="/bulk-invoice" element={<BulkInvoice />} />
            <Route path="/invoices" element={<InvoiceList />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-gray-500 text-center">
              &copy; {new Date().getFullYear()} WhatsManage. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App; 