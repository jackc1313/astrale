import { useState } from 'react';

import type { ZodiacSignId } from '@shared/utils/zodiac';
import type { InterestId, UserProfile } from '../types';
import { storageService } from '@services/storage';

export const useOnboarding = () => {
  const [birthDate, setBirthDate] = useState<Date>(new Date(2000, 0, 1));
  const [zodiacSign, setZodiacSign] = useState<ZodiacSignId | null>(null);
  const [ascendant, setAscendant] = useState<ZodiacSignId | null>(null);
  const [interests, setInterests] = useState<InterestId[]>([]);

  const toggleInterest = (id: InterestId) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const completeOnboarding = () => {
    if (!zodiacSign) return;

    const profile: UserProfile = {
      zodiacSign,
      birthDate: birthDate.toISOString().split('T')[0],
      ascendant,
      interests,
      onboardingCompleted: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    storageService.setUserProfile(profile);
  };

  return {
    birthDate, setBirthDate,
    zodiacSign, setZodiacSign,
    ascendant, setAscendant,
    interests, toggleInterest,
    completeOnboarding,
  };
};
