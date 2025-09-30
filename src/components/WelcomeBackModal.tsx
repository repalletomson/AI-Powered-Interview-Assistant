'use client';

import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setShowWelcomeBack, resetCurrentSession, updateCandidate } from '@/store/slices/interviewSlice';
import { X, Play, RotateCcw } from 'lucide-react';

export default function WelcomeBackModal() {
  const dispatch = useDispatch();
  const { showWelcomeBack, currentCandidate } = useSelector((state: RootState) => state.interview);

  if (!showWelcomeBack || !currentCandidate) return null;

  const handleContinue = () => {
    if (currentCandidate) {
      dispatch(updateCandidate({ id: currentCandidate.id, hasSeenWelcome: true }));
    }
    dispatch(setShowWelcomeBack(false));
  };

  const handleStartOver = () => {
    dispatch(resetCurrentSession());
    dispatch(setShowWelcomeBack(false));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800/95 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-700/50 backdrop-blur-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Welcome Back!</h2>
          <button
            onClick={() => {
              if (currentCandidate) {
                dispatch(updateCandidate({ id: currentCandidate.id, hasSeenWelcome: true }));
              }
              dispatch(setShowWelcomeBack(false));
            }}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-slate-300 mb-4">
            We found an unfinished interview session for <strong className="text-white">{currentCandidate.name}</strong>.
          </p>
          <div className="bg-emerald-900/30 p-4 rounded-lg border border-emerald-800/50">
            <p className="text-sm text-emerald-300">
              Progress: {currentCandidate.currentQuestionIndex}/6 questions completed
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            <Play size={18} />
            Continue Interview
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartOver}
            className="flex-1 bg-slate-700 text-slate-200 py-3 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 border border-slate-600"
          >
            <RotateCcw size={18} />
            Start Over
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}