import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Phone, ArrowRight, Share2 } from 'lucide-react';
import { BloodRequest } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface UrgentRequestTickerProps {
  requests: BloodRequest[];
  onShare?: (req: BloodRequest) => void;
}

export const UrgentRequestTicker: React.FC<UrgentRequestTickerProps> = ({ requests, onShare }) => {
  const { lang, t } = useLanguage();
  const criticalRequests = requests.filter(r => r.urgency === 'critical' || r.urgency === 'urgent').slice(0, 3);

  if (criticalRequests.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-r from-blood-700 via-blood-600 to-rose-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <div className="flex items-center gap-1.5 font-extrabold text-xs sm:text-sm tracking-wide uppercase">
              <AlertCircle className="w-4 h-4 text-white" />
              <span>{lang === 'bn' ? 'জরুরি রক্তের চাহিদা:' : 'Live Urgent Request:'}</span>
            </div>
          </div>

          {/* Active Request Snippet */}
          <div className="flex-1 overflow-hidden flex items-center justify-center sm:justify-start">
            {criticalRequests[0] && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm">
                <span className="px-2 py-0.5 rounded-md bg-white text-blood-700 font-extrabold shadow-sm">
                  {criticalRequests[0].blood_group} ({criticalRequests[0].units} {lang === 'bn' ? 'ব্যাগ' : 'units'})
                </span>
                <span className="font-semibold text-rose-100 truncate max-w-[280px] sm:max-w-[360px]">
                  {criticalRequests[0].patient_name} &bull; {criticalRequests[0].hospital}
                </span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {criticalRequests[0] && (
              <a
                href={`tel:${criticalRequests[0].contact_phone}`}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/20 hover:bg-white text-white hover:text-blood-700 text-xs font-bold transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'কল করুন' : 'Call'}</span>
              </a>
            )}

            <Link
              to="/requests"
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white text-blood-700 hover:bg-rose-50 text-xs font-bold shadow-sm transition-all"
            >
              <span>{lang === 'bn' ? 'সকল চাহিদা' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

