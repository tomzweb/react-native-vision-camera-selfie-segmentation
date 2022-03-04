import CoreVideo
import UIKit
import CoreMedia


@objc(VisionCameraSelfieSegmentation)
public class VisionCameraSelfieSegmentation: NSObject, FrameProcessorPluginBase {
  private static let context = CIContext(options: nil)

    
  @objc
  public static func callback(_ frame: Frame!, withArgs _: [Any]!) -> Any! {
            
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
      let visionImage = VisionImage(buffer: frame.buffer)
      
      let bufferImage = UIUtilities.createImageBuffer(from: uiImage)!
      
      let options = SelfieSegmenterOptions()
      let segmenter = Segmenter.segmenter(options: options)
      
      var returnImage = "";
      
//      segmenter.process(visionImage) { mask, error in
//        guard error == nil else {
//            print(error)
//          // Error.
//          return
//        }
//
//        UIUtilities.applySegmentationMask(mask: mask! , to: bufferImage, backgroundColor: UIColor.blue, foregroundColor: UIColor.red)
//        let newUiImage = UIUtilities.createUIImage(from: bufferImage, orientation: frame.orientation)!;
//        let base64Image = UIUtilities.convertImageToBase64String(img: newUiImage)
//        returnImage = "data:image/png;base64," + base64Image
//      }
            
      
      
     // Synchronuse
      var mask: SegmentationMask
      do {
        mask = try segmenter.results(in: visionImage)
        print("MASK")
      } catch let error {
        print("Failed to perform segmentation with error: \(error.localizedDescription).")
        return nil
      }

      UIUtilities.applySegmentationMask(mask: mask , to: bufferImage, backgroundColor: UIColor.blue, foregroundColor: UIColor.red)

      // To Image/Base64
      let newUiImage = UIUtilities.createUIImage(from: bufferImage, orientation: visionImage.orientation)!;
      let base64Image = UIUtilities.convertImageToBase64String(img: newUiImage)
      
      returnImage = "data:image/png;base64," + base64Image;
      
      
      return returnImage;
      
  }
   

}
