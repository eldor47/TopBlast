import { useEffect } from 'react';

interface SnackbarProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function Snackbar({ message, isVisible, onClose }: SnackbarProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Hide after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#19937f',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: 1000,
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      {message}
    </div>
  );
} 