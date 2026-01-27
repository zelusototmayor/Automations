import { useState, useEffect, useRef } from 'react';
import { View, TextInput, Pressable, Text } from 'react-native';
import { SearchIcon, XIcon } from './Icons';

// ═══════════════════════════════════════════════════════════════════════════
// BETTER COACHING DESIGN SYSTEM - NEUTRAL BASE WITH SAGE ACCENT
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  border: '#E5E7EB',
  borderFocus: '#4A7C59',
  textPrimary: '#111827',
  textTertiary: '#9CA3AF',
  primary: '#4A7C59',
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
          backgroundColor: colors.surfaceSecondary,
          borderColor: colors.border,
          borderRadius: 10,
        }}
      >
        <SearchIcon size={18} color={colors.textTertiary} />
        <Text
          className="flex-1 ml-3 text-body"
          style={{ color: colors.textTertiary }}
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
        backgroundColor: colors.surfaceSecondary,
        borderColor: isFocused ? colors.borderFocus : colors.border,
        borderRadius: 10,
      }}
    >
      <SearchIcon size={18} color={colors.textTertiary} />
      <TextInput
        value={internalValue}
        onChangeText={handleChangeText}
        onSubmitEditing={() => onSubmit?.(internalValue)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
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
          style={{ backgroundColor: colors.surfaceSecondary }}
        >
          <XIcon size={14} color={colors.textTertiary} />
        </Pressable>
      )}
    </View>
  );
}
