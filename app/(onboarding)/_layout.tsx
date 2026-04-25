import { createContext, useContext } from 'react';
import { Stack } from 'expo-router';

import { useOnboarding } from '@features/onboarding/hooks/useOnboarding';

type OnboardingContextType = ReturnType<typeof useOnboarding>;

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboardingContext = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboardingContext must be used within OnboardingLayout');
  return ctx;
};

export default function OnboardingLayout() {
  const onboarding = useOnboarding();

  return (
    <OnboardingContext.Provider value={onboarding}>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </OnboardingContext.Provider>
  );
}
