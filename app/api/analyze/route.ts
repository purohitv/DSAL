import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    const { code, language } = await request.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");
      return NextResponse.json(
        { error: "API key not configured. Please add GEMINI_API_KEY to environment variables." },
        { status: 500 }
      );
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: `You are an expert code analyst. Analyze the following ${language} code and provide a comprehensive complexity analysis.

Code to analyze:
\`\`\`${language.toLowerCase()}
${code.substring(0, 3000)}
\`\`\`

Provide a detailed analysis including:
1. Time complexity (Big O notation) with clear explanation
2. Space complexity (Big O notation) with clear explanation
3. Cyclomatic complexity (number of independent paths)
4. Cognitive complexity (how hard it is to understand)
5. Halstead metrics (difficulty, effort, estimated bugs)
6. Specific bottlenecks with line numbers and severity levels
7. Optimization recommendations

Respond with a JSON object in this exact format:
{
  "timeComplexity": "O(...)",
  "timeExplanation": "Detailed explanation of time complexity...",
  "spaceComplexity": "O(...)",
  "spaceExplanation": "Detailed explanation of space complexity...",
  "cyclomaticComplexity": number,
  "cognitiveComplexity": number,
  "halstead": {
    "difficulty": number,
    "effort": number,
    "bugs": number,
    "volume": number,
    "vocabulary": number
  },
  "bottlenecks": [
    {
      "line": number,
      "issue": "Description of the issue",
      "severity": "low|medium|high",
      "suggestion": "How to fix it"
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
        maxOutputTokens: 1500
      }
    });

    if (response.text) {
      const parsedResult = JSON.parse(response.text);
      return NextResponse.json({ success: true, ...parsedResult });
    } else {
      throw new Error("Failed to generate analysis");
    }
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze complexity" },
      { status: 500 }
    );
  }
}
