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
import { useMonsterBattle } from './features/battle/useMonsterBattle';
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
  const battle = useMonsterBattle(count);

  const isBattleActive = battle.started || battle.memorialVisible;

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

  const cameraView = (
    <CameraView
      onPoseUpdate={processPose}
      count={count}
      state={state}
      selectedCameraId={settings.selectedCameraId}
      onCameraDevicesLoaded={setAvailableCameras}
    />
  );

  const dashboard = (
    <Dashboard
      state={state}
      debugInfo={debugInfo}
      onReset={resetCount}
      onOpenSettings={() => setIsSettingsOpen(true)}
    />
  );

  const battlePanel = <MonsterBattlePanel battle={battle} />;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-500/30">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="w-full px-4 lg:px-8 h-16 flex items-center justify-between max-w-5xl mx-auto lg:max-w-none">
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

      <main className="px-4 py-8 max-w-5xl mx-auto lg:max-w-none lg:px-8 lg:py-6">
        {/* Mobile / Tablet: vertical stack */}
        <div className="lg:hidden">
          <div className="mb-8 text-center max-w-2xl mx-auto">
            <p className="text-gray-400 text-sm">
              カメラの前に立ち、木刀（または素手）を構えてください。上半身が映るように調整し、振りかぶってから振り下ろすと自動でカウントされます。
            </p>
          </div>
          {cameraView}
          {dashboard}
          {battlePanel}
        </div>

        {/* PC: two-column layout */}
        <div className="hidden lg:flex gap-6 items-start">
          {/* Left: バトル中はMonsterBattlePanel、通常はCamera */}
          <div className="flex-1 min-w-0">
            {isBattleActive ? battlePanel : cameraView}
          </div>

          {/* Right: バトル中はCamera+Dashboard、通常はDashboard+MonsterBattlePanel */}
          <div className="w-[400px] flex-shrink-0 space-y-4">
            {isBattleActive ? (
              <>
                {cameraView}
                {dashboard}
              </>
            ) : (
              <>
                <p className="text-gray-400 text-sm">
                  カメラの前に立ち、木刀（または素手）を構えてください。上半身が映るように調整し、振りかぶってから振り下ろすと自動でカウントされます。
                </p>
                {dashboard}
                {battlePanel}
              </>
            )}
          </div>
        </div>
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
