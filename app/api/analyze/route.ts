// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { code, language } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: 'No code provided' },
        { status: 400 }
      );
    }

    // Using stable Gemini 1.5 Pro model
    // You can also use "gemini-1.5-flash" for faster responses
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `You are a code complexity analysis expert. Analyze the following ${language} code and return a JSON object with EXACTLY this structure (no additional text, just the JSON):

{
  "timeComplexity": "O(...)",
  "timeExplanation": "Brief explanation of the time complexity",
  "spaceComplexity": "O(...)",
  "spaceExplanation": "Brief explanation of the space complexity",
  "cyclomaticComplexity": number,
  "halstead": {
    "difficulty": number,
    "effort": number,
    "bugs": number
  },
  "bottlenecks": [
    {
      "line": number,
      "issue": "description of the issue",
      "severity": "low" | "medium" | "high",
      "suggestion": "how to fix it"
    }
  ],
  "cognitiveComplexity": number,
  "maintainabilityIndex": number,
  "recommendations": ["recommendation 1", "recommendation 2"]
}

Important rules:
- timeComplexity and spaceComplexity must use Big O notation (e.g., O(1), O(n), O(n²), O(log n), O(n log n), O(2ⁿ))
- cyclomaticComplexity should be a number (count of linearly independent paths)
- cognitiveComplexity should be a number (how hard to understand)
- maintainabilityIndex should be between 0-100 (higher is better)
- For bottlenecks, estimate line numbers as best you can
- Provide 2-4 practical optimization recommendations

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Return ONLY the JSON object, no markdown formatting, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response text to ensure it's valid JSON
    let cleanText = text.trim();
    // Remove markdown code blocks if present
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/, '').replace(/```\n?$/, '');
    }
    
    // Parse the JSON response
    const analysisResults = JSON.parse(cleanText);
    
    // Validate required fields and provide defaults if needed
    const validatedResults = {
      timeComplexity: analysisResults.timeComplexity || 'O(n)',
      timeExplanation: analysisResults.timeExplanation || 'Analysis completed',
      spaceComplexity: analysisResults.spaceComplexity || 'O(n)',
      spaceExplanation: analysisResults.spaceExplanation || 'Analysis completed',
      cyclomaticComplexity: analysisResults.cyclomaticComplexity || 1,
      halstead: {
        difficulty: analysisResults.halstead?.difficulty || 0,
        effort: analysisResults.halstead?.effort || 0,
        bugs: analysisResults.halstead?.bugs || 0,
      },
      bottlenecks: analysisResults.bottlenecks || [],
      cognitiveComplexity: analysisResults.cognitiveComplexity || 0,
      maintainabilityIndex: analysisResults.maintainabilityIndex || 50,
      recommendations: analysisResults.recommendations || [],
    };
    
    return NextResponse.json(validatedResults);
    
  } catch (error: any) {
    console.error('Analysis error:', error);
    
    // Handle specific API errors
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return NextResponse.json(
        { error: 'Model not available. Please check your API key and model configuration.' },
        { status: 500 }
      );
    }
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse analysis results. Please try again.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to analyze code' },
      { status: 500 }
    );
  }
}
