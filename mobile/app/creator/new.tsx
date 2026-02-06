import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreatorStore } from '../../src/stores/creator';
import { useAuthStore } from '../../src/stores/auth';
import { StepIndicator } from '../../src/components/creator/StepIndicator';
import { Step1Identity } from '../../src/components/creator/Step1Identity';
import { Step2Personality } from '../../src/components/creator/Step2Personality';
import { Step3Expertise } from '../../src/components/creator/Step3Expertise';
import { Step4Model } from '../../src/components/creator/Step4Model';
import { Step5VoiceKnowledge } from '../../src/components/creator/Step5VoiceKnowledge';
import { Step6Preview } from '../../src/components/creator/Step6Preview';

export default function NewCoachScreen() {
  const router = useRouter();
  const { isCreator } = useAuthStore();
  const {
    draft,
    currentStep,
    totalSteps,
    isSaving,
    isPublishing,
    nextStep,
    prevStep,
    setStep,
    saveDraft,
    publishAgent,
    resetDraft,
  } = useCreatorStore();

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Reset draft when mounting
  useEffect(() => {
    resetDraft();
  }, []);

  // Track changes
  useEffect(() => {
    if (draft.name || draft.tagline || draft.category) {
      setHasUnsavedChanges(true);
    }
  }, [draft]);

  // Check creator access
  useEffect(() => {
    if (!isCreator) {
      Alert.alert(
        'Creator Access Required',
        'You need a creator subscription to create coaches.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }
  }, [isCreator]);

  // Validation for each step
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!draft.name && !!draft.tagline && !!draft.category;
      case 2:
        return true; // Personality has defaults
      case 3:
        return true; // Expertise is optional
      case 4:
        return !!draft.greetingMessage && !!draft.modelConfig.model;
      case 5:
        return true; // Voice & Knowledge has defaults
      case 6:
        return true; // Preview step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields before continuing.');
      return;
    }
    nextStep();
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft();
      setHasUnsavedChanges(false);
      Alert.alert('Saved!', 'Your coach has been saved as a draft.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save draft');
    }
  };

  const handlePublish = async () => {
    if (!canProceed()) {
      Alert.alert('Missing Fields', 'Please complete all required fields before publishing.');
      return;
    }

    Alert.alert(
      'Publish Coach',
      `Are you sure you want to publish "${draft.name}"? It will be visible to all users.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            try {
              await publishAgent();
              Alert.alert('Published!', 'Your coach is now live and available to users.', [
                {
                  text: 'View My Coaches',
                  onPress: () => router.replace('/create'),
                },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to publish coach');
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    if (currentStep > 1) {
      prevStep();
    } else if (hasUnsavedChanges) {
      Alert.alert('Unsaved Changes', 'You have unsaved changes. Do you want to save as draft?', [
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        { text: 'Save Draft', onPress: () => handleSaveDraft().then(() => router.back()) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      router.back();
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Identity />;
      case 2:
        return <Step2Personality />;
      case 3:
        return <Step3Expertise />;
      case 4:
        return <Step4Model />;
      case 5:
        return <Step5VoiceKnowledge />;
      case 6:
        return <Step6Preview />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    const titles = ['Identity', 'Personality', 'Expertise', 'Model & Settings', 'Voice & Knowledge', 'Preview & Test'];
    return titles[currentStep - 1];
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Create Coach',
          headerBackTitle: 'Cancel',
          headerLeft: () => (
            <Pressable
              onPress={handleBack}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 18,
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <Text style={{ color: '#4F6F5A', fontSize: 14, fontWeight: '600' }}>
                {currentStep > 1 ? 'Back' : 'Cancel'}
              </Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={handleSaveDraft}
              disabled={isSaving}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 18,
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                opacity: isSaving ? 0.5 : 1,
              }}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#4F6F5A" />
              ) : (
                <Text style={{ color: '#4F6F5A', fontSize: 14, fontWeight: '600' }}>Save</Text>
              )}
            </Pressable>
          ),
        }}
      />

      <View className="flex-1 bg-background-light">
        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        {/* Step Title */}
        <View className="px-5 pb-2">
          <Text className="text-xl font-bold text-gray-900">
            Step {currentStep}: {getStepTitle()}
          </Text>
        </View>

        {/* Step Content */}
        <View className="flex-1">{renderStep()}</View>

        {/* Bottom Actions - Floating */}
        <View className="absolute bottom-0 left-0 right-0 px-5 pb-10" pointerEvents="box-none">
          {currentStep < totalSteps ? (
            <TouchableOpacity
              onPress={handleNext}
              disabled={!canProceed()}
              className={`py-4 rounded-xl items-center shadow-lg ${
                canProceed() ? 'bg-primary-600' : 'bg-gray-200'
              }`}
              style={{ elevation: 8 }}
            >
              <Text
                className={`font-semibold text-base ${
                  canProceed() ? 'text-white' : 'text-gray-500'
                }`}
              >
                Continue
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row">
              <TouchableOpacity
                onPress={handleSaveDraft}
                disabled={isSaving}
                className="flex-1 py-4 rounded-xl items-center bg-white mr-2 shadow-lg"
                style={{ elevation: 8 }}
              >
                <Text className="font-semibold text-gray-700">Save Draft</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePublish}
                disabled={isPublishing}
                className="flex-1 py-4 rounded-xl items-center bg-primary-600 ml-2 shadow-lg"
                style={{ elevation: 8 }}
              >
                {isPublishing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="font-semibold text-white">Publish</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Progress hint */}
          {currentStep < totalSteps && !canProceed() && (
            <Text className="text-xs text-gray-400 text-center mt-2">
              * Fill required fields to continue
            </Text>
          )}
        </View>
      </View>
    </>
  );
}
