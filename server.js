const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
const NAYLA_ID = "65ce68ed1dd7aa2c8c0ca780";

const jkt48API = axios.create({
  baseURL: "https://v2.jkt48connect.com/api",
  headers: {
    "Content-Type": "application/json",
    "X-Web-Secret": process.env.JKT48_WEB_SECRET,
  },
});

const allowedOrigins = [
  "https://backend-seven-nu-19.vercel.app",
  "https://nayrakuen.com",
  "https://www.nayrakuen.com",
  "https://admiral.nayrakuen.com",
  "https://www.admiral.nayrakuen.com",
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log("CORS request from:", origin);

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

const contentRoutes = require("./routes/contentRoutes");
const vcScheduleRoutes = require("./routes/vcScheduleRoutes");
const authRoutes = require("./routes/authRoutes");
const galleryRoutes = require("./routes/gallery");
const newsRoutes = require("./routes/news");
const aboutNaylaRoute = require("./routes/aboutNayla");
const miniProfileRoutes = require("./routes/miniProfile");
const tentangKamiRoute = require("./routes/tentangKami");
const teaterRoutes = require("./routes/teater");
const exportRoute = require("./routes/export");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/vc-schedule", vcScheduleRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/about-nayla", aboutNaylaRoute);
app.use("/api/mini-profile", miniProfileRoutes);
app.use("/api/tentang-kami", tentangKamiRoute);
app.use("/api/teater", teaterRoutes);
app.use("/api", exportRoute);
app.use("/api/admin", adminRoutes);

function timeoutPromise(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
}

let cachedSchedule = null;
let lastFetched = 0;

app.get("/api/nayla/schedule", async (req, res) => {
  const now = Date.now();
  if (cachedSchedule && now - lastFetched < 60_000) {
    return res.json(cachedSchedule);
  }

  try {
    console.log("Memuat jadwal Nayla...");
    const result = await jkt48API.get("/jkt48/theater");
    const shows = result.data?.theater?.slice(0, 10) || [];

    const details = await Promise.all(
      shows.map((show) =>
        timeoutPromise(
          jkt48API.get(`/jkt48/theater/${show.id}`).then((r) => r.data),
          5000
        ).catch(() => null)
      )
    );

    const filtered = [];
    const today = new Date();
    const twoWeeksAhead = new Date();
    twoWeeksAhead.setDate(today.getDate() + 7);

    for (const detail of details) {
      const showDetail = detail?.shows?.[0];
      if (!showDetail) continue;

      const showDate = new Date(showDetail.date);
      const isUpcoming = showDate >= today && showDate <= twoWeeksAhead;

      const adaNayla = showDetail.members?.some(
        (m) => m.url_key?.toLowerCase() === "nayla"
      );

      if (isUpcoming && adaNayla) {
        filtered.push({
          id: showDetail.id,
          title: showDetail.title,
          date: showDetail.date,
          url: showDetail.url,
          members: showDetail.members,
          seitansai: showDetail.seitansai || [],
        });
      }
    }

    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    cachedSchedule = filtered;
    lastFetched = now;
    res.json(filtered);
  } catch (error) {
    console.error("Gagal ambil jadwal Nayla:", error.message);
    res.status(500).json({ error: "Gagal ambil jadwal Nayla" });
  }
});

app.get("/api/nayla/showroom", async (req, res) => {
  try {
    const { data } = await jkt48API.get("/jkt48/showroom");
    const naylaSR = data.find((live) => live.member_id === NAYLA_ID);

    if (!naylaSR) {
      return res.status(404).json({
        error: "Showroom Nayla tidak ditemukan atau tidak sedang live",
      });
    }

    res.json(naylaSR);
  } catch (error) {
    console.error("Gagal ambil data Showroom Nayla:", error.message);
    res.status(500).json({ error: "Gagal ambil data Showroom Nayla" });
  }
});

app.get("/api/nayla/idnlive", async (req, res) => {
  try {
    const { data } = await jkt48API.get("/jkt48/idn");
    const naylaLives = data.filter(
      (item) => item?.creator?.username === "jkt48_nayla"
    );

    if (!naylaLives.length) {
      return res.status(404).json({
        error: "IDN Live Nayla tidak ditemukan atau tidak sedang live",
      });
    }

    const sorted = naylaLives.sort(
      (a, b) => new Date(b.live_at) - new Date(a.live_at)
    );
    res.json(sorted[0]);
  } catch (error) {
    console.error("Gagal ambil data IDN Live Nayla:", error.message);
    res.status(500).json({ error: "Gagal ambil data IDN Live Nayla" });
  }
});

module.exports = app;
