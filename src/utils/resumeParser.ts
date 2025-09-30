import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

export interface ExtractedInfo {
  name?: string;
  email?: string;
  phone?: string;
  text: string;
  skills: string[];
  experience: string[];
  projects: string[];
  technologies: string[];
  isValidResume: boolean;
}

export async function parseResume(file: File): Promise<ExtractedInfo> {
  let text = '';
  
  try {
    if (file.type === 'application/pdf') {
      text = await parsePDF(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await parseDOCX(file);
    } else {
      throw new Error('Unsupported file format. Please upload PDF or DOCX files only.');
    }

    const extractedInfo = extractResumeInfo(text);
    
    if (!extractedInfo.isValidResume) {
      throw new Error('This document does not appear to be a resume. Please upload a valid resume with sections like Experience, Skills, or Projects.');
    }

    return extractedInfo;
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}

async function parsePDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');
    text += pageText + '\n';
  }

  return text;
}

async function parseDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

function extractResumeInfo(text: string): ExtractedInfo {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  
  // Simple name extraction - look for capitalized words at the beginning
  const nameRegex = /^([A-Z][a-z]+\s+[A-Z][a-z]+)/m;
  
  const emails = text.match(emailRegex);
  const phones = text.match(phoneRegex);
  const names = text.match(nameRegex);

  // Check if this is a valid resume
  const isValidResume = isResumeDocument(text);
  
  // Extract skills, experience, projects, and technologies
  const skills = extractSkills(text);
  const experience = extractExperience(text);
  const projects = extractProjects(text);
  const technologies = extractTechnologies(text);

  return {
    name: names?.[0]?.trim(),
    email: emails?.[0]?.trim(),
    phone: phones?.[0]?.trim(),
    text: text.trim(),
    skills,
    experience,
    projects,
    technologies,
    isValidResume
  };
}

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

function extractSkills(text: string): string[] {
  const skills: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Find skills section
  const skillsMatch = lowerText.match(/(?:skills|technical skills|core competencies|expertise|proficiencies)[:\s]*([^]*?)(?=\n\s*[a-z]+:|$)/i);
  
  if (skillsMatch) {
    const skillsText = skillsMatch[1];
    // Extract individual skills (comma-separated or bullet points)
    const extractedSkills = skillsText
      .split(/[,•\n\r]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 2 && skill.length < 50)
      .slice(0, 20); // Limit to 20 skills
    
    skills.push(...extractedSkills);
  }
  
  return skills;
}

function extractExperience(text: string): string[] {
  const experience: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Find experience section
  const expMatch = lowerText.match(/(?:experience|work experience|professional experience|employment)[:\s]*([^]*?)(?=\n\s*[a-z]+:|$)/i);
  
  if (expMatch) {
    const expText = expMatch[1];
    // Extract job titles and companies
    const jobMatches = expText.match(/([a-z\s]+(?:engineer|developer|manager|analyst|specialist|consultant|lead|senior|junior)[a-z\s]*)/gi);
    if (jobMatches) {
      experience.push(...jobMatches.slice(0, 10));
    }
  }
  
  return experience;
}

function extractProjects(text: string): string[] {
  const projects: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Find projects section
  const projectsMatch = lowerText.match(/(?:projects|personal projects|key projects|portfolio)[:\s]*([^]*?)(?=\n\s*[a-z]+:|$)/i);
  
  if (projectsMatch) {
    const projectsText = projectsMatch[1];
    // Extract project names (usually at the beginning of lines)
    const projectMatches = projectsText.match(/^[•\-\*]?\s*([a-z][a-z\s]{5,50})/gim);
    if (projectMatches) {
      projects.push(...projectMatches.map(p => p.replace(/^[•\-\*]?\s*/, '').trim()).slice(0, 10));
    }
  }
  
  return projects;
}

function extractTechnologies(text: string): string[] {
  const technologies: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Common technologies to look for
  const techKeywords = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
    'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt.js',
    'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
    'html', 'css', 'sass', 'scss', 'tailwind',
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins',
    'git', 'github', 'gitlab', 'bitbucket',
    'graphql', 'rest', 'api', 'microservices',
    'tensorflow', 'pytorch', 'machine learning', 'ai'
  ];
  
  for (const tech of techKeywords) {
    if (lowerText.includes(tech)) {
      technologies.push(tech);
    }
  }
  
  return [...new Set(technologies)]; // Remove duplicates
}