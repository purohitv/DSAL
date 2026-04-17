// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI with your API key
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { code, language } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: 'No code provided' },
        { status: 400 }
      );
    }

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
- Use proper Big O notation: O(1), O(n), O(n²), O(log n), O(n log n), O(2ⁿ), O(n!)
- cyclomaticComplexity: count of independent paths (typically 1-20)
- cognitiveComplexity: how hard to understand (typically 1-30)
- maintainabilityIndex: 0-100 (higher is better)
- For bottlenecks, estimate line numbers as best you can
- Provide 2-4 practical, actionable recommendations

Code to analyze:
\`\`\`${language}
${code.substring(0, 3000)}
\`\`\`

Return ONLY the JSON object. No markdown formatting. No explanation. Just the JSON.`;

    // Generate content using the new SDK
    const response = await genAI.models.generateContent({
      model: 'gemini-1.5-pro', // Use stable model
      contents: prompt,
    });

    const text = response.text;
    
    if (!text) {
      throw new Error('No response from Gemini');
    }
    
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
    
    // Validate and provide defaults for required fields
    const validatedResults = {
      timeComplexity: analysisResults.timeComplexity || 'O(n)',
      timeExplanation: analysisResults.timeExplanation || 'Analysis completed successfully',
      spaceComplexity: analysisResults.spaceComplexity || 'O(n)',
      spaceExplanation: analysisResults.spaceExplanation || 'Analysis completed successfully',
      cyclomaticComplexity: analysisResults.cyclomaticComplexity || 1,
      halstead: {
        difficulty: analysisResults.halstead?.difficulty || 0,
        effort: analysisResults.halstead?.effort || 0,
        bugs: analysisResults.halstead?.bugs || 0,
      },
      bottlenecks: Array.isArray(analysisResults.bottlenecks) ? analysisResults.bottlenecks : [],
      cognitiveComplexity: analysisResults.cognitiveComplexity || 0,
      maintainabilityIndex: analysisResults.maintainabilityIndex || 50,
      recommendations: Array.isArray(analysisResults.recommendations) ? analysisResults.recommendations : [],
    };
    
    return NextResponse.json(validatedResults);
    
  } catch (error: any) {
    console.error('Analysis error:', error);
    
    // Handle specific error types
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid or missing Gemini API key. Please check your environment variables.' },
        { status: 500 }
      );
    }
    
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return NextResponse.json(
        { error: 'Gemini model not available. Please check your API key and model configuration.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to analyze code. Please try again.' },
      { status: 500 }
    );
  }
}
