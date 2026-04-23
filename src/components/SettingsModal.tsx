import React from 'react';
import { AppSettings } from '../types';
import { X, Camera } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onClose: () => void;
  onSave: (settings: AppSettings) => void;
  availableCameras: MediaDeviceInfo[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, settings, onClose, onSave, availableCameras }) => {
  const [localSettings, setLocalSettings] = React.useState<AppSettings>(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: keyof AppSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-800 shrink-0">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">設定</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Camera Selection */}
          {availableCameras.length > 0 && (
            <div className="pb-4 border-b border-gray-800">
              <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Camera className="w-4 h-4" /> 使用するカメラ
              </label>
              <select
                value={localSettings.selectedCameraId || ''}
                onChange={(e) => handleChange('selectedCameraId', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">デフォルト (前面カメラ推奨)</option>
                {availableCameras.map(camera => (
                  <option key={camera.deviceId} value={camera.deviceId}>
                    {camera.label || `カメラ (${camera.deviceId.slice(0, 5)}...)`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Handedness */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">判定に使用する手</label>
            <div className="grid grid-cols-3 gap-2">
              {(['left', 'both', 'right'] as const).map(hand => (
                <button
                  key={hand}
                  onClick={() => handleChange('handedness', hand)}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors border ${
                    localSettings.handedness === hand 
                      ? 'bg-red-600 border-red-500 text-white' 
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {hand === 'left' ? '左手' : hand === 'right' ? '右手' : '両手平均'}
                </button>
              ))}
            </div>
          </div>

          {/* Sensitivity */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">感度 (速度閾値)</label>
              <span className="text-sm text-red-400">{localSettings.sensitivity.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.9"
              step="0.1"
              value={localSettings.sensitivity}
              onChange={(e) => handleChange('sensitivity', parseFloat(e.target.value))}
              className="w-full accent-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">高いほどゆっくり振っても判定されます</p>
          </div>

          {/* Cooldown */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">クールダウン時間</label>
              <span className="text-sm text-red-400">{localSettings.cooldownMs} ms</span>
            </div>
            <input
              type="range"
              min="300"
              max="2000"
              step="100"
              value={localSettings.cooldownMs}
              onChange={(e) => handleChange('cooldownMs', parseInt(e.target.value))}
              className="w-full accent-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">1回カウントした後の待機時間</p>
          </div>

          {/* Debug Mode */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <label className="text-sm font-medium text-gray-300">デバッグ表示</label>
            <button
              onClick={() => handleChange('showDebug', !localSettings.showDebug)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localSettings.showDebug ? 'bg-red-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.showDebug ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 bg-gray-900/50 shrink-0">
          <button
            onClick={handleSave}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-red-900/20"
          >
            保存して閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
