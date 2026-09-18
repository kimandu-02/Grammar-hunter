import React, { useState, useEffect, useRef } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  MapPin,
  ChevronLeft,
  Mic,
  MicOff,
  Radio,
  HelpCircle,
  Check,
} from 'lucide-react';
import { Stage, Question, CharacterProfile } from '../types';
import { HunterAvatar } from './HunterAvatar';
import { sounds } from '../utils/soundEffects';
import {
  playEnglishTTS,
  isSpeechRecognitionSupported,
  evaluateSpeechAccuracy,
} from '../utils/speechUtils';

interface Props {
  stage: Stage;
  character: CharacterProfile;
  equippedHatId: string;
  equippedGearId: string;
  availableKeys: number;
  onFinishStage: (results: {
    stageId: number;
    score: number;
    correctCount: number;
    totalQuestions: number;
    keysEarned: number;
    wrongQuestions: { question: Question; selectedAnswer: string }[];
  }) => void;
  onExitToHome: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const QuizScreen: React.FC<Props> = ({
  stage,
  character,
  equippedHatId,
  equippedGearId,
  availableKeys,
  onFinishStage,
  onExitToHome,
  isMuted,
  onToggleMute,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [keysEarnedInStage, setKeysEarnedInStage] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [reorderedWords, setReorderedWords] = useState<string[]>([]);
  const [wordPool, setWordPool] = useState<string[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean>(false);
  const [wrongQuestions, setWrongQuestions] = useState<
    { question: Question; selectedAnswer: string }[]
  >([]);

  // Exit Confirmation Modal State (Fixes iframe confirm() blocking)
  const [showExitModal, setShowExitModal] = useState<boolean>(false);

  // Speaking Question States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [speechAccuracy, setSpeechAccuracy] = useState<number | null>(null);
  const [isSpeechPlaying, setIsSpeechPlaying] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  const currentQ: Question = stage.questions[currentIdx];
  const totalQuestions = stage.questions.length;

  // Initialize STEP state when index changes
  useEffect(() => {
    setSelectedAnswer('');
    setShowHint(false);
    setHasSubmitted(false);
    setIsCurrentCorrect(false);
    setSpokenTranscript('');
    setSpeechAccuracy(null);
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }

    if (currentQ?.type === 'reorder' && currentQ.words) {
      setWordPool([...currentQ.words].sort(() => Math.random() - 0.5));
      setReorderedWords([]);
    }

    // Auto-play TTS gently when a speaking question appears
    if (currentQ?.type === 'speaking' && !isMuted) {
      const target = currentQ.speechTarget || currentQ.sentence || currentQ.correctAnswer;
      setTimeout(() => {
        playEnglishTTS(target);
      }, 500);
    }
  }, [currentIdx, currentQ]);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Word reorder interactions
  const handlePickWord = (word: string, indexInPool: number) => {
    if (hasSubmitted) return;
    sounds.playClick();
    setWordPool((prev) => prev.filter((_, idx) => idx !== indexInPool));
    setReorderedWords((prev) => [...prev, word]);
  };

  const handleReturnWord = (word: string, indexInSlot: number) => {
    if (hasSubmitted) return;
    sounds.playClick();
    setReorderedWords((prev) => prev.filter((_, idx) => idx !== indexInSlot));
    setWordPool((prev) => [...prev, word]);
  };

  const handleResetReorder = () => {
    if (hasSubmitted || !currentQ.words) return;
    sounds.playClick();
    setWordPool([...currentQ.words].sort(() => Math.random() - 0.5));
    setReorderedWords([]);
  };

  // Play target sentence audio with TTS
  const handlePlayTTS = async () => {
    sounds.playClick();
    const target = currentQ.speechTarget || currentQ.sentence || currentQ.correctAnswer;
    setIsSpeechPlaying(true);
    await playEnglishTTS(target);
    setIsSpeechPlaying(false);
  };

  // Start Speech Recognition (STT) for Speaking STEP
  const handleToggleSpeechRecognition = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      // Fallback if browser does not support SpeechRecognition
      const target = currentQ.speechTarget || currentQ.sentence || currentQ.correctAnswer;
      setSpokenTranscript(target);
      setSelectedAnswer(target);
      setSpeechAccuracy(100);
      sounds.playCorrect();
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        sounds.playClick();
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setSpokenTranscript(transcript);

        if (event.results[0].isFinal) {
          const target = currentQ.speechTarget || currentQ.sentence || currentQ.correctAnswer;
          const evaluation = evaluateSpeechAccuracy(target, transcript);
          setSpeechAccuracy(evaluation.accuracy);
          setSelectedAnswer(transcript);
          setIsRecording(false);

          if (evaluation.isMatch) {
            sounds.playCorrect();
          } else {
            sounds.playClick();
          }
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
      // Fallback
      const target = currentQ.speechTarget || currentQ.sentence || currentQ.correctAnswer;
      setSpokenTranscript(target);
      setSelectedAnswer(target);
      setSpeechAccuracy(90);
    }
  };

  // Speaking Practice Alternative (e.g. for devices without working microphone)
  const handleSpeakingPracticePass = () => {
    sounds.playClick();
    const target = currentQ.speechTarget || currentQ.sentence || currentQ.correctAnswer;
    setSpokenTranscript(target);
    setSelectedAnswer(target);
    setSpeechAccuracy(100);
  };

  // Submit answer check
  const handleSubmit = () => {
    if (hasSubmitted) return;

    let finalAnswer = selectedAnswer.trim();
    if (currentQ.type === 'reorder') {
      finalAnswer = reorderedWords.join(' ');
    }

    if (!finalAnswer) return;

    const cleanUser = finalAnswer.replace(/\s+/g, ' ').trim().toLowerCase();
    const cleanCorrect = currentQ.correctAnswer.replace(/\s+/g, ' ').trim().toLowerCase();

    let isCorrect = cleanUser === cleanCorrect;
    if (currentQ.type === 'speaking') {
      const evalResult = evaluateSpeechAccuracy(currentQ.correctAnswer, finalAnswer);
      isCorrect = evalResult.isMatch;
    }

    setHasSubmitted(true);
    setIsCurrentCorrect(isCorrect);

    if (isCorrect) {
      sounds.playCorrect();
      setScore((prev) => prev + 100);
      setCorrectCount((prev) => prev + 1);

      // Key acquisition: up to 3 keys per stage
      setKeysEarnedInStage((prev) => {
        const nextKeys = Math.min(3, Math.floor(((correctCount + 1) / totalQuestions) * 3) || 1);
        if (nextKeys > prev) {
          setTimeout(() => sounds.playKey(), 250);
        }
        return nextKeys;
      });
    } else {
      sounds.playWrong();
      setWrongQuestions((prev) => [
        ...prev,
        { question: currentQ, selectedAnswer: finalAnswer },
      ]);
    }
  };

  // Next STEP or finish
  const handleNext = () => {
    sounds.playClick();
    if (currentIdx + 1 < totalQuestions) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      const finalKeys = Math.min(3, Math.round((correctCount / totalQuestions) * 3));
      onFinishStage({
        stageId: stage.id,
        score,
        correctCount,
        totalQuestions,
        keysEarned: finalKeys,
        wrongQuestions,
      });
    }
  };

