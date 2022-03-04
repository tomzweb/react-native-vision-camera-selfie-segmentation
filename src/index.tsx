/* globals __selfieSegmentation */
import type { Frame } from 'react-native-vision-camera';

/**
 * Returns an array of matching `ImageLabel`s for the given frame.
 *
 * This algorithm executes within **~60ms**, so a frameRate of **16 FPS** perfectly allows the algorithm to run without dropping a frame. Anything higher might make video recording stutter, but works too.
 */
export function getSelfieSegments(frame: Frame): string {
  'worklet';
  // @ts-expect-error Frame Processors are not typed.
  return __getSelfieSegments(frame);
}
