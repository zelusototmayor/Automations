import { Animated, Easing } from 'react-native';

/**
 * Animation utilities for consistent micro-interactions
 */

// Standard timing configurations
export const timing = {
  fast: 150,
  normal: 250,
  slow: 400,
};

// Easing curves
export const easing = {
  standard: Easing.bezier(0.4, 0, 0.2, 1),
  decelerate: Easing.bezier(0, 0, 0.2, 1),
  accelerate: Easing.bezier(0.4, 0, 1, 1),
  bounce: Easing.bezier(0.68, -0.55, 0.265, 1.55),
};

/**
 * Create a press animation (scale down then up)
 */
export function createPressAnimation(
  animatedValue: Animated.Value,
  toValue: number = 0.97,
  duration: number = timing.fast
) {
  return {
    pressIn: () => {
      Animated.spring(animatedValue, {
        toValue,
        useNativeDriver: true,
        friction: 5,
        tension: 100,
      }).start();
    },
    pressOut: () => {
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
        friction: 3,
        tension: 40,
      }).start();
    },
  };
}

/**
 * Create a fade animation
 */
export function createFadeAnimation(
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = timing.normal
) {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: easing.standard,
    useNativeDriver: true,
  });
}

/**
 * Create a slide animation
 */
export function createSlideAnimation(
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = timing.normal
) {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: easing.decelerate,
    useNativeDriver: true,
  });
}

/**
 * Create a staggered animation for list items
 */
export function createStaggeredAnimation(
  animatedValues: Animated.Value[],
  staggerDelay: number = 50,
  duration: number = timing.normal
) {
  return Animated.stagger(
    staggerDelay,
    animatedValues.map((value) =>
      Animated.timing(value, {
        toValue: 1,
        duration,
        easing: easing.decelerate,
        useNativeDriver: true,
      })
    )
  );
}

/**
 * Hook helper for press scale animation
 */
export function usePressScale(initialValue: number = 1) {
  const scale = new Animated.Value(initialValue);
  const handlers = createPressAnimation(scale);

  return {
    scale,
    style: { transform: [{ scale }] },
    ...handlers,
  };
}
