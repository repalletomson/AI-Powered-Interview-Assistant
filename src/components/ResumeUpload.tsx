'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { parseResume, ExtractedInfo } from '@/utils/resumeParser';

interface ResumeUploadProps {
  onResumeUploaded: (info: ExtractedInfo, file: File) => void;
}

export default function ResumeUpload({ onResumeUploaded }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF or DOCX file only.');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const extractedInfo = await parseResume(file);
      
      // Show brief success message with detected info
      console.log('Resume processed successfully:', {
        skills: extractedInfo.skills.length,
        technologies: extractedInfo.technologies.length,
        experience: extractedInfo.experience.length,
        projects: extractedInfo.projects.length
      });
      
      onResumeUploaded(extractedInfo, file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process resume.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-800/50"
        >
          <FileText className="w-8 h-8 text-emerald-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Upload Your Resume</h2>
        <p className="text-slate-300">Upload your resume to start the interview process</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragging
            ? 'border-emerald-500 bg-emerald-900/20'
            : 'border-slate-600 hover:border-emerald-500 hover:bg-slate-800/50'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileInput}
          className="hidden"
          id="resume-upload"
          disabled={isProcessing}
        />
        
        <label htmlFor="resume-upload" className="cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center"
          >
            {isProcessing ? (
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
            ) : (
              <Upload className="w-12 h-12 text-slate-400 mb-4" />
            )}
            
            <p className="text-lg font-medium text-white mb-2">
              {isProcessing ? 'Processing...' : 'Drop your resume here'}
            </p>
            <p className="text-sm text-slate-400">
              or click to browse (PDF, DOCX - Max 10MB)
            </p>
          </motion.div>
        </label>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-900/30 border border-red-800/50 rounded-lg flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </motion.div>
      )}
    </motion.div>
  );
}