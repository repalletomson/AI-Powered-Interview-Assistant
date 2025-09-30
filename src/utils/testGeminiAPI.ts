// Test utility for Google Gemini API using official SDK
import { GoogleGenerativeAI } from '@google/generative-ai';

export const testGeminiAPI = async () => {
  console.log("🧪 Testing Google Gemini API...");

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY is not set!");
    console.log("Please add your Gemini API key to your .env.local file:");
    console.log("NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY=your_api_key_here");
    console.log("Get your free API key from: https://aistudio.google.com/");
    return false;
  }

  if (apiKey === 'your_gemini_api_key_here') {
    console.error("❌ Please replace the placeholder API key with your actual Gemini API key!");
    console.log("Get your free API key from: https://aistudio.google.com/");
    return false;
  }

  console.log("✅ API Key found");
  console.log("API Key length:", apiKey.length);

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    console.log("🚀 Testing API call...");

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent('Say hello in a friendly way');
    const response = result.response;
    const text = response.text();

    console.log("✅ API Test Successful!");
    console.log("Response:", text);

    return true;
  } catch (error) {
    console.error("❌ API Test Failed:", error);

    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('403')) {
        console.log("💡 Check your API key - it might be invalid or you need to enable the Gemini API");
        console.log("Make sure you got your key from: https://aistudio.google.com/");
      } else if (error.message.includes('429')) {
        console.log("💡 Rate limit exceeded - try again in a moment");
      } else if (error.message.includes('400')) {
        console.log("💡 Bad request - check the API endpoint and request format");
      } else if (error.message.includes('404') && error.message.includes('models/')) {
        console.log("💡 Model not found - trying with gemini-1.5-pro instead...");

        // Try with a different model
        try {
          const model2 = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
          const result2 = await model2.generateContent('Say hello in a friendly way');
          const response2 = result2.response;
          const text2 = response2.text();

          console.log("✅ API Test Successful with gemini-1.5-pro!");
          console.log("Response:", text2);
          console.log("💡 Update your code to use 'gemini-1.5-pro' instead of 'gemini-pro'");
          return true;
        } catch (error2) {
          console.log("❌ gemini-1.5-pro also failed, trying gemini-1.5-flash...");

          try {
            const model3 = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result3 = await model3.generateContent('Say hello in a friendly way');
            const response3 = result3.response;
            const text3 = response3.text();

            console.log("✅ API Test Successful with gemini-1.5-flash!");
            console.log("Response:", text3);
            console.log("💡 Update your code to use 'gemini-1.5-flash' instead of 'gemini-pro'");
            return true;
          } catch (error3) {
            console.log("❌ All model attempts failed");
          }
        }
      }
    }

    return false;
  }
};

// Function to list available models
export const listGeminiModels = async () => {
  console.log("📋 Listing available Gemini models...");

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.error("❌ API key not configured");
    return;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Available models:", data.models?.map((m: any) => m.name) || []);

    // Filter for generateContent capable models
    const generateModels = data.models?.filter((m: any) =>
      m.supportedGenerationMethods?.includes('generateContent')
    );

    console.log("Models that support generateContent:");
    generateModels?.forEach((model: any) => {
      console.log(`- ${model.name.replace('models/', '')}`);
    });

  } catch (error) {
    console.error("Failed to list models:", error);
  }
};

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testGeminiAPI = testGeminiAPI;
  (window as any).listGeminiModels = listGeminiModels;
}