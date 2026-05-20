const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.ALPHAVANTAGE_API_KEY;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "ok" }));

app.get("/api/monthly", async (req, res) => {
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=SPY&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data["Information"] || data["Note"]) {
      return res.status(429).json({ error: "API rate limit reached." });
    }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/daily", async (req, res) => {
  try {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=SPY&outputsize=full&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data["Information"] || data["Note"]) {
      return res.status(429).json({ error: "API rate limit reached." });
    }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/cpi", async (req, res) => {
  try {
    const url = `https://www.alphavantage.co/query?function=CPI&interval=monthly&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));