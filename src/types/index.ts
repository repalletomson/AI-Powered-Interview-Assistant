export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeData?: {
    skills: string[];
    experience: string[];
    projects: string[];
    technologies: string[];
    text: string;
    fileName?: string; // Store just the filename for reference
  };
  score: number;
  summary: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  completedAt?: string;
  currentQuestionIndex: number;
  answers: Answer[];
  chatHistory: ChatMessage[];
  hasSeenWelcome?: boolean;
  hasBeenPromptedToStart?: boolean;
}

export interface Answer {
  questionId: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeSpent: number;
  maxTime: number;
  score: number;
  feedback: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: string;
}

export interface Question {
  id: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  maxTime: number;
  category: string;
}

export interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  pausedAt: number | null;
  totalDuration: number;
  remaining: number;
  lastUpdated: number | null;
}

export interface InterviewState {
  currentCandidate: Candidate | null;
  candidates: Candidate[];
  isInterviewActive: boolean;
  currentQuestion: Question | null;
  timeRemaining: number;
  showWelcomeBack: boolean;
  activeTab: 'interviewee' | 'interviewer';
  timer: TimerState;
}