import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  PhoneCall, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Stethoscope, 
  EyeOff, 
  Award,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { MOCK_DONORS, JASHORE_UPAZILAS, SOUTH_WEST_DISTRICTS } from '../data/mockData';
import { BloodGroup, Profile } from '../types';

export const SearchDonorsPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters from query params or state
  const selectedGroup = searchParams.get('blood_group') || '';
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'now' | 'future'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Helper to calculate days until eligible based on 90-day recovery
  const getEligibility = (lastDateStr?: string | null) => {
    if (!lastDateStr) return { eligible: true, daysLeft: 0 };
    const lastDate = new Date(lastDateStr);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysLeft = 90 - diffDays;
    return {
      eligible: daysLeft <= 0,
      daysLeft: daysLeft > 0 ? daysLeft : 0,
    };
  };

  // Filtered Donors
  const filteredDonors = useMemo(() => {
    return MOCK_DONORS.filter(donor => {
      // 1. Blood group
      if (selectedGroup && donor.blood_group !== selectedGroup) return false;

      // 2. District
      if (selectedDistrict && !donor.district.toLowerCase().includes(selectedDistrict.toLowerCase())) return false;

      // 3. Upazila
      if (selectedUpazila && !donor.upazila.toLowerCase().includes(selectedUpazila.split(' ')[0].toLowerCase())) return false;

      // 4. Eligibility
      const { eligible } = getEligibility(donor.last_donation_date);
      if (availabilityFilter === 'now' && !eligible) return false;
      if (availabilityFilter === 'future' && eligible) return false;

      // 5. Keyword search (Name, Phone, Unit)
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = donor.full_name.toLowerCase().includes(term);
        const matchesUnit = (donor.medical_college_unit || '').toLowerCase().includes(term);
        const matchesPhone = donor.phone.includes(term);
        if (!matchesName && !matchesUnit && !matchesPhone) return false;
      }

      return true;
    });
  }, [selectedGroup, selectedDistrict, selectedUpazila, availabilityFilter, searchTerm]);

  const handleGroupClick = (group: string) => {
    if (selectedGroup === group) {
      searchParams.delete('blood_group');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ blood_group: group });
    }
  };

  const resetFilters = () => {
    setSearchParams({});
    setSelectedDistrict('');
    setSelectedUpazila('');
    setAvailabilityFilter('all');
    setSearchTerm('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Title & Search Header */}
      <div className="space-y-3 text-center sm:text-left">
        <span className="text-xs font-bold text-blood-600 dark:text-blood-400 uppercase tracking-widest">
          {lang === 'bn' ? 'যশোর ও খুলনা বিভাগের ডেটাবেজ' : 'Jashore & Greater Khulna Database'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('search.title')}
        </h1>
        <p className="text-sm text-slate-500 max-w-2xl">
          {t('search.subtitle')}
        </p>
      </div>

      {/* Filter Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Blood Group Selector Buttons */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
            {t('search.filter_group')}
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                onClick={() => handleGroupClick(bg)}
                className={`py-3 rounded-2xl font-black text-sm transition-all border ${
                  selectedGroup === bg
                    ? 'bg-blood-600 border-blood-600 text-white shadow-md shadow-blood-500/30'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blood-400'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdowns & Search Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Keyword Search */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">
              {lang === 'bn' ? 'নাম বা পরিচয়' : 'Search by Name / Unit'}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: তানভীর, ব্যাচ ১২...' : 'e.g. Tanvir, Batch 11...'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blood-500"
              />
            </div>
          </div>

          {/* District Select */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">
              {t('search.filter_district')}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blood-500"
            >
              <option value="">{lang === 'bn' ? 'সকল জেলা' : 'All Districts'}</option>
              {SOUTH_WEST_DISTRICTS.map((d) => (
                <option key={d} value={d.split(' ')[0]}>{d}</option>
              ))}
            </select>
          </div>

          {/* Upazila Select */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">
              {t('search.filter_upazila')}
            </label>
            <select
              value={selectedUpazila}
              onChange={(e) => setSelectedUpazila(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blood-500"
            >
              <option value="">{lang === 'bn' ? 'সকল উপজেলা' : 'All Upazilas'}</option>
              {JASHORE_UPAZILAS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Availability Status */}
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">
              {t('search.filter_availability')}
            </label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blood-500"
            >
              <option value="all">{t('search.avail_all')}</option>
              <option value="now">{t('search.avail_now')}</option>
              <option value="future">{t('search.avail_soon')}</option>
            </select>
          </div>

        </div>

        {/* Reset Filter Button */}
        {(selectedGroup || selectedDistrict || selectedUpazila || availabilityFilter !== 'all' || searchTerm) && (
          <div className="flex justify-end pt-2">
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-xs font-bold text-blood-600 dark:text-blood-400 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset all filters'}</span>
            </button>
          </div>
        )}

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-500 px-1">
        <span>{filteredDonors.length} {t('search.results_found')}</span>
        <span>
          {selectedGroup && <span className="text-blood-600 font-extrabold mr-2">[{selectedGroup}]</span>}
          {selectedDistrict && <span>{selectedDistrict}</span>}
        </span>
      </div>

      {/* Donors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDonors.map((donor) => {
          const { eligible, daysLeft } = getEligibility(donor.last_donation_date);
          const isPhoneVisible = !donor.phone_hidden || isAdmin;

          return (
            <div
              key={donor.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                
                {/* Header: Blood Group Pill & Availability */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-12 h-12 rounded-2xl bg-blood-600 text-white font-black text-lg flex items-center justify-center shadow-md shadow-blood-500/25">
                      {donor.blood_group}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {donor.full_name}
                      </h3>
                      <span className="text-xs text-blood-600 dark:text-blood-400 font-semibold block">
                        {donor.medical_college_unit || 'General Donor'}
                      </span>
                    </div>
                  </div>

                  {/* Eligibility Status Pill */}
                  {eligible ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>{t('donor.status.available')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{daysLeft} {t('donor.days')}</span>
                    </span>
                  )}
                </div>

                {/* Location & Stats */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{donor.upazila}, {donor.district}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-blood-500 shrink-0" />
                    <span>
                      {t('donor.total_donations')}{' '}
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">{donor.total_donations}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {donor.last_donation_date 
                        ? `${t('donor.last_donated')} ${donor.last_donation_date}`
                        : t('donor.never_donated')}
                    </span>
                  </div>
                </div>

                {/* Donor Note */}
                {donor.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                    "{donor.notes}"
                  </p>
                )}

              </div>

              {/* Action Buttons (Call / WhatsApp / Privacy) */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                {isPhoneVisible ? (
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${donor.phone}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-blood-500" />
                      <span>{lang === 'bn' ? 'কল করুন' : 'Call'}</span>
                    </a>
                    <a
                      href={`https://api.whatsapp.com/send?phone=${donor.phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(
                        lang === 'bn' 
                          ? `আসসালামু আলাইকুম ${donor.full_name}, যশোর মেডিকেল কলেজ রক্তদান ফোরামের মাধ্যমে আপনার রক্তদানের প্রোফাইল দেখে যোগাযোগ করছি।`
                          : `Hello ${donor.full_name}, reaching out via JMC Blood Bond regarding an emergency blood donation.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <EyeOff className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-[11px] font-medium">{lang === 'bn' ? 'নম্বর গোপন রাখা হয়েছে' : 'Phone Hidden'}</span>
                    </div>
                    <a
                      href="tel:+8801725894120"
                      className="text-[11px] font-bold text-blood-600 dark:text-blood-400 hover:underline"
                    >
                      {lang === 'bn' ? 'হেল্পলাইনে বলুন' : 'Call Helpline'}
                    </a>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {filteredDonors.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 p-8">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
            {lang === 'bn' ? 'কোনো রক্তদাতা পাওয়া যায়নি' : 'No donors matched your filters'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {lang === 'bn' 
              ? 'অন্য কোনো রক্তের গ্রুপ বা এলাকা নির্বাচন করুন, অথবা জরুরি রক্তের আবেদন ফর্ম পূরণ করুন।' 
              : 'Try selecting a different blood group or area, or submit an emergency request.'}
          </p>
          <button
            onClick={resetFilters}
            className="px-6 py-2.5 rounded-xl bg-blood-600 text-white font-bold text-xs shadow-md"
          >
            {lang === 'bn' ? 'সকল ফিল্টার রিসেট' : 'Reset Filters'}
          </button>
        </div>
      )}

    </div>
  );
};

