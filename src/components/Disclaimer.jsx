import { useState } from 'react';

export default function Disclaimer({ onAccept }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm"></div>
      <div className="relative bg-surface-container-low w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-outline-variant/20">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-error text-3xl">warning</span>
          </div>
          <h3 className="text-2xl font-bold text-on-surface mb-4">Medical Disclaimer</h3>
          <p className="text-on-surface-variant leading-relaxed mb-8">
            This tool analyzes drug interactions for informational purposes only. It does not replace medical advice. Always consult your doctor or pharmacist before changing your medication regimen.
          </p>
          <button 
            onClick={onAccept}
            className="w-full bg-primary hover:opacity-90 text-on-primary font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-lg shadow-primary/20 transform hover:-translate-y-0.5 active:scale-95"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}
