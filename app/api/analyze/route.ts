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
        { error: 'API key not configured. Please add GEMINI_API_KEY to your environment variables.' },
        { status: 500 }
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

    // Clean the response text to ensure it's valid JSON
    let cleanText = responseText.trim();
    
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
    
    if (error.message?.includes('API key') || error.message?.includes('Invalid API key')) {
      return NextResponse.json(
        { error: 'Invalid or missing Gemini API key. Please check your GEMINI_API_KEY environment variable.' },
        { status: 500 }
      );
    }
    
    if (error.message?.includes('404') || error.message?.includes('Model not found')) {
      return NextResponse.json(
        { error: 'Gemini model not available. Please use gemini-2.5-pro or gemini-2.5-flash.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to analyze code. Please try again.' },
      { status: 500 }
    );
  }
}
