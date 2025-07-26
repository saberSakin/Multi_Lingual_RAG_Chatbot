import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  className = '', 
  ...props 
}) => {
  const inputClassName = `input ${className}`.trim();

  if (label) {
    return (
      <div className="form-group">
        <label className="form-label">{label}</label>
        <input className={inputClassName} {...props} />
      </div>
    );
  }

  return <input className={inputClassName} {...props} />;
};