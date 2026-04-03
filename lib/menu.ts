export const CLASSIC_MENU = [
  {
    name: "Learn",
    categories: [
      {
        category: "Fundamental Data Structures",
        subcategories: [
          {
            name: "Linear Structures",
            items: [
              { name: "Array", desc: "Contiguous memory, fixed/dynamic size", href: "/ide/linear?type=array" },
              { name: "Linked List", desc: "Singly, Doubly, Circular, Skip Lists", href: "/ide/linear?type=linked-list" },
              { name: "Stack", desc: "LIFO order, used in recursion", href: "/ide/stack/1" },
              { name: "Queue", desc: "FIFO order, Circular, Priority Queues", href: "/ide/linear?type=queue" }
            ]
          },
          {
            name: "Non-Linear Structures",
            items: [
              { name: "Tree", desc: "Binary Trees and BST", href: "/ide/bst/1" },
              { name: "Graph", desc: "Adjacency Matrix and List", href: "/library" },
              { name: "Hash Table", desc: "Fast retrieval via Hash Map", href: "/library" }
            ]
          }
        ]
      },
      {
        category: "Intermediate Data Structures",
        items: [
          { name: "Self-Balancing Trees", desc: "AVL, Red-Black, Splay Trees", href: "/library" },
          { name: "Heap", desc: "Min-Heap, Max-Heap", href: "/library" },
          { name: "Trie", desc: "Prefix trees for searching", href: "/library" },
          { name: "DSU", desc: "Union-find for connected components", href: "/library" }
        ]
      },
      {
        category: "Advanced & Specialized",
        subcategories: [
          {
            name: "Advanced Trees",
            items: [
              { name: "B-Tree / B+ Tree", desc: "Efficient disk access", href: "/library" },
              { name: "Trie (Variant)", desc: "Radix, Suffix Trees, Automata", href: "/library" },
              { name: "Segment / Fenwick", desc: "Range queries and updates", href: "/library" },
              { name: "Treap", desc: "Randomized BST + Heap", href: "/library" }
            ]
          },
          {
            name: "Advanced Heaps",
            items: [
              { name: "Fibonacci Heap", desc: "Better amortized complexity", href: "/library" },
              { name: "Pairing Heap", desc: "Strong practical performance", href: "/library" }
            ]
          },
          {
            name: "Geometric / Spatial",
            items: [
              { name: "KD-Tree", desc: "K-Dimensional space points", href: "/library" },
              { name: "Quadtree/Octree", desc: "2D/3D partitioning", href: "/library" },
              { name: "R-Tree", desc: "Spatial access methods", href: "/library" }
            ]
          },
          {
            name: "String & Specialized",
            items: [
              { name: "Bloom Filter", desc: "Probabilistic set membership", href: "/library" },
              { name: "DSU (Advanced)", desc: "Path compression, union by rank", href: "/library" },
              { name: "Skip Lists", desc: "Probabilistic balanced trees", href: "/library" }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Experiment",
    items: [
      { name: "Classic Lab", desc: "Advanced algorithm visualization", href: "/ide/classic/lab" },
      { name: "Sandbox", desc: "Free-form logic testing", href: "/library" },
      { name: "Stress Test", desc: "Benchmark your algorithms", href: "/library" },
      { name: "Visual Debugger", desc: "Step-through custom logic", href: "/library" }
    ]
  },
  {
    name: "Research",
    items: [
      { name: "Classic Lab", desc: "Advanced algorithm playground", href: "/ide/research/lab" },
      { name: "Whitepapers", desc: "Algorithmic theory & proofs", href: "/library" },
      { name: "Case Studies", desc: "Real-world implementations", href: "/library" },
      { name: "Complexity Lab", desc: "Advanced asymptotic analysis", href: "/analysis" }
    ]
  }
];

export const QUANTUM_MENU = [
  { name: "Quantum Search", desc: "Grover's Algorithm", href: "/ide/quantum" },
  { name: "Quantum Fourier Transform", desc: "QFT Implementation", href: "/library" },
  { name: "Shor's Algorithm", desc: "Integer Factorization", href: "/library" }
];
