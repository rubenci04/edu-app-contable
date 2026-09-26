import { useState } from 'react';

const PROFILE_KEY = 'edu-app-contable:student-profile:v1';

export interface StudentProfile {
  name: string;
  age: number;
  course: string;
}

function readProfile(): StudentProfile | null {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (!stored) return null;
    const value: unknown = JSON.parse(stored);
    if (!value || typeof value !== 'object') return null;
    const profile = value as Partial<StudentProfile>;
    if (typeof profile.name !== 'string' || !profile.name.trim() ||
        !Number.isInteger(profile.age) || Number(profile.age) < 10 || Number(profile.age) > 99 ||
        typeof profile.course !== 'string' || !profile.course.trim()) return null;
    return { name: profile.name.trim(), age: Number(profile.age), course: profile.course.trim() };
  } catch { return null; }
}

export function useLocalStudent() {
  const [profile, setProfile] = useState<StudentProfile | null>(readProfile);
  const [storageError, setStorageError] = useState(false);

  function saveProfile(next: StudentProfile) {
    setProfile(next);
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(next)); setStorageError(false); }
    catch { setStorageError(true); }
  }

  return { profile, saveProfile, storageError };
}
