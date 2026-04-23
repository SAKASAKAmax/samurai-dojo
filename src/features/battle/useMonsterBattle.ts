import { useState, useEffect, useRef } from 'react';

export function useMonsterBattle(globalCount: number) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [targetHits, setTargetHits] = useState<number>(30);
  const [currentHits, setCurrentHits] = useState<number>(0);
  const [started, setStarted] = useState<boolean>(false);
  const [defeated, setDefeated] = useState<boolean>(false);
  const [memorialVisible, setMemorialVisible] = useState<boolean>(false);

  const prevGlobalCountRef = useRef(globalCount);

  useEffect(() => {
    if (globalCount > prevGlobalCountRef.current) {
      const diff = globalCount - prevGlobalCountRef.current;
      if (started && !defeated) {
        const newHits = currentHits + diff;
        setCurrentHits(newHits);
        if (newHits >= targetHits) {
          setDefeated(true);
          setMemorialVisible(true);
        }
      }
    }
    prevGlobalCountRef.current = globalCount;
  }, [globalCount, started, defeated, currentHits, targetHits]);

  const startGame = () => {
    if (!imageSrc) return;
    setCurrentHits(0);
    setStarted(true);
    setDefeated(false);
    setMemorialVisible(false);
  };

  const resetGame = () => {
    setCurrentHits(0);
    setStarted(false);
    setDefeated(false);
    setMemorialVisible(false);
  };

  const progress = targetHits > 0 ? Math.min(currentHits / targetHits, 1) : 0;

  return {
    imageSrc, setImageSrc,
    targetHits, setTargetHits,
    currentHits,
    started, defeated, memorialVisible,
    progress,
    startGame, resetGame
  };
}
