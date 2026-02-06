import { View, Text, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StarRating, SessionCount } from '../ui/Rating';
import { TierBadge, VerifiedBadge, Badge } from '../ui/Badge';
import { VerifiedIcon, GiftIcon, PencilIcon, StarIcon, CheckIcon } from '../ui/Icons';
import type { Agent } from '../../types';
import { PRICE_TIER_INFO, type PriceTier } from '../../types';
import { getAvatarByHash } from '../../utils/avatars';
import { useAuthStore } from '../../stores/auth';

// ═══════════════════════════════════════════════════════════════════════════
// UI DESIGN SPEC V1 COLORS
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  sage: '#6F8F79',          // CTA start (spec)
  sageLight: '#DCE9DF',     // Sage pastel (spec)
  sageDark: '#4F6F5A',      // CTA end (spec)
  lavender: '#E7E0F3',      // Lavender pastel (spec)
  lavenderLight: '#E7E0F3',
  lavenderDark: '#8A7A9E',
  blush: '#D4A5A5',
  blushLight: '#F0D4D4',
  blushDark: '#B87878',
  sky: '#D9ECF7',           // Sky pastel (spec)
  skyLight: '#D9ECF7',
  skyDark: '#7A9EB0',
  cream: '#F5F0E8',
  warmWhite: 'rgba(255,255,255,0.88)', // Spec glass surface
  warmWhiteSharp: 'rgba(255, 255, 255, 0.92)', // NEW: Enhanced glass for sharper look
  textPrimary: '#111827',   // Spec primary text
  textSecondary: '#6B7280', // Spec secondary text
  textMuted: '#9CA3AF',     // Spec muted text
  border: '#E7E7E7',        // Spec border
  borderSharp: '#D1D5DB',   // NEW: Darker border for sharper look
};

// Avatar gradient colors based on name hash (using CTA gradient for primary)
const avatarGradients = [
  ['#6F8F79', '#4F6F5A'],  // Sage CTA gradient (spec)
  ['#B8A9C9', '#8A7A9E'],  // Lavender gradient
  ['#D4A5A5', '#B87878'],  // Blush gradient
  ['#A5C4D4', '#7A9EB0'],  // Sky gradient
];

function getAvatarGradient(name: string): [string, string] {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarGradients[hash % avatarGradients.length] as [string, string];
}

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

// Helper component to render avatar (image or gradient with initial)
interface AvatarProps {
  agent: Agent;
  size: number;
  borderRadius: number;
  showInitial?: boolean;
}

