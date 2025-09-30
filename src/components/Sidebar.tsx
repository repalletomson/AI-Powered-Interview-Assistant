'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Users, 
  FileText, 
  Clock, 
  User,
  ChevronLeft,
  ChevronRight,
  Brain
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'interviewee' | 'interviewer';
  onTabChange: (tab: 'interviewee' | 'interviewer') => void;
  currentCandidate?: {
    name: string;
    currentQuestionIndex: number;
  } | null;
  timeRemaining: number;
  isTimerActive: boolean;
  onChangeResume: () => void;
}

export default function Sidebar({ 
  activeTab, 
  onTabChange, 
  currentCandidate,
  timeRemaining,
  isTimerActive,
  onChangeResume 
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const tabs = [
    {
      id: 'interviewee' as const,
      label: 'Interviewee',
      icon: MessageSquare,
      description: 'Take the interview'
    },
    {
      id: 'interviewer' as const,
      label: 'Interviewer',
      icon: Users,
      description: 'Review candidates'
    }
  ];

  return (
    <>
      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isCollapsed ? -240 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-full bg-black border-r border-gray-800/50 z-40"
        style={{ width: isCollapsed ? '40px' : '280px' }}
      >
        {/* Collapse Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full flex items-center justify-center transition-colors z-50"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-400" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-400" />
          )}
        </motion.button>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-6 h-full flex flex-col"
            >
              {/* Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">AI Interview</h1>
                  <p className="text-xs text-gray-400">Coach Platform</p>
                </div>
              </div>

              {/* User Info */}
              {currentCandidate && (
                <div className="bg-gray-900/50 rounded-xl p-4 mb-6 border border-gray-800/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {currentCandidate.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Question {currentCandidate.currentQuestionIndex + 1}/6
                      </p>
                    </div>
                  </div>

                  {/* Timer */}
                  {activeTab === 'interviewee' && (
                    <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-3">
                      <Clock className={`w-4 h-4 ${
                        timeRemaining <= 10 ? 'text-red-400' : 
                        isTimerActive ? 'text-cyan-400' : 'text-yellow-400'
                      }`} />
                      <span className={`font-mono font-semibold ${
                        timeRemaining <= 10 ? 'text-red-400' : 
                        isTimerActive ? 'text-cyan-400' : 'text-yellow-400'
                      }`}>
                        {formatTime(timeRemaining)}
                      </span>
                      {!isTimerActive && (
                        <span className="text-xs text-yellow-400 ml-1">
                          (paused)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab Navigation */}
              <div className="space-y-2 mb-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon size={20} />
                      <div className="text-left flex-1">
                        <div className={`font-medium ${isActive ? 'text-white' : ''}`}>
                          {tab.label}
                        </div>
                        <div className="text-xs opacity-75">
                          {tab.description}
                        </div>
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="w-2 h-2 bg-cyan-400 rounded-full"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Actions */}
              {currentCandidate && (
                <div className="mt-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onChangeResume}
                    className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded-xl transition-all duration-200 border border-gray-700/50"
                  >
                    <FileText size={16} />
                    <span className="text-sm font-medium">Change Resume</span>
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed State */}
        {isCollapsed && (
          <div className="p-2 h-full flex flex-col items-center">
            {/* Collapsed Logo */}
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mb-6 mt-4">
              <Brain className="w-5 h-5 text-white" />
            </div>

            {/* Collapsed Tabs */}
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onTabChange(tab.id)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }`}
                    title={tab.label}
                  >
                    <Icon size={16} />
                  </motion.button>
                );
              })}
            </div>

            {/* Collapsed Timer */}
            {currentCandidate && activeTab === 'interviewee' && (
              <div className="mt-4 w-8 h-8 flex items-center justify-center">
                <Clock className={`w-4 h-4 ${
                  timeRemaining <= 10 ? 'text-red-400' : 
                  isTimerActive ? 'text-cyan-400' : 'text-yellow-400'
                }`} />
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
}