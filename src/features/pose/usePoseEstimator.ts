import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, PoseLandmarker, DrawingUtils } from '@mediapipe/tasks-vision';
import { PoseData } from '../../types';
import { POSE_LANDMARKS } from '../../constants';

export function usePoseEstimator(videoRef: React.RefObject<HTMLVideoElement | null>, canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  const onPoseUpdateRef = useRef<((pose: PoseData | null) => void) | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm'
        );

        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (isMounted) {
          poseLandmarkerRef.current = landmarker;
          setIsLoaded(true);
        }
      } catch (err) {
        console.error('Failed to initialize PoseLandmarker:', err);
        if (isMounted) {
          setError('Failed to load pose estimation model.');
        }
      }
    }

    init();

    return () => {
      isMounted = false;
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const setOnPoseUpdate = (callback: (pose: PoseData | null) => void) => {
    onPoseUpdateRef.current = callback;
  };

  useEffect(() => {
    if (!isLoaded || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawingUtils = new DrawingUtils(ctx);

    const predictWebcam = () => {
      if (!poseLandmarkerRef.current || video.readyState < 2) {
        requestRef.current = requestAnimationFrame(predictWebcam);
        return;
      }

      // Ensure canvas matches video dimensions
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      let startTimeMs = performance.now();
      if (lastVideoTimeRef.current !== video.currentTime) {
        lastVideoTimeRef.current = video.currentTime;
        
        const result = poseLandmarkerRef.current.detectForVideo(video, startTimeMs);
        
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        if (result.landmarks && result.landmarks.length > 0) {
          const landmarks = result.landmarks[0];
          
          // Draw landmarks
          drawingUtils.drawLandmarks(landmarks, {
            radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
            color: '#00FF00',
            lineWidth: 2
          });
          drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 4
          });

          // Extract relevant pose data
          if (onPoseUpdateRef.current) {
            const poseData: PoseData = {
              nose: landmarks[POSE_LANDMARKS.NOSE],
              leftShoulder: landmarks[POSE_LANDMARKS.LEFT_SHOULDER],
              rightShoulder: landmarks[POSE_LANDMARKS.RIGHT_SHOULDER],
              leftElbow: landmarks[POSE_LANDMARKS.LEFT_ELBOW],
              rightElbow: landmarks[POSE_LANDMARKS.RIGHT_ELBOW],
              leftWrist: landmarks[POSE_LANDMARKS.LEFT_WRIST],
              rightWrist: landmarks[POSE_LANDMARKS.RIGHT_WRIST],
              leftHip: landmarks[POSE_LANDMARKS.LEFT_HIP],
              rightHip: landmarks[POSE_LANDMARKS.RIGHT_HIP],
            };
            onPoseUpdateRef.current(poseData);
          }
        } else {
          if (onPoseUpdateRef.current) {
            onPoseUpdateRef.current(null);
          }
        }
        ctx.restore();
      }

      requestRef.current = requestAnimationFrame(predictWebcam);
    };

    requestRef.current = requestAnimationFrame(predictWebcam);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isLoaded, videoRef, canvasRef]);

  return { isLoaded, error, setOnPoseUpdate };
}
