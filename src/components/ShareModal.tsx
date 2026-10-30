import React, { useState } from 'react';
import { X, Copy, Check, MessageSquare, Facebook, Share2 } from 'lucide-react';
import { BloodRequest } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ShareModalProps {
  request: BloodRequest | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ request, onClose }) => {
  const { lang } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!request) return null;

  const currentUrl = window.location.origin + '/requests#' + request.id;

  const shareText = lang === 'bn'
    ? `🚨 জরুরি রক্তের আবেদন! 🚨
রক্তের গ্রুপ: ${request.blood_group} (${request.units} ব্যাগ)
রোগী: ${request.patient_name}
হাসপাতাল: ${request.hospital} (${request.district})
প্রয়োজনের তারিখ: ${request.needed_date} ${request.needed_time ? `(${request.needed_time})` : ''}
জরুরিত্ব: ${request.urgency === 'critical' ? 'অতি জরুরি (Critical)' : 'জরুরি'}
রোগীর কারণ: ${request.medical_reason || 'চিকিৎসাধীন'}
যোগাযোগ: ${request.contact_name} - ${request.contact_phone}
রক্ত দিয়ে জীবন বাঁচান।
প্ল্যাটফর্ম: যশোর মেডিকেল কলেজ রক্তদান ফোরাম
বিস্তারিত: ${currentUrl}`
    : `🚨 EMERGENCY BLOOD REQUEST! 🚨
Blood Group: ${request.blood_group} (${request.units} unit/s)
Patient: ${request.patient_name}
Hospital: ${request.hospital} (${request.district})
Needed Date: ${request.needed_date}
Urgency: ${request.urgency.toUpperCase()}
Contact: ${request.contact_name} - ${request.contact_phone}
Run by Jashore Medical College Students
Details: ${currentUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: `Emergency ${request.blood_group} Blood Needed`,
        text: shareText,
        url: currentUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blood-100 dark:bg-blood-950/60 text-blood-600 dark:text-blood-400 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                {lang === 'bn' ? 'জরুরি রক্তের আবেদন শেয়ার করুন' : 'Share Urgent Blood Request'}
              </h3>
              <p className="text-xs text-slate-500">
                {request.blood_group} &bull; {request.hospital}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formatted Message Preview */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono whitespace-pre-line text-slate-800 dark:text-slate-300 max-h-56 overflow-y-auto">
          {shareText}
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={shareWhatsApp}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={shareFacebook}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
          >
            <Facebook className="w-4 h-4" />
            <span>Facebook</span>
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-colors border ${
              copied
                ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-600'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'কপি করুন' : 'Copy Text')}</span>
          </button>
        </div>

        {typeof navigator.share === 'function' && (
          <button
            onClick={shareNative}
            className="w-full py-2.5 rounded-xl border border-dashed border-blood-400 text-blood-600 dark:text-blood-400 text-xs font-bold hover:bg-blood-50 dark:hover:bg-blood-950/40"
          >
            {lang === 'bn' ? 'ফোনের অন্যান্য অ্যাপে শেয়ার করুন' : 'Share via phone apps'}
          </button>
        )}
      </div>
    </div>
  );
};

