"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { Search, Eye, Trophy, Clock, User, ArrowLeft } from "lucide-react";
import { Candidate } from "@/types";
import {
  setActiveTab,
  resetCurrentSession,
  addCandidate,
} from "@/store/slices/interviewSlice";
import Sidebar from "./Sidebar";

export default function InterviewerDashboard() {
  const dispatch = useDispatch();
  const { candidates, activeTab, currentCandidate, timeRemaining, timer } =
    useSelector((state: RootState) => state.interview);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "date">("score");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );

  // Debug: Log candidates data
  console.log('InterviewerDashboard - Candidates:', candidates);
  console.log('InterviewerDashboard - Candidates length:', candidates.length);

  // Add sample data for testing if no candidates exist
  const addSampleData = () => {
    const sampleCandidate = {
      id: 'sample-' + Date.now(),
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      score: 85,
      summary: 'Strong candidate with excellent React and Node.js skills. Demonstrated good understanding of full-stack development concepts and provided clear, practical answers.',
      status: 'completed' as const,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      currentQuestionIndex: 6,
      answers: [
        {
          questionId: 'q1',
          question: 'What is the difference between let, const, and var in JavaScript?',
          answer: 'let and const are block-scoped while var is function-scoped. const cannot be reassigned after declaration, let can be reassigned, and var can be both reassigned and redeclared.',
          difficulty: 'easy' as const,
          timeSpent: 15,
          maxTime: 20,
          score: 9,
          feedback: 'Excellent answer! You clearly understand the scoping differences and reassignment rules.'
        },
        {
          questionId: 'q2',
          question: 'How do you fetch data from an API in React?',
          answer: 'I use useEffect hook with fetch or axios to make API calls. I also handle loading states and errors properly.',
          difficulty: 'medium' as const,
          timeSpent: 45,
          maxTime: 60,
          score: 8,
          feedback: 'Good understanding of React hooks and API integration. Could mention cleanup for better practices.'
        }
      ],
      chatHistory: [
        {
          id: 'msg1',
          type: 'bot' as const,
          content: 'Welcome to your interview!',
          timestamp: new Date().toISOString()
        },
        {
          id: 'msg2',
          type: 'user' as const,
          content: 'ready',
          timestamp: new Date().toISOString()
        }
      ],
      resumeData: {
        skills: ['JavaScript', 'React', 'Node.js'],
        technologies: ['React', 'Node.js', 'MongoDB'],
        experience: ['Frontend Developer at Tech Corp'],
        projects: ['E-commerce Platform', 'Task Management App'],
        text: 'Experienced full-stack developer...'
      }
    };

    dispatch(addCandidate(sampleCandidate));
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

  const filteredAndSortedCandidates = candidates
    .filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "score") {
        return b.score - a.score;
      } else {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-900/30 text-green-400 border border-green-800/50";
      case "in-progress":
        return "bg-blue-900/30 text-blue-400 border border-blue-800/50";
      default:
        return "bg-gray-700 text-gray-300 border border-gray-600";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  if (selectedCandidate) {
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:ml-[280px] sidebar-margin">
          {/* Header */}
          <div className="bg-gray-900/50 border-b border-gray-800/50 p-6">
            <div className="flex items-center gap-4 mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCandidate(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-white"
              >
                <ArrowLeft size={20} />
              </motion.button>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedCandidate.name}
                </h2>
                <p className="text-gray-300">{selectedCandidate.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-800/50">
                <p className="text-sm text-blue-400 font-medium">Final Score</p>
                <p
                  className={`text-2xl font-bold ${getScoreColor(
                    selectedCandidate.score
                  )}`}
                >
                  {selectedCandidate.score}/100
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                <p className="text-sm text-gray-300 font-medium">Status</p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    selectedCandidate.status
                  )}`}
                >
                  {selectedCandidate.status}
                </span>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                <p className="text-sm text-gray-300 font-medium">
                  Questions Answered
                </p>
                <p className="text-2xl font-bold text-white">
                  {selectedCandidate.answers.length}/6
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                <p className="text-sm text-gray-300 font-medium">
                  Interview Date
                </p>
                <p className="text-sm text-gray-200">
                  {new Date(selectedCandidate.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-black">
            {/* Summary */}
            {selectedCandidate.summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6"
              >
                <h3 className="text-lg font-semibold text-white mb-3">
                  AI Summary
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {selectedCandidate.summary}
                </p>
              </motion.div>
            )}

            {/* Questions and Answers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Questions & Answers
              </h3>
              <div className="space-y-6">
                {selectedCandidate.answers.map((answer, index) => (
                  <div
                    key={answer.questionId}
                    className="border-l-4 border-blue-600 pl-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">
                        Question {index + 1} ({answer.difficulty.toUpperCase()})
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>
                          Score:{" "}
                          <span
                            className={`font-semibold ${getScoreColor(
                              answer.score * 10
                            )}`}
                          >
                            {answer.score}/10
                          </span>
                        </span>
                        <span>
                          Time: {Math.floor(answer.timeSpent / 60)}:
                          {(answer.timeSpent % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-3">{answer.question}</p>
                    <div className="bg-gray-700 p-3 rounded-lg mb-2 border border-gray-600">
                      <p className="text-gray-200">{answer.answer}</p>
                    </div>
                    <p className="text-sm text-blue-400">{answer.feedback}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Chat History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Chat History
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedCandidate.chatHistory.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : message.type === "bot"
                          ? "bg-gray-700 text-gray-100"
                          : "bg-yellow-900/30 text-yellow-300 border border-yellow-800/50"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentCandidate={currentCandidate || undefined}
        timeRemaining={timeRemaining}
        isTimerActive={timer?.isRunning === true && activeTab === "interviewee"}
        onChangeResume={handleChangeResume}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-[280px] sidebar-margin">
        {/* Header */}
        <div className="bg-gray-900/50 border-b border-gray-800/50 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Interviewer Dashboard
              </h2>
              <p className="text-gray-300">
                Manage and review candidate interviews
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Trophy size={16} />
                <span>
                  {candidates.filter((c) => c.status === "completed").length}{" "}
                  completed
                </span>
              </div>
              
              {/* Add sample data button for testing */}
              {candidates.length === 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addSampleData}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Add Sample Data
                </motion.button>
              )}
            </div>
          </div>

          {/* Search and Sort */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "score" | "date")}
              className="px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="score">Sort by Score</option>
              <option value="date">Sort by Date</option>
            </select>
          </div>
        </div>

        {/* Candidates List */}
        <div className="flex-1 overflow-y-auto p-6 bg-black">
          {filteredAndSortedCandidates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No candidates found
              </h3>
              <p className="text-gray-400">
                Candidates will appear here once they start interviews
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {filteredAndSortedCandidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800 rounded-lg border border-gray-700 hover:shadow-md hover:shadow-gray-900/50 transition-shadow p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {candidate.name}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              candidate.status
                            )}`}
                          >
                            {candidate.status}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-2">{candidate.email}</p>
                        <p className="text-sm text-gray-400">
                          {candidate.phone}
                        </p>

                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Trophy size={14} />
                            <span
                              className={`font-semibold ${getScoreColor(
                                candidate.score
                              )}`}
                            >
                              {candidate.score}/100
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>
                              {new Date(
                                candidate.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <span>{candidate.answers.length}/6 questions</span>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCandidate(candidate)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
                      >
                        <Eye size={16} />
                        View Details
                      </motion.button>
                    </div>

                    {candidate.summary && (
                      <div className="mt-4 p-3 bg-gray-700 rounded-lg border border-gray-600">
                        <p className="text-sm text-gray-300 line-clamp-2">
                          {candidate.summary}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
