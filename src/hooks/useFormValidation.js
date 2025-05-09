import { useState } from 'react';

const useFormValidation = (initialState) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Define required fields explicitly - everything else is optional
  const requiredFields = [
    'Vendor_name',
    'STATE',
    'GSTN',
    'INVOICE_DATE', 
    'BASE_AMOUNT',
    'SERVICE_DESCRIPTION'
  ];

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    
    setTouched({
      ...touched,
      [name]: true,
    });
    
    // Validate on blur
    validateField(name, values[name]);
  };

  const validateField = (name, value) => {
    let errorMessage = '';
    
    // Debug log to check what's happening with validation
    console.log(`Validating field ${name}, value: "${value}", type: ${typeof value}`);
    
    // Check if field is required and empty - handle both null, undefined, and empty string cases
    if (requiredFields.includes(name)) {
      if (value === undefined || value === null || value === '' || 
          (typeof value === 'string' && value.trim() === '')) {
        errorMessage = 'This field is required';
        console.log(`${name} failed required check`);
      }
    }
    
    // GSTIN validation - only if value is provided and not empty
    if (name === 'GSTN' && value && typeof value === 'string' && value.trim() !== '') {
      // Simplified GSTIN validation that accepts common formats
      if (!/^[0-9]{2}[A-Za-z0-9]{10}[A-Za-z0-9]$/.test(value)) {
        errorMessage = 'Please enter a valid GSTIN';
        console.log(`${name} failed format check: ${value}`);
      }
    }
    
    // Invoice number validation (only if provided)
    if (name === 'INVOICE_NO' && value && typeof value === 'string' && value.trim() !== '') {
      if (!/^[A-Za-z0-9-/]{1,16}$/.test(value)) {
        errorMessage = 'Please enter a valid Invoice Number';
        console.log(`${name} failed format check`);
      }
    }
    
    // Base amount validation
    if (name === 'BASE_AMOUNT' && value) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        errorMessage = 'Please enter a valid amount greater than 0';
        console.log(`${name} failed numeric check`);
      }
    }
    
    // Update the errors state
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage,
    }));
    
    return !errorMessage;
  };

  const validateForm = () => {
    console.log("Starting form validation...");
    console.log("Current form data:", values);
    
    let isValid = true;
    
    // First clear all errors
    const newErrors = {};
    
    // Validate all required fields
    for (const field of requiredFields) {
      const value = values[field];
      const valid = validateField(field, value);
      
      if (!valid) {
        console.log(`Validation failed for field: ${field}, value: "${value}"`);
        isValid = false;
      }
    }
    
    // Also validate any non-required fields that have values
    Object.keys(values).forEach(field => {
      if (!requiredFields.includes(field) && values[field]) {
        const valid = validateField(field, values[field]);
        if (!valid) {
          console.log(`Validation failed for optional field: ${field}, value: "${values[field]}"`);
          isValid = false;
        }
      }
    });
    
    console.log(`Form validation result: ${isValid ? 'PASSED' : 'FAILED'}`);
    if (!isValid) {
      console.log("Current errors:", errors);
    }
    
    return isValid;
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
  };
};

export default useFormValidation; 