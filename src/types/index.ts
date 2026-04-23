export type SwingState = 'idle' | 'raised' | 'downswing' | 'counted';

export interface Point3D {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseData {
  nose: Point3D;
  leftShoulder: Point3D;
  rightShoulder: Point3D;
  leftElbow: Point3D;
  rightElbow: Point3D;
  leftWrist: Point3D;
  rightWrist: Point3D;
  leftHip: Point3D;
  rightHip: Point3D;
}

export interface AppSettings {
  sensitivity: number; // 0.0 to 1.0
  cooldownMs: number;
  handedness: 'right' | 'left' | 'both';
  showDebug: boolean;
  selectedCameraId?: string;
}

export interface DebugInfo {
  state: SwingState;
  fps: number;
  wristY: number;
  shoulderY: number;
  velocity: number;
  message: string;
}
