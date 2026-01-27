import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/stores/auth';

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp, isLoading } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-8">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="bg-sage-100 rounded-full w-20 h-20 items-center justify-center mb-4">
              <Text className="text-4xl"></Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text className="text-gray-500 mt-2 text-center">
              {mode === 'signin'
                ? 'Sign in to continue your coaching journey'
                : 'Join Better Coaching to start your journey'}
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">Email</Text>
              <TextInput
                className="bg-white rounded-xl px-4 py-4 text-gray-900 border border-gray-200"
                placeholder="your@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">Password</Text>
              <TextInput
                className="bg-white rounded-xl px-4 py-4 text-gray-900 border border-gray-200"
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete={mode === 'signin' ? 'password' : 'new-password'}
              />
            </View>

            {mode === 'signup' && (
              <View className="mt-4">
                <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">
                  Confirm Password
                </Text>
                <TextInput
                  className="bg-white rounded-xl px-4 py-4 text-gray-900 border border-gray-200"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoComplete="new-password"
                />
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className="bg-sage-600 py-4 rounded-xl items-center mt-6"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle Mode */}
            <View className="flex-row items-center justify-center mt-6">
              <Text className="text-gray-500">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <TouchableOpacity
                onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              >
                <Text className="text-sage-600 font-semibold">
                  {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 right-4 w-10 h-10 items-center justify-center"
          >
            <Text className="text-gray-400 text-2xl">✕</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
