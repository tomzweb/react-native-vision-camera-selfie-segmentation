import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import { getSelfieSegments } from 'react-native-vision-camera-selfie-segmentation';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { Image } from './components/Image';

export default function App() {
  const devices = useCameraDevices();
  const device = devices.front;
  const base64Image = useSharedValue<string>('');
  const [image, setImage] = useState<string>('');

  const updateImage = (newImage: string) => {
    setImage(newImage);
  };

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    base64Image.value = getSelfieSegments(frame);
    runOnJS(updateImage)(base64Image.value);
  }, []);

  useEffect(() => {
    const permissions = async () => {
      await Camera.requestCameraPermission();
    };

    permissions();
  }, []);

  if (device == null) return <></>;

  return (
    <View style={styles.container}>
      <Image source={image} />
      <Camera
        style={styles.camera}
        device={device}
        enableDepthData={true}
        isActive={true}
        frameProcessorFps={30}
        frameProcessor={frameProcessor}
        onFrameProcessorPerformanceSuggestionAvailable={(suggestion) => {
          console.log(suggestion);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    height: '50%',
    width: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
