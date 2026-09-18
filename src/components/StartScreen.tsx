import React from 'react';
import {
  Compass,
  Play,
  RotateCcw,
  BookMarked,
  Map,
  Volume2,
  VolumeX,
  HelpCircle,
  Sparkles,
  Edit3,
  Trophy,
  Key,
} from 'lucide-react';
import { Stage, UserProgress } from '../types';
import { HunterAvatar } from './HunterAvatar';
import { EQUIPPABLE_ITEMS } from '../data/itemsAndCommunity';
import { sounds } from '../utils/soundEffects';

interface Props {
  currentStage: Stage;
  progress: UserProgress;
  onStartGame: () => void;
  onOpenStageMap: () => void;
  onOpenMistakes: () => void;
  onOpenRecords: () => void;
  onOpenCharacter: () => void;
  onOpenCommunity: () => void;
  onOpenTutorial: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const StartScreen: React.FC<Props> = ({
  currentStage,
  progress,
  onStartGame,
  onOpenStageMap,
  onOpenMistakes,
  onOpenRecords,
  onOpenCharacter,
  onOpenCommunity,
  onOpenTutorial,
  isMuted,
  onToggleMute,
}) => {
  const unresolvedMistakesCount = progress.mistakes.filter(
    (m) => !m.resolved
  ).length;

  const completedStagesCount = Object.keys(progress.stageScores).length;

  const hatName = progress.equippedHatId
    ? EQUIPPABLE_ITEMS.find((i) => i.id === progress.equippedHatId)?.name
    : '기본 모자';
  const gearName = progress.equippedGearId
    ? EQUIPPABLE_ITEMS.find((i) => i.id === progress.equippedGearId)?.name
    : '기본 장비';

  return (
    <div
      id="start-screen-container"
      className="min-h-screen w-full bg-gradient-to-b from-amber-200 via-amber-100 to-orange-100 flex flex-col items-center justify-between p-3.5 sm:p-5 select-none"
    >
      {/* Top Header:
          스테이지 번호: STAGE 1 형식, 화면 상단
          보유 열쇠 / 진행률(0/10) 화면 상단 오른쪽 */}
      <header className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl border-2 border-amber-300 shadow-sm p-3 flex items-center justify-between">
        {/* 스테이지 번호: STAGE 1 형식 */}
        <div className="flex items-center space-x-2">
          <span
            id="start-stage-badge"
            className="px-2.5 py-1 bg-amber-600 text-white font-black text-xs rounded-lg shadow-sm tracking-wide"
          >
            STAGE {currentStage.id}
          </span>
          <span className="text-xs font-bold text-slate-700 truncate max-w-[110px] sm:max-w-[140px]">
            {currentStage.theme}
          </span>
        </div>

        {/* Top Right: Keys, Progress, Sound, Tutorial */}
        <div className="flex items-center space-x-1.5">
          {/* 보유 열쇠 배지 */}
          <div
            id="start-keys-badge"
            onClick={() => {
              sounds.playClick();
              onOpenCharacter();
            }}
            className="flex items-center space-x-1 bg-yellow-100 px-2.5 py-1 rounded-lg border border-yellow-300 text-xs font-black text-yellow-950 cursor-pointer hover:bg-yellow-200 transition-colors shadow-inner"
            title="보유 열쇠 (아이템 🔑2개 / 단계 🔑3개 해금)"
          >
            <span>🔑</span>
            <span>{progress.availableKeys}</span>
          </div>

          {/* 진행률: 0/10 형식 */}
          <div
            id="start-progress-display"
            className="flex items-center space-x-1 bg-amber-100 px-2 py-1 rounded-lg border border-amber-300 text-xs font-black text-amber-900"
            title="완료한 스테이지 진행률"
          >
            <span className="text-[10px] text-amber-700">진행률</span>
            <span>{completedStagesCount}/10</span>
          </div>

          <button
            id="start-tutorial-btn"
            onClick={() => {
              sounds.playClick();
              onOpenTutorial();
            }}
            className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
            title="신입 헌터 길라잡이"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            id="start-mute-toggle"
            onClick={onToggleMute}
            className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors"
            title={isMuted ? '소리 켜기' : '소리 끄기'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="w-full max-w-md flex-1 flex flex-col items-center justify-center space-y-3.5 my-1">
        {/* App Logo */}
        <div className="text-center space-y-0.5">
          <div className="inline-flex items-center space-x-2 px-3.5 py-0.5 bg-amber-700/90 text-yellow-300 rounded-full text-[11px] font-black shadow-sm mb-1">
            <Compass className="w-3.5 h-3.5 text-yellow-400 animate-spin-slow" />
            <span>초등 5학년 맞춤형 영문법 어드벤처</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm flex items-center justify-center gap-2">
            <span>Grammar Hunter</span>
            <span className="text-2xl">🧭</span>
          </h1>
          <p className="text-xs sm:text-sm font-bold text-amber-900 max-w-xs mx-auto">
            보물찾기 모험으로 정복하는 5학년 필수 영문법 게임!
          </p>
        </div>

        {/* Character Card with Equipped Items Visually Rendered */}
        <div
          id="start-character-card"
          onClick={() => {
            sounds.playClick();
            onOpenCharacter();
          }}
          className="w-full bg-gradient-to-b from-white to-amber-50 rounded-3xl border-3 border-amber-400 p-3.5 shadow-lg flex items-center space-x-4 cursor-pointer hover:border-amber-500 transition-transform active:scale-[0.98] group relative"
        >
          {/* Real visual avatar rendering wearing the equipped hat & handheld gear */}
          <div className="relative">
            <HunterAvatar
              avatarIcon={progress.character.avatarIcon}
              hatId={progress.equippedHatId}
              gearId={progress.equippedGearId}
              size="lg"
            />
            <div className="absolute -bottom-1 -right-1 bg-amber-600 text-white p-1 rounded-full shadow">
              <Edit3 className="w-3 h-3" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-black rounded-md">
                {progress.character.badge}
              </span>
              <span className="text-[10px] text-slate-500 font-extrabold truncate">
                ID: {progress.hunterId}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 truncate mt-0.5">
              {progress.character.name}
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-bold mt-0.5">
              <span>장착: {hatName}</span>
              <span>·</span>
              <span>{gearName}</span>
            </div>
            <span className="text-[11px] text-amber-700 font-bold underline mt-1 inline-block">
              장비 상점 & 캐릭터 꾸미기 (🔑{progress.availableKeys}개 보유)
            </span>
          </div>
        </div>

        {/* 오늘의 학습 문법 (STEP 기반 설명) */}
        <div
          id="today-grammar-card"
          className="w-full bg-white rounded-3xl border-2 border-amber-300 shadow-md p-4 space-y-2 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-black text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>오늘의 학습 문법</span>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              {currentStage.locationIcon} {currentStage.locationName}
            </span>
          </div>

          <h3 className="text-base font-black text-slate-900">
            {currentStage.targetGrammar}
          </h3>

          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
            {currentStage.grammarSummary}
          </p>

          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>총 5개 STEP 미션</span>
            <span className="text-amber-700 font-bold">
              보물: {currentStage.treasure.name} {currentStage.treasure.emoji}
            </span>
          </div>
        </div>
      </main>

      {/* Action Buttons:
          [게임 시작]
          [오답 복습]
          [보물 지도]
          [커뮤니티] (듀오링고식 등수 랭킹)
          [학습 기록] */}
      <footer className="w-full max-w-md space-y-2.5 pt-2">
        {/* Main [게임 시작] Button */}
        <button
          id="start-game-btn"
          type="button"
          onClick={() => {
            sounds.playClick();
            onStartGame();
          }}
          className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 active:from-amber-700 active:to-yellow-800 text-white font-black text-lg rounded-2xl shadow-xl shadow-amber-500/30 transition-transform active:scale-95 flex items-center justify-center space-x-2.5 border-2 border-amber-300"
        >
          <Play className="w-6 h-6 fill-current text-yellow-300" />
          <span>게임 시작</span>
        </button>

        {/* 4-Column Navigation Bar including [커뮤니티] */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {/* [오답 복습] */}
          <button
            id="start-review-btn"
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenMistakes();
            }}
            className="py-2.5 px-1 bg-white hover:bg-rose-50 border-2 border-rose-300 rounded-2xl shadow-sm text-slate-800 font-black text-[11px] flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 relative"
          >
            {unresolvedMistakesCount > 0 && (
              <span className="absolute -top-1.5 -right-1 bg-rose-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                {unresolvedMistakesCount}
              </span>
            )}
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>오답 복습</span>
          </button>

          {/* [보물 지도] */}
          <button
            id="start-map-btn"
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenStageMap();
            }}
            className="py-2.5 px-1 bg-white hover:bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-sm text-slate-800 font-black text-[11px] flex flex-col items-center justify-center space-y-1 transition-all active:scale-95"
          >
            <Map className="w-4 h-4 text-amber-600" />
            <span>보물 지도</span>
          </button>

          {/* [커뮤니티 (듀오링고식 랭킹 등수)] */}
          <button
            id="start-community-btn"
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenCommunity();
            }}
            className="py-2.5 px-1 bg-white hover:bg-yellow-50 border-2 border-yellow-400 rounded-2xl shadow-sm text-slate-800 font-black text-[11px] flex flex-col items-center justify-center space-y-1 transition-all active:scale-95 relative"
          >
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
            <Trophy className="w-4 h-4 text-yellow-600" />
            <span>커뮤니티</span>
          </button>

          {/* [학습 기록] */}
          <button
            id="start-records-btn"
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenRecords();
            }}
            className="py-2.5 px-1 bg-white hover:bg-blue-50 border-2 border-blue-300 rounded-2xl shadow-sm text-slate-800 font-black text-[11px] flex flex-col items-center justify-center space-y-1 transition-all active:scale-95"
          >
            <BookMarked className="w-4 h-4 text-blue-600" />
            <span>학습 기록</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
