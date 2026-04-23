import { useRef, useState, useCallback } from 'react';
import { PoseData, SwingState, AppSettings, DebugInfo } from '../../types';
import { audio } from '../../utils/audio';

export function useSwingCounter(settings: AppSettings) {
  const [count, setCount] = useState(0);
  const [state, setState] = useState<SwingState>('idle');
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  const stateRef = useRef<SwingState>('idle');
  const lastWristYRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const processPose = useCallback((pose: PoseData | null) => {
    const now = performance.now();
    const dt = now - lastTimeRef.current;
    
    if (!pose) {
      if (dt > 100) {
         setDebugInfo(prev => prev ? { ...prev, message: 'No pose detected', fps: 1000/dt } : null);
         
         // もし振り下ろし中に画面外に出てロストした場合、振り切ったとみなしてカウントする（甘め判定）
         if (stateRef.current === 'downswing') {
            setCount(c => c + 1);
            audio.playSwing();
            stateRef.current = 'counted';
            setState('counted');
            if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
            cooldownTimerRef.current = setTimeout(() => {
              stateRef.current = 'idle';
              setState('idle');
            }, settings.cooldownMs);
         }
      }
      return;
    }

    // Use average of both wrists or specific handedness
    let wristY = 0;
    if (settings.handedness === 'right') {
      wristY = pose.rightWrist.y;
    } else if (settings.handedness === 'left') {
      wristY = pose.leftWrist.y;
    } else {
      wristY = (pose.leftWrist.y + pose.rightWrist.y) / 2;
    }

    const shoulderY = (pose.leftShoulder.y + pose.rightShoulder.y) / 2;
    const hipY = (pose.leftHip.y + pose.rightHip.y) / 2;
    const noseY = pose.nose.y;

    // Calculate velocity (change in Y over time)
    // Positive velocity means moving DOWN (Y is increasing)
    let velocity = 0;
    if (lastTimeRef.current > 0 && dt > 0) {
      velocity = (wristY - lastWristYRef.current) / dt;
    }

    const currentState = stateRef.current;
    let nextState = currentState;
    let message = '';

    // Thresholds (can be adjusted by sensitivity later)
    // Y coordinates: 0 is top, 1 is bottom
    // 振り上げの閾値（肩より少し上。感度が高いほど緩くなる）
    const RAISE_THRESHOLD = shoulderY - 0.05 * settings.sensitivity; 
    // 振り下ろしの速度閾値
    const DOWNSWING_VELOCITY_THRESHOLD = 0.0003 * (2 - settings.sensitivity); 
    // 振り下ろし完了の閾値（肩より少し下。腰に依存せず、画面外に出る前に判定しやすくする）
    const FINISH_THRESHOLD = shoulderY + 0.15 / settings.sensitivity; 

    switch (currentState) {
      case 'idle':
        if (wristY < RAISE_THRESHOLD) {
          nextState = 'raised';
          message = 'Raised detected';
        }
        break;
      case 'raised':
        // If wrists drop below shoulders with some speed, it's a downswing
        if (velocity > DOWNSWING_VELOCITY_THRESHOLD && wristY > shoulderY) {
          nextState = 'downswing';
          message = 'Downswing started';
        } else if (wristY > shoulderY + 0.2) {
           // Dropped slowly, back to idle
           nextState = 'idle';
           message = 'Dropped slowly, reset';
        }
        break;
      case 'downswing':
        if (wristY > FINISH_THRESHOLD) {
          nextState = 'counted';
          message = 'Swing completed!';
          setCount(c => c + 1);
          audio.playSwing();
          
          // Start cooldown
          if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
          cooldownTimerRef.current = setTimeout(() => {
            stateRef.current = 'idle';
            setState('idle');
          }, settings.cooldownMs);
        } else if (velocity < -0.002) {
           // Moving up again without finishing? Cancel.
           nextState = 'idle';
           message = 'Swing canceled';
        }
        break;
      case 'counted':
        // Waiting for cooldown
        message = 'Cooldown...';
        break;
    }

    if (nextState !== currentState) {
      stateRef.current = nextState;
      setState(nextState);
    }

    if (settings.showDebug) {
      setDebugInfo({
        state: nextState,
        fps: dt > 0 ? Math.round(1000 / dt) : 0,
        wristY,
        shoulderY,
        velocity,
        message: message || `Tracking... (Y: ${wristY.toFixed(2)})`
      });
    }

    lastWristYRef.current = wristY;
    lastTimeRef.current = now;
  }, [settings]);

  const resetCount = useCallback(() => {
    setCount(0);
    setState('idle');
    stateRef.current = 'idle';
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
  }, []);

  return { count, state, processPose, resetCount, debugInfo };
}
