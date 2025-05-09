import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InvoiceForm from '../components/InvoiceForm';

describe('InvoiceForm', () => {
  test('renders form fields', () => {
    render(<InvoiceForm />);
    
    // Check if important form fields are rendered
    expect(screen.getByLabelText(/vendor name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gstn/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/invoice number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/base amount/i)).toBeInTheDocument();
  });

  test('calculates taxes correctly for CGST+SGST', () => {
    render(<InvoiceForm />);
    
    // Input base amount
    const baseAmountInput = screen.getByLabelText(/base amount/i);
    fireEvent.change(baseAmountInput, { target: { value: '1000' } });
    
    // Check tax calculations (9% each for CGST and SGST)
    expect(screen.getByLabelText(/cgst amount/i)).toHaveValue('90.00');
    expect(screen.getByLabelText(/sgst amount/i)).toHaveValue('90.00');
  });

  test('calculates taxes correctly for IGST', () => {
    render(<InvoiceForm />);
    
    // Input base amount and toggle IGST
    const baseAmountInput = screen.getByLabelText(/base amount/i);
    const igstCheckbox = screen.getByLabelText(/apply igst/i);
    
    fireEvent.change(baseAmountInput, { target: { value: '1000' } });
    fireEvent.click(igstCheckbox);
    
    // Check IGST calculation (18%)
    expect(screen.getByLabelText(/igst amount/i)).toHaveValue('180.00');
  });

  test('generates invoice preview on form submission', () => {
    render(<InvoiceForm />);
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/vendor name/i), { target: { value: 'Test Vendor' } });
    fireEvent.change(screen.getByLabelText(/gstn/i), { target: { value: '12ABCDE1234F1Z5' } });
    fireEvent.change(screen.getByLabelText(/invoice number/i), { target: { value: 'INV001' } });
    fireEvent.change(screen.getByLabelText(/base amount/i), { target: { value: '1000' } });
    
    // Submit form
    fireEvent.click(screen.getByText(/generate invoice/i));
    
    // Check if preview is shown
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
}); 