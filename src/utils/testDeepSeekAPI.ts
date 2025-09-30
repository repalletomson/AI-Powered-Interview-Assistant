// test-deepseek.js
const testAPIKey = async () => {
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;

  try {
    const response = await fetch('https://api.deepseek.com/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      const models = await response.json();
      console.log('✅ API Key is valid! Available models:', models);
    } else {
      console.log('❌ API Key invalid. Status:', response.status);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Create a simple debug script
const debugAPIKey = () => {
  const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
  console.log('🔍 API Key Debug Info:');
  console.log('API Key exists:', !!apiKey);
  console.log('API Key length:', apiKey?.length || 0);
  console.log('API Key starts with:', apiKey?.substring(0, 8) + '...' || 'None');
  console.log('Environment:', process.env.NODE_ENV);
};

debugAPIKey();
testAPIKey();
// // Make it available globally for browser console testing
// if (typeof window !== 'undefined') {
//   (window as any).testDeepSeekAPI = testDeepSeekAPI;
// }