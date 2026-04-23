import React from 'react';

interface CrackOverlayProps {
  progress: number;
}

export const CrackOverlay: React.FC<CrackOverlayProps> = ({ progress }) => {
  // リアルなガラスのひび割れパス（参考画像のような鋭く立体的な割れ方）
  const cracks = [
    // 放射状のメインクラック
    { d: "M 46,45 L 38,30 L 25,15 L 0,5", appearAt: 0.1 },
    { d: "M 50,44 L 48,25 L 55,0", appearAt: 0.2 },
    { d: "M 53,43 L 65,35 L 85,15 L 100,5", appearAt: 0.3 },
    { d: "M 56,48 L 75,52 L 100,60", appearAt: 0.4 },
    { d: "M 51,54 L 65,75 L 80,100", appearAt: 0.5 },
    { d: "M 48,52 L 45,80 L 50,100", appearAt: 0.6 },
    { d: "M 44,50 L 30,70 L 15,90 L 0,100", appearAt: 0.7 },
    { d: "M 45,47 L 25,50 L 0,45", appearAt: 0.8 },

    // 枝分かれ・サブクラック
    { d: "M 38,30 L 45,0", appearAt: 0.25 },
    { d: "M 65,35 L 80,0", appearAt: 0.35 },
    { d: "M 75,52 L 100,40", appearAt: 0.45 },
    { d: "M 65,75 L 55,100", appearAt: 0.55 },
    { d: "M 30,70 L 0,80", appearAt: 0.65 },
    { d: "M 25,50 L 10,20", appearAt: 0.75 },

    // 横方向の細かいヒビ（クモの巣状）
    { d: "M 38,30 L 48,25", appearAt: 0.4 },
    { d: "M 65,35 L 75,52", appearAt: 0.6 },
    { d: "M 30,70 L 25,50", appearAt: 0.85 },
    { d: "M 45,80 L 30,70", appearAt: 0.9 },
    { d: "M 25,15 L 10,20", appearAt: 0.95 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {/* 全体の黒ずみオーバーレイ（視認性確保のためごくわずかに残す） */}
      <div 
        className="absolute inset-0 bg-black transition-opacity duration-300"
        style={{ opacity: progress * 0.2 }}
      />
      
      {/* ひび割れSVG */}
      <svg className="absolute inset-0 w-full h-full drop-shadow-xl" viewBox="0 0 100 100" preserveAspectRatio="none">
        {cracks.map((crack, i) => {
          const isVisible = progress >= crack.appearAt;
          if (!isVisible) return null;

          return (
            <g key={`crack-${i}`}>
              {/* 影（ガラスの厚み・深い部分） */}
              <path 
                d={crack.d} 
                stroke="rgba(0, 0, 0, 0.9)" 
                strokeWidth="1.2" 
                fill="none" 
                transform="translate(0.4, 0.4)"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* 中間色（ガラスの断面の屈折） */}
              <path 
                d={crack.d} 
                stroke="rgba(180, 200, 210, 0.5)" 
                strokeWidth="0.8" 
                fill="none" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* ハイライト（光の強い反射） */}
              <path 
                d={crack.d} 
                stroke="rgba(255, 255, 255, 1)" 
                strokeWidth="0.4" 
                fill="none" 
                transform="translate(-0.3, -0.3)"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
