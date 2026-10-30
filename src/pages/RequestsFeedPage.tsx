import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertCircle, 
  MapPin, 
  Clock, 
  PhoneCall, 
  Share2, 
  Filter, 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { MOCK_REQUESTS } from '../data/mockData';
import { BloodGroup, BloodRequest, UrgencyLevel } from '../types';
import { ShareModal } from '../components/ShareModal';

export const RequestsFeedPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [shareTarget, setShareTarget] = useState<BloodRequest | null>(null);

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const filteredRequests = useMemo(() => {
    return MOCK_REQUESTS.filter(r => {
      if (selectedGroup && r.blood_group !== selectedGroup) return false;
      if (selectedUrgency && r.urgency !== selectedUrgency) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesPatient = r.patient_name.toLowerCase().includes(query);
        const matchesHospital = r.hospital.toLowerCase().includes(query);
        const matchesDistrict = r.district.toLowerCase().includes(query);
        if (!matchesPatient && !matchesHospital && !matchesDistrict) return false;
      }
      return true;
    });
  }, [selectedGroup, selectedUrgency, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-100 text-blood-700 dark:bg-blood-950 dark:text-blood-300 text-xs font-bold mb-2">
            <span className="w-2 h-2 rounded-full bg-blood-500 animate-ping" />
            <span>{lang === 'bn' ? 'লাইভ রক্তের আবেদন তালিকা' : 'Live Emergency Blood Feed'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            {t('urgent.title')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t('urgent.subtitle')}
          </p>
        </div>

        <Link
          to="/request-blood"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blood-600 hover:bg-blood-700 text-white font-bold text-sm shadow-md shadow-blood-500/20 shrink-0 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('btn.request_blood')}</span>
        </Link>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Blood Groups Selector Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedGroup('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              !selectedGroup 
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent' 
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {lang === 'bn' ? 'সকল গ্রুপ' : 'All Groups'}
          </button>
          {bloodGroups.map((bg) => (
            <button
              key={bg}
              onClick={() => setSelectedGroup(selectedGroup === bg ? '' : bg)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black border transition-colors ${
                selectedGroup === bg
                  ? 'bg-blood-600 text-white border-blood-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blood-400'
              }`}
            >
              {bg}
            </button>
          ))}
        </div>

        {/* Search Bar & Urgency Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'হাসপাতাল বা রোগীর নাম দিয়ে খুঁজুন...' : 'Search by patient or hospital...'}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blood-500"
            />
          </div>

          <div>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blood-500"
            >
              <option value="">{lang === 'bn' ? 'সকল জরুরিত্ব' : 'All Urgency Levels'}</option>
              <option value="critical">{t('urgent.urgency.critical')}</option>
              <option value="urgent">{t('urgent.urgency.urgent')}</option>
              <option value="standard">{t('urgent.urgency.standard')}</option>
            </select>
          </div>
        </div>

      </div>

      {/* Requests Feed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.map((req) => (
          <div
            key={req.id}
            id={req.id}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-1.5 rounded-2xl bg-blood-600 text-white font-black text-base shadow-sm">
                  {req.blood_group} ({req.units} {lang === 'bn' ? 'ব্যাগ' : 'units'})
                </span>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    req.urgency === 'critical'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      : req.urgency === 'urgent'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  }`}>
                    {req.urgency === 'critical' ? t('urgent.urgency.critical') : t('urgent.urgency.urgent')}
                  </span>

                  {req.status === 'donor_found' && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {lang === 'bn' ? 'দাতা পাওয়া গেছে' : 'Donor Found'}
                    </span>
                  )}
                </div>
              </div>

              {/* Patient Details */}
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {req.patient_name}
                </h3>
                <div className="space-y-1.5 mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blood-500 shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{req.hospital}</span>
                  </div>
                  {req.location_details && (
                    <p className="text-xs text-slate-500 pl-6">
                      {req.location_details}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pl-0.5">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      {t('urgent.date')}{' '}
                      <strong className="text-slate-800 dark:text-slate-200">{req.needed_date}</strong>
                      {req.needed_time && ` (${req.needed_time})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medical Reason */}
              {req.medical_reason && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold text-slate-700 dark:text-slate-200 block mb-0.5">
                    {lang === 'bn' ? 'চিকিৎসাজনিত কারণ:' : 'Reason:'}
                  </span>
                  {req.medical_reason}
                </div>
              )}

              {/* Contact Person */}
              <div className="text-xs text-slate-500">
                <span className="block font-medium">{lang === 'bn' ? 'যোগাযোগের দায়িত্বপ্রাপ্ত:' : 'Contact:'}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {req.contact_name}
                </span>
              </div>

            </div>

            {/* Action Bar: Call / Share */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <a
                href={`tel:${req.contact_phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{t('btn.call_now')}</span>
              </a>

              <button
                onClick={() => setShareTarget(req)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Share Request"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 p-8">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">
            {t('urgent.no_requests')}
          </p>
          <Link
            to="/request-blood"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blood-600 text-white font-bold text-xs shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('btn.request_blood')}</span>
          </Link>
        </div>
      )}

      {/* Share Modal Dialog */}
      <ShareModal request={shareTarget} onClose={() => setShareTarget(null)} />

    </div>
  );
};

