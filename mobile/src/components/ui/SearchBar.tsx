import { useState, useEffect, useRef } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import { SearchIcon, XIcon } from './Icons';

// ═══════════════════════════════════════════════════════════════════════════
// UI DESIGN SPEC V1 COLORS
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  warmWhite: 'rgba(255,255,255,0.88)', // Spec glass surface
  border: '#E7E7E7',           // Spec border
  borderFocus: '#6F8F79',      // Spec sage CTA
  textPrimary: '#111827',      // Spec primary text
  textMuted: '#9CA3AF',        // Spec muted text (placeholder)
  surface: '#F7F6F3',          // Spec background
};

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: (text: string) => void;
  placeholder?: string;
  debounceMs?: number;
  autoFocus?: boolean;
  editable?: boolean;
  onPress?: () => void;
  className?: string;
}

/**
 * Premium search bar component with debounced input
 *
 * @example
 * <SearchBar
 *   value={search}
 *   onChangeText={setSearch}
 *   placeholder="Search coaches..."
 * />
 *
 * // Non-editable version for navigation
 * <SearchBar
 *   editable={false}
 *   onPress={() => router.push('/explore')}
 *   placeholder="Search for a coach..."
 * />
 */
export function SearchBar({
  value = '',
  onChangeText,
  onSubmit,
  placeholder = 'Search coaches...',
  debounceMs = 300,
  autoFocus = false,
  editable = true,
  onPress,
  className = '',
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with external value
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChangeText = (text: string) => {
    setInternalValue(text);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new debounce timer
    debounceTimer.current = setTimeout(() => {
      onChangeText?.(text);
    }, debounceMs);
  };

  const handleClear = () => {
    setInternalValue('');
    onChangeText?.('');
  };

  // Non-editable version (for navigation)
  if (!editable) {
    return (
      <Pressable
        onPress={onPress}
        className={[
          'px-4 h-12 flex-row items-center border',
          'active:opacity-90',
          className,
        ].filter(Boolean).join(' ')}
        style={{
          backgroundColor: colors.warmWhite,
          borderColor: colors.border,
          borderRadius: 20, // Spec: input radius 18-20px
        }}
      >
        <SearchIcon size={18} color={colors.textMuted} />
        <Text
          className="flex-1 ml-3 text-body"
          style={{ color: colors.textMuted }}
        >
          {placeholder}
        </Text>
      </Pressable>
    );
  }

  return (
    <View
      className={[
        'px-4 h-12 flex-row items-center border',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        backgroundColor: colors.warmWhite,
        borderColor: isFocused ? colors.borderFocus : colors.border,
        borderRadius: 20, // Spec: input radius 18-20px
      }}
    >
      <SearchIcon size={18} color={colors.textMuted} />
      <TextInput
        value={internalValue}
        onChangeText={handleChangeText}
        onSubmitEditing={() => onSubmit?.(internalValue)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoFocus={autoFocus}
        returnKeyType="search"
        className="flex-1 ml-3 text-body font-inter-regular"
        style={{
          color: colors.textPrimary,
          paddingVertical: 0, // Fix Android padding
        }}
      />
      {internalValue.length > 0 && (
        <Pressable
          onPress={handleClear}
          className="ml-2 w-6 h-6 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.surface }}
        >
          <XIcon size={14} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}
