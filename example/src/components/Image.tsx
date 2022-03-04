import React from 'react';
import { Image as ImageComponent, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

const AnimatedImage = Animated.createAnimatedComponent(ImageComponent);
Animated.addWhitelistedNativeProps({ uri: true });

export const Image = ({ source }: { source: string }) => {
  console.log('HERE');
  return <AnimatedImage style={styles.image} source={{ uri: source }} />;
};
const styles = StyleSheet.create({
  image: {
    height: 200,
    width: 200,
  },
});
