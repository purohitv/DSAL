// app/api/analyze/route.ts - MOCK VERSION (100% reliable)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { code, language } = await req.json();
  
  // Simple heuristic analysis based on code patterns
  const hasLoops = /for|while/.test(code);
  const hasNestedLoops = /for.*for|while.*while/.test(code);
  const hasRecursion = /\w+\(.*\w+\(/.test(code);
  
  let timeComplexity = "O(n)";
  let timeExplanation = "Linear time - operations scale with input size";
  
  if (hasNestedLoops) {
    timeComplexity = "O(n²)";
    timeExplanation = "Quadratic time due to nested loops";
  } else if (hasRecursion) {
    timeComplexity = "O(2ⁿ)";
    timeExplanation = "Exponential time from recursion";
  } else if (!hasLoops) {
    timeComplexity = "O(1)";
    timeExplanation = "Constant time - no loops detected";
  }
  
  return NextResponse.json({
    timeComplexity,
    timeExplanation,
    spaceComplexity: "O(n)",
    spaceExplanation: "Linear space complexity",
    cyclomaticComplexity: Math.max(1, (code.match(/if|for|while|case/g) || []).length),
    halstead: { difficulty: 8.5, effort: 245, bugs: 1.2 },
    bottlenecks: [
      {
        line: 1,
        issue: "Consider optimizing the main algorithm",
        severity: "medium",
        suggestion: "Look for opportunities to reduce complexity"
      }
    ],
    recommendations: [
      "Add comments for better maintainability",
      "Consider breaking down complex functions"
    ]
  });
}
