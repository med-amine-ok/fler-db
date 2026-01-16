import { useEffect,  useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Sheet = ({ isOpen, onClose, title, children }: SheetProps) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  if (!isOpen && !isClosing) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none sticky-bottom-safe">
      {/* Backdrop */}
      <div 
        className={clsx(
          "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto",
          isOpen && !isClosing ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div 
        className={clsx(
          "relative w-full bg-white rounded-t-3xl shadow-2xl p-6 pointer-events-auto transition-transform duration-300 max-h-[85vh] overflow-y-auto flex flex-col",
          isOpen && !isClosing ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0" />
        
        {title && (
            <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                 <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full">
                     <X size={18} />
                 </button>
            </div>
        )}

        <div className="flex-1 overflow-y-auto">
             {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
