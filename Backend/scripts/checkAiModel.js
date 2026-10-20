// Checks the connection to the fine-tuned model API (Colab + ngrok) without printing secrets.
// Usage: npm run ai:check
const axios = require("axios");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const modelUrl = (process.env.STUDY_BUDDY_MODEL_URL || "").trim();
const apiToken = (process.env.STUDY_BUDDY_API_TOKEN || "").trim();
const ngrokHeader = { "ngrok-skip-browser-warning": "1" };

const fail = (message) => {
  console.error(`❌ ${message}`);
  process.exit(1);
};

const describe = (error) =>
  error.response
    ? `HTTP ${error.response.status}${
        /ERR_NGROK_\d+/.test(String(error.response.data))
          ? ` (${String(error.response.data).match(/ERR_NGROK_\d+/)[0]})`
          : ""
      }`
    : error.code || error.message;

(async () => {
  if (!modelUrl) fail("STUDY_BUDDY_MODEL_URL is not set in Backend/.env");
  if (!apiToken) fail("STUDY_BUDDY_API_TOKEN is not set in Backend/.env");

  let url;
  try {
    url = new URL(modelUrl);
  } catch {
    fail("STUDY_BUDDY_MODEL_URL is not a valid URL");
  }
  if (!url.pathname.endsWith("/generate")) fail("STUDY_BUDDY_MODEL_URL must end with /generate");

  console.log(`Model host: ${url.host}`);
  console.log(`Local token length: ${apiToken.length} (compare with the length printed by Colab cell 2)`);

  const healthUrl = modelUrl.replace(/\/generate$/, "/health");
  try {
    const health = await axios.get(healthUrl, { headers: ngrokHeader, timeout: 15000 });
    console.log(`✅ /health ${health.status}`, JSON.stringify(health.data));
  } catch (error) {
    fail(
      `/health failed: ${describe(error)}. The Colab runtime or ngrok tunnel is not running — run the notebook, then update STUDY_BUDDY_MODEL_URL if the URL changed.`
    );
  }

  try {
    const started = Date.now();
    const response = await axios.post(
      modelUrl,
      { message: "What is a Python list? Answer in one sentence." },
      { headers: { ...ngrokHeader, Authorization: `Bearer ${apiToken}` }, timeout: 120000 }
    );
    const reply = response.data?.reply;
    if (typeof reply !== "string" || !reply.trim()) fail("/generate returned no valid { reply }");
    console.log(`✅ /generate ${response.status} in ${Date.now() - started}ms`);
    console.log(`Reply: ${reply.slice(0, 300)}`);
  } catch (error) {
    if (error.response?.status === 401) {
      fail(
        "/generate returned 401: the Colab secret STUDY_BUDDY_API_TOKEN does not match Backend/.env. Fix the Colab secret, then rerun notebook cells 2, 5 and 6."
      );
    }
    fail(`/generate failed: ${describe(error)}`);
  }
})();
