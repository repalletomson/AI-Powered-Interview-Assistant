// Test utility for resume detection functionality
// This can be used in the browser console to test resume parsing

export const testResumeDetection = () => {
  // Test cases for resume detection
  const testCases = [
    {
      name: "Valid Resume 1",
      text: `
        John Doe
        john.doe@email.com
        (555) 123-4567
        
        PROFESSIONAL SUMMARY
        Full Stack Developer with 5 years of experience
        
        TECHNICAL SKILLS
        JavaScript, React, Node.js, Python, SQL, MongoDB
        
        WORK EXPERIENCE
        Senior Software Engineer - Tech Corp (2020-2023)
        - Developed web applications using React and Node.js
        - Managed database systems and API integrations
        
        PROJECTS
        E-commerce Platform - Built using React and Express
        Task Management App - Full stack application
        
        EDUCATION
        Bachelor of Computer Science - University (2018)
      `,
      shouldBeValid: true
    },
    {
      name: "Valid Resume 2",
      text: `
        Jane Smith
        jane@example.com
        
        EXPERIENCE
        Frontend Developer at StartupXYZ
        Backend Developer at BigCorp
        
        SKILLS
        React, Vue.js, TypeScript, Docker, AWS
        
        ACHIEVEMENTS
        Led team of 5 developers
        Increased performance by 40%
      `,
      shouldBeValid: true
    },
    {
      name: "Invalid Document - Recipe",
      text: `
        Chocolate Chip Cookies Recipe
        
        INGREDIENTS
        2 cups flour
        1 cup sugar
        1/2 cup butter
        2 eggs
        
        INSTRUCTIONS
        1. Preheat oven to 350°F
        2. Mix dry ingredients
        3. Add wet ingredients
        4. Bake for 12 minutes
      `,
      shouldBeValid: false
    },
    {
      name: "Invalid Document - News Article",
      text: `
        Breaking News: Technology Advances
        
        In recent developments, artificial intelligence has made significant strides.
        Companies are investing heavily in machine learning and automation.
        
        The market has responded positively to these innovations.
        Experts predict continued growth in the tech sector.
      `,
      shouldBeValid: false
    },
    {
      name: "Edge Case - Minimal Resume",
      text: `
        Bob Johnson
        bob@email.com
        
        EXPERIENCE
        Software Developer - 2 years
        
        SKILLS
        JavaScript, HTML, CSS
      `,
      shouldBeValid: true
    }
  ];

  console.log("🧪 Testing Resume Detection...\n");
  
  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    // Import the function dynamically since this is a test utility
    const isValid = isResumeDocument(testCase.text);
    const result = isValid === testCase.shouldBeValid ? "✅ PASS" : "❌ FAIL";
    
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log(`Expected: ${testCase.shouldBeValid ? "Valid Resume" : "Invalid Document"}`);
    console.log(`Got: ${isValid ? "Valid Resume" : "Invalid Document"}`);
    console.log(`Result: ${result}\n`);
    
    if (isValid === testCase.shouldBeValid) {
      passed++;
    } else {
      failed++;
    }
  });

  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  console.log(`Success Rate: ${Math.round((passed / testCases.length) * 100)}%`);
  
  return { passed, failed, total: testCases.length };
};

// Copy of the resume detection function for testing
function isResumeDocument(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  // Resume section indicators with fuzzy matching
  const resumeSections = [
    // Experience variations
    'experience', 'work experience', 'professional experience', 'employment', 'work history',
    'career history', 'professional background', 'employment history',
    
    // Skills variations
    'skills', 'technical skills', 'core competencies', 'expertise', 'proficiencies',
    'technologies', 'programming languages', 'tools', 'frameworks',
    
    // Education variations
    'education', 'academic background', 'qualifications', 'degrees', 'certifications',
    'certificates', 'training', 'coursework',
    
    // Projects variations
    'projects', 'personal projects', 'key projects', 'notable projects', 'portfolio',
    'achievements', 'accomplishments', 'highlights',
    
    // Summary variations
    'summary', 'profile', 'objective', 'about', 'overview', 'professional summary',
    'career objective', 'personal statement'
  ];
  
  // Count how many resume indicators are found
  let sectionCount = 0;
  for (const section of resumeSections) {
    if (lowerText.includes(section)) {
      sectionCount++;
    }
  }
  
  // Additional checks for resume-like content
  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
  const hasYears = /\b(20\d{2}|19\d{2})\b/.test(text); // Years indicating work experience
  const hasTechTerms = /\b(javascript|python|react|node|sql|html|css|java|c\+\+|angular|vue|typescript|mongodb|postgresql|aws|docker|kubernetes|git)\b/i.test(text);
  
  // A document is considered a resume if:
  // - It has at least 2 resume sections, OR
  // - It has at least 1 resume section AND (email OR phone OR years OR tech terms)
  return sectionCount >= 2 || (sectionCount >= 1 && (hasEmail || hasPhone || hasYears || hasTechTerms));
}

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testResumeDetection = testResumeDetection;
}