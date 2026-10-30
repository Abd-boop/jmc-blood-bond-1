# 🩸 JMC Blood Bond (যশোর মেডিকেল কলেজ রক্তদান ফোরাম)

A full-stack, production-ready Blood Donation & Emergency Request Platform founded and operated by the students and intern doctors of **Jashore Medical College (JMC)**, Bangladesh.

[![Hosting: Cloudflare Pages](https://img.shields.io/badge/Hosting-Cloudflare%20Pages-orange.svg)](https://pages.cloudflare.com)
[![Backend: Supabase](https://img.shields.io/badge/Backend-Supabase-emerald.svg)](https://supabase.com)
[![Security: Cloudflare Turnstile](https://img.shields.io/badge/Bot%20Defense-Cloudflare%20Turnstile-blue.svg)](https://www.cloudflare.com/products/turnstile/)
[![Frontend: React + Vite + TS](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TS%20%7C%20Tailwind-crimson.svg)](https://vitejs.dev)

---

## 📋 Table of Contents
1. [Tech Stack](#-tech-stack)
2. [Key Features](#-key-features)
3. [Architecture & Security](#-architecture--security)
4. [Project Structure](#-project-structure)
5. [Step-by-Step Setup Guide](#-step-by-step-setup-guide)
   - [Phase 1: Supabase Setup & SQL Migrations](#phase-1-supabase-setup--sql-migrations)
   - [Phase 2: Cloudflare Turnstile Setup](#phase-2-cloudflare-turnstile-setup)
   - [Phase 3: Local Development](#phase-3-local-development)
   - [Phase 4: Cloudflare Pages & Functions Deployment](#phase-4-cloudflare-pages--functions-deployment)
6. [Scheduled Daily Reminders (Cron)](#-scheduled-daily-reminders-cron)
7. [Roles & Permissions](#-roles--permissions)
8. [License & Credits](#-license--credits)

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite 6, TypeScript 5.7, Tailwind CSS 3.4, Lucide Icons, Canvas Confetti.
- **Backend / Database**: Supabase (PostgreSQL 15+, Row Level Security, Auth, Triggers, Functions).
- **Serverless & Edge**: Cloudflare Pages Functions (`/api/create-blood-request`, `/api/verify-turnstile`, `/api/cron-reminders`).
- **Bot Defense**: Cloudflare Turnstile (client-side widget + server-side siteverify endpoint).
- **Scheduled Jobs**: Cloudflare Cron Triggers (`0 6 * * *` daily at 12:00 PM BST / 06:00 UTC).
- **Mobile & Accessibility**: Mobile-First, Bilingual (বাংলা / English), Light/Dark Mode, PWA Installable.

---

## 🌟 Key Features

1. **Bilingual & Medical-First**:
   - Full toggle between **বাংলা (Bengali)** and **English**.
   - Tailored for Jashore 250 Bed General Hospital, Ad-din Sakina Medical College Hospital, Queens Hospital, and south-western Bangladesh.
2. **Donor Logic & Eligibility Calculation**:
   - Automatically tracks the 90-day safe whole-blood recovery window from `last_donation_date`.
   - Dynamic badges: `"Available Now"` (Green Pulse) or `"Available in X days"` (Amber countdown).
   - **Phone Privacy Toggle**: Donors (especially female donors and students) can hide their phone number from public view while remaining reachable via JMC admin coordinators.
3. **Emergency Blood Requests**:
   - Turnstile bot-protected emergency form with hospital quick-selection chips.
   - Urgency tiers: **Critical** (Surgery/Accident), **Urgent** (Within 24 hours), **Standard**.
   - Instant WhatsApp formatted broadcast message generator with one-click copy & share.
4. **Member Dashboard**:
   - Circular recovery eligibility gauge with celebratory confetti on reaching eligibility.
   - Milestone Badges: *First Blood*, *Bronze Life Saver (3+)*, *Silver Guardian (5+)*, *Gold Hero (10+)*, *Platinum Legend (25+)*, *JMC Medic Hero*.
   - Printable & downloadable official certificate of appreciation with JMC medical seal & QR verification.
5. **Full Admin Control Panel (`/admin`)**:
   - **Analytics & Inventory**: Live blood group breakdown, requests review queue, camp statistics.
   - **Donor CRUD**: Filter by group, district, upazila, availability, with CSV Import and Export.
   - **Request Management**: Status transitions (`Pending` $\to$ `Approved` $\to$ `Donor Found` $\to$ `Fulfilled` / `Cancelled`).
   - **Camps Management**: Schedule upcoming mobile drives and update collected unit counts.
   - **Configurable Settings**: Modify donation gap days (default 90) and emergency hotline numbers.
   - **Security Audit Logs**: Track administrative and sensitive operations.

---

## 🔒 Architecture & Security

```
[ Visitor / Donor / Admin ]
             │
             ▼
  ┌────────────────────────────────────────────────────────┐
  │         Cloudflare Edge (Pages CDN + WAF)              │
  │  - Static Assets (HTML5, JS, CSS, PWA Manifest)        │
  │  - Client Turnstile Widget Verification                │
  └──────────────────────────┬─────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌───────────────────────────────┐  ┌────────────────────────────────────┐
│   Direct Supabase Client      │  │ Cloudflare Pages Functions (/api)  │
│   (Vite Frontend)             │  │ - verify-turnstile.ts              │
│   • Uses PUBLIC ANON KEY ONLY │  │ - create-blood-request.ts          │
│   • Enforces strict RLS rules │  │ - cron-reminders.ts (Daily Cron)   │
│   • Restricted by auth.uid()  │  │ • Uses SERVICE_ROLE KEY (Secrets)  │
└───────────────┬───────────────┘  └─────────────────┬──────────────────┘
                │                                    │
                └─────────────────┬──────────────────┘
                                  ▼
                ┌───────────────────────────────────┐
                │        Supabase PostgreSQL        │
                │  - Strict RLS on EVERY table      │
                │  - Security Definer `is_admin()`  │
                │  - Auto-badge triggers & audit    │
                └───────────────────────────────────┘
```

> **Strict Security Guarantees:**
> - `SUPABASE_SERVICE_ROLE_KEY` is **NEVER** bundled into frontend client code. It lives solely as an encrypted Cloudflare Pages environment secret.
> - Every PostgreSQL table has `ROW LEVEL SECURITY` enabled with explicit `FOR SELECT`, `FOR INSERT`, `FOR UPDATE`, and `FOR ALL` policies.
> - Profile roles (`admin`) cannot be self-escalated due to database trigger validation `public.protect_profile_role()`.

---

## 📁 Project Structure

```
├── functions/                     # Cloudflare Pages Functions (Serverless Edge)
│   ├── api/
│   │   ├── create-blood-request.ts# Turnstile check + service_role DB insert
│   │   ├── cron-reminders.ts      # Daily scheduled recovery reminder worker
│   │   └── verify-turnstile.ts    # Cloudflare Turnstile token validation
│   └── types.d.ts                 # Edge environment types
├── public/
│   ├── favicon.svg                # Crimson blood droplet with medical cross
│   └── manifest.json              # PWA Web App Manifest
├── src/
│   ├── components/                # Modular UI components
│   │   ├── CertificateCard.tsx    # Printable official JMC donor certificate
│   │   ├── Footer.tsx             # Responsive bilingual footer
│   │   ├── Navbar.tsx             # Sticky navigation with theme/lang toggles
│   │   ├── ShareModal.tsx         # Pre-formatted WhatsApp/Facebook sharer
│   │   ├── TurnstileWidget.tsx    # Cloudflare Turnstile bot protection
│   │   └── UrgentRequestTicker.tsx# Live emergency request alert banner
│   ├── context/
│   │   ├── AuthContext.tsx        # Supabase auth + roles + demo switchers
│   │   ├── LanguageContext.tsx    # Bilingual (Bangla/English) translation engine
│   │   └── ThemeContext.tsx       # Dark / Light mode provider
│   ├── data/
│   │   └── mockData.ts            # Realistic Jashore hospitals, donors & camps
│   ├── pages/
│   │   ├── AdminPage.tsx          # Full-featured /admin portal
│   │   ├── CampsPage.tsx          # Campus donation drives & campaigns
│   │   ├── DashboardPage.tsx      # Donor dashboard & eligibility countdown
│   │   ├── HomePage.tsx           # Public landing page with stats & groups
│   │   ├── LoginPage.tsx          # Auth with demo login buttons
│   │   ├── RequestBloodPage.tsx   # Emergency blood request form
│   │   └── RequestsFeedPage.tsx   # Live approved requests feed
│   ├── types/
│   │   └── index.ts               # Core TypeScript definitions
│   ├── App.tsx                    # Main router
│   ├── index.css                  # Tailwind styles
│   └── main.tsx                   # React root entry
├── supabase/
│   └── migrations/
│       ├── 01_initial_schema.sql  # Schema, RLS policies, triggers & functions
│       └── 02_seed_data.sql       # Seed settings, badges, camps, hospitals
├── .env.example                   # Environment variable template
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── wrangler.toml                  # Cloudflare Pages & Cron trigger configuration
```

---

## 🚀 Step-by-Step Setup Guide

### Phase 1: Supabase Setup & SQL Migrations

1. Go to [https://supabase.com](https://supabase.com) and create a new project (e.g. `jmc-blood-bond`).
2. In the Supabase Dashboard, open the **SQL Editor** from the left navigation.
3. Open `supabase/migrations/01_initial_schema.sql`, paste the SQL into the editor, and click **Run**.
   - This sets up all 8 tables, indexes, security definer functions, and strict RLS policies.
4. Open `supabase/migrations/02_seed_data.sql`, paste into the editor, and click **Run**.
   - This populates badges, default settings, and sample JMC student donors.
5. In Supabase Dashboard $\to$ **Project Settings** $\to$ **API**:
   - Copy **Project URL**
   - Copy **Project API Key (`anon` public key)**
   - Copy **Project API Key (`service_role` secret key)** (Save securely!)

---

### Phase 2: Cloudflare Turnstile Setup

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) $\to$ **Turnstile**.
2. Click **Add Site**:
   - Site name: `JMC Blood Bond`
   - Domain: your domain (or `localhost` for local development)
   - Widget Mode: **Managed** (or Non-interactive)
3. Copy your **Site Key** and **Secret Key**.

---

### Phase 3: Local Development

1. Create your local `.env` file:
   ```bash
   cp .env.example .env
   ```
2. Fill in your keys in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   VITE_TURNSTILE_SITE_KEY=0x4AAAAAA...
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Testing Without Supabase First?**
> The application has built-in offline mock data fallbacks! You can immediately click **"Demo Admin (ডাক্তার)"** or **"Demo Donor (সাদিয়া)"** on the Login page to test every feature without configuring backend credentials.

---

### Phase 4: Cloudflare Pages & Functions Deployment

#### Option A: Connect via Git (Recommended)
1. Push your repository to GitHub / GitLab.
2. In Cloudflare Dashboard, go to **Workers & Pages** $\to$ **Create Application** $\to$ **Pages** $\to$ **Connect to Git**.
3. Configure build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. In **Settings** $\to$ **Environment variables**:
   - Add frontend public variables:
     - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
     - `VITE_SUPABASE_ANON_KEY`: `your-anon-key`
     - `VITE_TURNSTILE_SITE_KEY`: `your-turnstile-site-key`
   - Add backend secrets (used by Functions):
     - `SUPABASE_URL`: `https://your-project.supabase.co`
     - `SUPABASE_SERVICE_ROLE_KEY`: `your-service-role-secret-key`
     - `CLOUDFLARE_TURNSTILE_SECRET_KEY`: `your-turnstile-secret-key`
     - `CRON_SECRET`: `generate-a-secure-random-string`

#### Option B: Deploy via Wrangler CLI
```bash
npm run build
npx wrangler pages deploy dist --project-name=jmc-blood-bond
```

---

## ⏰ Scheduled Daily Reminders (Cron)

In `wrangler.toml`, the daily cron trigger is configured as:
```toml
[triggers]
crons = ["0 6 * * *"] # 06:00 UTC = 12:00 PM BST daily
```

**How it works:**
1. Every day at noon Bangladesh Standard Time, the Cloudflare Worker executes `/api/cron-reminders`.
2. It fetches `site_settings.donation_gap_days` (default 90).
3. It finds all donors whose `last_donation_date == (Today - 90 days)`.
4. It queues personalized bilingual recovery notifications into `notification_queue` and writes a security audit entry into `audit_logs`.

---

## 👥 Roles & Permissions

| Role | Permissions |
|---|---|
| **Visitor** | Search eligible donors, filter by blood group/location, view urgent requests, submit blood request with Turnstile verification. |
| **Member (Donor)** | All visitor features + personal dashboard, eligibility countdown, download official PDF certificates, view milestone badges, hide/unhide mobile number. |
| **Admin** | All member features + `/admin` portal, donor CRUD, CSV import/export, approve/fulfill blood requests, schedule donation camps, edit gap days and hotline settings, inspect audit logs. |

---

## 🤝 Community & Credits

- **Initiative**: Jashore Medical College Students Blood Donation Forum (যশোর মেডিকেল কলেজ রক্তদান কেন্দ্র)
- **Medical Patronage**: Intern Doctors & Sandhani JMC Unit
- **Emergency Hotline**: `+880 1725-894120` (24/7)
- **Email**: `blood.jmc@gmail.com`

