const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning up existing data...');
  await prisma.quizQuestion.deleteMany({});
  await prisma.userProgress.deleteMany({});
  await prisma.step.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.lecture.deleteMany({});
  await prisma.module.deleteMany({});

  console.log('📚 Seeding Stack Module...');

  // ─── 1. STACK MODULE ────────────────────────────────────────────────────────
  const stackModule = await prisma.module.create({
    data: {
      title: 'Stack Data Structure',
      description: 'Master the Last-In-First-Out (LIFO) principle and its real-world applications.',
      order: 1,
      lectures: {
        create: [
          // ── Lecture 1 ──────────────────────────────────────────────────────
          {
            title: 'Introduction to Stacks',
            order: 1,
            videoUrl: 'https://www.youtube.com/watch?v=F1F2imiOJfk',
            lessonId: 'stack-experiment',
            content: `# Introduction to Stacks

A **Stack** is a linear data structure that follows the **Last-In, First-Out (LIFO)** principle. Imagine a stack of plates at a cafeteria — you always pick up from the top, and you always place new plates on the top.

## What is LIFO?

LIFO stands for **Last In, First Out**. The last element added to the stack will be the first one removed. This is the fundamental property that makes stacks unique and useful.

## Core Stack Operations

| Operation | Description | Time Complexity |
|-----------|-------------|-----------------|
| **Push** | Add element to top | O(1) |
| **Pop** | Remove & return top element | O(1) |
| **Peek / Top** | View top element (no removal) | O(1) |
| **isEmpty** | Check if stack is empty | O(1) |
| **Size** | Return number of elements | O(1) |

## Real-World Analogies

- 🍽️ **Stack of plates** — last plate placed is first removed
- 📚 **Stack of books** — you pick from the top
- ↩️ **Browser back button** — visits are pushed; back pops
- ⌨️ **Ctrl+Z (Undo)** — each action is pushed; undo pops

## Why Are Stacks Important?

Stacks power some of the most fundamental operations in computer science:
- **Function call management** — the call stack tracks active functions
- **Expression evaluation** — parenthesis matching, postfix conversion
- **Depth-First Search** — used in graph traversal algorithms
- **Compiler design** — syntax parsing and code generation`,
            quiz: {
              create: [
                {
                  order: 1,
                  question: 'Which principle does a Stack follow?',
                  options: JSON.stringify(['FIFO', 'LIFO', 'LILO', 'Random Access']),
                  correctAnswer: 1,
                  explanation: 'Stack follows Last-In-First-Out (LIFO). The last element pushed is the first one popped.',
                },
                {
                  order: 2,
                  question: 'Which real-world scenario best represents a Stack?',
                  options: JSON.stringify(['Queue at a ticket counter', 'Stack of books on a table', 'Items in a shopping cart', 'Contacts in a phone book']),
                  correctAnswer: 1,
                  explanation: 'A stack of books is the classic analogy — you remove from the top (last placed) first.',
                },
                {
                  order: 3,
                  question: 'What does the Peek operation do?',
                  options: JSON.stringify(['Removes the top element', 'Adds a new element to the top', 'Returns the top element without removing it', 'Checks if the stack is full']),
                  correctAnswer: 2,
                  explanation: 'Peek (also called Top) returns the top element for inspection without modifying the stack.',
                },
              ],
            },
          },

          // ── Lecture 2 ──────────────────────────────────────────────────────
          {
            title: 'Stack Operations & Complexity',
            order: 2,
            videoUrl: 'https://www.youtube.com/watch?v=wjI1W2B7yII',
            lessonId: 'stack-experiment',
            content: `# Stack Operations & Complexity

Understanding the time and space complexity of stack operations is crucial for writing efficient code.

## Time Complexity

All primary stack operations are **O(1)** — constant time — regardless of the stack size.

\`\`\`
Operation    | Average | Worst Case
-------------|---------|----------
Push         | O(1)    | O(n)*
Pop          | O(1)    | O(1)
Peek         | O(1)    | O(1)
Search       | O(n)    | O(n)
\`\`\`

*\*Only when using a dynamic array that needs resizing — amortized O(1)*

## Space Complexity

- **O(n)** — proportional to number of elements stored.

## Stack Overflow & Underflow

### Stack Overflow
Occurs when you try to **Push** onto a full stack (only relevant for fixed-size array implementation).

\`\`\`cpp
// Checking before push
if (top == MAX_SIZE - 1) {
    cout << "Stack Overflow!" << endl;
    return;
}
stack[++top] = value;
\`\`\`

### Stack Underflow
Occurs when you try to **Pop** from an empty stack.

\`\`\`cpp
// Checking before pop
if (top == -1) {
    cout << "Stack Underflow!" << endl;
    return -1;
}
return stack[top--];
\`\`\`

## Amortized Analysis

When using a dynamic array, occasionally the array needs to double in size (O(n)), but this happens so rarely that the **amortized cost per operation is still O(1)**.`,
            quiz: {
              create: [
                {
                  order: 1,
                  question: 'What is the time complexity of the Pop operation on a Stack?',
                  options: JSON.stringify(['O(n)', 'O(log n)', 'O(1)', 'O(n²)']),
                  correctAnswer: 2,
                  explanation: 'Pop is O(1) because it always removes from the top — no traversal needed.',
                },
                {
                  order: 2,
                  question: 'What is Stack Overflow?',
                  options: JSON.stringify(['Popping from an empty stack', 'Pushing onto a full stack', 'Accessing a null pointer', 'An infinite loop']),
                  correctAnswer: 1,
                  explanation: 'Stack Overflow occurs when pushing onto a fixed-size stack that has no more room.',
                },
                {
                  order: 3,
                  question: 'What is the space complexity of a Stack with n elements?',
                  options: JSON.stringify(['O(1)', 'O(log n)', 'O(n)', 'O(n²)']),
                  correctAnswer: 2,
                  explanation: 'A stack storing n elements requires O(n) space.',
                },
              ],
            },
          },

          // ── Lecture 3 ──────────────────────────────────────────────────────
          {
            title: 'Array Implementation of Stack',
            order: 3,
            videoUrl: 'https://www.youtube.com/watch?v=I37kGX-nZEI',
            lessonId: 'stack-experiment',
            content: `# Array Implementation of Stack

The simplest way to implement a stack is using an **array** and a \`top\` pointer that tracks the index of the topmost element.

## Data Structure

\`\`\`cpp
#define MAX 100

class Stack {
    int arr[MAX];
    int top;

public:
    Stack() : top(-1) {}  // -1 means empty

    bool isEmpty() { return top == -1; }
    bool isFull()  { return top == MAX - 1; }

    void push(int val) {
        if (isFull()) { cout << "Overflow!"; return; }
        arr[++top] = val;
    }

    int pop() {
        if (isEmpty()) { cout << "Underflow!"; return -1; }
        return arr[top--];
    }

    int peek() {
        if (isEmpty()) return -1;
        return arr[top];
    }
};
\`\`\`

## Visual Trace — Push 10, 20, 30 then Pop

\`\`\`
Initial:   arr = [_, _, _]   top = -1
push(10):  arr = [10,_, _]   top = 0
push(20):  arr = [10,20, _]  top = 1
push(30):  arr = [10,20,30]  top = 2
pop():     arr = [10,20, _]  top = 1  → returns 30
peek():    returns 20       (no change)
\`\`\`

## Advantages & Disadvantages

| Aspect | Array Stack |
|--------|------------|
| ✅ Speed | O(1) all operations |
| ✅ Memory | No pointer overhead |
| ❌ Fixed size | Pre-allocated, may waste memory |
| ❌ Overflow | Must handle manually |`,
            quiz: {
              create: [
                {
                  order: 1,
                  question: 'In an array-based stack, what does top = -1 indicate?',
                  options: JSON.stringify(['Stack is full', 'Stack is empty', 'An error occurred', 'Last element is -1']),
                  correctAnswer: 1,
                  explanation: 'top = -1 is a sentinel value indicating there are no elements — the stack is empty.',
                },
                {
                  order: 2,
                  question: 'After push(10), push(20), push(30), pop() — what does peek() return?',
                  options: JSON.stringify(['10', '30', '20', 'Nothing']),
                  correctAnswer: 2,
                  explanation: 'After popping 30, the new top is 20. peek() returns 20 without removing it.',
                },
                {
                  order: 3,
                  question: 'What is the main disadvantage of an array-based stack?',
                  options: JSON.stringify(['Slow push operation', 'Fixed maximum size', 'Cannot store integers', 'Does not support peek']),
                  correctAnswer: 1,
                  explanation: 'Array-based stacks have a fixed maximum size set at compile time — they can overflow if capacity is exceeded.',
                },
              ],
            },
          },

          // ── Lecture 4 ──────────────────────────────────────────────────────
          {
            title: 'Stack Applications',
            order: 4,
            videoUrl: 'https://www.youtube.com/watch?v=X1oGgBaCzX4',
            content: `# Stack Applications

Stacks are one of the most versatile data structures. Here are their most important real-world applications:

## 1. Balanced Parentheses Checker

One of the classic stack problems — checking if brackets are balanced.

\`\`\`cpp
bool isBalanced(string expr) {
    stack<char> s;
    for (char c : expr) {
        if (c == '(' || c == '{' || c == '[')
            s.push(c);
        else {
            if (s.empty()) return false;
            char top = s.top(); s.pop();
            if ((c==')' && top!='(') ||
                (c=='}' && top!='{') ||
                (c==']' && top!='['))
                return false;
        }
    }
    return s.empty();
}
\`\`\`

## 2. Infix to Postfix Conversion

We read an infix expression (e.g., \`A + B * C\`) and convert it to postfix (\`A B C * +\`) using operator precedence stacks.

## 3. Function Call Stack

Every time a function is called, the CPU pushes a **stack frame** with:
- Return address
- Local variables
- Parameters

When the function returns, the frame is **popped**.

\`\`\`
main() calls foo() calls bar()
→ Call Stack: [main | foo | bar]
bar() returns → pops bar
→ Call Stack: [main | foo]
\`\`\`

## 4. Browser History (Back Button)

\`\`\`
Visit A → push(A)
Visit B → push(B)
Visit C → push(C)
Press Back → pop() → returns C, now at B
\`\`\`

## 5. Undo/Redo in Editors

- **Undo stack**: every action pushed
- **Redo stack**: every undone action pushed`,
            quiz: {
              create: [
                {
                  order: 1,
                  question: 'What data structure is used to check balanced parentheses?',
                  options: JSON.stringify(['Queue', 'Stack', 'Array', 'Linked List']),
                  correctAnswer: 1,
                  explanation: 'A stack is used — push opening brackets, pop and match when encountering closing brackets.',
                },
                {
                  order: 2,
                  question: 'What is stored in a function call stack frame?',
                  options: JSON.stringify(['Only local variables', 'Return address, local variables, and parameters', 'Only the return address', 'Global variables']),
                  correctAnswer: 1,
                  explanation: 'Each stack frame stores the return address, local variables, and function parameters.',
                },
                {
                  order: 3,
                  question: 'After visiting pages A, B, C in a browser and pressing "Back" twice, where are you?',
                  options: JSON.stringify(['Page A', 'Page B', 'Page C', 'Home Page']),
                  correctAnswer: 0,
                  explanation: 'Back press 1 pops C (go to B). Back press 2 pops B (go to A). You land on A.',
                },
              ],
            },
          },

          // ── Lecture 5 ──────────────────────────────────────────────────────
          {
            title: 'Practice Problems & Mastery',
            order: 5,
            videoUrl: 'https://www.youtube.com/watch?v=8bItFOJ3VMc',
            lessonId: 'stack-experiment',
            content: `# Stack Practice Problems

Now that you've learned the theory, let's solidify your understanding with classic stack problems.

## Problem 1: Valid Parentheses (LeetCode #20)

**Given** a string containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\`, \`]\`, determine if the input string is valid.

**Example:**
- \`"()"\` → true
- \`"()[{}]"\` → true  
- \`"(]"\` → false

## Problem 2: Next Greater Element

For each element in an array, find the next element that is **greater** than it.

\`\`\`
Input:  [4, 5, 2, 10, 8]
Output: [5,10,10, -1,-1]
\`\`\`

**Approach:** Use a stack — iterate right to left, maintain a decreasing monotonic stack.

## Problem 3: Min Stack

Design a stack that supports \`push\`, \`pop\`, \`top\`, and retrieving the **minimum element** in O(1).

**Trick:** Maintain a parallel "min stack" that tracks the current minimum alongside the main stack.

## Problem 4: Evaluate Reverse Polish Notation

Given tokens in postfix notation, evaluate the expression.

\`\`\`
["2","1","+","3","*"] → (2+1)*3 = 9
\`\`\`

## Key Takeaways

- When you see **matching pairs** → think Stack
- When you need **the most recent item** → think Stack
- When you are doing **DFS or recursion simulation** → think Stack
- Stack is the backbone of **expression evaluation** algorithms`,
            quiz: {
              create: [
                {
                  order: 1,
                  question: 'For input [4, 5, 2, 10], what is the Next Greater Element for 2?',
                  options: JSON.stringify(['4', '5', '10', 'None']),
                  correctAnswer: 2,
                  explanation: 'Looking right from 2, the next greater element is 10.',
                },
                {
                  order: 2,
                  question: 'To get the minimum element in O(1) from a Stack, what extra structure do you use?',
                  options: JSON.stringify(['A sorted array', 'A second "min" stack', 'A hash table', 'A priority queue']),
                  correctAnswer: 1,
                  explanation: 'A parallel min-stack tracks the current minimum at each push, enabling O(1) getMin().',
                },
                {
                  order: 3,
                  question: 'Which hint strongly suggests using a Stack for a problem?',
                  options: JSON.stringify(['Finding shortest path', 'Matching/nesting pairs like brackets', 'Sorting an array', 'Finding duplicates']),
                  correctAnswer: 1,
                  explanation: 'Matching or nesting patterns (brackets, function calls, etc.) are a classic Stack use case.',
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('🌳 Seeding BST Module...');

  // ─── 2. BST MODULE ──────────────────────────────────────────────────────────
  const bstModule = await prisma.module.create({
    data: {
      title: 'Binary Search Tree',
      description: 'Master hierarchical data structures, efficient searching, and tree traversals.',
      order: 2,
      lectures: {
        create: [
          // ── BST Lecture 1 ──────────────────────────────────────────────────
          {
            title: 'BST Properties & Structure',
            order: 1,
            videoUrl: 'https://www.youtube.com/watch?v=pYT9F8_LFTM',
            lessonId: 'bst-experiment',
            content: `# Binary Search Tree (BST)

A **Binary Search Tree** is a special binary tree where every node satisfies a powerful **ordering invariant** that enables efficient searching.

## The BST Property

For every node **N** in the tree:
- All values in the **left subtree** are **less than** N
- All values in the **right subtree** are **greater than** N
- Both subtrees are themselves valid BSTs

## Visual Example

\`\`\`
        50
       /  \\
      30    70
     / \\   / \\
    20  40 60  80
\`\`\`

- 30 < 50 → left ✅
- 70 > 50 → right ✅
- 20 < 30 → left of 30 ✅
- 40 > 30 → right of 30 ✅

## Node Structure

\`\`\`cpp
struct Node {
    int val;
    Node* left;
    Node* right;

    Node(int x) : val(x), left(nullptr), right(nullptr) {}
};
\`\`\`

## Complexity

| Operation | Best/Avg (Balanced) | Worst (Skewed) |
|-----------|---------------------|----------------|
| Search    | O(log n)            | O(n)           |
| Insert    | O(log n)            | O(n)           |
| Delete    | O(log n)            | O(n)           |

> A **balanced** BST has height h = log n. A **skewed** BST degenerates into a linked list with h = n.`,
            quiz: {
              create: [
                {
                  order: 1,
                  question: 'In a BST, where are values smaller than the root stored?',
                  options: JSON.stringify(['Right Subtree', 'Left Subtree', 'Either Side', 'At the Root']),
                  correctAnswer: 1,
                  explanation: 'BST invariant: all values less than a node are in its LEFT subtree.',
                },
                {
                  order: 2,
                  question: 'What is the height of a balanced BST with n nodes?',
                  options: JSON.stringify(['O(n)', 'O(n²)', 'O(log n)', 'O(1)']),
                  correctAnswer: 2,
                  explanation: 'A balanced BST has height O(log n), enabling efficient O(log n) operations.',
                },
                {
                  order: 3,
                  question: 'What happens to BST performance when it becomes skewed?',
                  options: JSON.stringify(['Operations stay O(log n)', 'Operations become O(n)', 'The tree auto-balances', 'Insertion fails']),
                  correctAnswer: 1,
                  explanation: 'A skewed BST degenerates into a linked list with height n, making all operations O(n).',
                },
              ],
            },
          },

          // ── BST Lecture 2 ──────────────────────────────────────────────────
          {
            title: 'BST Insertion & Search',
            order: 2,
            videoUrl: 'https://www.youtube.com/watch?v=wcIRPqTR3Kc',
            lessonId: 'bst-experiment',
            content: `# BST Insertion & Search

The two most fundamental BST operations — insertion and search — both follow the **same navigation logic**.

## Insertion Algorithm

1. Start at the **root**
2. If new value < current node → go **left**
3. If new value > current node → go **right**
4. If current node is **null** → insert here

\`\`\`cpp
Node* insert(Node* root, int val) {
    if (root == nullptr)
        return new Node(val);  // Found the spot!
    
    if (val < root->val)
        root->left = insert(root->left, val);
    else if (val > root->val)
        root->right = insert(root->right, val);
    
    return root;
}
\`\`\`

## Insertion Trace — Insert 50, 30, 70, 20

\`\`\`
Insert 50: Tree is empty → 50 becomes root
Insert 30: 30 < 50 → go left → insert as left child of 50
Insert 70: 70 > 50 → go right → insert as right child of 50
Insert 20: 20 < 50 → left → 20 < 30 → left → insert as left child of 30
\`\`\`

## Search Algorithm

\`\`\`cpp
bool search(Node* root, int val) {
    if (root == nullptr) return false;  // Not found
    if (root->val == val) return true;  // Found!
    
    if (val < root->val)
        return search(root->left, val);
    else
        return search(root->right, val);
}
\`\`\`

## Why BST Search is Fast

At each step, we **eliminate half the remaining search space** (in a balanced tree), giving us O(log n) time — similar to binary search on a sorted array.`,
            quiz: {
              create: [
                {
                  order: 1,
                  question: 'When inserting into a BST, what happens when we reach a null pointer?',
                  options: JSON.stringify(['Throw an error', 'Insert the new node there', 'Go back to the root', 'Skip the insertion']),
                  correctAnswer: 1,
                  explanation: 'When we reach null during traversal, we have found the correct position and insert the new node there.',
                },
                {
                  order: 2,
                  question: 'After inserting 50, 30, 70, 20 into an empty BST — who is the left child of 30?',
                  options: JSON.stringify(['50', '70', '20', 'null']),
                  correctAnswer: 2,
                  explanation: '20 < 50 (go left to 30), 20 < 30 (go left again) → 20 becomes left child of 30.',
                },
                {
                  order: 3,
                  question: 'How does BST search eliminate possibilities efficiently?',
                  options: JSON.stringify(['By visiting all nodes', 'By sorting first', 'By going left or right based on value comparison', 'By using a hash function']),
                  correctAnswer: 2,
                  explanation: 'At each node, the comparison tells us which half of the tree to search, eliminating the other half.',
                },
              ],
            },
          },

          // ── BST Lecture 3 ──────────────────────────────────────────────────
          {
            title: 'BST Deletion',
            order: 3,
            videoUrl: 'https://www.youtube.com/watch?v=LFzAoJJt92M',
            content: `# BST Deletion

Deletion in a BST is the most complex operation because we must maintain the BST property after removing a node.

## Three Cases

### Case 1: Node is a Leaf (no children)
Simply remove it — no children to reconnect.

\`\`\`
Delete 20 from:   50          Result:   50
                 /  \\                  /  \\
                30   70              30   70
               /
              20  ← delete this
\`\`\`

### Case 2: Node has One Child
Replace the node with its only child.

\`\`\`
Delete 30 from:   50          Result:   50
                 /  \\                  /  \\
                30   70              20   70
               /
              20
\`\`\`

### Case 3: Node has Two Children
Find the **Inorder Successor** (smallest value in right subtree), replace the node's value, then delete the successor.

\`\`\`cpp
Node* deleteNode(Node* root, int val) {
    if (!root) return nullptr;

    if (val < root->val)
        root->left = deleteNode(root->left, val);
    else if (val > root->val)
        root->right = deleteNode(root->right, val);
    else {
        // Case 1 & 2
        if (!root->left) return root->right;
        if (!root->right) return root->left;

        // Case 3: find inorder successor
        Node* succ = root->right;
        while (succ->left) succ = succ->left;
        root->val = succ->val;
        root->right = deleteNode(root->right, succ->val);
    }
    return root;
}
\`\`\`

## Inorder Successor

The inorder successor of a node is the **next largest value** in the BST — found as the **leftmost node in the right subtree**.`,
            quiz: {
              create: [
                {
                  order: 1,
                  question: 'How many cases exist for BST deletion?',
                  options: JSON.stringify(['1', '2', '3', '4']),
                  correctAnswer: 2,
                  explanation: 'There are 3 cases: leaf node, node with one child, and node with two children.',
                },
                {
                  order: 2,
                  question: 'When deleting a node with two children, what replaces it?',
                  options: JSON.stringify(['Its left child', 'Its right child', 'Its inorder successor', 'The root']),
                  correctAnswer: 2,
                  explanation: 'The inorder successor (smallest in right subtree) replaces the deleted node to maintain BST property.',
                },
                {
                  order: 3,
                  question: 'Where is the inorder successor of a node found?',
                  options: JSON.stringify(['Leftmost node of left subtree', 'Rightmost node of right subtree', 'Leftmost node of right subtree', 'Parent of the node']),
                  correctAnswer: 2,
                  explanation: 'Inorder successor = leftmost (smallest) node in the right subtree.',
                },
              ],
            },
          },

          // ── BST Lecture 4 ──────────────────────────────────────────────────
          {
            title: 'Tree Traversals',
            order: 4,
            videoUrl: 'https://www.youtube.com/watch?v=WLvU5EQVZqY',
            lessonId: 'bst-experiment',
            content: `# Tree Traversals

Tree traversal is the process of visiting every node in the tree exactly once. The order matters — different traversals reveal different information about the tree.

## The Three DFS Traversals

For a node N with left subtree L and right subtree R:

| Traversal | Order | Use Case |
|-----------|-------|----------|
| **Inorder** | L → N → R | Gives sorted output from BST |
| **Preorder** | N → L → R | Tree serialization / copy |
| **Postorder** | L → R → N | Delete tree / evaluate expressions |

## Inorder Traversal (Classic BST use)

\`\`\`cpp
void inorder(Node* root) {
    if (!root) return;
    inorder(root->left);
    cout << root->val << " ";
    inorder(root->right);
}
// On BST {20,30,40,50,60,70,80} → prints: 20 30 40 50 60 70 80
\`\`\`

## Preorder Traversal

\`\`\`cpp
void preorder(Node* root) {
    if (!root) return;
    cout << root->val << " ";  // Visit first
    preorder(root->left);
    preorder(root->right);
}
// On BST → prints: 50 30 20 40 70 60 80
\`\`\`

## Postorder Traversal

\`\`\`cpp
void postorder(Node* root) {
    if (!root) return;
    postorder(root->left);
    postorder(root->right);
    cout << root->val << " ";  // Visit last
}
// On BST → prints: 20 40 30 60 80 70 50
\`\`\`

## Level-Order (BFS) Traversal

Uses a **queue** to visit nodes level by level — breadth-first.

\`\`\`
Level 0:        50
Level 1:     30    70
Level 2:   20  40 60  80
\`\`\``,
            quiz: {
              create: [
                {
                  order: 1,
                  question: 'Which traversal of a BST gives nodes in sorted (ascending) order?',
                  options: JSON.stringify(['Preorder', 'Postorder', 'Inorder', 'Level-order']),
                  correctAnswer: 2,
                  explanation: 'Inorder traversal (Left → Node → Right) of a BST always produces nodes in ascending sorted order.',
                },
                {
                  order: 2,
                  question: 'For preorder traversal, in what order are nodes visited?',
                  options: JSON.stringify(['Left, Node, Right', 'Left, Right, Node', 'Node, Left, Right', 'Right, Node, Left']),
                  correctAnswer: 2,
                  explanation: 'Preorder visits the current Node first, then Left subtree, then Right subtree (N → L → R).',
                },
                {
                  order: 3,
                  question: 'Postorder traversal is most useful for which operation?',
                  options: JSON.stringify(['Printing sorted output', 'Copying a tree', 'Deleting a tree', 'Searching for a value']),
                  correctAnswer: 2,
                  explanation: 'Postorder (L → R → N) visits children before the parent, making it ideal for safely deleting all nodes.',
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('🧪 Seeding Experiment Lessons...');

  // ─── 3. STACK EXPERIMENT LESSON ─────────────────────────────────────────────
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
using namespace std;

int main() {
    stack<int> s;
    s.push(10);
    s.push(20);
    s.push(30);
    cout << "Top: " << s.top() << endl;
    s.pop();
    cout << "After pop, Top: " << s.top() << endl;
    s.push(40);
    cout << "After push(40), Top: " << s.top() << endl;
    return 0;
}`,
      steps: {
        create: [
          {
            order: 1,
            description: 'Declare an empty stack of integers.',
            terminalMessage: '> stack<int> s; — Stack initialized (empty)',
            highlightLines: JSON.stringify([6]),
            visualState: JSON.stringify({ items: [], activeIndex: null }),
            callStack: JSON.stringify(['main()']),
            variables: JSON.stringify({ 's.empty()': true, 's.size()': 0 }),
          },
          {
            order: 2,
            description: 'Push 10 onto the stack.',
            terminalMessage: '> s.push(10) — 10 added to top',
            highlightLines: JSON.stringify([7]),
            visualState: JSON.stringify({ items: [10], activeIndex: 0 }),
            callStack: JSON.stringify(['main()']),
            variables: JSON.stringify({ 's.top()': 10, 's.size()': 1 }),
          },
          {
            order: 3,
            description: 'Push 20 onto the stack.',
            terminalMessage: '> s.push(20) — 20 added to top',
            highlightLines: JSON.stringify([8]),
            visualState: JSON.stringify({ items: [10, 20], activeIndex: 1 }),
            callStack: JSON.stringify(['main()']),
            variables: JSON.stringify({ 's.top()': 20, 's.size()': 2 }),
          },
          {
            order: 4,
            description: 'Push 30 onto the stack.',
            terminalMessage: '> s.push(30) — 30 added to top',
            highlightLines: JSON.stringify([9]),
            visualState: JSON.stringify({ items: [10, 20, 30], activeIndex: 2 }),
            callStack: JSON.stringify(['main()']),
            variables: JSON.stringify({ 's.top()': 30, 's.size()': 3 }),
          },
          {
            order: 5,
            description: 'Peek at the top element — returns 30 without removing.',
            terminalMessage: '> Top: 30',
            highlightLines: JSON.stringify([10]),
            visualState: JSON.stringify({ items: [10, 20, 30], activeIndex: 2, peekActive: true }),
            callStack: JSON.stringify(['main()']),
            variables: JSON.stringify({ 's.top()': 30, 's.size()': 3 }),
          },
          {
            order: 6,
            description: 'Pop the top element (30) from the stack.',
            terminalMessage: '> s.pop() — 30 removed from stack',
            highlightLines: JSON.stringify([11]),
            visualState: JSON.stringify({ items: [10, 20], activeIndex: null, removedItem: 30 }),
            callStack: JSON.stringify(['main()']),
            variables: JSON.stringify({ 's.top()': 20, 's.size()': 2 }),
          },
          {
            order: 7,
            description: 'Push 40 — new element becomes the top.',
            terminalMessage: '> s.push(40) — 40 added to top. After push(40), Top: 40',
            highlightLines: JSON.stringify([13]),
            visualState: JSON.stringify({ items: [10, 20, 40], activeIndex: 2 }),
            callStack: JSON.stringify(['main()']),
            variables: JSON.stringify({ 's.top()': 40, 's.size()': 3 }),
          },
        ],
      },
    },
  });

  // ─── 4. BST EXPERIMENT LESSON ────────────────────────────────────────────────
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

Node* insert(Node* root, int val) {
    if (!root) return new Node(val);
    if (val < root->val) root->left = insert(root->left, val);
    else root->right = insert(root->right, val);
    return root;
}

int main() {
    Node* root = NULL;
    root = insert(root, 50);
    root = insert(root, 30);
    root = insert(root, 70);
    root = insert(root, 20);
    root = insert(root, 40);
    return 0;
}`,
      steps: {
        create: [
          {
            order: 1,
            description: 'Start with an empty BST.',
            terminalMessage: '> Node* root = NULL; — BST initialized',
            highlightLines: JSON.stringify([14]),
            visualState: JSON.stringify({ nodes: [], edges: [] }),
            callStack: JSON.stringify(['main()']),
            variables: JSON.stringify({ root: 'NULL', 'nodes count': 0 }),
          },
          {
            order: 2,
            description: 'Insert 50 — becomes the root node.',
            terminalMessage: '> insert(root, 50) — 50 is the root',
            highlightLines: JSON.stringify([15]),
            visualState: JSON.stringify({
              nodes: [{ id: '50', label: '50', x: 400, y: 80 }],
              edges: [],
              activeNode: '50',
            }),
            callStack: JSON.stringify(['main()', 'insert(null, 50)']),
            variables: JSON.stringify({ 'root->val': 50 }),
          },
          {
            order: 3,
            description: 'Insert 30 — 30 < 50, goes to left of root.',
            terminalMessage: '> insert(root, 30) — 30 < 50, placed LEFT of 50',
            highlightLines: JSON.stringify([16]),
            visualState: JSON.stringify({
              nodes: [
                { id: '50', label: '50', x: 400, y: 80 },
                { id: '30', label: '30', x: 250, y: 200 },
              ],
              edges: [{ from: '50', to: '30', label: 'L' }],
              activeNode: '30',
            }),
            callStack: JSON.stringify(['main()', 'insert(50, 30)']),
            variables: JSON.stringify({ 'root->val': 50, 'root->left->val': 30 }),
          },
          {
            order: 4,
            description: 'Insert 70 — 70 > 50, goes to right of root.',
            terminalMessage: '> insert(root, 70) — 70 > 50, placed RIGHT of 50',
            highlightLines: JSON.stringify([17]),
            visualState: JSON.stringify({
              nodes: [
                { id: '50', label: '50', x: 400, y: 80 },
                { id: '30', label: '30', x: 250, y: 200 },
                { id: '70', label: '70', x: 550, y: 200 },
              ],
              edges: [
                { from: '50', to: '30', label: 'L' },
                { from: '50', to: '70', label: 'R' },
              ],
              activeNode: '70',
            }),
            callStack: JSON.stringify(['main()', 'insert(50, 70)']),
            variables: JSON.stringify({ 'root->right->val': 70 }),
          },
          {
            order: 5,
            description: 'Insert 20 — 20 < 50 → left, 20 < 30 → left of 30.',
            terminalMessage: '> insert(root, 20) — 20 < 50 → left, 20 < 30 → placed LEFT of 30',
            highlightLines: JSON.stringify([18]),
            visualState: JSON.stringify({
              nodes: [
                { id: '50', label: '50', x: 400, y: 80 },
                { id: '30', label: '30', x: 250, y: 200 },
                { id: '70', label: '70', x: 550, y: 200 },
                { id: '20', label: '20', x: 160, y: 320 },
              ],
              edges: [
                { from: '50', to: '30', label: 'L' },
                { from: '50', to: '70', label: 'R' },
                { from: '30', to: '20', label: 'L' },
              ],
              activeNode: '20',
            }),
            callStack: JSON.stringify(['main()', 'insert(50,20)', 'insert(30,20)']),
            variables: JSON.stringify({ 'root->left->left->val': 20 }),
          },
          {
            order: 6,
            description: 'Insert 40 — completes the BST with 5 nodes.',
            terminalMessage: '> insert(root, 40) — 40 > 30 → placed RIGHT of 30. BST complete!',
            highlightLines: JSON.stringify([19]),
            visualState: JSON.stringify({
              nodes: [
                { id: '50', label: '50', x: 400, y: 80 },
                { id: '30', label: '30', x: 250, y: 200 },
                { id: '70', label: '70', x: 550, y: 200 },
                { id: '20', label: '20', x: 160, y: 320 },
                { id: '40', label: '40', x: 340, y: 320 },
              ],
              edges: [
                { from: '50', to: '30', label: 'L' },
                { from: '50', to: '70', label: 'R' },
                { from: '30', to: '20', label: 'L' },
                { from: '30', to: '40', label: 'R' },
              ],
              activeNode: '40',
            }),
            callStack: JSON.stringify(['main()', 'insert(50,40)', 'insert(30,40)']),
            variables: JSON.stringify({ 'root->left->right->val': 40, 'nodes count': 5 }),
          },
        ],
      },
    },
  });

  console.log('✅ Database seeded successfully for competition!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
