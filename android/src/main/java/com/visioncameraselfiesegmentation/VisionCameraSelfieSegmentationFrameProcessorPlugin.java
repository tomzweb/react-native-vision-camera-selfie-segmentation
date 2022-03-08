package com.visioncameraselfiesegmentation;

import android.annotation.SuppressLint;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.ImageFormat;
import android.graphics.Matrix;
import android.graphics.Rect;
import android.graphics.YuvImage;
import android.media.Image;
import android.util.Base64;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.camera.core.ImageProxy;

import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.Tasks;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.segmentation.Segmentation;
import com.google.mlkit.vision.segmentation.SegmentationMask;
import com.google.mlkit.vision.segmentation.Segmenter;
import com.google.mlkit.vision.segmentation.selfie.SelfieSegmenterOptions;
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.util.concurrent.ExecutionException;

public class VisionCameraSelfieSegmentationFrameProcessorPlugin extends FrameProcessorPlugin {
  private String bgColor;
  private String fgColor;

  @Override
  public Object callback(ImageProxy image, Object[] params) {

    // setup the segmentation options
    SelfieSegmenterOptions options =
      new SelfieSegmenterOptions.Builder()
        .setDetectorMode(SelfieSegmenterOptions.STREAM_MODE)
        .build();

    Segmenter segmenter = Segmentation.getClient(options);


    @SuppressLint("UnsafeOptInUsageError")
    Image iImage = image.getImage();

    // set colors from params
    bgColor = params.length >= 1 ? String.valueOf(params[0]) : "#000000";
    fgColor = params.length >= 2 ? String.valueOf(params[1]) : "";
    String base64Image = "";

    if (iImage.equals(null)) {
      return base64Image;
    }

    // convert the image to a bitmap then input image
    Bitmap bitmap = rotateBitmap(toBitmap(iImage), image.getImageInfo().getRotationDegrees(), true, false);;
    InputImage inputImage = InputImage.fromBitmap(bitmap, 0);

    // process the mask
    Task<SegmentationMask> result = segmenter.process(inputImage);

    try {
      SegmentationMask mask = Tasks.await(result);
      // convert mask
      base64Image = generateBase64MaskImage(mask, bitmap);
    } catch (ExecutionException e) {
      // The Task failed, this is the same exception you'd get in a non-blocking
      // failure handler.
    } catch (InterruptedException e) {
      // An interrupt occurred while waiting for the task to complete.
    }
    return base64Image;
  }


  private String generateBase64MaskImage (SegmentationMask mask, Bitmap image) {
    // create a blank bitmap to put our new mask/image
    Bitmap bgBitmap = Bitmap.createBitmap(image.getWidth(), image.getHeight(), image.getConfig());
    int maskWidth = mask.getWidth();
    int maskHeight = mask.getHeight();
    ByteBuffer bufferMask = mask.getBuffer();

    // set the default colours
    int backgroundColor = Color.parseColor(bgColor);
    int foregroundColor = fgColor.equals("") ? 0 : Color.parseColor(fgColor);

    for (int y = 0; y < maskHeight; y++) {
      for (int x = 0; x < maskWidth; x++) {
        // gets the likely hood of the background for this pixel
        double backgroundLikelihood = 1 - bufferMask.getFloat();
        // sets the color of the pixel, depending if background or not
        int bgPixel = backgroundLikelihood > 0.2 ? backgroundColor : foregroundColor != 0 ? foregroundColor : image.getPixel(x, y) ;
        bgBitmap.setPixel(x, y, bgPixel);
      }
    }

    // converts and returns base64 image
    return getBase64(bgBitmap);
  }

  VisionCameraSelfieSegmentationFrameProcessorPlugin() {
    super("getSelfieSegments");
  }

  /** Converts NV21 format byte buffer to bitmap. */
  @Nullable
  public static String getBase64(Bitmap bitmap) {
    ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
    bitmap.compress(Bitmap.CompressFormat.JPEG, 100, byteArrayOutputStream);
    byte[] byteArray = byteArrayOutputStream .toByteArray();
    return "data:image/jpeg;base64," + Base64.encodeToString(byteArray, Base64.NO_WRAP);
  }

  private Bitmap toBitmap(Image image) {
    Image.Plane[] planes = image.getPlanes();
    ByteBuffer yBuffer = planes[0].getBuffer();
    ByteBuffer uBuffer = planes[1].getBuffer();
    ByteBuffer vBuffer = planes[2].getBuffer();

    int ySize = yBuffer.remaining();
    int uSize = uBuffer.remaining();
    int vSize = vBuffer.remaining();

    byte[] nv21 = new byte[ySize + uSize + vSize];
    //U and V are swapped
    yBuffer.get(nv21, 0, ySize);
    vBuffer.get(nv21, ySize, vSize);
    uBuffer.get(nv21, ySize + vSize, uSize);

    YuvImage yuvImage = new YuvImage(nv21, ImageFormat.NV21, image.getWidth(), image.getHeight(), null);
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    yuvImage.compressToJpeg(new Rect(0, 0, yuvImage.getWidth(), yuvImage.getHeight()), 75, out);

    byte[] imageBytes = out.toByteArray();
    return BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.length);
  }

  private static Bitmap rotateBitmap(
    Bitmap bitmap, int rotationDegrees, boolean flipX, boolean flipY) {
    Matrix matrix = new Matrix();

    // Rotate the image back to straight.
    matrix.postRotate(rotationDegrees);

    // Mirror the image along the X or Y axis.
    matrix.postScale(flipX ? -1.0f : 1.0f, flipY ? -1.0f : 1.0f);
    Bitmap rotatedBitmap =
      Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);

    // Recycle the old bitmap if it has changed.
    if (rotatedBitmap != bitmap) {
      bitmap.recycle();
    }
    return rotatedBitmap;
  }

}
