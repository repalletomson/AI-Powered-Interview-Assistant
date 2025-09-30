# 🚀 Get Your FREE Google Gemini API Key

## Step-by-Step Guide

### 1. Go to Google AI Studio
Visit: **https://aistudio.google.com/**

### 2. Sign In
- Click "Sign in" in the top right
- Use your Google account (Gmail, etc.)

### 3. Get API Key
- Once signed in, look for "Get API key" button
- Click on it
- You might see "Create API key" - click that
- Choose "Create API key in new project" (recommended)

### 4. Copy Your API Key
- Your API key will look something like: `AIzaSyC7Xm9kL8N2P4Q6R8S0T2U4V6W8X0Y2Z4A`
- Copy this key

### 5. Add to Your Project
Open your `.env.local` file and replace:
```bash
NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

With your actual key:
```bash
NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY=AIzaSyC7Xm9kL8N2P4Q6R8S0T2U4V6W8X0Y2Z4A
```

### 6. Test Your Setup
1. Save the `.env.local` file
2. Restart your development server (`npm run dev`)
3. Open browser console
4. Run: `testGeminiAPI()`

You should see:
```
🧪 Testing Google Gemini API...
✅ API Key found
🚀 Testing API call...
✅ API Test Successful!
Response: Hello! It's great to meet you...
```

## 🆓 Free Tier Limits
- **15 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**
- **No credit card required**

## 🔒 Security Note
The API key will be visible in your browser since it's a `NEXT_PUBLIC_` variable. This is normal for client-side applications. Google Gemini API keys can be restricted by domain for security.

## 🆘 Troubleshooting

### "API key not valid" Error
- Double-check you copied the entire key
- Make sure there are no extra spaces
- Verify you're using the key from https://aistudio.google.com/

### "403 Forbidden" Error
- Your API key might not have Gemini API enabled
- Try creating a new API key
- Check if you need to accept terms of service

### Still Having Issues?
1. Try using `gemini-pro` instead of `gemini-1.5-flash` in the code
2. Make sure you're signed into the correct Google account
3. Clear browser cache and try again

## 🎉 Once Working
Your AI Interview Assistant will have:
- ✅ Dynamic questions based on resumes
- ✅ AI-powered answer evaluation
- ✅ Intelligent final summaries
- ✅ All completely FREE!