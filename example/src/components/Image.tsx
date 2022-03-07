import React from 'react';
import { Image as ImageComponent, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

const AnimatedImage = Animated.createAnimatedComponent(ImageComponent);
Animated.addWhitelistedNativeProps({ uri: true });

export const Image = ({ source }: { source: string }) => {
  return <AnimatedImage style={styles.image} source={{ uri: source }} />;
};
const styles = StyleSheet.create({
  image: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
});
