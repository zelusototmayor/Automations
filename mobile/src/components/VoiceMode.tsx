/**
 * VoiceMode Component
 * Full-screen voice conversation mode with on-brand styling
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { transcribeAudio, synthesizeSpeech } from '../services/api';
import { stripMarkdown, stripPauseMarkers } from '../utils/markdown';

// Brand colors
const colors = {
  // Background - darker sage tones
  background: '#2D3F32',
  backgroundLight: '#3D5242',
  // Accent colors
  sage: '#6F8F79',
  sageLight: '#8FAF99',
  sageMuted: 'rgba(111, 143, 121, 0.3)',
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  // States
  listening: '#E57373',
  error: '#FF8A80',
};

interface VoiceModeProps {
  agentId: string;
  agentName: string;
  agentAvatarUrl?: string;
  onMessage: (text: string, voiceMode?: boolean) => Promise<string>;
  onClose: () => void;
  isPremium: boolean;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export default function VoiceMode({
  agentId,
  agentName,
  onMessage,
  onClose,
  isPremium,
}: VoiceModeProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Animation for the pulsing mic
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Pulse animation when listening
  useEffect(() => {
    if (state === 'listening') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state, pulseAnim]);

  // Auto-scroll when response changes
  useEffect(() => {
    if (response) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [response]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscript('');
      setResponse('');

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Microphone permission required');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await recording.startAsync();

      recordingRef.current = recording;
      setState('listening');
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) {
      setState('idle');
      return;
    }

    try {
      setState('processing');

      const recording = recordingRef.current;
      recordingRef.current = null;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        setError('Recording failed - no audio captured');
        setState('idle');
        return;
      }

      const { text } = await transcribeAudio(uri);
      setTranscript(text);

      if (!text || !text.trim()) {
        setError('Could not understand audio - please try again');
        setState('idle');
        return;
      }

      // Send message with voiceMode flag for conversational response
      const assistantResponse = await onMessage(text, true);
      setResponse(assistantResponse);

      if (assistantResponse && assistantResponse.trim()) {
        setState('speaking');
        await speakResponse(assistantResponse);
      }

      setState('idle');
    } catch (err: any) {
      console.error('Error processing recording:', err);
      const errorMsg = err.message || 'Failed to process audio';
      if (errorMsg.includes('Network') || errorMsg.includes('fetch')) {
        setError('Network error - please check your connection');
      } else if (errorMsg.includes('Premium') || errorMsg.includes('premium')) {
        setError('Voice mode requires a premium subscription');
      } else {
        setError(errorMsg);
      }
      setState('idle');
    }
  }, [onMessage]);

  const speakResponse = async (text: string) => {
    try {
      const cleanText = stripMarkdown(text);
      const audioDataUrl = await synthesizeSpeech(cleanText, agentId);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioDataUrl },
        { shouldPlay: true, volume: 1.0 }
      );
      soundRef.current = sound;
      await sound.setVolumeAsync(1.0);

      await new Promise<void>((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            resolve();
          }
        });
      });

      await sound.unloadAsync();
      soundRef.current = null;
    } catch (err) {
      console.error('Error speaking response:', err);
    }
  };

  const handleMicPress = () => {
    if (state === 'idle') {
      startRecording();
    } else if (state === 'listening') {
      stopRecording();
    }
  };

  const stopSpeaking = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setState('idle');
  };

  if (!isPremium) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <View style={styles.lockedIcon}>
            <Ionicons name="lock-closed" size={40} color={colors.sage} />
          </View>
          <Text style={styles.premiumText}>Voice Mode is Premium</Text>
          <Text style={styles.premiumSubtext}>
            Upgrade to have natural voice conversations with your coach
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.agentName}>{agentName}</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, state !== 'idle' && styles.statusDotActive]} />
            <Text style={styles.statusText}>
              {state === 'idle' && 'Ready'}
              {state === 'listening' && 'Listening'}
              {state === 'processing' && 'Thinking'}
              {state === 'speaking' && 'Speaking'}
            </Text>
          </View>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Conversation Area */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.conversationArea}
        contentContainerStyle={styles.conversationContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Transcript (what user said) */}
        {transcript && (
          <View style={styles.userBubble}>
            <Text style={styles.userText}>{transcript}</Text>
          </View>
        )}

        {/* Response (what coach said) - strip pause markers for display only */}
        {response && (
          <View style={styles.coachBubble}>
            <Text style={styles.coachText}>{stripPauseMarkers(response)}</Text>
          </View>
        )}

        {/* Processing indicator */}
        {state === 'processing' && !response && (
          <View style={styles.coachBubble}>
            <ActivityIndicator size="small" color={colors.sage} />
            <Text style={styles.processingText}>Thinking...</Text>
          </View>
        )}

        {/* Error message */}
        {error && (
          <View style={styles.errorBubble}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Mic Area */}
      <View style={styles.micArea}>
        {state === 'speaking' ? (
          <TouchableOpacity style={styles.stopButton} onPress={stopSpeaking}>
            <Ionicons name="stop" size={32} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleMicPress} disabled={state === 'processing'}>
            <Animated.View
              style={[
                styles.micButton,
                state === 'listening' && styles.micButtonListening,
                state === 'processing' && styles.micButtonProcessing,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              {state === 'processing' ? (
                <ActivityIndicator size="large" color={colors.textPrimary} />
              ) : (
                <Ionicons
                  name={state === 'listening' ? 'mic' : 'mic-outline'}
                  size={40}
                  color={colors.textPrimary}
                />
              )}
            </Animated.View>
          </TouchableOpacity>
        )}
        <Text style={styles.hint}>
          {state === 'idle' && 'Tap to speak'}
          {state === 'listening' && 'Tap when done'}
          {state === 'processing' && 'Processing...'}
          {state === 'speaking' && 'Tap to stop'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.sageMuted,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.sageMuted,
  },
  headerCenter: {
    alignItems: 'center',
  },
  agentName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.sage,
    marginRight: 6,
  },
  statusDotActive: {
    backgroundColor: colors.sageLight,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  conversationArea: {
    flex: 1,
  },
  conversationContent: {
    padding: 20,
    paddingBottom: 40,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.sage,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    maxWidth: '85%',
  },
  userText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  coachBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundLight,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    maxWidth: '85%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachText: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  processingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  errorBubble: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 138, 128, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  micArea: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingBottom: 48,
    borderTopWidth: 1,
    borderTopColor: colors.sageMuted,
  },
  micButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.sage,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonListening: {
    backgroundColor: colors.listening,
    shadowColor: colors.listening,
  },
  micButtonProcessing: {
    backgroundColor: colors.backgroundLight,
    shadowOpacity: 0,
  },
  stopButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.listening,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textMuted,
  },
  lockedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.sageMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  premiumText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  premiumSubtext: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
});
