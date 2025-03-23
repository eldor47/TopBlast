import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1e1e1e',
          padding: '20px',
          borderRadius: '10px',
          maxWidth: '90%',
          width: '400px',
          position: 'relative',
          boxShadow: '0 0 20px rgba(25, 147, 127, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2
            style={{
              marginTop: 0,
              marginBottom: '15px',
              color: '#19937f',
              fontSize: '1.5rem',
            }}
          >
            {title}
          </h2>
        )}
        {children}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '1.5rem',
            padding: '5px',
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
} 