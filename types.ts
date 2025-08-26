export interface PracticeQuestion {
  type: 'mcq' | 'essay';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface FormData {
  subject: string;
  grade: string;
  textbook: string;
  mainTopic: string;
  learningObjectives: string;
  mcqCount: number;
  essayCount: number;
  mcqDifficulty: string;
}

export interface SummaryData {
  topicOverview: string;
  coreConcepts: string[];
  keyFacts?: string[];
  formulas?: string[];
  examples: string[];
  memoryTips: string[];
  studySuggestions: string;
  practiceTest: PracticeQuestion[];
}