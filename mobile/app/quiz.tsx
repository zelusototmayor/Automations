import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAgentsStore } from '../src/stores/agents';
import { CoachCard } from '../src/components/coaches/CoachCard';
import { Button } from '../src/components/ui/Button';
import type { Agent } from '../src/types';

const colors = {
  sage: '#6F8F79',          // CTA start (spec)
  sageDark: '#4F6F5A',      // CTA end (spec)
  sageLight: '#DCE9DF',     // Sage pastel (spec)
  textPrimary: '#111827',   // Spec primary text
  textSecondary: '#6B7280', // Spec secondary text
  textMuted: '#9CA3AF',     // Spec muted text
  surface: '#F7F6F3',       // Spec background
  border: '#E7E7E7',        // Spec border
  cardBg: 'rgba(255,255,255,0.88)', // Spec glass surface
};

// Quiz option type
interface QuizOption {
  id: string;
  label: string;
  category?: string;
  isOther?: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

// Quiz questions configuration
const QUESTIONS: QuizQuestion[] = [
  {
    id: 'focus_area',
    question: 'What area do you want to focus on?',
    options: [
      { id: 'career', label: 'Career & Work', category: 'career' },
      { id: 'wellness', label: 'Health & Fitness', category: 'wellness' },
      { id: 'relationships', label: 'Relationships', category: 'relationships' },
      { id: 'personal', label: 'Personal Growth', category: 'wellness' },
      { id: 'productivity', label: 'Productivity', category: 'productivity' },
    ],
  },
  {
    id: 'challenge',
    question: "What's your main challenge right now?",
    options: [
      { id: 'stuck', label: 'I feel stuck and need direction' },
      { id: 'habits', label: 'I want to build better habits' },
      { id: 'accountability', label: 'I need accountability' },
      { id: 'overwhelmed', label: "I'm overwhelmed and stressed" },
      { id: 'other', label: 'Other', isOther: true },
    ],
  },
  {
    id: 'coaching_style',
    question: 'How do you prefer to be coached?',
    options: [
      { id: 'direct', label: 'Direct and challenging' },
      { id: 'supportive', label: 'Supportive and encouraging' },
      { id: 'socratic', label: 'Question-based (Socratic)' },
      { id: 'balanced', label: 'Balanced approach' },
    ],
  },
  {
    id: 'time_commitment',
    question: 'How much time can you commit per week?',
    options: [
      { id: '5-10', label: '5-10 minutes' },
      { id: '15-30', label: '15-30 minutes' },
      { id: '30-60', label: '30-60 minutes' },
      { id: '60+', label: '1+ hour' },
    ],
  },
  {
    id: 'budget',
    question: "What's your budget?",
    options: [
      { id: 'free', label: 'Free coaches only' },
      { id: 'premium', label: 'Open to premium' },
    ],
  },
];

interface QuizAnswers {
  focus_area?: string;
  challenge?: string;
  challenge_other?: string;
  coaching_style?: string;
  time_commitment?: string;
  budget?: string;
}

export default function QuizScreen() {
  const router = useRouter();
  const { featured, fetchFeatured } = useAgentsStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [otherText, setOtherText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [matchedCoaches, setMatchedCoaches] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchFeatured();
  }, []);

