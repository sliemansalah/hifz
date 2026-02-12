'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; color: string; icon: string }> = {
  success: {
    bg: 'var(--color-emerald-50)',
    border: 'var(--color-emerald-400)',
    color: 'var(--color-emerald-800)',
    icon: '✓',
  },
  error: {
    bg: '#fef2f2',
    border: '#f87171',
    color: '#991b1b',
    icon: '✕',
  },
  info: {
    bg: 'var(--bg-card)',
    border: 'var(--border-color)',
    color: 'var(--text-primary)',
    icon: 'ℹ',
  },
  warning: {
    bg: 'var(--color-gold-50)',
    border: 'var(--color-gold-400)',
    color: 'var(--color-gold-800)',
    icon: '⚠',
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const [exiting, setExiting] = useState(false);
  const style = TOAST_STYLES[toast.type];

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), toast.duration - 300);
    const removeTimer = setTimeout(() => onRemove(toast.id), toast.duration);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={exiting ? 'animate-slide-up' : 'animate-slide-down'}
      style={{
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        color: style.color,
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        minWidth: '250px',
        maxWidth: '400px',
        fontSize: '0.875rem',
        fontWeight: 500,
      }}
    >
      <span style={{ fontSize: '1rem', fontWeight: 700 }}>{style.icon}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{ opacity: 0.5, cursor: 'pointer', background: 'none', border: 'none', color: 'inherit', fontSize: '1rem' }}
      >
        ✕
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = ++nextId;
    setToasts(prev => {
      const next = [...prev, { id, message, type, duration }];
      return next.slice(-3); // max 3 visible
    });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
