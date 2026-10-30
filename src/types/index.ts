export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UserRole = 'admin' | 'member';

export type UrgencyLevel = 'critical' | 'urgent' | 'standard';

export type RequestStatus = 'pending' | 'approved' | 'donor_found' | 'fulfilled' | 'cancelled';

export type CampStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string;
  phone_hidden: boolean;
  blood_group: BloodGroup;
  district: string;
  upazila: string;
  medical_college_unit?: string;
  last_donation_date?: string | null;
  total_donations: number;
  is_available: boolean;
  weight_kg?: number;
  gender?: 'male' | 'female' | 'other';
  notes?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface BloodRequest {
  id: string;
  patient_name: string;
  blood_group: BloodGroup;
  units: number;
  hospital: string;
  district: string;
  location_details?: string;
  needed_date: string;
  needed_time?: string;
  contact_name: string;
  contact_phone: string;
  contact_alt_phone?: string;
  urgency: UrgencyLevel;
  medical_reason?: string;
  status: RequestStatus;
  turnstile_verified?: boolean;
  assigned_donor_id?: string;
  requested_by?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  donor_id: string;
  donation_date: string;
  patient_name?: string;
  hospital: string;
  blood_group: BloodGroup;
  units: number;
  certificate_id?: string;
  verified_by_admin: boolean;
  request_id?: string;
  notes?: string;
  created_at: string;
}

export interface DonationCamp {
  id: string;
  title: string;
  title_bn?: string;
  description?: string;
  organizer: string;
  venue: string;
  district: string;
  start_date: string;
  end_date: string;
  target_units: number;
  collected_units: number;
  status: CampStatus;
  contact_person?: string;
  contact_phone?: string;
  banner_url?: string;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  name_bn: string;
  description: string;
  description_bn: string;
  icon_name: string;
  min_donations: number;
  badge_color: string;
}

export interface DonorBadge {
  id: string;
  donor_id: string;
  badge_id: string;
  awarded_at: string;
  badge?: Badge;
}

export interface SiteSettings {
  id: string;
  donation_gap_days: number;
  organization_name: string;
  organization_name_bn: string;
  tagline: string;
  tagline_bn: string;
  emergency_hotline: string;
  emergency_hotline_alt: string;
  notification_email: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  ip_address?: string;
  created_at: string;
}

