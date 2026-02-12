'use client';

import { useEffect, useRef, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;
    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', trapFocus);
      // Focus the modal after animation
      requestAnimationFrame(() => {
        const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea'
        );
        firstFocusable?.focus();
      });
    } else {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', trapFocus);
      previousFocusRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', trapFocus);
    };
  }, [isOpen, trapFocus]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div ref={modalRef}
           className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl p-6 animate-scale-in"
           style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-2xl leading-none hover:opacity-70 p-1 rounded-lg"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="إغلاق">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}
