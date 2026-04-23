import React from 'react';
import { SwingState, DebugInfo } from '../types';
import { Activity, CheckCircle2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface DashboardProps {
  state: SwingState;
  debugInfo: DebugInfo | null;
  onReset: () => void;
  onOpenSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, debugInfo, onReset, onOpenSettings }) => {
  
  const getStateConfig = (s: SwingState) => {
    switch (s) {
      case 'idle': return { color: 'text-gray-400', bg: 'bg-gray-800', icon: Activity, label: '待機中 (構えてください)' };
      case 'raised': return { color: 'text-red-400', bg: 'bg-red-900/30', icon: ArrowUpCircle, label: '振り上げ検知' };
      case 'downswing': return { color: 'text-amber-400', bg: 'bg-amber-900/30', icon: ArrowDownCircle, label: '振り下ろし中' };
      case 'counted': return { color: 'text-green-400', bg: 'bg-green-900/30', icon: CheckCircle2, label: 'カウント成功！' };
    }
  };

  const config = getStateConfig(state);
  const StateIcon = config.icon;

  return (
    <div className="w-full mt-4 space-y-4">
      {/* Status & Controls */}
      <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 flex flex-col sm:flex-row items-center justify-between shadow-xl gap-4">
        
        <div className={`flex flex-1 w-full items-center justify-center sm:justify-start px-4 py-3 rounded-xl border border-gray-700/50 ${config.bg} transition-colors duration-300`}>
          <StateIcon className={`w-6 h-6 mr-3 ${config.color}`} />
          <span className={`text-lg font-bold ${config.color}`}>{config.label}</span>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={onReset}
            className="flex-1 sm:flex-none bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors border border-gray-700"
          >
            リセット
          </button>
          <button
            onClick={onOpenSettings}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-red-900/20"
          >
            設定
          </button>
        </div>
      </div>

      {/* Debug Info */}
      {debugInfo && (
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 font-mono text-xs text-gray-400">
          <div className="flex justify-between mb-2 pb-2 border-b border-gray-800">
            <span className="text-gray-300 font-semibold">Debug Info</span>
            <span className={debugInfo.fps < 20 ? 'text-red-400' : 'text-green-400'}>{debugInfo.fps}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>State: <span className="text-white">{debugInfo.state}</span></div>
            <div>Wrist Y: <span className="text-white">{debugInfo.wristY.toFixed(3)}</span></div>
            <div>Shoulder Y: <span className="text-white">{debugInfo.shoulderY.toFixed(3)}</span></div>
            <div>Velocity: <span className="text-white">{debugInfo.velocity.toFixed(5)}</span></div>
            <div className="col-span-2 text-red-400 mt-1">{debugInfo.message}</div>
          </div>
        </div>
      )}
    </div>
  );
};
