import { useState, useEffect, RefObject } from 'react';

export function useCamera(videoRef: RefObject<HTMLVideoElement | null>, deviceId?: string) {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  // Get available video devices
  useEffect(() => {
    async function getDevices() {
      try {
        const d = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = d.filter(device => device.kind === 'videoinput');
        setDevices(videoInputDevices);
      } catch (err) {
        console.error('Error enumerating devices', err);
      }
    }
    
    // Listen for device changes (like plugging in a webcam)
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    getDevices();

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, []);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;

    async function setupCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (isMounted) setError('Browser API navigator.mediaDevices.getUserMedia not available');
        return;
      }

      try {
        const constraints: MediaStreamConstraints = {
          video: deviceId ? { deviceId: { exact: deviceId } } : {
             width: { ideal: 1280 },
             height: { ideal: 720 },
             facingMode: 'user',
          },
          audio: false,
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (isMounted) {
              videoRef.current?.play();
              setIsCameraReady(true);
            }
          };
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        if (isMounted) setError('Failed to access camera. Please allow camera permissions.');
      }
    }

    setupCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsCameraReady(false);
    };
  }, [videoRef, deviceId]);

  return { isCameraReady, error, devices };
}
