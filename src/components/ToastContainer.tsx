import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ToastItem } from '../types/task';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = {
            success: {
              wrapper: 'bg-white border-green-200 text-slate-900',
              icon: <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" aria-hidden="true" />,
            },
            error: {
              wrapper: 'bg-white border-red-200 text-slate-900',
              icon: <AlertCircle className="h-4 w-4 text-red-600 shrink-0" aria-hidden="true" />,
            },
            info: {
              wrapper: 'bg-white border-slate-200 text-slate-900',
              icon: <Info className="h-4 w-4 text-blue-600 shrink-0" aria-hidden="true" />,
            },
          }[toast.type];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-lg ${styles.wrapper}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {styles.icon}
                <p className="text-sm font-medium leading-snug">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