function Avatar({ agent, size, borderRadius, showInitial = true }: AvatarProps) {
  const gradientColors = getAvatarGradient(agent.name);
  const initial = getInitial(agent.name);

  // Use avatar_url if available, otherwise use local avatar based on hash, otherwise gradient
  const avatarSource = agent.avatar_url
    ? { uri: agent.avatar_url }
    : getAvatarByHash(agent.name);

  if (agent.avatar_url || !showInitial) {
    return (
      <View style={{ width: size, height: size, borderRadius, overflow: 'hidden' }}>
        <Image
          source={avatarSource}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Fallback to gradient with initial
  return (
    <LinearGradient
      colors={gradientColors}
      style={{
        width: size,
        height: size,
        borderRadius,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text className="text-xl font-inter-bold text-white">{initial}</Text>
    </LinearGradient>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COACH CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface CoachCardProps {
  agent: Agent;
  variant?: 'default' | 'compact' | 'horizontal' | 'grid';
  onPress?: () => void;
  className?: string;
}

/**
 * Premium CoachCard component with letter-based avatars and minimal design
 *
 * Variants:
 * - default: Full card for list views
 * - compact: Smaller card for horizontal scroll
 * - horizontal: Wide card with horizontal layout
 */
export function CoachCard({
  agent,
  variant = 'default',
  onPress,
  className = '',
}: CoachCardProps) {
  const router = useRouter();
  const { purchasedCoachIds } = useAuthStore();

  // Derive price and ownership status (used by multiple variants)
  const isOwned = purchasedCoachIds.includes(agent.id);
  const isFree = agent.tier?.toUpperCase() === 'FREE';
  const priceLabel = isOwned
    ? 'Owned'
    : isFree
      ? 'Free'
      : PRICE_TIER_INFO[(agent.priceTier as PriceTier) || 'TIER_1']?.label || '$19.99';

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate directly to chat with the coach
      router.push(`/chat/${agent.id}`);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPACT VARIANT - For horizontal scrolling lists
  // ═══════════════════════════════════════════════════════════════════════════

  if (variant === 'compact') {
    return (
      <Pressable
        onPress={handlePress}
        className={[
          'rounded-card w-40 mr-3 shadow-card border overflow-hidden',
          'active:opacity-90 active:scale-98',
          className,
        ].filter(Boolean).join(' ')}
        style={{
          backgroundColor: colors.warmWhiteSharp,
          borderWidth: 1.5,
          borderColor: colors.borderSharp,
          shadowColor: '#111827',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View className="p-4">
          {/* Avatar */}
          <View className="mb-3">
            <Avatar agent={agent} size={56} borderRadius={14} showInitial={false} />
          </View>

          {/* Name */}
          <Text
            className="font-inter-semibold text-body-sm"
            style={{ color: colors.textPrimary }}
            numberOfLines={1}
          >
            {agent.name}
          </Text>

          {/* Tagline */}
          <Text
            className="text-caption mt-1"
            style={{ color: colors.textMuted }}
            numberOfLines={2}
          >
            {agent.tagline}
          </Text>

          {/* Rating */}
          {agent.rating_avg && (
            <View className="mt-2">
              <StarRating
                rating={agent.rating_avg}
                reviewCount={agent.rating_count}
                size="sm"
                showCount={false}
              />
            </View>
          )}
        </View>
      </Pressable>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HORIZONTAL VARIANT - Wide cards
  // ═══════════════════════════════════════════════════════════════════════════

  if (variant === 'horizontal') {
    return (
      <Pressable
        onPress={handlePress}
        className={[
          'rounded-card shadow-card border mb-3 overflow-hidden',
          'active:opacity-90',
          className,
        ].filter(Boolean).join(' ')}
        style={{
          backgroundColor: colors.warmWhiteSharp,
          borderWidth: 1.5,
          borderColor: colors.borderSharp,
          shadowColor: '#111827',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View className="p-4 flex-row">
          {/* Avatar */}
          <View className="mr-4">
            <Avatar agent={agent} size={56} borderRadius={14} showInitial={false} />
          </View>

          {/* Content */}
          <View className="flex-1">
            {/* Header row */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Text
                  className="font-inter-semibold text-body"
                  style={{ color: colors.textPrimary }}
                  numberOfLines={1}
                >
                  {agent.name}
                </Text>
                {agent.is_verified && (
                  <View className="ml-1.5">
                    <VerifiedIcon size={16} color={colors.sage} />
                  </View>
                )}
              </View>
              {agent.tier && !isFree && (
                <TierBadge tier={(agent.tier?.toUpperCase() || 'FREE') as 'FREE' | 'PREMIUM' | 'CREATOR'} />
              )}
            </View>

            {/* Tagline */}
            <Text
              className="text-body-sm mt-1"
              style={{ color: colors.textSecondary }}
              numberOfLines={2}
            >
              {agent.tagline}
            </Text>

            {/* Trust signals row */}
            <View className="flex-row items-center mt-2 gap-3">
              {agent.rating_avg && (
                <StarRating
                  rating={agent.rating_avg}
                  reviewCount={agent.rating_count}
                  size="sm"
                />
              )}
              {agent.session_count && agent.session_count > 0 && (
                <SessionCount count={agent.session_count} size="sm" />
              )}
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRID VARIANT - 2-column card for home screen "Recommended for you"
  // Matches the mockup design with photo on left, info on right
  // ═══════════════════════════════════════════════════════════════════════════

  if (variant === 'grid') {
    // Format usage count with "k" suffix
    const formatCount = (count: number | undefined) => {
      if (!count) return null;
      if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
      return count.toString();
    };

    const usageCount = formatCount(agent.session_count);
    const ratingCount = formatCount(agent.rating_count);

    // Tags formatting - regular case, dot separated
    const displayTags = agent.tags?.slice(0, 2) || [];
    const extraTagsCount = (agent.tags?.length || 0) - 2;

    return (
      <Pressable
        onPress={handlePress}
        className={[
          'overflow-hidden',
          'active:opacity-90',
          className,
        ].filter(Boolean).join(' ')}
        style={{
          backgroundColor: colors.warmWhiteSharp,
          borderWidth: 1.5,
          borderColor: colors.borderSharp,
          borderRadius: 22, // Spec card radius
          flex: 1,
          // Enhanced shadow for sharper depth
          shadowColor: 'rgb(17, 24, 39)',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.14,
          shadowRadius: 16,
          elevation: 6,
        }}
      >
        <View className="p-3.5">
          {/* Top section: Large Photo + Info */}
          <View className="flex-row mb-3">
            {/* Photo */}
            <View className="relative" style={{ width: 68, height: 80, borderRadius: 18, overflow: 'hidden' }}>
              <Image
                source={agent.avatar_url ? { uri: agent.avatar_url } : getAvatarByHash(agent.name)}
                style={{ width: 68, height: 80 }}
                resizeMode="cover"
              />
            </View>

            {/* Info section - to the right of photo */}
            <View className="flex-1 ml-3 justify-center">
              {/* Coach name */}
              <Text
                className="font-inter-semibold text-body"
                style={{ color: colors.textPrimary, lineHeight: 20 }}
                numberOfLines={1}
              >
                {agent.name}
              </Text>

              {/* Creator name */}
              {agent.creator_name && (
                <Text
                  className="text-caption mt-0.5"
                  style={{ color: colors.textSecondary }}
                  numberOfLines={1}
                >
                  {agent.creator_name}
                </Text>
              )}

              {/* Social proof row: ⭐ 4.8 (2.1k)  ✓ 12k users */}
              <View className="flex-row items-center mt-1">
                {agent.rating_avg ? (
                  <View className="flex-row items-center">
                    <StarIcon size={12} color="#E5B94E" filled />
                    <Text
                      className="text-caption font-inter-semibold ml-0.5"
                      style={{ color: colors.textPrimary }}
                    >
                      {agent.rating_avg.toFixed(1)}
                    </Text>
                    {ratingCount && (
                      <Text
                        className="text-caption ml-0.5"
                        style={{ color: colors.textMuted }}
                      >
                        ({ratingCount})
                      </Text>
                    )}
                  </View>
                ) : null}
                {usageCount && (
                  <View className="flex-row items-center ml-2">
                    <CheckIcon size={12} color={colors.sage} />
                    <Text
                      className="text-caption ml-0.5"
                      style={{ color: colors.textMuted }}
                    >
                      {usageCount} users
                    </Text>
                  </View>
                )}
              </View>

              {/* Description/tagline - single line */}
              <Text
                className="text-caption mt-0.5"
                style={{ color: colors.textMuted, lineHeight: 16 }}
                numberOfLines={1}
              >
                {agent.tagline}
              </Text>
            </View>
          </View>

          {/* Tags row: Single line, truncated */}
          {displayTags.length > 0 && (
            <Text
              className="text-xs mb-3"
              style={{ color: colors.textSecondary }}
              numberOfLines={1}
            >
              {displayTags.join(' · ')}
              {extraTagsCount > 0 && (
                <Text style={{ color: colors.textMuted }}> +{extraTagsCount}</Text>
              )}
            </Text>
          )}

          {/* CTA Button - dynamic based on ownership/pricing */}
          <Pressable
            onPress={handlePress}
            className="py-1.5 items-center active:opacity-80"
            style={{
              backgroundColor: isOwned ? '#2D7A3A' : colors.sage,
              borderRadius: 14,
            }}
          >
            <Text
              className="text-body-sm font-inter-medium"
              style={{ color: 'white' }}
            >
              {isOwned
                ? 'Continue'
                : isFree
                  ? 'Start chatting'
                  : `Try free · ${PRICE_TIER_INFO[(agent.priceTier as PriceTier) || 'TIER_1']?.label || '$19.99'}`}
            </Text>
          </Pressable>
        </View>
      </Pressable>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DEFAULT VARIANT - Full card for list views (redesigned per mockup)
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <Pressable
      onPress={handlePress}
      className={[
        'rounded-card shadow-card border mb-3 overflow-hidden',
        'active:opacity-90',
        className,
      ].filter(Boolean).join(' ')}
      style={{
        backgroundColor: colors.warmWhiteSharp,
        borderWidth: 1.5,
        borderColor: colors.borderSharp,
        shadowColor: '#111827',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View className="p-4">
        {/* Header row with avatar, name, and price */}
        <View className="flex-row items-start">
          {/* Avatar */}
          <View className="mr-3">
            <Avatar agent={agent} size={52} borderRadius={14} showInitial={false} />
          </View>

          {/* Name and description */}
          <View className="flex-1">
            <Text
              className="font-inter-semibold text-card-title"
              style={{ color: colors.textPrimary }}
              numberOfLines={1}
            >
              {agent.name}
            </Text>

            {/* Tagline/description */}
            <Text
              className="text-body-sm mt-0.5"
              style={{ color: colors.textSecondary }}
              numberOfLines={2}
            >
              {agent.tagline}
            </Text>
          </View>

          {/* Price badge at top-right */}
          <View
            className="ml-2 px-2 py-1 rounded-md"
            style={{
              backgroundColor: isOwned ? '#DCF5E0' : isFree ? colors.sageLight : colors.lavenderLight,
            }}
          >
            <Text
              className="text-caption font-inter-medium"
              style={{
                color: isOwned ? '#2D7A3A' : isFree ? colors.sageDark : colors.lavenderDark,
              }}
            >
              {priceLabel}
            </Text>
          </View>
        </View>

        {/* Rating */}
        <View className="mt-3">
          {agent.rating_avg ? (
            <StarRating
              rating={agent.rating_avg}
              reviewCount={agent.rating_count}
              size="sm"
            />
          ) : (
            <Text className="text-caption" style={{ color: colors.textMuted }}>
              New coach
            </Text>
          )}
        </View>

        {/* Creator line */}
        {agent.creator_name && (
          <View className="flex-row items-center mt-2">
            <Text
              className="text-caption"
              style={{ color: colors.textMuted }}
            >
              by {agent.creator_name}
            </Text>
            {agent.is_verified && (
              <View className="ml-1">
                <VerifiedIcon size={12} color={colors.sage} />
              </View>
            )}
          </View>
        )}

        {/* Tags/expertise pills */}
        {agent.tags && agent.tags.length > 0 && (
          <View className="flex-row flex-wrap mt-3 gap-1">
            {agent.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="default" size="sm">
                {tag}
              </Badge>
            ))}
            {agent.tags.length > 3 && (
              <Badge variant="default" size="sm">
                +{agent.tags.length - 3}
              </Badge>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default CoachCard;
