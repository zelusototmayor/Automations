import { Pressable, Text, ActivityIndicator, View, PressableProps } from 'react-native';

// ═══════════════════════════════════════════════════════════════════════════
// UI DESIGN SPEC V1 COLORS
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  sage: '#6F8F79',        // CTA start (spec)
  sageDark: '#4F6F5A',    // CTA end (spec)
  sageLight: '#DCE9DF',   // Sage pastel (spec)
  lavender: '#E7E0F3',    // Lavender pastel (spec)
  lavenderDark: '#8A7A9E',
  error: '#CF3A3A',
  errorDark: '#AD2E2E',
  textPrimary: '#111827', // Spec primary text
  border: '#E7E7E7',      // Spec border
  surface: '#F7F6F3',     // Spec background
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
    bg: colors.sage,
    bgPressed: colors.sageDark,
    text: 'white',
  },
  secondary: {
    bg: colors.lavender,
    bgPressed: colors.lavenderDark,
    text: 'white',
  },
  ghost: {
    bg: 'transparent',
    bgPressed: colors.sageLight,
    text: colors.sageDark,
  },
  outline: {
    bg: 'transparent',
    bgPressed: colors.surface,
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
    borderRadius: 14,    // Updated
    fontSize: 13,
    iconSize: 16,
  },
  md: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 20,    // Spec: 18-20px
    fontSize: 15,
    iconSize: 20,
  },
  lg: {
    height: 56,
    paddingHorizontal: 28,
    borderRadius: 22,    // Spec: larger buttons use card radius
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
        // Spec shadow: 0 6px 16px rgba(17,24,39,0.08)
        shadowColor: 'rgb(17, 24, 39)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: variant === 'primary' || variant === 'secondary' ? 0.08 : 0,
        shadowRadius: 16,
        elevation: variant === 'primary' || variant === 'secondary' ? 3 : 0,
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
