import CoreVideo
import UIKit
import CoreMedia


@objc(VisionCameraSelfieSegmentation)
public class VisionCameraSelfieSegmentation: NSObject, FrameProcessorPluginBase {
  private static let context = CIContext(options: nil)
    
  @objc
  public static func callback(_ frame: Frame!, withArgs _: [Any]!) -> Any! {
      
      // set up the segmenter
      let options = SelfieSegmenterOptions()
      options.segmenterMode = .stream

      let segmenter = Segmenter.segmenter(options: options)
                
      // create the vision image from the buffer
      let visionImage = VisionImage(buffer: frame.buffer)

      
     // get the mask from the image
      var mask: SegmentationMask
      do {
        mask = try segmenter.results(in: visionImage)
      } catch let error {
        print("Failed to perform segmentation with error: \(error.localizedDescription).")
        return nil
      }
      
      // we need to convert the current buffer to a UI Image
      guard let imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else {
        print("Failed to get CVPixelBuffer!")
        return nil
      }
      let ciImage = CIImage(cvPixelBuffer: imageBuffer)
      guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else {
        print("Failed to create CGImage!")
        return nil
      }

      let uiImage = UIImage(cgImage: cgImage)
    
      // now we need to convert the UI Image to an image buffer
      let bufferImage = UIUtilities.createImageBuffer(from: uiImage)!

      // apply the mask to the buffer image
      UIUtilities.applySegmentationMask(mask: mask , to: bufferImage, backgroundColor: UIColor.blue, foregroundColor: nil)

      
      // now convert back to a UI image and return the base64 image
      let newUiImage = UIUtilities.createUIImage(from: bufferImage, orientation: visionImage.orientation)!;
      let base64Image = UIUtilities.convertImageToBase64String(img: newUiImage)
      
      return "data:image/jpeg;base64," + base64Image;
      
  }
   
    
    
//      segmenter.process(visionImage) { mask, error in
//        guard error == nil else {
//            print(error)
//          // Error.
//          return
//        }
//
//          if (mask != nil) {
//              UIUtilities.applySegmentationMask(mask: mask! , to: bufferImage, backgroundColor: UIColor.blue, foregroundColor: nil)
//              let newUiImage = UIUtilities.createUIImage(from: bufferImage, orientation: frame.orientation)!;
//              let base64Image = UIUtilities.convertImageToBase64String(img: newUiImage)
//              returnImage = "data:image/png;base64," + base64Image
//          }
//      }
          
    

}
