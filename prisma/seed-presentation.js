const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up existing data...');
  await prisma.step.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.lecture.deleteMany({});
  await prisma.module.deleteMany({});

  console.log('Seeding Lectures...');

  // 1. Stack Module
  const stackModule = await prisma.module.create({
    data: {
      title: 'Stack Data Structure',
      description: 'Master the Last-In-First-Out (LIFO) principle and its applications.',
      order: 1,
      lectures: {
        create: [
          {
            title: 'Introduction to Stacks',
            content: `
# Introduction to Stacks

A **Stack** is a linear data structure that follows the **Last-In, First-Out (LIFO)** principle. Think of it like a stack of plates: the last plate you put on top is the first one you take off.

### Key Operations:
1. **Push**: Adds an item to the top of the stack.
2. **Pop**: Removes the item from the top of the stack.
3. **Peek/Top**: Returns the top item without removing it.
4. **isEmpty**: Checks if the stack is empty.

### Real-world Applications:
- Undo mechanism in text editors.
- Back button in web browsers.
- Function calls and recursion (Call Stack).
            `,
            videoUrl: 'https://www.youtube.com/embed/xli_Fi7CuzA',
            order: 1,
            quiz: {
              create: [
                {
                  question: "Which principle does a Stack follow?",
                  options: JSON.stringify(["FIFO", "LIFO", "LILO", "Random"]),
                  correctAnswer: 1,
                  explanation: "Stack follows Last-In-First-Out (LIFO).",
                  order: 1
                }
              ]
            }
          },
          {
            title: 'Stack Operations & Complexity',
            content: `
# Stack Operations

Stacks are incredibly efficient for specific tasks because their core operations are all **O(1)**.

### Time Complexity:
- **Push**: O(1)
- **Pop**: O(1)
- **Peek**: O(1)
- **Search**: O(n)

When implemented using an array, a stack might occasionally need to resize (O(n)), but the *amortized* time complexity remains O(1).
            `,
            videoUrl: 'https://www.youtube.com/embed/Hoixgm4-P4M',
            order: 2,
            quiz: {
              create: [
                {
                  question: "What is the time complexity of the Pop operation?",
                  options: JSON.stringify(["O(n)", "O(log n)", "O(1)", "O(n²)"]),
                  correctAnswer: 2,
                  explanation: "Removing the top element is a constant time operation.",
                  order: 1
                }
              ]
            }
          }
        ]
      }
    }
  });

  // 2. BST Module
  const bstModule = await prisma.module.create({
    data: {
      title: 'Binary Search Tree',
      description: 'Learn about hierarchical data structures and efficient searching.',
      order: 2,
      lectures: {
        create: [
          {
            title: 'BST Properties',
            content: `
# Binary Search Tree (BST)

A **Binary Search Tree** is a node-based binary tree data structure which has the following properties:
- The left subtree of a node contains only nodes with keys **less than** the node's key.
- The right subtree of a node contains only nodes with keys **greater than** the node's key.
- The left and right subtree each must also be a binary search tree.

### Complexity:
- **Search**: O(h) where h is height.
- **Insertion**: O(h)
- **Deletion**: O(h)

In a balanced tree, h = log n.
            `,
            videoUrl: 'https://www.youtube.com/embed/XB4MIexjvY0',
            order: 1,
            quiz: {
              create: [
                {
                  question: "In a BST, where are values smaller than the root stored?",
                  options: JSON.stringify(["Right Subtree", "Left Subtree", "Both", "Nowhere"]),
                  correctAnswer: 1,
                  explanation: "Smaller values are always in the left subtree.",
                  order: 1
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Seeding Experiment Lessons...');

  // 3. Stack Experiment Lesson
  await prisma.lesson.create({
    data: {
      slug: 'stack-experiment',
      type: 'classic',
      title: 'Stack Lab',
      category: 'Stacks',
      difficulty: 'Beginner',
      visualizationType: 'stack',
      language: 'cpp',
      initialCode: `#include <iostream>
#include <stack>

int main() {
    std::stack<int> s;
    s.push(10);
    s.push(20);
    std::cout << "Top: " << s.top() << std::endl;
    s.pop();
    return 0;
}`,
      steps: {
        create: [
          {
            order: 1,
            description: 'Initialize an empty stack.',
            terminalMessage: '> Stack initialized.',
            highlightLines: JSON.stringify([5]),
            visualState: JSON.stringify({ items: [] }),
            callStack: JSON.stringify(['main()']),
            variables: JSON.stringify({ 's.size()': 0 }),
          },
          {
            order: 2,
            description: 'Push 10 onto the stack.',
            terminalMessage: '> s.push(10)',
            highlightLines: JSON.stringify([6]),
            visualState: JSON.stringify({ items: [10], activeIndex: 0 }),
            callStack: JSON.stringify(['main()']),
            variables: JSON.stringify({ 's.top()': 10 }),
          },
          {
            order: 3,
            description: 'Push 20 onto the stack.',
            terminalMessage: '> s.push(20)',
            highlightLines: JSON.stringify([7]),
            visualState: JSON.stringify({ items: [10, 20], activeIndex: 1 }),
            callStack: JSON.stringify(['main()']),
            variables: JSON.stringify({ 's.top()': 20 }),
          }
        ]
      }
    }
  });

  // 4. BST Experiment Lesson
  await prisma.lesson.create({
    data: {
      slug: 'bst-experiment',
      type: 'classic',
      title: 'BST Lab',
      category: 'Trees',
      difficulty: 'Intermediate',
      visualizationType: 'tree',
      language: 'cpp',
      initialCode: `struct Node {
    int val;
    Node *left, *right;
    Node(int x) : val(x), left(NULL), right(NULL) {}
};

int main() {
    Node* root = new Node(50);
    // Add more nodes here...
    return 0;
}`,
      steps: {
        create: [
          {
            order: 1,
            description: 'Create root node with value 50.',
            terminalMessage: '> Root created: 50',
            highlightLines: JSON.stringify([8]),
            visualState: JSON.stringify({ nodes: [{ id: '1', label: '50' }], edges: [] }),
            callStack: JSON.stringify(['main()']),
            variables: JSON.stringify({ 'root->val': 50 }),
          }
        ]
      }
    }
  });

  console.log('Database seeded for presentation successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
