let pyodideReadyPromise = null;

async function loadPyodideEnvironment() {
  if (!pyodideReadyPromise) {
    // Import Pyodide from CDN
    importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");
    pyodideReadyPromise = loadPyodide();
  }
  return pyodideReadyPromise;
}

self.onmessage = async (e) => {
  const { language, code } = e.data;

  if (language === 'python') {
    try {
      self.postMessage({ type: 'status', data: 'Loading Python engine (this takes a few seconds the first time)...' });
      const pyodide = await loadPyodideEnvironment();
      
      self.postMessage({ type: 'status', data: 'Running Python code...' });
      
      // Redirect stdout to capture print() statements
      pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
      `);

      // Run the user's code
      await pyodide.runPythonAsync(code);

      // Fetch the captured stdout
      const output = pyodide.runPython("sys.stdout.getvalue()");
      self.postMessage({ type: 'output', data: output });
      self.postMessage({ type: 'done' });
    } catch (err) {
      self.postMessage({ type: 'error', data: err.message });
      self.postMessage({ type: 'done' });
    }
  } else if (language === 'javascript') {
    self.postMessage({ type: 'status', data: 'Running JavaScript code...' });
    let output = [];
    
    // Capture console.log
    const originalLog = console.log;
    console.log = (...args) => {
      output.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
    };
    
    try {
      // Execute the code safely in the worker context
      const fn = new Function(code);
      fn();
      
      const finalOutput = output.join('\n') + (output.length > 0 ? '\n' : '');
      self.postMessage({ type: 'output', data: finalOutput || 'Execution completed with no output.' });
      self.postMessage({ type: 'done' });
    } catch (err) {
      self.postMessage({ type: 'error', data: err.toString() });
      self.postMessage({ type: 'done' });
    } finally {
      // Restore console.log
      console.log = originalLog;
    }
  } else {
    // Fallback for languages not yet implemented in Wasm
    self.postMessage({ 
      type: 'error', 
      data: `Language '${language}' execution via WebAssembly is currently being set up. Please try Python or JavaScript for now!` 
    });
    self.postMessage({ type: 'done' });
  }
};
