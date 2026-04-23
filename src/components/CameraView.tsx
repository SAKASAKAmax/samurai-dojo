import React, { useRef, useEffect } from 'react';
import { useCamera } from '../features/camera/useCamera';
import { usePoseEstimator } from '../features/pose/usePoseEstimator';
import { PoseData, SwingState } from '../types';

interface CameraViewProps {
  onPoseUpdate: (pose: PoseData | null) => void;
  count: number;
  state: SwingState;
  selectedCameraId?: string;
  onCameraDevicesLoaded?: (devices: MediaDeviceInfo[]) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onPoseUpdate, count, state, selectedCameraId, onCameraDevicesLoaded }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { isCameraReady, error: cameraError, devices } = useCamera(videoRef, selectedCameraId);
  const { isLoaded: isPoseLoaded, error: poseError, setOnPoseUpdate } = usePoseEstimator(videoRef, canvasRef);

  useEffect(() => {
    setOnPoseUpdate(onPoseUpdate);
  }, [onPoseUpdate, setOnPoseUpdate]);

  useEffect(() => {
    if (onCameraDevicesLoaded && devices.length > 0) {
      onCameraDevicesLoaded(devices);
    }
  }, [devices, onCameraDevicesLoaded]);

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
      {/* Video Element (Hidden but active) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-0"
        playsInline
        muted
      />
      
      {/* Canvas for drawing video and landmarks */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
      />

      {/* Overlay: Count */}
      <div className="absolute top-4 left-6 z-20 pointer-events-none">
        <div className="text-white/90 text-sm md:text-lg font-bold uppercase tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mb-[-5px] md:mb-[-10px]">Count</div>
        <div className="text-8xl md:text-[10rem] font-black text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] tabular-nums leading-none">
          {count}
        </div>
      </div>

      {/* Loading States */}
      {(!isCameraReady || !isPoseLoaded) && !cameraError && !poseError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-white z-10">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium">
            {!isCameraReady ? 'Starting camera...' : 'Loading AI model...'}
          </p>
        </div>
      )}

      {/* Error States */}
      {(cameraError || poseError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/90 text-white p-6 text-center z-10">
          <div>
            <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-lg font-semibold">{cameraError || poseError}</p>
          </div>
        </div>
      )}
    </div>
  );
};
