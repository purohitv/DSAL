// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { code, language } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: 'No code provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `You are a code complexity analysis expert. Analyze the following ${language} code and return a JSON object with EXACTLY this structure (no additional text, just the JSON):

{
  "timeComplexity": "O(...)",
  "timeExplanation": "Brief explanation",
  "spaceComplexity": "O(...)",
  "spaceExplanation": "Brief explanation",
  "cyclomaticComplexity": number,
  "halstead": {
    "difficulty": number,
    "effort": number,
    "bugs": number
  },
  "bottlenecks": [
    {
      "line": number,
      "issue": "description",
      "severity": "low" | "medium" | "high",
      "suggestion": "how to fix it"
    }
  ],
  "cognitiveComplexity": number,
  "maintainabilityIndex": number,
  "recommendations": ["recommendation 1", "recommendation 2"]
}

Code to analyze:
\`\`\`${language}
${code.substring(0, 3000)}
\`\`\`

Return ONLY the JSON object. No markdown formatting. No explanation. Just the JSON.`;

    // ✅ USING VERIFIED WORKING MODEL: gemini-2.5-pro
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000,
            topP: 0.95,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      
      if (response.status === 404) {
        throw new Error('Model not found. Available models: gemini-2.5-pro, gemini-2.5-flash, gemini-2.0-flash');
      } else if (response.status === 403 || response.status === 401) {
        throw new Error('Invalid API key. Please check your GEMINI_API_KEY environment variable.');
      } else {
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('Empty response from Gemini API');
    }

    let cleanText = responseText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/, '').replace(/```\n?$/, '');
    }
    
    const analysisResults = JSON.parse(cleanText);
    
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
      bottlenecks: Array.isArray(analysisResults.bottlenecks) ? analysisResults.bottlenecks : [],
      cognitiveComplexity: analysisResults.cognitiveComplexity || 0,
      maintainabilityIndex: analysisResults.maintainabilityIndex || 50,
      recommendations: Array.isArray(analysisResults.recommendations) ? analysisResults.recommendations : [],
    };
    
    return NextResponse.json(validatedResults);
    
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze code' },
      { status: 500 }
    );
  }
}
