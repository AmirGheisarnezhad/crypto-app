const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");

// ❗ توکن رو نگه داشتی داخل سورس. بهتره بعداً بذاریم تو ENV روی Render
const COINCAP_API_KEY = "a1a2d89d2b33bc5fff6d14c940b693b3ef058b3f75f966db0e7c381ae5b83dbd";

const app = express();

// روی Render ما روی یک دامین واحد هستیم، پس cors باز هم اشکال نداره
app.use(cors());

// این پورت باید اول از متغیر محیطی بیاد چون Render خودش PORT می‌فرسته
const PORT = process.env.PORT || 5000;

// -------------------- 1) Static frontend serving --------------------
// اینجا فرض می‌کنیم فولدر dist در ریشه ریپو ساخته می‌شود (همون جایی که vite build می‌سازه)
const distPath = path.join(__dirname, "../dist");

// فایل‌های استاتیک React (js, css, images و غیره)
app.use(express.static(distPath));

// -------------------- 2) API proxy route --------------------

// تاخیر برای جلوگیری از Too Many Requests
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// نگه‌داشتن آخرین درخواست‌ها
const rateLimit = new Map();

// درخواست با Retry و Backoff
const fetchWithRetry = async (url, retries = 3, delayMs = 500) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          Authorization: `Bearer ${COINCAP_API_KEY}`,
        },
      });
      return response.data;
    } catch (error) {
      const status = error.response?.status || 500;

      if (status === 429) {
        console.warn(`Too Many Requests (Retrying in ${delayMs}ms)...`);
        await delay(delayMs);
        delayMs *= 2;
      } else if ([500, 502, 503].includes(status) && attempt < retries) {
        console.warn(`Server error ${status}, retrying in ${delayMs}ms...`);
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

    // محدود کردن تعداد درخواست در هر IP
    if (rateLimit.has(ip) && now - rateLimit.get(ip) < 3000) {
      console.warn(`Too Many Requests from ${ip}, blocking for 3 seconds`);
      return res
        .status(429)
        .json({ error: "Too Many Requests. Try again later." });
    }

    rateLimit.set(ip, now);

    let url = req.params[0] + (req._parsedUrl.search || "");
    if (!url) {
      return res
        .status(400)
        .json({ error: "Missing URL parameter" });
    }

    const fullUrl = `https://rest.coincap.io/v3/${url}`;
    console.log(`Fetching: ${fullUrl}`);

    const data = await fetchWithRetry(fullUrl);
    res.json(data);
  } catch (error) {
    console.error("Proxy Server Error:", error.message);
    res.status(error.response?.status || 500).json({
      error: "Request failed",
      status: error.response?.status || 500,
      details: error.message,
    });
  }
});

// -------------------- 3) React Router fallback --------------------
// هر مسیری که API نیست (هر چیزی غیر از /proxy/...) باید index.html رو برگردونه
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// -------------------- 4) Start server --------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
