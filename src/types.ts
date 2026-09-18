export type QuestionType =
  | 'choice'
  | 'reorder'
  | 'error_spot'
  | 'fill_blank'
  | 'speaking'; // 말하기 STEP (듣고 따라 말하기)

export interface Question {
  id: string;
  stageId: number;
  type: QuestionType;
  question: string; // STEP 지시문 (예: 빈칸에 들어갈 알맞은 be동사를 고르세요. / 원어민 소리를 듣고 큰 소리로 따라 말하세요!)
  sentence?: string; // STEP 문장 또는 빈칸 있는 문장
  speechTarget?: string; // 말하기 목표 영어 문장 (예: "I am ready for the adventure.")
  koreanMeaning?: string; // 한국어 의미
  options?: string[]; // 선택지 (문장 선택, 오류 찾기, 빈칸 등)
  words?: string[]; // 단어 배열용 단어 조각들
  correctAnswer: string; // 정답 문자열 또는 선택지 텍스트
  explanation: string; // 초등 5학년 눈높이 설명
  hint: string; // 막혔을 때 보는 힌트
  grammarPoint: string; // 핵심 문법 개념 한 줄
}

export interface TreasureItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  lore: string;
}

export interface Stage {
  id: number;
  title: string;
  theme: string;
  locationName: string;
  locationIcon: string;
  targetGrammar: string;
  grammarSummary: string;
  grammarRules: { rule: string; example: string }[];
  questions: Question[]; // 각 STEP 목록
  treasure: TreasureItem;
}

export interface MistakeRecord {
  questionId: string;
  stageId: number;
  question: Question;
  selectedWrongAnswer: string;
  timestamp: number;
  resolved: boolean;
}

export interface EquippableItem {
  id: string;
  name: string;
  category: 'hat' | 'gear';
  emoji: string;
  costKeys: number; // 아이템 하나당 열쇠 2개
  description: string;
}

export interface CharacterProfile {
  name: string;
  role: string;
  avatarIcon: string;
  color: string;
  hat: string;
  badge: string;
}

export interface LeaderboardPlayer {
  id: string;
  username: string;
  avatarIcon: string;
  equippedHatEmoji?: string;
  equippedGearEmoji?: string;
  score: number;
  badge?: string;
  tier?: string;
  streakDays?: number;
  rank: number;
  isUser?: boolean;
}

export interface UserProgress {
  currentStageId: number;
  unlockedStageIds: number[];
  stageScores: Record<number, number>;
  stageStars: Record<number, number>;
  collectedTreasures: string[];
  availableKeys: number; // 현재 사용 가능한 보유 열쇠 (상점 2개 / 단계 3개 소모)
  totalKeys: number; // 누적 획득 열쇠
  totalCorrect: number;
  totalQuestionsAnswered: number;
  unlockedItemIds: string[]; // 해금된 장비 아이템 ID들
  equippedHatId: string; // 장착된 모자 ID
  equippedGearId: string; // 장착된 장비 ID
  hunterId: string; // 커뮤니티용 탐험가 아이디 (예: 초등5_문법대장)
  mistakes: MistakeRecord[];
  character: CharacterProfile;
  hasSeenTutorial: boolean;
}
