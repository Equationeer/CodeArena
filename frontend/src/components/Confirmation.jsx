import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Delete Problem?</h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Are you sure you want to delete <span className="text-slate-200 font-semibold">"{title}"</span>? This action is permanent and cannot be undone.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl bg-slate-800 text-slate-200 font-semibold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-6 py-3 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;