  const isReorderReady =
    currentQ.type === 'reorder' && reorderedWords.length > 0;
  const isOptionReady =
    currentQ.type !== 'reorder' && selectedAnswer.length > 0;
  const canSubmit = !hasSubmitted && (isReorderReady || isOptionReady);

  return (
    <div
      id="quiz-screen-container"
      className="min-h-screen w-full bg-gradient-to-b from-amber-100 via-amber-50 to-orange-100 flex flex-col items-center justify-between p-3 sm:p-5 select-none"
    >
      {/* In-App Exit Confirmation Modal (Fixes iframe window.confirm block) */}
      {showExitModal && (
        <div
          id="quiz-exit-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            id="quiz-exit-modal-card"
            className="bg-white border-4 border-amber-500 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4"
          >
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner border border-amber-300">
              🧭
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                탐험을 중단하고 나갈까요?
              </h3>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                지금 나가면 현재 풀고 있던 STEP 진행 상황이 저장되지 않습니다. 메인 화면으로 돌아갈까요?
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                id="quiz-exit-cancel-btn"
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setShowExitModal(false);
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-extrabold text-sm rounded-xl transition-all"
              >
                계속 탐험
              </button>
              <button
                id="quiz-exit-confirm-btn"
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setShowExitModal(false);
                  onExitToHome();
                }}
                className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-sm rounded-xl shadow-md transition-all active:scale-95"
              >
                메인으로 나가기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header with STEP 1/5, equipped Avatar, 🔑 Keys, Score */}
      <header className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl border-2 border-amber-300 shadow-md p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          {/* Robust in-app Exit button */}
          <button
            id="quiz-back-btn"
            onClick={() => {
              sounds.playClick();
              setShowExitModal(true);
            }}
            className="flex items-center space-x-1 text-xs font-bold text-slate-700 hover:text-slate-950 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors border border-amber-300 shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>나가기</span>
          </button>

