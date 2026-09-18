import React, { useState } from 'react';
import { X, Check, Key, Sparkles, Shield, User, Info } from 'lucide-react';
import { CharacterProfile } from '../types';
import { EQUIPPABLE_ITEMS } from '../data/itemsAndCommunity';
import { HunterAvatar } from './HunterAvatar';
import { sounds } from '../utils/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentCharacter: CharacterProfile;
  availableKeys: number;
  unlockedItemIds: string[];
  equippedHatId?: string;
  equippedGearId?: string;
  onSaveCharacter: (char: CharacterProfile) => void;
  onEquipItem: (category: 'hat' | 'gear', itemId: string) => void;
  onUnlockItem: (itemId: string, cost: number) => boolean;
  onUnlockAndEquipItem: (itemId: string, cost: number, category: 'hat' | 'gear') => boolean;
}

const AVATAR_OPTIONS = [
  { icon: '🤠', name: '꼬마 탐험가', role: '초보 보물 사냥꾼', badge: '신입 헌터' },
  { icon: '🧭', name: '영문법 항해사', role: '어순 탐색 전문가', badge: '베테랑 헌터' },
  { icon: '🦁', name: '용감한 사자', role: '정글 보물 수색대', badge: '용기의 헌터' },
  { icon: '🦊', name: '지혜로운 여우', role: '고대 비문 번역가', badge: '지혜의 헌터' },
  { icon: '👩‍🚀', name: '우주 탐사대원', role: '차원 문법 마스터', badge: '마스터 헌터' },
  { icon: '🧙‍♂️', name: '문법 대마법사', role: '마법 주문 영작사', badge: '전설의 헌터' },
];

