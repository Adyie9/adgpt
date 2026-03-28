const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();
const app = express();

app.use(
  cors({
    origin: true, // ✅ Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true // allow cookies and auth headers
  })
);

// ✅ Parse JSON & cookies
app.use(express.json());
app.use(cookieParser());

// ✅ Serve uploads
app.use("/uploads", express.static("uploads"));

// ✅ Connect MongoDB
connectDB();

// ================== Routes ==================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/conversations", require("./routes/conversationRoutes"));

// ✅ Google GenAI
if (!process.env.GENAI_API_KEY) {
  console.error("⚠️ GENAI_API_KEY missing in .env");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: process.env.GENAI_API_KEY });

// ✅ Send message route
app.use("/api/send-message", require("./routes/sendMessage")(ai));

// ✅ Health check
app.get("/", (req, res) => res.send("✅ API is running..."));

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
