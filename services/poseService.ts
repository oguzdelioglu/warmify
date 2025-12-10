// Wrapper for MediaPipe Pose
export class PoseService {
  private pose: any;
  private camera: any;
  private videoElement: HTMLVideoElement | null = null;
  private onResultsCallback: (results: any) => void;
  private isActive: boolean = false; // Guard flag

  constructor(onResults: (results: any) => void) {
    this.onResultsCallback = onResults;
  }

  async initialize(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
    this.isActive = true;

    // @ts-ignore
    if (!window.Pose) {
      console.error("MediaPipe Pose not loaded");
      return;
    }

    // @ts-ignore
    this.pose = new window.Pose({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });

    this.pose.setOptions({
      modelComplexity: 1, 
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.pose.onResults((results: any) => {
        if (this.isActive) {
            this.onResultsCallback(results);
        }
    });

    // Use MediaPipe Camera Utils
    // @ts-ignore
    this.camera = new window.Camera(this.videoElement, {
      onFrame: async () => {
        // CRITICAL FIX: Do not send data if service is stopped
        if (this.videoElement && this.pose && this.isActive) {
          try {
            await this.pose.send({ image: this.videoElement });
          } catch (e) {
            console.warn("MediaPipe send error (likely shutdown):", e);
          }
        }
      },
      width: 640,
      height: 480
    });

    await this.camera.start();
  }

  stop() {
    this.isActive = false; // Stop accepting new frames immediately
    
    if (this.camera) {
      try {
        this.camera.stop();
      } catch(e) { console.log("Camera stop error", e); }
    }
    
    if (this.pose) {
      try {
          this.pose.close();
      } catch(e) { console.log("Pose close error", e); }
    }
  }
}