import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useCreatorStore } from '../../stores/creator';

// Available avatar initials/symbols
const AVATAR_OPTIONS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
];

// Categories (should match backend)
const CATEGORIES = [
  { id: 'productivity', name: 'Productivity & Systems' },
  { id: 'career', name: 'Career & Growth' },
  { id: 'wellness', name: 'Wellness & Mindset' },
  { id: 'creativity', name: 'Creativity & Writing' },
  { id: 'relationships', name: 'Relationships & Communication' },
  { id: 'finance', name: 'Finance & Business' },
  { id: 'learning', name: 'Learning & Education' },
];

// Suggested tags by category
const SUGGESTED_TAGS: Record<string, string[]> = {
  productivity: ['goals', 'habits', 'time-management', 'focus', 'organization', 'planning'],
  career: ['leadership', 'networking', 'interviews', 'promotion', 'skills', 'transition'],
  wellness: ['mindfulness', 'stress', 'sleep', 'energy', 'balance', 'self-care'],
  creativity: ['writing', 'brainstorming', 'art', 'music', 'storytelling', 'innovation'],
  relationships: ['communication', 'conflict', 'boundaries', 'dating', 'family', 'friendship'],
  finance: ['budgeting', 'investing', 'saving', 'debt', 'business', 'freelance'],
  learning: ['study', 'memory', 'languages', 'skills', 'reading', 'courses'],
};

interface EmojiPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  selected: string;
}

function EmojiPicker({ visible, onClose, onSelect, selected }: EmojiPickerProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/50 justify-center items-center"
      >
        <View className="bg-white rounded-2xl p-4 w-72">
          <Text className="text-lg font-semibold text-gray-900 mb-3 text-center">
            Choose Avatar
          </Text>
          <View className="flex-row flex-wrap justify-center">
            {AVATAR_OPTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className={`w-12 h-12 items-center justify-center rounded-xl m-1 ${
                  selected === emoji ? 'bg-primary-100' : 'bg-gray-100'
                }`}
              >
                <Text className="text-2xl">{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export function Step1Identity() {
  const { draft, setDraft } = useCreatorStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const suggestedTags = draft.category ? SUGGESTED_TAGS[draft.category] || [] : [];

  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim().replace(/\s+/g, '-');
    if (normalizedTag && !draft.tags.includes(normalizedTag) && draft.tags.length < 5) {
      setDraft({ tags: [...draft.tags, normalizedTag] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setDraft({ tags: draft.tags.filter((t) => t !== tag) });
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="px-5 py-4">
        {/* Avatar Selection */}
        <View className="items-center mb-6">
          <TouchableOpacity
            onPress={() => setShowEmojiPicker(true)}
            className="bg-primary-100 rounded-2xl w-24 h-24 items-center justify-center mb-2"
          >
            <Text className="text-5xl">{draft.avatar}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEmojiPicker(true)}>
            <Text className="text-primary-600 text-sm font-medium">Change Avatar</Text>
          </TouchableOpacity>
        </View>

        {/* Name */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Coach Name <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
            placeholder="e.g., Productivity Pro, Mindset Maven"
            placeholderTextColor="#9CA3AF"
            value={draft.name}
            onChangeText={(text) => setDraft({ name: text })}
            maxLength={30}
          />
          <Text className="text-xs text-gray-400 mt-1 ml-1">
            {draft.name.length}/30 characters
          </Text>
        </View>

        {/* Tagline */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Tagline <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
            placeholder="A short description of what your coach does"
            placeholderTextColor="#9CA3AF"
            value={draft.tagline}
            onChangeText={(text) => setDraft({ tagline: text })}
            maxLength={100}
          />
          <Text className="text-xs text-gray-400 mt-1 ml-1">
            {draft.tagline.length}/100 characters
          </Text>
        </View>

        {/* Description */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Description
          </Text>
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-gray-900 border border-gray-200 min-h-[100px]"
            placeholder="Describe your coach in more detail. What makes it unique? Who is it for?"
            placeholderTextColor="#9CA3AF"
            value={draft.description}
            onChangeText={(text) => setDraft({ description: text })}
            multiline
            textAlignVertical="top"
            maxLength={500}
          />
          <Text className="text-xs text-gray-400 mt-1 ml-1">
            {draft.description.length}/500 characters
          </Text>
        </View>

        {/* Category */}
        <View className="mb-5">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Category <Text className="text-red-500">*</Text>
          </Text>
          <View className="flex-row flex-wrap">
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setDraft({ category: category.id, tags: [] })}
                className={`px-3 py-2 rounded-xl mr-2 mb-2 flex-row items-center ${
                  draft.category === category.id
                    ? 'bg-primary-600'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <Text
                  className={`text-sm ${
                    draft.category === category.id ? 'text-white font-medium' : 'text-gray-700'
                  }`}
                >
                  {category.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Tags (up to 5)
          </Text>

          {/* Selected tags */}
          {draft.tags.length > 0 && (
            <View className="flex-row flex-wrap mb-2">
              {draft.tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => removeTag(tag)}
                  className="bg-primary-100 px-3 py-1 rounded-full mr-2 mb-2 flex-row items-center"
                >
                  <Text className="text-primary-700 text-sm">#{tag}</Text>
                  <Text className="text-primary-400 ml-1">×</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Tag input */}
          {draft.tags.length < 5 && (
            <View className="flex-row items-center mb-2">
              <TextInput
                className="flex-1 bg-white rounded-xl px-4 py-3 text-gray-900 border border-gray-200"
                placeholder="Add a tag..."
                placeholderTextColor="#9CA3AF"
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={() => addTag(tagInput)}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={() => addTag(tagInput)}
                className="bg-primary-100 px-4 py-3 rounded-xl ml-2"
              >
                <Text className="text-primary-600 font-medium">Add</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Suggested tags */}
          {draft.category && suggestedTags.length > 0 && (
            <View>
              <Text className="text-xs text-gray-500 mb-2">Suggestions:</Text>
              <View className="flex-row flex-wrap">
                {suggestedTags
                  .filter((tag) => !draft.tags.includes(tag))
                  .slice(0, 6)
                  .map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => addTag(tag)}
                      className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2"
                    >
                      <Text className="text-gray-600 text-sm">#{tag}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>
          )}
        </View>
      </View>

      <EmojiPicker
        visible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={(emoji) => setDraft({ avatar: emoji })}
        selected={draft.avatar}
      />
    </ScrollView>
  );
}
