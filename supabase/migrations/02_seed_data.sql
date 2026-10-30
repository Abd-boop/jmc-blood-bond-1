-- ========================================================
-- JMC Blood Bond (যশোর মেডিকেল কলেজ রক্তদান কেন্দ্র)
-- Migration 02: Seed Data
-- Settings, Badges, Hospitals, JMC Donors & Requests
-- ========================================================

-- 1. Insert Initial Site Settings
INSERT INTO public.site_settings (
    id,
    donation_gap_days,
    organization_name,
    organization_name_bn,
    tagline,
    tagline_bn,
    emergency_hotline,
    emergency_hotline_alt,
    notification_email
) VALUES (
    'global',
    90,
    'JMC Blood Bond',
    'যশোর মেডিকেল কলেজ রক্তদান কেন্দ্র',
    'Ran by Jashore Medical College Students',
    'যশোর মেডিকেল কলেজের একঝাঁক স্বপ্নবাজ ভবিষ্যৎ চিকিৎসকদের নিবেদিত রক্তদান ফোরাম',
    '+8801725-894120',
    '+8801931-456789',
    'blood.jmc@gmail.com'
) ON CONFLICT (id) DO UPDATE SET
    donation_gap_days = EXCLUDED.donation_gap_days,
    emergency_hotline = EXCLUDED.emergency_hotline;


-- 2. Insert Milestone Badges
INSERT INTO public.badges (
    id,
    name,
    name_bn,
    description,
    description_bn,
    icon_name,
    min_donations,
    badge_color
) VALUES
(
    'first_donation',
    'First Blood',
    'প্রথম রক্তদান',
    'Awarded for stepping forward and completing your first life-saving blood donation.',
    'জীবনের প্রথম রক্তদানের মহৎ দৃষ্টান্ত স্থাপনের স্বীকৃতিস্বরূপ।',
    'HeartHandshake',
    1,
    '#e11d48'
),
(
    'life_saver_bronze',
    'Bronze Life Saver',
    'ব্রোঞ্জ জীবন রক্ষক',
    'Completed 3 successful blood donations. You have touched at least 9 lives!',
    '৩ বার রক্তদান সম্পন্ন করে কমপক্ষে ৯ জন মুমূর্ষু রোগীর পাশে দাঁড়ানোর স্মারক।',
    'Award',
    3,
    '#d97706'
),
(
    'guardian_silver',
    'Silver Guardian',
    'সিলভার অভিভাবক',
    'Completed 5+ blood donations. A steadfast guardian for patients in Jashore.',
    '৫+ বার রক্তদানকারী অবিচল মানবিক অভিভাবক।',
    'ShieldCheck',
    5,
    '#64748b'
),
(
    'hero_gold',
    'Gold Hero',
    'গোল্ড হিরো',
    'Completed 10+ blood donations. A true hero for critical surgery patients.',
    '১০+ বার রক্তদান সম্পন্নকারী অনন্য মানবিক অনুপ্রেরণা।',
    'Crown',
    10,
    '#eab308'
),
(
    'legend_platinum',
    'Platinum Legend',
    'প্ল্যাটিনাম কিংবদন্তি',
    'Completed 25+ blood donations. A legendary savior in south-western Bangladesh.',
    '২৫+ বার রক্তদানকারী মহিমান্বিত মানবিক কিংবদন্তি।',
    'Sparkles',
    25,
    '#8b5cf6'
),
(
    'jmc_medic_hero',
    'JMC Medic Hero',
    'জেএমসি মেডিকেল হিরো',
    'Medical student / intern doctor actively balancing medicine studies and blood donations.',
    'চিকিৎসা বিজ্ঞানের পড়াশোনার পাশাপাশি নিয়মিত রক্তদানে নিয়োজিত জেএমসি যোদ্ধা।',
    'Stethoscope',
    1,
    '#0284c7'
)
ON CONFLICT (id) DO NOTHING;


