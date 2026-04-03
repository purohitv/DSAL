'use client';

import { useEffect } from 'react';
import { useTimelineStore, MemoryFrame } from '@/store/useTimelineStore';

const MOCK_FRAMES: MemoryFrame[] = [
  {
    callStack: [
      { id: '1', functionName: 'main()', line: 19, fileName: 'stack.cpp' },
      { id: '2', functionName: '_start', line: 0, fileName: 'System' }
    ],
    variables: [
      { name: 'top', value: -1, type: 'int' },
      { name: 'capacity', value: 10, type: 'int' },
      { name: 'data', value: '0x7ffe...', type: 'int*' }
    ],
    heap: [],
    output: ['Initializing stack with capacity 10...', 'Stack created successfully.'],
    activeLine: 19,
    description: 'Program Start'
  },
  {
    callStack: [
      { id: '3', functionName: 'push(10)', line: 11, fileName: 'stack.cpp' },
      { id: '1', functionName: 'main()', line: 20, fileName: 'stack.cpp' },
      { id: '2', functionName: '_start', line: 0, fileName: 'System' }
    ],
    variables: [
      { name: 'top', value: -1, type: 'int' },
      { name: 'value', value: 10, type: 'int' },
      { name: 'capacity', value: 10, type: 'int' },
      { name: 'data', value: '0x7ffe...', type: 'int*' }
    ],
    heap: [],
    output: ['Initializing stack with capacity 10...', 'Stack created successfully.'],
    activeLine: 11,
    description: 'Call push(10)'
  },
  {
    callStack: [
      { id: '3', functionName: 'push(10)', line: 15, fileName: 'stack.cpp' },
      { id: '1', functionName: 'main()', line: 20, fileName: 'stack.cpp' },
      { id: '2', functionName: '_start', line: 0, fileName: 'System' }
    ],
    variables: [
      { name: 'top', value: 0, type: 'int' },
      { name: 'value', value: 10, type: 'int' },
      { name: 'capacity', value: 10, type: 'int' },
      { name: 'data', value: '0x7ffe...', type: 'int*' }
    ],
    heap: [10],
    output: ['Initializing stack with capacity 10...', 'Stack created successfully.'],
    activeLine: 15,
    description: 'Push 10 to stack'
  },
  {
    callStack: [
      { id: '3', functionName: 'push(10)', line: 16, fileName: 'stack.cpp' },
      { id: '1', functionName: 'main()', line: 20, fileName: 'stack.cpp' },
      { id: '2', functionName: '_start', line: 0, fileName: 'System' }
    ],
    variables: [
      { name: 'top', value: 0, type: 'int' },
      { name: 'value', value: 10, type: 'int' },
      { name: 'capacity', value: 10, type: 'int' },
      { name: 'data', value: '0x7ffe...', type: 'int*' }
    ],
    heap: [10],
    output: ['Initializing stack with capacity 10...', 'Stack created successfully.', 'Pushed 10 at index 0'],
    activeLine: 16,
    description: 'Print output'
  },
  {
    callStack: [
      { id: '4', functionName: 'push(20)', line: 11, fileName: 'stack.cpp' },
      { id: '1', functionName: 'main()', line: 21, fileName: 'stack.cpp' },
      { id: '2', functionName: '_start', line: 0, fileName: 'System' }
    ],
    variables: [
      { name: 'top', value: 0, type: 'int' },
      { name: 'value', value: 20, type: 'int' },
      { name: 'capacity', value: 10, type: 'int' },
      { name: 'data', value: '0x7ffe...', type: 'int*' }
    ],
    heap: [10],
    output: ['Initializing stack with capacity 10...', 'Stack created successfully.', 'Pushed 10 at index 0'],
    activeLine: 11,
    description: 'Call push(20)'
  },
  {
    callStack: [
      { id: '4', functionName: 'push(20)', line: 15, fileName: 'stack.cpp' },
      { id: '1', functionName: 'main()', line: 21, fileName: 'stack.cpp' },
      { id: '2', functionName: '_start', line: 0, fileName: 'System' }
    ],
    variables: [
      { name: 'top', value: 1, type: 'int' },
      { name: 'value', value: 20, type: 'int' },
      { name: 'capacity', value: 10, type: 'int' },
      { name: 'data', value: '0x7ffe...', type: 'int*' }
    ],
    heap: [10, 20],
    output: ['Initializing stack with capacity 10...', 'Stack created successfully.', 'Pushed 10 at index 0'],
    activeLine: 15,
    description: 'Push 20 to stack'
  },
  {
    callStack: [
      { id: '4', functionName: 'push(20)', line: 16, fileName: 'stack.cpp' },
      { id: '1', functionName: 'main()', line: 21, fileName: 'stack.cpp' },
      { id: '2', functionName: '_start', line: 0, fileName: 'System' }
    ],
    variables: [
      { name: 'top', value: 1, type: 'int' },
      { name: 'value', value: 20, type: 'int' },
      { name: 'capacity', value: 10, type: 'int' },
      { name: 'data', value: '0x7ffe...', type: 'int*' }
    ],
    heap: [10, 20],
    output: ['Initializing stack with capacity 10...', 'Stack created successfully.', 'Pushed 10 at index 0', 'Pushed 20 at index 1'],
    activeLine: 16,
    description: 'Print output'
  },
  {
    callStack: [
      { id: '5', functionName: 'push(42)', line: 11, fileName: 'stack.cpp' },
      { id: '1', functionName: 'main()', line: 22, fileName: 'stack.cpp' },
      { id: '2', functionName: '_start', line: 0, fileName: 'System' }
    ],
    variables: [
      { name: 'top', value: 1, type: 'int' },
      { name: 'value', value: 42, type: 'int' },
      { name: 'capacity', value: 10, type: 'int' },
      { name: 'data', value: '0x7ffe...', type: 'int*' }
    ],
    heap: [10, 20],
    output: ['Initializing stack with capacity 10...', 'Stack created successfully.', 'Pushed 10 at index 0', 'Pushed 20 at index 1'],
    activeLine: 11,
    description: 'Call push(42)'
  },
  {
    callStack: [
      { id: '5', functionName: 'push(42)', line: 15, fileName: 'stack.cpp' },
      { id: '1', functionName: 'main()', line: 22, fileName: 'stack.cpp' },
      { id: '2', functionName: '_start', line: 0, fileName: 'System' }
    ],
    variables: [
      { name: 'top', value: 2, type: 'int' },
      { name: 'value', value: 42, type: 'int' },
      { name: 'capacity', value: 10, type: 'int' },
      { name: 'data', value: '0x7ffe...', type: 'int*' }
    ],
    heap: [10, 20, 42],
    output: ['Initializing stack with capacity 10...', 'Stack created successfully.', 'Pushed 10 at index 0', 'Pushed 20 at index 1'],
    activeLine: 15,
    description: 'Push 42 to stack'
  },
  {
    callStack: [
      { id: '5', functionName: 'push(42)', line: 16, fileName: 'stack.cpp' },
      { id: '1', functionName: 'main()', line: 22, fileName: 'stack.cpp' },
      { id: '2', functionName: '_start', line: 0, fileName: 'System' }
    ],
    variables: [
      { name: 'top', value: 2, type: 'int' },
      { name: 'value', value: 42, type: 'int' },
      { name: 'capacity', value: 10, type: 'int' },
      { name: 'data', value: '0x7ffe...', type: 'int*' }
    ],
    heap: [10, 20, 42],
    output: ['Initializing stack with capacity 10...', 'Stack created successfully.', 'Pushed 10 at index 0', 'Pushed 20 at index 1', 'Pushed 42 at index 2'],
    activeLine: 16,
    description: 'Print output'
  }
];

export function useMockTimeline() {
  const setFrames = useTimelineStore((state) => state.setFrames);
  
  useEffect(() => {
    setFrames(MOCK_FRAMES);
  }, [setFrames]);
}
