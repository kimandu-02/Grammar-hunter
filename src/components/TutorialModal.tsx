import React from 'react';
import { Sparkles, Key, Compass, Trophy, CheckCircle, X, Shield } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="tutorial-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
    >
      <div
        id="tutorial-modal-card"
        className="w-full max-w-md bg-amber-50 border-4 border-amber-500/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 px-6 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <Compass className="w-6 h-6 text-yellow-300 animate-spin-slow" />
            <h2 className="text-xl font-black tracking-wide">신입 헌터 길라잡이</h2>
          </div>
          <button
            id="tutorial-close-btn"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-black/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3.5 overflow-y-auto">
          <div className="bg-white p-3.5 rounded-xl border-2 border-amber-200 shadow-sm flex items-start space-x-3">
            <div className="bg-amber-100 p-2.5 rounded-lg text-amber-700 font-bold shrink-0">
              <Key className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm sm:text-base">1. STEP 풀고 황금 열쇠 획득!</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                각 스테이지마다 5개의 영문법 STEP이 펼쳐져요. 올바른 정답을 찾아 황금 열쇠를 모아보세요.
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border-2 border-amber-200 shadow-sm flex items-start space-x-3">
            <div className="bg-yellow-100 p-2.5 rounded-lg text-yellow-700 font-bold shrink-0">
              <Shield className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm sm:text-base">2. 열쇠로 단계 및 아이템 해금</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                • <b>다음 단계 해금:</b> 열쇠 🔑 3개로 잠긴 단계를 즉시 오픈!<br />
                • <b>아이템 해금:</b> 열쇠 🔑 2개로 왕관, 페도라, 마법봉 등 장비를 획득해 내 캐릭터에 장착하세요.
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border-2 border-amber-200 shadow-sm flex items-start space-x-3">
            <div className="bg-blue-100 p-2.5 rounded-lg text-blue-700 font-bold shrink-0">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm sm:text-base">3. 커뮤니티 리그 등수 경쟁</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                듀오링고처럼 내 아이디와 점수로 실시간 등수를 확인하고, 상위 승급 구간에 도전하세요!
              </p>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border-2 border-amber-200 shadow-sm flex items-start space-x-3">
            <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700 font-bold shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm sm:text-base">4. 오답 STEP 자동 저장 & 복습</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                틀린 STEP은 오답 노트에 쏙 들어가 언제든 다시 풀 수 있고, 스테이지를 완료하면 고대 보물을 얻어요!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-amber-100/80 border-t border-amber-300 flex justify-end">
          <button
            id="tutorial-start-now-btn"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-extrabold text-base rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>모험 시작하기!</span>
            <Compass className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
