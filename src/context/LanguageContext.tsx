import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'bn' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  bn: {
    // Brand & Header
    'app.title': 'যশোর মেডিকেল কলেজ রক্তদান ফোরাম',
    'app.subtitle': 'জেএমসি শিক্ষার্থীদের পরিচালিত জরুরি রক্তদান নেটওয়ার্ক',
    'nav.home': 'হোম',
    'nav.search': 'রক্তদাতা খুঁজুন',
    'nav.request': 'রক্তের আবেদন',
    'nav.requests_feed': 'জরুরি রক্তের চাহিদা',
    'nav.camps': 'রক্তদান কর্মসূচি',
    'nav.login': 'লগইন / নিবন্ধন',
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.admin': 'এডমিন প্যানেল',
    'nav.logout': 'লগআউট',
    'btn.donate_now': 'রক্তদাতা হোন',
    'btn.request_blood': 'জরুরি রক্তের আবেদন',
    'btn.search': 'অনুসন্ধান করুন',
    'btn.call_now': 'সরাসরি কল করুন',
    'btn.whatsapp': 'হোয়াটসঅ্যাপ মেসেজ',
    'btn.share': 'শেয়ার করুন',
    'btn.copy_link': 'লিংক কপি করুন',

    // Hero Section
    'hero.badge': 'যশোর মেডিকেল কলেজ শিক্ষার্থীদের সার্বিক তত্ত্বাবধানে পরিচালিত',
    'hero.title_pre': 'এক ব্যাগ রক্ত,',
    'hero.title_highlight': 'একটি নতুন জীবনের আশা',
    'hero.description': 'দক্ষিণ-পশ্চিমাঞ্চলের মুমূর্ষু রোগীদের জরুরি রক্তের প্রয়োজনে যশোর মেডিকেল কলেজের শিক্ষার্থী ও মানবিক রক্তদাতাদের এক অনন্য মেলবন্ধন। ঘরে বসেই কয়েক সেকেন্ডে রক্তদাতা খুঁজুন।',
    'hero.emergency_helpline': 'জরুরি হেল্পলাইন (২৪/৭):',

    // Stats
    'stats.donors': 'নিবন্ধিত রক্তদাতা',
    'stats.lives_saved': 'বাঁচানো হয়েছে জীবন',
    'stats.requests_fulfilled': 'রক্ত সংগ্রহ সম্পন্ন',
    'stats.camps_held': 'সফল রক্তদান ক্যাম্প',

    // Blood Group
    'blood.grid_title': 'রক্তের গ্রুপ অনুযায়ী রক্তদাতা অনুসন্ধান',
    'blood.grid_subtitle': 'আপনার কাঙ্ক্ষিত রক্তের গ্রুপে ক্লিক করে তাৎক্ষণিক উপযুক্ত দাতা খুঁজুন',

    // How it works
    'how.title': 'কীভাবে কাজ করে রক্তবন্ধন প্ল্যাটফর্ম?',
    'how.subtitle': 'জরুরি মুহূর্তে রক্ত পাওয়া ও দেওয়া এখন আরও দ্রুত ও নির্ভরযোগ্য',
    'how.step1_title': '১. অনুসন্ধান বা আবেদন',
    'how.step1_desc': 'রক্তের গ্রুপ ও এলাকা দিয়ে সরাসরি দাতা খুঁজুন অথবা একটি জরুরি আবেদন ফর্ম পূরণ করুন।',
    'how.step2_title': '২. মেডিকেল টিম যাচাইকরণ',
    'how.step2_desc': 'যশোর মেডিকেল কলেজের ভলান্টিয়ার টিম আবেদনটি তাৎক্ষণিক যাচাই করে অনুমোদিত করে।',
    'how.step3_title': '৩. দ্রুত দাতা সংযোগ',
    'how.step3_desc': 'কাছের উপযুক্ত রক্তদাতাদের সঙ্গে সরাসরি ফোন বা হোয়াটসঅ্যাপে যোগাযোগ করুন।',
    'how.step4_title': '৪. সফল রক্তদান ও স্বীকৃতি',
    'how.step4_desc': 'হাসপাতালে রক্তদান সম্পন্ন হলে রক্তদাতাকে ডিজিটাল সম্মাননা সনদপত্র ও ব্যাজ প্রদান করা হয়।',

    // Urgent Requests
    'urgent.title': 'জরুরি রক্তের চাহিদা (লাইভ)',
    'urgent.subtitle': 'যশোর ও পার্শ্ববর্তী হাসপাতালে এই মুহূর্তে রক্তের জরুরি প্রয়োজন',
    'urgent.no_requests': 'এই মুহূর্তে কোনো জরুরি আবেদন অনুমোদনের অপেক্ষায় নেই।',
    'urgent.units_needed': 'ব্যাগ প্রয়োজন',
    'urgent.patient': 'রোগী:',
    'urgent.hospital': 'হাসপাতাল:',
    'urgent.date': 'প্রয়োজনের তারিখ:',
    'urgent.urgency.critical': 'অতি জরুরি (Critical)',
    'urgent.urgency.urgent': 'জরুরি (Urgent)',
    'urgent.urgency.standard': 'সাধারণ (Standard)',

    // Donor Logic
    'donor.status.available': 'রক্তদানে প্রস্তুত',
    'donor.status.in_days': 'রক্তদানে উপযুক্ত হবেন',
    'donor.days': 'দিন পর',
    'donor.phone_private': 'রক্তদাতার গোপনীয়তার স্বার্থে নম্বরটি সংরক্ষিত। জরুরি প্রয়োজনে হেল্পলাইনে যোগাযোগ করুন।',
    'donor.jmc_unit': 'জেএমসি ইউনিট:',
    'donor.total_donations': 'মোট রক্তদান:',
    'donor.last_donated': 'সর্বশেষ রক্তদান:',
    'donor.never_donated': 'এখনো রক্তদান করেননি (নতুন দাতা)',

    // Request Form
    'form.request_title': 'জরুরি রক্তের জন্য আবেদন ফর্ম',
    'form.request_subtitle': 'সঠিক তথ্য প্রদান করুন। আমাদের টিম দ্রুত যাচাই করে রক্তদাতার ব্যবস্থা করবে।',
    'form.patient_name': 'রোগীর পুরো নাম',
    'form.blood_group': 'রক্তের গ্রুপ',
    'form.units': 'কত ব্যাগ রক্ত প্রয়োজন?',
    'form.hospital': 'হাসপাতালের নাম',
    'form.district': 'জেলা',
    'form.location_details': 'হাসপাতালের ওয়ার্ড/কেবিন ও সুনির্দিষ্ট ঠিকানা',
    'form.needed_date': 'রক্তের প্রয়োজনীয় তারিখ',
    'form.needed_time': 'প্রয়োজনীয় সময় (যেমন: সকাল ১০টা)',
    'form.contact_name': 'যোগাযোগকারীর নাম',
    'form.contact_phone': 'যোগাযোগকারীর মোবাইল নম্বর',
    'form.contact_alt_phone': 'বিকল্প মোবাইল নম্বর (যদি থাকে)',
    'form.urgency': 'জরুরিত্বের মাত্রা',
    'form.medical_reason': 'রোগীর সমস্যা বা কারণ (যেমন: ডেলিভারি, থ্যালাসেমিয়া, দুর্ঘটনা)',
    'form.submit': 'আবেদন জমা দিন',
    'form.submitting': 'জমা দেওয়া হচ্ছে...',
    'form.success': 'আপনার রক্তের আবেদন সফলভাবে জমা হয়েছে! আমাদের টিম দ্রুত পর্যালোচনা করছে।',

    // Search Page
    'search.title': 'রক্তদাতা অনুসন্ধান ও তালিকা',
    'search.subtitle': 'যশোর মেডিকেল কলেজ শিক্ষার্থীদের সরাসরি তথ্যভান্ডার থেকে দাতা নির্বাচন করুন',
    'search.filter_group': 'রক্তের গ্রুপ',
    'search.filter_district': 'জেলা নির্বাচন করুন',
    'search.filter_upazila': 'উপজেলা নির্বাচন করুন',
    'search.filter_availability': 'রক্তদানের প্রাপ্যতা',
    'search.avail_all': 'সকল রক্তদাতা',
    'search.avail_now': 'এই মুহূর্তে প্রস্তুত (Available Now)',
    'search.avail_soon': 'নিকট ভবিষ্যতে উপযুক্ত',
    'search.results_found': 'জন রক্তদাতা পাওয়া গেছে',

    // Dashboard
    'dash.welcome': 'স্বাগতম,',
    'dash.eligibility_title': 'আপনার রক্তদানের যোগ্যতা স্থিতি',
    'dash.eligible_now': 'অভিনন্দন! আপনি এখন রক্তদানের জন্য সম্পূর্ণ উপযুক্ত।',
    'dash.eligible_soon': 'আপনার শারীরিক রিকভারি চলছে। আপনি রক্ত দিতে পারবেন আরও:',
    'dash.my_donations': 'আমার রক্তদানের ইতিহাস',
    'dash.my_badges': 'অর্জিত সম্মাননা ও ব্যাজ',
    'dash.add_donation': 'নতুন রক্তদানের তথ্য যুক্ত করুন',
    'dash.download_cert': 'সনদপত্র ডাউনলোড করুন',
    'dash.phone_privacy': 'সাধারণ ব্যবহারকারীদের কাছে আমার মোবাইল নম্বর গোপন রাখুন',

    // Camps
    'camps.title': 'রক্তদান কর্মসূচি ও ক্যাম্পেইন',
    'camps.subtitle': 'যশোর মেডিকেল কলেজ শিক্ষার্থীদের আয়োজনে চলমান ও আসন্ন কর্মসূচি',
    'camps.upcoming': 'আসন্ন ক্যাম্পেইন',
    'camps.completed': 'সম্পন্ন ক্যাম্পেইন',
    'camps.target': 'লক্ষ্যমাত্রা:',
    'camps.collected': 'সংগৃহীত:',

    // FAQ
    'faq.title': 'সাধারণ জিজ্ঞাসা (FAQ)',
    'faq.q1': 'কতদিন পর পর রক্তদান করা নিরাপদ?',
    'faq.a1': 'একজন সুস্থ প্রাপ্তবয়স্ক নারী বা পুরুষ প্রতি ৯০ দিন (৩ মাস) পর পর নিরাপদে রক্তদান করতে পারেন। আমাদের ওয়েবসাইট স্বয়ংক্রিয়ভাবে আপনার পরবর্তী রক্তদানের দিন গণনা করে।',
    'faq.q2': 'রক্তদান করতে কী কী শারীরিক যোগ্যতা প্রয়োজন?',
    'faq.a2': 'বয়স ১৮ থেকে ৬০ বছরের মধ্যে, ওজন ন্যূনতম ৫০ কেজি (নারীদের ক্ষেত্রে ৪৫ কেজি), এবং রক্তচাপ ও হিমোগ্লোবিন স্বাভাবিক মাত্রায় থাকতে হবে।',
    'faq.q3': 'রক্তদাতার মোবাইল নম্বর কি সুরক্ষিত?',
    'faq.a3': 'হ্যাঁ, যেকোনো রক্তদাতা প্রোফাইল থেকে "Hide Phone" অপশন চালু রাখলে তার নম্বর পাবলিক সাইটে প্রদর্শিত হয় না। শুধুমাত্র অনুমোদিত এডমিন ও ভেরিফায়েড আবেদনকারী প্রয়োজনে যোগাযোগ করতে পারেন।',

    // Footer
    'footer.about_jmc': 'যশোর মেডিকেল কলেজের একঝাঁক মানবিক শিক্ষার্থীর নিবেদিত প্রয়াস। রক্তদানের মাধ্যমে প্রতিটি মানুষের পাশে দাঁড়ানোই আমাদের মূল অঙ্গীকার।',
    'footer.quick_links': 'প্রয়োজনীয় লিংক',
    'footer.helpline': 'জরুরি হটলাইন',
    'footer.copyright': 'সর্বস্বত্ব সংরক্ষিত © ২০২৬ যশোর মেডিকেল কলেজ রক্তদান ফোরাম।',
  },
  en: {
    // Brand & Header
    'app.title': 'JMC Blood Bond',
    'app.subtitle': 'Run by Jashore Medical College Students',
    'nav.home': 'Home',
    'nav.search': 'Find Donors',
    'nav.request': 'Request Blood',
    'nav.requests_feed': 'Urgent Requests',
    'nav.camps': 'Donation Camps',
    'nav.login': 'Login / Register',
    'nav.dashboard': 'Dashboard',
    'nav.admin': 'Admin Panel',
    'nav.logout': 'Logout',
    'btn.donate_now': 'Become a Donor',
    'btn.request_blood': 'Request Emergency Blood',
    'btn.search': 'Search Donors',
    'btn.call_now': 'Call Directly',
    'btn.whatsapp': 'WhatsApp Message',
    'btn.share': 'Share',
    'btn.copy_link': 'Copy Link',

    // Hero Section
    'hero.badge': 'Supervised by Jashore Medical College Students',
    'hero.title_pre': 'One Bag of Blood,',
    'hero.title_highlight': 'A Brand New Chance at Life',
    'hero.description': 'Connecting critical hospital patients in south-western Bangladesh with verified voluntary blood donors and medical student volunteers in seconds.',
    'hero.emergency_helpline': 'Emergency Helpline (24/7):',

    // Stats
    'stats.donors': 'Registered Donors',
    'stats.lives_saved': 'Lives Touched',
    'stats.requests_fulfilled': 'Requests Fulfilled',
    'stats.camps_held': 'Camps Organized',

    // Blood Group
    'blood.grid_title': 'Browse Donors by Blood Group',
    'blood.grid_subtitle': 'Select any blood type to instantly filter ready-to-donate lifesavers',

    // How it works
    'how.title': 'How JMC Blood Bond Works',
    'how.subtitle': 'Fast, transparent, and completely volunteer-driven medical care',
    'how.step1_title': '1. Search or Request',
    'how.step1_desc': 'Filter donors by blood group and upazila, or submit a verified emergency request.',
    'how.step2_title': '2. Medical Student Review',
    'how.step2_desc': 'Our JMC student team rapidly reviews hospital slips to ensure genuine urgency.',
    'how.step3_title': '3. Connect Direct',
    'how.step3_desc': 'Call or message compatible, eligible donors directly via phone or WhatsApp.',
    'how.step4_title': '4. Certificates & Recognition',
    'how.step4_desc': 'Receive verified digital donor certificates and milestone recognition badges.',

    // Urgent Requests
    'urgent.title': 'Live Urgent Blood Requests',
    'urgent.subtitle': 'Patients currently needing immediate transfusion in Jashore area hospitals',
    'urgent.no_requests': 'No pending urgent requests right now. All requests fulfilled!',
    'urgent.units_needed': 'Units Required',
    'urgent.patient': 'Patient:',
    'urgent.hospital': 'Hospital:',
    'urgent.date': 'Needed Date:',
    'urgent.urgency.critical': 'Critical Emergency',
    'urgent.urgency.urgent': 'Urgent',
    'urgent.urgency.standard': 'Standard',

    // Donor Logic
    'donor.status.available': 'Eligible Now',
    'donor.status.in_days': 'Eligible in',
    'donor.days': 'days',
    'donor.phone_private': 'Number hidden per donor privacy request. Contact JMC helpline for coordination.',
    'donor.jmc_unit': 'JMC Unit:',
    'donor.total_donations': 'Total Donations:',
    'donor.last_donated': 'Last Donated:',
    'donor.never_donated': 'New Donor (No previous record)',

    // Request Form
    'form.request_title': 'Emergency Blood Request Form',
    'form.request_subtitle': 'Please provide accurate hospital and patient details for quick verification.',
    'form.patient_name': 'Patient Full Name',
    'form.blood_group': 'Blood Group',
    'form.units': 'Units Required',
    'form.hospital': 'Hospital Name',
    'form.district': 'District',
    'form.location_details': 'Ward / Cabin / Bed No. & Address Details',
    'form.needed_date': 'Date Needed',
    'form.needed_time': 'Time Needed (e.g. 10:00 AM)',
    'form.contact_name': 'Contact Person Name',
    'form.contact_phone': 'Contact Phone Number',
    'form.contact_alt_phone': 'Alternative Phone (Optional)',
    'form.urgency': 'Urgency Level',
    'form.medical_reason': 'Medical Reason (e.g. C-Section, Thalassemia, Accident, Surgery)',
    'form.submit': 'Submit Request',
    'form.submitting': 'Submitting...',
    'form.success': 'Your blood request has been submitted successfully! Our student coordinators are on it.',

    // Search Page
    'search.title': 'Find Blood Donors',
    'search.subtitle': 'Browse and connect with verified voluntary donors across Jashore & Khulna',
    'search.filter_group': 'Blood Group',
    'search.filter_district': 'Select District',
    'search.filter_upazila': 'Select Upazila',
    'search.filter_availability': 'Availability Status',
    'search.avail_all': 'All Donors',
    'search.avail_now': 'Available Right Now',
    'search.avail_soon': 'Eligible in Future',
    'search.results_found': 'donors matched',

    // Dashboard
    'dash.welcome': 'Welcome,',
    'dash.eligibility_title': 'Your Blood Donation Status',
    'dash.eligible_now': 'Congratulations! You are eligible to donate blood today.',
    'dash.eligible_soon': 'Recovery in progress. You can donate again in:',
    'dash.my_donations': 'My Donation History',
    'dash.my_badges': 'Milestone Badges',
    'dash.add_donation': 'Log a Donation',
    'dash.download_cert': 'Download Certificate',
    'dash.phone_privacy': 'Keep my phone number private from public visitors',

    // Camps
    'camps.title': 'Donation Camps & Drives',
    'camps.subtitle': 'Active and upcoming campaigns organized by Jashore Medical College students',
    'camps.upcoming': 'Upcoming Camps',
    'camps.completed': 'Completed Camps',
    'camps.target': 'Target Units:',
    'camps.collected': 'Collected Units:',

    // FAQ
    'faq.title': 'Frequently Asked Questions (FAQ)',
    'faq.q1': 'How often can I safely donate blood?',
    'faq.a1': 'A healthy adult can safely donate whole blood every 90 days (3 months). Our system automatically tracks your recovery window.',
    'faq.q2': 'What are the basic medical requirements to donate?',
    'faq.a2': 'Age between 18 and 60, weight minimum 50kg (45kg for females), with normal blood pressure and healthy hemoglobin levels.',
    'faq.q3': 'Is donor privacy protected?',
    'faq.a3': 'Yes! Donors can toggle the "Hide Phone" setting anytime to prevent their number from being visible to public search.',

    // Footer
    'footer.about_jmc': 'An initiative founded and operated by passionate Jashore Medical College MBBS students and intern doctors dedicated to emergency healthcare.',
    'footer.quick_links': 'Quick Links',
    'footer.helpline': '24/7 Helpline',
    'footer.copyright': 'All rights reserved © 2026 Jashore Medical College Students Blood Forum.',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'bn',
  setLang: () => {},
  toggleLang: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('jmc_lang') as Language) || 'bn';
  });

  useEffect(() => {
    localStorage.setItem('jmc_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => (prev === 'bn' ? 'en' : 'bn'));
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

