import * as React from 'react';

import { Animated, Image, StyleSheet, View } from 'react-native';
import { getSelfieSegments } from 'react-native-vision-camera-selfie-segmentation';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { useSharedValue } from 'react-native-reanimated';
import { useEffect } from 'react';
const AnimatedImage = Animated.createAnimatedComponent(Image);

export default function App() {
  const devices = useCameraDevices();
  const device = devices.back;
  const base64Image = useSharedValue<string>('');

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      console.log('UPDATING BASE 64 IMAGE');
      const image = getSelfieSegments(frame);
      base64Image.value = image;
    },
    [base64Image]
  );
  useEffect(() => {
    const permissions = async () => {
      const newCameraPermission = await Camera.requestCameraPermission();
      const newMicrophonePermission =
        await Camera.requestMicrophonePermission();
    };

    permissions();
  }, []);

  if (device == null) return <></>;

  return (
    <View style={styles.container}>
      <AnimatedImage
        style={styles.camera}
        source={{ uri: `data:image/jpeg;base64,${base64Image.value}` }}
      />
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
        frameProcessorFps={3}
        frameProcessor={frameProcessor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    width: 200,
    // height: 200,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
