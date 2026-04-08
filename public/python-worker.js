importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

let pyodideReadyPromise = loadPyodide();

self.onmessage = async (event) => {
  const { id, code, input } = event.data;

  try {
    const pyodide = await pyodideReadyPromise;
    
    // Set input in global scope
    pyodide.globals.set("dsal_input", input || "");
    
    // Create a Python callback for dsal.trace
    pyodide.globals.set("dsal_trace", (data) => {
        // Convert Python dict/lists to JS
        let jsData;
        try {
            jsData = data.toJs({ dict_converter: Object.fromEntries });
        } catch (e) {
            jsData = data; // fallback
        }
        self.postMessage({ type: 'trace', id, data: jsData });
    });

    // Run the user code. We provide a dsal class/object in Python.
    const setupCode = `
import js
class DSAL:
    def trace(self, data):
        js.dsal_trace(data)
dsal = DSAL()
`;
    await pyodide.runPythonAsync(setupCode);
    await pyodide.runPythonAsync(code);
    
    // Attempt to run a main function if it exists
    const runMain = `
if 'main' in globals() and callable(main):
    main(dsal)
`;
    await pyodide.runPythonAsync(runMain);

    self.postMessage({ type: 'done', id });
  } catch (error) {
    self.postMessage({ type: 'error', id, error: error.message });
  }
};
