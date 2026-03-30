import { useState } from 'react';

export default function Disclaimer({ onAccept }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-[#221810]/60 backdrop-blur-sm"></div>
      <div className="relative bg-white dark:bg-stone-900 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-[#F59E0B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[#F59E0B] text-3xl">info</span>
          </div>
          <h3 className="text-2xl font-bold text-[#221810] dark:text-white mb-4 font-display">Medical Disclaimer</h3>
          <p className="text-[#715550] dark:text-stone-400 leading-relaxed mb-8">
            This tool analyzes drug interactions for informational purposes only. It does not replace medical advice. Always consult your doctor or pharmacist before changing your medication regimen.
          </p>
          <button 
            onClick={onAccept}
            className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-[#F59E0B]/20 transform hover:-translate-y-0.5 active:scale-95"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}
