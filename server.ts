import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const PORT = 3000;

// Agricultural data simulation
let sensorData = {
  soilMoisture: 45.2,
  npk: {
    nitrogen: 65,
    phosphorus: 42,
    potassium: 58
  },
  temperature: 24.5,
  humidity: 62,
  waterUsage: 12.5,
  timestamp: new Date().toISOString()
};

let weatherData = {
  temp: 28,
  condition: "Sunny",
  humidity: 60,
  windSpeed: 12,
  forecast: [
    { day: "Mon", temp: 29, condition: "Sunny" },
    { day: "Tue", temp: 27, condition: "Partly Cloudy" },
    { day: "Wed", temp: 26, condition: "Rainy" },
    { day: "Thu", temp: 28, condition: "Sunny" },
    { day: "Fri", temp: 30, condition: "Sunny" },
  ]
};

const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const CITY = "Mangalore";

async function fetchLiveWeather() {
  if (!WEATHER_API_KEY || WEATHER_API_KEY.includes("your_actual")) {
    console.log("Using simulated weather data (No valid API key).");
    return;
  }

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&units=metric&appid=${WEATHER_API_KEY}`);
    const data: any = await response.json();

    if (data.cod === "200") {
      const current = data.list[0];
      weatherData = {
        temp: Math.round(current.main.temp),
        condition: current.weather[0].main,
        humidity: current.main.humidity,
        windSpeed: Math.round(current.wind.speed * 3.6), // Convert m/s to km/h
        forecast: data.list.filter((_: any, i: number) => i % 8 === 0).slice(0, 5).map((f: any) => ({
          day: new Date(f.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
          temp: Math.round(f.main.temp),
          condition: f.weather[0].main
        }))
      };
      console.log(`Live weather updated for ${CITY}: ${weatherData.temp}°C, ${weatherData.condition}`);
    } else {
      console.error("Weather API Error:", data.message);
    }
  } catch (error: any) {
    if (error?.cause?.code === 'ENOTFOUND' || error?.code === 'ENOTFOUND') {
      console.warn(`[Weather API] Network issue: Unable to reach OpenWeatherMap (ENOTFOUND). Retrying later.`);
    } else {
      console.error("[Weather API] Failed to fetch live weather:", error.message || error);
    }
  }
}

// Initial fetch and then every 30 minutes
fetchLiveWeather();
setInterval(fetchLiveWeather, 30 * 60 * 1000);

const generateHistory = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map(day => ({
    day,
    moisture: 40 + Math.random() * 30,
    temp: 20 + Math.random() * 10,
    waterUsage: 5 + Math.random() * 15
  }));
};

let historicalTrends = generateHistory();

// Simulate "real-time" changes
setInterval(() => {
  sensorData = {
    soilMoisture: Math.max(0, Math.min(100, sensorData.soilMoisture + (Math.random() - 0.5) * 2)),
    npk: {
      nitrogen: Math.max(0, sensorData.npk.nitrogen + (Math.random() - 0.5) * 1),
      phosphorus: Math.max(0, sensorData.npk.phosphorus + (Math.random() - 0.5) * 1),
      potassium: Math.max(0, sensorData.npk.potassium + (Math.random() - 0.5) * 1)
    },
    temperature: sensorData.temperature + (Math.random() - 0.5) * 0.5,
    humidity: Math.max(0, Math.min(100, sensorData.humidity + (Math.random() - 0.5) * 2)),
    waterUsage: Math.max(0, sensorData.waterUsage + (Math.random() - 0.5) * 5),
    timestamp: new Date().toISOString()
  };
  
  // Slowly vary weather only if live data is not available
  if (!WEATHER_API_KEY || WEATHER_API_KEY.includes("your_actual")) {
    weatherData.temp = Math.max(15, Math.min(45, weatherData.temp + (Math.random() - 0.5) * 0.2));
  }
}, 3000);

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // AI Crop Diagnosis
  app.post("/api/diagnose", async (req, res) => {
    try {
      const { image, language } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Missing image" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                text: `Analyze this image of a plant leaf for any pests or diseases (like Leaf Blast, Rust, etc.). 
                Provide a diagnosis and recommended treatments (both Organic and Chemical). 
                The response MUST be in the following language: ${language}.
                Return the results in a structured JSON format with the following keys:
                - diagnosis: A string stating the disease or pest found (or "Healthy" if none).
                - confidence: A percentage (0-100).
                - organicTreatment: A string describing organic solutions.
                - chemicalTreatment: A string describing chemical solutions.
                - language: The language used.`
              },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: image.split(',')[1] // Assuming base64 data URL
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diagnosis: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              organicTreatment: { type: Type.STRING },
              chemicalTreatment: { type: Type.STRING },
              language: { type: Type.STRING }
            }
          }
        }
      });

      res.json(JSON.parse(response.text));
    } catch (error) {
      console.error("Diagnosis error:", error);
      res.status(500).json({ error: "Analysis failed" });
    }
  });

  // API Route for real-time sensor data
  app.get("/api/sensors", (req, res) => {
    res.json(sensorData);
  });

  app.get("/api/history", (req, res) => {
    res.json(historicalTrends);
  });

  app.get("/api/weather", (req, res) => {
    res.json(weatherData);
  });

  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const VALID_EMAIL = "admin@kisanseva.io";
    const VALID_PASSWORD = "password123";

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      return res.status(200).json({
        success: true,
        message: "Authentication successful",
        user: { email, role: "Farmer" }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password. Please try again."
      });
    }
  });

  app.post("/api/auth/google", (req, res) => {
    const { token } = req.body;
    // Simulate verification
    res.json({ success: true, user: { name: "Google User", email: "google@farm.com" } });
  });

  app.post("/api/auth/phone", (req, res) => {
    const { phone, otp } = req.body;
    // Simulate OTP verification
    if (otp === "123456" || !otp) {
       res.json({ success: true, user: { name: "Phone User", phone } });
    } else {
       res.status(400).json({ success: false, error: "Invalid OTP" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Agricultural Monitor Server running on http://localhost:${PORT}`);
  });
}

startServer();
