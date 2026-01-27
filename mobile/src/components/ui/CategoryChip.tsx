import { View, Text, Pressable, ScrollView } from 'react-native';

// ═══════════════════════════════════════════════════════════════════════════
// UI DESIGN SPEC V1 COLORS
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  sage: '#6F8F79',          // CTA start (spec)
  sageDark: '#4F6F5A',      // CTA end (spec)
  sageLight: '#DCE9DF',     // Sage pastel (spec)
  warmWhite: 'rgba(255,255,255,0.88)', // Spec glass surface
  border: '#E7E7E7',        // Spec border
  textPrimary: '#111827',   // Spec primary text
  textSecondary: '#6B7280', // Spec secondary text
};

interface CategoryChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  className?: string;
}

/**
 * Premium category filter chip - minimal pill style without emojis
 *
 * @example
 * <CategoryChip label="All" selected onPress={handlePress} />
 * <CategoryChip label="Career" onPress={handlePress} />
 */
export function CategoryChip({
  label,
  selected = false,
  onPress,
  className = '',
}: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={[
        'px-5 py-2.5 rounded-chip mr-2',
        'active:opacity-80',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        backgroundColor: selected ? colors.sage : colors.warmWhite,
        borderWidth: 1,
        borderColor: selected ? colors.sage : colors.border,
      }}
    >
      <Text
        className="text-body-sm font-inter-medium"
        style={{
          color: selected ? 'white' : colors.textSecondary,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface CategoryChipListProps {
  categories: Array<{ id: string; name: string; emoji?: string }>;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  showAll?: boolean;
  className?: string;
}

/**
 * Premium horizontal scrolling list of category chips
 *
 * @example
 * <CategoryChipList
 *   categories={categories}
 *   selectedId={selectedCategory}
 *   onSelect={setSelectedCategory}
 * />
 */
export function CategoryChipList({
  categories,
  selectedId,
  onSelect,
  showAll = true,
  className = '',
}: CategoryChipListProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20 }}
      className={className}
    >
      {showAll && (
        <CategoryChip
          label="All"
          selected={!selectedId}
          onPress={() => onSelect?.(null)}
        />
      )}
      {categories.map((category) => (
        <CategoryChip
          key={category.id}
          label={category.name}
          selected={selectedId === category.id}
          onPress={() => onSelect?.(category.id)}
        />
      ))}
    </ScrollView>
  );
}

interface CategoryCardProps {
  name: string;
  emoji?: string; // Ignored - we don't use emojis anymore
  onPress?: () => void;
  className?: string;
}

/**
 * Premium category card - horizontal pill style for home screen
 * Letter circle on left, category name on right (can wrap to 2 lines)
 *
 * @example
 * <CategoryCard name="Career" onPress={handlePress} />
 */
export function CategoryCard({
  name,
  onPress,
  className = '',
}: CategoryCardProps) {
  // Get first letter for the subtle icon
  const initial = name.charAt(0).toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      className={[
        'px-3 py-2.5 mr-3 flex-row items-center',
        'active:opacity-80',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        backgroundColor: colors.warmWhite,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 22, // Spec card/chip radius
        minWidth: 140,
      }}
    >
      {/* Subtle initial circle on left - smaller 32px */}
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-2.5"
        style={{ backgroundColor: colors.sageLight }}
      >
        <Text
          className="font-inter-semibold text-body-sm"
          style={{ color: colors.sageDark }}
        >
          {initial}
        </Text>
      </View>
      {/* Category name on right - can wrap to 2 lines */}
      <Text
        className="text-body-sm font-inter-medium flex-1"
        style={{ color: colors.textPrimary }}
        numberOfLines={2}
      >
        {name}
      </Text>
    </Pressable>
  );
}
