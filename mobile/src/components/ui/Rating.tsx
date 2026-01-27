import { View, Text } from 'react-native';
import { StarIcon, MessageIcon, ZapIcon } from './Icons';

// ═══════════════════════════════════════════════════════════════════════════
// UI DESIGN SPEC V1 COLORS
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  star: '#E5B94E',
  starEmpty: '#E7E7E7',     // Spec border
  textPrimary: '#111827',   // Spec primary text
  textSecondary: '#6B7280', // Spec secondary text
  textMuted: '#9CA3AF',     // Spec muted text
  success: '#22C55E',       // Spec success
  warning: '#E8920F',
};

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { star: 12, text: 'text-caption', gap: 'gap-0.5' },
  md: { star: 14, text: 'text-body-sm', gap: 'gap-0.5' },
  lg: { star: 18, text: 'text-body', gap: 'gap-1' },
};

/**
 * Premium star rating display component
 *
 * @example
 * <StarRating rating={4.5} reviewCount={128} />
 * <StarRating rating={4.8} size="lg" showCount={false} />
 */
export function StarRating({
  rating,
  maxRating = 5,
  reviewCount,
  size = 'md',
  showCount = true,
  className = '',
}: StarRatingProps) {
  const config = sizeConfig[size];

  return (
    <View className={['flex-row items-center', config.gap, className].filter(Boolean).join(' ')}>
      {/* Single filled star icon */}
      <StarIcon size={config.star} color={colors.star} filled />

      {/* Rating number */}
      <Text
        className={[config.text, 'font-inter-medium ml-1'].join(' ')}
        style={{ color: colors.textSecondary }}
      >
        {rating.toFixed(1)}
      </Text>

      {/* Review count */}
      {showCount && reviewCount !== undefined && (
        <Text
          className={[config.text, 'ml-0.5'].join(' ')}
          style={{ color: colors.textMuted }}
        >
          ({reviewCount})
        </Text>
      )}
    </View>
  );
}

interface SessionCountProps {
  count: number;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Premium session count display
 *
 * @example
 * <SessionCount count={150} />
 */
export function SessionCount({ count, size = 'md', className = '' }: SessionCountProps) {
  const textSize = size === 'sm' ? 'text-caption' : 'text-body-sm';

  // Format count with k for thousands
  const formatCount = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <View className={['flex-row items-center gap-1', className].filter(Boolean).join(' ')}>
      <MessageIcon size={size === 'sm' ? 12 : 14} color={colors.textMuted} />
      <Text
        className={[textSize].join(' ')}
        style={{ color: colors.textMuted }}
      >
        {formatCount(count)} sessions
      </Text>
    </View>
  );
}

interface ResponseTimeProps {
  minutes: number;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Premium response time indicator
 *
 * @example
 * <ResponseTime minutes={5} />
 */
export function ResponseTime({ minutes, size = 'md', className = '' }: ResponseTimeProps) {
  const textSize = size === 'sm' ? 'text-caption' : 'text-body-sm';
  const iconSize = size === 'sm' ? 12 : 14;

  let timeText: string;
  if (minutes < 60) {
    timeText = `${minutes}m`;
  } else if (minutes < 1440) {
    timeText = `${Math.round(minutes / 60)}h`;
  } else {
    timeText = `${Math.round(minutes / 1440)}d`;
  }

  // Color based on response time
  let iconColor = colors.success;
  if (minutes > 60) iconColor = colors.warning;
  if (minutes > 1440) iconColor = colors.textMuted;

  return (
    <View className={['flex-row items-center gap-1', className].filter(Boolean).join(' ')}>
      <ZapIcon size={iconSize} color={iconColor} />
      <Text
        className={textSize}
        style={{ color: colors.textMuted }}
      >
        Responds in ~{timeText}
      </Text>
    </View>
  );
}
