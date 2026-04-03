const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.step.deleteMany({});
  await prisma.lesson.deleteMany({});

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
      initialCode: `// Grover's Algorithm Simulation
async function groverSearch(nQubits, target) {
  let state = initializeSuperposition(nQubits);
  const iterations = Math.floor(Math.PI / 4 * Math.sqrt(2 ** nQubits));
  
  for (let i = 0; i < iterations; i++) {
    state = applyOracle(state, target);
    state = applyDiffusion(state);
  }
  return measure(state);
}`,
      steps: {
        create: [
          {
            order: 1,
            description: 'Initializing qubits in superposition...',
            terminalMessage: '> Quantum State Initialized. Coherence Stable.',
            highlightLines: JSON.stringify([3]),
            visualState: JSON.stringify({ qubits: 3, amplitudes: [0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35, 0.35] }),
            callStack: JSON.stringify(['groverSearch(3, 5)']),
            variables: JSON.stringify({ nQubits: 3, iterations: 2 }),
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
