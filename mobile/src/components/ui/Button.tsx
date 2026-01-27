import { Pressable, Text, ActivityIndicator, View, PressableProps } from 'react-native';

// ═══════════════════════════════════════════════════════════════════════════
// BETTER COACHING DESIGN SYSTEM - NEUTRAL BASE WITH SAGE ACCENT
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  primary: '#4A7C59',
  primaryDark: '#3D6649',
  primaryLight: '#E8F0EB',
  error: '#DC2626',
  errorDark: '#B91C1C',
  textPrimary: '#111827',
  border: '#E5E7EB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
};

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, {
  bg: string;
  bgPressed: string;
  text: string;
  border?: string;
}> = {
  primary: {
    bg: colors.primary,
    bgPressed: colors.primaryDark,
    text: 'white',
  },
  secondary: {
    bg: colors.surface,
    bgPressed: colors.surfaceSecondary,
    text: colors.primary,
    border: colors.primary,
  },
  ghost: {
    bg: 'transparent',
    bgPressed: colors.primaryLight,
    text: colors.primary,
  },
  outline: {
    bg: colors.surface,
    bgPressed: colors.surfaceSecondary,
    text: colors.textPrimary,
    border: colors.border,
  },
  danger: {
    bg: colors.error,
    bgPressed: colors.errorDark,
    text: 'white',
  },
};

const sizeStyles: Record<ButtonSize, {
  height: number;
  paddingHorizontal: number;
  borderRadius: number;
  fontSize: number;
  iconSize: number;
}> = {
  sm: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 13,
    iconSize: 16,
  },
  md: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 10,
    fontSize: 15,
    iconSize: 20,
  },
  lg: {
    height: 56,
    paddingHorizontal: 28,
    borderRadius: 10,
    fontSize: 16,
    iconSize: 24,
  },
};

/**
 * Premium button component with pastel design system
 *
 * @example
 * <Button variant="primary" onPress={handlePress}>Submit</Button>
 * <Button variant="outline" size="sm">Cancel</Button>
 * <Button variant="danger" loading>Deleting...</Button>
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  className = '',
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Pressable
      disabled={isDisabled}
      className={[
        'flex-row items-center justify-center',
        fullWidth && 'w-full',
        className,
      ].filter(Boolean).join(' ')}
      style={({ pressed }) => ({
        height: sizeStyle.height,
        paddingHorizontal: sizeStyle.paddingHorizontal,
        borderRadius: sizeStyle.borderRadius,
        backgroundColor: pressed && !isDisabled ? variantStyle.bgPressed : variantStyle.bg,
        borderWidth: variantStyle.border ? 1 : 0,
        borderColor: variantStyle.border,
        opacity: isDisabled ? 0.5 : 1,
        // Subtle shadow for primary buttons only
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: variant === 'primary' ? 0.06 : 0,
        shadowRadius: 2,
        elevation: variant === 'primary' ? 1 : 0,
      })}
      {...props}
    >
      {({ pressed }) => (
        <>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={variantStyle.text}
            />
          ) : (
            <>
              {leftIcon && (
                <View className="mr-2">
                  {leftIcon}
                </View>
              )}
              <Text
                className="font-inter-semibold"
                style={{
                  fontSize: sizeStyle.fontSize,
                  color: variantStyle.text,
                }}
              >
                {children}
              </Text>
              {rightIcon && (
                <View className="ml-2">
                  {rightIcon}
                </View>
              )}
            </>
          )}
        </>
      )}
    </Pressable>
  );
}

// Convenience components for common use cases
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" {...props} />;
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="secondary" {...props} />;
}

export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="ghost" {...props} />;
}

export function OutlineButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="outline" {...props} />;
}

export function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="danger" {...props} />;
}
