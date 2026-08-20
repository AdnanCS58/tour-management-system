'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiX, FiSmartphone } from 'react-icons/fi';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-96 z-50"
        >
          <div className="bg-[#121816] border border-emerald-600/30 rounded-2xl p-6 shadow-2xl backdrop-blur-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <FiSmartphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#e8f0eb]">Install TripTribe</h3>
                  <p className="text-sm text-[#6b7a72]">Add to home screen for better experience</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-[#6b7a72] hover:text-[#e8f0eb] transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-500 transition flex items-center justify-center"
              >
                <FiDownload className="mr-2" />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="flex-1 bg-[#1a211e] text-[#a0b0a8] py-2 rounded-lg hover:bg-[#222a26] transition"
              >
                Not Now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}