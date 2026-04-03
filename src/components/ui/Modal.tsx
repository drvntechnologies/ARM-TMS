import { ReactNode } from 'react';
import CloudscapeModal from '@cloudscape-design/components/modal';
import Box from '@cloudscape-design/components/box';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const sizeMap: Record<string, 'small' | 'medium' | 'large' | 'max'> = {
    sm: 'small',
    md: 'medium',
    lg: 'large',
    xl: 'max',
  };

  return (
    <CloudscapeModal
      visible={isOpen}
      onDismiss={onClose}
      header={title}
      size={sizeMap[size]}
    >
      <Box>
        {children}
      </Box>
    </CloudscapeModal>
  );
}
