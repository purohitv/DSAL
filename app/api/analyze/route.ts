// app/api/analyze/route.ts - COMPLETE MOCK VERSION (100% RELIABLE)
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

    // Intelligent mock analysis based on code patterns
    const analysisResult = analyzeCodeLocally(code, language);
    
    // Add a small delay to simulate processing (optional)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json(analysisResult);
    
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze code' },
      { status: 500 }
    );
  }
}

function analyzeCodeLocally(code: string, language: string) {
  // Count code structures
  const lines = code.split('\n').filter(l => l.trim().length > 0);
  const codeLines = lines.filter(l => !l.trim().startsWith('//') && !l.trim().startsWith('/*'));
  
  // Detect patterns
  const hasLoops = /for\s*\(|while\s*\(|forEach|map|filter|reduce/.test(code);
  const hasNestedLoops = /for.*for|while.*while|for.*while|while.*for/.test(code);
  const hasRecursion = /\w+\s*\([^)]*\)\s*{[\s\S]*?\1\s*\(/.test(code);
  const hasBinarySearch = /binarySearch|mid\s*=\s*\(left\s*\+\s*right\)|\bmiddle\b/.test(code);
  const hasQuickSort = /quickSort|pivot|left\.push|right\.push/.test(code);
  const hasBubbleSort = /bubbleSort|arr\[j\]\s*>\s*arr\[j\s*\+\s*1\]/.test(code);
  const hasMergeSort = /mergeSort|merge\s*\(|slice\s*\(\s*0\s*,\s*mid\s*\)/.test(code);
  
  // Count complexity factors
  const functions = (code.match(/function\s+\w+\s*\(/g) || []).length;
  const conditionals = (code.match(/if\s*\(|else\s+if|switch\s*\(|case\s+:/g) || []).length;
  const loopCount = (code.match(/for\s*\(|while\s*\(/g) || []).length;
  
  // Determine Time Complexity
  let timeComplexity = "O(n)";
  let timeExplanation = "Linear time complexity - operations scale linearly with input size.";
  
  if (hasNestedLoops) {
    timeComplexity = "O(n²)";
    timeExplanation = "Quadratic time complexity due to nested loops. Performance degrades significantly with larger inputs.";
  } else if (hasRecursion) {
    timeComplexity = "O(2ⁿ)";
    timeExplanation = "Exponential time complexity from recursive calls without memoization. Consider using dynamic programming.";
  } else if (hasBinarySearch) {
    timeComplexity = "O(log n)";
    timeExplanation = "Logarithmic time complexity - very efficient for sorted data searches.";
  } else if (hasQuickSort || hasMergeSort) {
    timeComplexity = "O(n log n)";
    timeExplanation = "Linearithmic time complexity - optimal for comparison-based sorting.";
  } else if (hasBubbleSort) {
    timeComplexity = "O(n²)";
    timeExplanation = "Quadratic time complexity - Bubble Sort is inefficient for large datasets.";
  } else if (!hasLoops) {
    timeComplexity = "O(1)";
    timeExplanation = "Constant time complexity - execution time doesn't depend on input size.";
  }
  
  // Determine Space Complexity
  let spaceComplexity = "O(n)";
  let spaceExplanation = "Linear space complexity - memory usage scales with input size.";
  
  if (hasRecursion && !hasBinarySearch) {
    spaceComplexity = "O(n)";
    spaceExplanation = "Linear space complexity due to recursion stack depth.";
  } else if (hasMergeSort) {
    spaceComplexity = "O(n)";
    spaceExplanation = "Linear space complexity - Merge Sort requires temporary arrays.";
  } else if (!hasLoops && !hasRecursion) {
    spaceComplexity = "O(1)";
    spaceExplanation = "Constant space complexity - minimal additional memory required.";
  } else if (hasNestedLoops) {
    spaceComplexity = "O(1)";
    spaceExplanation = "Constant space complexity despite quadratic time - in-place operations.";
  }
  
  // Calculate cyclomatic complexity
  const cyclomaticComplexity = Math.max(1, 
    (code.match(/if\s*\(/g) || []).length +
    (code.match(/for\s*\(/g) || []).length +
    (code.match(/while\s*\(/g) || []).length +
    (code.match(/case\s+:/g) || []).length +
    (code.match(/catch\s*\(/g) || []).length +
    1
  );
  
  // Calculate cognitive complexity (simplified)
  const cognitiveComplexity = Math.min(30, Math.max(1,
    (code.match(/if\s*\(/g) || []).length * 1 +
    (code.match(/for\s*\(/g) || []).length * 2 +
    (code.match(/while\s*\(/g) || []).length * 2 +
    (code.match(/function\s+\w+\s*\(/g) || []).length * 1 +
    (hasNestedLoops ? 5 : 0)
  ));
  
  // Calculate maintainability index (0-100)
  const maintainabilityIndex = Math.min(100, Math.max(0,
    100 - (lines.length * 0.2) - (cyclomaticComplexity * 1.5) - (cognitiveComplexity * 1.2)
  ));
  
  // Generate bottlenecks
  const bottlenecks = [];
  
  if (hasNestedLoops) {
    bottlenecks.push({
      line: findLineNumber(code, /for\s*\([\s\S]*?for\s*\(/),
      issue: "Nested loops detected - this creates quadratic time complexity",
      severity: "high",
      suggestion: "Consider using a more efficient algorithm or data structure to avoid O(n²) complexity"
    });
  }
  
  if (hasRecursion && !hasBinarySearch) {
    bottlenecks.push({
      line: findLineNumber(code, /\w+\s*\([^)]*\)\s*{[\s\S]*?\1\s*\(/),
      issue: "Recursion without memoization can lead to exponential time complexity",
      severity: "high",
      suggestion: "Add memoization (caching) or convert to iterative approach"
    });
  }
  
  if (loopCount > 3) {
    bottlenecks.push({
      line: findLineNumber(code, /for\s*\(|while\s*\(/),
      issue: `Multiple loops (${loopCount}) detected - consider consolidating`,
      severity: "medium",
      suggestion: "Combine loops when possible to reduce overall complexity"
    });
  }
  
  if (conditionals > 10) {
    bottlenecks.push({
      line: findLineNumber(code, /if\s*\(|else\s+if/),
      issue: `High number of conditionals (${conditionals}) increases cyclomatic complexity`,
      severity: "medium",
      suggestion: "Consider using switch statements, lookup tables, or polymorphism"
    });
  }
  
  // Generate recommendations
  const recommendations = [];
  
  if (hasNestedLoops) {
    recommendations.push("Replace nested loops with a more efficient algorithm like hash maps or divide-and-conquer");
  }
  if (hasRecursion && !hasBinarySearch) {
    recommendations.push("Implement memoization to cache recursive results and avoid redundant calculations");
  }
  if (functions > 5) {
    recommendations.push("Consider refactoring to reduce function count and improve modularity");
  }
  if (maintainabilityIndex < 50) {
    recommendations.push("Add comments and break down complex functions to improve maintainability");
  }
  if (codeLines.length > 100) {
    recommendations.push("Split large file into smaller modules for better organization");
  }
  if (recommendations.length === 0) {
    recommendations.push("Add comprehensive error handling for edge cases");
    recommendations.push("Consider adding input validation for better robustness");
  }
  
  // Ensure at least 2 recommendations
  while (recommendations.length < 2) {
    recommendations.push("Add unit tests to verify correctness");
    recommendations.push("Document time and space complexity in comments");
  }
  
  return {
    timeComplexity,
    timeExplanation,
    spaceComplexity,
    spaceExplanation,
    cyclomaticComplexity,
    cognitiveComplexity,
    maintainabilityIndex: Math.round(maintainabilityIndex),
    halstead: {
      difficulty: Math.round((cyclomaticComplexity / 2 + loopCount) * 10) / 10,
      effort: Math.round(cyclomaticComplexity * loopCount * 50),
      bugs: Math.round((cyclomaticComplexity / 10) * 100) / 100,
      volume: Math.round(codeLines.length * 1.5),
      vocabulary: Math.round(Math.sqrt(code.length) / 2)
    },
    bottlenecks: bottlenecks.slice(0, 4),
    recommendations: recommendations.slice(0, 4)
  };
}

function findLineNumber(code: string, pattern: RegExp): number {
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      return i + 1;
    }
  }
  return 1;
}
