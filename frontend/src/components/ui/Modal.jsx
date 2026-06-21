import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { PrimaryButton, SecondaryButton, DangerButton } from './Button';
import { createPortal } from 'react-dom';

/* ── Base modal ──────────────────────────────────────────── */
export const Modal = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  className = '',
}) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (open) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={`relative glass rounded-2xl p-6 w-full shadow-2xl ${sizes[size] ?? sizes.md} ${className}`}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {(title || showClose) && (
              <div className="flex items-center justify-between mb-5">
                {title && <h2 className="text-lg font-bold text-foreground">{title}</h2>}
                {showClose && (
                  <button
                    onClick={onClose}
                    className="text-subtle hover:text-white transition-colors ml-auto"
                    aria-label="Close modal"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

/* ── Confirm modal ───────────────────────────────────────── */
export const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => (
  <Modal open={open} onClose={onClose} size="sm" showClose={false}>
    <div className="flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center border border-danger/20">
        <AlertTriangle size={26} className="text-danger" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1.5">{title}</h3>
        <p className="text-sm text-muted">{message}</p>
      </div>
      <div className="flex gap-3 w-full mt-2">
        <SecondaryButton className="flex-1" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </SecondaryButton>
        <DangerButton className="flex-1" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </DangerButton>
      </div>
    </div>
  </Modal>
);
