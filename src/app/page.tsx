'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setShowWelcomeBack, setActiveTab } from '@/store/slices/interviewSlice';
import { Users, MessageSquare, Brain, Sparkles } from 'lucide-react';
import IntervieweeTab from '@/components/IntervieweeTab';
import InterviewerDashboard from '@/components/InterviewerDashboard';
import WelcomeBackModal from '@/components/WelcomeBackModal';
import LandingPage from '@/components/LandingPage';
import ClientOnly from '@/components/ClientOnly';

// Import test utilities for browser console testing
if (typeof window !== 'undefined') {
  import('@/utils/testResumeDetection');
  import('@/utils/testGeminiAPI');
}

export default function Home() {
  const dispatch = useDispatch();
  const { currentCandidate, showWelcomeBack, activeTab } = useSelector((state: RootState) => state.interview);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    // Check for unfinished sessions on load - only show if they have answered at least one question
    // and haven't seen the welcome back modal for this session
    if (currentCandidate && 
        currentCandidate.status === 'in-progress' && 
        currentCandidate.answers.length > 0 &&
        !currentCandidate.hasSeenWelcome) {
      dispatch(setShowWelcomeBack(true));
      setShowLanding(false); // Skip landing if there's an active session
    }
  }, [currentCandidate, dispatch]);

  // Handle tab switching - show welcome back modal when switching to interviewee tab
  // if there's an active session
  useEffect(() => {
    if (activeTab === 'interviewee' && 
        currentCandidate && 
        currentCandidate.status === 'in-progress' && 
        currentCandidate.answers.length > 0 &&
        !currentCandidate.hasSeenWelcome) {
      dispatch(setShowWelcomeBack(true));
    }
  }, [activeTab, currentCandidate, dispatch]);

  const handleStartInterview = () => {
    setShowLanding(false);
    dispatch(setActiveTab('interviewee'));
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

  // Show landing page first, then interview platform
  if (showLanding) {
    return <LandingPage onStartInterview={handleStartInterview} />;
  }

  // Full-screen interview interface
  return (
    <ClientOnly fallback={
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading interview platform...</p>
        </div>
      </div>
    }>
      {activeTab === 'interviewee' ? <IntervieweeTab /> : <InterviewerDashboard />}
      
      {/* Welcome Back Modal */}
      {showWelcomeBack && <WelcomeBackModal />}
    </ClientOnly>
  );
}