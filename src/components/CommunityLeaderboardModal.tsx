import React, { useState } from 'react';
import {
  X,
  Trophy,
  Flame,
  Award,
  Sparkles,
  Edit2,
  Check,
  TrendingUp,
} from 'lucide-react';
import { LeaderboardPlayer } from '../types';
import { HunterAvatar } from './HunterAvatar';
import { BASE_LEADERBOARD_PLAYERS, EQUIPPABLE_ITEMS } from '../data/itemsAndCommunity';
import { sounds } from '../utils/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userScore: number;
  userHunterId: string;
  userAvatarIcon: string;
  equippedHatId: string;
  equippedGearId: string;
  userStreak?: number;
  onUpdateHunterId: (newId: string) => void;
}

export const CommunityLeaderboardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userScore,
  userHunterId,
  userAvatarIcon,
  equippedHatId,
  equippedGearId,
  userStreak = 3,
  onUpdateHunterId,
}) => {
  const [isEditingId, setIsEditingId] = useState(false);
  const [tempId, setTempId] = useState(userHunterId);

  if (!isOpen) return null;

  // Resolve user emojis
  const userHatEmoji = EQUIPPABLE_ITEMS.find((i) => i.id === equippedHatId)?.emoji;
  const userGearEmoji = EQUIPPABLE_ITEMS.find((i) => i.id === equippedGearId)?.emoji;

  // Build combined leaderboard
  const userPlayer: Omit<LeaderboardPlayer, 'rank'> = {
    id: 'current_user',
    username: userHunterId || '용감한_헌터',
    score: userScore,
    avatarIcon: userAvatarIcon,
    equippedHatEmoji: userHatEmoji,
    equippedGearEmoji: userGearEmoji,
    badge: '모험 진행중',
    isUser: true,
    streakDays: userStreak,
  };

  const allPlayers = [...BASE_LEADERBOARD_PLAYERS, userPlayer].sort(
    (a, b) => b.score - a.score
  );

  const rankedPlayers: LeaderboardPlayer[] = allPlayers.map((p, idx) => ({
    ...p,
    rank: idx + 1,
  }));

  const userRankObj = rankedPlayers.find((p) => p.isUser);
  const userRank = userRankObj ? userRankObj.rank : 1;

  const handleSaveId = () => {
    if (!tempId.trim()) return;
    sounds.playClick();
    onUpdateHunterId(tempId.trim());
    setIsEditingId(false);
  };

  return (
    <div
      id="community-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md"
    >
      <div
        id="community-modal-card"
        className="w-full max-w-md bg-gradient-to-b from-amber-50 via-white to-amber-100 border-4 border-amber-500 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header - Duolingo League Theme */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 px-5 py-3.5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-yellow-400 text-yellow-950 flex items-center justify-center font-black text-xl shadow">
              💎
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h2 className="text-base sm:text-lg font-black tracking-wide">
                  다이아몬드 탐험가 리그
                </h2>
                <span className="text-[10px] bg-yellow-300 text-yellow-900 px-1.5 py-0.5 rounded font-black">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-amber-200">
                초등 5학년 헌터들의 실시간 점수 랭킹!
              </p>
            </div>
          </div>
          <button
            id="community-close-btn"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-black/20"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Identity & Rank Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-3.5 text-white shadow-inner flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HunterAvatar
              avatarIcon={userAvatarIcon}
              hatId={equippedHatId}
              gearId={equippedGearId}
              size="sm"
            />
            <div>
              {/* Editable Hunter ID */}
              <div className="flex items-center space-x-1.5">
                {isEditingId ? (
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      value={tempId}
                      maxLength={12}
                      onChange={(e) => setTempId(e.target.value)}
                      className="px-2 py-0.5 text-xs text-slate-800 rounded bg-white font-bold w-28 outline-none"
                    />
                    <button
                      onClick={handleSaveId}
                      className="p-1 bg-amber-700 rounded text-white"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <span className="font-black text-sm tracking-tight text-white drop-shadow">
                      {userHunterId}
                    </span>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setIsEditingId(true);
                      }}
                      className="text-amber-100 hover:text-white p-0.5"
                      title="아이디 수정"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded-full font-extrabold text-yellow-200">
                  나의 아이디
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-extrabold text-amber-100 mt-0.5">
                <span>총 점수: <b>{userScore}점</b></span>
                <span>·</span>
                <span className="flex items-center gap-0.5 text-orange-200">
                  <Flame className="w-3.5 h-3.5 fill-current text-orange-300" />
                  {userStreak}일 연속
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-amber-100 block font-bold">현재 등수</span>
            <div className="text-2xl font-black text-white flex items-center justify-end gap-1">
              <Trophy className="w-5 h-5 text-yellow-200" />
              <span>{userRank}위</span>
            </div>
          </div>
        </div>

        {/* Promotion info strip */}
        <div className="bg-amber-100/80 px-4 py-2 border-b border-amber-200 flex items-center justify-between text-[11px] font-bold text-amber-900">
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span>상위 3위까지 <b>황금 열쇠 🔑 3개 보너스</b> 지급!</span>
          </div>
          <span className="text-amber-700 font-extrabold">시즌 종료 D-2</span>
        </div>

        {/* Leaderboard Player List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2 flex-1">
          {rankedPlayers.map((player) => {
            const isMe = player.isUser;
            const isTop3 = player.rank <= 3;

            return (
              <div
                key={player.id}
                id={isMe ? 'community-my-rank-row' : `player-rank-${player.rank}`}
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border-2 transition-all ${
                  isMe
                    ? 'border-amber-500 bg-amber-100/90 shadow-md ring-2 ring-amber-400/50 scale-[1.01]'
                    : isTop3
                    ? 'border-yellow-300 bg-white/95 shadow-sm'
                    : 'border-slate-200 bg-white/80'
                }`}
              >
                {/* Left: Rank & Avatar & Username */}
                <div className="flex items-center space-x-2.5">
                  {/* Rank number badge */}
                  <div className="w-7 text-center font-black">
                    {player.rank === 1 && <span className="text-xl">🥇</span>}
                    {player.rank === 2 && <span className="text-xl">🥈</span>}
                    {player.rank === 3 && <span className="text-xl">🥉</span>}
                    {player.rank > 3 && (
                      <span
                        className={`text-sm ${
                          isMe ? 'text-amber-800 font-black' : 'text-slate-500'
                        }`}
                      >
                        {player.rank}
                      </span>
                    )}
                  </div>

                  {/* Character Avatar with Equipped Items */}
                  <HunterAvatar
                    avatarIcon={player.avatarIcon}
                    hatEmoji={player.equippedHatEmoji}
                    gearEmoji={player.equippedGearEmoji}
                    size="sm"
                  />

                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-xs font-black truncate max-w-[130px] sm:max-w-[160px] ${
                          isMe ? 'text-amber-950 font-black' : 'text-slate-800'
                        }`}
                      >
                        {player.username}
                      </span>
                      {isMe && (
                        <span className="text-[9px] bg-amber-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                          나
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-[10px] text-slate-500 font-medium">
                      <span>{player.badge}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-orange-500 font-bold">
                        <Flame className="w-2.5 h-2.5 fill-current" />
                        {player.streakDays}일
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Score */}
                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-black text-slate-900 block">
                    {player.score}점
                  </span>
                  <span className="text-[10px] font-bold text-amber-700">
                    {isTop3 ? '승급 구간 ✨' : '유지'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-amber-100/90 border-t border-amber-300 flex items-center justify-between">
          <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-600" />
            STEP을 풀 때마다 100점씩 점수가 올라갑니다!
          </span>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-sm"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
