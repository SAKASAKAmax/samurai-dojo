/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CameraView } from './components/CameraView';
import { Dashboard } from './components/Dashboard';
import { SettingsModal } from './components/SettingsModal';
import { MonsterBattlePanel } from './components/battle/MonsterBattlePanel';
import { useSwingCounter } from './features/counter/useSwingCounter';
import { AppSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { Sword } from 'lucide-react';
import { audio } from './utils/audio';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('bokken_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);

  const { count, state, processPose, resetCount, debugInfo } = useSwingCounter(settings);

  // 初回タップ時にAudioContextを初期化（ブラウザの自動再生制限対策）
  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteracted) {
        audio.init();
        setHasInteracted(true);
      }
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [hasInteracted]);

  useEffect(() => {
    localStorage.setItem('bokken_settings', JSON.stringify(settings));
  }, [settings]);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500/30">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg relative overflow-hidden">
              <Sword className="w-5 h-5 text-white relative z-10" />
            </div>
            <h1 className="text-xl font-black tracking-widest text-gray-100 italic">
              SAMURAI <span className="text-red-500">DoJo</span>
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <p className="text-gray-400 text-sm">
            カメラの前に立ち、木刀（または素手）を構えてください。上半身が映るように調整し、振りかぶってから振り下ろすと自動でカウントされます。
          </p>
        </div>

        <CameraView 
          onPoseUpdate={processPose} 
          count={count} 
          state={state}
          selectedCameraId={settings.selectedCameraId}
          onCameraDevicesLoaded={setAvailableCameras}
        />
        
        <Dashboard 
          state={state} 
          debugInfo={debugInfo}
          onReset={resetCount}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <MonsterBattlePanel globalCount={count} />
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={setSettings}
        availableCameras={availableCameras}
      />
    </div>
  );
}
