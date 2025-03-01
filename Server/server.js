const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());

const PORT = 5000;

app.get("/proxy/*", async (req, res) => {
  try {
    let url = req.params[0] + (req._parsedUrl.search || ""); // مدیریت مسیر همراه با `?`
    if (!url) return res.status(400).send("Missing URL parameter");

    const fullUrl = `https://api.coincap.io/v2/${url}`;
    console.log(`🔄 Fetching: ${fullUrl}`);

    const response = await axios.get(fullUrl);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Proxy Server Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Proxy server running on http://localhost:${PORT}`));
