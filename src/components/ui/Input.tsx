import { forwardRef } from 'react';
import FormField from '@cloudscape-design/components/form-field';
import CloudscapeInput from '@cloudscape-design/components/input';

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
      <FormField
        label={label}
        errorText={error}
      >
        <CloudscapeInput
          value={value}
          onChange={({ detail }) => onChange?.(detail.value)}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          inputMode={type === 'number' ? 'numeric' : undefined}
        />
      </FormField>
    );
  }
);

Input.displayName = 'Input';

export default Input;
