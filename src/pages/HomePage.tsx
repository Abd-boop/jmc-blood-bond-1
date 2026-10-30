import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Droplet, 
  Search, 
  PlusCircle, 
  HeartHandshake, 
  Users, 
  CheckCircle2, 
  Calendar, 
  PhoneCall, 
  ChevronRight, 
  ShieldCheck, 
  ArrowRight,
  Clock,
  MapPin,
  Stethoscope,
  Activity,
  Award,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { MOCK_DONORS, MOCK_REQUESTS, MOCK_CAMPS } from '../data/mockData';
import { BloodGroup, BloodRequest } from '../types';
import { UrgentRequestTicker } from '../components/UrgentRequestTicker';
import { ShareModal } from '../components/ShareModal';

export const HomePage: React.FC = () => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [selectedShareRequest, setSelectedShareRequest] = useState<BloodRequest | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleGroupSelect = (group: BloodGroup) => {
    navigate(`/search?blood_group=${encodeURIComponent(group)}`);
  };

  const urgentRequests = MOCK_REQUESTS.filter(r => r.status === 'approved');
  const upcomingCamps = MOCK_CAMPS.filter(c => c.status === 'upcoming');

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* 1. Live Urgent Request Bar */}
      <UrgentRequestTicker requests={urgentRequests} onShare={setSelectedShareRequest} />

      {/* 2. Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Student Supervised Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blood-50 dark:bg-blood-950/60 border border-blood-200 dark:border-blood-800/80 text-blood-700 dark:text-blood-300 text-xs sm:text-sm font-bold shadow-sm">
              <Stethoscope className="w-4 h-4 text-blood-600 animate-pulse" />
              <span>{t('hero.badge')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              {t('hero.title_pre')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blood-600 via-rose-500 to-blood-700">
                {t('hero.title_highlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {t('hero.description')}
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                to="/search"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-sm sm:text-base hover:bg-slate-800 dark:hover:bg-slate-100 shadow-lg shadow-slate-900/10 transition-all transform active:scale-95"
              >
                <Search className="w-5 h-5 text-blood-500" />
                <span>{t('btn.search')}</span>
              </Link>

              <Link
                to="/request-blood"
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blood-600 to-blood-500 text-white font-extrabold text-sm sm:text-base hover:from-blood-700 hover:to-blood-600 shadow-xl shadow-blood-500/25 transition-all transform active:scale-95"
              >
                <PlusCircle className="w-5 h-5" />
                <span>{t('btn.request_blood')}</span>
              </Link>

              <Link
                to="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span>{t('btn.donate_now')}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Helpline indicator */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <PhoneCall className="w-4 h-4 text-blood-500" />
              <span>{t('hero.emergency_helpline')}</span>
              <a href="tel:+8801725894120" className="font-bold text-blood-600 dark:text-blood-400 hover:underline">
                +880 1725-894120
              </a>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-gradient-to-br from-white to-blood-50/60 dark:from-slate-900 dark:to-slate-900/90 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 dark:border-slate-800">
              
              {/* Floating Badge */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blood-500 text-white flex items-center justify-center shadow-md shadow-blood-500/30">
                    <Droplet className="w-7 h-7 fill-white animate-pulse" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {lang === 'bn' ? 'জরুরি ব্লাড ব্যাংক সাপোর্ট' : 'Emergency Blood Support'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {lang === 'bn' ? 'যশোর সদর ও পার্শ্ববর্তী অঞ্চল' : 'Jashore Sadar & Greater Khulna'}
                    </p>
                  </div>
                </div>
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>

              {/* Quick Group Selector */}
              <div className="py-6 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'bn' ? 'দ্রুত রক্তের গ্রুপ নির্বাচন করুন' : 'Quick Blood Group Select'}
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {bloodGroups.map((bg) => (
                    <button
                      key={bg}
                      onClick={() => handleGroupSelect(bg)}
                      className="py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blood-500 hover:bg-blood-50 dark:hover:bg-blood-950/40 text-slate-900 dark:text-white font-black text-base shadow-sm hover:shadow transition-all group"
                    >
                      <span className="group-hover:text-blood-600 transition-colors">{bg}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified Trust Card */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>
                  {lang === 'bn' 
                    ? 'প্রতিটি আবেদন যশোর মেডিকেল কলেজের ইন্টার্ন ও ভলান্টিয়ার দ্বারা যাচাইকৃত।'
                    : 'All emergency requests verified by JMC medical volunteers.'}
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. Live Stats Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blood-100 dark:bg-blood-950/60 text-blood-600 dark:text-blood-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">
                {MOCK_DONORS.length * 45}+
              </span>
              <span className="text-xs sm:text-sm text-slate-500 font-medium">
                {t('stats.donors')}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">
                1,420+
              </span>
              <span className="text-xs sm:text-sm text-slate-500 font-medium">
                {t('stats.lives_saved')}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">
                980+
              </span>
              <span className="text-xs sm:text-sm text-slate-500 font-medium">
                {t('stats.requests_fulfilled')}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">
                24+
              </span>
              <span className="text-xs sm:text-sm text-slate-500 font-medium">
                {t('stats.camps_held')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live Urgent Requests Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-blood-600 dark:text-blood-400 uppercase tracking-wider block mb-1">
              {lang === 'bn' ? 'জরুরি লাইভ চাহিদা' : 'Urgent Requests'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t('urgent.title')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{t('urgent.subtitle')}</p>
          </div>
          <Link
            to="/requests"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blood-600 dark:text-blood-400 hover:text-blood-700 hover:underline shrink-0"
          >
            <span>{lang === 'bn' ? 'সকল আবেদন দেখুন' : 'View all requests'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {urgentRequests.slice(0, 3).map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-4 relative flex flex-col justify-between"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-xl bg-blood-600 text-white font-black text-sm tracking-wide">
                    {req.blood_group} ({req.units} {lang === 'bn' ? 'ব্যাগ' : 'units'})
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    req.urgency === 'critical'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {req.urgency === 'critical' ? t('urgent.urgency.critical') : t('urgent.urgency.urgent')}
                  </span>
                </div>

                {/* Patient & Hospital */}
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {req.patient_name}
                </h3>
                <div className="space-y-1.5 mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blood-500 shrink-0 mt-0.5" />
                    <span>{req.hospital}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{t('urgent.date')} {req.needed_date}</span>
                  </div>
                </div>

                {req.medical_reason && (
                  <p className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    {req.medical_reason}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <a
                  href={`tel:${req.contact_phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t('btn.call_now')}</span>
                </a>
                <button
                  onClick={() => setSelectedShareRequest(req)}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Share on WhatsApp/Facebook"
                >
                  <ShareModal request={selectedShareRequest} onClose={() => setSelectedShareRequest(null)} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section className="bg-slate-100 dark:bg-slate-900/50 py-16 sm:py-20 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blood-600 dark:text-blood-400 uppercase tracking-widest">
              {lang === 'bn' ? 'সহজ ও কার্যকর পদ্ধতি' : 'Simple 4-Step Workflow'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              {t('how.title')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              {t('how.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 relative group hover:border-blood-500 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-blood-50 dark:bg-blood-950/60 text-blood-600 dark:text-blood-400 flex items-center justify-center font-black text-lg border border-blood-200 dark:border-blood-800">
                  {step}
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {t(`how.step${step}_title`)}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t(`how.step${step}_desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Upcoming Blood Camps by JMC */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-blood-600 dark:text-blood-400 uppercase tracking-wider block mb-1">
              {lang === 'bn' ? 'জেএমসি ক্যাম্পাস কর্মসূচি' : 'JMC Campus Campaigns'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {t('camps.title')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{t('camps.subtitle')}</p>
          </div>
          <Link
            to="/camps"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blood-600 dark:text-blood-400 hover:underline shrink-0"
          >
            <span>{lang === 'bn' ? 'সকল ক্যাম্প দেখুন' : 'View all camps'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingCamps.map((camp) => (
            <div
              key={camp.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                    {lang === 'bn' ? 'আসন্ন কর্মসূচি' : 'Upcoming Camp'}
                  </span>
                  <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blood-500" />
                    <span>{new Date(camp.start_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {lang === 'bn' ? (camp.title_bn || camp.title) : camp.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {camp.description}
                </p>

                <div className="space-y-2 text-xs text-slate-500">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blood-500 shrink-0 mt-0.5" />
                    <span>{camp.venue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-jmc-blue shrink-0" />
                    <span>{camp.organizer}</span>
                  </div>
                </div>
              </div>

              {/* Camp stats footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block">{t('camps.target')}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {camp.target_units} {lang === 'bn' ? 'ব্যাগ' : 'units'}
                  </span>
                </div>
                <a
                  href={`tel:${camp.contact_phone}`}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-blood-50 dark:hover:bg-blood-950 transition-colors"
                >
                  {lang === 'bn' ? 'যোগাযোগ' : 'Inquire'}: {camp.contact_phone}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t('faq.title')}
          </h2>
          <p className="text-sm text-slate-500">
            {lang === 'bn' ? 'রক্তদান সম্পর্কিত প্রয়োজনীয় তথ্য ও নির্দেশনা' : 'Essential information about blood donation safety'}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-blood-500' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blood-700 via-blood-600 to-rose-700 p-8 sm:p-14 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-3 max-w-xl z-10">
            <span className="text-xs uppercase font-extrabold tracking-widest text-rose-200">
              {lang === 'bn' ? 'মানবতার ডাকে সাড়া দিন' : 'Answer the Call of Humanity'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              {lang === 'bn' ? 'আপনিও হতে পারেন কারও বেঁচে থাকার কারণ' : 'You can be the reason someone smiles again'}
            </h2>
            <p className="text-xs sm:text-sm text-rose-100">
              {lang === 'bn' 
                ? 'যশোর মেডিকেল কলেজ রক্তদান পরিবারে যুক্ত হয়ে আজই রক্তদাতা হিসেবে নিবন্ধন করুন।' 
                : 'Join the Jashore Medical College blood donor family and register today.'}
            </p>
          </div>
          <div className="shrink-0 z-10">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-blood-700 font-black text-sm sm:text-base hover:bg-rose-50 shadow-xl transition-all transform active:scale-95"
            >
              <Award className="w-5 h-5 text-blood-600" />
              <span>{t('btn.donate_now')}</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

