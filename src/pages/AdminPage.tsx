import React, { useState, useMemo } from 'react';
import { 
  Users, 
  AlertCircle, 
  Calendar, 
  Settings, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Search, 
  Download, 
  Upload, 
  Activity,
  Phone,
  MapPin,
  Clock,
  Save,
  Check,
  FileText,
  UserCheck,
  Sparkles,
  MessageSquare,
  X,
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { MOCK_DONORS, MOCK_REQUESTS, MOCK_CAMPS, INITIAL_SETTINGS, JASHORE_UPAZILAS, SOUTH_WEST_DISTRICTS } from '../data/mockData';
import { Profile, BloodRequest, DonationCamp, SiteSettings, BloodGroup, RequestStatus } from '../types';
import { isBloodCompatible, getCompatibleDonorGroups } from '../utils/bloodCompatibility';

export const AdminPage: React.FC = () => {
  const { lang, t } = useLanguage();
  const { isAdmin, demoLoginAsAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'analytics' | 'donors' | 'requests' | 'camps' | 'settings' | 'audit'>('requests');

  // State collections
  const [donors, setDonors] = useState<Profile[]>(MOCK_DONORS);
  const [requests, setRequests] = useState<BloodRequest[]>(MOCK_REQUESTS);
  const [camps, setCamps] = useState<DonationCamp[]>(MOCK_CAMPS);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);

  // Donor Search & Filter
  const [donorSearch, setDonorSearch] = useState('');
  const [donorGroupFilter, setDonorGroupFilter] = useState('');
  const [donorPage, setDonorPage] = useState(1);
  const pageSize = 5;

  // Modals
  const [showAddDonorModal, setShowAddDonorModal] = useState(false);
  const [showAddCampModal, setShowAddCampModal] = useState(false);
  const [showCsvImportModal, setShowCsvImportModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // SMART DONOR SUGGESTION MODAL STATE FOR REQUESTS
  const [matchingRequest, setMatchingRequest] = useState<BloodRequest | null>(null);
  const [assignedMessage, setAssignedMessage] = useState<string | null>(null);

  // Donor Eligibility Calculation Helper
  const calculateDonorEligibilityForDate = (donor: Profile, targetDateStr: string) => {
    const gapDays = settings.donation_gap_days || 90;
    if (!donor.last_donation_date) {
      return {
        eligible: true,
        daysSince: Infinity,
        daysLeft: 0,
        label: lang === 'bn' ? 'কখনো রক্ত দেননি (আজই উপযুক্ত)' : 'First-time donor (Eligible today)',
      };
    }

    const lastDate = new Date(donor.last_donation_date);
    const targetDate = new Date(targetDateStr);
    const diffTime = targetDate.getTime() - lastDate.getTime();
    const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = gapDays - daysSince;

    return {
      eligible: daysSince >= gapDays,
      daysSince,
      daysLeft: daysLeft > 0 ? daysLeft : 0,
      label: daysSince >= gapDays
        ? (lang === 'bn' ? `সর্বশেষ দান: ${daysSince} দিন আগে (আজ রক্ত দিতে প্রস্তুত)` : `Last donated ${daysSince} days ago (Eligible today)`)
        : (lang === 'bn' ? `রিকভারি চলছে: আরও ${daysLeft} দিন পর দিতে পারবেন` : `In recovery: Eligible in ${daysLeft} days`),
    };
  };

  // Get Suggested Donors for a Specific Blood Request
  const getSuggestedDonorsForRequest = (req: BloodRequest) => {
    const compatibleGroups = getCompatibleDonorGroups(req.blood_group);

    return donors
      .map(donor => {
        const eligibility = calculateDonorEligibilityForDate(donor, req.needed_date);
        const isCompatible = compatibleGroups.includes(donor.blood_group);
        const isExactMatch = donor.blood_group === req.blood_group;
        const isLocal = donor.district.toLowerCase() === req.district.toLowerCase();

        // Calculate relevance priority score
        let score = 0;
        if (eligibility.eligible) score += 100;
        if (isExactMatch) score += 50;
        else if (isCompatible) score += 25;
        if (donor.is_available) score += 20;
        if (isLocal) score += 10;

        return {
          donor,
          eligibility,
          isCompatible,
          isExactMatch,
          isLocal,
          score,
        };
      })
      .filter(item => item.isCompatible) // Must be biologically compatible
      .sort((a, b) => b.score - a.score); // Highest relevance first
  };

  // Filtered Donors
  const filteredDonors = useMemo(() => {
    return donors.filter(d => {
      if (donorGroupFilter && d.blood_group !== donorGroupFilter) return false;
      if (donorSearch) {
        const query = donorSearch.toLowerCase();
        return (
          d.full_name.toLowerCase().includes(query) ||
          d.phone.includes(query) ||
          d.district.toLowerCase().includes(query) ||
          d.upazila.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [donors, donorGroupFilter, donorSearch]);

  const paginatedDonors = filteredDonors.slice((donorPage - 1) * pageSize, donorPage * pageSize);
  const totalDonorPages = Math.ceil(filteredDonors.length / pageSize) || 1;

  // Blood group breakdown for analytics
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    donors.forEach(d => {
      counts[d.blood_group] = (counts[d.blood_group] || 0) + 1;
    });
    return counts;
  }, [donors]);

  // Request Status Updates
  const handleRequestStatusChange = (reqId: string, newStatus: RequestStatus) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r));
  };

  // Assign Suggested Donor to Request
  const handleAssignDonor = (donor: Profile, req: BloodRequest) => {
    setRequests(prev => prev.map(r => r.id === req.id ? {
      ...r,
      status: 'donor_found',
      assigned_donor_id: donor.id,
      admin_notes: `Matched with ${donor.full_name} (${donor.phone}) on ${new Date().toLocaleDateString()}`,
      updated_at: new Date().toISOString(),
    } : r));

    // Create a personalized WhatsApp message for the coordinator to send
    const message = lang === 'bn'
      ? `আসসালামু আলাইকুম ${donor.full_name}, যশোর মেডিকেল কলেজ রক্তদান ফোরাম থেকে ডা. তানভীর বলছি।\n\nহাসপাতাল: ${req.hospital}\nরোগী: ${req.patient_name}\nপ্রয়োজন: ${req.blood_group} (${req.units} ব্যাগ) - ${req.needed_date}\nজরুরিত্ব: ${req.urgency.toUpperCase()}\n\nআমাদের হিসাব অনুযায়ী আপনার সর্বশেষ রক্তদানের ৯০ দিনের রিকভারি সময় পূর্ণ হয়েছে এবং আপনি আজ রক্তদানের জন্য উপযুক্ত আছেন। আপনি কি এই মুমূর্ষু রোগীকে রক্ত দিয়ে সাহায্য করতে পারবেন?\n\nরোগীর স্বজনের ফোন: ${req.contact_phone}`
      : `Hello ${donor.full_name}, Dr. Tanvir from Jashore Medical College Blood Bond.\n\nUrgent blood needed for patient ${req.patient_name} at ${req.hospital}.\nGroup: ${req.blood_group} (${req.units} unit/s) on ${req.needed_date}.\n\nAccording to our records, your 90-day recovery is complete and you are eligible today. Are you available to donate?\nPatient Contact: ${req.contact_phone}`;

    setAssignedMessage(message);

    // Auto-open WhatsApp
    const waUrl = `https://api.whatsapp.com/send?phone=${donor.phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // Delete Donor
  const handleDeleteDonor = (donorId: string) => {
    if (window.confirm('Are you sure you want to delete this donor record?')) {
      setDonors(prev => prev.filter(d => d.id !== donorId));
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = 'ID,Full Name,Phone,Blood Group,District,Upazila,Medical Unit,Last Donated,Total Donations,Available\n';
    const rows = donors.map(d => 
      `"${d.id}","${d.full_name}","${d.phone}","${d.blood_group}","${d.district}","${d.upazila}","${d.medical_college_unit || ''}","${d.last_donation_date || ''}",${d.total_donations || 0},${d.is_available}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jmc_donors_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import
  const handleImportCsv = () => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split('\n');
    const newItems: Profile[] = [];
    const startIdx = lines[0].toLowerCase().includes('name') ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const cols = lines[i].split(',').map(s => s.replace(/^"|"$/g, '').trim());
      if (cols.length >= 4) {
        newItems.push({
          id: 'imp-' + Date.now() + '-' + i,
          role: 'member',
          full_name: cols[0] || 'Imported Donor',
          phone: cols[1] || '01700000000',
          blood_group: (cols[2] as BloodGroup) || 'O+',
          district: cols[3] || 'Jashore',
          upazila: cols[4] || 'Jashore Sadar',
          phone_hidden: false,
          total_donations: parseInt(cols[5]) || 0,
          is_available: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    if (newItems.length > 0) {
      setDonors(prev => [...newItems, ...prev]);
      setShowCsvImportModal(false);
      setCsvText('');
      alert(`Successfully imported ${newItems.length} donors!`);
    } else {
      alert('Could not parse CSV. Format: Name, Phone, Blood Group, District, Upazila');
    }
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // Protected Gate
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          Admin Access Required
        </h2>
        <p className="text-xs text-slate-500">
          This panel is restricted to authorized Jashore Medical College Administrators and Doctors.
        </p>
        <button
          onClick={demoLoginAsAdmin}
          className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-colors"
        >
          Sign in as Demo Admin (Dr. Tanvir)
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              JMC Admin Portal
            </h1>
            <p className="text-xs text-slate-500">
              যশোর মেডিকেল কলেজ রক্তদান কার্যক্রম নিয়ন্ত্রণ কেন্দ্র
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          {[
            { id: 'requests', label: 'Blood Requests', icon: AlertCircle, badge: requests.filter(r => r.status === 'pending').length },
            { id: 'donors', label: 'Donors CRUD', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: Activity },
            { id: 'camps', label: 'Camps', icon: Calendar },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'audit', label: 'Audit Log', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {Boolean(tab.badge) && (
                  <span className="w-4 h-4 rounded-full bg-blood-600 text-white text-[9px] flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. BLOOD REQUESTS WITH SMART DONOR SUGGESTIONS (CORE FEATURE) */}
      {activeTab === 'requests' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Emergency Blood Requests ({requests.length})
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blood-100 text-blood-700 dark:bg-blood-950 dark:text-blood-300">
                  Smart Donor Matching Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculates days since last donation to suggest donors who are eligible to donate today.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Patient & Contact</th>
                  <th className="py-3 px-3">Group Needed</th>
                  <th className="py-3 px-3">Hospital & Location</th>
                  <th className="py-3 px-3">Date Needed</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Smart Match</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {requests.map((r) => {
                  const suggestions = getSuggestedDonorsForRequest(r);
                  const eligibleTodayCount = suggestions.filter(s => s.eligibility.eligible).length;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        {r.patient_name}
                        <span className="block text-xs font-normal text-slate-400 font-mono">{r.contact_phone}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-xl bg-blood-600 text-white font-black text-xs mr-1 shadow-sm">
                          {r.blood_group}
                        </span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">({r.units} units)</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">{r.hospital}</span>
                        <span className="text-[11px] text-slate-400">{r.district}</span>
                      </td>
                      <td className="py-3 px-3 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white block">{r.needed_date}</span>
                        {r.needed_time && <span className="text-[11px] text-slate-400">{r.needed_time}</span>}
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={r.status}
                          onChange={(e) => handleRequestStatusChange(r.id, e.target.value as RequestStatus)}
                          className={`px-2.5 py-1 rounded-xl border text-xs font-extrabold ${
                            r.status === 'pending'
                              ? 'border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                              : r.status === 'donor_found'
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
                              : 'border-slate-300 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="donor_found">Donor Found</option>
                          <option value="fulfilled">Fulfilled</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      
                      {/* SMART DONOR SUGGESTION TRIGGER BUTTON */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setMatchingRequest(r)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                            eligibleTodayCount > 0
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white animate-pulse-subtle'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                          }`}
                          title="Click to calculate and view donors who can donate today"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>
                            {eligibleTodayCount > 0 
                              ? `${eligibleTodayCount} ${lang === 'bn' ? 'জন প্রস্তুত' : 'Available'}` 
                              : (lang === 'bn' ? 'সাজেশন দেখুন' : 'Suggest')}
                          </span>
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <a
                          href={`tel:${r.contact_phone}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold"
                        >
                          <Phone className="w-3 h-3 text-blood-500" />
                          <span>Call</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SMART MATCHING DONORS MODAL DIALOG */}
      {matchingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-blood-600 text-white font-black flex items-center justify-center text-sm">
                    {matchingRequest.blood_group}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {lang === 'bn' ? 'উপযুক্ত রক্তদাতা সাজেশন' : 'Suggested Donors for Request'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Patient: <strong className="text-slate-800 dark:text-slate-200">{matchingRequest.patient_name}</strong> &bull; {matchingRequest.hospital} &bull; Needed: {matchingRequest.needed_date}
                </p>
                <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 pt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    Compatible groups: {getCompatibleDonorGroups(matchingRequest.blood_group).join(', ')} (Gap: {settings.donation_gap_days} days)
                  </span>
                </div>
              </div>

              <button
                onClick={() => { setMatchingRequest(null); setAssignedMessage(null); }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Calculated Matching Donors */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {lang === 'bn' ? 'রক্তদানের তারিখ হিসাব অনুযায়ী প্রস্তুত রক্তদাতারা:' : 'Donors Ranked by Availability on Needed Date:'}
              </h4>

              {getSuggestedDonorsForRequest(matchingRequest).map(({ donor, eligibility, isExactMatch }) => (
                <div
                  key={donor.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    eligibility.eligible
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
                  }`}
                >
                  {/* Donor Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-black text-white ${
                        isExactMatch ? 'bg-blood-600' : 'bg-rose-500'
                      }`}>
                        {donor.blood_group} {isExactMatch ? '★ Exact Match' : 'Compatible'}
                      </span>
                      <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        {donor.full_name}
                      </span>
                      {donor.medical_college_unit && (
                        <span className="text-[11px] text-blood-600 dark:text-blood-400 font-semibold hidden sm:inline">
                          ({donor.medical_college_unit})
                        </span>
                      )}
                    </div>

                    {/* Calculated Last Donated to Now Info */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className={`font-bold flex items-center gap-1 ${
                        eligibility.eligible ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{eligibility.label}</span>
                      </span>

                      <span className="text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{donor.upazila}, {donor.district}</span>
                      </span>

                      <span className="text-slate-500 font-mono font-semibold">
                        📞 {donor.phone}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Admin */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`tel:${donor.phone}`}
                      className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition-colors"
                      title="Call Donor Directly"
                    >
                      <Phone className="w-4 h-4 text-blood-500" />
                    </a>

                    <button
                      onClick={() => handleAssignDonor(donor, matchingRequest)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                        eligibility.eligible
                          ? 'bg-blood-600 hover:bg-blood-700 text-white shadow-blood-500/20'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপে পাঠান ও যুক্ত করুন' : 'Assign & WhatsApp'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {assignedMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 text-xs space-y-2">
                <span className="font-bold text-emerald-800 dark:text-emerald-200 block">
                  ✅ Donor assigned! WhatsApp message opened with coordinator text:
                </span>
                <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-line bg-white dark:bg-slate-900 p-3 rounded-xl border">
                  {assignedMessage}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => { setMatchingRequest(null); setAssignedMessage(null); }}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Done / বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. DONORS CRUD TAB */}
      {activeTab === 'donors' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Donor Management ({filteredDonors.length})
              </h3>
              <p className="text-xs text-slate-500">Search, edit, import, or export donor contact records</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setShowCsvImportModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import CSV</span>
              </button>

              <button
                onClick={() => setShowAddDonorModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Donor</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={donorSearch}
                onChange={(e) => { setDonorSearch(e.target.value); setDonorPage(1); }}
                placeholder="Search by name, phone, upazila..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
              />
            </div>

            <select
              value={donorGroupFilter}
              onChange={(e) => { setDonorGroupFilter(e.target.value); setDonorPage(1); }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white"
            >
              <option value="">All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Donor Name</th>
                  <th className="py-3 px-3">Group</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Unit</th>
                  <th className="py-3 px-3">Last Donated</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {paginatedDonors.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {d.full_name}
                      {d.phone_hidden && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-slate-100 text-slate-600">Privacy</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-black bg-blood-100 text-blood-700 text-xs">
                        {d.blood_group}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono">{d.phone}</td>
                    <td className="py-3 px-3">{d.upazila}, {d.district}</td>
                    <td className="py-3 px-3 text-xs text-slate-400">{d.medical_college_unit || 'General'}</td>
                    <td className="py-3 px-3 text-xs">{d.last_donation_date || 'Never'}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteDonor(d.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        title="Delete Donor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>Page {donorPage} of {totalDonorPages}</span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={donorPage <= 1}
                onClick={() => setDonorPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={donorPage >= totalDonorPages}
                onClick={() => setDonorPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Donors</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white block">{donors.length}</span>
              <span className="text-[11px] text-emerald-600 font-bold">Verified in Database</span>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending Requests</span>
              <span className="text-3xl font-black text-blood-600 block">
                {requests.filter(r => r.status === 'pending').length}
              </span>
              <span className="text-[11px] text-blood-500 font-bold">Needs Review</span>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Camps</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white block">
                {camps.filter(c => c.status === 'upcoming').length}
              </span>
              <span className="text-[11px] text-amber-600 font-bold">Upcoming JMC Campaigns</span>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Donation Gap</span>
              <span className="text-3xl font-black text-slate-900 dark:text-white block">{settings.donation_gap_days} d</span>
              <span className="text-[11px] text-slate-500 font-bold">Safe Recovery Policy</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Donor Distribution by Blood Group
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => {
                const count = groupCounts[bg] || 0;
                return (
                  <div key={bg} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1">
                    <span className="text-xl font-black text-blood-600 dark:text-blood-400 block">{bg}</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white block">{count}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">donors</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. DONATION CAMPS TAB */}
      {activeTab === 'camps' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Campaigns & Drives ({camps.length})
              </h3>
              <p className="text-xs text-slate-500">Organize and manage JMC medical campus blood drives</p>
            </div>

            <button
              onClick={() => setShowAddCampModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Camp</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {camps.map((camp) => (
              <div key={camp.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                    {camp.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">{new Date(camp.start_date).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">{camp.title}</h4>
                <p className="text-xs text-slate-500">{camp.venue}</p>
                <div className="flex justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Collected: {camp.collected_units} / {camp.target_units} units</span>
                  <button
                    onClick={() => {
                      const units = prompt('Enter updated collected units:', camp.collected_units.toString());
                      if (units !== null) {
                        setCamps(prev => prev.map(c => c.id === camp.id ? { ...c, collected_units: parseInt(units) || 0 } : c));
                      }
                    }}
                    className="text-blood-600 font-bold hover:underline"
                  >
                    Update Count
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SYSTEM SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl space-y-6 animate-in fade-in">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              System & Eligibility Settings
            </h3>
            <p className="text-xs text-slate-500">Configure donation recovery rules, hotline numbers, and branding</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <label className="text-xs font-black text-slate-900 dark:text-white block">
                Donation Gap Recovery (Days) *
              </label>
              <p className="text-xs text-slate-500">
                Standard days required before a donor becomes eligible to donate blood again (Default: 90 days / 3 months).
              </p>
              <input
                type="number"
                min={30}
                max={180}
                value={settings.donation_gap_days}
                onChange={(e) => setSettings({ ...settings, donation_gap_days: parseInt(e.target.value) || 90 })}
                className="w-32 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Primary Emergency Hotline
                </label>
                <input
                  type="text"
                  value={settings.emergency_hotline}
                  onChange={(e) => setSettings({ ...settings, emergency_hotline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Secondary Hotline
                </label>
                <input
                  type="text"
                  value={settings.emergency_hotline_alt}
                  onChange={(e) => setSettings({ ...settings, emergency_hotline_alt: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blood-600 hover:bg-blood-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              {settingsSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{settingsSaved ? 'Settings Saved Successfully!' : 'Save System Settings'}</span>
            </button>
          </form>
        </div>
      )}

      {/* 6. AUDIT LOGS TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Security & Audit Logs
          </h3>
          <p className="text-xs text-slate-500">Track sensitive operations, request creations, and administrative actions</p>

          <div className="space-y-2 text-xs font-mono">
            {[
              { action: 'SMART_MATCH_DONOR', entity: 'blood_requests (req-1) -> Dr. Tanvir (O+)', user: 'Dr. Tanvir (Admin)', time: 'Just now', ip: '103.14.22.1' },
              { action: 'APPROVE_REQUEST', entity: 'blood_requests (req-1)', user: 'Dr. Tanvir (Admin)', time: '10 mins ago', ip: '103.14.22.1' },
              { action: 'CREATE_BLOOD_REQUEST', entity: 'blood_requests (req-2)', user: 'Visitor (Turnstile Verified)', time: '2 hours ago', ip: '119.30.41.8' },
              { action: 'CRON_REMINDERS_QUEUE', entity: 'notification_queue (14 queued)', user: 'Cloudflare Worker (Cron: 0 6 * * *)', time: 'Today 06:00 UTC', ip: 'Cloudflare Edge' },
            ].map((log, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-blood-600 mr-2">[{log.action}]</span>
                  <span className="text-slate-700 dark:text-slate-300">{log.entity}</span>
                  <span className="text-slate-400 block text-[10px]">By: {log.user} ({log.ip})</span>
                </div>
                <span className="text-slate-400 text-[10px]">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCsvImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Import Donors from CSV
            </h3>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Full Name, Phone, Blood Group, District, Upazila"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCsvImportModal(false)}
                className="px-4 py-2 rounded-xl border text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleImportCsv}
                className="px-5 py-2 rounded-xl bg-blood-600 text-white text-xs font-bold hover:bg-blood-700"
              >
                Import Donors
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Donor Modal */}
      {showAddDonorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Add New Donor Record
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as any;
              const newD: Profile = {
                id: 'donor-' + Date.now(),
                role: 'member',
                full_name: form.fullName.value,
                phone: form.phone.value,
                blood_group: form.bg.value,
                district: form.dist.value,
                upazila: form.up.value,
                medical_college_unit: form.unit.value,
                phone_hidden: false,
                total_donations: 0,
                is_available: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setDonors([newD, ...donors]);
              setShowAddDonorModal(false);
            }} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Full Name</label>
                <input name="fullName" required className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800" />
              </div>
              <div>
                <label className="font-bold block mb-1">Phone</label>
                <input name="phone" required className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Blood Group</label>
                  <select name="bg" className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800 font-bold">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">District</label>
                  <input name="dist" defaultValue="Jashore" className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800" />
                </div>
              </div>
              <div>
                <label className="font-bold block mb-1">Upazila</label>
                <input name="up" defaultValue="Jashore Sadar" className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddDonorModal(false)} className="px-3 py-1.5 rounded-lg border">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blood-600 text-white font-bold">
                  Save Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Camp Modal */}
      {showAddCampModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Schedule New Blood Camp
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as any;
              const newC: DonationCamp = {
                id: 'camp-' + Date.now(),
                title: form.title.value,
                venue: form.venue.value,
                district: 'Jashore',
                organizer: 'JMC Blood Forum',
                start_date: form.date.value,
                end_date: form.date.value,
                target_units: parseInt(form.target.value) || 100,
                collected_units: 0,
                status: 'upcoming',
                contact_person: form.person.value,
                contact_phone: form.phone.value,
                created_at: new Date().toISOString(),
              };
              setCamps([newC, ...camps]);
              setShowAddCampModal(false);
            }} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Camp Title</label>
                <input name="title" required placeholder="e.g. JUST Campus Drive 2026" className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800" />
              </div>
              <div>
                <label className="font-bold block mb-1">Venue / Location</label>
                <input name="venue" required placeholder="Auditorium, JMC, Jashore" className="w-full p-2 rounded-lg border bg-slate-50 dark:bg-slate-800" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddCampModal(false)} className="px-3 py-1.5 rounded-lg border">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blood-600 text-white font-bold">
                  Schedule Camp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
