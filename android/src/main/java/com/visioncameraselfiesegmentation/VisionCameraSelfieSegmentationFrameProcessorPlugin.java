package com.visioncameraselfiesegmentation;

import android.util.Log;

import androidx.camera.core.ImageProxy;
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;

public class VisionCameraSelfieSegmentationFrameProcessorPlugin extends FrameProcessorPlugin {

  @Override
  public Object callback(ImageProxy image, Object[] params) {
    // code goes here
    Log.i("HERE", "SOMETHING HERE");
    return null;
  }

  VisionCameraSelfieSegmentationFrameProcessorPlugin() {
    super("getSelfieSegments");
  }
}
