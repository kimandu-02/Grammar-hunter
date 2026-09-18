import React, { useState } from 'react';
import { X, RotateCcw, CheckCircle2, AlertCircle, BookOpen, Lightbulb, Volume2, Mic } from 'lucide-react';
import { MistakeRecord, Question } from '../types';
import { sounds } from '../utils/soundEffects';
import { playEnglishTTS } from '../utils/speechUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mistakes: MistakeRecord[];
  onResolveMistake: (questionId: string) => void;
}

export const ReviewMistakesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  mistakes,
  onResolveMistake,
}) => {
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [reorderedWords, setReorderedWords] = useState<string[]>([]);
  const [wordPool, setWordPool] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [filter, setFilter] = useState<'unresolved' | 'all'>('unresolved');

  if (!isOpen) return null;

  const unresolvedList = mistakes.filter((m) => !m.resolved);
  const displayList = filter === 'unresolved' ? unresolvedList : mistakes;

  const startRetry = (q: Question) => {
    sounds.playClick();
    setActiveQuestion(q);
    setSelectedAnswer('');
    setFeedback(null);
    if (q.type === 'reorder' && q.words) {
      setWordPool([...q.words].sort(() => Math.random() - 0.5));
      setReorderedWords([]);
    }
  };

  const handleWordTap = (word: string, fromPool: boolean) => {
    sounds.playClick();
    if (fromPool) {
      setWordPool((prev) => {
        const idx = prev.indexOf(word);
        if (idx === -1) return prev;
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      });
      setReorderedWords((prev) => [...prev, word]);
    } else {
      setReorderedWords((prev) => {
        const idx = prev.indexOf(word);
        if (idx === -1) return prev;
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      });
      setWordPool((prev) => [...prev, word]);
    }
  };

  const checkRetryAnswer = () => {
    if (!activeQuestion) return;
    let answerToCheck = selectedAnswer.trim();
    if (activeQuestion.type === 'reorder') {
      answerToCheck = reorderedWords.join(' ');
    }

    if (!answerToCheck) return;

    const isCorrect =
      answerToCheck.toLowerCase() === activeQuestion.correctAnswer.toLowerCase();

    if (isCorrect) {
      sounds.playCorrect();
      setFeedback({
        isCorrect: true,
        text: '정답입니다! 완벽하게 STEP 오답을 정복했어요! 🎉',
      });
      onResolveMistake(activeQuestion.id);
    } else {
      sounds.playWrong();
      setFeedback({
        isCorrect: false,
        text: `다시 한번 힌트를 읽고 도전해 보세요! (정답: ${activeQuestion.correctAnswer})`,
      });
    }
  };

  return (
    <div
      id="review-mistakes-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-md"
    >
      <div
        id="review-mistakes-card"
        className="w-full max-w-lg bg-white border-4 border-rose-400 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📝</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black">비밀 오답 복습 노트</h2>
              <p className="text-xs text-rose-100">
                틀린 STEP을 스스로 다시 풀어보며 약점을 보물로 만들어요!
              </p>
            </div>
          </div>
          <button
            id="review-modal-close-btn"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-black/20"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-5 py-2.5 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-xs font-bold">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('unresolved')}
              className={`px-3 py-1 rounded-full transition-colors ${
                filter === 'unresolved'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              다시 풀 STEP ({unresolvedList.length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full transition-colors ${
                filter === 'all'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              전체 STEP 기록 ({mistakes.length})
            </button>
          </div>
          {activeQuestion && (
            <button
              onClick={() => setActiveQuestion(null)}
              className="text-slate-600 underline hover:text-slate-800"
            >
              목록으로
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {activeQuestion ? (
            /* Active Retry View */
            <div className="space-y-4 bg-amber-50/60 p-4 rounded-2xl border-2 border-amber-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-1 rounded-md bg-amber-600 text-white">
                  다시 풀기 챌린지 STEP
                </span>
                <span className="text-xs font-bold text-amber-800">
                  {activeQuestion.grammarPoint}
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-base">
                {activeQuestion.question}
              </h3>

              {activeQuestion.sentence && (
                <div className="bg-white p-3.5 rounded-xl border border-amber-200 font-bold text-slate-800 text-sm whitespace-pre-line leading-relaxed shadow-sm">
                  {activeQuestion.sentence}
                </div>
              )}

              {activeQuestion.type === 'reorder' ? (
                <div className="space-y-3">
                  <div className="min-h-[50px] p-2.5 bg-white border-2 border-dashed border-amber-400 rounded-xl flex flex-wrap gap-1.5 items-center">
                    {reorderedWords.length === 0 ? (
                      <span className="text-xs text-slate-400 font-medium">
                        아래 단어 카드를 탭하여 순서대로 놓아보세요.
                      </span>
                    ) : (
                      reorderedWords.map((word, i) => (
                        <button
                          key={`reorder-picked-${i}`}
                          onClick={() => handleWordTap(word, false)}
                          className="px-3 py-1.5 bg-amber-600 text-white font-bold text-sm rounded-lg shadow-sm"
                        >
                          {word}
                        </button>
                      ))
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {wordPool.map((word, i) => (
                      <button
                        key={`reorder-pool-${i}`}
                        onClick={() => handleWordTap(word, true)}
                        className="px-3 py-1.5 bg-white border-2 border-amber-300 hover:border-amber-500 font-bold text-sm text-slate-800 rounded-lg shadow-sm active:scale-95"
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              ) : activeQuestion.type === 'speaking' ? (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center space-y-3">
                  <div className="text-base font-black text-slate-900">
                    "{activeQuestion.speechTarget || activeQuestion.sentence || activeQuestion.correctAnswer}"
                  </div>
                  {activeQuestion.koreanMeaning && (
                    <div className="text-xs text-amber-900 font-bold">
                      뜻: {activeQuestion.koreanMeaning}
                    </div>
                  )}
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        playEnglishTTS(
                          activeQuestion.speechTarget ||
                            activeQuestion.sentence ||
                            activeQuestion.correctAnswer
                        )
                      }
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-full flex items-center gap-1.5 shadow-sm"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>원어민 발음 듣기</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAnswer(activeQuestion.correctAnswer)}
                      className={`px-3.5 py-1.5 text-xs font-black rounded-full border-2 transition-all flex items-center gap-1.5 ${
                        selectedAnswer === activeQuestion.correctAnswer
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-white border-amber-400 text-amber-900 hover:bg-amber-100'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>{selectedAnswer ? '말하기 완료됨!' : '소리 내어 말하고 선택'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {activeQuestion.options?.map((opt, idx) => {
                    const isSelected = selectedAnswer === opt;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          sounds.playClick();
                          setSelectedAnswer(opt);
                        }}
                        className={`p-3 rounded-xl border-2 text-left font-bold text-sm transition-all ${
                          isSelected
                            ? 'border-amber-600 bg-amber-100 text-amber-900 shadow-sm ring-2 ring-amber-400'
                            : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="p-3 bg-yellow-100/70 border border-yellow-300 rounded-xl flex items-start gap-2 text-xs text-yellow-900">
                <Lightbulb className="w-4 h-4 text-yellow-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">힌트: </span>
                  {activeQuestion.hint}
                </div>
              </div>

              {feedback && (
                <div
                  className={`p-3.5 rounded-xl border-2 font-bold text-xs flex items-center gap-2 ${
                    feedback.isCorrect
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  {feedback.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={checkRetryAnswer}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-sm rounded-xl shadow-md transition-transform active:scale-95"
                >
                  정답 확인하기!
                </button>
                <button
                  type="button"
                  onClick={() => setActiveQuestion(null)}
                  className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl"
                >
                  닫기
                </button>
              </div>
            </div>
          ) : displayList.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center text-3xl shadow-sm">
                🎉
              </div>
              <h3 className="font-extrabold text-slate-800 text-base">
                {filter === 'unresolved' ? '남은 오답 STEP이 없습니다!' : '오답 STEP 기록이 없습니다!'}
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                모든 문법 STEP을 멋지게 통과하고 있어요. 새로운 스테이지에 도전해 보세요!
              </p>
            </div>
          ) : (
            displayList.map((item, idx) => (
              <div
                key={`${item.questionId}-${idx}`}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  item.resolved
                    ? 'border-emerald-200 bg-emerald-50/50'
                    : 'border-rose-200 bg-white hover:border-rose-300 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-rose-500 text-white">
                      STAGE {item.stageId}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {item.question.grammarPoint}
                    </span>
                  </div>
                  {item.resolved ? (
                    <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> 해결 완료
                    </span>
                  ) : (
                    <span className="text-xs font-extrabold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> 복습 필요
                    </span>
                  )}
                </div>

                <p className="font-bold text-slate-800 text-sm mt-2">
                  {item.question.question}
                </p>

                {item.question.sentence && (
                  <p className="text-xs font-medium text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-200 whitespace-pre-line">
                    {item.question.sentence}
                  </p>
                )}

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1 text-xs">
                  <div className="flex items-center gap-1.5 text-rose-600">
                    <span className="font-bold">내가 낸 오답:</span>
                    <span className="line-through">{item.selectedWrongAnswer || '(미응답)'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <span className="font-bold">정답:</span>
                    <span className="font-extrabold">{item.question.correctAnswer}</span>
                  </div>
                </div>

                <div className="mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <div className="font-bold flex items-center gap-1 mb-0.5 text-amber-800">
                    <BookOpen className="w-3.5 h-3.5" /> 설명:
                  </div>
                  {item.question.explanation}
                </div>

                {!item.resolved && (
                  <button
                    type="button"
                    onClick={() => startRetry(item.question)}
                    className="mt-3 w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-1 transition-transform active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>지금 다시 풀어보기</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-600">
          <span>오답 STEP 노트 총 {mistakes.length}개</span>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
