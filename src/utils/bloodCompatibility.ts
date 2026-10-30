import { BloodGroup } from '../types';

// Standard medical red blood cell transfusion compatibility
export const COMPATIBLE_DONORS_MAP: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
};

export function isBloodCompatible(donorGroup: BloodGroup, patientGroup: BloodGroup): boolean {
  return COMPATIBLE_DONORS_MAP[patientGroup]?.includes(donorGroup) || false;
}

export function getCompatibleDonorGroups(patientGroup: BloodGroup): BloodGroup[] {
  return COMPATIBLE_DONORS_MAP[patientGroup] || [patientGroup];
}

