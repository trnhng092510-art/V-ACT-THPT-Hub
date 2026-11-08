import React, { useMemo } from 'react';
import { BlinkBlinkConfig } from '../types';

interface Props {
  config: BlinkBlinkConfig;
}

export const BlinkBlinkEngine: React.FC<Props> = ({ config }) => {
  if (!config || !config.enabled) return null;

  // Generate deterministic particles based on count
  const particles = useMemo(() => {
    const list = [];
    const count = Math.min(Math.max(config.count || 20, 8), 60);

    for (let i = 0; i < count; i++) {
      const left = Math.round(((i * 137.5) % 100) * 10) / 10; // Fibonacci distributed
      const top = Math.round(((i * 89.3) % 100) * 10) / 10;
      const delay = (i * 0.3) % 4;
      const duration = (3 + (i % 5) * 1.2) / Math.max(0.5, config.speed || 1);
      const scale = 0.6 + (i % 4) * 0.2;
      list.push({ id: i, left, top, delay, duration, scale });
    }
    return list;
  }, [config.count, config.speed]);

  const renderParticleSymbol = () => {
    switch (config.type) {
      case 'sparkle':
        return '✨';
      case 'star':
        return '⭐';
      case 'sakura':
        return '🌸';
      case 'snow':
        return '❄️';
      case 'lightbulb':
        return '💡';
      case 'custom':
        if (config.customIconUrl) {
          return (
            <img
              src={config.customIconUrl}
              alt="particle"
              className="w-full h-full object-contain pointer-events-none"
            />
          );
        }
        return '✨';
      default:
        return '✨';
    }
  };

  const isCustomImage = config.type === 'custom' && config.customIconUrl;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-20"
      aria-hidden="true"
    >
      <style>{`
        @keyframes floatBlink {
          0% {
            transform: translateY(0px) rotate(0deg) scale(0.8);
            opacity: 0.15;
          }
          50% {
            transform: translateY(-24px) rotate(18deg) scale(1.15);
            opacity: 0.85;
          }
          100% {
            transform: translateY(-48px) rotate(36deg) scale(0.8);
            opacity: 0.15;
          }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute flex items-center justify-center select-none"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${config.size}px`,
            height: `${config.size}px`,
            fontSize: `${config.size}px`,
            animation: `floatBlink ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
            filter: isCustomImage ? `drop-shadow(0 0 8px ${config.glowColor || '#a855f7'})` : `drop-shadow(0 0 10px ${config.glowColor || '#a855f7'})`,
            opacity: 0.7,
          }}
        >
          {renderParticleSymbol()}
        </div>
      ))}
    </div>
  );
};