  const currentQuestion = QUESTIONS[currentStep];
  const isLastQuestion = currentStep === QUESTIONS.length - 1;
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleSelectOption = (optionId: string, isOther?: boolean) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: optionId,
    };
    setAnswers(newAnswers);

    if (isOther) {
      // Don't auto-advance for "Other" - wait for text input
      return;
    }

    if (isLastQuestion) {
      // Calculate matches
      calculateMatches(newAnswers);
    } else {
      // Move to next question
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300);
    }
  };

  const handleOtherSubmit = () => {
    const newAnswers = {
      ...answers,
      challenge_other: otherText,
    };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      calculateMatches(newAnswers);
    } else {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setOtherText('');
      }, 300);
    }
  };

  const calculateMatches = (finalAnswers: QuizAnswers) => {
    setIsLoading(true);

    // Simple matching algorithm
    let filtered = [...featured];

    // Filter by category based on focus area
    const focusAreaOption = QUESTIONS[0].options.find(
      (o) => o.id === finalAnswers.focus_area
    );
    if (focusAreaOption?.category) {
      const categoryMatches = filtered.filter(
        (agent) => agent.category === focusAreaOption.category
      );
      if (categoryMatches.length > 0) {
        filtered = categoryMatches;
      }
    }

    // Filter by tier if user selected "Free only"
    if (finalAnswers.budget === 'free') {
      const freeMatches = filtered.filter((agent) => agent.tier?.toUpperCase() === 'FREE');
      if (freeMatches.length > 0) {
        filtered = freeMatches;
      }
    }

    // Sort by rating (higher first)
    filtered.sort((a, b) => {
      const ratingA = a.rating_avg || 0;
      const ratingB = b.rating_avg || 0;
      return ratingB - ratingA;
    });

    // Return top 3
    const top3 = filtered.slice(0, 3);

    setTimeout(() => {
      setMatchedCoaches(top3);
      setShowResults(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  // Results screen
  if (showResults) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.surface }}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-5 pt-4 pb-6">
            <Text
              className="text-2xl font-inter-bold text-center mb-2"
              style={{ color: colors.textPrimary }}
            >
              Your Top 3 Matches
            </Text>
            <Text
              className="text-body text-center"
              style={{ color: colors.textSecondary }}
            >
              Based on your preferences, we found these coaches for you
            </Text>
          </View>

          {/* Matched coaches */}
          <View className="px-5">
            {matchedCoaches.length > 0 ? (
              matchedCoaches.map((coach, index) => (
                <View key={coach.id} className="mb-3">
                  <CoachCard agent={coach} variant="default" />
                </View>
              ))
            ) : (
              <View className="py-8 items-center">
                <Text
                  className="text-body"
                  style={{ color: colors.textSecondary }}
                >
                  No matches found. Try browsing all coaches.
                </Text>
              </View>
            )}
          </View>

          {/* Browse all link */}
          <View className="px-5 mt-4">
            <Pressable
              onPress={() => router.replace('/explore')}
              className="py-3 items-center"
            >
              <Text
                className="text-body font-inter-medium"
                style={{ color: colors.sageDark }}
              >
                Browse all coaches
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Close button */}
        <View className="px-5 pb-4">
          <Button variant="outline" fullWidth onPress={() => router.back()}>
            Done
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Loading screen
  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.surface }}
      >
        <ActivityIndicator size="large" color={colors.sage} />
        <Text
          className="text-body mt-4"
          style={{ color: colors.textSecondary }}
        >
          Finding your perfect coaches...
        </Text>
      </SafeAreaView>
    );
  }

  const selectedOption = answers[currentQuestion.id as keyof QuizAnswers];
  const showOtherInput =
    selectedOption === 'other' && currentQuestion.id === 'challenge';

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.surface }}>
      {/* Progress bar */}
      <View className="px-5 pt-4 pb-2">
        <View
          className="h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: colors.sageLight }}
        >
          <View
            className="h-full rounded-full"
            style={{
              backgroundColor: colors.sage,
              width: `${progress}%`,
            }}
          />
        </View>
        <Text
          className="text-caption mt-2"
          style={{ color: colors.textMuted }}
        >
          Question {currentStep + 1} of {QUESTIONS.length}
        </Text>
      </View>

      {/* Question */}
      <View className="px-5 pt-4 pb-6">
        <Text
          className="text-xl font-inter-bold"
          style={{ color: colors.textPrimary }}
        >
          {currentQuestion.question}
        </Text>
      </View>

      {/* Options */}
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {currentQuestion.options.map((option) => {
          const isSelected = selectedOption === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => handleSelectOption(option.id, option.isOther)}
              className="mb-3 rounded-xl p-4 border"
              style={{
                backgroundColor: isSelected ? colors.sageLight : colors.cardBg,
                borderColor: isSelected ? colors.sage : colors.border,
              }}
            >
              <Text
                className="text-body font-inter-medium"
                style={{
                  color: isSelected ? colors.sageDark : colors.textPrimary,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}

        {/* Other text input */}
        {showOtherInput && (
          <View className="mt-2">
            <TextInput
              value={otherText}
              onChangeText={setOtherText}
              placeholder="Tell us more..."
              placeholderTextColor={colors.textMuted}
              multiline
              className="rounded-xl p-4 border min-h-[100px]"
              style={{
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
                color: colors.textPrimary,
                textAlignVertical: 'top',
              }}
            />
            <Button
              variant="primary"
              fullWidth
              className="mt-3"
              onPress={handleOtherSubmit}
              disabled={!otherText.trim()}
            >
              {isLastQuestion ? 'Find my coaches' : 'Continue'}
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View className="px-5 pb-4 flex-row">
        <Button variant="ghost" onPress={handleBack} className="mr-2">
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </Button>
      </View>
    </SafeAreaView>
  );
}