export const CharacterModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentCharacter,
  availableKeys,
  unlockedItemIds,
  equippedHatId,
  equippedGearId,
  onSaveCharacter,
  onEquipItem,
  onUnlockItem,
  onUnlockAndEquipItem,
}) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'avatar'>('shop');
  const [itemCategory, setItemCategory] = useState<'hat' | 'gear'>('hat');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const hats = EQUIPPABLE_ITEMS.filter((i) => i.category === 'hat');
  const gears = EQUIPPABLE_ITEMS.filter((i) => i.category === 'gear');
  const currentItemList = itemCategory === 'hat' ? hats : gears;

  // Handle clicking on an item:
  // "어 아이템 선택시 열쇠가 차감이 안되는데 이거 수정해줘"
  // "아이템을 선택시 아이템을 장착한 캐릭터로 사진 바뀌도록"
  const handleItemClick = (itemId: string, category: 'hat' | 'gear') => {
    const isUnlocked = unlockedItemIds.includes(itemId);
    const item = EQUIPPABLE_ITEMS.find((i) => i.id === itemId);
    if (!item) return;

    if (!isUnlocked) {
      // Must unlock with keys (costKeys: 2)
      if (availableKeys < item.costKeys) {
        sounds.playWrong();
        showToast(`❌ 열쇠가 부족합니다! (필요: 🔑 ${item.costKeys}개, 보유: 🔑 ${availableKeys}개)`);
        return;
      }

      // Unlock and deduct keys immediately & equip atomically!
      const success = onUnlockAndEquipItem(itemId, item.costKeys, category);
      if (success) {
        sounds.playKey();
        showToast(`🎉 🔑 열쇠 ${item.costKeys}개 차감! [${item.name}] 해금 및 장착 완료!`);
      }
    } else {
      // Already unlocked: toggle or equip
      sounds.playClick();
      const currentEquipped = category === 'hat' ? equippedHatId : equippedGearId;
      const targetId = currentEquipped === itemId ? '' : itemId;
      onEquipItem(category, targetId);
      if (targetId) {
        showToast(`✨ [${item.name}]을(를) 장착했습니다!`);
      } else {
        showToast(`장착을 해제했습니다.`);
      }
    }
  };

  const handleSelectAvatar = (opt: typeof AVATAR_OPTIONS[0]) => {
    sounds.playClick();
    const updated = {
      ...currentCharacter,
      avatarIcon: opt.icon,
      name: opt.name,
      role: opt.role,
      badge: opt.badge,
    };
    onSaveCharacter(updated);
    showToast(`캐릭터가 [${opt.name}] (으)로 변경되었습니다!`);
  };

  const equippedHatItem = EQUIPPABLE_ITEMS.find((i) => i.id === equippedHatId);
  const equippedGearItem = EQUIPPABLE_ITEMS.find((i) => i.id === equippedGearId);

  return (
    <div
      id="character-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md"
    >
      <div
        id="character-modal-card"
        className="w-full max-w-md bg-white border-4 border-amber-500 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative"
      >
        {/* Toast Alert Banner */}
        {toastMessage && (
          <div className="absolute top-16 left-4 right-4 z-50 bg-amber-900 text-yellow-200 text-xs font-black px-4 py-2.5 rounded-xl shadow-xl border-2 border-yellow-400 text-center animate-bounce">
            {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 px-5 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎒</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black">헌터 장비 상점 & 캐릭터</h2>
              <p className="text-[11px] text-yellow-100 font-medium">
                아이템을 선택하면 열쇠(🔑 2개)가 차감되고 캐릭터 사진이 바로 바뀝니다!
              </p>
            </div>
          </div>
          <button
            id="character-modal-close-btn"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-black/20 text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Keys and Current Character Visual Card */}
        <div className="bg-gradient-to-b from-amber-100/90 to-yellow-50 p-4 border-b-2 border-amber-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-1.5 bg-yellow-200 border-2 border-amber-400 px-3 py-1 rounded-full text-xs font-black text-amber-950 shadow-sm">
              <Key className="w-4 h-4 text-amber-700" />
              <span>내 보유 열쇠: <b>{availableKeys}개</b></span>
            </div>
            <span className="text-[11px] font-bold text-amber-800">
              아이템 하나당 🔑 2개 차감
            </span>
          </div>

          {/* Real Avatar Visual with High Detail Portrait */}
          <div className="bg-white rounded-2xl border-2 border-amber-300 p-3 shadow-inner flex items-center space-x-4">
            <div className="relative shrink-0">
              <HunterAvatar
                avatarIcon={currentCharacter.avatarIcon}
                hatId={equippedHatId}
                gearId={equippedGearId}
                size="lg"
                showLabels={true}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-black rounded-md">
                  {currentCharacter.badge}
                </span>
                <span className="text-[10px] text-slate-500 font-bold truncate">
                  {currentCharacter.role}
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 truncate mt-0.5">
                {currentCharacter.name}
              </h3>

              {/* Equipped Gear Labels */}
              <div className="mt-1 space-y-0.5 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-amber-800">모자:</span>
                  <span className="font-extrabold text-slate-800 truncate">
                    {equippedHatItem ? `${equippedHatItem.emoji} ${equippedHatItem.name}` : '장착 안 함'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-amber-800">도구:</span>
                  <span className="font-extrabold text-slate-800 truncate">
                    {equippedGearItem ? `${equippedGearItem.emoji} ${equippedGearItem.name}` : '장착 안 함'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation: [장비 상점 (모자/도구)], [캐릭터 아바타] */}
        <div className="flex border-b border-amber-200 bg-amber-50">
          <button
            id="character-tab-shop"
            onClick={() => {
              sounds.playClick();
              setActiveTab('shop');
            }}
            className={`flex-1 py-2.5 text-xs font-black flex items-center justify-center space-x-1.5 transition-colors border-b-2 ${
              activeTab === 'shop'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>장비 상점 & 장착</span>
          </button>
          <button
            id="character-tab-avatar"
            onClick={() => {
              sounds.playClick();
              setActiveTab('avatar');
            }}
            className={`flex-1 py-2.5 text-xs font-black flex items-center justify-center space-x-1.5 transition-colors border-b-2 ${
              activeTab === 'avatar'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>기본 캐릭터 변경</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'shop' ? (
            <>
              {/* Category sub-switch: 모자 vs 도구 */}
              <div className="flex space-x-2">
                <button
                  id="character-category-hat"
                  onClick={() => {
                    sounds.playClick();
                    setItemCategory('hat');
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-black border-2 transition-all ${
                    itemCategory === 'hat'
                      ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                      : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-50'
                  }`}
                >
                  🎩 모자 컬렉션 ({hats.length}개)
                </button>
                <button
                  id="character-category-gear"
                  onClick={() => {
                    sounds.playClick();
                    setItemCategory('gear');
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-black border-2 transition-all ${
                    itemCategory === 'gear'
                      ? 'bg-amber-500 border-amber-600 text-white shadow-sm'
                      : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-50'
                  }`}
                >
                  🛡️ 모험 도구 ({gears.length}개)
                </button>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {currentItemList.map((item) => {
                  const isUnlocked = unlockedItemIds.includes(item.id);
                  const isEquipped =
                    item.category === 'hat'
                      ? equippedHatId === item.id
                      : equippedGearId === item.id;
                  const canAfford = availableKeys >= item.costKeys;

                  return (
                    <div
                      key={item.id}
                      id={`shop-item-${item.id}`}
                      onClick={() => handleItemClick(item.id, item.category)}
                      className={`p-3 rounded-2xl border-2 flex flex-col justify-between transition-all cursor-pointer relative select-none ${
                        isEquipped
                          ? 'bg-amber-100 border-amber-600 shadow-md ring-2 ring-amber-400 scale-[1.02]'
                          : isUnlocked
                          ? 'bg-white border-amber-200 hover:border-amber-400 shadow-xs'
                          : canAfford
                          ? 'bg-yellow-50/80 border-dashed border-amber-400 hover:bg-yellow-100'
                          : 'bg-slate-100 border-slate-300 opacity-75'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-1">
                        {isEquipped ? (
                          <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> 장착중
                          </span>
                        ) : isUnlocked ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                            보유중
                          </span>
                        ) : (
                          <span className="bg-yellow-200 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Key className="w-2.5 h-2.5 text-amber-700" /> 🔑 {item.costKeys}개
                          </span>
                        )}
                      </div>

                      {/* Emoji Display */}
                      <div className="text-4xl sm:text-5xl text-center py-2 filter drop-shadow-sm">
                        {item.emoji}
                      </div>

                      {/* Info */}
                      <div className="space-y-0.5 text-center">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {item.name}
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                          {item.description}
                        </p>
                      </div>

                      {/* Action Hint */}
                      <div className="mt-2 text-center">
                        {isEquipped ? (
                          <span className="text-[10px] text-amber-800 font-extrabold underline">
                            탭하여 해제
                          </span>
                        ) : isUnlocked ? (
                          <span className="text-[10px] text-emerald-700 font-extrabold underline">
                            탭하여 장착
                          </span>
                        ) : canAfford ? (
                          <span className="text-[10px] text-amber-900 font-black bg-yellow-300/80 px-2 py-0.5 rounded-md inline-block">
                            🔑 2개로 즉시 해금!
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold">
                            열쇠 부족 (🔑 {item.costKeys}개 필요)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Avatar Selection Tab */
            <div className="grid grid-cols-2 gap-3">
              {AVATAR_OPTIONS.map((opt) => {
                const isSelected = currentCharacter.avatarIcon === opt.icon;
                return (
                  <div
                    key={opt.icon}
                    id={`avatar-option-${opt.name}`}
                    onClick={() => handleSelectAvatar(opt)}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-100 border-amber-600 shadow-md ring-2 ring-amber-400 scale-[1.02]'
                        : 'bg-white border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="text-4xl py-1">{opt.icon}</div>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full mt-1">
                      {opt.badge}
                    </span>
                    <h4 className="text-xs font-black text-slate-900 mt-1">
                      {opt.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {opt.role}
                    </p>
                    {isSelected && (
                      <span className="text-[10px] font-black text-emerald-600 flex items-center gap-0.5 mt-1">
                        <Check className="w-3 h-3" /> 선택됨
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-amber-50 px-5 py-3 border-t border-amber-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-600 flex items-center gap-1 font-bold">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            <span>선택한 아이템은 모든 화면에 즉시 적용됩니다.</span>
          </div>
          <button
            id="character-modal-done-btn"
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs rounded-xl shadow-md transition-transform active:scale-95"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
};
