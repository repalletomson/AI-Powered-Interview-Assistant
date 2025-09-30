import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InterviewState, Candidate, Question, Answer, ChatMessage } from '@/types';

const initialState: InterviewState = {
  currentCandidate: null,
  candidates: [],
  isInterviewActive: false,
  currentQuestion: null,
  timeRemaining: 0,
  showWelcomeBack: false,
  activeTab: 'interviewee',
  timer: {
    isRunning: false,
    startTime: null,
    pausedAt: null,
    totalDuration: 0,
    remaining: 0,
    lastUpdated: null,
  },
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setCurrentCandidate: (state, action: PayloadAction<Candidate>) => {
      state.currentCandidate = action.payload;
    },
    addCandidate: (state, action: PayloadAction<Candidate>) => {
      state.candidates.push(action.payload);
    },
    updateCandidate: (state, action: PayloadAction<Partial<Candidate> & { id: string }>) => {
      const index = state.candidates.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.candidates[index] = { ...state.candidates[index], ...action.payload };
      }
      if (state.currentCandidate?.id === action.payload.id) {
        state.currentCandidate = { ...state.currentCandidate, ...action.payload };
      }
    },
    startInterview: (state) => {
      state.isInterviewActive = true;
      if (state.currentCandidate) {
        state.currentCandidate.status = 'in-progress';
      }
    },
    endInterview: (state) => {
      state.isInterviewActive = false;
      if (state.currentCandidate) {
        state.currentCandidate.status = 'completed';
        state.currentCandidate.completedAt = new Date().toISOString();
      }
    },
    setCurrentQuestion: (state, action: PayloadAction<Question>) => {
      state.currentQuestion = action.payload;
      state.timeRemaining = action.payload.maxTime;
    },
    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload;
    },
    addAnswer: (state, action: PayloadAction<Answer>) => {
      if (state.currentCandidate) {
        state.currentCandidate.answers.push(action.payload);
        state.currentCandidate.currentQuestionIndex += 1;
      }
    },
    addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
      if (state.currentCandidate) {
        state.currentCandidate.chatHistory.push(action.payload);
      }
    },
    setShowWelcomeBack: (state, action: PayloadAction<boolean>) => {
      state.showWelcomeBack = action.payload;
    },
    resetCurrentSession: (state) => {
      state.currentCandidate = null;
      state.isInterviewActive = false;
      state.currentQuestion = null;
      state.timeRemaining = 0;
    },
    clearChatHistory: (state) => {
      if (state.currentCandidate) {
        state.currentCandidate.chatHistory = [];
      }
    },
    setActiveTab: (state, action: PayloadAction<'interviewee' | 'interviewer'>) => {
      const newTab = action.payload;
      const currentTime = Date.now();

      // Initialize timer if it doesn't exist
      if (!state.timer) {
        state.timer = {
          isRunning: false,
          startTime: null,
          pausedAt: null,
          totalDuration: 0,
          remaining: 0,
          lastUpdated: null,
        };
      }

      // Handle timer state when switching tabs
      if (state.activeTab === 'interviewee' && newTab === 'interviewer') {
        // Pause timer when leaving interviewee tab
        if (state.timer.isRunning) {
          state.timer.isRunning = false;
          state.timer.pausedAt = currentTime;
          state.timer.lastUpdated = currentTime;
        }
      } else if (state.activeTab === 'interviewer' && newTab === 'interviewee') {
        // Resume timer when returning to interviewee tab
        if (state.timer.pausedAt && state.currentQuestion) {
          const pausedDuration = currentTime - state.timer.pausedAt;
          // Don't subtract paused time from remaining time
          state.timer.isRunning = true;
          state.timer.pausedAt = null;
          state.timer.lastUpdated = currentTime;
        }
      }

      state.activeTab = newTab;
    },
    initializeTimer: (state, action: PayloadAction<{ duration: number; startTime: number }>) => {
      const { duration, startTime } = action.payload;
      state.timer = {
        isRunning: true,
        startTime,
        pausedAt: null,
        totalDuration: duration,
        remaining: duration,
        lastUpdated: startTime,
      };
    },
    pauseTimer: (state) => {
      if (state.timer && state.timer.isRunning) {
        const currentTime = Date.now();
        state.timer.isRunning = false;
        state.timer.pausedAt = currentTime;
        state.timer.lastUpdated = currentTime;
      }
    },
    resumeTimer: (state) => {
      if (state.timer && !state.timer.isRunning && state.timer.pausedAt) {
        const currentTime = Date.now();
        state.timer.isRunning = true;
        state.timer.pausedAt = null;
        state.timer.lastUpdated = currentTime;
      }
    },
    updateTimerRemaining: (state, action: PayloadAction<number>) => {
      if (!state.timer) {
        state.timer = {
          isRunning: false,
          startTime: null,
          pausedAt: null,
          totalDuration: 0,
          remaining: action.payload,
          lastUpdated: Date.now(),
        };
      } else {
        state.timer.remaining = action.payload;
        state.timer.lastUpdated = Date.now();
      }
      state.timeRemaining = action.payload; // Keep backward compatibility
    },
  },
});

export const {
  setCurrentCandidate,
  addCandidate,
  updateCandidate,
  startInterview,
  endInterview,
  setCurrentQuestion,
  updateTimeRemaining,
  addAnswer,
  addChatMessage,
  setShowWelcomeBack,
  resetCurrentSession,
  clearChatHistory,
  setActiveTab,
  initializeTimer,
  pauseTimer,
  resumeTimer,
  updateTimerRemaining,
} = interviewSlice.actions;

export default interviewSlice.reducer;