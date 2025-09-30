"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { Send, User, Bot } from "lucide-react";
import {
  addChatMessage,
  addAnswer,
  setCurrentQuestion,
  updateTimeRemaining,
  endInterview,
  updateCandidate,
  startInterview,
  clearChatHistory,
  resetCurrentSession,
  setActiveTab,
} from "@/store/slices/interviewSlice";
import { AIService } from "@/utils/aiService";
import { ChatMessage, Answer } from "@/types";
import Sidebar from "./Sidebar";

export default function ChatInterface() {
  const dispatch = useDispatch();
  const {
    currentCandidate,
    currentQuestion,
    timeRemaining,
    isInterviewActive,
    activeTab,
    timer,
  } = useSelector((state: RootState) => state.interview);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [userAnswer, setUserAnswer] = useState(""); // Store the user's actual answer
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentCandidate?.chatHistory]);

  // Page visibility detection for timer pausing
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
      console.log("Page visibility changed:", !document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Also handle window focus/blur
    const handleFocus = () => setIsPageVisible(true);
    const handleBlur = () => setIsPageVisible(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Clean up any duplicate messages on component mount
  useEffect(() => {
    if (currentCandidate?.chatHistory) {
      const seenIds = new Set();
      const hasDuplicates = currentCandidate.chatHistory.some((msg) => {
        if (seenIds.has(msg.id)) {
          return true;
        }
        seenIds.add(msg.id);
        return false;
      });

      if (hasDuplicates) {
        console.log("Clearing chat history due to duplicate IDs");
        dispatch(clearChatHistory());
      }
    }
  }, [currentCandidate?.id, dispatch]);

  const addMessage = useCallback(
    (type: "user" | "bot" | "system", content: string) => {
      const message: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        type,
        content,
        timestamp: new Date().toISOString(),
      };
      dispatch(addChatMessage(message));
    },
    [dispatch]
  );

  const completeInterview = useCallback(async () => {
    if (!currentCandidate) return;

    console.log(
      "🎯 Completing interview for candidate:",
      currentCandidate.name
    );
    console.log("📊 Candidate answers:", currentCandidate.answers);

    addMessage(
      "bot",
      "Interview completed! Generating your final score and summary..."
    );

    try {
      const finalResult = await AIService.generateFinalSummary(
        currentCandidate.answers
      );

      console.log("✅ Final result generated:", finalResult);

      dispatch(
        updateCandidate({
          id: currentCandidate.id,
          score: finalResult.score,
          summary: finalResult.summary,
          status: "completed",
          completedAt: new Date().toISOString(),
        })
      );

      console.log("📝 Candidate updated with completed status");

      dispatch(endInterview());
      addMessage(
        "bot",
        `Final Score: ${finalResult.score}/100\n\nSummary: ${finalResult.summary}`
      );
    } catch {
      addMessage(
        "system",
        "Error generating final results. Please contact support."
      );
    }
  }, [currentCandidate, dispatch, addMessage]);

  const startInterviewProcess = useCallback(async () => {
    if (!currentCandidate || isGeneratingQuestion) return;

    setIsGeneratingQuestion(true);
    dispatch(startInterview());
    addMessage(
      "bot",
      "🚀 Starting your interview! Generating your first question..."
    );

    try {
      const firstQuestion = await AIService.generateQuestion(
        "easy",
        0,
        currentCandidate.resumeData
      );
      dispatch(setCurrentQuestion(firstQuestion));
      addMessage(
        "bot",
        `**Question 1/6 (EASY) - ${firstQuestion.maxTime}s**\n\n${firstQuestion.question}\n\n⏰ Timer starts when you begin typing your answer.`
      );
    } catch {
      addMessage(
        "system",
        "⚠️ AI service temporarily unavailable. Using pre-selected questions - your interview will continue normally!"
      );
      // Fallback first question
      const fallbackQuestion = {
        id: "fallback-easy-0",
        question:
          "Explain the difference between let, const, and var in JavaScript.",
        difficulty: "easy" as const,
        maxTime: 20,
        category: "JavaScript Fundamentals",
      };
      dispatch(setCurrentQuestion(fallbackQuestion));
      addMessage(
        "bot",
        `**Question 1/6 (EASY) - ${fallbackQuestion.maxTime}s**\n\n${fallbackQuestion.question}\n\n⏰ Timer starts when you begin typing your answer.`
      );
    } finally {
      setIsGeneratingQuestion(false);
    }
  }, [currentCandidate, dispatch, addMessage, isGeneratingQuestion]);

  const loadNextQuestion = useCallback(async () => {
    if (!currentCandidate || isGeneratingQuestion) {
      console.log(
        "⚠️ Skipping question generation - already in progress or no candidate"
      );
      return;
    }

    console.log("🔄 Loading next question - preventing concurrent calls");
    setIsGeneratingQuestion(true);

    const questionIndex = currentCandidate.currentQuestionIndex + 1;
    let difficulty: "easy" | "medium" | "hard";

    if (questionIndex < 2) difficulty = "easy";
    else if (questionIndex < 4) difficulty = "medium";
    else difficulty = "hard";

    addMessage(
      "bot",
      `🎯 Generating ${difficulty} question ${questionIndex + 1}/6...`
    );

    try {
      const question = await AIService.generateQuestion(
        difficulty,
        questionIndex,
        currentCandidate.resumeData
      );
      dispatch(setCurrentQuestion(question));
      addMessage(
        "bot",
        `**Question ${questionIndex + 1}/6 (${difficulty.toUpperCase()}) - ${
          question.maxTime
        }s**\n\n${
          question.question
        }\n\n⏰ Timer starts when you begin typing your answer.`
      );
    } catch {
      addMessage(
        "system",
        "⚠️ AI service temporarily unavailable. Using pre-selected question - interview continues normally!"
      );
      // Fallback question generation
      const fallbackQuestions = {
        easy: "Explain the difference between let, const, and var in JavaScript.",
        medium:
          "How would you optimize the performance of a React application?",
        hard: "Design a scalable architecture for a real-time messaging system.",
      };

      const fallbackQuestion = {
        id: `fallback-${difficulty}-${questionIndex}`,
        question: fallbackQuestions[difficulty],
        difficulty,
        maxTime:
          difficulty === "easy" ? 20 : difficulty === "medium" ? 60 : 120,
        category: "Full Stack Development",
      };

      dispatch(setCurrentQuestion(fallbackQuestion));
      addMessage(
        "bot",
        `**Question ${questionIndex + 1}/6 (${difficulty.toUpperCase()}) - ${
          fallbackQuestion.maxTime
        }s**\n\n${
          fallbackQuestion.question
        }\n\n⏰ Timer starts when you begin typing your answer.`
      );
    } finally {
      setIsGeneratingQuestion(false);
      console.log("✅ Question generation completed");
    }
  }, [currentCandidate, dispatch, addMessage, isGeneratingQuestion]);

  const submitAnswer = useCallback(
    async (answer: string, timeSpent: number) => {
      if (!currentQuestion || !currentCandidate) return;

      setIsLoading(true);
      addMessage("bot", "🤖 Evaluating your answer with AI...");

      try {
        const evaluation = await AIService.evaluateAnswer(
          currentQuestion.question,
          answer,
          currentQuestion.difficulty
        );

        const answerObj: Answer = {
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          answer,
          difficulty: currentQuestion.difficulty,
          timeSpent,
          maxTime: currentQuestion.maxTime,
          score: evaluation.score,
          feedback: evaluation.feedback,
        };

        dispatch(addAnswer(answerObj));
        addMessage(
          "bot",
          `✅ Score: ${evaluation.score}/10\n\n📝 Feedback: ${evaluation.feedback}`
        );

        // Add a small delay before proceeding
        setTimeout(async () => {
          // Check if interview is complete
          if (currentCandidate.currentQuestionIndex + 1 >= 6) {
            await completeInterview();
          } else {
            addMessage("bot", "Loading next question...");
            setTimeout(async () => {
              await loadNextQuestion();
            }, 1000);
          }
        }, 2000);
      } catch {
        addMessage(
          "system",
          "⚠️ AI evaluation service temporarily unavailable. Using basic scoring - interview continues!"
        );
        // Still try to continue with a basic evaluation
        const basicScore = Math.min(
          10,
          Math.max(1, Math.floor(answer.length / 20))
        );
        const answerObj: Answer = {
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          answer,
          difficulty: currentQuestion.difficulty,
          timeSpent,
          maxTime: currentQuestion.maxTime,
          score: basicScore,
          feedback:
            "AI feedback temporarily unavailable. Your answer has been recorded and scored based on length and content.",
        };
        dispatch(addAnswer(answerObj));

        // Add a small delay before proceeding
        setTimeout(async () => {
          if (currentCandidate.currentQuestionIndex + 1 >= 6) {
            await completeInterview();
          } else {
            addMessage("bot", "Loading next question...");
            setTimeout(async () => {
              await loadNextQuestion();
            }, 1000);
          }
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    },
    [
      currentQuestion,
      currentCandidate,
      dispatch,
      addMessage,
      completeInterview,
      loadNextQuestion,
      isGeneratingQuestion,
    ]
  );

  const handleTimeUp = useCallback(async () => {
    if (!currentQuestion || !currentCandidate) return;

    // Use the stored user answer, not whatever is currently in the input
    const answer = userAnswer.trim() || "No answer provided (time expired)";
    console.log("Time up! Submitting answer:", answer);

    await submitAnswer(answer, currentQuestion.maxTime);
    setInputValue("");
    setUserAnswer(""); // Clear the stored answer
  }, [currentQuestion, currentCandidate, userAnswer, submitAnswer]);

  // Separate effect for timer countdown - only run when page is visible and user started typing
  useEffect(() => {
    if (
      isInterviewActive &&
      currentQuestion &&
      timeRemaining > 0 &&
      timerStarted &&
      isPageVisible // Only run timer when page is visible
    ) {
      console.log(
        `Timer running: ${timeRemaining}s remaining (started: ${timerStarted}, visible: ${isPageVisible})`
      );
      timerRef.current = setTimeout(() => {
        dispatch(updateTimeRemaining(timeRemaining - 1));
      }, 1000);
    } else {
      // Log why timer is not running
      if (!isInterviewActive)
        console.log("Timer not running: interview not active");
      else if (!currentQuestion)
        console.log("Timer not running: no current question");
      else if (timeRemaining <= 0)
        console.log("Timer not running: time expired");
      else if (!timerStarted)
        console.log(
          "Timer not running: not started yet (waiting for user to type)"
        );
      else if (!isPageVisible)
        console.log("Timer not running: page not visible");
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [
    timeRemaining,
    isInterviewActive,
    currentQuestion,
    timerStarted,
    isPageVisible,
    dispatch,
  ]);

  // Reset timer when new question is loaded
  useEffect(() => {
    if (currentQuestion) {
      console.log("New question loaded, resetting timer state");
      setTimerStarted(false);
      setUserAnswer(""); // Clear any previous answer
      // Make sure timeRemaining is set to the question's maxTime
      if (timeRemaining !== currentQuestion.maxTime) {
        console.log(
          `Setting timer to ${currentQuestion.maxTime}s for new question`
        );
        dispatch(updateTimeRemaining(currentQuestion.maxTime));
      }
    }
  }, [currentQuestion?.id, dispatch]); // Only depend on question ID to avoid unnecessary resets

  // Separate effect for handling time up to avoid circular dependencies
  useEffect(() => {
    if (
      timeRemaining === 0 &&
      currentQuestion &&
      isInterviewActive &&
      !isLoading
    ) {
      handleTimeUp();
    }
  }, [
    timeRemaining,
    currentQuestion,
    isInterviewActive,
    isLoading,
    handleTimeUp,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const answer = inputValue.trim().toLowerCase();
    const originalInput = inputValue.trim();

    // Check if user is ready to start interview
    if (
      !isInterviewActive &&
      !currentQuestion &&
      (answer === "ready" || answer === "start" || answer === "yes")
    ) {
      addMessage("user", originalInput);
      setInputValue("");
      await startInterviewProcess();
      return;
    }

    // Handle interview answers
    if (currentQuestion && isInterviewActive) {
      const timeSpent = currentQuestion.maxTime - timeRemaining;
      addMessage("user", originalInput);
      setInputValue("");
      setUserAnswer(""); // Clear the stored answer since we're submitting
      setTimerStarted(false); // Reset timer for next question
      await submitAnswer(originalInput, timeSpent);
      return;
    }

    // Handle other messages - only if not waiting for ready/start
    addMessage("user", originalInput);
    setInputValue("");

    // Only show the ready prompt if we're not in an active interview, no question is loaded,
    // and we haven't already prompted them to start
    if (
      !isInterviewActive &&
      !currentQuestion &&
      currentCandidate &&
      !currentCandidate.hasBeenPromptedToStart
    ) {
      dispatch(
        updateCandidate({
          id: currentCandidate.id,
          hasBeenPromptedToStart: true,
        })
      );
      addMessage(
        "bot",
        'Please type "ready" or "start" when you\'re ready to begin the interview.'
      );
    }
  };

  const handleTabChange = (tab: "interviewee" | "interviewer") => {
    dispatch(setActiveTab(tab));
  };

  const handleChangeResume = () => {
    if (
      confirm(
        "Are you sure you want to change your resume? This will restart your interview session."
      )
    ) {
      dispatch(resetCurrentSession());
      window.location.reload();
    }
  };

  if (!currentCandidate) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400">No active interview session</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentCandidate={currentCandidate}
        timeRemaining={timeRemaining}
        isTimerActive={timer?.isRunning === true && activeTab === "interviewee"}
        onChangeResume={handleChangeResume}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col lg:ml-[280px] sidebar-margin">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {currentCandidate.chatHistory.map((message, index) => (
              <motion.div
                key={`${message.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-4 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-4 max-w-[80%] ${
                    message.type === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                        : message.type === "bot"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500"
                        : "bg-gray-600"
                    }`}
                  >
                    {message.type === "user" ? (
                      <User size={18} className="text-white" />
                    ) : (
                      <Bot size={18} className="text-white" />
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-2xl ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                        : message.type === "bot"
                        ? "bg-gray-900/80 text-gray-100 border border-gray-800/50"
                        : "bg-yellow-900/30 text-yellow-300 border border-yellow-800/50"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                    <p className="text-xs opacity-70 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="bg-gray-900/80 p-4 rounded-2xl border border-gray-800/50">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {activeTab === "interviewee" && (
          <div className="border-t border-gray-800/50 p-6">
            {/* Test button for completing interview */}
            {currentCandidate && currentCandidate.answers.length === 0 && (
              <div className="mb-4 text-center">
                <button
                  onClick={async () => {
                    // Add some sample answers for testing
                    const sampleAnswers = [
                      {
                        questionId: "test-1",
                        question: "What is React?",
                        answer:
                          "React is a JavaScript library for building user interfaces.",
                        difficulty: "easy" as const,
                        timeSpent: 15,
                        maxTime: 20,
                        score: 8,
                        feedback: "Good basic understanding of React.",
                      },
                    ];

                    // Update candidate with sample answers
                    dispatch(
                      updateCandidate({
                        id: currentCandidate.id,
                        answers: sampleAnswers,
                        currentQuestionIndex: 6,
                      })
                    );

                    // Complete the interview
                    await completeInterview();
                  }}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded text-sm"
                >
                  🧪 Test Complete Interview
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setInputValue(newValue);

                  // If we're in an active interview with a question, store this as the user's answer
                  if (currentQuestion && isInterviewActive) {
                    setUserAnswer(newValue);

                    // Start timer when user starts typing an answer (even a single character)
                    if (!timerStarted && newValue.length > 0) {
                      console.log(
                        "Starting timer for question:",
                        currentQuestion.id,
                        "Timer was started:",
                        timerStarted,
                        "Input length:",
                        newValue.length
                      );
                      setTimerStarted(true);
                    }
                  }
                }}
                placeholder={
                  !isInterviewActive
                    ? "Type 'ready' to start the interview..."
                    : currentQuestion
                    ? "Type your answer..."
                    : "Waiting for next question..."
                }
                className="flex-1 p-4 border border-gray-700 bg-gray-900/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400 text-lg"
                disabled={isLoading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Send size={24} />
              </motion.button>
            </form>
          </div>
        )}

        {/* Interviewer Tab Content */}
        {activeTab === "interviewer" && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Interviewer Dashboard
              </h2>
              <p className="text-gray-400">
                Switch to Interviewee tab to continue the interview
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
