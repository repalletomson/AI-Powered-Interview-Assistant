'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { setCurrentCandidate, addCandidate, addChatMessage, updateCandidate } from '@/store/slices/interviewSlice';
import { Candidate, ChatMessage } from '@/types';
import { ExtractedInfo } from '@/utils/resumeParser';
import ResumeUpload from './ResumeUpload';
import ChatInterface from './ChatInterface';

export default function IntervieweeTab() {
  const dispatch = useDispatch();
  const { currentCandidate } = useSelector((state: RootState) => state.interview);
  const [step, setStep] = useState<'upload' | 'info' | 'interview'>('upload');
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [hasShownWelcomeBack, setHasShownWelcomeBack] = useState(false);

  const addMessage = (type: 'user' | 'bot' | 'system', content: string) => {
    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type,
      content,
      timestamp: new Date().toISOString()
    };
    dispatch(addChatMessage(message));
  };

  // Check if there's an existing candidate and show welcome back message
  useEffect(() => {
    if (currentCandidate && !hasShownWelcomeBack) {
      setStep('interview');
      setHasShownWelcomeBack(true);
      
      // Add welcome back message if they have chat history
      if (currentCandidate.chatHistory.length > 0) {
        setTimeout(() => {
          addMessage('bot', `Welcome back, ${currentCandidate.name}! You can continue your interview here. 👋`);
        }, 500);
      }
    } else if (!currentCandidate) {
      setStep('upload');
      setHasShownWelcomeBack(false);
    }
  }, [currentCandidate, hasShownWelcomeBack]);

  const [resumeData, setResumeData] = useState<ExtractedInfo | null>(null);

  const handleResumeUploaded = (info: ExtractedInfo, file: File) => {
    setResumeData(info);
    
    const missing: string[] = [];
    if (!info.name) missing.push('name');
    if (!info.email) missing.push('email');
    if (!info.phone) missing.push('phone');

    setFormData({
      name: info.name || '',
      email: info.email || '',
      phone: info.phone || ''
    });

    if (missing.length > 0) {
      setMissingFields(missing);
      setStep('info');
    } else {
      createCandidate(info.name!, info.email!, info.phone!, file, info);
    }
  };

  const createCandidate = (name: string, email: string, phone: string, file?: File, resumeInfo?: ExtractedInfo) => {
    const candidate: Candidate = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      resumeData: resumeInfo ? {
        skills: resumeInfo.skills,
        experience: resumeInfo.experience,
        projects: resumeInfo.projects,
        technologies: resumeInfo.technologies,
        text: resumeInfo.text,
        fileName: file?.name
      } : undefined,
      score: 0,
      summary: '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      currentQuestionIndex: 0,
      answers: [],
      chatHistory: [],
      hasSeenWelcome: false,
      hasBeenPromptedToStart: false
    };

    console.log('👤 Creating new candidate:', candidate);
    dispatch(addCandidate(candidate));
    dispatch(setCurrentCandidate(candidate));
    console.log('✅ Candidate added to store');
    setStep('interview');
    
    // Add personalized welcome message based on resume
    setTimeout(() => {
      let welcomeMessage = `Hello ${name}! Welcome to your personalized interview.`;
      
      if (resumeInfo && resumeInfo.technologies.length > 0) {
        const topTech = resumeInfo.technologies.slice(0, 3).join(', ');
        welcomeMessage += ` I see you have experience with ${topTech}. I'll be asking you questions tailored to your background.`;
        
        // Add summary of what was detected
        const detectedInfo = [];
        if (resumeInfo.skills.length > 0) detectedInfo.push(`${resumeInfo.skills.length} skills`);
        if (resumeInfo.technologies.length > 0) detectedInfo.push(`${resumeInfo.technologies.length} technologies`);
        if (resumeInfo.experience.length > 0) detectedInfo.push(`${resumeInfo.experience.length} experience entries`);
        if (resumeInfo.projects.length > 0) detectedInfo.push(`${resumeInfo.projects.length} projects`);
        
        if (detectedInfo.length > 0) {
          welcomeMessage += `\n\n📋 Detected from your resume: ${detectedInfo.join(', ')}.`;
        }
      } else {
        welcomeMessage += ` I'll be asking you general full-stack developer questions since I couldn't extract specific technologies from your resume.`;
      }
      
      welcomeMessage += `\n\nI'll ask you 6 questions: 2 easy, 2 medium, and 2 hard. Each question has a time limit and will be based on your actual skills and experience.

Please type "ready" or "start" when you're ready to begin the interview.`;
      
      addMessage('bot', welcomeMessage);
      
      // Mark that we've prompted them to start
      setTimeout(() => {
        dispatch(updateCandidate({ 
          id: candidate.id, 
          hasBeenPromptedToStart: true 
        }));
      }, 1000);
    }, 500);
  };



  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, phone } = formData;
    
    if (!name.trim() || !email.trim() || !phone.trim()) {
      return;
    }

    createCandidate(name.trim(), email.trim(), phone.trim(), undefined, resumeData || undefined);
  };

  if (step === 'upload') {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <ResumeUpload onResumeUploaded={handleResumeUploaded} />
      </div>
    );
  }

  if (step === 'info') {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Complete Your Information</h2>
            <p className="text-slate-300">Please provide the missing information to continue</p>
          </div>

          <form onSubmit={handleInfoSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name {missingFields.includes('name') && <span className="text-red-400">*</span>}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
                required={missingFields.includes('name')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address {missingFields.includes('email') && <span className="text-red-400">*</span>}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email address"
                required={missingFields.includes('email')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number {missingFields.includes('phone') && <span className="text-red-400">*</span>}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number"
                required={missingFields.includes('phone')}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 shadow-lg"
            >
              Start Interview
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <ChatInterface />
    </div>
  );
}