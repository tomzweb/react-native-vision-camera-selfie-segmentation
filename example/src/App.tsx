import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import { getSelfieSegments } from 'react-native-vision-camera-selfie-segmentation';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { runOnJS } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { Image } from './components/Image';

export default function App() {
  const devices = useCameraDevices();
  const device = devices.back;
  const [image, setImage] = useState<string>('');

  const updateImage = (newImage: string) => {
    setImage(newImage);
  };

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const image = getSelfieSegments(frame, '#FF0000', '#00FF00');
    runOnJS(updateImage)(image);
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
      <View style={styles.imageContainer}>
        {image !== '' && <Image source={image} />}
      </View>
      <Camera
        style={styles.camera}
        device={device}
        isActive={true}
        frameProcessorFps={1}
        frameProcessor={frameProcessor}
        onFrameProcessorPerformanceSuggestionAvailable={(suggestion) => {
          console.log(suggestion);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    height: '50%',
    width: '100%',
  },
  camera: {
    flex: 1,
    height: '50%',
    width: '100%',
  },
});
