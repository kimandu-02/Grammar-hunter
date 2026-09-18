import React from 'react';
import { EQUIPPABLE_ITEMS } from '../data/itemsAndCommunity';

interface Props {
  avatarIcon: string;
  hatId?: string;
  gearId?: string;
  hatEmoji?: string;
  gearEmoji?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabels?: boolean;
  className?: string;
}

export const HunterAvatar: React.FC<Props> = ({
  avatarIcon,
  hatId,
  gearId,
  hatEmoji,
  gearEmoji,
  size = 'md',
  showLabels = false,
  className = '',
}) => {
  // Resolve item models
  const hatItem = EQUIPPABLE_ITEMS.find((i) => i.id === hatId);
  const gearItem = EQUIPPABLE_ITEMS.find((i) => i.id === gearId);

  const equippedHat = hatEmoji || hatItem?.emoji;
  const equippedGear = gearEmoji || gearItem?.emoji;

  const sizeConfigs = {
    sm: {
      container: 'w-11 h-11',
      avatarText: 'text-2xl',
      hatText: 'text-base -top-2.5 left-1',
      gearText: 'text-sm -bottom-1 -right-1',
      borderWidth: 'border-2',
    },
    md: {
      container: 'w-16 h-16',
      avatarText: 'text-3.5xl',
      hatText: 'text-xl -top-3 left-2.5',
      gearText: 'text-base -bottom-1.5 -right-1.5',
      borderWidth: 'border-3',
    },
    lg: {
      container: 'w-24 h-24',
      avatarText: 'text-5xl',
      hatText: 'text-3xl -top-4 left-4',
      gearText: 'text-2xl -bottom-2 -right-2',
      borderWidth: 'border-4',
    },
    xl: {
      container: 'w-32 h-32',
      avatarText: 'text-7xl',
      hatText: 'text-4xl -top-5 left-5',
      gearText: 'text-3xl -bottom-2.5 -right-2.5',
      borderWidth: 'border-4',
    },
  };

  const cfg = sizeConfigs[size];

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      {/* Portrait Card Frame */}
      <div
        className={`relative inline-flex items-center justify-center bg-gradient-to-b from-amber-100 via-orange-50 to-amber-200 rounded-3xl ${cfg.borderWidth} border-amber-500 shadow-lg select-none shrink-0 ${cfg.container} transition-all duration-300 transform`}
        title={`헌터 프로필 (모자: ${hatItem?.name || '기본'}, 장비: ${gearItem?.name || '기본'})`}
      >
        {/* Decorative background aura */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-yellow-300/30 to-amber-500/20 pointer-events-none" />

        {/* Equipped Hat Overlay - positioned directly on the character's head */}
        {equippedHat && (
          <span
            key={`hat-${equippedHat}`}
            className={`absolute ${cfg.hatText} z-20 filter drop-shadow-lg transform transition-transform duration-300 hover:scale-125 animate-bounce`}
            style={{ animationDuration: '2.5s' }}
            title={`장착된 모자: ${hatItem?.name || ''}`}
          >
            {equippedHat}
          </span>
        )}

        {/* Base Character Avatar Face */}
        <span className={`${cfg.avatarText} leading-none z-10 filter drop-shadow-sm select-none`}>
          {avatarIcon}
        </span>

        {/* Equipped Handheld Tool / Gear - positioned at the bottom right */}
        {equippedGear && (
          <span
            key={`gear-${equippedGear}`}
            className={`absolute ${cfg.gearText} z-20 filter drop-shadow-md bg-white/95 rounded-2xl p-1 border-2 border-amber-400 shadow-md transform transition-transform duration-300 hover:scale-125`}
            title={`장착된 장비: ${gearItem?.name || ''}`}
          >
            {equippedGear}
          </span>
        )}
      </div>

      {/* Optional descriptive tags below portrait */}
      {showLabels && (
        <div className="mt-2 flex flex-wrap gap-1 justify-center max-w-[160px]">
          {equippedHat && (
            <span className="px-1.5 py-0.5 bg-amber-200/90 text-amber-900 font-extrabold text-[10px] rounded-md shadow-xs">
              {equippedHat} {hatItem?.name || '모자'}
            </span>
          )}
          {equippedGear && (
            <span className="px-1.5 py-0.5 bg-yellow-200/90 text-yellow-950 font-extrabold text-[10px] rounded-md shadow-xs">
              {equippedGear} {gearItem?.name || '장비'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
