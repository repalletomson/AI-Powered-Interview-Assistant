import { GoogleGenerativeAI } from '@google/generative-ai';
import { Question, Answer } from '@/types';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
if (!apiKey) {
  console.error('NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY is not set. Please add it to your .env.local file.');
}

export class AIService {
  private static genAI = new GoogleGenerativeAI(apiKey || 'demo_key');
  private static model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  private static async callGeminiAPI(prompt: string): Promise<string> {
    try {
      console.log('Making Gemini API call...');
      console.log('API Key present:', !!apiKey);

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      console.log('✅ Gemini API call successful');
      return text.trim();
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }

  static async generateQuestion(
    difficulty: 'easy' | 'medium' | 'hard',
    questionIndex: number,
    resumeData?: {
      skills: string[];
      experience: string[];
      projects: string[];
      technologies: string[];
      text: string;
    }
  ): Promise<Question> {
    try {
      let prompt = '';

      if (resumeData && (resumeData.skills.length > 0 || resumeData.technologies.length > 0 || resumeData.experience.length > 0)) {
        const candidateSkills = resumeData.skills.join(', ');
        const candidateTech = resumeData.technologies.join(', ');

        const difficultyPrompts = {
          easy: `Generate a simple, practical interview question about basic concepts. Focus on fundamental knowledge that can be answered in 20 seconds.`,
          medium: `Generate a practical interview question about intermediate concepts. Should be answerable in 60 seconds with specific examples.`,
          hard: `Generate a focused interview question about advanced concepts. Should be answerable in 120 seconds with clear explanations.`
        };

        // Focus on the most relevant technologies from their resume
        const primaryTech = candidateTech.split(',').slice(0, 3).join(', ') || candidateSkills.split(',').slice(0, 3).join(', ');

        prompt = `${difficultyPrompts[difficulty]}

Candidate's Primary Technologies: ${primaryTech}

Requirements for ${difficulty} level:
- Question MUST be about: ${primaryTech || 'JavaScript, React, Node.js'}
- Keep it simple and focused on ONE concept
- Should be practical and commonly used in projects
- Answerable within the time limit (${difficulty === 'easy' ? '20' : difficulty === 'medium' ? '60' : '120'} seconds)
- Ask about HOW they use it in their projects
- Avoid complex system design questions
- Focus on practical implementation

Examples of good questions:
- Easy: "How do you handle state in React components?"
- Medium: "Explain how you would fetch data from an API in React"
- Hard: "How do you optimize React component performance?"

Generate ONE focused question following this pattern. Respond with just the question text.`;
      } else {
        const difficultyPrompts = {
          easy: 'Generate a simple, practical question about basic full-stack concepts that can be answered in 20 seconds.',
          medium: 'Generate a focused question about intermediate full-stack concepts that can be answered in 60 seconds with examples.',
          hard: 'Generate a specific question about advanced full-stack concepts that can be answered in 120 seconds with clear explanations.'
        };

        prompt = `${difficultyPrompts[difficulty]}

Focus on these common full-stack technologies:
- Frontend: JavaScript, React, HTML/CSS
- Backend: Node.js, Express, APIs
- Database: MongoDB, SQL basics
- Tools: Git, npm/yarn

Requirements for ${difficulty} level:
- Keep it simple and focused on ONE concept
- Should be practical and commonly used
- Answerable within ${difficulty === 'easy' ? '20' : difficulty === 'medium' ? '60' : '120'} seconds
- Ask about practical implementation, not theory
- Avoid complex system design
- Focus on "how do you..." or "explain how..." format

Examples:
- Easy: "What is the difference between let and const in JavaScript?"
- Medium: "How do you handle form validation in React?"
- Hard: "How do you implement authentication in a Node.js application?"

Generate ONE focused question. Respond with just the question text.`;
      }

      const questionText = await this.callGeminiAPI(prompt);

      const timeMap = { easy: 20, medium: 60, hard: 120 };

      return {
        id: `${difficulty}-${questionIndex}-${Date.now()}`,
        question: questionText,
        difficulty,
        maxTime: timeMap[difficulty],
        category: `Full Stack Development - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`
      };
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      console.log('🔄 Using fallback question instead - interview will continue normally');

      const fallbackQuestions = {
        easy: [
          'What is the difference between let, const, and var in JavaScript?',
          'How do you create a functional component in React?',
          'What is the purpose of the useState hook?',
          'How do you handle click events in React?',
          'What is the difference between == and === in JavaScript?',
          'How do you import and export modules in JavaScript?'
        ],
        medium: [
          'How do you fetch data from an API in React?',
          'Explain how useEffect works in React with an example.',
          'How do you handle form validation in a React application?',
          'What is the difference between props and state in React?',
          'How do you create a REST API endpoint in Node.js?',
          'How do you connect a React app to a database?'
        ],
        hard: [
          'How do you implement user authentication in a full-stack application?',
          'Explain how you would optimize a slow React application.',
          'How do you handle error boundaries in React?',
          'How do you implement real-time features using WebSockets?',
          'How do you secure API endpoints in Node.js?',
          'How do you implement pagination in a React application?'
        ]
      };

      const questions = fallbackQuestions[difficulty];
      const questionText = questions[questionIndex % questions.length];
      const timeMap = { easy: 20, medium: 60, hard: 120 };

      return {
        id: `fallback-${difficulty}-${questionIndex}`,
        question: questionText,
        difficulty,
        maxTime: timeMap[difficulty],
        category: `Full Stack Development - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`
      };
    }
  }

  static async evaluateAnswer(question: string, answer: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<{ score: number; feedback: string }> {
    if (!answer.trim()) {
      return { score: 0, feedback: 'No answer provided.' };
    }

    try {
      const prompt = `You are a friendly technical interviewer evaluating a full-stack developer candidate's answer.

Question (${difficulty} level): ${question}

Candidate's Answer: ${answer}

Evaluate this answer focusing on:
- Technical accuracy (is it correct?)
- Practical knowledge (do they understand how to use it?)
- Clarity (is the explanation clear?)
- Appropriate depth for ${difficulty} level

Scoring guide:
- 8-10: Excellent answer with correct technical details
- 6-7: Good answer with minor gaps or unclear parts
- 4-5: Basic understanding but missing key details
- 1-3: Some understanding but significant errors
- 0: No meaningful answer

Provide encouraging feedback that helps them learn:
- Acknowledge what they got right
- Gently point out areas to improve
- Give specific learning suggestions

Respond in this exact format:
SCORE: [number from 0-10]
FEEDBACK: [your encouraging feedback here]`;

      const text = await this.callGeminiAPI(prompt);

      const scoreMatch = text.match(/SCORE:\s*(\d+)/);
      const feedbackMatch = text.match(/FEEDBACK:\s*([\s\S]+)/);

      const score = scoreMatch ? parseInt(scoreMatch[1]) : this.getFallbackScore(answer, difficulty);
      const feedback = feedbackMatch ? feedbackMatch[1].trim() : this.getFallbackFeedback(answer, difficulty);

      return { score: Math.min(10, Math.max(0, score)), feedback };
    } catch (error) {
      console.error('Error evaluating answer:', error);
      return this.getFallbackEvaluation(answer, difficulty);
    }
  }

  static async generateFinalSummary(answers: Answer[]): Promise<{ score: number; summary: string }> {
    const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
    const averageScore = totalScore / answers.length;
    const finalScore = Math.round(averageScore * 10);

    try {
      const answersText = answers.map((answer, index) =>
        `Question ${index + 1} (${answer.difficulty}): ${answer.question}
Answer: ${answer.answer}
Score: ${answer.score}/10
Feedback: ${answer.feedback}`
      ).join('\n\n');

      const prompt = `You are an expert technical interviewer providing a final evaluation summary.

Interview Results:
${answersText}

Overall Score: ${finalScore}/100

Please provide a comprehensive summary (3-4 sentences) that includes:
1. Overall assessment of technical skills
2. Key strengths demonstrated
3. Areas for improvement
4. Hiring recommendation

Be professional, constructive, and specific.`;

      const summary = await this.callGeminiAPI(prompt);

      return { score: finalScore, summary };
    } catch (error) {
      console.error('Error generating summary:', error);
      return this.getFallbackSummary(finalScore);
    }
  }

  // Fallback methods
  private static getFallbackScore(answer: string, difficulty: 'easy' | 'medium' | 'hard'): number {
    const answerLength = answer.trim().length;
    let baseScore = 0;

    if (difficulty === 'easy') {
      baseScore = Math.min(10, Math.floor(answerLength / 20) + 3);
    } else if (difficulty === 'medium') {
      baseScore = Math.min(10, Math.floor(answerLength / 30) + 2);
    } else {
      baseScore = Math.min(10, Math.floor(answerLength / 50) + 1);
    }

    return baseScore;
  }

  private static getFallbackFeedback(answer: string, difficulty: 'easy' | 'medium' | 'hard'): string {
    const score = this.getFallbackScore(answer, difficulty);

    if (score >= 7) {
      return 'Good understanding demonstrated. Your answer shows solid technical knowledge.';
    } else if (score >= 4) {
      return 'Decent attempt but could benefit from more detail and specific examples.';
    } else {
      return 'Answer needs more depth and technical accuracy. Consider reviewing the fundamentals.';
    }
  }

  private static getFallbackEvaluation(answer: string, difficulty: 'easy' | 'medium' | 'hard'): { score: number; feedback: string } {
    const score = this.getFallbackScore(answer, difficulty);
    const feedback = this.getFallbackFeedback(answer, difficulty);
    return { score, feedback };
  }

  private static getFallbackSummary(finalScore: number): { score: number; summary: string } {
    let summary = '';

    if (finalScore >= 80) {
      summary = 'Excellent candidate with strong technical skills and clear communication. Demonstrates deep understanding of full-stack concepts.';
    } else if (finalScore >= 60) {
      summary = 'Good candidate with solid fundamentals and practical knowledge. Shows potential with some areas for improvement in advanced concepts.';
    } else if (finalScore >= 40) {
      summary = 'Average candidate with basic understanding of core concepts. Needs improvement in technical depth and problem-solving approach.';
    } else {
      summary = 'Below average performance with significant gaps in technical knowledge and communication skills.';
    }

    return { score: finalScore, summary };
  }
}