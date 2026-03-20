const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/jimin-charts", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://kworb.net/itunes/artist/jimin.html",
      {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const $ = cheerio.load(data);

    const result = {};

    $("td").each((i, el) => {
      const html = $(el).html();
      if (!html) return;

      const lines = html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .split("\n")
        .map(x => x.trim())
        .filter(Boolean);

      const title = lines[0];
      if (!title) return;

      let currentService = null;
      result[title] = {};

      lines.forEach(line => {
        const lower = line.toLowerCase();

        if (lower.includes("spotify")) {
          currentService = "Spotify";
          return;
        }
        if (lower.includes("apple music")) {
          currentService = "Apple Music";
          return;
        }
        if (lower.includes("itunes")) {
          currentService = "iTunes";
          return;
        }
        if (lower.includes("deezer")) {
          currentService = "Deezer";
          return;
        }
        if (lower.includes("shazam")) {
          currentService = "Shazam";
          return;
        }

        const match = line.match(/^#(\d+)\s(.+)/);
        if (!match || !currentService) return;

        if (!result[title][currentService]) {
          result[title][currentService] = [];
        }

        result[title][currentService].push({
          rank: parseInt(match[1]),
          country: match[2],
          isTop1: parseInt(match[1]) === 1
        });
      });

      if (Object.keys(result[title]).length === 0) {
        delete result[title];
      }
    });

    const now = new Date().toLocaleString("en-GB", {
      timeZone: "Asia/Seoul"
    });

    res.json({
      updated: now + " (KST)",
      charts: result
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "fail" });
  }
});

app.listen(3000, () => {
  console.log("🔥 SERVER FINAL JALAN");
});
