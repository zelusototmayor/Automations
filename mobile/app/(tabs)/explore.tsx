import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAgentsStore } from '../../src/stores/agents';
import { CoachCard } from '../../src/components/coaches/CoachCard';
import { SearchBar, CategoryChipList } from '../../src/components/ui';
import { SearchIcon } from '../../src/components/ui/Icons';

// ═══════════════════════════════════════════════════════════════════════════
// UI DESIGN SPEC V1 COLORS
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  sage: '#6F8F79',          // CTA start (spec)
  sageLight: '#DCE9DF',     // Sage pastel (spec)
  surface: '#F7F6F3',       // Spec background
  textPrimary: '#111827',   // Spec primary text
  textSecondary: '#6B7280', // Spec secondary text
  textMuted: '#9CA3AF',     // Spec muted text
};

export default function ExploreScreen() {
  const [searchText, setSearchText] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    agents,
    categories,
    selectedCategory,
    isLoadingAgents,
    fetchAgents,
    fetchCategories,
    setCategory,
    setSearch,
  } = useAgentsStore();

  useEffect(() => {
    fetchCategories();
    fetchAgents();
  }, []);

  // Debounced search
  const handleSearch = (text: string) => {
    setSearchText(text);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      setSearch(text);
    }, 300);
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setCategory(categoryId);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.surface }} edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text
          className="text-title font-inter-bold"
          style={{ color: colors.textPrimary }}
        >
          Explore
        </Text>
        <Text
          className="text-body mt-1"
          style={{ color: colors.textSecondary }}
        >
          Discover coaches for every goal
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-5 py-4">
        <SearchBar
          value={searchText}
          onChangeText={handleSearch}
          placeholder="Search coaches..."
          autoFocus={false}
        />
      </View>

      {/* Category Filters */}
      <View className="mb-3">
        <CategoryChipList
          categories={categories}
          selectedId={selectedCategory}
          onSelect={handleCategorySelect}
          showAll={true}
        />
      </View>

      {/* Results Count */}
      {!isLoadingAgents && agents.length > 0 && (
        <View className="px-5 pb-2">
          <Text
            className="text-body-sm"
            style={{ color: colors.textMuted }}
          >
            {agents.length} coach{agents.length !== 1 ? 'es' : ''} found
          </Text>
        </View>
      )}

      {/* Results */}
      {isLoadingAgents ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.sage} size="large" />
          <Text
            className="text-body-sm mt-3"
            style={{ color: colors.textMuted }}
          >
            Loading coaches...
          </Text>
        </View>
      ) : agents.length === 0 ? (
        <View className="flex-1 items-center justify-center px-5">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.sageLight }}
          >
            <SearchIcon size={28} color={colors.sage} />
          </View>
          <Text
            className="text-section font-inter-semibold mb-2"
            style={{ color: colors.textPrimary }}
          >
            No coaches found
          </Text>
          <Text
            className="text-body text-center"
            style={{ color: colors.textSecondary }}
          >
            Try a different search term or category
          </Text>
        </View>
      ) : (
        <FlatList
          data={agents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="px-5">
              <CoachCard agent={item} variant="default" />
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 100 }}
        />
      )}
    </SafeAreaView>
  );
}
