const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const PORT = 5000;

// ✅ ایجاد Delay برای جلوگیری از Too Many Requests (429)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ✅ ذخیره زمان آخرین درخواست‌ها برای مدیریت محدودیت‌ها
const rateLimit = new Map();

// ✅ درخواست به API با `Retry` و `Backoff`
const fetchWithRetry = async (url, retries = 3, delayMs = 500) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      return response.data;
    } catch (error) {
      const status = error.response?.status || 500;

      if (status === 429) {
        console.warn(`⚠️ Too Many Requests (Retrying in ${delayMs}ms)...`);
        await delay(delayMs);
        delayMs *= 2; // `Exponential Backoff`
      } else if ([500, 502, 503].includes(status) && attempt < retries) {
        console.warn(`⚠️ Server error ${status}, retrying in ${delayMs}ms...`);
        await delay(delayMs);
        delayMs *= 2;
      } else {
        throw error;
      }
    }
  }
  throw new Error("Maximum retry attempts reached");
};

app.get("/proxy/*", async (req, res) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const now = Date.now();

    // بررسی درخواست‌های مکرر از یک IP خاص (محدودیت 3 ثانیه)
    if (rateLimit.has(ip) && now - rateLimit.get(ip) < 3000) {
      console.warn(`⚠️ Too Many Requests from ${ip}, blocking for 3 seconds`);
      return res.status(429).json({ error: "Too Many Requests. Try again later." });
    }

    rateLimit.set(ip, now);

    let url = req.params[0] + (req._parsedUrl.search || "");
    if (!url) return res.status(400).json({ error: "Missing URL parameter" });

    const fullUrl = `https://api.coincap.io/v2/${url}`;
    console.log(`🔄 Fetching: ${fullUrl}`);

    const data = await fetchWithRetry(fullUrl);
    res.json(data);
  } catch (error) {
    console.error("❌ Proxy Server Error:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Request failed",
      status: error.response?.status || 500,
      details: error.message
    });
  }
});

app.listen(PORT, () => console.log(`🚀 Proxy server running on http://localhost:${PORT}`));