          {/* Stage name with Location */}
          <div className="flex items-center space-x-1.5 text-xs font-black text-amber-950 truncate max-w-[190px]">
            <span className="text-base">{stage.locationIcon}</span>
            <span className="truncate">{stage.title}</span>
          </div>

          {/* Equipped Hunter Avatar */}
          <div className="flex items-center space-x-2">
            <HunterAvatar
              avatarIcon={character.avatarIcon}
              hatId={equippedHatId}
              gearId={equippedGearId}
              size="sm"
            />
            <button
              id="quiz-mute-toggle"
              onClick={onToggleMute}
              className="p-1.5 rounded-lg bg-amber-100/70 text-slate-700 hover:bg-amber-200 transition-colors"
              title={isMuted ? '소리 켜기' : '소리 끄기'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Top Stats: STEP 1/5, 🔑 획득 열쇠, 점수 */}
        <div className="flex items-center justify-between border-t border-amber-200/80 pt-2 text-sm font-black">
          {/* STEP 1/5 */}
          <div id="quiz-question-number" className="flex items-center space-x-1 text-slate-700">
            <span className="text-xs text-amber-900 font-extrabold bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
              STEP {currentIdx + 1} / {totalQuestions}
            </span>
          </div>

          {/* 획득 열쇠 수: 🔑 1/3 형식 */}
          <div
            id="quiz-keys-count"
            className="flex items-center space-x-1 bg-yellow-100 border border-yellow-300 px-3 py-0.5 rounded-full shadow-inner"
            title="이번 스테이지에서 획득한 열쇠"
          >
            <span className="text-base">🔑</span>
            <span className="text-yellow-900 font-black tracking-tight">
              {keysEarnedInStage} / 3
            </span>
          </div>

          {/* 점수 */}
          <div id="quiz-score-display" className="flex items-center space-x-1 text-slate-700">
            <span className="text-xs text-slate-400 font-bold">점수</span>
            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              {score}점
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </header>

      {/* Main STEP Area */}
      <main className="w-full max-w-md flex-1 flex flex-col justify-start space-y-3">
        {/* STEP Prompt Card */}
        <div
          id="quiz-question-card"
          className="bg-white rounded-2xl border-2 border-amber-300 shadow-md p-4 space-y-2 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-white tracking-wide flex items-center gap-1">
              {currentQ.type === 'choice' && '🎯 문장 선택 STEP'}
              {currentQ.type === 'reorder' && '🧩 단어 배열 STEP'}
              {currentQ.type === 'error_spot' && '🔍 오류 찾기 STEP'}
              {currentQ.type === 'fill_blank' && '✏️ 문장 완성 STEP'}
              {currentQ.type === 'speaking' && (
                <>
                  <Mic className="w-3 h-3 text-white" />
                  <span>🎙️ 말하기 STEP (Listen & Speak)</span>
                </>
              )}
            </span>

