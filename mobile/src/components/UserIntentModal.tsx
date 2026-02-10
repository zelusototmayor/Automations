import { View, Text, TouchableOpacity, Modal, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Web URL for creator subscription flow
const WEB_CREATOR_URL =
  process.env.EXPO_PUBLIC_CREATOR_PORTAL_URL || 'https://bettercoachingapp.com/become-creator';

interface UserIntentModalProps {
  visible: boolean;
  onSelectFindCoach: () => void;
  onSelectCreateCoach: () => void;
}

export function UserIntentModal({
  visible,
  onSelectFindCoach,
  onSelectCreateCoach
}: UserIntentModalProps) {

  const handleCreateCoach = async () => {
    // Open web browser for creator subscription
    try {
      await Linking.openURL(WEB_CREATOR_URL);
    } catch (error) {
      console.error('Failed to open creator URL:', error);
    }
    onSelectCreateCoach();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="sparkles" size={32} color="#059669" />
            </View>
            <Text style={styles.title}>
              Welcome to Better Coaching!
            </Text>
            <Text style={styles.subtitle}>
              What brings you here today?
            </Text>
          </View>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {/* Find a Coach Option */}
            <TouchableOpacity
              onPress={onSelectFindCoach}
              style={styles.optionButton}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="search" size={24} color="#7C3AED" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>
                  Find a Coach
                </Text>
                <Text style={styles.optionDescription}>
                  Discover AI coaches for your goals
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Create a Coach Option */}
            <TouchableOpacity
              onPress={handleCreateCoach}
              style={[styles.optionButton, { backgroundColor: '#DCE9DF', borderColor: '#C1D9C6' }]}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#C1D9C6' }]}>
                <Ionicons name="create" size={24} color="#059669" />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>
                  Create a Coach
                </Text>
                <Text style={styles.optionDescription}>
                  Share your expertise & earn revenue
                </Text>
              </View>
              <Ionicons name="open-outline" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Footer note */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              You can explore both options anytime from the app
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 380,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#DCE9DF',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#C1D9C6',
    borderRadius: 32,
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    color: '#4B5563',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 15,
  },
  optionsContainer: {
    padding: 24,
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#F5F3FF',
    borderWidth: 2,
    borderColor: '#EDE9FE',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    borderRadius: 12,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  optionDescription: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
});
