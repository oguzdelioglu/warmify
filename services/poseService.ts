// Wrapper for MediaPipe Pose
import { Pose, Results } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

export class PoseService {
  private pose: Pose | null = null;
  private camera: Camera | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private onResultsCallback: (results: Results) => void;
  private isActive: boolean = false; // Guard flag

  constructor(onResults: (results: Results) => void) {
    this.onResultsCallback = onResults;
  }

  async initialize(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
    this.isActive = true;

    this.pose = new Pose({
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

    this.pose.onResults((results: Results) => {
      if (this.isActive) {
        // @ts-ignore
        this.onResultsCallback(results);
      }
    });

    // Use MediaPipe Camera Utils
    this.camera = new Camera(this.videoElement, {
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
      } catch (e) { console.log("Camera stop error", e); }
    }

    if (this.pose) {
      try {
        this.pose.close();
      } catch (e) { console.log("Pose close error", e); }
    }
  }
}