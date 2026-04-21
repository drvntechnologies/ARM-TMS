import { forwardRef } from 'react';

interface InputProps {
  label?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, value = '', onChange, type = 'text', required, disabled, placeholder, className = '' }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
            error ? 'border-red-400' : 'border-gray-300'
          } ${disabled ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
        />
        {error && <p className="text-[10px] text-red-600 mt-0.5">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