            {/* Hint Trigger */}
            <button
              id="quiz-hint-btn"
              onClick={() => {
                sounds.playClick();
                setShowHint(!showHint);
              }}
              className={`flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
                showHint
                  ? 'bg-yellow-400 text-yellow-950 ring-2 ring-yellow-300'
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 fill-current" />
              <span>{showHint ? '힌트 닫기' : '문법 힌트 💡'}</span>
            </button>
          </div>

          {/* STEP Instruction */}
          <h2 className="text-base sm:text-lg font-extrabold text-slate-800 leading-snug">
            {currentQ.question}
          </h2>

          {/* Context Sentence (Non-speaking) */}
          {currentQ.type !== 'speaking' && currentQ.sentence && (
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 font-bold text-slate-800 text-sm sm:text-base leading-relaxed tracking-wide whitespace-pre-line shadow-inner">
              {currentQ.sentence}
            </div>
          )}

          {/* Hint Accordion */}
          {showHint && (
            <div
              id="quiz-hint-panel"
              className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-3 text-xs text-yellow-950 space-y-1.5 shadow-sm animate-fade-in"
            >
              <div className="flex items-center gap-1 font-black text-amber-900">
                <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
                <span>헌터의 STEP 힌트:</span>
              </div>
              <p className="font-semibold text-slate-700 leading-relaxed">
                {currentQ.hint}
              </p>
              <div className="text-[11px] text-amber-800 pt-1 border-t border-yellow-200/80">
                🔑 <b>핵심 문법:</b> {currentQ.grammarPoint}
              </div>
            </div>
          )}
        </div>

        {/* STEP Interaction Area */}
        <div id="quiz-interaction-area" className="flex-1 flex flex-col justify-start">
          {/* ========================================= */}
          {/* 1. SPEAKING QUESTION STEP UI */}
          {/* ========================================= */}
          {currentQ.type === 'speaking' && (
            <div id="speaking-step-panel" className="space-y-3">
              {/* Target Sentence Display Card */}
              <div className="bg-gradient-to-b from-amber-50 to-orange-50 rounded-2xl border-3 border-amber-400 p-4 shadow-md text-center space-y-2">
                <div className="flex items-center justify-center gap-1 text-xs font-black text-amber-800">
                  <span>목표 영어 문장</span>
                </div>

                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  "{currentQ.speechTarget || currentQ.sentence || currentQ.correctAnswer}"
                </div>

                {currentQ.koreanMeaning && (
                  <div className="text-xs sm:text-sm font-bold text-amber-900 bg-white/80 py-1 px-3 rounded-full inline-block border border-amber-200 shadow-2xs">
                    뜻: {currentQ.koreanMeaning}
                  </div>
                )}

                {/* Native TTS Audio Button */}
                <div className="pt-2 flex justify-center">
                  <button
                    id="speaking-play-tts-btn"
                    type="button"
                    onClick={handlePlayTTS}
                    className="flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm rounded-full shadow-md transition-transform active:scale-95"
                  >
                    <Volume2 className={`w-4 h-4 ${isSpeechPlaying ? 'animate-bounce' : ''}`} />
                    <span>{isSpeechPlaying ? '원어민 발음 재생 중...' : '원어민 발음 듣기 🔊'}</span>
                  </button>
                </div>
              </div>

              {/* Speech Input / Recognition Area */}
              <div className="bg-white rounded-2xl border-2 border-amber-300 p-4 shadow-md space-y-3 text-center">
                <div className="text-xs font-extrabold text-slate-600">
                  아래 마이크 버튼을 누르고 큰 소리로 영어 문장을 말해보세요!
                </div>

                {/* Big Touchable Microphone Button */}
                <div className="flex justify-center">
                  <button
                    id="speaking-mic-btn"
                    type="button"
                    onClick={handleToggleSpeechRecognition}
                    className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all transform shadow-xl select-none ${
                      isRecording
                        ? 'bg-rose-500 text-white scale-110 ring-4 ring-rose-300 animate-pulse'
                        : 'bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white active:scale-95'
                    }`}
                  >
                    {isRecording ? (
                      <Radio className="w-8 h-8 animate-ping" />
                    ) : (
                      <Mic className="w-8 h-8" />
                    )}
                    <span className="text-[10px] font-black mt-1">
                      {isRecording ? '듣는 중...' : '마이크'}
                    </span>
                  </button>
                </div>

