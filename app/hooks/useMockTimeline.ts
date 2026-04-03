import { useEffect } from 'react';
import { useTimelineStore, TimelineFrame } from '../store/useTimelineStore';

export const useMockTimeline = () => {
  const setFrames = useTimelineStore((state) => state.setFrames);

  useEffect(() => {
    const mockFrames: TimelineFrame[] = [
      {
        heap: {},
        variables: [{ name: 'top', value: -1, type: 'int' }],
        callStack: [{ id: '1', functionName: 'main', line: 20 }],
        output: ['Initializing stack...'],
        activeLine: 20,
        description: 'Calling push(10)'
      },
      {
        heap: {},
        variables: [{ name: 'top', value: -1, type: 'int' }, { name: 'value', value: 10, type: 'int' }],
        callStack: [{ id: '2', functionName: 'push(10)', line: 11 }, { id: '1', functionName: 'main', line: 20 }],
        output: ['Initializing stack...', 'Entering push(10)'],
        activeLine: 11,
        description: 'Function push(10) entered'
      },
      {
        heap: { 0: 10 },
        variables: [{ name: 'top', value: 0, type: 'int' }, { name: 'value', value: 10, type: 'int' }],
        callStack: [{ id: '2', functionName: 'push(10)', line: 15 }, { id: '1', functionName: 'main', line: 20 }],
        output: ['Initializing stack...', 'Entering push(10)', 'Pushed 10 at index 0'],
        activeLine: 15,
        description: 'Assignment: data[++top] = 10'
      },
      {
        heap: { 0: 10 },
        variables: [{ name: 'top', value: 0, type: 'int' }],
        callStack: [{ id: '1', functionName: 'main', line: 21 }],
        output: ['Initializing stack...', 'Entering push(10)', 'Pushed 10 at index 0', 'Exited push(10)'],
        activeLine: 21,
        description: 'Calling push(20)'
      },
      {
        heap: { 0: 10 },
        variables: [{ name: 'top', value: 0, type: 'int' }, { name: 'value', value: 20, type: 'int' }],
        callStack: [{ id: '3', functionName: 'push(20)', line: 11 }, { id: '1', functionName: 'main', line: 21 }],
        output: ['Initializing stack...', 'Entering push(10)', 'Pushed 10 at index 0', 'Exited push(10)', 'Entering push(20)'],
        activeLine: 11,
        description: 'Function push(20) entered'
      },
      {
        heap: { 0: 10, 1: 20 },
        variables: [{ name: 'top', value: 1, type: 'int' }, { name: 'value', value: 20, type: 'int' }],
        callStack: [{ id: '3', functionName: 'push(20)', line: 15 }, { id: '1', functionName: 'main', line: 21 }],
        output: ['Initializing stack...', 'Entering push(10)', 'Pushed 10 at index 0', 'Exited push(10)', 'Entering push(20)', 'Pushed 20 at index 1'],
        activeLine: 15,
        description: 'Assignment: data[++top] = 20'
      },
      {
        heap: { 0: 10, 1: 20 },
        variables: [{ name: 'top', value: 1, type: 'int' }],
        callStack: [{ id: '1', functionName: 'main', line: 22 }],
        output: ['Initializing stack...', 'Entering push(10)', 'Pushed 10 at index 0', 'Exited push(10)', 'Entering push(20)', 'Pushed 20 at index 1', 'Exited push(20)'],
        activeLine: 22,
        description: 'Calling push(42)'
      },
      {
        heap: { 0: 10, 1: 20 },
        variables: [{ name: 'top', value: 1, type: 'int' }, { name: 'value', value: 42, type: 'int' }],
        callStack: [{ id: '4', functionName: 'push(42)', line: 11 }, { id: '1', functionName: 'main', line: 22 }],
        output: ['Initializing stack...', 'Entering push(10)', 'Pushed 10 at index 0', 'Exited push(10)', 'Entering push(20)', 'Pushed 20 at index 1', 'Exited push(20)', 'Entering push(42)'],
        activeLine: 11,
        description: 'Function push(42) entered'
      },
      {
        heap: { 0: 10, 1: 20, 2: 42 },
        variables: [{ name: 'top', value: 2, type: 'int' }, { name: 'value', value: 42, type: 'int' }],
        callStack: [{ id: '4', functionName: 'push(42)', line: 15 }, { id: '1', functionName: 'main', line: 22 }],
        output: ['Initializing stack...', 'Entering push(10)', 'Pushed 10 at index 0', 'Exited push(10)', 'Entering push(20)', 'Pushed 20 at index 1', 'Exited push(20)', 'Entering push(42)', 'Pushed 42 at index 2'],
        activeLine: 15,
        description: 'Assignment: data[++top] = 42'
      }
    ];

    setFrames(mockFrames);
  }, [setFrames]);
};
