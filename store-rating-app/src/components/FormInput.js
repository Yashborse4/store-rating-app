import React from 'react';
import './FormInput.css';

const FormInput = ({
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  error,
  required = false,
  maxLength,
  rows,
  disabled = false
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const inputProps = {
    id,
    name,
    value: value || '',
    onChange: handleChange,
    placeholder,
    required,
    disabled,
    className: `form-control ${error ? 'is-invalid' : ''}`,
    'aria-describedby': error ? `${id}-error` : undefined,
    'aria-invalid': error ? 'true' : 'false'
  };

  if (maxLength) {
    inputProps.maxLength = maxLength;
  }

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="required-asterisk">*</span>}
        </label>
      )}
      
      {type === 'textarea' ? (
        <textarea
          {...inputProps}
          rows={rows || 4}
        />
      ) : (
        <input
          {...inputProps}
          type={type}
        />
      )}
      
      {error && (
        <div id={`${id}-error`} className="error-message" role="alert">
          {error}
        </div>
      )}
      
      {maxLength && value && (
        <div className="character-count">
          {value.length} / {maxLength}
        </div>
      )}
    </div>
  );
};

export default FormInput;
