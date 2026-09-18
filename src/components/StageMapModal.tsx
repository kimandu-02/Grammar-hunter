import React, { useState } from 'react';
import { X, Lock, Star, Key, Play, Unlock, Info } from 'lucide-react';
import { GRAMMAR_STAGES } from '../data/grammarCurriculum';
import { UserProgress } from '../types';
import { sounds } from '../utils/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onSelectStage: (stageId: number) => void;
  onUnlockStageWithKeys: (stageId: number) => boolean;
}

export const StageMapModal: React.FC<Props> = ({
  isOpen,
  onClose,
  progress,
  onSelectStage,
  onUnlockStageWithKeys,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // "아이템 혹은 스테이지 선택시 아이템과 스테이지 열리고 보유 열쇠 차감되도록"
  const handleStageCardClick = (stageId: number, isUnlocked: boolean) => {
    if (isUnlocked) {
      sounds.playClick();
      onSelectStage(stageId);
      onClose();
      return;
    }

    // Locked stage: check keys (🔑 3개로 즉시 오픈)
    if (progress.availableKeys < 3) {
      sounds.playWrong();
      showToast(`❌ 열쇠가 부족합니다! (필요: 🔑 3개, 보유: 🔑 ${progress.availableKeys}개)\n앞의 단계를 클리어하면 다음 단계가 자동으로 열립니다!`);
      return;
    }

    const success = onUnlockStageWithKeys(stageId);
    if (success) {
      sounds.playKey();
      showToast(`🎉 🔑 열쇠 3개 차감! STAGE ${stageId} 단계가 열렸습니다!`);
      // Start this stage immediately!
      setTimeout(() => {
        onSelectStage(stageId);
        onClose();
      }, 600);
    }
  };

  return (
    <div
      id="stage-map-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md"
    >
      <div
        id="stage-map-card"
        className="w-full max-w-lg bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 border-4 border-amber-600 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative"
      >
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-16 left-4 right-4 z-50 bg-amber-900 text-yellow-200 text-xs font-black px-4 py-2.5 rounded-xl shadow-xl border-2 border-yellow-400 text-center animate-bounce whitespace-pre-line">
            {toastMessage}
          </div>
        )}

        {/* Map Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 px-5 py-4 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🗺️</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-wide">보물섬 탐험 지도</h2>
              <p className="text-xs text-amber-200">
                앞 단계를 클리어하면 다음 단계가 <b>자동 해금</b>되며, 열쇠 🔑 3개로도 즉시 열 수 있습니다!
              </p>
            </div>
          </div>
          <button
            id="stage-map-close-btn"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-black/20"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Keys status strip */}
        <div className="bg-amber-100/95 px-4 py-2.5 border-b border-amber-300 flex items-center justify-between text-xs font-black text-amber-900">
          <span className="flex items-center gap-1.5">
            <span>내 보유 열쇠:</span>
            <span className="bg-yellow-200 border border-amber-400 px-2 py-0.5 rounded-full text-amber-950 shadow-xs">
              🔑 {progress.availableKeys}개
            </span>
          </span>
          <span className="text-[11px] text-amber-800">
            단계 선택 시 <b>🔑 3개</b> 차감 후 즉시 오픈!
          </span>
        </div>

        {/* Stages Trail List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {GRAMMAR_STAGES.map((stage) => {
            const isUnlocked = progress.unlockedStageIds.includes(stage.id);
            const isCurrent = progress.currentStageId === stage.id;
            const stars = progress.stageStars[stage.id] || 0;
            const bestScore = progress.stageScores[stage.id] || 0;
            const hasTreasure = progress.collectedTreasures.includes(stage.treasure.id);

            return (
              <div
                key={stage.id}
                id={`stage-card-${stage.id}`}
                onClick={() => handleStageCardClick(stage.id, isUnlocked)}
                className={`relative rounded-2xl border-2 p-3.5 sm:p-4 transition-all cursor-pointer select-none ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-100/90 shadow-lg ring-4 ring-amber-400/40'
                    : isUnlocked
                    ? 'border-amber-300 bg-white shadow-sm hover:border-amber-500 hover:shadow-md'
                    : progress.availableKeys >= 3
                    ? 'border-yellow-400 bg-yellow-50/70 hover:bg-yellow-100/90 shadow-sm'
                    : 'border-slate-300 bg-slate-100/80 hover:bg-slate-200/60 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Icon & Badge */}
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0 ${
                        isUnlocked
                          ? 'bg-amber-100 border border-amber-300'
                          : 'bg-slate-200 border border-slate-300'
                      }`}
                    >
                      {isUnlocked ? stage.locationIcon : <Lock className="w-5 h-5 text-slate-500" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-500 text-white">
                          {stage.title}
                        </span>
                        {isCurrent && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-500 text-white animate-pulse">
                            진행중
                          </span>
                        )}
                        {hasTreasure && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white flex items-center gap-0.5">
                            <span>{stage.treasure.emoji}</span>
                            <span>보물 획득!</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-slate-800 text-base mt-1">
                        {stage.theme}
                      </h3>
                      <p className="text-xs text-amber-900/80 font-medium">
                        {stage.targetGrammar}
                      </p>
                    </div>
                  </div>

                  {/* Right: Stars & Action */}
                  <div className="flex flex-col items-end shrink-0">
                    {/* Stars */}
                    {isUnlocked ? (
                      <div className="flex space-x-0.5 mb-1.5">
                        {[1, 2, 3].map((starIdx) => (
                          <Star
                            key={starIdx}
                            className={`w-4 h-4 ${
                              starIdx <= stars
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-slate-500 flex items-center gap-1 mb-1.5">
                        <Lock className="w-3.5 h-3.5" /> 잠긴 단계
                      </div>
                    )}

                    {/* Action: Play or Unlock with 3 Keys */}
                    {isUnlocked ? (
                      <div
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 shadow-sm ${
                          isCurrent
                            ? 'bg-amber-600 text-white font-black'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{bestScore > 0 ? '다시 풀기' : '도전하기'}</span>
                      </div>
                    ) : (
                      <div
                        className={`px-2.5 py-1.5 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-1 ${
                          progress.availableKeys >= 3
                            ? 'bg-yellow-500 hover:bg-yellow-600'
                            : 'bg-slate-400'
                        }`}
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        <span>🔑 3개로 열기</span>
                      </div>
                    )}
                  </div>
                </div>

                {isUnlocked && bestScore > 0 ? (
                  <div className="mt-2.5 pt-2 border-t border-amber-200/70 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      최고 점수: <b className="text-slate-700">{bestScore}점</b>
                    </span>
                    <span className="text-amber-700 text-[11px] truncate max-w-[200px]">
                      보물: {stage.treasure.name}
                    </span>
                  </div>
                ) : !isUnlocked ? (
                  <div className="mt-2 pt-1.5 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>앞의 STAGE {stage.id - 1} 클리어 시 자동 해금</span>
                    <span className="font-bold text-amber-700">또는 탭하여 🔑 3개로 열기</span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-amber-100/90 border-t border-amber-300 flex items-center justify-between text-xs font-bold text-amber-900">
          <div>해금된 단계: {progress.unlockedStageIds.length} / 10</div>
          <div>수집한 보물: {progress.collectedTreasures.length}개</div>
        </div>
      </div>
    </div>
  );
};
