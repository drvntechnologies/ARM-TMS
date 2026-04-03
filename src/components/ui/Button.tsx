import { ReactNode } from 'react';
import CloudscapeButton from '@cloudscape-design/components/button';
import { ButtonProps as CloudscapeButtonProps } from '@cloudscape-design/components/button';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled,
  type = 'button',
  className = '',
}: ButtonProps) {
  const variantMap: Record<string, CloudscapeButtonProps['variant']> = {
    primary: 'primary',
    secondary: 'normal',
    danger: 'primary',
    ghost: 'link',
  };

  return (
    <CloudscapeButton
      variant={variantMap[variant]}
      onClick={onClick}
      disabled={disabled}
      formAction={type === 'submit' ? 'submit' : 'none'}
    >
      {children}
    </CloudscapeButton>
  );
}
