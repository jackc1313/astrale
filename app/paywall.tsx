import { useRouter } from 'expo-router';

import { Paywall } from '@features/premium/components';

export default function PaywallScreen() {
  const router = useRouter();

  return <Paywall onClose={() => router.back()} />;
}
