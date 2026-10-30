import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Droplet, 
  Search, 
  PlusCircle, 
  AlertCircle, 
  Calendar, 
  User, 
  ShieldAlert, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { lang, toggleLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Concise, spacious labels tailored for clean laptop & desktop headers
  const navLinks = [
    { 
      path: '/', 
      label: lang === 'bn' ? 'হোম' : 'Home', 
      icon: Droplet 
    },
    { 
      path: '/search', 
      label: lang === 'bn' ? 'রক্তদাতা খুঁজুন' : 'Find Donors', 
      icon: Search 
    },
    { 
      path: '/requests', 
      label: lang === 'bn' ? 'রক্তের চাহিদা' : 'Urgent Requests', 
      icon: AlertCircle, 
      badge: 'Live' 
    },
    { 
      path: '/camps', 
      label: lang === 'bn' ? 'ক্যাম্পেইন' : 'Camps', 
      icon: Calendar 
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-4">
          
          {/* Logo & JMC Brand */}
          <Link to="/" className="flex items-center gap-3.5 shrink-0 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-blood-600 to-blood-500 flex items-center justify-center text-white shadow-lg shadow-blood-500/25 group-hover:scale-105 transition-transform">
              <Droplet className="w-6 h-6 sm:w-7 sm:h-7 fill-white animate-pulse-subtle" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                  JMC <span className="text-blood-500">Blood Bond</span>
                </span>
                <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blood-100 text-blood-700 dark:bg-blood-950/70 dark:text-blood-300 border border-blood-200 dark:border-blood-800">
                  {lang === 'bn' ? 'জেএমসি' : 'JMC Unit'}
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden lg:block tracking-normal">
                {lang === 'bn' ? 'যশোর মেডিকেল কলেজ শিক্ষার্থীদের প্ল্যাটফর্ম' : 'Run by Jashore Medical College'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Spacious & Breathable) */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-5 mx-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center gap-2 px-3.5 xl:px-4 py-2 rounded-xl text-sm font-bold tracking-normal transition-all duration-150 ${
                    active
                      ? 'bg-blood-50 text-blood-600 dark:bg-blood-950/60 dark:text-blood-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blood-500' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span className="whitespace-nowrap">{link.label}</span>
                  {link.badge && (
                    <span className="flex h-2 w-2 relative ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blood-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blood-500"></span>
                    </span>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blood-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Tools & Utilities */}
          <div className="hidden md:flex items-center gap-3 xl:gap-4 shrink-0">
            
            {/* Quick Emergency Request Button */}
            <Link
              to="/request-blood"
              className="flex items-center gap-2 px-4 xl:px-5 py-2.5 rounded-2xl text-xs xl:text-sm font-extrabold text-white bg-gradient-to-r from-blood-600 to-blood-500 hover:from-blood-700 hover:to-blood-600 shadow-md shadow-blood-500/20 hover:shadow-blood-500/35 transition-all transform active:scale-95 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>{lang === 'bn' ? 'রক্তের আবেদন' : 'Request Blood'}</span>
            </Link>

            {/* Language & Theme Controls (Clean pill cluster) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 gap-1">
              <button
                onClick={toggleLang}
                className="px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:text-blood-600 dark:hover:text-blood-400 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-none hover:shadow-xs"
                title="বাংলা / English"
              >
                {lang === 'bn' ? 'EN' : 'বাং'}
              </button>

              <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700" />

              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 transition-all"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              </button>
            </div>

            {/* User Profile or Admin or Login */}
            {user ? (
              <div className="flex items-center gap-2.5">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 transition-colors whitespace-nowrap"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Admin</span>
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold"
                >
                  <div className="w-8 h-8 rounded-xl bg-blood-600 text-white flex items-center justify-center font-black shadow-sm">
                    {profile?.blood_group || 'O+'}
                  </div>
                  <span className="max-w-[110px] xl:max-w-[140px] truncate text-slate-900 dark:text-white">
                    {profile?.full_name?.split(' ')[0] || 'Profile'}
                  </span>
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs xl:text-sm font-bold border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 transition-all whitespace-nowrap"
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>{lang === 'bn' ? 'লগইন' : 'Login'}</span>
              </Link>
            )}
          </div>

          {/* Mobile View Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={toggleLang}
              className="px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800"
            >
              {lang === 'bn' ? 'EN' : 'বাং'}
            </button>
            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
          <Link
            to="/request-blood"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-blood-600 to-blood-500 shadow-md"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{t('btn.request_blood')}</span>
          </Link>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold ${
                    active
                      ? 'bg-blood-50 text-blood-600 dark:bg-blood-950 dark:text-blood-400 border border-blood-200'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blood-500" />
                    <span>{profile?.full_name || 'My Dashboard'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blood-500 text-white text-xs">
                    {profile?.blood_group}
                  </span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold text-sm border border-amber-200 dark:border-amber-800"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span>{t('nav.admin')}</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full p-2.5 rounded-xl text-red-600 dark:text-red-400 font-semibold text-xs justify-center"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm"
              >
                <User className="w-4 h-4" />
                <span>{t('nav.login')}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
