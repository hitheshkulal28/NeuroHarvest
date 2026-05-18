# NeuroHarvest

<div align="center">
  <img width="800" alt="NeuroHarvest Logo" src="./public/assets/logo.png" />
</div>

An advanced, full-stack Agritech platform designed to empower farmers with intelligent ecosystem analytics, cloud-based computer vision diagnostics, and real-time agricultural market insights. **NeuroHarvest** bridges the gap between low-level hardware telemetry and modern web architecture.

## 🚀 Core Features

* **Crop Doctor (AI Diagnostics):** Integrated with Google Gemini 1.5 Flash (Multimodal Vision API). Allows users to upload or capture images of infected plant foliage to receive an immediate pathological diagnosis, breakdown of active symptoms, treatment routines, and preventative guidance.
* **Mandi Bhav (Live Market Rates):** Powered by direct data streams from the Open Government Data (OGD) Platform India (Agmarknet dataset). Displays daily modal commodity pricing, regional trade variations, and market volume arrivals specifically filtered for trading hubs in Karnataka.
* **Smart Farm Analytics Grid:** A sleek dashboard tracking local microclimate variations (Ambient Temperature, Humidity) alongside primary soil characteristics (Moisture metrics and NPK nutrient profiles). Built to scale into a centralized gateway for remote hardware endpoints.
* **Localization Matrix:** Features local translation pipelines supporting English, Kannada, and localized Tulu language registers to make automated technical data accessible to native farmers.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React.js, TypeScript, Vite, Tailwind CSS
* **Backend Runtime:** Node.js, Express.js
* **Cognitive Processing Engine:** Google Gemini 1.5 Flash (Generative AI Architecture)
* **Telemetry Data Sources:** Data.gov.in (APMC API), OpenWeatherMap API

---

## 📦 Local Installation & Setup

### Prerequisites
Make sure your machine has **Node.js** (LTS version recommended) installed.

### Step-by-Step Guide

1. **Clone the repository and install the project nodes:**
   ```bash
   npm install
2. **Configure Your Environment Variables:**
Create a dedicated .env file in the root project folder and add your verified API credentials:

# API Keys Configuration Matrix
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOI_DATA_API_KEY=your_data_gov_in_api_key_here
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
Boot Up the Local Development Server:

Bash
npm run dev
Launch the Dashboard:
Open your browser and navigate to the address displayed in your terminal (typically http://localhost:3000 or http://localhost:5173).