-- 3. Insert Upcoming & Past Blood Donation Camps
INSERT INTO public.donation_camps (
    title,
    title_bn,
    description,
    organizer,
    venue,
    district,
    start_date,
    end_date,
    target_units,
    collected_units,
    status,
    contact_person,
    contact_phone
) VALUES
(
    'JMC Campus Mega Blood Drive 2026',
    'জেএমসি ক্যাম্পাস মেগা রক্তদান কর্মসূচি ২০২৬',
    'Annual emergency blood reserve drive by JMC Batch 11 & 12 students to supply Jashore 250 Bed Hospital.',
    'Jashore Medical College Students Blood Forum',
    'JMC Main Academic Auditorium, Jashore',
    'Jashore',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '6 days',
    150,
    0,
    'upcoming',
    'Dr. Tanvir Ahmed (Intern)',
    '+8801725-894120'
),
(
    'JUST Campus Mobile Donation Camp',
    'যবিপ্রবি ক্যাম্পাস মোবাইল রক্তদান ক্যাম্প',
    'Joint blood donation campaign with Jashore University of Science and Technology.',
    'JMC Blood Bond & JUST Student Union',
    'Central Cafeteria Plaza, JUST Campus, Jashore',
    'Jashore',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '15 days',
    80,
    0,
    'upcoming',
    'Tahmid Hasan (Batch 12)',
    '+8801912-334455'
),
(
    'World Blood Donor Day Jashore Drive',
    'বিশ্ব রক্তদাতা দিবস যশোর কর্মসূচি',
    'Central public blood grouping and donation drive at Daratana, Jashore.',
    'JMC Students Association & Sandhani JMC Unit',
    'Daratana Town Hall Ground, Jashore',
    'Jashore',
    NOW() - INTERVAL '40 days',
    NOW() - INTERVAL '39 days',
    120,
    134,
    'completed',
    'Raihan Kabir (JMC Batch 10)',
    '+8801811-223344'
);


-- 4. Insert Sample Blood Requests
INSERT INTO public.blood_requests (
    patient_name,
    blood_group,
    units,
    hospital,
    district,
    location_details,
    needed_date,
    needed_time,
    contact_name,
    contact_phone,
    urgency,
    medical_reason,
    status,
    turnstile_verified
) VALUES
(
    'Sultana Begum',
    'O-',
    2,
    '250 Bed General Hospital, Jashore',
    'Jashore',
    'Gynecology Ward 3, Bed 14',
    CURRENT_DATE,
    'Within 3 hours',
    'Karim Ullah (Husband)',
    '+8801711-223344',
    'critical',
    'Emergency C-Section surgery with massive postpartum bleeding (PPH). Rare O- blood urgently needed.',
    'approved',
    true
),
(
    'Little Ayan (Age 6)',
    'B+',
    1,
    'Ad-din Sakina Medical College Hospital, Jashore',
    'Jashore',
    'Pediatric Thalassemia Day-care Unit',
    CURRENT_DATE + INTERVAL '1 day',
    'Tomorrow 10:00 AM',
    'Rahima Khatun (Mother)',
    '+8801922-334455',
    'urgent',
    'Regular monthly blood transfusion for Beta Thalassemia Major child. Hemoglobin level dropped to 6.2.',
    'approved',
    true
),
(
    'Subrata Roy',
    'AB-',
    2,
    'Queens Hospital, Jashore',
    'Jashore',
    'ICU Room 204, Garikhana Road',
    CURRENT_DATE + INTERVAL '2 days',
    '2:00 PM',
    'Bikash Roy (Brother)',
    '+8801833-445566',
    'urgent',
    'Severe trauma from road accident on Jashore-Khulna Highway. Multiple bone fractures scheduled for orthopedic surgery.',
    'approved',
    true
),
(
    'Md. Shahadat Hossain',
    'A+',
    1,
    'Ibn Sina Hospital & Diagnostic Center, Jashore',
    'Jashore',
    'Ward 4, Bed 8',
    CURRENT_DATE + INTERVAL '3 days',
    'Morning',
    'Monir Hossain (Son)',
    '+8801744-556677',
    'standard',
    'Scheduled gallbladder laparoscopy surgery.',
    'approved',
    true
);

