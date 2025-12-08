import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

interface AnimatedScreenWrapperProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
}

export const AnimatedScreenWrapper: React.FC<AnimatedScreenWrapperProps> = ({
  children,
  direction = 'right',
}) => {
  const isFocused = useIsFocused();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(direction === 'right' ? 30 : -30)).current;

  useEffect(() => {
    if (isFocused) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: direction === 'right' ? 30 : -30,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused, fadeAnim, slideAnim, direction]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

