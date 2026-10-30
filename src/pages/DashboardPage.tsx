import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  User, 
  Award, 
  Clock, 
  Heart, 
  ShieldCheck, 
  Printer, 
  Calendar, 
  Plus, 
  EyeOff, 
  Eye, 
  MapPin, 
  CheckCircle2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { MOCK_DONATIONS, INITIAL_BADGES } from '../data/mockData';
import { Donation } from '../types';
import { CertificateCard } from '../components/CertificateCard';

export const DashboardPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { profile, isEligible, daysUntilEligible, updateProfile } = useAuth();

  const [donations, setDonations] = useState<Donation[]>(MOCK_DONATIONS);
  const [selectedCertDonation, setSelectedCertDonation] = useState<Donation | null>(null);

  // Form for logging a new donation
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newHospital, setNewHospital] = useState('250 Bed General Hospital, Jashore');
  const [newPatient, setNewPatient] = useState('');

  // Trigger celebration confetti if eligible
  React.useEffect(() => {
    if (isEligible) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#e11d48', '#fda4af', '#fb7185'],
        });
      } catch (_) {}
    }
  }, [isEligible]);

  if (!profile) {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-4">
        <p className="text-slate-500">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  const handleTogglePrivacy = async () => {
    await updateProfile({ phone_hidden: !profile.phone_hidden });
  };

  const handleToggleAvailability = async () => {
    await updateProfile({ is_available: !profile.is_available });
  };

  const handleAddDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const newDonation: Donation = {
      id: 'don-' + Date.now(),
      donor_id: profile.id,
      donation_date: newDate,
      patient_name: newPatient || 'Emergency Patient',
      hospital: newHospital,
      blood_group: profile.blood_group,
      units: 1,
      certificate_id: `JMC-CERT-${newDate.replace(/-/g, '')}-${profile.blood_group.replace('+', 'P').replace('-', 'N')}`,
      verified_by_admin: true,
      created_at: new Date().toISOString(),
    };

    setDonations([newDonation, ...donations]);
    updateProfile({
      last_donation_date: newDate,
      total_donations: (profile.total_donations || 0) + 1,
    });
    setShowAddModal(false);
    setNewPatient('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blood-700 via-blood-600 to-rose-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-center sm:text-left z-10">
          <span className="text-xs uppercase font-extrabold text-rose-200 tracking-wider">
            {profile.medical_college_unit || 'JMC Blood Donor'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-black">
            {t('dash.welcome')} {profile.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-rose-100 max-w-xl">
            {lang === 'bn' 
              ? 'আপনার রক্তদানের তথ্য, সম্মাননা সনদপত্র ও পরবর্তী রক্তদানের যোগ্যতা স্থিতি এক নজরে।' 
              : 'Track your recovery window, milestone badges, and verified donor certificates.'}
          </p>
        </div>

        {/* Blood Group Badge & Quick Actions */}
        <div className="flex items-center gap-4 z-10 shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white text-blood-600 flex flex-col items-center justify-center font-black shadow-lg">
            <span className="text-xl sm:text-2xl leading-none">{profile.blood_group}</span>
            <span className="text-[10px] uppercase font-bold text-slate-500 mt-1">GROUP</span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/20 hover:bg-white text-white hover:text-blood-700 font-bold text-xs sm:text-sm transition-all border border-white/30 backdrop-blur-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t('dash.add_donation')}</span>
          </button>
        </div>
      </div>

      {/* 2. Eligibility & Privacy Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Eligibility Card */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-4 lg:col-span-2 flex flex-col justify-between ${
          isEligible
            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
            : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
        }`}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isEligible 
                  ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200' 
                  : 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200'
              }`}>
                {t('dash.eligibility_title')}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                {lang === 'bn' ? '৯০ দিনের স্ট্যান্ডার্ড রিকভারি ব্যবধান' : '90-Day Standard Gap'}
              </span>
            </div>

            <div className="flex items-start gap-4 pt-2">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
                isEligible ? 'bg-emerald-600 shadow-emerald-500/25' : 'bg-amber-600 shadow-amber-500/25'
              }`}>
                {isEligible ? <CheckCircle2 className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {isEligible ? t('dash.eligible_now') : `${t('dash.eligible_soon')} ${daysUntilEligible} ${t('donor.days')}`}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {profile.last_donation_date 
                    ? `${t('donor.last_donated')} ${profile.last_donation_date}`
                    : t('donor.never_donated')}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500">
              {lang === 'bn' ? 'স্বেচ্ছাসেবী মোট রক্তদান সংখ্যা:' : 'Total Voluntary Donations:'}{' '}
              <strong className="text-slate-800 dark:text-white font-bold">{profile.total_donations || 0}</strong>
            </span>
            <span className="text-blood-600 dark:text-blood-400">
              {lang === 'bn' ? 'জীবন বাঁচিয়েছেন প্রায়:' : 'Estimated Lives Saved:'}{' '}
              <strong>{(profile.total_donations || 0) * 3}</strong>
            </span>
          </div>
        </div>

        {/* Privacy & Profile Settings */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              {lang === 'bn' ? 'গোপনীয়তা ও প্রাপ্যতা সেটিংস' : 'Privacy & Availability'}
            </h3>

            {/* Phone Privacy Toggle */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {lang === 'bn' ? 'মোবাইল নম্বর গোপন রাখুন' : 'Hide Phone Number'}
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  {profile.phone_hidden 
                    ? (lang === 'bn' ? 'নম্বরটি সাধারণ সার্চে লুকানো রয়েছে।' : 'Hidden from public visitors.')
                    : (lang === 'bn' ? 'জরুরি প্রয়োজনে রক্তসন্ধানীরা নম্বরটি দেখতে পাচ্ছেন।' : 'Visible to seekers.')}
                </span>
              </div>
              <button
                onClick={handleTogglePrivacy}
                className={`p-2.5 rounded-xl border transition-colors ${
                  profile.phone_hidden 
                    ? 'bg-blood-100 border-blood-300 text-blood-700 dark:bg-blood-950 dark:text-blood-300' 
                    : 'bg-slate-100 border-slate-300 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
                title="Toggle Phone Privacy"
              >
                {profile.phone_hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Available to Donate Toggle */}
            <div className="flex items-start justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {lang === 'bn' ? 'রক্তদানে প্রস্তুত স্ট্যাটাস' : 'Available for Requests'}
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  {profile.is_available 
                    ? (lang === 'bn' ? 'জরুরি কল রিসিভ করতে প্রস্তুত।' : 'Active and accepting calls.')
                    : (lang === 'bn' ? 'সাময়িকভাবে বন্ধ রয়েছে।' : 'Paused temporarily.')}
                </span>
              </div>
              <button
                onClick={handleToggleAvailability}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  profile.is_available 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {profile.is_available ? 'Active' : 'Paused'}
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{profile.upazila}, {profile.district}</span>
          </div>
        </div>

      </div>

      {/* 3. Milestone Badges Section */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {t('dash.my_badges')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {lang === 'bn' ? 'রক্তদান সম্পন্ন করার মাধ্যমে অর্জিত মানবিক সম্মাননা' : 'Badges unlocked with each milestone donation'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {INITIAL_BADGES.map((badge) => {
            const isUnlocked = (profile.total_donations || 0) >= badge.min_donations;
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border text-center space-y-2 flex flex-col items-center justify-between transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-white to-amber-50/50 dark:from-slate-800 dark:to-slate-800/60 border-amber-300 dark:border-amber-700 shadow-sm'
                    : 'bg-slate-50/60 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-40 grayscale'
                }`}
              >
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md my-1"
                  style={{ backgroundColor: isUnlocked ? badge.badge_color : '#94a3b8' }}
                >
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">
                    {lang === 'bn' ? badge.name_bn : badge.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 block">
                    {badge.min_donations}+ {lang === 'bn' ? 'রক্তদান' : 'Donations'}
                  </span>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  isUnlocked ? 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-200' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isUnlocked ? (lang === 'bn' ? 'অর্জিত' : 'Unlocked') : (lang === 'bn' ? 'লকড' : 'Locked')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Donation History & Download Certificate Table */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t('dash.my_donations')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'bn' ? 'যশোরের বিভিন্ন হাসপাতালে সম্পন্ন হওয়া রক্তদানের তালিকা' : 'Verified donation records and certificates'}
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('dash.add_donation')}</span>
          </button>
        </div>

        {donations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Hospital & Details</th>
                  <th className="py-3 px-4">Group / Units</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {donations.map((don) => (
                  <tr key={don.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                      {don.donation_date}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{don.hospital}</div>
                      {don.patient_name && (
                        <div className="text-xs text-slate-400">Patient: {don.patient_name}</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-extrabold text-blood-600 dark:text-blood-400 mr-1.5">
                        {don.blood_group}
                      </span>
                      ({don.units} {lang === 'bn' ? 'ব্যাগ' : 'unit'})
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedCertDonation(don)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blood-50 dark:bg-blood-950 text-blood-600 dark:text-blood-400 hover:bg-blood-100 font-bold text-xs border border-blood-200 dark:border-blood-800 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'সনদপত্র' : 'Certificate'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 text-xs">
            {lang === 'bn' ? 'এখনো কোনো রক্তদানের রেকর্ড যুক্ত করা হয়নি।' : 'No donation records logged yet.'}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {selectedCertDonation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 space-y-4 my-8">
            <div className="flex justify-end no-print">
              <button
                onClick={() => setSelectedCertDonation(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300"
              >
                Close / বন্ধ করুন
              </button>
            </div>
            <CertificateCard donation={selectedCertDonation} donor={profile} />
          </div>
        </div>
      )}

      {/* Add Donation Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {t('dash.add_donation')}
            </h3>

            <form onSubmit={handleAddDonation} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Donation Date *
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Hospital Name *
                </label>
                <input
                  type="text"
                  required
                  value={newHospital}
                  onChange={(e) => setNewHospital(e.target.value)}
                  placeholder="250 Bed General Hospital, Jashore"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Patient Name (Optional)
                </label>
                <input
                  type="text"
                  value={newPatient}
                  onChange={(e) => setNewPatient(e.target.value)}
                  placeholder="e.g. Sultana Begum"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blood-600 text-white text-xs font-bold hover:bg-blood-700"
                >
                  Save Donation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

