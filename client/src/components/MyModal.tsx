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
  // Suppression de la gestion du scroll pour permettre le défilement de la page
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Modal content */}
          <div className="absolute inset-0 flex items-start justify-center pt-8">
            <motion.div
              className="w-full max-w-3xl bg-white rounded-lg shadow-xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="relative">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                >
                  <XCircle className="w-6 h-6" />
                </button>

                <div className="max-h-[120vh] overflow-y-auto p-6">
                  {children}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
