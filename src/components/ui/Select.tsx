import React from 'react';
import FormField from '@cloudscape-design/components/form-field';
import CloudscapeSelect from '@cloudscape-design/components/select';

interface SelectProps {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  value = '',
  onChange,
  placeholder,
  disabled,
  className = '',
}) => {
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <FormField
      label={label}
      errorText={error}
    >
      <CloudscapeSelect
        selectedOption={selectedOption ? { label: selectedOption.label, value: selectedOption.value } : null}
        onChange={({ detail }) => onChange?.(detail.selectedOption.value || '')}
        options={options.map(opt => ({ label: opt.label, value: opt.value }))}
        placeholder={placeholder}
        disabled={disabled}
      />
    </FormField>
  );
};
