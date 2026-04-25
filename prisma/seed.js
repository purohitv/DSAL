const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.step.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.lecture.deleteMany({});
  await prisma.module.deleteMany({});

  // 1. Modules and Lectures
  const sortingModule = await prisma.module.create({
    data: {
      title: 'Sorting Algorithms',
      description: 'Master the fundamental sorting techniques used in software engineering.',
      order: 1,
      lectures: {
        create: [
          {
            title: 'Introduction to Bubble Sort',
            content: `
# Bubble Sort: The Simplest Sorting Algorithm

Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.

## How it works:
1. Compare the first two elements.
2. If the first is greater than the second, swap them.
3. Move to the next pair and repeat until the end of the array.
4. Repeat the whole process for the remaining unsorted part.

## Complexity:
- **Time Complexity:** O(n²) in worst and average cases.
- **Space Complexity:** O(1) as it is an in-place sorting algorithm.
            `,
            videoUrl: 'https://www.youtube.com/embed/xli_Fi7CuzA',
            order: 1,
            lessonId: 'array-reversal', // Linked to Array Reversal for demonstration
            quiz: {
              create: [
                {
                  question: "What is the worst-case time complexity of Bubble Sort?",
                  options: JSON.stringify(["O(n)", "O(n log n)", "O(n²)", "O(1)"]),
                  correctAnswer: 2,
                  explanation: "In the worst case (when the array is reverse sorted), Bubble Sort has to compare and swap every element, leading to O(n²) time complexity.",
                  order: 1
                },
                {
                  question: "Is Bubble Sort an in-place sorting algorithm?",
                  options: JSON.stringify(["Yes", "No"]),
                  correctAnswer: 0,
                  explanation: "Yes, Bubble Sort only requires O(1) extra space for the temporary variable used during swapping.",
                  order: 2
                }
              ]
            }
          },
          {
            title: 'Quick Sort: Divide and Conquer',
            content: `
# Quick Sort: Efficiency through Recursion

Quick Sort is a highly efficient sorting algorithm and is based on partitioning of array of data into smaller arrays. A large array is partitioned into two arrays one of which holds values smaller than the specified value, say pivot, based on which the partition is made and another array holds values greater than the pivot value.

## The Partitioning Process:
1. Pick an element, called a **pivot**, from the array.
2. Partitioning: reorder the array so that all elements with values less than the pivot come before the pivot, while all elements with values greater than the pivot come after it.
3. Recursively apply the above steps to the sub-array of elements with smaller values and separately to the sub-array of elements with greater values.

## Complexity:
- **Average Time Complexity:** O(n log n)
- **Worst Case:** O(n²) (usually when the pivot is the smallest or largest element)
            `,
            videoUrl: 'https://www.youtube.com/embed/Hoixgm4-P4M',
            order: 2,
            lessonId: 'array-reversal', // Also linked here for now
            quiz: {
              create: [
                {
                  question: "What paradigm does Quick Sort use?",
                  options: JSON.stringify(["Dynamic Programming", "Greedy", "Divide and Conquer", "Backtracking"]),
                  correctAnswer: 2,
                  explanation: "Quick Sort divides the array into smaller sub-arrays around a pivot and recursively sorts them.",
                  order: 1
                }
              ]
            }
          }
        ]
      }
    }
  });

  const graphModule = await prisma.module.create({
    data: {
      title: 'Graph Theory',
      description: 'Explore the world of nodes and edges, from pathfinding to network flows.',
      order: 2,
      lectures: {
        create: [
          {
            title: "Dijkstra's Shortest Path",
            content: `
# Dijkstra's Algorithm: Finding the Shortest Path

Dijkstra's algorithm is an algorithm for finding the shortest paths between nodes in a graph, which may represent, for example, road networks.

## Key Concepts:
- **Greedy Approach:** Always picks the unvisited node with the smallest distance.
- **Priority Queue:** Used to efficiently find the next node to visit.

## Steps:
1. Mark all nodes unvisited. Create a set of all the unvisited nodes called the unvisited set.
2. Assign to every node a tentative distance value: set it to zero for our initial node and to infinity for all other nodes.
3. For the current node, consider all of its unvisited neighbors and calculate their tentative distances through the current node.
4. When we are done considering all of the unvisited neighbors of the current node, mark the current node as visited.
            `,
            videoUrl: 'https://www.youtube.com/embed/XB4MIexjvY0',
            order: 1,
            lessonId: 'bst-insertion', // Linked for now as bst-insertion is a graph/tree lesson
            quiz: {
              create: [
                {
                  question: "Which data structure is typically used to optimize Dijkstra's algorithm?",
                  options: JSON.stringify(["Stack", "Queue", "Priority Queue", "Linked List"]),
                  correctAnswer: 2,
                  explanation: "A Priority Queue (often implemented as a Min-Heap) is used to efficiently fetch the unvisited node with the smallest tentative distance.",
                  order: 1
                },
                {
                  question: "Does Dijkstra's algorithm work with negative edge weights?",
                  options: JSON.stringify(["Yes", "No"]),
                  correctAnswer: 1,
                  explanation: "No, Dijkstra's algorithm assumes all edge weights are non-negative. For graphs with negative weights, Bellman-Ford should be used.",
                  order: 2
                }
              ]
            }
          }
        ]
      }
    }
  });

  // 1. BST Insertion Lesson
  const bstInsertion = await prisma.lesson.create({
    data: {
      slug: 'bst-insertion',
      type: 'classic',
      title: 'BST Insertion',
      category: 'Trees',
      difficulty: 'Intermediate',
      visualizationType: 'tree',
      language: 'cpp',
      initialCode: `Node* insert(Node* root, int val) {
  if (!root) return new Node(val);
  if (val < root->val)
    root->left = insert(root->left, val);
  else if (val > root->val)
    root->right = insert(root->right, val);
  return root;
}`,
      steps: {
        create: [
          {
            order: 1,
            description: 'Starting insertion process...',
            terminalMessage: '> BST Initialized. Ready for operations.',
            highlightLines: JSON.stringify([]),
            visualState: JSON.stringify({ nodes: [], edges: [] }),
            callStack: JSON.stringify([]),
            variables: JSON.stringify({}),
          },
          {
            order: 2,
            description: 'Checking if root is null',
            terminalMessage: '> Visiting root node...',
            highlightLines: JSON.stringify([2]),
            visualState: JSON.stringify({ activeNodeId: null, pathNodeIds: [] }),
            callStack: JSON.stringify(['insert(root, val)']),
            variables: JSON.stringify({ val: '?' }),
          }
        ],
      },
    },
  });

  // 2. Grover's Search Lesson
  const groversSearch = await prisma.lesson.create({
    data: {
      slug: 'grovers-search',
      type: 'quantum',
      title: "Grover's Search",
      category: 'Quantum',
      difficulty: 'Advanced',
      visualizationType: 'quantum',
      language: 'js', // Using JS for Q# simulation for now
      initialCode: `// Quantum State Simulation
function main(dsal) {
  // Initial state |0>
  dsal.trace({
    visualState: { qubits: [{ id: 'q0', theta: 0, phi: 0, label: '|0>' }] },
    message: "Initialized Qubit in state |0>",
    operations: 1,
    memory: 1
  });

  // Apply Hadamard (Superposition)
  // theta = PI/2, phi = 0
  dsal.trace({
    visualState: { qubits: [{ id: 'q0', theta: Math.PI / 2, phi: 0, label: '|+>' }] },
    message: "Applied Hadamard Gate (Superposition)",
    operations: 2,
    memory: 1
  });

  // Apply Pauli-Z (Phase Flip)
  // theta = PI/2, phi = PI
  dsal.trace({
    visualState: { qubits: [{ id: 'q0', theta: Math.PI / 2, phi: Math.PI, label: '|->' }] },
    message: "Applied Pauli-Z Gate (Phase Flip)",
    operations: 3,
    memory: 1
  });
  
  // Apply Pauli-X (NOT Gate from |0>)
  // theta = PI, phi = 0
  dsal.trace({
    visualState: { qubits: [{ id: 'q0', theta: Math.PI, phi: 0, label: '|1>' }] },
    message: "Applied Pauli-X Gate (NOT)",
    operations: 4,
    memory: 1
  });
}`,
      steps: {
        create: [
          {
            order: 1,
            description: 'Initializing qubit...',
            terminalMessage: '> Quantum State Initialized.',
            highlightLines: JSON.stringify([3]),
            visualState: JSON.stringify({ qubits: [{ id: 'q0', theta: 0, phi: 0, label: '|0>' }] }),
            callStack: JSON.stringify(['main()']),
            variables: JSON.stringify({ state: '|0>' }),
          }
        ],
      },
    },
  });

  // 3. Array Reversal Lesson
  const arrayReversal = await prisma.lesson.create({
    data: {
      slug: 'array-reversal',
      type: 'classic',
      title: 'Array Reversal',
      category: 'Arrays',
      difficulty: 'Beginner',
      visualizationType: 'linear',
      language: 'js',
      initialCode: `function main(dsal) {
  let arr = [1, 2, 3, 4, 5];
  let left = 0;
  let right = arr.length - 1;
  let ops = 0;

  dsal.trace({
    visualState: { items: [...arr], pointers: { L: left, R: right } },
    message: "Initialized array and pointers",
    operations: ops,
    memory: arr.length
  });

  while (left < right) {
    ops++;
    dsal.trace({
      visualState: { items: [...arr], pointers: { L: left, R: right }, activeIndices: [left, right] },
      message: \`Swapping elements at index \${left} and \${right}\`,
      operations: ops,
      memory: arr.length
    });

    let temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;

    left++;
    right--;

    ops++;
    dsal.trace({
      visualState: { items: [...arr], pointers: { L: left, R: right } },
      message: "Moved pointers inward",
      operations: ops,
      memory: arr.length
    });
  }

  dsal.trace({
    visualState: { items: [...arr] },
    message: "Array reversed successfully",
    operations: ops,
    memory: arr.length
  });
}`,
      steps: {
        create: [
          {
            order: 1,
            description: 'Initializing array...',
            terminalMessage: '> Array Initialized.',
            highlightLines: JSON.stringify([2, 3, 4]),
            visualState: JSON.stringify({ items: [1, 2, 3, 4, 5], pointers: { L: 0, R: 4 } }),
            callStack: JSON.stringify(['main()']),
            variables: JSON.stringify({ arr: '[1, 2, 3, 4, 5]', left: 0, right: 4 }),
          }
        ],
      },
    },
  });

  // 4. Valid Parentheses Lesson
  const validParentheses = await prisma.lesson.create({
    data: {
      slug: 'valid-parentheses',
      type: 'classic',
      title: 'Valid Parentheses',
      category: 'Stacks',
      difficulty: 'Easy',
      visualizationType: 'stack',
      language: 'js',
      initialCode: `function main(dsal) {
  let s = "{[()]}";
  let stack = [];
  let ops = 0;

  dsal.trace({
    visualState: { items: [...stack] },
    message: \`Checking string: \${s}\`,
    operations: ops,
    memory: 0
  });

  const pairs = { '}': '{', ']': '[', ')': '(' };

  for (let i = 0; i < s.length; i++) {
    ops++;
    let char = s[i];
    
    if (char === '{' || char === '[' || char === '(') {
      stack.push(char);
      dsal.trace({
        visualState: { items: [...stack], activeIndex: stack.length - 1 },
        message: \`Pushed \${char} onto stack\`,
        operations: ops,
        memory: stack.length
      });
    } else {
      let top = stack.pop();
      if (top === pairs[char]) {
        dsal.trace({
          visualState: { items: [...stack] },
          message: \`Matched \${char} with \${top}, popped from stack\`,
          operations: ops,
          memory: stack.length
        });
      } else {
        dsal.trace({
          visualState: { items: [...stack] },
          message: \`Mismatch! Expected \${pairs[char]}, found \${top}\`,
          operations: ops,
          memory: stack.length
        });
        return false;
      }
    }
  }

  dsal.trace({
    visualState: { items: [...stack] },
    message: stack.length === 0 ? "Valid parentheses!" : "Invalid: Stack not empty",
    operations: ops,
    memory: stack.length
  });
}`,
      steps: {
        create: [
          {
            order: 1,
            description: 'Initializing stack...',
            terminalMessage: '> Stack Initialized.',
            highlightLines: JSON.stringify([2, 3]),
            visualState: JSON.stringify({ items: [] }),
            callStack: JSON.stringify(['main()']),
            variables: JSON.stringify({ s: '"{[()]}"', stack: '[]' }),
          }
        ],
      },
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
