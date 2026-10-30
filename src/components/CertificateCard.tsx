import React, { useRef } from 'react';
import { Award, Printer, Download, Droplet, ShieldCheck, Heart } from 'lucide-react';
import { Donation, Profile } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CertificateCardProps {
  donation: Donation;
  donor: Profile;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ donation, donor }) => {
  const { lang } = useLanguage();
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const certId = donation.certificate_id || `JMC-CERT-${donation.id.slice(0, 8).toUpperCase()}`;

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between no-print bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blood-500" />
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            {lang === 'bn' ? 'রক্তদান সম্মাননা সনদপত্র' : 'Blood Donation Certificate'}
          </span>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs shadow-md transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>{lang === 'bn' ? 'প্রিন্ট / PDF সংরক্ষণ' : 'Print / Save as PDF'}</span>
        </button>
      </div>

      {/* The Printable Certificate */}
      <div
        ref={certRef}
        id="printable-certificate"
        className="w-full bg-white text-slate-900 p-8 sm:p-12 rounded-3xl border-8 border-double border-amber-600/60 shadow-2xl relative overflow-hidden print:border-8 print:shadow-none print:m-0 print:p-8"
        style={{ minHeight: '520px' }}
      >
        {/* Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
          <Droplet className="w-[420px] h-[420px] fill-blood-600 text-blood-600" />
        </div>

        {/* Certificate Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-blood-600 text-white flex items-center justify-center shadow-md">
              <Droplet className="w-7 h-7 fill-white" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
            JASHORE MEDICAL COLLEGE
          </h2>
          <p className="text-xs sm:text-sm font-bold text-blood-700 tracking-widest uppercase">
            STUDENTS BLOOD DONATION FORUM &bull; যশোর মেডিকেল কলেজ রক্তদান কেন্দ্র
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
        </div>

        {/* Certificate Title */}
        <div className="text-center my-8 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200">
            CERTIFICATE OF APPRECIATION & LIFE SAVER AWARD
          </span>
          <p className="text-sm text-slate-600 italic mt-4">
            This certificate of honor is proudly presented to
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-blood-700 font-serif my-3 tracking-wide">
            {donor.full_name}
          </h1>
          <p className="text-sm sm:text-base text-slate-700 max-w-xl mx-auto leading-relaxed">
            for the noble and selfless act of voluntary blood donation (Blood Group: <strong className="text-blood-700">{donation.blood_group}</strong>) on{' '}
            <strong>{new Date(donation.donation_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>{' '}
            at <strong>{donation.hospital}</strong>. Your compassion provided a critical lifeline to a patient in need.
          </p>
        </div>

        {/* Bottom Details & Signatures */}
        <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-3 items-end relative z-10 text-xs sm:text-sm">
          {/* Certificate ID & Verification */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Certificate ID</span>
            <span className="font-mono font-bold text-slate-800 text-xs">{certId}</span>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Medical Record</span>
            </div>
          </div>

          {/* Golden Seal */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-500 bg-gradient-to-br from-amber-100 to-amber-200 flex flex-col items-center justify-center text-amber-800 shadow-inner p-1 text-center">
              <Award className="w-6 h-6 text-amber-700 mb-0.5" />
              <span className="text-[8px] font-black uppercase tracking-tighter leading-none">JMC BLOOD</span>
              <span className="text-[7px] font-bold text-amber-900 leading-none">OFFICIAL SEAL</span>
            </div>
          </div>

          {/* Signature */}
          <div className="text-right space-y-1">
            <div className="h-9 flex items-end justify-end">
              <span className="font-serif italic text-sm text-slate-800 border-b border-slate-400 px-4 pb-1">
                Dr. Tanvir Ahmed
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-800">Convener & Medical Coordinator</p>
            <p className="text-[10px] text-slate-500">Jashore Medical College Students Association</p>
          </div>
        </div>

      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible;
          }
          #printable-certificate {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

