import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Sparkles,
  ArrowRight,
  Home,
  BookOpen,
  Award,
  Key,
  Unlock,
} from 'lucide-react';
import { Stage, CharacterProfile } from '../types';
import { HunterAvatar } from './HunterAvatar';
import { sounds } from '../utils/soundEffects';

interface ResultData {
  stageId: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  keysEarned: number;
  wrongCount: number;
}

interface Props {
  stage: Stage;
  result: ResultData;
  character: CharacterProfile;
  equippedHatId: string;
  equippedGearId: string;
  availableKeys: number;
  onNextStage: () => void;
  onRetryMistakes: () => void;
  onGoHome: () => void;
  hasNextStage: boolean;
}

export const ResultScreen: React.FC<Props> = ({
  stage,
  result,
  character,
  equippedHatId,
  equippedGearId,
  availableKeys,
  onNextStage,
  onRetryMistakes,
  onGoHome,
  hasNextStage,
}) => {
  const [chestOpened, setChestOpened] = useState<boolean>(false);

  useEffect(() => {
    sounds.playChestFanfare();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
  }, []);

  const handleOpenChest = () => {
    if (chestOpened) return;
    setChestOpened(true);
    sounds.playChestFanfare();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#FFD700', '#FFA500', '#FF4500', '#00FA9A', '#00BFFF'],
    });
  };

  const isPerfect = result.correctCount === result.totalQuestions;
  const nextStageNum = stage.id + 1;

  return (
    <div
      id="result-screen-container"
      className="min-h-screen w-full bg-gradient-to-b from-amber-200 via-amber-100 to-orange-100 flex flex-col items-center justify-between p-4 sm:p-6 select-none"
    >
      <div className="w-full max-w-md flex-1 flex flex-col items-center space-y-3 pt-2">
        {/* Stage Completion Banner */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-600 text-white rounded-full text-xs font-black shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>{stage.title} 탐험 성공!</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            보물찾기 스테이지 완료!
          </h1>
          <p className="text-xs sm:text-sm font-bold text-amber-900">
            {stage.theme} · {stage.locationName}
          </p>
        </div>

        {/* Character with Equipped Gear celebration badge */}
        <div className="flex items-center justify-center">
          <HunterAvatar
            avatarIcon={character.avatarIcon}
            hatId={equippedHatId}
            gearId={equippedGearId}
            size="lg"
            showLabels={true}
          />
        </div>

        {/* Automatic Stage Unlock Notice:
            "앞의 단계를 깼으면 다음 단계는 자동적으로 열리도록" */}
        {hasNextStage && (
          <div
            id="next-stage-unlocked-banner"
            className="w-full bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-3 text-emerald-950 flex items-center space-x-3 shadow-md animate-pulse"
          >
            <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-xs shrink-0">
              <Unlock className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-emerald-800 flex items-center gap-1">
                <span>자동 잠금 해제 완료!</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">열쇠 소모 없음</span>
              </div>
              <p className="text-xs font-bold text-emerald-900 truncate mt-0.5">
                다음 단계인 <b>STAGE {nextStageNum}</b>가 즉시 열렸습니다! 🔓
              </p>
            </div>
          </div>
        )}

        {/* Treasure Chest Animation Area */}
        <div
          id="treasure-chest-card"
          onClick={handleOpenChest}
          className="w-full bg-gradient-to-b from-amber-50 to-orange-100 border-4 border-amber-500 rounded-3xl p-4 text-center shadow-xl relative cursor-pointer group transition-transform active:scale-95"
        >
          <div className="relative inline-block my-1">
            <div
              className={`text-6xl sm:text-7xl transition-transform duration-500 ${
                chestOpened ? 'scale-110 -translate-y-2' : 'animate-bounce'
              }`}
            >
              {chestOpened ? '🎁' : '🧰'}
            </div>
            {!chestOpened && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow whitespace-nowrap animate-pulse">
                탭하여 열기!
              </div>
            )}
          </div>

          <div className="mt-1 space-y-0.5">
            <div className="text-xs font-extrabold text-amber-800 flex items-center justify-center gap-1">
              <Award className="w-4 h-4 text-amber-600" />
              <span>획득 보상</span>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 flex items-center justify-center gap-1.5">
              <span className="text-2xl">{stage.treasure.emoji}</span>
              <span>{stage.treasure.name}</span>
            </div>
            <p className="text-[11px] text-slate-600 max-w-xs mx-auto leading-relaxed">
              {stage.treasure.description}
            </p>
          </div>
        </div>

        {/* Score & Keys Statistics */}
        <div
          id="result-stats-card"
          className="w-full bg-white rounded-2xl border-2 border-amber-300 shadow-md p-3.5 text-center space-y-2.5"
        >
          <div>
            <span className="text-xs font-bold text-slate-400">최종 점수</span>
            <div
              id="result-final-score"
              className="text-3xl sm:text-4xl font-black text-amber-600 tracking-tight"
            >
              {result.score} / {result.totalQuestions * 100}점
            </div>
            {isPerfect && (
              <span className="inline-block mt-1 text-xs font-black text-emerald-600 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                ⭐ 완벽한 헌터 만점! ⭐
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-100">
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <span className="text-xs text-slate-500 font-bold block">맞힌 STEP 수</span>
              <span
                id="result-correct-count"
                className="text-base sm:text-lg font-black text-slate-800"
              >
                {result.correctCount} / {result.totalQuestions}
              </span>
            </div>

            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <span className="text-xs text-slate-500 font-bold block">획득 열쇠 수</span>
              <span
                id="result-keys-count"
                className="text-base sm:text-lg font-black text-amber-700 flex items-center justify-center gap-1"
              >
                <span>🔑</span>
                <span>{result.keysEarned} / 3</span>
              </span>
            </div>
          </div>

          {/* Key usage hint */}
          <div className="text-[11px] text-amber-800 font-bold bg-amber-50/80 p-2 rounded-xl border border-amber-200 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-amber-600" />
              현재 보유 열쇠: <b>{availableKeys}개</b>
            </span>
            <span className="text-slate-500">
              (아이템 해금: 🔑 2개 / 단계 해금: 🔑 3개)
            </span>
          </div>
        </div>

        {/* 오늘 배운 문법 요약 카드 */}
        <div
          id="result-grammar-summary-card"
          className="w-full bg-white rounded-2xl border-2 border-amber-200 shadow-sm p-3 space-y-1.5 text-left"
        >
          <div className="flex items-center space-x-2 text-amber-900 font-black text-sm">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>오늘 배운 문법 요약</span>
          </div>
          <p className="text-xs font-bold text-slate-700">
            {stage.targetGrammar}
          </p>
          <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200 text-xs text-slate-700 leading-relaxed space-y-1">
            <p className="font-semibold text-amber-950">{stage.grammarSummary}</p>
          </div>
        </div>

        {/* 오답 STEP 개수 */}
        <div
          id="result-wrong-count-display"
          className="w-full bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-center text-xs font-bold text-rose-800 flex items-center justify-center space-x-1.5"
        >
          <span>오답 STEP 개수:</span>
          <span className="font-black text-rose-600 text-sm">
            {result.wrongCount}개
          </span>
          {result.wrongCount > 0 && (
            <span className="text-slate-500 text-[11px]">
              (오답 복습 노트에 자동 저장되었습니다)
            </span>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <footer className="w-full max-w-md space-y-2 pt-3">
        {result.wrongCount > 0 && (
          <button
            id="result-retry-mistakes-btn"
            type="button"
            onClick={() => {
              sounds.playClick();
              onRetryMistakes();
            }}
            className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>오답 STEP 다시 풀기</span>
          </button>
        )}

        <div className="flex space-x-2">
          <button
            id="result-go-home-btn"
            type="button"
            onClick={() => {
              sounds.playClick();
              onGoHome();
            }}
            className="w-1/3 py-3 bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-700 font-extrabold text-sm rounded-xl shadow-sm transition-transform active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <Home className="w-4 h-4" />
            <span>처음으로</span>
          </button>

          <button
            id="result-next-stage-btn"
            type="button"
            onClick={() => {
              sounds.playClick();
              onNextStage();
            }}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-black text-sm rounded-xl shadow-md shadow-amber-400/30 transition-transform active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <span>{hasNextStage ? `다음 STAGE ${nextStageNum} 도전!` : '모든 스테이지 완료!'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
