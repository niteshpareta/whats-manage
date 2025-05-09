import React, { useState, useEffect } from 'react';

const PaymentModal = ({ isOpen, onClose, invoice, onSavePayment }) => {
  const [paymentDetails, setPaymentDetails] = useState({
    status: 'paid',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentReference: '',
    paymentType: 'bank_transfer',
    notes: ''
  });

  // Initialize with existing data if available
  useEffect(() => {
    if (invoice && invoice.paymentDetails) {
      setPaymentDetails({
        status: invoice.status || 'paid',
        paymentDate: invoice.paymentDetails.paymentDate || new Date().toISOString().split('T')[0],
        paymentReference: invoice.paymentDetails.paymentReference || '',
        paymentType: invoice.paymentDetails.paymentType || 'bank_transfer',
        notes: invoice.paymentDetails.notes || ''
      });
    }
  }, [invoice]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSavePayment(paymentDetails);
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Record Payment for Invoice #{invoice?.invoiceNumber}
                </h3>
                <div className="mt-4">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                          Payment Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          value={paymentDetails.status}
                          onChange={handleChange}
                        >
                          <option value="paid">Paid</option>
                          <option value="partial">Partially Paid</option>
                          <option value="unpaid">Unpaid</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
                          Payment Date
                        </label>
                        <input
                          type="date"
                          name="paymentDate"
                          id="paymentDate"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          value={paymentDetails.paymentDate}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label htmlFor="paymentReference" className="block text-sm font-medium text-gray-700">
                          Payment Reference
                        </label>
                        <input
                          type="text"
                          name="paymentReference"
                          id="paymentReference"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="e.g., UTR number, Cheque number"
                          value={paymentDetails.paymentReference}
                          onChange={handleChange}
                        />
                      </div>

                      <div>
                        <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700">
                          Payment Type
                        </label>
                        <select
                          id="paymentType"
                          name="paymentType"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          value={paymentDetails.paymentType}
                          onChange={handleChange}
                        >
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="cash">Cash</option>
                          <option value="cheque">Cheque</option>
                          <option value="upi">UPI</option>
                          <option value="online">Online Payment</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          rows="3"
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="Additional payment details"
                          value={paymentDetails.notes}
                          onChange={handleChange}
                        ></textarea>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => onSavePayment(paymentDetails)}
            >
              Save Payment Details
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 