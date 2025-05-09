import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EmailSettings = () => {
  const navigate = useNavigate();
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  
  const [settings, setSettings] = useState({
    email: '',
    appPassword: '',
    defaultSubjectTemplate: 'Invoice {{invoiceNumber}} for {{serviceDescription}} from {{companyName}}',
    defaultMessageTemplate: `Dear {{vendorName}},

Please find attached the invoice for {{serviceDescription}}.

Invoice Number: {{invoiceNumber}}
Invoice Date: {{invoiceDate}}
Amount: {{amount}}

If you have any questions regarding this invoice, please don't hesitate to contact us.

Thank you for your business.

Regards,
{{companyName}}`,
    senderName: '',
    companyName: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('emailSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(prev => ({
        ...prev,
        ...parsed
      }));
      setIsConfigured(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      // Save to localStorage (excluding sensitive data)
      const storageSettings = {
        email: settings.email,
        defaultSubjectTemplate: settings.defaultSubjectTemplate,
        defaultMessageTemplate: settings.defaultMessageTemplate,
        senderName: settings.senderName,
        companyName: settings.companyName
      };
      localStorage.setItem('emailSettings', JSON.stringify(storageSettings));
      
      // Save to backend (including sensitive data)
      const response = await fetch('http://localhost:8000/api/email-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      setIsConfigured(true);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestStatus(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: settings.email,
          subject: 'Test Email from WhatsManage',
          message: 'This is a test email to verify your email settings.'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send test email');
      }
      
      setTestStatus('success');
    } catch (error) {
      console.error('Error testing email:', error);
      setTestStatus('error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          <span className="text-gradient">Email Settings</span>
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 sm:text-lg md:mt-4">
          Configure your email settings and customize email templates for invoices.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Gmail Configuration */}
            <div className="brand-card overflow-hidden">
              <div className="px-4 py-5 bg-gray-50 border-b border-gray-200 sm:px-6">
                <h2 className="text-xl font-semibold text-gray-900">Gmail Configuration</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Configure your Gmail account for sending invoices.
                </p>
              </div>
              
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <div>
                  <label htmlFor="email" className="brand-label">
                    Gmail Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={settings.email}
                    onChange={handleChange}
                    className="brand-input"
                    required
                    placeholder="your.email@gmail.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="appPassword" className="brand-label">
                    App Password
                    <span className="ml-2 text-xs text-gray-500">
                      (Generate from Google Account settings)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="appPassword"
                      name="appPassword"
                      value={settings.appPassword}
                      onChange={handleChange}
                      className="brand-input pr-10"
                      required
                      placeholder="16-character app password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    <a 
                      href="https://support.google.com/accounts/answer/185833" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      Learn how to generate an App Password
                    </a>
                  </p>
                </div>

                <div>
                  <label htmlFor="senderName" className="brand-label">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    id="senderName"
                    name="senderName"
                    value={settings.senderName}
                    onChange={handleChange}
                    className="brand-input"
                    required
                    placeholder="Your Name"
                  />
                </div>

                <div>
                  <label htmlFor="companyName" className="brand-label">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={settings.companyName}
                    onChange={handleChange}
                    className="brand-input"
                    required
                    placeholder="Your Company Name"
                  />
                </div>
              </div>
            </div>

            {/* Email Templates */}
            <div className="brand-card overflow-hidden">
              <div className="px-4 py-5 bg-gray-50 border-b border-gray-200 sm:px-6">
                <h2 className="text-xl font-semibold text-gray-900">Email Templates</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Customize your default email templates for invoices.
                </p>
              </div>
              
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <div>
                  <label htmlFor="defaultSubjectTemplate" className="brand-label">
                    Default Subject Template
                  </label>
                  <input
                    type="text"
                    id="defaultSubjectTemplate"
                    name="defaultSubjectTemplate"
                    value={settings.defaultSubjectTemplate}
                    onChange={handleChange}
                    className="brand-input"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Available variables: {'{{'}invoiceNumber{'}}'}, {'{{'}vendorName{'}}'}, {'{{'}invoiceDate{'}}'}, {'{{'}amount{'}}'}, {'{{'}companyName{'}}'}, {'{{'}serviceDescription{'}}'}
                  </p>
                </div>
                
                <div>
                  <label htmlFor="defaultMessageTemplate" className="brand-label">
                    Default Message Template
                  </label>
                  <textarea
                    id="defaultMessageTemplate"
                    name="defaultMessageTemplate"
                    value={settings.defaultMessageTemplate}
                    onChange={handleChange}
                    rows="10"
                    className="brand-input"
                    required
                  ></textarea>
                  <p className="mt-2 text-sm text-gray-500">
                    Available variables: {'{{'}invoiceNumber{'}}'}, {'{{'}vendorName{'}}'}, {'{{'}invoiceDate{'}}'}, {'{{'}amount{'}}'}, {'{{'}companyName{'}}'}, {'{{'}serviceDescription{'}}'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="brand-button-secondary"
              >
                Back to Invoice
              </button>
              
              <div className="space-x-4">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={isTesting || !isConfigured}
                  className="brand-button-secondary"
                >
                  {isTesting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </button>
                
                <button
                  type="submit"
                  className="brand-button"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Help Panel */}
        <div className="lg:col-span-1">
          <div className="brand-card overflow-hidden">
            <div className="px-4 py-5 bg-gray-50 border-b border-gray-200 sm:px-6">
              <h2 className="text-xl font-semibold text-gray-900">Setup Guide</h2>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">1. Gmail Setup</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You'll need to generate an App Password from your Google Account to use Gmail for sending invoices.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900">2. App Password</h3>
                  <ol className="mt-2 text-sm text-gray-500 list-decimal list-inside space-y-1">
                    <li>Go to your Google Account settings</li>
                    <li>Navigate to Security</li>
                    <li>Enable 2-Step Verification if not already enabled</li>
                    <li>Generate an App Password for 'Mail'</li>
                    <li>Copy the 16-character password</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900">3. Templates</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Customize your email templates using variables enclosed in double curly braces, e.g., {'{{'}invoiceNumber{'}}'}.
                  </p>
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Need Help?</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          If you're having trouble setting up your email, please refer to our{' '}
                          <a href="#" className="font-medium underline">documentation</a>
                          {' '}or contact support.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {testStatus && (
                  <div className={`mt-4 p-4 rounded-md ${
                    testStatus === 'success' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex">
                      <div className="flex-shrink-0">
                        {testStatus === 'success' ? (
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className={`text-sm font-medium ${
                          testStatus === 'success' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {testStatus === 'success' 
                            ? 'Email test successful!' 
                            : 'Email test failed'}
                        </h3>
                        <div className={`mt-2 text-sm ${
                          testStatus === 'success' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          <p>
                            {testStatus === 'success'
                              ? 'Your email settings are working correctly.'
                              : 'Please check your email settings and try again.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings; 