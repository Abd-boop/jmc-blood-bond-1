import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, PhoneCall, Mail, MapPin, Heart, Shield, Award, Stethoscope } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand & JMC Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blood-500 flex items-center justify-center text-white shadow-lg shadow-blood-500/20">
                <Droplet className="w-6 h-6 fill-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  JMC <span className="text-blood-400">Blood Bond</span>
                </span>
                <p className="text-xs text-blood-300 font-semibold">
                  {lang === 'bn' ? 'যশোর মেডিকেল কলেজ' : 'Jashore Medical College'}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('footer.about_jmc')}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-xl w-fit">
              <Stethoscope className="w-4 h-4" />
              <span>{lang === 'bn' ? '১০০% অলাভজনক ও মানবিক সেবা' : '100% Non-profit Humanitarian Drive'}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-blood-500 pl-2">
              {t('footer.quick_links')}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/search" className="hover:text-blood-400 transition-colors flex items-center gap-2">
                  <span>&bull;</span> {t('nav.search')}
                </Link>
              </li>
              <li>
                <Link to="/request-blood" className="hover:text-blood-400 transition-colors flex items-center gap-2">
                  <span>&bull;</span> {t('btn.request_blood')}
                </Link>
              </li>
              <li>
                <Link to="/requests" className="hover:text-blood-400 transition-colors flex items-center gap-2">
                  <span>&bull;</span> {t('nav.requests_feed')}
                </Link>
              </li>
              <li>
                <Link to="/camps" className="hover:text-blood-400 transition-colors flex items-center gap-2">
                  <span>&bull;</span> {t('nav.camps')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blood-400 transition-colors flex items-center gap-2">
                  <span>&bull;</span> {t('btn.donate_now')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Connected Hospitals */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-blood-500 pl-2">
              {lang === 'bn' ? 'সংযুক্ত হাসপাতালসমূহ (যশোর)' : 'Key Hospitals in Jashore'}
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blood-400 shrink-0 mt-0.5" />
                <span>যশোর ২৫০ শয্যা জেনারেল হাসপাতাল (সদর)</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blood-400 shrink-0 mt-0.5" />
                <span>আদ-দ্বীন সকিনা মেডিকেল কলেজ হাসপাতাল, পুলেরহাট</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blood-400 shrink-0 mt-0.5" />
                <span>যশোর শিশু হাসপাতাল, চাঁচড়া</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blood-400 shrink-0 mt-0.5" />
                <span>কুইন্স হসপিটাল, গাড়ি খানা রোড, যশোর</span>
              </li>
            </ul>
          </div>

          {/* 24/7 Helpline */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-blood-500 pl-2">
              {t('footer.helpline')}
            </h3>
            <div className="space-y-3">
              <a
                href="tel:+8801725894120"
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-blood-500 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-blood-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">জরুরি কল (২৪ ঘণ্টা):</span>
                  <span className="text-sm font-bold text-white group-hover:text-blood-400 transition-colors">
                    +880 1725-894120
                  </span>
                </div>
              </a>

              <a
                href="mailto:blood.jmc@gmail.com"
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-blood-500 transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-700 text-slate-200 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-[11px] text-slate-400 block font-medium">ইমেইল যোগাযোগ:</span>
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    blood.jmc@gmail.com
                  </span>
                </div>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{t('footer.copyright')}</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-blood-500 fill-blood-500 inline animate-bounce" />
            <span>by JMC Medical Students Association</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

