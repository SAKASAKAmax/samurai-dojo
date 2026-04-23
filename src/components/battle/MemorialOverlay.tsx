import React from 'react';

interface MemorialOverlayProps {
  imageSrc: string;
  totalHits: number;
}

export const MemorialOverlay: React.FC<MemorialOverlayProps> = ({ imageSrc, totalHits }) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/95 p-4 animate-in fade-in duration-1000">
      <div className="relative border-8 border-gray-200 p-2 bg-black shadow-2xl transform -rotate-2 max-w-[200px] sm:max-w-[250px]">
        {/* モノクロ化・コントラスト強めの遺影風画像 */}
        <img 
          src={imageSrc} 
          alt="Memorial" 
          className="w-full aspect-square object-cover grayscale contrast-125 brightness-75" 
        />
        
        {/* 黒リボン風の装飾（簡易） */}
        <div className="absolute -top-2 -right-2 w-12 h-12 bg-black transform rotate-45 border border-gray-800"></div>
        <div className="absolute -top-2 -left-2 w-12 h-12 bg-black transform -rotate-45 border border-gray-800"></div>

        <div className="absolute -bottom-6 right-[-20px] bg-black text-white px-4 py-2 border-2 border-white text-lg font-serif font-bold transform rotate-3 shadow-lg">
          討伐完了
        </div>
      </div>
      
      <div className="mt-12 text-white font-serif text-2xl tracking-[0.2em] drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
        TOTAL HITS: {totalHits}
      </div>
    </div>
  );
};
