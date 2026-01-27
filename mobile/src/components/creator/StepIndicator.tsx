import { View, Text } from 'react-native';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export function StepIndicator({ currentStep, totalSteps, labels }: StepIndicatorProps) {
  const defaultLabels = ['Identity', 'Personality', 'Expertise', 'Model', 'Preview'];

  return (
    <View className="flex-row items-center justify-center py-4 px-2">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const step = index + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        const label = (labels || defaultLabels)[index];

        return (
          <View key={step} className="flex-row items-center">
            {/* Step circle */}
            <View className="items-center">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  isActive
                    ? 'bg-primary-600'
                    : isCompleted
                    ? 'bg-primary-600'
                    : 'bg-gray-200'
                }`}
              >
                {isCompleted ? (
                  <Text className="text-white text-sm">OK</Text>
                ) : (
                  <Text
                    className={`text-sm font-semibold ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    {step}
                  </Text>
                )}
              </View>
              <Text
                className={`text-xs mt-1 ${
                  isActive ? 'text-primary-600 font-medium' : 'text-gray-400'
                }`}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>

            {/* Connector line */}
            {step < totalSteps && (
              <View
                className={`w-8 h-0.5 mx-1 ${
                  isCompleted ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}
