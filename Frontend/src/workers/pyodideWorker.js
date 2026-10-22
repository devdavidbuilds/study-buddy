/* eslint-disable no-restricted-globals */
// Runs student Python in the browser with Pyodide (CPython compiled to
// WebAssembly). Libraries such as numpy, pandas, scikit-learn, scipy,
// sympy and matplotlib are downloaded on demand from the Pyodide CDN the
// first time a program imports them, then cached by the browser.
//
// Two stdin modes:
// - batch (test cases): the whole stdin string is given up front.
// - interactive (the Code Lab terminal): output is streamed to the page as
//   it is printed, and each read of stdin asks the page for a line, then
//   blocks on a synchronous request that public/codelab-stdin-sw.js answers
//   once the student presses Enter.

const PYODIDE_VERSION = '0.26.4';
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
const STDIN_PREFIX = '/__codelab_stdin__/';

let pyodideReady = null;

const loadRuntime = () => {
  if (!pyodideReady) {
    importScripts(`${PYODIDE_URL}pyodide.js`);
    pyodideReady = self.loadPyodide({ indexURL: PYODIDE_URL });
  }
  return pyodideReady;
};

// Collects any matplotlib figures as base64 PNGs, then closes them.
const COLLECT_FIGURES = `
import sys
_sb_figures = []
if "matplotlib.pyplot" in sys.modules:
    import base64, io
    import matplotlib.pyplot as _sb_plt
    for _sb_num in _sb_plt.get_fignums():
        _sb_buf = io.BytesIO()
        _sb_plt.figure(_sb_num).savefig(_sb_buf, format="png", dpi=90, bbox_inches="tight")
        _sb_figures.append(base64.b64encode(_sb_buf.getvalue()).decode("ascii"))
    _sb_plt.close("all")
_sb_figures
`;

// Keep only the student's own frames in a traceback.
const cleanTraceback = (message = '') => {
  const lines = message.split('\n');
  const start = lines.findIndex((line) => line.includes('File "<exec>"'));
  if (start <= 0) return message.trim();
  return ['Traceback (most recent call last):', ...lines.slice(start)].join('\n').trim();
};

// Time spent blocked on the student's typing, left out of the run time.
let inputWaitMs = 0;

// Blocks until the page sends the next typed line; null means end of input.
const readTerminalLine = (id, runId, seq) => {
  const waitStart = performance.now();
  try {
    return requestTerminalLine(id, runId, seq);
  } finally {
    inputWaitMs += performance.now() - waitStart;
  }
};

const requestTerminalLine = (id, runId, seq) => {
  self.postMessage({ id, type: 'input-request' });
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `${STDIN_PREFIX}${runId}/${seq}`, false);
  xhr.send();
  if (xhr.status !== 200 || xhr.getResponseHeader('X-Codelab-Stdin') !== '1') {
    throw new Error('Terminal input is unavailable in this browser.');
  }
  return JSON.parse(xhr.responseText).text;
};

self.onmessage = async (event) => {
  const { id, code, stdin = '', interactive = false, runId = '' } = event.data;
  const stdout = [];
  const stderr = [];

  try {
    self.postMessage({ id, type: 'stage', message: 'Loading Python runtime…' });
    const pyodide = await loadRuntime();

    const packagesBefore = new Set(Object.keys(pyodide.loadedPackages));
    self.postMessage({ id, type: 'stage', message: 'Installing imported libraries…' });
    await pyodide.loadPackagesFromImports(code, {
      messageCallback: (msg) => self.postMessage({ id, type: 'stage', message: msg }),
      errorCallback: (msg) => stderr.push(msg),
    });
    const installed = Object.keys(pyodide.loadedPackages).filter((p) => !packagesBefore.has(p));

    if (interactive) {
      let seq = 0;
      let ended = false;
      // Not a tty: with a tty stdin, input() writes its prompt to stderr.
      pyodide.setStdin({
        stdin: () => {
          if (ended) return null;
          const text = readTerminalLine(id, runId, seq++);
          if (text === null) ended = true;
          return text;
        },
      });
      // Raw writes so prompts without a newline (input("n = ")) show at once.
      const decoder = new TextDecoder();
      const stream = (type) => (bytes) => {
        const text = decoder.decode(bytes, { stream: true });
        if (text) self.postMessage({ id, type, text });
        return bytes.length;
      };
      pyodide.setStdout({ write: stream('stdout'), isatty: true });
      pyodide.setStderr({ write: stream('stderr'), isatty: true });
    } else {
      let stdinUsed = false;
      pyodide.setStdin({
        stdin: () => {
          if (stdinUsed) return null;
          stdinUsed = true;
          return stdin.endsWith('\n') || !stdin ? stdin : `${stdin}\n`;
        },
      });
      pyodide.setStdout({ batched: (text) => stdout.push(text) });
      pyodide.setStderr({ batched: (text) => stderr.push(text) });
    }

    // Fresh globals each run so programs never see the previous run's state.
    const globals = pyodide.globals.get('dict')();
    globals.set('__name__', '__main__');
    // Draw plots off-screen (collected as images below) and hide library
    // deprecation notices that would only confuse students.
    pyodide.runPython(`
import os, warnings
os.environ["MPLBACKEND"] = "AGG"
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", message=".*non-interactive.*")
`);

    self.postMessage({ id, type: 'started' });
    inputWaitMs = 0;
    const started = performance.now();
    let error = '';

    try {
      await pyodide.runPythonAsync(code, { globals });
    } catch (err) {
      error = cleanTraceback(err?.message || String(err));
    }
    // Push out anything still sitting in Python's buffers.
    try { pyodide.runPython('import sys\nsys.stdout.flush()\nsys.stderr.flush()'); } catch { /* ignore */ }

    const time = Math.round(performance.now() - started - inputWaitMs);
    let images = [];
    try {
      images = pyodide.runPython(COLLECT_FIGURES).toJs();
    } catch {
      // No figures or matplotlib unavailable.
    }
    globals.destroy();

    self.postMessage({
      id,
      type: 'result',
      stdout: stdout.join('\n'),
      stderr: [...stderr, error].filter(Boolean).join('\n'),
      error,
      images,
      installed,
      time,
    });
  } catch (err) {
    self.postMessage({
      id,
      type: 'result',
      stdout: stdout.join('\n'),
      stderr: String(err?.message || err),
      error: `Could not start Python in the browser: ${err?.message || err}`,
      images: [],
      installed: [],
      time: 0,
    });
  }
};
