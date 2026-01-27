import { Text as RNText, TextProps as RNTextProps } from 'react-native';

type TextVariant =
  | 'hero'
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'body-sm'
  | 'caption';

type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: 'primary' | 'secondary' | 'muted' | 'inverse' | 'error' | 'success';
  className?: string;
}

const variantStyles: Record<TextVariant, string> = {
  hero: 'text-hero',
  display: 'text-display',
  h1: 'text-h1',
  h2: 'text-h2',
  h3: 'text-h3',
  h4: 'text-h4',
  body: 'text-body',
  'body-sm': 'text-body-sm',
  caption: 'text-caption',
};

const weightStyles: Record<TextWeight, string> = {
  regular: 'font-inter-regular',
  medium: 'font-inter-medium',
  semibold: 'font-inter-semibold',
  bold: 'font-inter-bold',
};

const colorStyles: Record<NonNullable<TextProps['color']>, string> = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  muted: 'text-text-muted',
  inverse: 'text-text-inverse',
  error: 'text-error-600',
  success: 'text-success-600',
};

/**
 * Typography component using the design system
 *
 * @example
 * <Text variant="h1">Heading</Text>
 * <Text variant="body" color="secondary">Body text</Text>
 * <Text variant="caption" weight="medium">Caption</Text>
 */
export function Text({
  variant = 'body',
  weight,
  color = 'primary',
  className = '',
  ...props
}: TextProps) {
  // Determine default weight based on variant
  const defaultWeight: TextWeight =
    ['hero', 'display', 'h1', 'h2', 'h3'].includes(variant)
      ? 'semibold'
      : variant === 'h4'
        ? 'medium'
        : 'regular';

  const finalWeight = weight ?? defaultWeight;

  const combinedClassName = [
    variantStyles[variant],
    weightStyles[finalWeight],
    colorStyles[color],
    className,
  ].filter(Boolean).join(' ');

  return <RNText className={combinedClassName} {...props} />;
}

// Convenience components for common use cases
export function Heading({ variant = 'h1', ...props }: Omit<TextProps, 'variant'> & { variant?: 'h1' | 'h2' | 'h3' | 'h4' }) {
  return <Text variant={variant} {...props} />;
}

export function Body({ ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="body" {...props} />;
}

export function Caption({ ...props }: Omit<TextProps, 'variant'>) {
  return <Text variant="caption" {...props} />;
}
