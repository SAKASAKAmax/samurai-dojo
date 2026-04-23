import React, { useRef, useState, useEffect } from 'react';
import { CrackOverlay } from './CrackOverlay';
import { MemorialOverlay } from './MemorialOverlay';
import { audio } from '../../utils/audio';

// useMonsterBattle の戻り値型
export interface BattleState {
  imageSrc: string | null;
  setImageSrc: (src: string) => void;
  targetHits: number;
  setTargetHits: (n: number) => void;
  currentHits: number;
  started: boolean;
  defeated: boolean;
  memorialVisible: boolean;
  progress: number;
  startGame: () => void;
  resetGame: () => void;
}

interface MonsterBattlePanelProps {
  battle: BattleState;
}

export const MonsterBattlePanel: React.FC<MonsterBattlePanelProps> = ({ battle }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHit, setIsHit] = useState(false);
  const prevHitsRef = useRef(battle.currentHits);

  useEffect(() => {
    if (battle.currentHits > prevHitsRef.current && !battle.defeated) {
      setIsHit(true);
      audio.playHit();
      const timer = setTimeout(() => setIsHit(false), 300);
      prevHitsRef.current = battle.currentHits;
      return () => clearTimeout(timer);
    }
    prevHitsRef.current = battle.currentHits;
  }, [battle.currentHits, battle.defeated]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        battle.setImageSrc(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full mt-6 bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        ⚔️ モンスター討伐モード
      </h2>

      {!battle.started && !battle.memorialVisible && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-1">モンスター画像</label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500 cursor-pointer"
              />
            </div>
            <div className="w-full sm:w-32">
              <label className="block text-sm font-medium text-gray-400 mb-1">目標回数 (HP)</label>
              <input
                type="number"
                min="1"
                value={battle.targetHits}
                onChange={(e) => battle.setTargetHits(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          {battle.imageSrc && (
            <div className="flex items-center gap-4 mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <img src={battle.imageSrc} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-gray-700" />
              <button
                onClick={battle.startGame}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-red-900/20"
              >
                討伐開始！
              </button>
            </div>
          )}
        </div>
      )}

      {(battle.started || battle.memorialVisible) && (
        <div className="relative w-full aspect-video sm:aspect-[21/9] bg-black rounded-xl overflow-hidden border border-gray-800 flex items-center justify-center mt-4">

          {battle.imageSrc && !battle.memorialVisible && (
            <div className={`relative w-full h-full flex items-center justify-center ${isHit ? 'animate-hit-shake' : ''}`}>
              <img src={battle.imageSrc} alt="Monster" className="w-full h-full object-contain drop-shadow-2xl" />
              <CrackOverlay progress={battle.progress} />
              {isHit && <div className="absolute inset-0 bg-white mix-blend-overlay pointer-events-none animate-hit-flash z-20" />}
            </div>
          )}

          {battle.memorialVisible && battle.imageSrc && (
            <MemorialOverlay imageSrc={battle.imageSrc} totalHits={battle.targetHits} />
          )}

          <div className="absolute top-4 left-4 z-40 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 font-bold tracking-wider mb-1">
              {battle.defeated ? '討伐完了' : '討伐進行中'}
            </div>
            <div className="text-2xl font-black text-white tabular-nums leading-none">
              {battle.currentHits} <span className="text-sm text-gray-500">/ {battle.targetHits}</span>
            </div>
          </div>

          <div className="absolute top-4 right-4 z-40">
            <button
              onClick={battle.resetGame}
              className="bg-gray-800/80 hover:bg-gray-700 text-white text-sm font-semibold py-2 px-4 rounded-lg backdrop-blur-sm border border-gray-600 transition-colors"
            >
              リセット
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
