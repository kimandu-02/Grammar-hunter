import { UserProgress, MistakeRecord, CharacterProfile } from '../types';

const STORAGE_KEY = 'grammar_hunter_progress_v2';

export const DEFAULT_CHARACTER: CharacterProfile = {
  name: '레오 (Leo)',
  role: '초보 보물 사냥꾼',
  avatarIcon: '🤠',
  color: 'amber',
  hat: '사파리 탐험모',
  badge: '신입 헌터',
};

export const DEFAULT_PROGRESS: UserProgress = {
  currentStageId: 1,
  unlockedStageIds: [1],
  stageScores: {},
  stageStars: {},
  collectedTreasures: [],
  availableKeys: 3, // 초기 열쇠 3개 지급 (단계 해금 3개 or 아이템 해금 2개 테스트 가능)
  totalKeys: 3,
  totalCorrect: 0,
  totalQuestionsAnswered: 0,
  unlockedItemIds: ['hat_safari', 'gear_compass'],
  equippedHatId: 'hat_safari',
  equippedGearId: 'gear_compass',
  hunterId: '문법탐험대장#5',
  mistakes: [],
  character: DEFAULT_CHARACTER,
  hasSeenTutorial: false,
};

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      unlockedStageIds: parsed.unlockedStageIds || [1],
      unlockedItemIds: parsed.unlockedItemIds || ['hat_safari', 'gear_compass'],
      equippedHatId: parsed.equippedHatId || 'hat_safari',
      equippedGearId: parsed.equippedGearId || 'gear_compass',
      hunterId: parsed.hunterId || '문법탐험대장#5',
      availableKeys: parsed.availableKeys !== undefined ? parsed.availableKeys : 3,
      totalKeys: parsed.totalKeys !== undefined ? parsed.totalKeys : 3,
      character: { ...DEFAULT_CHARACTER, ...(parsed.character || {}) },
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save progress to localStorage', err);
  }
}

export function recordMistake(
  progress: UserProgress,
  record: Omit<MistakeRecord, 'resolved' | 'timestamp'>
): UserProgress {
  const existingIdx = progress.mistakes.findIndex(
    (m) => m.questionId === record.questionId
  );
  let updatedMistakes = [...progress.mistakes];
  const newRecord: MistakeRecord = {
    ...record,
    timestamp: Date.now(),
    resolved: false,
  };

  if (existingIdx >= 0) {
    updatedMistakes[existingIdx] = newRecord;
  } else {
    updatedMistakes = [newRecord, ...updatedMistakes];
  }

  const updated = {
    ...progress,
    mistakes: updatedMistakes,
  };
  saveProgress(updated);
  return updated;
}

export function resolveMistake(
  progress: UserProgress,
  questionId: string
): UserProgress {
  const updatedMistakes = progress.mistakes.map((m) =>
    m.questionId === questionId ? { ...m, resolved: true } : m
  );
  const updated = {
    ...progress,
    mistakes: updatedMistakes,
  };
  saveProgress(updated);
  return updated;
}
