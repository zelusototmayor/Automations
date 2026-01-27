import { useRef } from 'react';
import { Animated, Pressable, PressableProps, ViewStyle } from 'react-native';

interface AnimatedPressableProps extends PressableProps {
  scaleValue?: number;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  className?: string;
}

/**
 * A Pressable component with built-in scale animation on press
 *
 * @example
 * <AnimatedPressable onPress={handlePress}>
 *   <Text>Tap me</Text>
 * </AnimatedPressable>
 *
 * <AnimatedPressable scaleValue={0.95} onPress={handlePress}>
 *   <View className="bg-white p-4 rounded-xl">
 *     <Text>Card content</Text>
 *   </View>
 * </AnimatedPressable>
 */
export function AnimatedPressable({
  scaleValue = 0.97,
  children,
  style,
  className,
  onPressIn,
  onPressOut,
  ...props
}: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.spring(scale, {
      toValue: scaleValue,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 40,
    }).start();
    onPressOut?.(e);
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]} className={className}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export default AnimatedPressable;
