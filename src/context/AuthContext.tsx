import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole, BloodGroup } from '../types';
import { MOCK_DONORS } from '../data/mockData';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  role: UserRole | 'visitor';
  isAdmin: boolean;
  loading: boolean;
  isEligible: boolean;
  daysUntilEligible: number;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string, meta: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  demoLoginAsAdmin: () => void;
  demoLoginAsDonor: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: 'visitor',
  isAdmin: false,
  loading: true,
  isEligible: true,
  daysUntilEligible: 0,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  updateProfile: async () => ({ success: false }),
  demoLoginAsAdmin: () => {},
  demoLoginAsDonor: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [donationGapDays] = useState<number>(90);

  // Calculate eligibility helper
  const calculateEligibility = (lastDateStr?: string | null): { eligible: boolean; daysLeft: number } => {
    if (!lastDateStr) return { eligible: true, daysLeft: 0 };
    const lastDate = new Date(lastDateStr);
    const today = new Date();
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = donationGapDays - diffDays;
    return {
      eligible: daysLeft <= 0,
      daysLeft: daysLeft > 0 ? daysLeft : 0,
    };
  };

  const { eligible: isEligible, daysLeft: daysUntilEligible } = calculateEligibility(profile?.last_donation_date);

  // Load session & profile on mount
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Mock mode: restore previous demo login from localStorage if exists
      const savedMockUser = localStorage.getItem('jmc_mock_user');
      if (savedMockUser) {
        try {
          const parsed = JSON.parse(savedMockUser);
          setUser({ id: parsed.id, email: parsed.email });
          setProfile(parsed);
        } catch (_) {}
      }
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Error fetching auth session:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Sign In
  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      // Mock Sign In
      if (email.includes('admin')) {
        demoLoginAsAdmin();
        return { success: true };
      }
      demoLoginAsDonor();
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) return { success: false, error: error.message };
      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  // Sign Up
  const signUp = async (email: string, pass: string, meta: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      const newMockProfile: Profile = {
        id: 'mock-user-' + Date.now(),
        role: 'member',
        full_name: meta.full_name || 'New Member',
        phone: meta.phone || '01700000000',
        phone_hidden: Boolean(meta.phone_hidden),
        blood_group: (meta.blood_group as BloodGroup) || 'O+',
        district: meta.district || 'Jashore',
        upazila: meta.upazila || 'Jashore Sadar',
        medical_college_unit: meta.medical_college_unit || 'General Donor',
        last_donation_date: meta.last_donation_date || null,
        total_donations: 0,
        is_available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setUser({ id: newMockProfile.id, email });
      setProfile(newMockProfile);
      localStorage.setItem('jmc_mock_user', JSON.stringify({ ...newMockProfile, email }));
      return { success: true };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: meta.full_name,
            phone: meta.phone,
            phone_hidden: meta.phone_hidden,
            blood_group: meta.blood_group,
            district: meta.district,
            upazila: meta.upazila,
            medical_college_unit: meta.medical_college_unit,
            role: 'member',
          },
        },
      });

      if (error) return { success: false, error: error.message };
      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Sign up failed' };
    }
  };

  // Sign Out
  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('jmc_mock_user');
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // Update Profile
  const updateProfile = async (updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
    if (!profile) return { success: false, error: 'Not logged in' };

    if (!isSupabaseConfigured) {
      const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
      setProfile(updated);
      localStorage.setItem('jmc_mock_user', JSON.stringify(updated));
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) return { success: false, error: error.message };
      setProfile(prev => (prev ? { ...prev, ...updates } : null));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Demo Helpers
  const demoLoginAsAdmin = () => {
    const admin = MOCK_DONORS[0]; // Dr. Tanvir Ahmed (Admin)
    const mockUser = { id: admin.id, email: 'admin@jmc.edu.bd' };
    setUser(mockUser);
    setProfile(admin);
    localStorage.setItem('jmc_mock_user', JSON.stringify({ ...admin, email: 'admin@jmc.edu.bd' }));
  };

  const demoLoginAsDonor = () => {
    const donor = MOCK_DONORS[1]; // Sadia Afrin Ritu (Member)
    const mockUser = { id: donor.id, email: 'donor@jmc.edu.bd' };
    setUser(mockUser);
    setProfile(donor);
    localStorage.setItem('jmc_mock_user', JSON.stringify({ ...donor, email: 'donor@jmc.edu.bd' }));
  };

  const role: UserRole | 'visitor' = profile?.role || 'visitor';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        loading,
        isEligible,
        daysUntilEligible,
        signIn,
        signUp,
        signOut,
        updateProfile,
        demoLoginAsAdmin,
        demoLoginAsDonor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

