const crypto = require("crypto");
const axios = require("axios");

// ==============================
// Wandbox executor
//
// Free, keyless public compiler service (https://wandbox.org) used when
// Judge0 is not configured, so the Code Lab always produces real output
// without a paid API key. Results are shaped exactly like
// judge0Service.pollSubmission() so the rest of the pipeline is unchanged.
// ==============================

const WANDBOX_URL = process.env.WANDBOX_API_URL || "https://wandbox.org/api/compile.json";

const COMPILERS = {
  c: { compiler: "gcc-13.2.0-c", "compiler-option-raw": "-O2\n-Wall\n-lm" },
  cpp: { compiler: "gcc-13.2.0", options: "c++17", "compiler-option-raw": "-O2\n-Wall" },
  python: { compiler: "cpython-3.12.7" },
};

// Judge0 status ids (see judge0Service STATUS).
const ACCEPTED = 3;
const TIME_LIMIT = 5;
const COMPILATION_ERROR = 6;
const RUNTIME_NZEC = 11;
const RUNTIME_OTHER = 12;

const MAX_OUTPUT = 64 * 1024;
const clip = (text = "") =>
  text.length > MAX_OUTPUT ? `${text.slice(0, MAX_OUTPUT)}\n… output truncated …` : text;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The public service rate-limits bursts (HTTP 429); back off and retry.
async function postWithRetry(body, attempts = 4) {
  for (let attempt = 1; ; attempt++) {
    try {
      const { data } = await axios.post(WANDBOX_URL, body, {
        timeout: 30000,
        headers: { "Content-Type": "application/json" },
      });
      return data;
    } catch (error) {
      if (error.response?.status !== 429 || attempt >= attempts) throw error;
      await delay(1500 * attempt);
    }
  }
}

async function executeCode(code, language, stdin = "") {
  const config = COMPILERS[language];
  if (!config) {
    return { success: false, error: `Unsupported language: ${language}` };
  }

  const started = Date.now();

  try {
    const data = await postWithRetry({ ...config, code, stdin, save: false });

    const elapsed = Date.now() - started;
    const compilerError = data.compiler_error || "";
    const exitStatus = String(data.status ?? "");
    const signal = data.signal || "";

    let statusId = ACCEPTED;
    let statusDescription = "Accepted";

    const compiled = language === "python" || !/\berror\b/i.test(compilerError);

    if (!compiled) {
      statusId = COMPILATION_ERROR;
      statusDescription = "Compilation Error";
    } else if (/killed|cpu time|xcpu/i.test(signal)) {
      statusId = TIME_LIMIT;
      statusDescription = "Time Limit Exceeded";
    } else if (signal) {
      statusId = RUNTIME_OTHER;
      statusDescription = `Runtime Error (${signal})`;
    } else if (exitStatus && exitStatus !== "0") {
      statusId = RUNTIME_NZEC;
      statusDescription = "Runtime Error (NZEC)";
    }

    return {
      success: true,
      stdout: clip(data.program_output || ""),
      stderr: clip(data.program_error || ""),
      compileOutput: clip(compilerError),
      statusId,
      statusDescription,
      time: elapsed,
      memory: null,
      exitCode: exitStatus === "" ? null : Number(exitStatus),
    };
  } catch (error) {
    console.error("Wandbox executeCode error:", error.message);
    return {
      success: false,
      error:
        error.response?.status === 429
          ? "The code runner is busy right now. Please wait a few seconds and run again."
          : error.code === "ECONNABORTED"
          ? "The code runner took too long to respond. Please try again."
          : "The code runner is unreachable right now. Please try again shortly.",
    };
  }
}

// ==============================
// Batch execution: every test case in ONE Wandbox request.
//
// The public service allows only a handful of requests per minute, so
// instead of one request per test case the student's program is wrapped
// in a small harness that runs it once per input in a fresh child process
// (with its own stdin and a time limit) and prints a marker line after
// each run. The combined output is split back into per-case results.
// ==============================
const CASE_TIME_LIMIT_SECONDS = 5;
const SIGALRM = 14;
const SIGNAL_NAMES = { 6: "SIGABRT", 8: "SIGFPE", 9: "SIGKILL", 11: "SIGSEGV" };

// Encode text as a C string literal (UTF-8 bytes pass through unchanged).
const toCString = (text) =>
  `"${String(text).replace(/[\\"\x00-\x1f]/g, (ch) => {
    if (ch === "\\") return "\\\\";
    if (ch === '"') return '\\"';
    if (ch === "\n") return "\\n";
    if (ch === "\t") return "\\t";
    return `\\${ch.charCodeAt(0).toString(8).padStart(3, "0")}`;
  })}"`;

