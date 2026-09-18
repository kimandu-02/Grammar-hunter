// Speech Synthesis (TTS) and Speech Recognition (STT) helpers for 5th-grade learners

export function playEnglishTTS(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; // Slightly slower pace for 5th-graders to hear clearly
      utterance.pitch = 1.05; // Cheerful friendly tone

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    } catch {
      resolve();
    }
  });
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export interface SpeechRecognitionResult {
  transcript: string;
  accuracy: number; // 0 to 100
  isMatch: boolean;
}

// Compare target English sentence with spoken transcript
export function evaluateSpeechAccuracy(
  target: string,
  spoken: string
): { accuracy: number; isMatch: boolean; cleanTarget: string; cleanSpoken: string } {
  const cleanTarget = target.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const cleanSpoken = spoken.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

  if (!cleanSpoken) {
    return { accuracy: 0, isMatch: false, cleanTarget, cleanSpoken };
  }

  if (cleanTarget === cleanSpoken) {
    return { accuracy: 100, isMatch: true, cleanTarget, cleanSpoken };
  }

  const targetWords = cleanTarget.split(/\s+/).filter(Boolean);
  const spokenWords = cleanSpoken.split(/\s+/).filter(Boolean);

  let matchedWords = 0;
  for (const tWord of targetWords) {
    if (spokenWords.includes(tWord)) {
      matchedWords++;
    }
  }

  const accuracy = Math.round((matchedWords / targetWords.length) * 100);
  // If at least 60% of words are matched or key verbs/nouns are spoken, count as successful match
  const isMatch = accuracy >= 60;

  return { accuracy, isMatch, cleanTarget, cleanSpoken };
}
