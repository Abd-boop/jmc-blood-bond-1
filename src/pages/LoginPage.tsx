import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  EyeOff,
  Stethoscope,
  Droplet
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { BloodGroup } from '../types';
import { JASHORE_UPAZILAS, SOUTH_WEST_DISTRICTS } from '../data/mockData';
import { TurnstileWidget } from '../components/TurnstileWidget';

export const LoginPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { signIn, signUp, demoLoginAsAdmin, demoLoginAsDonor, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup extra profile fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [district, setDistrict] = useState('Jashore');
  const [upazila, setUpazila] = useState('Jashore Sadar');
  const [medicalUnit, setMedicalUnit] = useState('JMC MBBS Student');
  const [phoneHidden, setPhoneHidden] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!turnstileToken) {
      setErrorMsg(lang === 'bn' 
        ? 'অনুগ্রহ করে টার্নস্টাইল ভেরিফিকেশনটি সম্পন্ন করুন।' 
        : 'Please complete the Turnstile verification.');
      return;
    }

    setLoading(true);

    if (mode === 'signin') {
      const res = await signIn(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Login failed. Please check credentials.');
      } else {
        navigate('/dashboard');
      }
    } else {
      const res = await signUp(email, password, {
        full_name: fullName,
        phone,
        blood_group: bloodGroup,
        district,
        upazila,
        medical_college_unit: medicalUnit,
        phone_hidden: phoneHidden,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed.');
      } else {
        navigate('/dashboard');
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        
        {/* Header with Droplet Icon */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blood-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blood-500/25">
            <Droplet className="w-7 h-7 fill-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {mode === 'signin' 
              ? (lang === 'bn' ? 'অ্যাকাউন্টে প্রবেশ করুন' : 'Sign In to Your Account')
              : (lang === 'bn' ? 'রক্তদাতা হিসেবে নিবন্ধন' : 'Join as a Blood Donor')}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === 'bn' ? 'যশোর মেডিকেল কলেজ রক্তদান নেটওয়ার্ক' : 'Jashore Medical College Blood Network'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMsg(null); }}
            className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              mode === 'signin'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {lang === 'bn' ? 'লগইন' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(null); }}
            className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              mode === 'signup'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {lang === 'bn' ? 'নতুন নিবন্ধন' : 'Sign Up'}
          </button>
        </div>

        {/* Demo Fast Login Buttons (For instant testing!) */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2">
          <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 block text-center">
            {lang === 'bn' ? '⚡ দ্রুত পরীক্ষার জন্য ডেমো অ্যাকাউন্ট দিয়ে প্রবেশ করুন:' : '⚡ Instant Demo Preview Accounts:'}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                demoLoginAsAdmin();
                navigate('/admin');
              }}
              className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors text-center"
            >
              Demo Admin (ডাক্তার)
            </button>
            <button
              type="button"
              onClick={() => {
                demoLoginAsDonor();
                navigate('/dashboard');
              }}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-colors text-center"
            >
              Demo Donor (সাদিয়া)
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* The Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'signup' && (
            <>
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  {lang === 'bn' ? 'আপনার পুরো নাম' : 'Full Name'} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: ডা. মাহফুজুর রহমান' : 'Full name...'}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blood-500"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  {lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'} *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blood-500"
                  />
                </div>
              </div>

              {/* Blood Group Select */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  {t('form.blood_group')} *
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {bloodGroups.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setBloodGroup(bg)}
                      className={`py-2 rounded-xl text-xs font-black transition-all border ${
                        bloodGroup === bg
                          ? 'bg-blood-600 text-white border-blood-600'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* District & Upazila */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    {t('form.district')}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    {SOUTH_WEST_DISTRICTS.map((d) => (
                      <option key={d} value={d.split(' ')[0]}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    {lang === 'bn' ? 'উপজেলা' : 'Upazila'}
                  </label>
                  <select
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    {JASHORE_UPAZILAS.map((u) => (
                      <option key={u} value={u.split(' ')[0]}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Medical College Unit */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  {lang === 'bn' ? 'জেএমসি ইউনিট / পরিচয়' : 'JMC Unit / Affiliation'}
                </label>
                <input
                  type="text"
                  value={medicalUnit}
                  onChange={(e) => setMedicalUnit(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: JMC MBBS Batch 12 / General Donor' : 'e.g. JMC MBBS Batch 12'}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>

              {/* Phone Privacy Toggle */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={phoneHidden}
                  onChange={(e) => setPhoneHidden(e.target.checked)}
                  className="rounded text-blood-600 focus:ring-blood-500 mt-0.5"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  {t('dash.phone_privacy')}
                </span>
              </label>
            </>
          )}

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
              {lang === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@jmc.edu.bd"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blood-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
              {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blood-500"
              />
            </div>
          </div>

          {/* Cloudflare Turnstile Bot Check */}
          <div className="pt-2">
            <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blood-600 hover:bg-blood-700 text-white font-extrabold text-sm shadow-md shadow-blood-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Processing...' : (mode === 'signin' ? t('nav.login') : t('btn.donate_now'))}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

      </div>
    </div>
  );
};