// The student's code is left untouched. A constructor that runs before
// main() forks one child per test case; each child gets that case's stdin
// and a time limit, then returns into the normal startup and runs the
// student's real main(). The parent only waits, prints a marker after each
// child and exits without ever running main() itself.
const buildCHarness = (code, inputs, token) => `${code}
#line 1 "studybuddy_harness"
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>
#include <sys/wait.h>
static const char *sb_inputs[] = { ${inputs.map(toCString).join(", ")} };
__attribute__((constructor(101))) static void sb_run_cases(void) {
    for (int i = 0; i < ${inputs.length}; i++) {
        int fds[2];
        if (pipe(fds) != 0) _exit(1);
        pid_t pid = fork();
        if (pid == 0) {
            close(fds[1]);
            dup2(fds[0], 0);
            close(fds[0]);
            alarm(${CASE_TIME_LIMIT_SECONDS});
            return;
        }
        close(fds[0]);
        const char *in = sb_inputs[i];
        size_t left = strlen(in);
        while (left > 0) {
            ssize_t n = write(fds[1], in, left);
            if (n <= 0) break;
            in += n;
            left -= (size_t)n;
        }
        close(fds[1]);
        int status = 0;
        waitpid(pid, &status, 0);
        char marker[160];
        int len = snprintf(marker, sizeof marker, "\\n${token}{\\"i\\":%d,\\"exit\\":%d,\\"signal\\":%d}\\n", i,
                           WIFEXITED(status) ? WEXITSTATUS(status) : -1,
                           WIFSIGNALED(status) ? WTERMSIG(status) : 0);
        if (write(1, marker, (size_t)len) < 0) _exit(1);
    }
    _exit(0);
}
`;

const buildPythonHarness = (code, inputs, token) => {
  const payload = Buffer.from(JSON.stringify({ code, inputs })).toString("base64");
  return `import base64, json, os, subprocess, sys, tempfile
_p = json.loads(base64.b64decode("${payload}").decode("utf-8"))
_path = os.path.join(tempfile.mkdtemp(), "main.py")
with open(_path, "w", encoding="utf-8") as _f:
    _f.write(_p["code"])
for _i, _inp in enumerate(_p["inputs"]):
    _res = {"i": _i, "exit": 0, "signal": 0, "stderr": ""}
    try:
        _r = subprocess.run([sys.executable, _path], input=_inp, capture_output=True,
                            text=True, timeout=${CASE_TIME_LIMIT_SECONDS})
        _out = _r.stdout
        _res["exit"] = _r.returncode
        _res["stderr"] = _r.stderr.replace(_path, "main.py")[-2000:]
    except subprocess.TimeoutExpired as _e:
        _out = _e.stdout.decode() if isinstance(_e.stdout, bytes) else (_e.stdout or "")
        _res["signal"] = ${SIGALRM}
    sys.stdout.write(_out)
    sys.stdout.write("\\n${token}" + json.dumps(_res) + "\\n")
    sys.stdout.flush()
`;
};

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function executeBatch(code, language, inputs) {
  const config = COMPILERS[language];
  if (!config) {
    return inputs.map(() => ({ success: false, error: `Unsupported language: ${language}` }));
  }

  const token = `SB_CASE_${crypto.randomBytes(6).toString("hex")}`;
  const source =
    language === "python"
      ? buildPythonHarness(code, inputs, token)
      : buildCHarness(code, inputs, token);

  const started = Date.now();
  let data;
  try {
    data = await postWithRetry({ ...config, code: source, stdin: "", save: false });
  } catch (error) {
    console.error("Wandbox executeBatch error:", error.message);
    const message =
      error.response?.status === 429
        ? "The code runner is busy right now. Please wait a few seconds and run again."
        : "The code runner is unreachable right now. Please try again shortly.";
    return inputs.map(() => ({ success: false, error: message }));
  }

  const compilerError = data.compiler_error || "";
  if (language !== "python" && /\berror\b/i.test(compilerError)) {
    return inputs.map(() => ({
      success: true,
      stdout: "",
      stderr: "",
      compileOutput: clip(compilerError),
      statusId: COMPILATION_ERROR,
      statusDescription: "Compilation Error",
      time: Date.now() - started,
      memory: null,
    }));
  }

  const output = data.program_output || "";
  const perCaseTime = Math.round((Date.now() - started) / Math.max(1, inputs.length));
  const markerPattern = new RegExp(`\\n${escapeRegExp(token)}(\\{[^\\n]*\\})\\n`, "g");
  const results = [];
  let segmentStart = 0;

  for (const match of output.matchAll(markerPattern)) {
    let info = {};
    try {
      info = JSON.parse(match[1]);
    } catch {
      // Malformed marker; treated as a plain successful run.
    }
    const stdout = output.slice(segmentStart, match.index);
    segmentStart = match.index + match[0].length;

    let statusId = ACCEPTED;
    let statusDescription = "Accepted";
    if (info.signal === SIGALRM) {
      statusId = TIME_LIMIT;
      statusDescription = "Time Limit Exceeded";
    } else if (info.signal) {
      statusId = RUNTIME_OTHER;
      statusDescription = `Runtime Error (${SIGNAL_NAMES[info.signal] || `signal ${info.signal}`})`;
    } else if (info.exit) {
      statusId = RUNTIME_NZEC;
      statusDescription = `Runtime Error (exit code ${info.exit})`;
    }

    results.push({
      success: true,
      stdout: clip(stdout),
      stderr: clip(info.stderr || ""),
      compileOutput: clip(compilerError),
      statusId,
      statusDescription,
      time: perCaseTime,
      memory: null,
      exitCode: info.exit ?? null,
    });
  }

  // Cases with no marker never finished (the whole run was cut off).
  while (results.length < inputs.length) {
    results.push({
      success: true,
      stdout: "",
      stderr: clip(data.program_error || ""),
      compileOutput: clip(compilerError),
      statusId: TIME_LIMIT,
      statusDescription: "Time Limit Exceeded",
      time: CASE_TIME_LIMIT_SECONDS * 1000,
      memory: null,
    });
  }

  return results;
}

module.exports = { executeCode, executeBatch };
