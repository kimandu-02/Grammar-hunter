import { useState, useEffect } from 'react';
import { GRAMMAR_STAGES } from './data/grammarCurriculum';
import { UserProgress, Question, CharacterProfile } from './types';
import {
  loadProgress,
  saveProgress,
  recordMistake,
  resolveMistake,
} from './utils/storage';
import { sounds } from './utils/soundEffects';

import { StartScreen } from './components/StartScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { StageMapModal } from './components/StageMapModal';
import { ReviewMistakesModal } from './components/ReviewMistakesModal';
import { LearningRecordsModal } from './components/LearningRecordsModal';
import { CharacterModal } from './components/CharacterModal';
import { CommunityLeaderboardModal } from './components/CommunityLeaderboardModal';
import { TutorialModal } from './components/TutorialModal';

type ViewMode = 'start' | 'quiz' | 'result';

interface LastResult {
  stageId: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  keysEarned: number;
  wrongCount: number;
}

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const [view, setView] = useState<ViewMode>('start');
  const [activeStageId, setActiveStageId] = useState<number>(() => progress.currentStageId || 1);
  const [lastResult, setLastResult] = useState<LastResult | null>(null);

  // Modals state
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [isMistakesOpen, setIsMistakesOpen] = useState<boolean>(false);
  const [isRecordsOpen, setIsRecordsOpen] = useState<boolean>(false);
  const [isCharacterOpen, setIsCharacterOpen] = useState<boolean>(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState<boolean>(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => sounds.getMuted());

  // Show tutorial on first session
  useEffect(() => {
    if (!progress.hasSeenTutorial) {
      setIsTutorialOpen(true);
      const updated = { ...progress, hasSeenTutorial: true };
      setProgress(updated);
      saveProgress(updated);
    }
  }, [progress.hasSeenTutorial]);

  const toggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const currentStage =
    GRAMMAR_STAGES.find((s) => s.id === activeStageId) || GRAMMAR_STAGES[0];

  // Total score across all completed stages
  const totalUserScore = Object.values(progress.stageScores).reduce(
    (acc, curr) => acc + curr,
    0
  );

  // Start game from start screen
  const handleStartGame = (stageId?: number) => {
    const targetId = stageId || activeStageId;
    setActiveStageId(targetId);
    setView('quiz');
  };

  // Complete a quiz stage
  const handleFinishStage = (results: {
    stageId: number;
    score: number;
    correctCount: number;
    totalQuestions: number;
    keysEarned: number;
    wrongQuestions: { question: Question; selectedAnswer: string }[];
  }) => {
    const stage = GRAMMAR_STAGES.find((s) => s.id === results.stageId)!;

    // Calculate stars: 3 for 5/5, 2 for 4/5, 1 for >= 3/5
    let stars = 1;
    if (results.correctCount === results.totalQuestions) stars = 3;
    else if (results.correctCount >= 4) stars = 2;

    // Automatically unlock next stage unconditionally when stage is finished!
    let updatedUnlocked = [...progress.unlockedStageIds];
    const nextStageId = results.stageId + 1;
    if (nextStageId <= GRAMMAR_STAGES.length && !updatedUnlocked.includes(nextStageId)) {
      updatedUnlocked.push(nextStageId);
    }

    // Advance active stage to the newly unlocked next stage
    if (nextStageId <= GRAMMAR_STAGES.length) {
      setActiveStageId(nextStageId);
    }

    // Collect treasure
    const updatedTreasures = progress.collectedTreasures.includes(stage.treasure.id)
      ? progress.collectedTreasures
      : [...progress.collectedTreasures, stage.treasure.id];

    // Record mistakes
    let currentProgress = { ...progress };
    results.wrongQuestions.forEach((item) => {
      currentProgress = recordMistake(currentProgress, {
        questionId: item.question.id,
        stageId: results.stageId,
        question: item.question,
        selectedWrongAnswer: item.selectedAnswer,
      });
    });

    // Best scores
    const bestScore = Math.max(
      progress.stageScores[results.stageId] || 0,
      results.score
    );
    const bestStars = Math.max(
      progress.stageStars[results.stageId] || 0,
      stars
    );

    const updatedProgress: UserProgress = {
      ...currentProgress,
      currentStageId: nextStageId <= GRAMMAR_STAGES.length ? nextStageId : results.stageId,
      unlockedStageIds: updatedUnlocked,
      stageScores: { ...progress.stageScores, [results.stageId]: bestScore },
      stageStars: { ...progress.stageStars, [results.stageId]: bestStars },
      collectedTreasures: updatedTreasures,
      availableKeys: progress.availableKeys + results.keysEarned,
      totalKeys: progress.totalKeys + results.keysEarned,
      totalCorrect: progress.totalCorrect + results.correctCount,
      totalQuestionsAnswered: progress.totalQuestionsAnswered + results.totalQuestions,
    };

    setProgress(updatedProgress);
    saveProgress(updatedProgress);

    setLastResult({
      stageId: results.stageId,
      score: results.score,
      correctCount: results.correctCount,
      totalQuestions: results.totalQuestions,
      keysEarned: results.keysEarned,
      wrongCount: results.wrongQuestions.length,
    });

    setView('result');
  };

  // Unlock next stage/step with 3 keys (단계당 열쇠 3개)
  const handleUnlockStageWithKeys = (stageId: number): boolean => {
    let success = false;
    setProgress((prev) => {
      if (prev.availableKeys < 3) return prev;
      success = true;
      const updatedUnlocked = prev.unlockedStageIds.includes(stageId)
        ? prev.unlockedStageIds
        : [...prev.unlockedStageIds, stageId];

      const updated: UserProgress = {
        ...prev,
        availableKeys: prev.availableKeys - 3,
        unlockedStageIds: updatedUnlocked,
        currentStageId: stageId,
      };
      saveProgress(updated);
      return updated;
    });
    if (success) {
      setActiveStageId(stageId);
    }
    return success;
  };

  // Unlock item with keys (아이템 하나당 열쇠 2개)
  const handleUnlockItem = (itemId: string, cost: number): boolean => {
    let success = false;
    setProgress((prev) => {
      if (prev.availableKeys < cost) return prev;
      success = true;
      const updatedUnlocked = prev.unlockedItemIds.includes(itemId)
        ? prev.unlockedItemIds
        : [...prev.unlockedItemIds, itemId];

      const updated: UserProgress = {
        ...prev,
        availableKeys: prev.availableKeys - cost,
        unlockedItemIds: updatedUnlocked,
      };
      saveProgress(updated);
      return updated;
    });
    return success;
  };

  // Unlock and equip item in one atomic transaction (열쇠 차감 + 장착)
  const handleUnlockAndEquipItem = (
    itemId: string,
    cost: number,
    category: 'hat' | 'gear'
  ): boolean => {
    let success = false;
    setProgress((prev) => {
      if (prev.availableKeys < cost) return prev;
      success = true;
      const updatedUnlocked = prev.unlockedItemIds.includes(itemId)
        ? prev.unlockedItemIds
        : [...prev.unlockedItemIds, itemId];

      const updated: UserProgress = {
        ...prev,
        availableKeys: prev.availableKeys - cost,
        unlockedItemIds: updatedUnlocked,
        equippedHatId: category === 'hat' ? itemId : prev.equippedHatId,
        equippedGearId: category === 'gear' ? itemId : prev.equippedGearId,
      };
      saveProgress(updated);
      return updated;
    });
    return success;
  };

  // Equip item
  const handleEquipItem = (category: 'hat' | 'gear', itemId: string) => {
    setProgress((prev) => {
      const updated: UserProgress = {
        ...prev,
        equippedHatId: category === 'hat' ? itemId : prev.equippedHatId,
        equippedGearId: category === 'gear' ? itemId : prev.equippedGearId,
      };
      saveProgress(updated);
      return updated;
    });
  };

  // Resolve a mistake
  const handleResolveMistake = (questionId: string) => {
    const updated = resolveMistake(progress, questionId);
    setProgress(updated);
  };

  // Update character
  const handleSaveCharacter = (char: CharacterProfile) => {
    const updated: UserProgress = {
      ...progress,
      character: char,
    };
    setProgress(updated);
    saveProgress(updated);
  };

  // Update hunter ID
  const handleUpdateHunterId = (newId: string) => {
    const updated: UserProgress = {
      ...progress,
      hunterId: newId,
    };
    setProgress(updated);
    saveProgress(updated);
  };

  // Navigate to next stage from result
  const handleNextStage = () => {
    if (!lastResult) return;
    const nextId = lastResult.stageId + 1;
    if (nextId <= GRAMMAR_STAGES.length) {
      setActiveStageId(nextId);
      setView('quiz');
    } else {
      setView('start');
    }
  };

  const handleSelectStageFromMap = (stageId: number) => {
    setActiveStageId(stageId);
    setView('quiz');
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 flex justify-center font-sans antialiased text-slate-800">
      {/* Mobile/Tablet portrait centered viewport frame */}
      <div className="w-full max-w-lg min-h-screen relative flex flex-col bg-amber-50 shadow-2xl overflow-x-hidden">
        {view === 'start' && (
          <StartScreen
            currentStage={currentStage}
            progress={progress}
            onStartGame={() => handleStartGame()}
            onOpenStageMap={() => setIsMapOpen(true)}
            onOpenMistakes={() => setIsMistakesOpen(true)}
            onOpenRecords={() => setIsRecordsOpen(true)}
            onOpenCharacter={() => setIsCharacterOpen(true)}
            onOpenCommunity={() => setIsCommunityOpen(true)}
            onOpenTutorial={() => setIsTutorialOpen(true)}
            isMuted={isMuted}
            onToggleMute={toggleMute}
          />
        )}

        {view === 'quiz' && (
          <QuizScreen
            key={`quiz-${currentStage.id}`}
            stage={currentStage}
            character={progress.character}
            equippedHatId={progress.equippedHatId}
            equippedGearId={progress.equippedGearId}
            availableKeys={progress.availableKeys}
            onFinishStage={handleFinishStage}
            onExitToHome={() => setView('start')}
            isMuted={isMuted}
            onToggleMute={toggleMute}
          />
        )}

        {view === 'result' && lastResult && (
          <ResultScreen
            stage={
              GRAMMAR_STAGES.find((s) => s.id === lastResult.stageId) ||
              currentStage
            }
            result={lastResult}
            character={progress.character}
            equippedHatId={progress.equippedHatId}
            equippedGearId={progress.equippedGearId}
            availableKeys={progress.availableKeys}
            onNextStage={handleNextStage}
            onRetryMistakes={() => setIsMistakesOpen(true)}
            onGoHome={() => setView('start')}
            hasNextStage={lastResult.stageId < GRAMMAR_STAGES.length}
          />
        )}

        {/* Modals */}
        <StageMapModal
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          progress={progress}
          onSelectStage={handleSelectStageFromMap}
          onUnlockStageWithKeys={handleUnlockStageWithKeys}
        />

        <ReviewMistakesModal
          isOpen={isMistakesOpen}
          onClose={() => setIsMistakesOpen(false)}
          mistakes={progress.mistakes}
          onResolveMistake={handleResolveMistake}
        />

        <LearningRecordsModal
          isOpen={isRecordsOpen}
          onClose={() => setIsRecordsOpen(false)}
          progress={progress}
        />

        <CharacterModal
          isOpen={isCharacterOpen}
          onClose={() => setIsCharacterOpen(false)}
          currentCharacter={progress.character}
          availableKeys={progress.availableKeys}
          unlockedItemIds={progress.unlockedItemIds}
          equippedHatId={progress.equippedHatId}
          equippedGearId={progress.equippedGearId}
          onSaveCharacter={handleSaveCharacter}
          onEquipItem={handleEquipItem}
          onUnlockItem={handleUnlockItem}
          onUnlockAndEquipItem={handleUnlockAndEquipItem}
        />

        <CommunityLeaderboardModal
          isOpen={isCommunityOpen}
          onClose={() => setIsCommunityOpen(false)}
          userScore={totalUserScore}
          userHunterId={progress.hunterId}
          userAvatarIcon={progress.character.avatarIcon}
          equippedHatId={progress.equippedHatId}
          equippedGearId={progress.equippedGearId}
          onUpdateHunterId={handleUpdateHunterId}
        />

        <TutorialModal
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
        />
      </div>
    </div>
  );
}
