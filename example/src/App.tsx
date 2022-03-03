import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { multiply } from 'react-native-vision-camera-selfie-segmentation';
import {Camera, useCameraDevices} from "react-native-vision-camera";

export default function App() {
  const [result, setResult] = React.useState<number | undefined>();
  const devices = useCameraDevices();
  const device = devices.back

  React.useEffect(() => {
    const permissions = async () => {
      const newCameraPermission = await Camera.requestCameraPermission()
      const newMicrophonePermission = await Camera.requestMicrophonePermission()
    }

    permissions();
  }, []);

  if (device == null) return <></>

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
