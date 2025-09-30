# AI Interview Assistant - Crisp

A modern, AI-powered interview platform built for full-stack developer interviews. This application provides a comprehensive solution for conducting technical interviews with real-time AI evaluation and candidate management.

## 🚀 Features

### For Interviewees
- **Smart Resume Detection**: Only accepts valid resume PDFs with fuzzy matching for sections like Experience, Skills, Projects, etc.
- **Resume-Based Questioning**: AI generates personalized questions based on candidate's actual skills and technologies
- **Intelligent Information Extraction**: Automatically extracts name, email, phone, skills, experience, and technologies from resumes
- **Interactive Chat Interface**: Real-time conversation with context-aware AI interviewer
- **Adaptive Questioning**: Questions dynamically adjust to candidate's background and expertise
- **Timed Questions**: 6 questions with difficulty progression (Easy → Medium → Hard)
- **Progress Tracking**: Visual progress indicators and time management
- **Smart Session Management**: Welcome modal only shows when switching tabs or revisiting, not during active interviews

### For Interviewers
- **Candidate Dashboard**: Comprehensive overview of all candidates
- **Real-time Scoring**: AI-powered evaluation with detailed feedback
- **Search & Filter**: Find candidates by name, email, or score
- **Detailed Analytics**: View complete interview history and chat logs
- **Export Capabilities**: Download candidate data and reports

### Technical Features
- **Responsive Design**: Modern UI with Tailwind CSS and Framer Motion animations
- **State Management**: Redux Toolkit with persistence
- **Real-time Updates**: Synchronized data between tabs
- **Error Handling**: Graceful error management and user feedback
- **Performance Optimized**: Lazy loading and efficient rendering

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **State Management**: Redux Toolkit, Redux Persist
- **File Processing**: PDF.js, Mammoth.js
- **Icons**: Lucide React
- **Deployment**: Vercel/Netlify ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-interview-assistant.git
   cd ai-interview-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with one click

### Netlify
1. Build the project: `npm run build`
2. Deploy the `out` folder to Netlify

### Manual Deployment
```bash
npm run build
npm run export
```

## 📋 Usage

### Starting an Interview
1. Navigate to the **Interviewee** tab
2. Upload your resume (PDF or DOCX)
3. Complete any missing information
4. Begin the 6-question interview process
5. Answer questions within the time limits

### Reviewing Candidates
1. Switch to the **Interviewer** tab
2. View all candidates sorted by score
3. Click "View Details" to see complete interview data
4. Use search and filters to find specific candidates

## 🎯 Interview Process

The interview consists of 6 personalized questions with progressive difficulty:

- **Questions 1-2**: Easy (20 seconds each) - Based on fundamental skills from resume
- **Questions 3-4**: Medium (60 seconds each) - Deeper dive into stated technologies
- **Questions 5-6**: Hard (120 seconds each) - Advanced problem-solving in their expertise areas

### Smart Question Generation
- **Resume-Driven**: Questions are generated based on candidate's actual skills and experience
- **Technology-Specific**: Focuses on technologies mentioned in their resume
- **Experience-Appropriate**: Difficulty matches their stated experience level
- **Context-Aware**: Avoids generic questions, asks about their specific background

Each answer is evaluated by AI with:
- Score out of 10
- Detailed feedback
- Final summary and overall score

## 🔧 Configuration

### AI Service
The application uses Google Gemini AI (FREE!) for dynamic question generation and evaluation:

1. **Get your free API key:** https://aistudio.google.com/
2. **Add to `.env.local`:** `NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY=your_key_here`
3. **See detailed setup:** Check `GEMINI_API_SETUP.md` for step-by-step instructions
4. **Free tier limits:** 15 requests/minute, 1,500/day, 1M tokens/month
5. **Automatic fallback:** Uses predefined questions if API fails

### Resume Parsing & Detection
Resume parsing supports:
- **PDF files**: Using PDF.js
- **DOCX files**: Using Mammoth.js
- **Smart Resume Detection**: Validates documents contain resume-like content
- **Fuzzy Section Matching**: Detects variations of Experience, Skills, Projects, Education, etc.
- **Comprehensive Field Extraction**: Name, email, phone, skills, technologies, experience, projects
- **Technology Recognition**: Identifies programming languages, frameworks, and tools
- **False Positive Prevention**: Rejects non-resume documents (recipes, articles, etc.)

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Smooth Animations**: Framer Motion powered transitions
- **Loading States**: Visual feedback during processing
- **Error Handling**: User-friendly error messages
- **Accessibility**: WCAG compliant design

## 🔒 Data Persistence

All data is stored locally using:
- **Redux Persist**: Automatic state persistence
- **Local Storage**: Browser-based data storage
- **Session Recovery**: Resume interrupted interviews

## 🧪 Testing

### Resume Detection Testing
You can test the resume detection functionality in the browser console:

```javascript
// Open browser console and run:
testResumeDetection();
```

This will run a comprehensive test suite that validates:
- ✅ Valid resumes are correctly identified
- ❌ Non-resume documents are rejected
- 🔍 Edge cases and minimal resumes
- 📊 Success rate and detailed results

### Google Gemini API Testing
Test your Gemini API connection:

```javascript
// Open browser console and run:
testGeminiAPI();
```

This will verify:
- ✅ API key is properly configured
- 🔗 Connection to Google Gemini API works
- 📝 AI response generation is functional
- 🆓 Free tier usage is working

### Unit Tests
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📈 Performance

- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Optimized bundle sizes
- **Caching**: Efficient data caching strategies
- **Optimization**: Production-ready builds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Swipe**: For the internship opportunity
- **Next.js Team**: For the amazing framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Framer Motion**: For smooth animations

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Email: your-email@example.com

---

**Built with ❤️ for the Swipe Internship Assignment**