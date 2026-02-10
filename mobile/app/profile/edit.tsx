import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth';
import { updateUser } from '../../src/services/api';
import { getAvatarByIndex, AVATAR_COUNT } from '../../src/utils/avatars';
import { Button } from '../../src/components/ui/Button';

const SCREEN_BG = '#F5F5F7';
const CARD_BG = 'rgba(255,255,255,0.92)';
const BORDER = '#D1D5DB';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const TEXT_MUTED = '#9CA3AF';
const PRIMARY_DARK = '#4F6F5A';

function getAvatarSeed(input: string): number {
  const hash = input.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Math.abs(hash) % AVATAR_COUNT;
}

function parseAvatarSeed(avatarUrl: string | undefined, fallbackKey: string): number {
  if (!avatarUrl) {
    return getAvatarSeed(fallbackKey);
  }

  const normalized = avatarUrl.trim();
  const imageMatch = normalized.match(/avatar-(\d+)\.jpg$/i);
  if (imageMatch) {
    const parsed = Number(imageMatch[1]);
    if (!Number.isNaN(parsed)) {
      return (parsed - 1 + AVATAR_COUNT) % AVATAR_COUNT;
    }
  }

  if (/^\d+$/.test(normalized)) {
    return Number(normalized) % AVATAR_COUNT;
  }

  return getAvatarSeed(fallbackKey);
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuthStore();

  const fallbackKey = `${user?.email || 'user'}-${user?.id || ''}`;

  const baselineSeed = useMemo(
    () => parseAvatarSeed(user?.avatarUrl, fallbackKey),
    [user?.avatarUrl, fallbackKey]
  );

  const [name, setName] = useState(user?.name || '');
  const [avatarSeed, setAvatarSeed] = useState(baselineSeed);
  const [saving, setSaving] = useState(false);

  const avatar = useMemo(() => getAvatarByIndex(avatarSeed), [avatarSeed]);

  const trimmedName = name.trim();
  const isNameChanged = (user?.name || '') !== trimmedName;
  const isAvatarChanged = avatarSeed !== baselineSeed;
  const canSave =
    trimmedName.length > 0 &&
    trimmedName.length <= 100 &&
    (isNameChanged || isAvatarChanged);

  const handleSave = async () => {
    if (!trimmedName) {
      Alert.alert('Name required', 'Please enter a name so your coaches can address you.');
      return;
    }

    setSaving(true);
    try {
      await updateUser({
        name: trimmedName,
        avatarUrl: `avatar-${avatarSeed + 1}.jpg`,
      });
      await refreshUser();
      Alert.alert('Profile updated', 'Your profile changes have been saved.', [
        {
          text: 'Done',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Unable to save', error?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: SCREEN_BG }}
      edges={['bottom']}
    >
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="mt-4 mb-6">
          <Text className="text-title font-inter-bold" style={{ color: TEXT_PRIMARY }}>
            Edit Profile
          </Text>
          <Text className="text-body mt-2" style={{ color: TEXT_SECONDARY }}>
            Update your display name and choose the avatar style that represents you.
          </Text>
        </View>

        <View
          className="rounded-card p-4 mb-5"
          style={{
            backgroundColor: CARD_BG,
            borderWidth: 1.5,
            borderColor: BORDER,
          }}
        >
          <Text
            className="text-label font-inter-semibold uppercase mb-3"
            style={{ color: TEXT_MUTED, letterSpacing: 1.5 }}
          >
            Avatar
          </Text>
          <View className="items-center">
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: '#E7E0F3',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                overflow: 'hidden',
              }}
            >
              <Image
                source={avatar}
                style={{ width: 96, height: 96 }}
                resizeMode="cover"
              />
            </View>
            <Text className="text-caption mb-4" style={{ color: TEXT_SECONDARY }}>
              Tap shuffle to cycle your avatar style.
            </Text>
            <Pressable
              onPress={() => setAvatarSeed((current) => (current + 1) % AVATAR_COUNT)}
              className="px-4 py-2 rounded-pill active:opacity-80"
              style={{ backgroundColor: '#DCE9DF' }}
            >
              <Text className="font-inter-semibold" style={{ color: PRIMARY_DARK }}>
                Shuffle Avatar
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          className="rounded-card p-4"
          style={{
            backgroundColor: CARD_BG,
            borderWidth: 1.5,
            borderColor: BORDER,
          }}
        >
          <Text
            className="text-label font-inter-semibold uppercase mb-3"
            style={{ color: TEXT_MUTED, letterSpacing: 1.5 }}
          >
            Display Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="What should coaches call you?"
            placeholderTextColor={TEXT_MUTED}
            className="rounded-input px-4 py-3 text-body"
            style={{
              borderWidth: 1.5,
              borderColor: BORDER,
              backgroundColor: '#FFFFFF',
              color: TEXT_PRIMARY,
            }}
            maxLength={100}
            autoCapitalize="words"
            returnKeyType="done"
          />
          <View className="flex-row justify-between mt-2">
            <Text className="text-caption" style={{ color: TEXT_SECONDARY }}>
              This appears on your profile and in chat.
            </Text>
            <Text className="text-caption" style={{ color: TEXT_MUTED }}>
              {name.length}/100
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pb-8 pt-3" style={{ backgroundColor: SCREEN_BG }}>
        <Button onPress={handleSave} disabled={!canSave || saving} fullWidth>
          {saving ? <ActivityIndicator color="white" /> : 'Save Changes'}
        </Button>
        <Pressable
          onPress={() => router.back()}
          className="mt-3 py-2 items-center active:opacity-70"
          disabled={saving}
        >
          <Text className="font-inter-medium" style={{ color: TEXT_SECONDARY }}>
            Cancel
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
