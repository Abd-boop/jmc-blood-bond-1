import React, { useState } from 'react';
import { Calendar, MapPin, Users, Phone, CheckCircle2, Award, ArrowRight, Stethoscope } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { MOCK_CAMPS } from '../data/mockData';

export const CampsPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const [tab, setTab] = useState<'all' | 'upcoming' | 'completed'>('all');

  const filteredCamps = MOCK_CAMPS.filter(c => {
    if (tab === 'upcoming') return c.status === 'upcoming';
    if (tab === 'completed') return c.status === 'completed';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Page Header */}
      <div className="space-y-3 text-center sm:text-left border-b border-slate-200 dark:border-slate-800 pb-6">
        <span className="text-xs font-bold text-blood-600 dark:text-blood-400 uppercase tracking-widest">
          {lang === 'bn' ? 'স্বেচ্ছাসেবী ক্যাম্পেইন ও কার্যক্রম' : 'Voluntary Blood Drives'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          {t('camps.title')}
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          {t('camps.subtitle')}
        </p>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 pt-2">
          {(['all', 'upcoming', 'completed'] as const).map((tKey) => (
            <button
              key={tKey}
              onClick={() => setTab(tKey)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                tab === tKey
                  ? 'bg-blood-600 border-blood-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {tKey === 'all' && (lang === 'bn' ? 'সকল কর্মসূচি' : 'All Camps')}
              {tKey === 'upcoming' && (lang === 'bn' ? 'আসন্ন কর্মসূচি' : 'Upcoming')}
              {tKey === 'completed' && (lang === 'bn' ? 'সম্পন্ন কর্মসূচি' : 'Completed')}
            </button>
          ))}
        </div>
      </div>

      {/* Camps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCamps.map((camp) => {
          const progress = camp.target_units > 0 ? Math.min(100, Math.round((camp.collected_units / camp.target_units) * 100)) : 0;
          const isCompleted = camp.status === 'completed';

          return (
            <div
              key={camp.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                
                {/* Header Status */}
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  }`}>
                    {isCompleted ? (lang === 'bn' ? 'সফলভাবে সম্পন্ন' : 'Completed') : (lang === 'bn' ? 'আসন্ন কর্মসূচি' : 'Upcoming')}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <Calendar className="w-4 h-4 text-blood-500" />
                    <span>{new Date(camp.start_date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    {lang === 'bn' ? (camp.title_bn || camp.title) : camp.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {camp.description}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blood-500 shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{camp.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-jmc-blue shrink-0" />
                    <span>{camp.organizer}</span>
                  </div>
                </div>

                {/* Progress / Units Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">
                      {isCompleted ? (lang === 'bn' ? 'সংগৃহীত রক্ত:' : 'Collected:') : (lang === 'bn' ? 'লক্ষ্যমাত্রা:' : 'Target:')}
                    </span>
                    <span className="text-slate-900 dark:text-white">
                      {camp.collected_units} / {camp.target_units} {lang === 'bn' ? 'ব্যাগ' : 'units'}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : 'bg-blood-500'}`}
                      style={{ width: `${isCompleted ? 100 : progress}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {camp.contact_person}
                </span>
                <a
                  href={`tel:${camp.contact_phone}`}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blood-50 dark:hover:bg-blood-950 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-blood-500" />
                  <span>{lang === 'bn' ? 'যোগাযোগ' : 'Contact'}</span>
                </a>
              </div>

            </div>
          );
        })}
      </div>

      {/* Host a Camp Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-slate-700">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-black">
            {lang === 'bn' ? 'আপনার প্রতিষ্ঠান বা ক্যাম্পাসে রক্তদান ক্যাম্প করতে চান?' : 'Want to Organize a Camp with JMC?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            {lang === 'bn' 
              ? 'স্কুল, কলেজ, বিশ্ববিদ্যালয় বা সামাজিক সংগঠনের সাথে যৌথভাবে রক্তদান কর্মসূচি পরিচালনায় যশোর মেডিকেল কলেজ ভলান্টিয়ার টিম পূর্ণ সহায়তা প্রদান করে।'
              : 'Our medical students and doctors provide full medical supervision, testing, and certificates for collaborative drives.'}
          </p>
        </div>
        <a
          href="tel:+8801725894120"
          className="px-6 py-3.5 rounded-2xl bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs sm:text-sm shrink-0 shadow-lg"
        >
          {lang === 'bn' ? 'সরাসরি আলোচনা করুন' : 'Inquire Now'}
        </a>
      </div>

    </div>
  );
};

