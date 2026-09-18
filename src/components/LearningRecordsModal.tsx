import React, { useState } from 'react';
import { X, Award, Key, Star, BookOpen, CheckCircle, Trophy } from 'lucide-react';
import { GRAMMAR_STAGES } from '../data/grammarCurriculum';
import { UserProgress } from '../types';
import { HunterAvatar } from './HunterAvatar';
import { sounds } from '../utils/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
}

export const LearningRecordsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  progress,
}) => {
  const [tab, setTab] = useState<'stats' | 'grammar' | 'vault'>('stats');

  if (!isOpen) return null;

  const totalClearedStages = Object.keys(progress.stageScores).length;
  const totalStarsCount = Object.values(progress.stageStars).reduce(
    (acc, cur) => acc + cur,
    0
  );
  const accuracy =
    progress.totalQuestionsAnswered > 0
      ? Math.round(
          (progress.totalCorrect / progress.totalQuestionsAnswered) * 100
        )
      : 0;

  return (
    <div
      id="learning-records-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md"
    >
      <div
        id="learning-records-card"
        className="w-full max-w-lg bg-white border-4 border-amber-500 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 px-5 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-300" />
            <h2 className="text-lg sm:text-xl font-black">학습 기록 & 보물 보관소</h2>
          </div>
          <button
            id="learning-records-close-btn"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-black/20"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-amber-200 bg-amber-50 text-xs sm:text-sm font-extrabold text-slate-600">
          <button
            onClick={() => {
              sounds.playClick();
              setTab('stats');
            }}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'stats'
                ? 'bg-white text-amber-700 border-b-2 border-amber-600 font-black'
                : 'hover:bg-amber-100/60'
            }`}
          >
            <Award className="w-4 h-4" /> 나의 통계
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setTab('grammar');
            }}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'grammar'
                ? 'bg-white text-amber-700 border-b-2 border-amber-600 font-black'
                : 'hover:bg-amber-100/60'
            }`}
          >
            <BookOpen className="w-4 h-4" /> 배운 문법 (10)
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setTab('vault');
            }}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'vault'
                ? 'bg-white text-amber-700 border-b-2 border-amber-600 font-black'
                : 'hover:bg-amber-100/60'
            }`}
          >
            <span>🏺</span> 보물 도감
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {tab === 'stats' && (
            <div className="space-y-4">
              {/* Top summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-200 text-center">
                  <span className="text-xs font-bold text-amber-800">탐험 완료</span>
                  <div className="text-2xl font-black text-amber-900 mt-1">
                    {totalClearedStages} / 10
                  </div>
                  <span className="text-[11px] text-slate-500">스테이지 정복</span>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl border-2 border-blue-200 text-center">
                  <span className="text-xs font-bold text-blue-800">STEP 정답률</span>
                  <div className="text-2xl font-black text-blue-900 mt-1">
                    {accuracy}%
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {progress.totalCorrect} / {progress.totalQuestionsAnswered} STEP
                  </span>
                </div>

                <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-200 text-center">
                  <span className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                    <Key className="w-3.5 h-3.5 text-amber-600" /> 보유 열쇠
                  </span>
                  <div className="text-2xl font-black text-emerald-900 mt-1">
                    {progress.availableKeys}개
                  </div>
                  <span className="text-[11px] text-slate-500">
                    (누적 획득: {progress.totalKeys}개)
                  </span>
                </div>

                <div className="bg-purple-50 p-4 rounded-2xl border-2 border-purple-200 text-center">
                  <span className="text-xs font-bold text-purple-800 flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 모은 별
                  </span>
                  <div className="text-2xl font-black text-purple-900 mt-1">
                    {totalStarsCount} / 30
                  </div>
                  <span className="text-[11px] text-slate-500">마스터 별빛</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                  <span>전체 보물섬 탐험 진행률</span>
                  <span className="text-amber-600 font-extrabold">
                    {Math.round((totalClearedStages / 10) * 100)}%
                  </span>
                </div>
                <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${(totalClearedStages / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Character Summary with Equipped Gear */}
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 rounded-2xl border-2 border-amber-300 flex items-center space-x-3.5">
                <HunterAvatar
                  avatarIcon={progress.character.avatarIcon}
                  hatId={progress.equippedHatId}
                  gearId={progress.equippedGearId}
                  size="md"
                />
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">
                    {progress.character.name} ({progress.hunterId})
                  </h4>
                  <p className="text-xs text-amber-900 font-medium">
                    {progress.character.role}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-black rounded-md">
                    {progress.character.badge}
                  </span>
                </div>
              </div>
            </div>
          )}

          {tab === 'grammar' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                초등 5학년 필수 핵심 영문법 10가지를 한눈에 복습할 수 있어요!
              </p>
              {GRAMMAR_STAGES.map((stage) => {
                const isCleared = progress.stageScores[stage.id] !== undefined;
                return (
                  <div
                    key={stage.id}
                    className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-600 text-white">
                          {stage.title}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-sm">
                          {stage.targetGrammar}
                        </h4>
                      </div>
                      {isCleared && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-700 font-medium mb-2">
                      {stage.grammarSummary}
                    </p>
                    <div className="space-y-1 bg-white p-2.5 rounded-lg border border-amber-200/80 text-[11px]">
                      {stage.grammarRules.map((rule, rIdx) => (
                        <div key={rIdx} className="text-slate-600">
                          <span className="font-bold text-amber-800">• {rule.rule}</span>
                          <span className="text-slate-500 ml-1.5 italic">ex) {rule.example}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'vault' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                스테이지를 클리어하고 획득한 고대 보물들을 감상하세요!
              </p>
              <div className="grid grid-cols-2 gap-3">
                {GRAMMAR_STAGES.map((stage) => {
                  const isCollected = progress.collectedTreasures.includes(
                    stage.treasure.id
                  );
                  return (
                    <div
                      key={stage.treasure.id}
                      className={`p-3.5 rounded-2xl border-2 text-center transition-all ${
                        isCollected
                          ? 'border-amber-400 bg-amber-50/80 shadow-sm'
                          : 'border-slate-200 bg-slate-50 opacity-60'
                      }`}
                    >
                      <div className="text-3xl mb-1">
                        {isCollected ? stage.treasure.emoji : '❓'}
                      </div>
                      <h5 className="font-extrabold text-xs text-slate-800 truncate">
                        {isCollected ? stage.treasure.name : `미지의 보물 (${stage.title})`}
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {isCollected
                          ? stage.treasure.description
                          : '스테이지를 완료하면 획득할 수 있습니다.'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
