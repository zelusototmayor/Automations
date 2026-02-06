import { View, Text } from 'react-native';
import { CheckIcon } from './Icons';

// ═══════════════════════════════════════════════════════════════════════════
// UI DESIGN SPEC V1 COLORS
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  sage: '#6F8F79',         // CTA start (spec)
  sageLight: '#DCE9DF',    // Sage pastel (spec)
  sageDark: '#4F6F5A',     // CTA end (spec)
  lavender: '#E7E0F3',     // Lavender pastel (spec)
  lavenderLight: '#E7E0F3',
  lavenderDark: '#8A7A9E',
  blush: '#D4A5A5',
  blushLight: '#F0D4D4',
  blushDark: '#B87878',
  sky: '#D9ECF7',          // Sky pastel (spec)
  skyLight: '#D9ECF7',
  skyDark: '#7A9EB0',
  sand: '#F1E9DD',         // Sand pastel (spec)
  cream: '#F5F0E8',
  textMuted: '#9CA3AF',    // Spec muted text
  success: '#22C55E',      // Spec success
  successLight: '#DCFCE7',
  error: '#CF3A3A',
  errorLight: '#FDE8E8',
  warning: '#E8920F',
  warningLight: '#FFF6E5',
};

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'premium' | 'free' | 'creator';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: {
    bg: colors.cream,
    text: colors.textMuted,
  },
  success: {
    bg: colors.successLight,
    text: colors.success,
  },
  warning: {
    bg: colors.warningLight,
    text: colors.warning,
  },
  error: {
    bg: colors.errorLight,
    text: colors.error,
  },
  premium: {
    bg: colors.lavenderLight,
    text: colors.lavenderDark,
  },
  free: {
    bg: colors.sageLight,
    text: colors.sageDark,
  },
  creator: {
    bg: colors.skyLight,
    text: colors.skyDark,
  },
};

const sizeStyles = {
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    fontSize: 10,
  },
  md: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    fontSize: 12,
  },
};

/**
 * Premium badge component for status indicators and labels
 *
 * @example
 * <Badge variant="premium">PREMIUM</Badge>
 * <Badge variant="free" size="sm">Free Trial</Badge>
 */
export function Badge({
  variant = 'default',
  size = 'sm',
  children,
  className = '',
}: BadgeProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <View
      className={className}
      style={{
        backgroundColor: variantStyle.bg,
        paddingHorizontal: sizeStyle.paddingHorizontal,
        paddingVertical: sizeStyle.paddingVertical,
        borderRadius: sizeStyle.borderRadius,
      }}
    >
      <Text
        className="font-inter-semibold uppercase"
        style={{
          color: variantStyle.text,
          fontSize: sizeStyle.fontSize,
          letterSpacing: 0.3,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TIER BADGES
// ═══════════════════════════════════════════════════════════════════════════

type TierType = 'FREE' | 'PREMIUM' | 'CREATOR';

interface TierBadgeProps {
  tier: TierType;
  size?: 'sm' | 'md';
  className?: string;
}

const tierConfig: Record<TierType, { variant: BadgeVariant; label: string }> = {
  FREE: { variant: 'free', label: 'Free' },
  PREMIUM: { variant: 'premium', label: 'Premium' },
  CREATOR: { variant: 'creator', label: 'Creator' },
};

/**
 * Tier badge for coach or creator status
 *
 * @example
 * <TierBadge tier="PREMIUM" />
 */
export function TierBadge({ tier, size = 'sm', className }: TierBadgeProps) {
  const config = tierConfig[tier];
  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.label}
    </Badge>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VERIFIED BADGE
// ═══════════════════════════════════════════════════════════════════════════

interface VerifiedBadgeProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

/**
 * Premium verified coach badge with checkmark icon
 *
 * @example
 * <VerifiedBadge />
 * <VerifiedBadge showLabel />
 */
export function VerifiedBadge({ className = '', showLabel = false, size = 'sm' }: VerifiedBadgeProps) {
  const iconSize = size === 'sm' ? 12 : 14;
  const fontSize = size === 'sm' ? 10 : 12;
  const padding = size === 'sm' ? { px: 6, py: 3 } : { px: 8, py: 4 };

  return (
    <View
      className={['flex-row items-center', className].filter(Boolean).join(' ')}
      style={{
        backgroundColor: colors.sageLight,
        paddingHorizontal: padding.px,
        paddingVertical: padding.py,
        borderRadius: 10,
      }}
    >
      <CheckIcon size={iconSize} color={colors.sageDark} strokeWidth={2.5} />
      {showLabel && (
        <Text
          className="font-inter-medium ml-1"
          style={{
            color: colors.sageDark,
            fontSize: fontSize,
          }}
        >
          Verified
        </Text>
      )}
    </View>
  );
}
