export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    requirements: {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    },
    message: password.length < minLength 
      ? `Password must be at least ${minLength} characters long`
      : !hasUpperCase 
        ? 'Password must contain at least one uppercase letter'
        : !hasLowerCase
          ? 'Password must contain at least one lowercase letter'
          : !hasNumbers
            ? 'Password must contain at least one number'
            : 'Password is valid'
  };
};

export const validateCGPA = (cgpa) => {
  const num = parseFloat(cgpa);
  return !isNaN(num) && num >= 0.0 && num <= 4.0;
};

export const validateRegistrationNumber = (regNum) => {
  const patterns = [
    /^[A-Z]{3}-\d{2}-\d{4}$/,  
    /^F\d{4}-[A-Z]{2}-\d{3}$/, 
    /^BSE\d{6}$/,             
    /^[A-Z]{2}\d{2}[A-Z]{2}\d{3}$/ 
  ];
  
  return patterns.some(pattern => pattern.test(regNum));
};

export const validateForm = (formData, formType) => {
  const errors = {};
  
  switch (formType) {
    case 'registration':
      if (!formData.name?.trim()) errors.name = 'Name is required';
      if (!validateEmail(formData.email)) errors.email = 'Valid email is required';
      if (!validatePassword(formData.password).isValid) errors.password = validatePassword(formData.password).message;
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
      break;
      
    case 'login':
      if (!validateEmail(formData.email)) errors.email = 'Valid email is required';
      if (!formData.password) errors.password = 'Password is required';
      break;
      
    case 'studentProfile':
      if (!formData.department?.trim()) errors.department = 'Department is required';
      if (!validateCGPA(formData.cgpa)) errors.cgpa = 'CGPA must be between 0.0 and 4.0';
      if (!formData.semester || formData.semester < 1 || formData.semester > 8) errors.semester = 'Semester must be 1-8';
      if (formData.semester >= 6 && !formData.areaOfInterest?.trim()) errors.areaOfInterest = 'Area of interest is required for 6th semester and above';
      break;
      
    case 'passwordChange':
      if (!formData.currentPassword) errors.currentPassword = 'Current password is required';
      if (!validatePassword(formData.newPassword).isValid) errors.newPassword = validatePassword(formData.newPassword).message;
      if (formData.newPassword !== formData.confirmPassword) errors.confirmPassword = 'New passwords do not match';
      break;
      
    default:
      break;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};