                {/* Spoken result banner */}
                {spokenTranscript ? (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-left space-y-1 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">인식된 음성:</span>
                      {speechAccuracy !== null && (
                        <span
                          className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                            speechAccuracy >= 60
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          발음 일치도: {speechAccuracy}%
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-black text-slate-900">
                      "{spokenTranscript}"
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 font-medium">
                    마이크를 누르면 실시간으로 음성이 인식됩니다.
                  </div>
                )}

                {/* Alternative Quick Practice Check (for browsers where mic is blocked in iframe) */}
                <div className="pt-1 border-t border-amber-100 flex items-center justify-center">
                  <button
                    id="speaking-practice-pass-btn"
                    type="button"
                    onClick={handleSpeakingPracticePass}
                    className="text-xs text-amber-800 hover:text-amber-950 font-black bg-amber-100/70 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300 transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>🗣️ 큰 소리로 3번 외치고 완료하기</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* 2. WORD REORDER STEP UI */}
          {/* ========================================= */}
          {currentQ.type === 'reorder' && (
            <div className="space-y-3">
              <div className="bg-white rounded-2xl border-2 border-dashed border-amber-400 p-3 min-h-[68px] flex flex-wrap gap-2 items-center shadow-inner">
                {reorderedWords.length === 0 ? (
                  <span className="text-xs text-slate-400 font-medium italic w-full text-center py-2">
                    아래 단어 조각을 탭하여 올바른 순서의 문장으로 완성하세요!
                  </span>
                ) : (
                  reorderedWords.map((word, wIdx) => (
                    <button
                      key={`slot-${wIdx}-${word}`}
                      disabled={hasSubmitted}
                      onClick={() => handleReturnWord(word, wIdx)}
                      className="px-3 py-2 bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-all transform active:scale-95 flex items-center space-x-1"
                    >
                      <span>{word}</span>
                    </button>
                  ))
                )}
              </div>

              <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600">단어 보물 조각:</span>
                  {!hasSubmitted && reorderedWords.length > 0 && (
                    <button
                      onClick={handleResetReorder}
                      className="text-xs font-bold text-amber-800 flex items-center space-x-1 hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>다시 배열</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {wordPool.length === 0 ? (
                    <span className="text-xs text-emerald-600 font-bold py-1">
                      모든 단어를 배치했습니다! [정답 확인]을 눌러보세요.
                    </span>
                  ) : (
                    wordPool.map((word, pIdx) => (
                      <button
                        key={`pool-${pIdx}-${word}`}
                        disabled={hasSubmitted}
                        onClick={() => handlePickWord(word, pIdx)}
                        className="px-3.5 py-2 bg-white border-2 border-amber-300 hover:border-amber-500 text-slate-800 font-extrabold text-sm rounded-xl shadow-sm hover:shadow active:scale-95 transition-all"
                      >
                        {word}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* 3. MULTIPLE CHOICE / ERROR SPOT / FILL BLANK */}
          {/* ========================================= */}
          {currentQ.type !== 'reorder' && currentQ.type !== 'speaking' && (
            <div className="grid grid-cols-1 gap-2.5">
              {currentQ.options?.map((option, optIdx) => {
                const isSelected = selectedAnswer === option;
                let cardStyle =
                  'bg-white border-slate-200 text-slate-800 hover:border-amber-300 hover:bg-amber-50/40';

                if (hasSubmitted) {
                  if (option.toLowerCase() === currentQ.correctAnswer.toLowerCase()) {
                    cardStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-black ring-2 ring-emerald-400';
                  } else if (isSelected) {
                    cardStyle = 'bg-rose-100 border-rose-400 text-rose-950 line-through';
                  } else {
                    cardStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  cardStyle =
                    'bg-amber-100 border-amber-500 text-amber-950 font-black ring-2 ring-amber-400 shadow-md scale-[1.01]';
                }

                return (
                  <button
                    key={optIdx}
                    id={`quiz-option-${optIdx}`}
                    disabled={hasSubmitted}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedAnswer(option);
                    }}
                    className={`p-3.5 rounded-xl border-2 text-left font-bold text-sm sm:text-base transition-all flex items-center justify-between shadow-sm ${cardStyle}`}
                  >
                    <span className="flex items-center space-x-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-200/80 text-slate-700 text-xs flex items-center justify-center font-black shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </span>
                    {hasSubmitted && option.toLowerCase() === currentQ.correctAnswer.toLowerCase() && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Feedback Card */}
          {hasSubmitted && (
            <div
              id="quiz-feedback-banner"
              className={`mt-3 p-3.5 sm:p-4 rounded-2xl border-2 shadow-md animate-fade-in ${
                isCurrentCorrect
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-center space-x-2 font-black text-sm sm:text-base">
                {isCurrentCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>정답입니다! 황금 열쇠 획득! 🎉</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                    <span>아쉬워요! 오답 복습 노트에 자동 저장되었습니다.</span>
                  </>
                )}
              </div>

              {!isCurrentCorrect && (
                <div className="mt-1.5 text-xs text-rose-900 bg-white/70 p-2 rounded-lg border border-rose-200">
                  <span className="font-bold">정답: </span>
                  <span className="font-extrabold text-emerald-800">{currentQ.correctAnswer}</span>
                </div>
              )}

              <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Action Bar: [정답 확인] or [다음 STEP] */}
      <footer className="w-full max-w-md mt-4 pt-2">
        {!hasSubmitted ? (
          <button
            id="quiz-check-answer-btn"
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className={`w-full py-3.5 rounded-2xl font-black text-base shadow-lg transition-all flex items-center justify-center space-x-2 ${
              canSubmit
                ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white shadow-amber-400/40 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>정답 확인</span>
            <CheckCircle2 className="w-5 h-5" />
          </button>
        ) : (
          <button
            id="quiz-next-question-btn"
            type="button"
            onClick={handleNext}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-400/40 transition-transform active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>{currentIdx + 1 < totalQuestions ? '다음 STEP' : '보물상자 열기!'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </footer>
    </div>
  );
};
