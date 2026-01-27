import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PurchasesPackage } from 'react-native-purchases';
import * as revenuecat from '../src/services/revenuecat';
import { useAuthStore } from '../src/stores/auth';
import { Button } from '../src/components/ui/Button';

// Feature Item Component
function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <View className="flex-row items-start mb-4">
      <View className="bg-primary-50 rounded-button w-10 h-10 items-center justify-center mr-3">
        <Text className="text-lg text-primary-600">*</Text>
      </View>
      <View className="flex-1">
        <Text className="font-inter-semibold text-body text-text-primary">{title}</Text>
        <Text className="text-body-sm text-text-secondary mt-0.5">{description}</Text>
      </View>
    </View>
  );
}

// Package Card Component
function PackageCard({
  pkg,
  isSelected,
  onSelect,
  isBestValue,
}: {
  pkg: PurchasesPackage;
  isSelected: boolean;
  onSelect: () => void;
  isBestValue?: boolean;
}) {
  const isAnnual = pkg.identifier.includes('annual');
  const price = pkg.product.priceString;

  return (
    <Pressable
      onPress={onSelect}
      className={`rounded-card p-4 mb-3 border-2 ${
        isSelected
          ? 'border-primary-600 bg-primary-50'
          : 'border-neutral-200 bg-white'
      } active:opacity-90`}
    >
      {isBestValue && (
        <View className="absolute -top-2.5 right-4 bg-secondary-500 px-3 py-1 rounded-chip">
          <Text className="text-caption font-inter-bold text-white">BEST VALUE</Text>
        </View>
      )}
      <View className="flex-row items-center">
        <View
          className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
            isSelected ? 'border-primary-600 bg-primary-600' : 'border-neutral-300'
          }`}
        >
          {isSelected && <Text className="text-white text-xs font-inter-bold">OK</Text>}
        </View>
        <View className="flex-1">
          <Text className="font-inter-semibold text-body text-text-primary">
            {isAnnual ? 'Annual' : 'Monthly'}
          </Text>
          <Text className="text-body-sm text-text-secondary">
            {isAnnual ? 'Save 33%' : 'Cancel anytime'}
          </Text>
        </View>
        <View className="items-end">
          <Text className="font-inter-bold text-h3 text-text-primary">{price}</Text>
          <Text className="text-body-sm text-text-muted">
            {isAnnual ? '/year' : '/month'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function PaywallScreen() {
  const router = useRouter();
  const { refreshUser, isAuthenticated } = useAuthStore();

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const offering = await revenuecat.getOfferings();
      if (offering?.availablePackages) {
        setPackages(offering.availablePackages);
        // Select annual by default (best value)
        const annual = offering.availablePackages.find((p) =>
          p.identifier.includes('annual')
        );
        setSelectedPackage(annual || offering.availablePackages[0]);
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    setIsPurchasing(true);
    try {
      const { customerInfo } = await revenuecat.purchasePackage(selectedPackage);
      if (revenuecat.isPremium(customerInfo)) {
        await refreshUser();
        Alert.alert('Welcome to Premium!', 'You now have full access to all coaches.', [
          { text: 'Start Exploring', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert('Purchase Failed', error.message || 'Please try again');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setIsPurchasing(true);
    try {
      const customerInfo = await revenuecat.restorePurchases();
      if (revenuecat.isPremium(customerInfo)) {
        await refreshUser();
        Alert.alert('Restored!', 'Your premium access has been restored.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('No Purchases Found', 'We could not find any previous purchases.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to restore purchases');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-light items-center justify-center">
        <ActivityIndicator color="#2563EB" size="large" />
        <Text className="text-body-sm text-text-muted mt-3">Loading plans...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light" edges={['bottom']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="items-center pt-6 pb-8 px-6">
          <View className="bg-secondary-100 rounded-full w-24 h-24 items-center justify-center mb-4">
            <Text className="text-5xl"></Text>
          </View>
          <Text className="text-h1 font-inter-bold text-text-primary text-center">
            Unlock Your Full Potential
          </Text>
          <Text className="text-body text-text-secondary text-center mt-2">
            Get unlimited access to all premium coaches and create your own
          </Text>
        </View>

        {/* Features */}
        <View className="px-6 mb-8">
          <FeatureItem
            title="Unlimited Coaching Sessions"
            description="Chat with any premium coach as much as you want"
          />
          <FeatureItem
            title="Create Your Own Coaches"
            description="Build AI coaches with your expertise and share them"
          />
          <FeatureItem
            title="Personalized Context"
            description="Coaches remember your values and goals"
          />
          <FeatureItem
            title="Early Access"
            description="Be the first to try new features and coaches"
          />
        </View>

        {/* Packages */}
        <View className="px-6 mb-6">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.identifier}
              pkg={pkg}
              isSelected={selectedPackage?.identifier === pkg.identifier}
              onSelect={() => setSelectedPackage(pkg)}
              isBestValue={pkg.identifier.includes('annual')}
            />
          ))}
        </View>

        {/* Terms */}
        <Text className="text-caption text-text-muted text-center px-6 mb-4">
          Cancel anytime. Subscription automatically renews unless cancelled at least 24
          hours before the end of the current period.
        </Text>

        {/* Restore */}
        <Pressable onPress={handleRestore} className="mb-8 active:opacity-70">
          <Text className="text-body-sm font-inter-medium text-primary-600 text-center">
            Restore Purchases
          </Text>
        </Pressable>
      </ScrollView>

      {/* CTA Button */}
      <View className="bg-white border-t border-border px-6 py-4 pb-8">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handlePurchase}
          disabled={isPurchasing || !selectedPackage}
          loading={isPurchasing}
        >
          Start Free Trial
        </Button>
        <Text className="text-caption text-text-muted text-center mt-2">
          7-day free trial, then {selectedPackage?.product.priceString}
          {selectedPackage?.identifier.includes('annual') ? '/year' : '/month'}
        </Text>
      </View>
    </SafeAreaView>
  );
}
