import { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle, DimensionValue } from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
  className?: string;
}

/**
 * Animated skeleton loading placeholder
 *
 * @example
 * <Skeleton width={200} height={20} />
 * <Skeleton width="100%" height={100} borderRadius={12} />
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  className,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      className={className}
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E4E4E7',
          opacity,
        },
        style,
      ]}
    />
  );
}

interface SkeletonCardProps {
  variant?: 'default' | 'compact' | 'horizontal';
  className?: string;
}

/**
 * Pre-built skeleton for coach cards
 *
 * @example
 * <SkeletonCard />
 * <SkeletonCard variant="compact" />
 */
export function SkeletonCard({ variant = 'default', className }: SkeletonCardProps) {
  if (variant === 'compact') {
    return (
      <View className={['bg-white rounded-card w-40 p-4 mr-3 border border-border', className].filter(Boolean).join(' ')}>
        <Skeleton width={64} height={64} borderRadius={12} />
        <Skeleton width="80%" height={14} style={{ marginTop: 12 }} />
        <Skeleton width="60%" height={12} style={{ marginTop: 8 }} />
        <Skeleton width={80} height={12} style={{ marginTop: 8 }} />
      </View>
    );
  }

  if (variant === 'horizontal') {
    return (
      <View className={['bg-white rounded-card p-4 mb-3 flex-row border border-border', className].filter(Boolean).join(' ')}>
        <Skeleton width={64} height={64} borderRadius={12} />
        <View className="flex-1 ml-4">
          <Skeleton width="60%" height={16} />
          <Skeleton width="90%" height={14} style={{ marginTop: 8 }} />
          <Skeleton width={100} height={12} style={{ marginTop: 8 }} />
        </View>
      </View>
    );
  }

  return (
    <View className={['bg-white rounded-card p-card-padding mb-3 border border-border', className].filter(Boolean).join(' ')}>
      <View className="flex-row">
        <Skeleton width={56} height={56} borderRadius={12} />
        <View className="flex-1 ml-3">
          <Skeleton width="50%" height={16} />
          <Skeleton width="80%" height={14} style={{ marginTop: 6 }} />
        </View>
        <Skeleton width={60} height={24} borderRadius={20} />
      </View>
      <View className="flex-row mt-3 gap-2">
        <Skeleton width={80} height={16} />
        <Skeleton width={60} height={16} />
      </View>
      <View className="flex-row mt-3 gap-1">
        <Skeleton width={50} height={24} borderRadius={20} />
        <Skeleton width={60} height={24} borderRadius={20} />
        <Skeleton width={55} height={24} borderRadius={20} />
      </View>
    </View>
  );
}

export default Skeleton;
