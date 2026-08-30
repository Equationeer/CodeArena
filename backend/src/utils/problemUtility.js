const axios = require("axios");

const normalizeLanguage = (lang) => {
  if (!lang) return "";
  const l = lang.toString().trim().toLowerCase();
  if (l === "c++" || l === "cpp" || l === "cplusplus") return "cpp";
  if (l === "javascript" || l === "js") return "javascript";
  if (l === "python" || l === "python3" || l === "py") return "python";
  if (l === "java") return "java";
  if (l === "typescript" || l === "ts") return "typescript";
  return l;
};

const getLanguageById = (lang) => {
  const language = {
    "c++": 105,
    "cpp": 105,
    "java": 91,
    "javascript": 97,
    "python": 71,
    "typescript": 74,
  };
  const normalized = normalizeLanguage(lang);
  return language[normalized] || language[lang?.toString().toLowerCase()];
};

const API_KEYS = [
  process.env.JUDGE0_KEY_1,
  process.env.JUDGE0_KEY_2,
  process.env.JUDGE0_KEY_3,
].filter(Boolean);

let index = 0;

const getNextKey = () => {
  const key = API_KEYS[index];
  index = (index + 1) % API_KEYS.length;
  return key;
};

const submitBatch = async (submissions) => {
  if (!API_KEYS.length) {
    throw new Error("No Judge0 API keys found in environment");
  }

  for (let i = 0; i < API_KEYS.length; i++) {
    const key = getNextKey();

    try {
      const response = await axios.request({
        method: "POST",
        url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
        params: {
          base64_encoded: "false",
        },
        headers: {
          "x-rapidapi-key": key,
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          "Content-Type": "application/json",
        },
        data: {
          submissions,
        },
      });

      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      console.error(`Judge0 submitBatch error (HTTP ${status}):`, errorData || error.message);

      if (status === 429 || status === 401) {
        continue;
      }

      const detail = typeof errorData === "object" ? JSON.stringify(errorData) : (errorData || error.message);
      throw new Error(`Judge0 API error: ${detail}`);
    }
  }

  throw new Error("All Judge0 API keys failed in submitBatch");
};

const submitToken = async (resultToken) => {
  if (!API_KEYS.length) {
    throw new Error("No Judge0 API keys found in environment");
  }

  if (!resultToken || resultToken.length === 0) {
    return [];
  }

  const waiting = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  for (let k = 0; k < API_KEYS.length; k++) {
    const key = getNextKey();
    // console.log(key);

    const fetchData = async () => {
      try {
        const response = await axios.request({
          method: "GET",
          url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
          params: {
            tokens: resultToken.join(","),
            base64_encoded: "false",
            fields: "*",
          },
          headers: {
            "x-rapidapi-key": key,
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          },
        });

        return response.data;
      } catch (error) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        console.error(`Judge0 submitToken error (HTTP ${status}):`, errorData || error.message);

        if (status === 429 || status === 401) {
          return null;
        }

        const detail = typeof errorData === "object" ? JSON.stringify(errorData) : (errorData || error.message);
        throw new Error(`Judge0 Token error: ${detail}`);
      }
    };

    let attempts = 10;

    while (attempts > 0) {
      const result = await fetchData();

      if (!result) break;

      const done = result.submissions.every(
        (r) => r.status_id > 2
      );

      if (done) return result.submissions;

      await waiting(2000);
      attempts--;
    }
  }

  throw new Error("All Judge0 API keys failed in submitToken");
};

module.exports = {
  normalizeLanguage,
  getLanguageById,
  submitBatch,
  submitToken,
};