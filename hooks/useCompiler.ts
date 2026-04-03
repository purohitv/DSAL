'use client';

import { useState, useRef, useCallback } from 'react';

export function useCompiler() {
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const workerRef = useRef<Worker | null>(null);

  const runCode = useCallback((language: string, code: string) => {
    // Terminate any existing worker to prevent overlapping executions
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    setOutput("");
    setIsRunning(true);

    // Create a new worker instance
    const worker = new Worker('/compiler.worker.js');
    workerRef.current = worker;

    // Set a 10-second timeout to prevent infinite loops from freezing the worker indefinitely
    let timeoutId = setTimeout(() => {
      worker.terminate();
      setOutput(prev => prev + "\n[Error] Execution timed out (Infinite loop detected?).\n");
      setIsRunning(false);
    }, 10000);

    worker.onmessage = (e) => {
      const { type, data } = e.data;
      
      if (type === 'status') {
        setOutput(prev => prev + `[System] ${data}\n`);
      } else if (type === 'output') {
        setOutput(prev => prev + data + '\n');
      } else if (type === 'error') {
        setOutput(prev => prev + `\n[Error] ${data}\n`);
      } else if (type === 'done') {
        clearTimeout(timeoutId);
        setIsRunning(false);
      }
    };

    // Send the code to the worker
    worker.postMessage({ language, code });
  }, []);

  const stopCode = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setOutput(prev => prev + "\n[System] Execution manually stopped.\n");
      setIsRunning(false);
    }
  }, []);

  return { output, isRunning, runCode, stopCode, setOutput };
}
