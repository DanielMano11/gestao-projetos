import React from 'react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error';
  onDismiss?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onDismiss,
}) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
        type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
      }`}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs underline opacity-90 hover:opacity-100"
        >
          Fechar
        </button>
      )}
    </div>
  );
};

