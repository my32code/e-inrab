import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ReactNode } from "react";
import { XCircle } from "lucide-react";

type MyModalProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  children?: ReactNode;
};

export default function MyModal({ isOpen, setIsOpen, children }: MyModalProps) {
  // Désactiver le scroll arrière-plan
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Modal content */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-xl">
              <div className="flex justify-end items-end mb-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-red-500 hover:text-red-700 font-bold text-lg self-start"
                >
                  <XCircle />
                </button>
              </div>

              <div className="mb-4">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
