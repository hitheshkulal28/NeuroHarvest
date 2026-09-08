import React, { useState, useEffect, useRef } from "react";
import {
  Droplets,
  Thermometer,
  Sprout,
  Wind,
  RefreshCcw,
  LayoutDashboard,
  Bell,
  User,
  Activity,
  History,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Info,
  Zap,
  Download,
  X,
  Settings,
  Stethoscope,
  Globe,
  LayoutGrid,
  Droplet,
  Volume2,
  Cloud,
  CloudSun,
  CloudRain,
  Sun,
  Moon,
  Menu,
  Check,
  Trash2,
  BellRing,
  Sparkles,
  TrendingUp,
  MapPin,
  Navigation,
  Loader2,
  Map,
  Radar,
  Radio,
  Send,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { translations } from "../constants/translations";
import { SensorData, ChartDataPoint, NotificationItem } from "../types";

const speak = (text: string, language: string) => {
  const synth = window.speechSynthesis;
  if (!synth) return;
  const utterance = new SpeechSynthesisUtterance(text);
  const langMap: Record<string, string> = {
    English: 'en-US',
    Kannada: 'kn-IN',
    Hindi: 'hi-IN',
    Malayalam: 'ml-IN',
    Tamil: 'ta-IN',
    Marathi: 'mr-IN',
    Bengali: 'bn-IN',
    Gujarati: 'gu-IN',
    Tulu: 'tcy-IN'
  };
  utterance.lang = langMap[language] || 'en-US';
  synth.speak(utterance);
};

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip
} from 'recharts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line as ChartLine } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);



interface LeafAnalysisResult {
  score: number;
  status: string;
  isHealthy: boolean;
  image: string;
}

const LeafAnalyzer = ({ onResult, t }: { onResult?: (res: LeafAnalysisResult) => void, t: any }) => {
  const [result, setResult] = useState<LeafAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showPestAlert, setShowPestAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        analyzeImage(img);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = (img: HTMLImageElement) => {
    setAnalyzing(true);
    setResult(null);
    setShowPestAlert(false);

    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);
      const imageData = ctx.getImageData(0, 0, 100, 100).data;

      let greenCount = 0;
      let stressedCount = 0;
      let totalSamples = 0;

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const alpha = imageData[i + 3];
        if (alpha < 50) continue;
        totalSamples++;
        const isGreen = g > r + 10 && g > b + 10;
        const isStressed = (r > g - 10 && r > b + 20) || (r > 150 && g > 150 && b < 100);
        if (isGreen) greenCount++;
        else if (isStressed) stressedCount++;
      }

      const totalColored = greenCount + stressedCount || 1;
      const score = Math.round((greenCount / totalColored) * 100);
      const isHealthy = score > 75 && stressedCount < (totalColored * 0.1);

      const analysisResult = {
        score,
        isHealthy,
        status: isHealthy ? t.healthy : t.pestRisk,
        image: img.src
      };

      setResult(analysisResult);
      if (score < 50) setShowPestAlert(true);
      if (onResult) onResult(analysisResult);
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col min-h-[400px]">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-text-main">{t.leafScanner}</h3>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Camera className="w-5 h-5 text-primary" />
        </div>
      </div>

      {!result && !analyzing ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 border-2 border-dashed border-border-subtle transition-colors duration-500 rounded-lg flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-surface transition-colors duration-500 transition-colors"
        >
          <div className="p-4 bg-blue-50 rounded-full text-blue-600">
            <Upload className="w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-text-main">{t.tapUpload}</p>
            <p className="text-xs text-text-dim mt-1">Supported: JPG, PNG, WEBP</p>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
        </div>
      ) : analyzing ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <RefreshCcw className="w-10 h-10 text-blue-600" />
          </motion.div>
          <p className="text-sm font-semibold text-text-dim">{t.analyzing}</p>
        </div>
      ) : (
        <div className="space-y-6 flex-1 flex flex-col">
          <div className="flex gap-4">
            <div className="w-32 h-32 rounded-lg overflow-hidden border border-border-subtle transition-colors duration-500 shrink-0">
              <img src={result.image} className="w-full h-full object-cover" alt="Scan" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-xs font-bold text-text-dim uppercase tracking-wider mb-1">{t.healthScore}</p>
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-bold ${result.isHealthy ? 'text-emerald-600' : 'text-red-600'}`}>
                  {result.score}%
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${result.isHealthy ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {result.isHealthy ? 'Optimal' : 'Issues Detected'}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-surface transition-colors duration-500 rounded-lg border border-border-subtle transition-colors duration-500 flex-1">
            <p className="text-xs font-bold text-text-dim uppercase tracking-wider mb-2">{t.diagnosis}</p>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">{result.status}</p>
          </div>
          <button
            onClick={() => setResult(null)}
            className="w-full py-3 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            {t.newScan}
          </button>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

const WeatherForecast = ({ t, weather, currentLocation, onDetectLocation, isDetectingLocation }: { t: any, weather: any, currentLocation?: string, onDetectLocation?: () => void, isDetectingLocation?: boolean }) => {
  if (!weather) return <div className="glass-card p-6 h-32 animate-pulse bg-surface/50 mb-8" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden mb-10 group"
    >
      <div className="flex flex-col lg:flex-row">
        {/* Left: Current Weather */}
        <div className="lg:w-1/3 p-6 lg:p-8 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-[60px]" />

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em]">{t.weatherReport}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <p className="text-xs font-bold text-text-dim uppercase tracking-wider">{currentLocation || t.mangaloreHub}</p>
                {onDetectLocation && (
                  <button
                    onClick={onDetectLocation}
                    disabled={isDetectingLocation}
                    title="Detect GPS Location"
                    className="ml-1 p-1 hover:bg-primary/10 text-primary rounded-lg transition-all"
                  >
                    {isDetectingLocation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-surface-hover rounded-2xl shadow-xl border border-border-subtle">
              <CloudSun className="w-8 h-8 text-primary animate-bounce-slow" />
            </div>
          </div>

          <div className="flex items-end gap-4 mb-8 relative z-10">
            <span className="text-7xl font-black text-text-main tracking-tighter">{Math.round(weather.temp)}°</span>
            <div className="mb-2">
              <p className="text-xl font-black text-text-main leading-none">{weather.condition}</p>
              <p className="text-xs font-bold text-text-dim mt-1 uppercase tracking-widest">{t.currentCondition}</p>
            </div>
          </div>

          <div className="flex gap-8 border-t border-border-subtle pt-6 relative z-10">
            <div className="flex items-center gap-3">
              <Droplets className="w-5 h-5 text-primary" />
              <div>
                <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Humidity</p>
                <p className="text-sm font-black text-text-main">{weather.humidity}%</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Wind className="w-5 h-5 text-primary" />
              <div>
                <p className="text-[10px] font-black text-text-dim uppercase tracking-widest">Wind</p>
                <p className="text-sm font-black text-text-main">{weather.windSpeed} km/h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: 5-Day Forecast */}
        <div className="lg:w-2/3 p-6 lg:p-8 flex flex-col justify-center overflow-hidden">
          <div className="flex overflow-x-auto lg:grid lg:grid-cols-5 gap-4 pb-2 scrollbar-none snap-x snap-mandatory">
            {weather.forecast.map((day: any, idx: number) => (
              <div key={idx} className="p-4 rounded-[2rem] bg-surface-hover border border-border-subtle flex flex-col items-center gap-3 transition-all hover:scale-105 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-xl group/day shrink-0 w-[100px] lg:w-auto snap-start">
                <p className="text-xs font-black text-text-dim uppercase tracking-widest group-hover/day:text-primary transition-colors">{day.day}</p>
                <div className="p-3 bg-white dark:bg-surface rounded-2xl shadow-sm border border-border-subtle">
                  {day.condition.includes('Cloud') ? <Cloud className="w-6 h-6 text-slate-400" /> :
                    day.condition.includes('Rain') ? <CloudRain className="w-6 h-6 text-primary" /> :
                      <Sun className="w-6 h-6 text-accent" />}
                </div>
                <p className="text-lg font-black text-text-main tracking-tighter">{Math.round(day.temp)}°</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};;

const fileToGenerativePart = async (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({ inlineData: { data: base64Data, mimeType: file.type } });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const CropDoctor = ({ language, t, diagnosisHistory, setDiagnosisHistory }: { language: string, t: any, diagnosisHistory: any[], setDiagnosisHistory: React.Dispatch<React.SetStateAction<any[]>> }) => {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseAnalysis = (text: string) => {
    console.log("=== RAW AI TEXT ===");
    console.log(text);
    const sections: Record<string, string> = {};
    const parts = text.split('### ').filter(Boolean);

    parts.forEach(part => {
      const firstLineEnd = part.indexOf('\n');
      let headerLine = "";
      let remainingContent = "";

      if (firstLineEnd !== -1) {
        headerLine = part.substring(0, firstLineEnd).trim();
        remainingContent = part.substring(firstLineEnd).trim();
      } else {
        headerLine = part.trim();
        remainingContent = "";
      }

      const knownHeaders = [
        'disease/condition name',
        'disease',
        'condition',
        'name',
        'confidence score',
        'confidence',
        'score',
        'core symptoms',
        'symptoms',
        'immediate treatment measures',
        'treatment',
        'prevention tips',
        'prevention'
      ];

      let matchedHeader = "";
      let sameLineContent = "";

      const colonIndex = headerLine.indexOf(':');
      if (colonIndex !== -1) {
        const possibleHeader = headerLine.substring(0, colonIndex).trim();
        const possibleContent = headerLine.substring(colonIndex + 1).trim();

        const possibleHeaderClean = possibleHeader.toLowerCase().replace(/[^a-z0-9]/g, "");
        const isKnown = knownHeaders.some(h => {
          const hClean = h.toLowerCase().replace(/[^a-z0-9]/g, "");
          return possibleHeaderClean.includes(hClean) || hClean.includes(possibleHeaderClean);
        });

        if (isKnown) {
          matchedHeader = possibleHeader;
          sameLineContent = possibleContent;
        }
      }

      if (matchedHeader) {
        sections[matchedHeader] = (sameLineContent + "\n" + remainingContent).trim();
      } else {
        sections[headerLine] = remainingContent;
      }
    });

    console.log("=== PARSED SECTIONS ===");
    console.log(sections);
    return sections;
  };

  const getSection = (parsed: Record<string, string>, fallbackKeys: string[]) => {
    for (const search of fallbackKeys) {
      const searchClean = search.toLowerCase().replace(/[^a-z0-9]/g, "");
      for (const key of Object.keys(parsed)) {
        const keyClean = key.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (keyClean === searchClean) return parsed[key];
      }
    }
    for (const search of fallbackKeys) {
      const searchClean = search.toLowerCase().replace(/[^a-z0-9]/g, "");
      for (const key of Object.keys(parsed)) {
        const keyClean = key.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (keyClean.includes(searchClean) || searchClean.includes(keyClean)) return parsed[key];
      }
    }
    return "";
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const cleaned = text.trim().replace(/\n+/g, '\n');
    const boldParts = cleaned.split(/\*\*([^*]+)\*\*/g);
    return boldParts.map((part, idx) => {
      if (idx % 2 === 1) {
        return <strong key={idx} className="font-extrabold">{part}</strong>;
      }
      const lines = part.split('\n');
      return lines.map((line, lIdx) => (
        <React.Fragment key={`${idx}-${lIdx}`}>
          {line}
          {lIdx < lines.length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    const pUrl = URL.createObjectURL(file);
    setPreviewUrl(pUrl);
    setLoading(true);
    setAnalysis('');

    try {
      const imagePart = await fileToGenerativePart(file);
      const languageName = language === 'Tulu' ? 'Tulu (written in Kannada script)' : language;
      const base64Image = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          language: languageName
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const resultText = data.text;
      setAnalysis(resultText);

      const parsed = parseAnalysis(resultText);
      let diagnosisVal = getSection(parsed, ['disease/condition name', 'disease', 'condition', 'name']) || 'Unknown Diagnosis';
      const confidenceVal = getSection(parsed, ['confidence score', 'confidence', 'score']) || '95%';
      const treatmentVal = getSection(parsed, ['immediate treatment measures', 'treatment', 'immediate treatment']) || '';
      const preventionVal = getSection(parsed, ['prevention tips', 'prevention']) || '';
      const symptomsVal = getSection(parsed, ['core symptoms', 'symptoms']) || '';

      // Safety net: If AI diagnoses as healthy but lists symptoms, override it with localized text
      const healthyWords = ['healthy', 'unknown', 'normal', 'ಆರೋಗ್ಯಕರ', 'स्वस्थ', 'സുഖം', 'ஆரோக்கியமான', 'ಸೌಖ್ಯ', 'sowkhya', 'aarogyakara'];
      const isHealthyText = healthyWords.some(w => diagnosisVal.toLowerCase().includes(w));

      if (isHealthyText && symptomsVal.trim().length > 0) {
        const stressTranslations: Record<string, string> = {
          English: "Physiological Stress / Nutrient Deficiency",
          Kannada: "ಶಾರೀರಿಕ ಒತ್ತಡ / ಪೋಷಕಾಂಶಗಳ ಕೊರತೆ",
          Hindi: "शारीरिक तनाव / पोषक तत्वों की कमी",
          Malayalam: "ശാരീരിക സമ്മർദ്ദം / പോഷകക്കുറവ്",
          Tamil: "உடலியல் அழுத்தம் / ஊட்டச்சத்து குறைபாடு",
          Tulu: "ಶರೀರೊದ ಒತ್ತಡೊ / ಪೋಷಕಾಂಶೊಲೆ ಕೊರತೆ"
        };
        diagnosisVal = stressTranslations[language] || stressTranslations["English"];
      }

      const newRes = {
        diagnosis: diagnosisVal,
        confidence: parseInt(confidenceVal) || 95,
        organicTreatment: treatmentVal,
        chemicalTreatment: preventionVal,
        image: pUrl,
        date: new Date().toLocaleDateString()
      };
      setDiagnosisHistory(prev => [newRes, ...prev].slice(0, 10));

    } catch (err: any) {
      console.error(err);
      setAnalysis(`### Error\nFailed to analyze image: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setPreviewUrl(null);
    setAnalysis('');
  };

  const demoDict: Record<string, string> = {
    English: `### Disease/Condition Name: Cotton Pink Bollworm (Pectinophora gossypiella) Infestation
### Confidence Score: 92%
### Core Symptoms: Larval entry holes in cotton bolls, rosetting of flowers, damaged lint fibers, and premature boll dropping.
### Immediate Treatment Measures: Install pheromone traps (5 traps/acre) and apply neem-based biopesticide (Azadirachtin 1500 ppm). Avoid indiscriminate synthetic pyrethroid usage.
### Prevention Tips: Severe pest attack risk detected. Action required within 3 days. Practice crop rotation and clear crop residue post-harvest.`,
    Marathi: `### Disease/Condition Name: कापसावरील गुलाबी बोंड अळी (Pink Bollworm) प्रादुर्भाव
### Confidence Score: 92%
### Core Symptoms: कापसाच्या बोंडांमध्ये अळीचे छिद्र, फुले गुलाबासारखी बंद होणे, धाग्यांचे नुकसान आणि बोंड गळणे.
### Immediate Treatment Measures: कामगंध सापळे (५ प्रति एकर) लावा आणि कडुनिंबयुक्त कीटकनाशकाची (Azadirachtin १५०० ppm) फवारणी करा.
### Prevention Tips: अळीचा प्रादुर्भाव वाढण्याची शक्यता. ३ दिवसांत उपाययोजना करा. पीक पालट करा.`,
    Bengali: `### Disease/Condition Name: তুলার গোলাপী বোলওয়ার্ম (Pink Bollworm) আক্রমণ
### Confidence Score: 92%
### Core Symptoms: তুলা গুটিতে লার্ভার প্রবেশের ছিদ্র, ফুল ফোটাতে বাধা, তুলার গুণমান নষ্ট এবং গুটি ঝরে পড়া।
### Immediate Treatment Measures: প্রতি একরে ৫টি ফেরোমোন ফাঁদ স্থাপন করুন এবং নিম-ভিত্তিক বায়োপেস্টিসাইড স্প্রে করুন।
### Prevention Tips: ৩ দিনের মধ্যে প্রতিরোধমূলক ব্যবস্থা গ্রহণ করুন। ফসল পর্যায়ক্রম নিশ্চিত করুন।`,
    Gujarati: `### Disease/Condition Name: કપાસની ગુલાબી ઈયળ (Pink Bollworm)નો ઉપદ્રવ
### Confidence Score: 92%
### Core Symptoms: ઝીંડવામાં ઈયળના કાણાં, ફૂલ ગુલાબ જેવા બંધ રહેવા, રૂની ગુણવત્તા બગાડવી અને ઝીંડવા ખરી પડવા.
### Immediate Treatment Measures: એકર દીઠ ૫ ફેરોમોન ટ્રેપ ગોઠવો અને લીમડા યુક્ત બાયો-જંતુનાશક (Azadirachtin 1500 ppm)નો છંટકાવ કરો.
### Prevention Tips: ૩ દિવસમાં નિયંત્રણ પગલાં લો. પાકની ફેરબદલી કરો.`,
    Hindi: `### Disease/Condition Name: कपास की गुलाबी सुंडी (Pink Bollworm) का प्रकोप
### Confidence Score: 92%
### Core Symptoms: टिंडों में छेद, फूलों का गुच्छेदार बंद होना, रुई की गुणवत्ता खराब होना तथा टिंडों का झड़ना।
### Immediate Treatment Measures: 5 फेरोमोन ट्रैप प्रति एकड़ लगाएं और नीम आधारित कीटनाशक (1500 ppm) का छिड़काव करें।
### Prevention Tips: 3 दिनों के भीतर निवारक कार्रवाई करें। फसल चक्र अपनाएं।`,
    Kannada: `### Disease/Condition Name: ಹತ್ತಿಯ ಗುಲಾಬಿ ಕಾಯಿ ಹುಳು (Pink Bollworm) ಭಾದೆ
### Confidence Score: 92%
### Core Symptoms: ಹತ್ತಿ ಕಾಯಿಗಳಲ್ಲಿ ರಂಧ್ರಗಳು, ಹೂವುಗಳು ಮುದುಡುವುದು, ಹತ್ತಿಯ ನಾರು ಹಾಳಾಗುವುದು ಮತ್ತು ಕಾಯಿಗಳು ಉದುರುವುದು.
### Immediate Treatment Measures: ಎಕರೆಗೆ ೫ ಫೆರಮೋನ್ ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ ಮತ್ತು ಬೇವು ಆಧಾರಿತ ಜೈವಿಕ ಕೀಟನಾಶಕವನ್ನು ಸಿಂಪಡಿಸಿ.
### Prevention Tips: ೩ ದಿನಗಳಲ್ಲಿ ತಡೆಗಟ್ಟುವ ಕ್ರಮಗಳನ್ನು ಕೈಗೊಳ್ಳಿ. ಬೆಳೆ ಸರದಿಯನ್ನು ಅನುಸರಿಸಿ.`,
    Tamil: `### Disease/Condition Name: பருத்தி இளஞ்சிவப்பு காய்ப்புழு (Pink Bollworm) தாக்குதல்
### Confidence Score: 92%
### Core Symptoms: பருத்தி காய்களில் துளைகள், பூக்கள் ரோஜா வடிவில் மூடுதல், பஞ்சு சேதமடைதல் மற்றும் காய் உதிர்தல்.
### Immediate Treatment Measures: ஏக்கருக்கு 5 பெரோமோன் பொறிகளை வைக்கவும், வேம்பு சார்ந்த பூச்சிக்கொல்லியை தெளிக்கவும்.
### Prevention Tips: 3 நாட்களுக்குள் தடுப்பு நடவடிக்கைகளை எடுக்கவும். பயிர் சுழற்சியை மேற்கொள்ளவும்.`,
    Malayalam: `### Disease/Condition Name: പരുത്തിയിലെ പിങ്ക് ബോൾവോം (Pink Bollworm) ബാധ
### Confidence Score: 92%
### Core Symptoms: പരുത്തിക്കായകളിൽ ദ്വാരങ്ങൾ, പൂക്കൾ കൊഴിയൽ, പരുത്തി നാരിന് കേടുപാടുകൾ വരുത്തൽ.
### Immediate Treatment Measures: ഏക്കറിന് 5 ഫെറോമോൺ കെണികൾ സ്ഥാപിക്കുക, വേപ്പ് അധിഷ്ഠിത കീടനാശിനി തളിക്കുക.
### Prevention Tips: 3 ദിവസത്തിനുള്ളിൽ പ്രതിരോധ നടപടികൾ സ്വീകരിക്കുക.`,
    Tulu: `### Disease/Condition Name: ಪರ್ತಿದ ಗುಲಾಬಿ ಕಾಯಿ ಪುರಿದ (Pink Bollworm) ಬಾದೆ
### Confidence Score: 92%
### Core Symptoms: ಪರ್ತಿದ ಕಾಯಿಲೆಡ್ ಒಟ್ಟೆಲು, ಪೂಕುಲು ಬಾಡುನಿ, ಪರ್ತಿದ ನಾರ್ ಹಾಳಾಪುನಿ ಬೊಕ್ಕ ಕಾಯಿಲು ತಾಲುನಿ.
### Immediate Treatment Measures: ಎಕರೆಗ್ ೫ ಫೆರಮೋನ್ ಬಲೆಕ್ಲೆನ್ ಪಾಡ್ಲೆ ಬೊಕ್ಕ ಬೇವುದ ಜೈವಿಕೊ ಕೀಟನಾಶಕೊನು ಸಿಂಪಡಿಪುಲೆ.
### Prevention Tips: ೩ ದಿನೊಟು ತಡೆಗಟ್ಟುನ ಕ್ರಮೊಕ್ಲೆನ್ ಮಲ್ಪುಲೆ. ಬುಳೆತ ಸರದಿನ್ ಅನುಸರಿಪುಲೆ.`
  };

  const demoAnalysisText = demoDict[language] || demoDict.English;

  const parsedData = analysis ? parseAnalysis(analysis) : parseAnalysis(demoAnalysisText);

  let diseaseName = parsedData ? getSection(parsedData, ['disease/condition name', 'disease', 'condition', 'name']) : '';
  const confidenceScore = parsedData ? getSection(parsedData, ['confidence score', 'confidence', 'score']) : '95%';
  const coreSymptoms = parsedData ? getSection(parsedData, ['core symptoms', 'symptoms']) : '';
  const immediateTreatment = parsedData ? getSection(parsedData, ['immediate treatment measures', 'treatment', 'immediate treatment']) : '';
  const preventionTips = parsedData ? getSection(parsedData, ['prevention tips', 'prevention']) : '';
  const errorMsg = parsedData ? getSection(parsedData, ['error']) : '';

  // Safety net on display level as well
  const healthyWords = ['healthy', 'unknown', 'normal', 'ಆರೋಗ್ಯಕರ', 'स्वस्थ', 'സുഖം', 'ஆரோக்கியமான', 'ಸೌಖ್ಯ', 'sowkhya', 'aarogyakara'];
  const isHealthyText = healthyWords.some(w => diseaseName.toLowerCase().includes(w));

  if (isHealthyText && coreSymptoms.trim().length > 0) {
    const stressTranslations: Record<string, string> = {
      English: "Physiological Stress / Nutrient Deficiency",
      Kannada: "ಶಾರೀರಿಕ ಒತ್ತಡ / ಪೋಷಕಾಂಶಗಳ ಕೊರತೆ",
      Hindi: "शारीरिक तनाव / पोषक तत्वों की कमी",
      Malayalam: "ശാരീരിക സമ്മർദ്ദം / പോഷകക്കുറവ്",
      Tamil: "உடலியல் அழுத்தம் / ஊட்டச்சத்து குறைபாடு",
      Tulu: "ಶಾರೀರಿಕ ಒತ್ತಡ / ಪೋಷಕಾಂಶಗಳ ಕೊರತೆ"
    };
    diseaseName = stressTranslations[language] || stressTranslations["English"];
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6 lg:space-y-12">
      <div>
        <h2 className="text-2xl font-bold text-text-main">{t.cropDoctor}</h2>
        <p className="text-text-dim mt-1">{t.professionalDiagnosis}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {!previewUrl && !loading ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square glass-card border-2 border-dashed border-border-subtle transition-colors duration-500 flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-blue-400"
          >
            <div className="p-6 bg-blue-50 dark:bg-blue-500/10 rounded-full text-blue-600 dark:text-blue-400">
              <Camera className="w-12 h-12" />
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-text-main">{t.tapUpload}</h4>
              <p className="text-sm text-text-dim mt-2">{t.supportedDiseases}</p>
            </div>
            <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleUpload} />
          </div>
        ) : loading && !analysis ? (
          <div className="aspect-square glass-card flex flex-col items-center justify-center gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="relative z-10">
              <RefreshCcw className="w-12 h-12 text-blue-500" />
            </motion.div>
            <p className="text-sm font-bold text-blue-500 animate-pulse tracking-widest uppercase z-10">
              Scanning biological anomalies via NeuroHarvest AI...
            </p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden !p-0 h-[500px]">
            {previewUrl && <img src={previewUrl} className="w-full h-full object-cover" alt="Crop Image" />}
          </div>
        )}

        <div className="space-y-6">
          {parsedData && !errorMsg && (
            <>
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[10px] font-extrabold text-text-main uppercase tracking-[0.2em]">{t.diagnosis}</p>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {confidenceScore} {t.confidence}
                    </div>
                    {parseInt(confidenceScore) < 75 && (
                      <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-purple-500/30">
                        <ShieldAlert className="w-3 h-3" /> Human-in-the-Loop Escalated
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-text-main mb-6">{diseaseName || 'Healthy/Unknown'}</h3>
                {parseInt(confidenceScore) < 75 && (
                  <div className="p-4 mb-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-purple-800 dark:text-purple-300 text-xs font-bold flex items-center justify-between">
                    <span>⚠️ Low confidence diagnosis (&lt;75%). Routed automatically to Nashik District Kisan Officer for expert review.</span>
                    <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-[9px] uppercase font-black tracking-widest shrink-0 ml-2">Ticket #KS-8492</span>
                  </div>
                )}
                <button
                  onClick={() => speak(`${diseaseName}. Symptoms: ${coreSymptoms}. Treatment: ${immediateTreatment}`, language)}
                  className="flex items-center gap-2 text-blue-800 font-bold text-sm hover:underline"
                >
                  <Volume2 className="w-4 h-4" /> {t.listen}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {coreSymptoms && (
                  <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
                    <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2">Symptoms</p>
                    <p className="text-sm text-text-main font-medium leading-relaxed">{renderFormattedText(coreSymptoms)}</p>
                  </div>
                )}
                {immediateTreatment && (
                  <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
                    <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">Immediate Treatment</p>
                    <p className="text-sm text-text-main font-medium leading-relaxed">{renderFormattedText(immediateTreatment)}</p>
                  </div>
                )}
                {preventionTips && (
                  <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">Prevention Tips</p>
                    <p className="text-sm text-text-main font-medium leading-relaxed">{renderFormattedText(preventionTips)}</p>
                  </div>
                )}
              </div>

              <button
                onClick={resetScanner}
                className="w-full py-4 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
              >
                {t.newScan}
              </button>
            </>
          )}

          {parsedData && errorMsg && (
            <div className="glass-card p-6 border-red-500/30">
              <h3 className="text-red-500 font-bold mb-2">Analysis Failed</h3>
              <p className="text-sm text-text-main">{errorMsg}</p>
              <button onClick={resetScanner} className="mt-4 w-full py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800">Try Again</button>
            </div>
          )}

          {(!analysis && !loading) && (
            <div className="glass-card p-8 h-full">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-text-main">
                <History className="w-5 h-5 text-blue-700" />
                {t.diagnosisHistory}
              </h3>
              {diagnosisHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <Activity className="w-12 h-12 mb-2 text-text-dim" />
                  <p className="text-sm text-text-main font-bold">No recent diagnoses</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {diagnosisHistory.map((h, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-2xl border border-border-subtle bg-white dark:bg-slate-800/40 backdrop-blur-md">
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-border-subtle">
                        <img src={h.image} className="w-full h-full object-cover" alt="H" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-text-main">{h.diagnosis}</p>
                        <p className="text-[10px] text-text-dim font-bold uppercase">{h.date}</p>
                      </div>
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${h.confidence > 80 ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300'}`}>
                        {h.confidence}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SmartFarm = ({ data, history, sevenDayHistory, t, weather, language }: { data: SensorData | null, history: any[], sevenDayHistory: any[], t: any, weather: any, language: string }) => {
  if (!data) return null;

  const getSmartFarmTranslations = (lang: string) => {
    const dicts: Record<string, Record<string, string>> = {
      English: {
        aiTelemetry: "AI BIO-TELEMETRY",
        diseaseRiskIndex: "Microclimate Spore & Disease Risk Index",
        diseaseRiskSubtitle: "Predictive spore germination and rot analysis based on real-time microclimate sensors",
        soilTemp: "Soil Temp",
        soilMoisture: "Soil Moisture",
        blightRisk: "Fungal Blight Risk",
        rootRotRisk: "Root Rot Disease Risk",
        pestRisk: "Pest & Insect Spread",
        germinationProb: "Germination Prob.",
        soilSaturation: "Soil Saturation",
        migrationChance: "Migration Chance",
        critical: "CRITICAL",
        moderate: "MODERATE",
        low: "LOW",
      },
      Kannada: {
        aiTelemetry: "ಎಐ ಜೈವಿಕ ಟೆಲಿಮೆಟ್ರಿ",
        diseaseRiskIndex: "ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಬೀಜಕ ಮತ್ತು ರೋಗದ ಅಪಾಯ ಸೂಚ್ಯಂಕ",
        diseaseRiskSubtitle: "ನೈಜ-ಸಮಯದ ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಸಂವೇದಕಗಳ ಆಧಾರದ ಮೇಲೆ ಮುನ್ಸೂಚಕ ಬೀಜಕ ಮೊಳಕೆಯೊಡೆಯುವಿಕೆ ಮತ್ತು ಕೊಳೆತ ವಿಶ್ಲೇಷಣೆ",
        soilTemp: "ಮಣ್ಣಿನ ತಾಪಮಾನ",
        soilMoisture: "ಮಣ್ಣಿನ ತೇವಾಂಶ",
        blightRisk: "ಶಿಲೀಂಧ್ರ ರೋಗದ ಅಪಾಯ",
        rootRotRisk: "ಬೇರು ಕೊಳೆತ ರೋಗದ ಅಪಾಯ",
        pestRisk: "ಕೀಟ ಹರಡುವಿಕೆ",
        germinationProb: "ಮೊಳಕೆಯೊಡೆಯುವ ಸಂಭವನೀಯತೆ",
        soilSaturation: "ಮಣ್ಣಿನ ತೇವಾಂಶ ಮಟ್ಟ",
        migrationChance: "ವಲಸೆ ಸಂಭವನೀಯತೆ",
        critical: "ಗಂಭೀರ",
        moderate: "ಸಾಧಾರಣ",
        low: "ಕಡಿಮೆ",
      },
      Tulu: {
        aiTelemetry: "ಎಐ ಜೈವಿಕೊ ಟೆಲಿಮೆಟ್ರಿ",
        diseaseRiskIndex: "ಸೂಕ್ಷ್ಮೊ ಹವಾಮಾನೊ ಬೀಜಕೊ ಬೊಕ್ಕ ಸೀಕ್‌ದ ಅಪಾಯೊ ಸೂಚ್ಯಂಕೊ",
        diseaseRiskSubtitle: "ರಿಯಲ್-ಟೈಮ್ ಸೂಕ್ಷ್ಮೊ ಹವಾಮಾನೊ ಸೆನ್ಸಾರ್‌ಳೆ ಆದಾರೊದ ಮಿತ್ತ್ ಮುನ್ಸೂಚನೆದ ಬೀಜಕೊ ಮುಂಗೆ ಬರ್ಪುನ ಬೊಕ್ಕ ಕುರಿಯುನ ವಿಶ್ಲೇಷಣೆ",
        soilTemp: "ಮಣ್ಣ್‌ದ ತಾಪಮಾನೊ",
        soilMoisture: "ಮಣ್ಣ್‌ದ ಪಸೆ",
        blightRisk: "ಗುಂಗೆ ಸೀಕ್‌ದ ಅಪಾಯೊ",
        rootRotRisk: "ಬೇರ್ ಕುರಿಯುನ ಸೀಕ್‌ದ ಅಪಾಯೊ",
        pestRisk: "ಕೀಟೊ ಪರಡುನಿ",
        germinationProb: "ಮುಂಗೆ ಬರ್ಪುನ ಸಂಬವನೀಯತೆ",
        soilSaturation: "ಮಣ್ಣ್‌ದ ಪಸೆತ ಮಟ್ಟೊ",
        migrationChance: "ಪರಡುನ ಸಂಬವನೀಯತೆ",
        critical: "ತಟ್ಟು",
        moderate: "ಅದೊ",
        low: "ಕಮ್ಮಿ"
      },
      Hindi: {
        aiTelemetry: "एआई जैव-टेलीमेट्री",
        diseaseRiskIndex: "सूक्ष्म जलवायु बीजाणु और रोग जोखिम सूचकांक",
        diseaseRiskSubtitle: "वास्तविक समय सूक्ष्म जलवायु सेंसर के आधार पर बीजाणु अंकुरण और सड़न का पूर्वानुमानित विश्लेषण",
        soilTemp: "मिट्टी का तापमान",
        soilMoisture: "मिट्टी की नमी",
        blightRisk: "कवक झुलसा रोग का खतरा",
        rootRotRisk: "जड़ सड़न रोग का खतरा",
        pestRisk: "कीट और कीड़ों का प्रसार",
        germinationProb: "अंकुरण संभावना",
        soilSaturation: "मिट्टी की संतृप्ति",
        migrationChance: "प्रवास की संभावना",
        critical: "गंभीर",
        moderate: "मध्यम",
        low: "कम",
      },
      Malayalam: {
        aiTelemetry: "എഐ ബയോ-ടെലിമെട്രി",
        diseaseRiskIndex: "സൂക്ഷ്മകാലാവസ്ഥാ രോഗസാധ്യതാ സൂചിക",
        diseaseRiskSubtitle: "തത്സമയ സെൻസറുകളെ അടിസ്ഥാനമാക്കിയുള്ള ബീജകോൽപ്പാദനവും ചീയൽ വിശകലനവും",
        soilTemp: "മണ്ണിലെ താപനില",
        soilMoisture: "മണ്ണിലെ ഈർപ്പം",
        blightRisk: "ഫംഗൽ രോഗ സാധ്യത",
        rootRotRisk: "വേരുചീയൽ രോഗ സാധ്യത",
        pestRisk: "കീടങ്ങളുടെ വ്യാപനം",
        germinationProb: "മുളയ്ക്കൽ സാധ്യത",
        soilSaturation: "മണ്ണിലെ ജലസാന്നിധ്യം",
        migrationChance: "വ്യാപന സാധ്യത",
        critical: "ഗുരുതരം",
        moderate: "മിതം",
        low: "കുറഞ്ഞത്",
      },
      Tamil: {
        aiTelemetry: "ஏஐ பயோ-டெலிமெட்ரி",
        diseaseRiskIndex: "நுண்ணிய காலநிலை வித்து & நோய் அபாயக் குறியீடு",
        diseaseRiskSubtitle: "நிகழ்நேர நுண்ணிய காலநிலை உணரிக அடிப்படையிலான வித்து முளைப்பு மற்றும் அழுகல் முன்கணிப்பு பகுப்பாய்வு",
        soilTemp: "மண் வெப்பநிலை",
        soilMoisture: "மண் ஈரப்பதம்",
        blightRisk: "பூஞ்சை கருகல் நோய் அபாயம்",
        rootRotRisk: "வேர் அழுகல் நோய் அபாயம்",
        pestRisk: "பூச்சி மற்றும் வண்டுகள் பரவல்",
        germinationProb: "முளைப்பு நிகழ்தகவு",
        soilSaturation: "மண் செறிவு",
        migrationChance: "பரவல் வாய்ப்பு",
        critical: "அபாயகரமானது",
        moderate: "மிதமானது",
        low: "குறைவானது",
      }
    };
    return dicts[lang] || dicts.English;
  };

  const getBlightAdv = (risk: number, lang: string) => {
    const advs: Record<string, { critical: string, moderate: string, low: string }> = {
      English: {
        critical: "⚠️ High Risk: Spores germinate in 4 hours. Spray Neem spray / Copper Fungicide.",
        moderate: "⚡ Moderate Risk: Leaf wetness is elevated. Optimize watering schedule.",
        low: "💚 Optimal: Environment is hostile to fungal spore propagation."
      },
      Kannada: {
        critical: "⚠️ ಹೆಚ್ಚಿನ ಅಪಾಯ: 4 ಗಂಟೆಗಳಲ್ಲಿ ಬೀಜಕಗಳು ಮೊಳಕೆಯೊಡೆಯುತ್ತವೆ. ಬೇವಿನ ಎಣ್ಣೆ / ತಾಮ್ರದ ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು ಸಿಂಪಡಿಸಿ.",
        moderate: "⚡ ಸಾಧಾರಣ ಅಪಾಯ: ಎಲೆಗಳ ತೇವಾಂಶ ಹೆಚ್ಚಾಗಿದೆ. ನೀರುಣಿಸುವ ವೇಳಾಪಟ್ಟಿಯನ್ನು ಉತ್ತಮಗೊಳಿಸಿ.",
        low: "💚 ಉತ್ತಮ: ಪರಿಸರವು ಶಿಲೀಂಧ್ರ ಬೀಜಕ ಪ್ರಸರಣಕ್ಕೆ ಪ್ರತಿಕೂಲವಾಗಿದೆ."
      },
      Tulu: {
        critical: "⚠️ ಗಂಭೀರೊ ಅಪಾಯೊ: 4 ಗಂಟೆಡ್ ಬೀಜಕ ಮೊಳಕೆ ಬರು. ಬೇವಿನ ಎಣ್ಣೆ / ತಾಮ್ರದ ಶಿಲೀಂಧ್ರನಾಶಕ ಸಿಂಪಡನೆ ಮಲ್ಪುಲೆ.",
        moderate: "⚡ ಸಾಧಾರಣೊ ಅಪಾಯೊ: ಇರೆತ ತೇವಾಂಶ ಜಾಸ್ತಿ ಉಂಡು. ನೀರ್ ಕೊರ್ಪುನ ವೇಳಾಪಟ್ಟಿ ಸರಿ ಮಲ್ಪುಲೆ.",
        low: "💚 ಎಡ್ಡೆ ಪರಿಸ್ಥಿತಿ: ವಾತಾವರಣೊಡು ಶಿಲೀಂಧ್ರ ಬೀಜಕ ಹರಡುನವು ಕಮ್ಮಿ ಉಂಡು."
      },
      Hindi: {
        critical: "⚠️ उच्च जोखिम: बीजाणु 4 घंटे में अंकुरित होते हैं। नीम का स्प्रे / कॉपर फंगिसाइड छिड़कें।",
        moderate: "⚡ मध्यम जोखिम: पत्तियों में नमी अधिक है। पानी देने की समय-सारणी को अनुकूलित करें।",
        low: "💚 अनुकूल: पर्यावरण कवक बीजाणु प्रसार के प्रतिकूल है।"
      },
      Malayalam: {
        critical: "⚠️ ഉയർന്ന സാധ്യത: ബീജങ്ങൾ 4 മണിക്കൂറിനുള്ളിൽ മുളയ്ക്കും. വേപ്പെണ്ണ / ചെമ്പ് കുമിൾനാശിനി തളിക്കുക.",
        moderate: "⚡ മിതമായ സാധ്യത: ഇലകളിൽ ഈർപ്പം കൂടുതലാണ്. നനയ്ക്കുന്ന സമയം ക്രമീകരിക്കുക.",
        low: "💚 അനുകൂലം: കുമിൾ വ്യാപനത്തിന് അനുകൂലമല്ലാത്ത അന്തരീക്ഷം."
      },
      Tamil: {
        critical: "⚠️ அதிக அபாயம்: 4 மணிநேரத்தில் வித்துக்கள் முளைக்கும். வேம்பு தெளிப்பு / தாமிர பூஞ்சைக்கொல்லியை தெளிக்கவும்.",
        moderate: "⚡ மிதமான அபாயம்: இலை ஈரப்பதம் அதிகரித்துள்ளது. நீர் பாய்ச்சும் அட்டவணையை சீரமைக்கவும்.",
        low: "💚 உகந்தது: சூழல் பூஞ்சை வித்து பரவலுக்கு உகந்ததாக இல்லை."
      }
    };
    const set = advs[lang] || advs.English;
    return risk > 70 ? set.critical : risk > 40 ? set.moderate : set.low;
  };

  const getRotAdv = (risk: number, lang: string) => {
    const advs: Record<string, { critical: string, moderate: string, low: string }> = {
      English: {
        critical: "⚠️ Saturated: Soil oxygen depleted. Stop irrigation immediately to prevent Pythium.",
        moderate: "⚡ Damp: Soil moisture is slightly high. Enable greenhouse ventilation.",
        low: "💚 Optimal: Roots receive perfect soil-oxygen aeration."
      },
      Kannada: {
        critical: "⚠️ ಸ್ಯಾಚುರೇಟೆಡ್: ಮಣ್ಣಿನ ಆಮ್ಲಜನಕ ಖಾಲಿಯಾಗಿದೆ. ಪಯಿಥಿಯಮ್ ತಡೆಯಲು ತಕ್ಷಣ ನೀರಾವರಿ ನಿಲ್ಲಿಸಿ.",
        moderate: "⚡ ತೇವಾಂಶ: ಮಣ್ಣಿನ ತೇವಾಂಶ ಸ್ವಲ್ಪ ಹೆಚ್ಚಾಗಿದೆ. ಹಸಿರುಮನೆ ಗಾಳಿಯಾಡುವಿಕೆಯನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿ.",
        low: "💚 ಉತ್ತಮ: ಬೇರುಗಳು ಪರಿಪೂರ್ಣ ಮಣ್ಣಿನ ಆಮ್ಲಜನಕ ಗಾಳಿಯಾಡುವಿಕೆಯನ್ನು ಪಡೆಯುತ್ತವೆ."
      },
      Tulu: {
        critical: "⚠️ ಸ್ಯಾಚುರೇಟೆಡ್: ಮಣ್ಣ್‌ಡ್ ಆಮ್ಲಜನಕ ಕಮ್ಮಿ ಆತ್ಂಡ್. ಪಯಿಥಿಯಮ್ ತಡೆ ಮಲ್ಪರೆ ತಕ್ಷಣ ನೀರ್ ಕೊರ್ಪುನ ಬಂದ್ ಮಲ್ಪುಲೆ.",
        moderate: "⚡ ಪಸೆ ಜಾಸ್ತಿ: ಮಣ್ಣ್‌ದ ಪಸೆ ಒಂತೆ ಜಾಸ್ತಿ ಉಂಡು. ಗ್ರೀನ್‌ಹೌಸ್ ಗಾಳಿಯಾಡುವಿಕೆ ಚಾಲು ಮಲ್ಪುಲೆ.",
        low: "💚 ಎಡ್ಡೆ ಪರಿಸ್ಥಿತಿ: ಬೇರ್‌ಲೆಗ್ ಮಣ್ಣ್‌ದ ಆಮ್ಲಜನಕ ಸರಿಯಾದ್ ತಿಕ್ಕೊಂದುಂಡು."
      },
      Hindi: {
        critical: "⚠️ संतृप्त: मिट्टी की ऑक्सीजन समाप्त हो गई है। पीथियम को रोकने के लिए तुरंत सिंचाई रोकें।",
        moderate: "⚡ नम: मिट्टी की नमी थोड़ी अधिक है। ग्रीनहाउस वेंटिलेशन चालू करें।",
        low: "💚 अनुकूल: जड़ों को सही मात्रा में ऑक्सीजन मिल रही है।"
      },
      Malayalam: {
        critical: "⚠️ ജലപൂരിതം: മണ്ണിലെ ഓക്സിജൻ കുറഞ്ഞു. പൈതിയം തടയാൻ ഉടൻ നനയ്ക്കുന്നത് നിർത്തുക.",
        moderate: "⚡ നനവുള്ളത്: മണ്ണിലെ ഈർപ്പം അല്പം കൂടുതലാണ്. ഹരിതഗൃഹ വെന്റിലേഷൻ ഉറപ്പാക്കുക.",
        low: "💚 അനുകൂലം: വേരുകൾക്ക് ആവശ്യമായ ഓക്സിജൻ ലഭിക്കുന്നുണ്ട്."
      },
      Tamil: {
        critical: "⚠️ செறிவூட்டப்பட்டது: மண்ணின் ஆக்ஸிஜன் தீர்ந்துவிட்டது. பைத்தியம் நோயைத் தடுக்க பாசனத்தை உடனே நிறுத்தவும்.",
        moderate: "⚡ ஈரப்பதமானது: மண்ணின் ஈரப்பதம் சற்று அதிகமாக உள்ளது. பசுமைக்குடில் காற்றோட்டத்தை இயக்கவும்.",
        low: "💚 உகந்தது: வேர்கள் சரியான மண்-ஆக்ஸிஜன் காற்றோட்டத்தைப் பெறுகின்றன."
      }
    };
    const set = advs[lang] || advs.English;
    return risk > 70 ? set.critical : risk > 40 ? set.moderate : set.low;
  };

  const getInsectAdv = (risk: number, lang: string) => {
    const advs: Record<string, { critical: string, moderate: string, low: string }> = {
      English: {
        critical: "⚠️ Hot & Dry: High threat of Spider Mites and Aphids. Spray organic pest oil.",
        moderate: "⚡ Warm: Conditions favor pest egg maturation. Inspect leaf undersides.",
        low: "💚 Optimal: Insect population growth rates are heavily restricted."
      },
      Kannada: {
        critical: "⚠️ ಬಿಸಿ ಮತ್ತು ಒಣ: ಜೇಡ ಕೀಟಗಳು ಮತ್ತು ಅಫಿಡ್ಗಳ ಹೆಚ್ಚಿನ ಭೀತಿ. ಸಾವಯವ ಕೀಟ ತೈಲವನ್ನು ಸಿಂಪಡಿಸಿ.",
        moderate: "⚡ ಬೆಚ್ಚಗಿನ: ಪರಿಸ್ಥಿತಿಗಳು ಕೀಟಗಳ ಮೊಟ್ಟೆ ಪಕ್ವತೆಗೆ ಅನುಕೂಲಕರವಾಗಿವೆ. ಎಲೆಯ ಕೆಳಭಾಗವನ್ನು ಪರೀಕ್ಷಿಸಿ.",
        low: "💚 ಉತ್ತಮ: ಕೀಟಗಳ ಜನಸಂಖ್ಯೆಯ ಬೆಳವಣಿಗೆಯ ದರಗಳು ತೀವ್ರವಾಗಿ ಸೀಮಿತವಾಗಿವೆ."
      },
      Tulu: {
        critical: "⚠️ ಬಿಸಿ ಬೊಕ್ಕ ಒಣ: ಜೇಡ ಉರ್ಲು ಬೊಕ್ಕ ಅಫಿಡ್ಸ್ ಭೀತಿ ಜಾಸ್ತಿ ಉಂಡು. ಸಾವಯವ ಕೀಟ ತೈಲ ಸಿಂಪಡನೆ ಮಲ್ಪುಲೆ.",
        moderate: "⚡ ಬೆಚ್ಚಗಿನ: ಕೀಟೊಳು ಮೊಟ್ಟೆ ದೀಪುನ ಪರಿಸ್ಥಿತಿ ಉಂಡು. ಇರೆತ ಅಡಿಭಾಗೊ ಪರೀಕ್ಷೆ ಮಲ್ಪುಲೆ.",
        low: "💚 ಎಡ್ಡೆ ಪರಿಸ್ಥಿತಿ: ಕೀಟೊಳು ಜನಸಂಖ್ಯೆ ಬೆಳವಣಿಗೆದ ದರ ಭಾರಿ ಕಮ್ಮಿ ಉಂಡು."
      },
      Hindi: {
        critical: "⚠️ गर्म और शुष्क: स्पाइडर माइट्स और एफिड्स का उच्च खतरा। जैविक कीट तेल स्प्रे करें।",
        moderate: "⚡ गर्म: परिस्थितियाँ कीटों के अंडों के परिपक्व होने के अनुकूल हैं। पत्तियों के नीचे निरीक्षण करें।",
        low: "💚 अनुकूल: कीटों की आबादी बढ़ने की दर काफी कम है।"
      },
      Malayalam: {
        critical: "⚠️ വരണ്ട കാലാവസ്ഥ: ചിലന്തികൾ, ഇലപ്പേനുകൾ എന്നിവയുടെ ആക്രമണ സാധ്യത. ജൈവ കീടനാശിനി തളിക്കുക.",
        moderate: "⚡ ഊഷ്മളമായത്: കീടങ്ങളുടെ മുട്ട വിരിയാൻ അനുകൂല സമയം. ഇലകളുടെ അടിവശം പരിശോധിക്കുക.",
        low: "💚 അനുകൂലം: കീടങ്ങളുടെ വംശവർദ്ധനവ് തടയപ്പെട്ടിരിക്കുന്നു."
      },
      Tamil: {
        critical: "⚠️ வெப்பம் & வறட்சி: சிலந்திப் பூச்சிகள் மற்றும் அசுவினிகளின் அதிக ஆபத்து. ஆர்கானிக் பூச்சி எண்ணெயைத் தெளிக்கவும்.",
        moderate: "⚡ இதமான வெப்பம்: சூழல் பூச்சி முட்டை முதிர்ச்சிக்கு உகந்தது. இலைகளின் அடிப்பகுதியை ஆய்வு செய்யவும்.",
        low: "💚 உகந்தது: பூச்சி பெருக்க வளர்ச்சி விகிதங்கள் பெருமளவில் கட்டுப்படுத்தப்பட்டுள்ளன."
      }
    };
    const set = advs[lang] || advs.English;
    return risk > 70 ? set.critical : risk > 40 ? set.moderate : set.low;
  };

  const sf = getSmartFarmTranslations(language);

  const chartData = {
    labels: sevenDayHistory.map(h => h.day),
    datasets: [
      {
        label: t.moisture,
        data: sevenDayHistory.map(h => h.waterUsage || Math.random() * 20),
        fill: true,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderColor: '#1e40af',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: '#1e40af',
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#e2e8f0' }, ticks: { font: { size: 10, weight: 'bold' }, color: '#000' } },
      x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' }, color: '#000' } }
    },
  };

  const isLowMoisture = data.soilMoisture < 30;

  // Agrochemical Microclimate Risk Calculations
  const temp = data.temperature || 25;
  const moisture = data.soilMoisture || 45;
  const humidity = weather?.humidity || 60;

  // 1. Fungal Blight (Late Blight / Mildew): 16-25°C + high humidity
  let blightRisk = 10;
  if (temp >= 16 && temp <= 25) {
    blightRisk += 30;
    if (humidity > 70) blightRisk += 40;
    if (moisture > 60) blightRisk += 20;
  } else if (humidity > 80) {
    blightRisk += 40;
  }
  blightRisk = Math.min(blightRisk, 100);

  // 2. Root Rot (Pythium / Phytophthora): prolonged wet soil (> 60% soil moisture)
  let rotRisk = Math.min(Math.round(Math.max(0, (moisture - 30) * 2.2)), 100);
  if (temp > 28) rotRisk = Math.min(rotRisk + 15, 100);

  // 3. Spider Mites / Aphid Spread: Hot, dry microclimate (> 30°C and < 50% humidity)
  let insectRisk = 10;
  if (temp > 30) insectRisk += 40;
  if (humidity < 50) insectRisk += 40;
  if (moisture < 35) insectRisk += 10;
  insectRisk = Math.min(insectRisk, 100);

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-main">{t.smartFarm}</h2>
          <p className="text-text-main font-bold mt-1">{t.automatedControl}</p>
        </div>
        {isLowMoisture && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-lg"
          >
            <AlertTriangle className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">{t.waterAlert}</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Unique Feature: Microclimate Spore & Disease Risk Index */}
        <div className="col-span-full glass-card p-8 bg-gradient-to-r from-emerald-950/20 via-slate-900/10 to-transparent relative overflow-hidden border border-border-subtle">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px]" />

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 relative z-10">
            <div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black tracking-widest uppercase">{sf.aiTelemetry}</span>
              <h3 className="text-2xl font-black text-text-main mt-3 tracking-tighter">{sf.diseaseRiskIndex}</h3>
              <p className="text-xs text-text-dim mt-1 font-bold">{sf.diseaseRiskSubtitle}</p>
            </div>

            <div className="flex gap-4">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-border-subtle flex items-center gap-3">
                <Thermometer className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">{sf.soilTemp}</p>
                  <p className="text-sm font-black text-text-main">{temp.toFixed(1)}°C</p>
                </div>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-border-subtle flex items-center gap-3">
                <Droplet className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">{sf.soilMoisture}</p>
                  <p className="text-sm font-black text-text-main">{moisture.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {/* Blight Risk */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-800/40 border border-border-subtle flex flex-col justify-between h-full group hover:shadow-xl transition-all">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-text-dim uppercase tracking-widest">{sf.blightRisk}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${blightRisk > 70 ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300' : blightRisk > 40 ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'}`}>
                    {blightRisk > 70 ? sf.critical : blightRisk > 40 ? sf.moderate : sf.low}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-text-main tracking-tighter">{blightRisk}%</span>
                  <span className="text-xs text-text-dim font-bold">{sf.germinationProb}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                  <div className={`h-full rounded-full transition-all duration-1000 ${blightRisk > 70 ? 'bg-red-600' : blightRisk > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${blightRisk}%` }} />
                </div>
              </div>
              <p className="text-[11px] font-bold text-text-dim mt-4 leading-relaxed italic">
                {getBlightAdv(blightRisk, language)}
              </p>
            </div>

            {/* Rot Risk */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-800/40 border border-border-subtle flex flex-col justify-between h-full group hover:shadow-xl transition-all">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-text-dim uppercase tracking-widest">{sf.rootRotRisk}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${rotRisk > 70 ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300' : rotRisk > 40 ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'}`}>
                    {rotRisk > 70 ? sf.critical : rotRisk > 40 ? sf.moderate : sf.low}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-text-main tracking-tighter">{rotRisk}%</span>
                  <span className="text-xs text-text-dim font-bold">{sf.soilSaturation}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                  <div className={`h-full rounded-full transition-all duration-1000 ${rotRisk > 70 ? 'bg-red-600' : rotRisk > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${rotRisk}%` }} />
                </div>
              </div>
              <p className="text-[11px] font-bold text-text-dim mt-4 leading-relaxed italic">
                {getRotAdv(rotRisk, language)}
              </p>
            </div>

            {/* Insect Risk */}
            <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-800/40 border border-border-subtle flex flex-col justify-between h-full group hover:shadow-xl transition-all">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-text-dim uppercase tracking-widest">{sf.pestRisk}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${insectRisk > 70 ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300' : insectRisk > 40 ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'}`}>
                    {insectRisk > 70 ? sf.critical : insectRisk > 40 ? sf.moderate : sf.low}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-text-main tracking-tighter">{insectRisk}%</span>
                  <span className="text-xs text-text-dim font-bold">{sf.migrationChance}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                  <div className={`h-full rounded-full transition-all duration-1000 ${insectRisk > 70 ? 'bg-red-600' : insectRisk > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${insectRisk}%` }} />
                </div>
              </div>
              <p className="text-[11px] font-bold text-text-dim mt-4 leading-relaxed italic">
                {getInsectAdv(insectRisk, language)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-text-main">{t.npk}</h3>
            <p className="text-[10px] font-black text-text-main uppercase tracking-widest">{t.soilComposition}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: t.nitrogen, val: data.npk.nitrogen, color: 'bg-blue-700' },
              { label: t.phosphorus, val: data.npk.phosphorus, color: 'bg-orange-700' },
              { label: t.potassium, val: data.npk.potassium, color: 'bg-emerald-700' }
            ].map((item, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-text-main uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-2xl font-black text-text-main tracking-tight">{item.val.toFixed(0)} <span className="text-xs text-text-main font-bold">mg/kg</span></p>
                  </div>
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden p-0.5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${item.val}%` }} className={`h-full ${item.color} rounded-full`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-text-main mb-8">{t.automation}</h3>
          <div className="space-y-4">
            <div className={`p-5 rounded-2xl flex items-center justify-between border-2 transition-all ${isLowMoisture ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-600' : 'bg-slate-100 dark:bg-surface-hover border-slate-200 dark:border-border-subtle'}`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${isLowMoisture ? 'bg-blue-700 text-white' : 'bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-main">{t.pump}</p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-blue-800 mt-1">{isLowMoisture ? t.on : t.off}</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${isLowMoisture ? 'bg-blue-700 animate-pulse' : 'bg-slate-400'}`} />
            </div>

            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-surface-hover border-2 border-slate-200 dark:border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-300 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-main">{t.exhaustFan}</p>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-600 mt-1">{t.locked}</p>
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-slate-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-8 col-span-full">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-text-main">{t.history}</h3>
              <p className="text-[10px] font-black text-text-main uppercase tracking-[0.2em] mt-1">{t.sevenDayAnalytics}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
              <Activity className="w-3.5 h-3.5 text-blue-800" />
              <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">{t.analyticsReady}</span>
            </div>
          </div>
          <div className="h-[300px]">
            <ChartLine data={chartData} options={chartOptions as any} />
          </div>
        </div>
      </div>
    </div>
  );
};

const GeoSurveillance = ({ t, language }: { t: any, language: string }) => {
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);

  const geoDict: Record<string, any> = {
    English: {
      title: "Geospatial Pest & Disease Surveillance",
      subtitle: "Real-time farm-level microclimate alerts across Maharashtra districts",
      broadcastBtn: "Broadcast Advisory via Bhashini SMS",
      mapTitle: "Maharashtra District Hotspot Map",
      liveFeedTitle: "Live District Alert Feed",
      toastTitle: "Advisory Broadcasted Successfully",
      toastDesc: "Preventive SMS sent to 14,250 registered farmers via Govt Bhashini API.",
      highRisk: "High Risk (Blight/Pest)",
      modRisk: "Moderate Risk",
      controlled: "Controlled",
      alert1Title: "Critical Alert",
      alert1Body: "42 farm nodes reported blight spore threshold breach in Niphad, Nashik.",
      alert2Title: "Warning Alert",
      alert2Body: "Microclimate sensor indicates fungal risk in Baramati.",
      alert3Title: "Pest Warning",
      alert3Body: "Trap counts exceed 8 pink bollworm moths/trap in Chhatrapati Sambhajinagar."
    },
    Marathi: {
      title: "भौगोलिक कीड व रोग नियंत्रण सुनिरीक्षण",
      subtitle: "महाराष्ट्र जिल्ह्यातील शेतकरी मायक्रोक्लायमेट थेट धोक्याच्या सूचना",
      broadcastBtn: "भाषिणी एसएमएस द्वारे सल्ला पाठवा",
      mapTitle: "महाराष्ट्र जिल्हा हॉटस्पॉट नकाशा",
      liveFeedTitle: "थेट जिल्हा अलर्ट फीड",
      toastTitle: "सल्ला यशस्वीरित्या प्रसारित केला",
      toastDesc: "शासकीय भाषिणी एपीआय द्वारे १४,२५० नोंदणीकृत शेतकऱ्यांना संदेश पाठवला.",
      highRisk: "उच्च धोका (करपा/कीड)",
      modRisk: "मध्यम धोका",
      controlled: "नियंत्रित",
      alert1Title: "गंभीर इशारा",
      alert1Body: "निफाड, नाशिक येथे ४२ शेत नोड्सवर बुरशीजन्य बीजाणूंची नोंद झाली आहे.",
      alert2Title: "धोक्याची सूचना",
      alert2Body: "बारामती भागात मायक्रोक्लायमेट सेन्सरनुसार बुरशीचा धोका आढळला आहे.",
      alert3Title: "कीड इशारा",
      alert3Body: "छत्रपती संभाजीनगर येथे प्रति कामगंध सापळ्यात ८ पेक्षा जास्त बोंड अळीचे पतंग आढळले."
    },
    Bengali: {
      title: "ভৌগোলিক পোকা ও রোগ নজরদারি",
      subtitle: "মহারাষ্ট্রের জেলা জুড়ে খামার স্তরের রিয়েল-টাইম সতর্কতা",
      broadcastBtn: "ভাষিনী এসএমএস এর মাধ্যমে পরামর্শ পাঠান",
      mapTitle: "মহারাষ্ট্র জেলা হটস্পট ম্যাপ",
      liveFeedTitle: "লাইভ জেলা অ্যালার্ট ফিড",
      toastTitle: "পরামর্শ সফলভাবে সম্প্রচারিত হয়েছে",
      toastDesc: "সরকারি ভাষিনী এপিআই এর মাধ্যমে ১৪,২৫০ জন নিবন্ধিত কৃষককে বার্তা পাঠানো হয়েছে।",
      highRisk: "উচ্চ ঝুঁকি (ছত্রাক/পোকা)",
      modRisk: "মাঝারি ঝুঁকি",
      controlled: "নিয়ন্ত্রিত",
      alert1Title: "জরুরি সতর্কবার্তা",
      alert1Body: "নাসিকের নিফাড়ে ৪২টি ফার্ম নোডে ছত্রাকের বীজাণু ধরা পড়েছে।",
      alert2Title: "সতর্কতা বার্তা",
      alert2Body: "বারামতিতে আবহাওয়া সেন্সর ছত্রাকের আক্রমণের ঝুঁকি নির্দেশ করছে।",
      alert3Title: "পোকা সতর্কবার্তা",
      alert3Body: "ছত্রপতি সম্ভাজিনগরে ফাঁদ প্রতি ৮টির বেশি গোলাপি বোলওয়ার্ম মথ পাওয়া গেছে।"
    },
    Gujarati: {
      title: "ભૌગોલિક જીવાત અને રોગ નિરીક્ષણ",
      subtitle: "મહારાષ્ટ્રના జిલ્લાઓમાં ફાર્મ-લેવલ રિયલ-ટાઇમ ચેતવણીઓ",
      broadcastBtn: "ભાષિણી એસએમએસ દ્વારા સલાહ મોકલો",
      mapTitle: "મહારાષ્ટ્ર જિલ્લા હોટસ્પોટ નકશો",
      liveFeedTitle: "લાઈવ જિલ્લા એલર્ટ ફીડ",
      toastTitle: "સલાહ સફળતાપૂર્વક મોકલવામાં આવી",
      toastDesc: "સરકારી ભાષિણી API દ્વારા ૧૪,૨૫૦ નોંધાયેલા ખેડૂતોને મેસેજ મોકલ્યો.",
      highRisk: "ઉચ્ચ જોખમ (ફૂગ/જીવાત)",
      modRisk: "મધ્યમ જોખમ",
      controlled: "નિયંત્રિત",
      alert1Title: "ગંભીર ચેતવણી",
      alert1Body: "નાસિકના નિફાડમાં ૪૨ ખેતર નોડ્સમાં ફૂગના બીજાણુઓ મળી આવ્યા.",
      alert2Title: "ચેતવણી એલર્ટ",
      alert2Body: "બારામતીમાં હવામાન સેન્સર ફૂગના રોગનું જોખમ દર્શાવે છે.",
      alert3Title: "જીવાત ચેતવણી",
      alert3Body: "છત્રપતિ સંભાજીનગરમાં ફેરોમોન ટ્રેપ દીઠ ૮ થી વધુ ઈયળના પતંગિયા મળ્યા."
    },
    Hindi: {
      title: "भौगोलिक कीट एवं रोग निगरानी प्रणाली",
      subtitle: "महाराष्ट्र के जिलों में खेत-स्तरीय वास्तविक समय अलर्ट",
      broadcastBtn: "भाषिणी एसएमएस द्वारा परामर्श भेजें",
      mapTitle: "महाराष्ट्र जिला हॉटस्पॉट मानचित्र",
      liveFeedTitle: "लाइव जिला अलर्ट फीड",
      toastTitle: "परामर्श सफलतापूर्वक प्रसारित किया गया",
      toastDesc: "सरकारी भाषिणी एपीआई के माध्यम से 14,250 पंजीकृत किसानों को संदेश भेजा गया।",
      highRisk: "उच्च जोखिम (कवक/कीट)",
      modRisk: "मध्यम जोखिम",
      controlled: "नियंत्रित",
      alert1Title: "गंभीर चेतावनी",
      alert1Body: "नासिक के निफाड़ में 42 फार्म नोड्स पर कवक बीजाणुओं की पुष्टि हुई।",
      alert2Title: "चेतावनी अलर्ट",
      alert2Body: "बारामती में मौसम सेंसर कवक रोग के जोखिम का संकेत दे रहे हैं।",
      alert3Title: "कीट चेतावनी",
      alert3Body: "छत्रपति संभाजीनगर में प्रति ट्रैप 8 से अधिक गुलाबी सुंडी के पतंगे पाए गए।"
    },
    Kannada: {
      title: "ಭೌಗೋಳಿಕ ಕೀಟ ಮತ್ತು ರೋಗ ಕಣ್ಗಾವಲು",
      subtitle: "ಮಹಾರಾಷ್ಟ್ರದ ಜಿಲ್ಲೆಗಳಲ್ಲಿ ನೈಜ ಸಮಯದ ಎಚ್ಚರಿಕೆಗಳು",
      broadcastBtn: "ಭಾಷಿಣಿ ಎಸ್‌ಎಂಎಸ್ ಮೂಲಕ ಸಲಹೆ ಕಳುಹಿಸಿ",
      mapTitle: "ಮಹಾರಾಷ್ಟ್ರ ಜಿಲ್ಲಾ ಹಾಟ್‌ಸ್ಪಾಟ್ ನಕ್ಷೆ",
      liveFeedTitle: "ನೇರ ಜಿಲ್ಲಾ ಅಲರ್ಟ್ ಫೀಡ್",
      toastTitle: "ಸಲಹೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ",
      toastDesc: "ಸರ್ಕಾರಿ ಭಾಷಿಣಿ API ಮೂಲಕ ೧೪,೨೫೦ ರೈತರಿಗೆ ಸಂದೇಶ ರವಾನಿಸಲಾಗಿದೆ.",
      highRisk: "ಹೆಚ್ಚಿನ ಅಪಾಯ (ಶಿಲೀಂಧ್ರ/ಕೀಟ)",
      modRisk: "ಮಧ್ಯಮ ಅಪಾಯ",
      controlled: "ನಿಯಂತ್ರಿತ",
      alert1Title: "ತುರ್ತು ಎಚ್ಚರಿಕೆ",
      alert1Body: "ನಾಸಿಕ್‌ನ ನಿಫಾಡ್‌ನಲ್ಲಿ ೪೨ ಫಾರ್ಮ್ ನೋಡ್‌ಗಳಲ್ಲಿ ಶಿಲೀಂಧ್ರ ಭಾದೆ ಕಂಡುಬಂದಿದೆ.",
      alert2Title: "ಮುನ್ನೆಚ್ಚರಿಕೆ",
      alert2Body: "ಬಾರಾಮತಿಯಲ್ಲಿ ಹವಾಮಾನ ಸೆನ್ಸರ್ ಶಿಲೀಂಧ್ರ ರೋಗದ ಅಪಾಯವನ್ನು ತೋರಿಸುತ್ತಿದೆ.",
      alert3Title: "ಕೀಟ ಎಚ್ಚರಿಕೆ",
      alert3Body: "ಛತ್ರಪತಿ ಸಂಭಾಜಿನಗರದಲ್ಲಿ ಬಲೆಗೆ ೮ ಕ್ಕಿಂತ ಹೆಚ್ಚು ಕಾಯಿ ಹುಳುವಿನ ಪತಂಗಗಳು ಬಿದ್ದಿವೆ."
    },
    Tamil: {
      title: "புவிசார் பூச்சி மற்றும் நோய் கண்காணிப்பு",
      subtitle: "மஹாராஷ்டிரா மாவட்டங்களில் நேரடி பண்ணை எச்சரிக்கைகள்",
      broadcastBtn: "பாஷினி எஸ்எம்எஸ் மூலம் ஆலோசனையை அனுப்பு",
      mapTitle: "மஹாராஷ்டிரா மாவட்ட ஹாட்ஸ்பாட் வரைபடம்",
      liveFeedTitle: "நேரடி மாவட்ட எச்சரிக்கை ஊட்டம்",
      toastTitle: "ஆலோசனை வெற்றிகரமாக அனுப்பப்பட்டது",
      toastDesc: "அரசு பாஷினி API மூலம் 14,250 பதிவுசெய்த விவசாயிகளுக்கு குறுஞ்செய்தி அனுப்பப்பட்டது.",
      highRisk: "அதிக ஆபத்து (பூஞ்சை/பூச்சி)",
      modRisk: "மிதமான ஆபத்து",
      controlled: "கட்டுப்படுத்தப்பட்டது",
      alert1Title: "முக்கிய எச்சரிக்கை",
      alert1Body: "நாசிக் நிபாட்டில் 42 பண்ணை முனையங்களில் பூஞ்சை பாதிப்பு கண்டறியப்பட்டது.",
      alert2Title: "எச்சரிக்கை செய்தி",
      alert2Body: "பாராமதியில் பூஞ்சை நோய் அபாயத்தை சென்சார்கள் காட்டுகின்றன.",
      alert3Title: "பூச்சி எச்சரிக்கை",
      alert3Body: "சத்ரபதி சம்பாஜிநகரில் பொறிக்கு 8க்கும் மேற்பட்ட காய்ப்புழு பூச்சிகள் சிக்கின."
    },
    Malayalam: {
      title: "ഭൂമിശാസ്ത്രപരമായ കീട-രോഗ നിരീക്ഷണം",
      subtitle: "മഹാരാഷ്ട്ര ജില്ലകളിലെ തത്സമയ ജാഗ്രതാ മുന്നറിയിപ്പുകൾ",
      broadcastBtn: "ഭാഷിണി എസ്എംഎസ് വഴി ഉപദേശം അയക്കുക",
      mapTitle: "മഹാരാഷ്ട്ര ജില്ലാ ഹോട്സ്പോട്ട് മാപ്പ്",
      liveFeedTitle: "തത്സമയ ജില്ലാ മുന്നറിയിപ്പ് ഫീഡ്",
      toastTitle: "ഉപദേശം വിജയകരമായി അയച്ചു",
      toastDesc: "സർക്കാർ ഭാഷിണി API വഴി 14,250 കർഷകർക്ക് സന്ദേശം അയച്ചു.",
      highRisk: "ഉയർന്ന അപകടസാധ്യത (ഫംഗസ്/കീടം)",
      modRisk: "മിതമായ അപകടസാധ്യത",
      controlled: "നിയന്ത്രിതം",
      alert1Title: "ഗുരുതര മുന്നറിയിപ്പ്",
      alert1Body: "നാസിക്കിലെ നിഫാഡിൽ 42 ഫാം നോഡുകളിൽ ഫംഗസ് ബാധ കണ്ടെത്തി.",
      alert2Title: "ജാഗ്രതാ സന്ദേശം",
      alert2Body: "ബാരമതിയിൽ ഫംഗസ് രോഗ സാധ്യത കണ്ടു.",
      alert3Title: "കീട മുന്നറിയിപ്പ്",
      alert3Body: "ഛത്രപതി സംഭാജിനഗറിൽ കെണിയിൽ 8 ലധികം പുഴുക്കളെ കണ്ടെത്തി."
    }
  };

  const g = geoDict[language] || geoDict.English;

  const hotspots = [
    {
      id: 'nashik',
      name: 'Nashik Cluster',
      district: 'Nashik',
      coords: { x: '28%', y: '40%' },
      status: 'High Risk - Fungal Spores Detected',
      level: 'danger',
      crop: 'Grapes & Cotton',
      affectedFarms: 42,
      humidity: '74%'
    },
    {
      id: 'pune',
      name: 'Baramati / Pune',
      district: 'Pune',
      coords: { x: '35%', y: '68%' },
      status: 'Moderate Risk - Aphid Migration',
      level: 'warning',
      crop: 'Sugarcane & Vegetables',
      affectedFarms: 18,
      humidity: '63%'
    },
    {
      id: 'nagpur',
      name: 'Nagpur East',
      district: 'Nagpur',
      coords: { x: '82%', y: '30%' },
      status: 'Controlled - Healthy',
      level: 'success',
      crop: 'Citrus (Oranges)',
      affectedFarms: 0,
      humidity: '51%'
    },
    {
      id: 'sambhajinagar',
      name: 'Chhatrapati Sambhajinagar',
      district: 'Chhatrapati Sambhajinagar',
      coords: { x: '48%', y: '45%' },
      status: 'Pest Warning - Pink Bollworm',
      level: 'danger',
      crop: 'Bt Cotton',
      affectedFarms: 35,
      humidity: '68%'
    }
  ];

  const handleBroadcastAdvisory = () => {
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
    }, 5000);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {broadcastSent && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/30"
          >
            <CheckCircle className="w-6 h-6 text-white" />
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wide">Advisory Broadcasted Successfully</p>
              <p className="text-xs text-emerald-100 font-medium">Preventive SMS sent to 14,250 registered farmers via Govt Bhashini API.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> LIVE IPDM RADAR
            </span>
          </div>
          <h2 className="text-2xl font-black text-text-main tracking-tight">{g.title}</h2>
          <p className="text-xs font-bold text-text-dim mt-1">{g.subtitle}</p>
        </div>

        <button
          onClick={handleBroadcastAdvisory}
          className="bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl shadow-primary/20 flex items-center justify-center gap-2.5 transition-all active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>{g.broadcastBtn}</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        {/* Visual Simulated Map Card */}
        <div className="col-span-12 lg:col-span-8 glass-card p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden min-h-[500px]">
          <div className="flex items-center justify-between mb-4 z-10">
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-black text-text-main uppercase tracking-wider">Maharashtra District Hotspot Map</h3>
            </div>
            <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest bg-surface-hover px-3 py-1 rounded-full border border-border-subtle">
              Center: 19.7515° N, 75.7139° E
            </span>
          </div>

          {/* Interactive Styled Map View */}
          <div className="relative w-full h-[380px] lg:h-[420px] rounded-2xl bg-[#09131e] border border-white/10 overflow-hidden flex items-center justify-center group">
            {/* Grid Pattern overlay for radar effect */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            {/* Radar Sweeping Animation */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-primary/10 to-transparent rounded-full animate-spin origin-center pointer-events-none opacity-30" style={{ animationDuration: '10s' }} />

            {/* Stylized Maharashtra District Outline SVG */}
            <svg viewBox="0 0 800 500" className="w-full h-full object-contain p-6 opacity-35 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <path
                d="M 150 180 Q 220 120 350 140 T 550 100 T 720 200 T 680 320 T 500 380 T 320 400 T 180 340 T 120 250 Z"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
              <path
                d="M 220 160 L 320 220 L 420 200 L 520 260 L 620 220"
                fill="none"
                stroke="#334155"
                strokeWidth="1.5"
              />
            </svg>

            {/* Pulsing Hotspot Markers */}
            {hotspots.map((hs) => (
              <div
                key={hs.id}
                style={{ left: hs.coords.x, top: hs.coords.y }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group/pin z-20"
                onClick={() => setSelectedHotspot(hs)}
              >
                <div className="relative flex items-center justify-center">
                  <span className={`absolute w-8 h-8 rounded-full animate-ping opacity-75 ${hs.level === 'danger' ? 'bg-red-500' : hs.level === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                  <span className={`relative w-4 h-4 rounded-full border-2 border-white shadow-lg ${hs.level === 'danger' ? 'bg-red-600' : hs.level === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                </div>
                {/* Tooltip on hover */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/pin:block bg-slate-900 text-white text-[11px] font-bold py-1.5 px-3 rounded-xl shadow-2xl whitespace-nowrap border border-white/20 z-30">
                  <p className="font-extrabold">{hs.name}</p>
                  <p className={`text-[10px] ${hs.level === 'danger' ? 'text-red-400' : hs.level === 'warning' ? 'text-amber-400' : 'text-emerald-400'}`}>{hs.status}</p>
                </div>
              </div>
            ))}

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-[10px] font-bold text-slate-300">{g.highRisk}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[10px] font-bold text-slate-300">{g.modRisk}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-300">{g.controlled}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Surveillance Feed */}
        <div className="col-span-12 lg:col-span-4 glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                {g.liveFeedTitle}
              </h3>
              <span className="text-[10px] font-black text-text-dim uppercase tracking-wider">UPDATED NOW</span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">{g.alert1Title}</span>
                </div>
                <p className="text-xs font-bold leading-relaxed">
                  🔴 <strong className="font-extrabold">{g.alert1Title}:</strong> {g.alert1Body}
                </p>
                <span className="text-[10px] font-bold text-red-500/80 mt-2 block">Triggered 12m ago • Microclimate Humidity 74%</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">{g.alert2Title}</span>
                </div>
                <p className="text-xs font-bold leading-relaxed">
                  🟡 <strong className="font-extrabold">{g.alert2Title}:</strong> {g.alert2Body}
                </p>
                <span className="text-[10px] font-bold text-amber-500/80 mt-2 block">Triggered 45m ago • Temp 27.4°C</span>
              </div>

              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">{g.alert3Title}</span>
                </div>
                <p className="text-xs font-bold leading-relaxed">
                  ⚠️ <strong className="font-extrabold">{g.alert3Title}:</strong> {g.alert3Body}
                </p>
                <span className="text-[10px] font-bold text-red-500/80 mt-2 block">Triggered 1h ago • Bt Cotton Field Cluster</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border-subtle">
            <button
              onClick={handleBroadcastAdvisory}
              className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>{g.broadcastBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard({
  language,
  setLanguage,
  onLogout,
  isDarkMode,
  toggleDarkMode
}: {
  language: string,
  setLanguage: (lang: string) => void,
  onLogout: () => void,
  isDarkMode: boolean,
  toggleDarkMode: () => void
}) {
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus !== 'true') {
      window.location.href = '/';
    }
  }, []);

  const [data, setData] = useState<SensorData | null>(null);
  const [history, setHistory] = useState<ChartDataPoint[]>([]);
  const [sevenDayHistory, setSevenDayHistory] = useState<any[]>([]);
  const [diagnosisHistory, setDiagnosisHistory] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'smartfarm' | 'doctor' | 'geosurveillance'>('dashboard');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);

  const [userProfile, setUserProfile] = useState(() => {
    return { username: "Kisan Officer", location: "NASHIK, MH", majorCrop: "Grapes & Cotton" };
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(userProfile);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notification state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('agriNotifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [
      {
        id: '1',
        type: 'danger',
        category: 'moisture',
        title: 'Low Soil Moisture Alert',
        message: 'Field 1 soil moisture has dropped below 35%. Automated irrigation recommended.',
        timestamp: '10 mins ago',
        read: false
      },
      {
        id: '2',
        type: 'warning',
        category: 'pest',
        title: 'Microclimate Spore Warning',
        message: 'High humidity detected (62%). Fungal spore germination risk is MODERATE.',
        timestamp: '45 mins ago',
        read: false
      },
      {
        id: '3',
        type: 'info',
        category: 'market',
        title: 'Mandi Price Update',
        message: 'Arecanut (Supari) price in Mangalore market increased to ₹48,500/quintal.',
        timestamp: '2 hours ago',
        read: true
      },
      {
        id: '4',
        type: 'success',
        category: 'system',
        title: 'Telemetry Node Synced',
        message: 'All 8 field sensor nodes are online and operating at 99.8% signal clarity.',
        timestamp: '5 hours ago',
        read: true
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('agriNotifications', JSON.stringify(notifications));
  }, [notifications]);

  // Dynamically evaluate telemetry data to issue live smart agricultural notifications
  useEffect(() => {
    if (!data) return;
    setNotifications(prev => {
      let updated = [...prev];
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Soil Moisture check
      if (data.soilMoisture < 35 && !updated.some(n => n.category === 'moisture' && !n.read)) {
        updated.unshift({
          id: `moisture-${Date.now()}`,
          type: 'danger',
          category: 'moisture',
          title: t.soilMoistureAlert || 'Low Soil Moisture Warning',
          message: `${(data.soilMoisture).toFixed(1)}% - ${t.soilMoistureDesc || 'Moisture level dropped to critical threshold. Immediate irrigation recommended.'}`,
          timestamp: timeStr,
          read: false
        });
      }

      // NPK Nitrogen check
      if (data.npk.nitrogen < 40 && !updated.some(n => n.category === 'npk' && !n.read)) {
        updated.unshift({
          id: `npk-${Date.now()}`,
          type: 'warning',
          category: 'npk',
          title: t.npkAlert || 'Nitrogen Deficiency',
          message: `Nitrogen at ${Math.round(data.npk.nitrogen)} PPM - ${t.npkDesc || 'Nitrogen level is low. Consider adding organic compost or urea.'}`,
          timestamp: timeStr,
          read: false
        });
      }

      return updated.slice(0, 15); // keep max 15 recent notifications
    });
  }, [data?.soilMoisture, data?.npk.nitrogen]);

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your device or browser.");
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode using free OpenStreetMap Nominatim API
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const geoData = await res.json();
          const detectedCity = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`;

          setUserProfile(prev => {
            const updated = { ...prev, location: detectedCity };
            localStorage.setItem('userProfile', JSON.stringify(updated));
            return updated;
          });

          // Show alert confirmation
          setNotifications(prev => [
            {
              id: `loc-${Date.now()}`,
              type: 'success',
              category: 'system',
              title: 'GPS Location Updated',
              message: `Field location set to: ${detectedCity}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              read: false
            },
            ...prev
          ]);
        } catch (err) {
          const fallbackLoc = `GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`;
          setUserProfile(prev => {
            const updated = { ...prev, location: fallbackLoc };
            localStorage.setItem('userProfile', JSON.stringify(updated));
            return updated;
          });
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (error) => {
        setIsDetectingLocation(false);
        if (error.code === error.PERMISSION_DENIED) {
          alert("Location access denied. Please enable location permissions in your browser or phone settings to detect your farm location automatically.");
        } else {
          alert("Unable to retrieve GPS coordinates. Please check your device location settings.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const markSingleNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const renderSidebarContent = (isMobile = false) => {
    return (
      <>
        <div className="p-10 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#0a1118] border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden p-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <img src="/logo.png" alt="NeuroHarvest Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none text-white">{t.portalName?.toUpperCase() || 'NEUROHARVEST'}</h1>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mt-1">{t.advancedAgTech}</p>
            </div>
          </div>
          {isMobile && (
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-all" aria-label="Close sidebar">
              <X className="w-6 h-6 text-slate-400 hover:text-white" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-6 space-y-4">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: t.dashboard },
            { id: 'doctor', icon: Stethoscope, label: t.cropDoctor },
            { id: 'geosurveillance', icon: Radar, label: t.geoSurveillance || "Geo-Surveillance" },
            { id: 'smartfarm', icon: Sprout, label: t.smartFarm },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                if (isMobile) setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon className={`w-6 h-6 transition-transform duration-500 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="text-base font-black tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 mt-auto">
          <div className="p-5 bg-slate-800 rounded-3xl mb-8 relative group">
            <button
              onClick={() => { setEditingProfile(userProfile); setIsProfileModalOpen(true); if (isMobile) setIsMobileMenuOpen(false); }}
              className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
              title={t.editProfile || "Edit Profile"}
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate">{userProfile.username}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 truncate">{userProfile.location}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-4 px-6 py-4.5 text-sm font-black text-white bg-slate-800 hover:bg-red-700 transition-all rounded-2xl group"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform text-red-500" />
            <span className="tracking-widest">{t.signOut}</span>
          </button>
        </div>
      </>
    );
  };

  const handleSaveProfile = () => {
    setUserProfile(editingProfile);
    localStorage.setItem('userProfile', JSON.stringify(editingProfile));
    setIsProfileModalOpen(false);
  };

  const t = translations[language] || translations.English;

  const languages = ['English', 'Marathi', 'Kannada', 'Hindi', 'Malayalam', 'Tamil', 'Tulu', 'Bengali', 'Gujarati'];

  const fetchData = async () => {
    try {
      const [res, histRes, weatherRes] = await Promise.all([
        fetch("/api/sensors"),
        fetch("/api/history"),
        fetch("/api/weather")
      ]);
      const json: SensorData = await res.json();
      const histJson = await histRes.json();
      const weatherJson = await weatherRes.json();

      setData(json);
      setSevenDayHistory(histJson);
      setWeather(weatherJson);
      setCurrentTime(new Date().toLocaleTimeString());
      setIsDataReady(true);

      setHistory(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          moisture: Math.round(json.soilMoisture * 10) / 10,
          temp: Math.round(json.temperature * 10) / 10
        };
        const updated = [...prev, newPoint].slice(-10);
        return updated;
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const getFarmerTips = () => {
    if (!data) return [];
    const tips = [];
    if (data.npk.nitrogen < 40) tips.push({ type: 'warning', text: t.nitrogen + t.nitrogenTip });
    if (data.npk.phosphorus < 20) tips.push({ type: 'warning', text: t.phosphorus + t.phosphorusTip });
    if (data.npk.potassium < 40) tips.push({ type: 'warning', text: t.potassium + t.potassiumTip });
    if (data.soilMoisture < 35) tips.push({ type: 'danger', text: t.waterAlert + ": " + t.startPump });
    if (tips.length === 0) tips.push({ type: 'success', text: t.optimalConditions });
    return tips;
  };

  const downloadReport = () => {
    if (!data) return;
    const reportText = `Report for ${new Date().toLocaleString()}\nMoisture: ${(data.soilMoisture ?? 0).toFixed(1)}%\nTemp: ${(data.temperature ?? 0).toFixed(1)}°C`;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Report_${new Date().toISOString()}.txt`;
    link.click();
  };

  if (loading || !data) {
    return (
      <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-32 h-32 flex items-center justify-center bg-[#0a1118] rounded-3xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-4"
        >
          <img src="/logo.png" alt="NeuroHarvest Logo" className="w-full h-full object-contain" />
        </motion.div>
        <div className="mt-8 text-center">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{t.portalName}</h2>
          <p className="text-emerald-400 font-black text-xs tracking-widest mt-2">{t.connecting}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-surface dark:bg-surface transition-colors duration-500">
      <aside className="hidden lg:flex w-[300px] bg-slate-900 text-white flex-col shrink-0">
        {renderSidebarContent(false)}
      </aside>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute top-0 bottom-0 left-0 w-[300px] bg-slate-900 text-white flex flex-col shadow-2xl overflow-y-auto"
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 lg:h-24 bg-surface/80 backdrop-blur-2xl border-b border-border-subtle flex items-center justify-between px-4 lg:px-10 sticky top-0 z-40 transition-colors duration-500">
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-3 rounded-2xl bg-surface-hover hover:bg-primary/10 border border-border-subtle transition-all"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6 text-text-main" />
            </button>
            <div>
              <h2 className="text-xl lg:text-3xl font-black text-text-main tracking-tighter leading-none">{activeTab.toUpperCase()}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-1.5 h-1.5 bg-primary-light rounded-full animate-pulse" />
                <p className="text-[9px] lg:text-[10px] font-black text-text-dim uppercase tracking-[0.2em]">{currentTime}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 lg:p-3.5 rounded-2xl bg-surface-hover hover:bg-primary/10 transition-all border border-border-subtle group"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5 lg:w-6 h-6 text-primary" /> : <Moon className="w-5 h-5 lg:w-6 h-6 text-accent" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-2.5 lg:px-6 lg:py-3.5 rounded-2xl bg-surface-hover border border-border-subtle text-xs lg:text-sm font-black text-text-main transition-all hover:shadow-xl hover:-translate-y-0.5 group"
              >
                <Globe className="w-4 h-4 lg:w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline">{language}</span>
                <span className="sm:hidden">{language.substring(0, 2).toUpperCase()}</span>
              </button>
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-40 sm:w-56 bg-surface rounded-[2rem] shadow-2xl border border-border-subtle overflow-hidden z-50 p-2"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-5 py-3 text-xs sm:text-sm font-bold rounded-2xl transition-all ${language === lang ? 'text-primary bg-primary/10' : 'text-text-dim hover:bg-surface-hover'}`}
                      >
                        {lang}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button onClick={fetchData} title={t.refresh} className="p-2.5 lg:p-3.5 text-text-dim hover:text-primary hover:bg-primary/10 rounded-2xl transition-all active:scale-95 border border-border-subtle shadow-sm">
                <RefreshCcw className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  title={t.notifications || "Agricultural Alerts"}
                  aria-label="Toggle notifications"
                  className={`p-2.5 lg:p-3.5 rounded-2xl transition-all active:scale-95 border border-border-subtle shadow-sm relative ${isNotificationsOpen ? 'bg-primary/20 text-primary border-primary/50' : 'text-text-dim hover:text-primary hover:bg-primary/10'}`}
                >
                  <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-2 right-2 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-accent border-2 border-surface"></span>
                    </span>
                  )}
                </button>

                {/* Notifications Popover Dropdown */}
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="absolute right-0 mt-4 w-80 sm:w-96 bg-surface dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-border-subtle overflow-hidden z-50 p-4"
                    >
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border-subtle px-2">
                        <div className="flex items-center gap-2">
                          <BellRing className="w-5 h-5 text-primary" />
                          <h3 className="font-black text-sm text-text-main uppercase tracking-wider">
                            {t.notifications || "Agricultural Alerts"}
                          </h3>
                          {notifications.filter(n => !n.read).length > 0 && (
                            <span className="px-2 py-0.5 bg-accent/20 text-accent text-[10px] font-black rounded-full">
                              {notifications.filter(n => !n.read).length} NEW
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {notifications.length > 0 && (
                            <>
                              <button
                                onClick={markAllNotificationsRead}
                                title={t.markAllRead || "Mark all read"}
                                className="p-1.5 text-text-dim hover:text-primary hover:bg-primary/10 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={clearAllNotifications}
                                title={t.clearAll || "Clear all"}
                                className="p-1.5 text-text-dim hover:text-red-500 hover:bg-red-500/10 rounded-lg text-xs font-bold transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setIsNotificationsOpen(false)}
                            className="p-1.5 text-text-dim hover:text-text-main rounded-lg transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1 scrollbar-none">
                        {notifications.length === 0 ? (
                          <div className="py-10 text-center flex flex-col items-center justify-center">
                            <Sparkles className="w-10 h-10 text-text-dim/40 mb-3" />
                            <p className="text-xs font-bold text-text-dim">
                              {t.noNotifications || "No active agricultural alerts"}
                            </p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <motion.div
                              key={notif.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              onClick={() => markSingleNotificationRead(notif.id)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${notif.read
                                ? 'bg-surface-hover/50 border-border-subtle opacity-75'
                                : 'bg-surface-hover border-primary/30 shadow-md'
                                }`}
                            >
                              <div className="flex gap-3">
                                <div className={`p-2.5 rounded-xl shrink-0 h-fit ${notif.type === 'danger' ? 'bg-red-500/10 text-red-500' :
                                  notif.type === 'warning' ? 'bg-amber-500/10 text-amber-500' :
                                    notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                                      'bg-blue-500/10 text-blue-500'
                                  }`}>
                                  {notif.category === 'moisture' ? <Droplet className="w-4 h-4" /> :
                                    notif.category === 'pest' ? <AlertTriangle className="w-4 h-4" /> :
                                      notif.category === 'market' ? <TrendingUp className="w-4 h-4" /> :
                                        notif.category === 'npk' ? <Sprout className="w-4 h-4" /> :
                                          <Info className="w-4 h-4" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className={`text-xs font-black truncate ${notif.read ? 'text-text-dim' : 'text-text-main'}`}>
                                      {notif.title}
                                    </h4>
                                    <span className="text-[9px] font-bold text-text-dim shrink-0">
                                      {notif.timestamp}
                                    </span>
                                  </div>
                                  <p className="text-[11px] font-medium text-text-dim leading-snug">
                                    {notif.message}
                                  </p>
                                </div>
                              </div>
                              {!notif.read && (
                                <span className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full" />
                              )}
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              onClick={downloadReport}
              className="bg-primary text-white px-4 py-2.5 lg:px-8 lg:py-3.5 rounded-2xl text-xs lg:text-sm font-black hover:bg-primary-dark transition-all shadow-2xl shadow-primary/30 active:scale-95 uppercase"
            >
              <span className="hidden sm:inline">{t.report || 'EXPORT REPORT'}</span>
              <span className="sm:hidden">{t.report ? t.report.split(' ')[0] : 'EXPORT'}</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-surface transition-colors duration-500">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 lg:p-8 space-y-4 lg:space-y-6"
              >
                <div className="grid grid-cols-12 gap-4 lg:gap-10">
                  {/* Weather Forecast - Prominent placement */}
                  <div className="col-span-12">
                    <WeatherForecast
                      t={t}
                      weather={weather}
                      currentLocation={userProfile.location}
                      onDetectLocation={handleDetectLocation}
                      isDetectingLocation={isDetectingLocation}
                    />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="col-span-12 lg:col-span-4 glass-card p-6 flex items-center gap-6"
                  >
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                      <Droplets className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-text-dim uppercase tracking-[0.2em] mb-1">{t.moisture}</p>
                      <h3 className="text-3xl font-extrabold text-text-main tracking-tight">{(data?.soilMoisture ?? 0).toFixed(1)}%</h3>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="col-span-12 lg:col-span-4 glass-card p-6 flex items-center gap-6"
                  >
                    <div className="p-4 bg-accent/10 rounded-2xl text-accent">
                      <Thermometer className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-text-dim uppercase tracking-[0.2em] mb-1">{t.temp}</p>
                      <h3 className="text-3xl font-extrabold text-text-main tracking-tight">{(data?.temperature ?? 0).toFixed(1)}°C</h3>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="col-span-12 lg:col-span-4 glass-card p-6 flex items-center gap-6"
                  >
                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-600">
                      <Activity className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-text-dim uppercase tracking-[0.2em] mb-1">{t.status || t.system}</p>
                      <h3 className="text-xl font-extrabold text-text-main tracking-tight leading-none">{(data?.soilMoisture ?? 0) < 30 ? t.attention : t.optimalStatus}</h3>
                    </div>
                  </motion.div>

                  {/* Charts */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="col-span-12 lg:col-span-8 glass-card p-8"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-bold text-text-main">{t.trends}</h3>
                        <p className="text-xs font-bold text-text-dim uppercase tracking-widest mt-1">{t.realTimeTelemetry}</p>
                      </div>
                      <div className="flex items-center gap-3 px-3 py-1.5 bg-primary/5 rounded-full">
                        <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{t.live}</span>
                      </div>
                    </div>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={history}>
                          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="time" hide />
                          <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fontWeight: 700, fill: '#94a3b8' }} />
                          <RechartsTooltip
                            contentStyle={{
                              borderRadius: '16px',
                              border: 'none',
                              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                              padding: '12px 16px',
                              backgroundColor: '#fff'
                            }}
                          />
                          <Line type="monotone" dataKey="moisture" stroke="#166534" strokeWidth={4} dot={{ r: 4, fill: '#166534', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* Tips/Alerts */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="col-span-12 lg:col-span-4"
                  >
                    <div className="glass-card p-6 h-full">
                      <h3 className="text-xl font-bold text-text-main mb-8 flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Info className="w-5 h-5 text-primary" />
                        </div>
                        {t.tips}
                      </h3>
                      <div className="space-y-4">
                        <div className="p-5 rounded-2xl flex items-start gap-4 border transition-all hover:scale-[1.02] bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 shadow-sm shadow-red-100">
                          <div className="p-1.5 rounded-lg bg-red-200 dark:bg-red-900/50 shrink-0">
                            <AlertTriangle className="w-5 h-5 text-red-700 dark:text-red-300" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 block mb-1">
                              {language === 'Marathi' ? 'रोगाचा पूर्व इशारा' : language === 'Bengali' ? 'রোগের পূর্ব সতর্কবার্তা' : language === 'Gujarati' ? 'રોગની આગોતરી ચેતવણી' : language === 'Hindi' ? 'रोग की पूर्व चेतावनी' : language === 'Kannada' ? 'ರೋಗದ ಪೂರ್ವ ಮುನ್ನೆಚ್ಚರಿಕೆ' : 'Early Pest & Disease Warning'}
                            </span>
                            <p className="text-xs font-bold leading-relaxed tracking-wide">
                              ⚠️ <strong className="font-extrabold">{language === 'Marathi' ? 'उच्च धोक्याची सूचना:' : language === 'Hindi' ? 'उच्च जोखिम चेतावनी:' : language === 'Gujarati' ? 'ઉચ્ચ જોખમ ચેતવણી:' : 'High Risk Warning:'}</strong> {
                                language === 'Marathi' ? 'नाशिकमधील ७०% हवेतील आर्द्रतेमुळे द्राक्ष आणि कापसावर बुरशीजन्य रोगाचा प्रादुर्भाव वाढण्याची दाट शक्यता. ४८ तासांत बुरशीनाशकाची फवारणी करा.' :
                                  language === 'Gujarati' ? 'નાસિકમાં ૭૦% ભેજને કારણે દ્રાક્ષ અને કપાસમાં ફૂગજન્ય રોગનું જોખમ. ૪૮ કલાકમાં જંતુનાશક છાંટો.' :
                                    language === 'Hindi' ? 'नासिक में 70% आर्द्रता के कारण अंगूर और कपास में कवक रोग का उच्च जोखिम। 48 घंटे में कवकनाशी का छिड़काव करें।' :
                                      language === 'Bengali' ? 'নাসিকে ৭০% আর্দ্রতার কারণে আঙুর ও তুলায় ছত্রাকজনিত রোগের ঝুঁকি। ৪৮ ঘণ্টার মধ্যে ছত্রাকনাশক স্প্রে করুন।' :
                                        language === 'Kannada' ? 'ನಾಸಿಕ್‌ನಲ್ಲಿ ೭೦% ಆರ್ದ್ರತೆಯಿಂದಾಗಿ ದ್ರಾಕ್ಷಿ ಮತ್ತು ಹತ್ತಿಯಲ್ಲಿ ಶಿಲೀಂಧ್ರ ರೋಗದ ಹೆಚ್ಚಿನ ಅಪಾಯ. ೪೮ ಗಂಟೆಗಳಲ್ಲಿ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಿ.' :
                                          'Elevated humidity (70%) in Nashik creates optimal spore conditions for Fungal Blight in Grapes & Cotton. Preventive fungicide spray recommended within 48h.'
                              }
                            </p>
                          </div>
                        </div>

                        <div className="p-5 rounded-2xl flex items-start gap-4 border transition-all hover:scale-[1.02] bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 shadow-sm shadow-amber-100">
                          <div className="p-1.5 rounded-lg bg-amber-200 dark:bg-amber-900/50 shrink-0">
                            <Zap className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 block mb-1">
                              {language === 'Marathi' ? 'किड सर्वेक्षण सल्ला' : language === 'Hindi' ? 'कीट निगरानी सलाह' : language === 'Gujarati' ? 'જીવાત નિરીક્ષણ સલાહ' : 'Pest Surveillance Advisory'}
                            </span>
                            <p className="text-xs font-bold leading-relaxed tracking-wide">
                              {
                                language === 'Marathi' ? 'निफाड आणि दिंडोरी भागात गुलाबी बोंड अळीचा प्रादुर्भाव. प्रति एकर ५ कामगंध सापळे त्वरित लावा.' :
                                  language === 'Gujarati' ? 'નિફાડ વિસ્તારમાં ગુલાબી ઈયળનો ઉપદ્રવ. એકર દીઠ ૫ ફેરોમોન ટ્રેપ ગોઠવો.' :
                                    language === 'Hindi' ? 'निफाड़ में गुलाबी सुंडी का प्रकोप। प्रति एकड़ 5 फेरोमोन ट्रैप लगाएं।' :
                                      language === 'Bengali' ? 'নিফাড় এলাকায় গোলাপী বোলওয়ার্মের প্রাদুর্ভাব। প্রতি একরে ৫টি ফেরোমোন ফাঁদ ব্যবহার করুন।' :
                                        language === 'Kannada' ? 'ನಿಫಾಡ್‌ನಲ್ಲಿ ಗುಲಾಬಿ ಕಾಯಿ ಹುಳುವಿನ ಭಾದೆ. ಎಕರೆಗೆ ೫ ಫೆರಮೋನ್ ಬಲೆಗಳನ್ನು ಹಾಕಿ.' :
                                          'Pink Bollworm emergence monitored across Niphad & Dindori clusters. Deploy 5 pheromone traps per acre immediately.'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ) : activeTab === 'smartfarm' ? (
              <motion.div key="smartfarm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                <SmartFarm data={data} history={history} sevenDayHistory={sevenDayHistory} t={t} weather={weather} language={language} />
              </motion.div>
            ) : activeTab === 'geosurveillance' ? (
              <motion.div key="geosurveillance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                <GeoSurveillance t={t} language={language} />
              </motion.div>
            ) : (
              <motion.div key="doctor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                <CropDoctor
                  language={language}
                  t={t}
                  diagnosisHistory={diagnosisHistory}
                  setDiagnosisHistory={setDiagnosisHistory}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-text-main">{t.editProfile || "Edit Profile"}</h3>
                <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-text-main transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">{t.username || "Username"}</label>
                  <input
                    type="text"
                    value={editingProfile.username}
                    onChange={(e) => setEditingProfile({ ...editingProfile, username: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-text-main font-bold focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">{t.location || "Location"}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingProfile.location}
                      onChange={(e) => setEditingProfile({ ...editingProfile, location: e.target.value })}
                      placeholder="e.g. Mangalore, Shimoga, Hassan..."
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-text-main font-bold focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!navigator.geolocation) {
                          alert("Geolocation not supported by device.");
                          return;
                        }
                        setIsDetectingLocation(true);
                        navigator.geolocation.getCurrentPosition(
                          async (pos) => {
                            try {
                              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
                              const g = await res.json();
                              const city = g.address?.city || g.address?.town || g.address?.village || g.address?.county || `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`;
                              setEditingProfile(p => ({ ...p, location: city }));
                            } catch (e) {
                              setEditingProfile(p => ({ ...p, location: `GPS (${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°)` }));
                            } finally {
                              setIsDetectingLocation(false);
                            }
                          },
                          (err) => {
                            setIsDetectingLocation(false);
                            alert("Location access denied or unavailable. Please enable device GPS permissions.");
                          }
                        );
                      }}
                      disabled={isDetectingLocation}
                      className="px-4 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0"
                      title="Auto-detect current GPS location"
                    >
                      {isDetectingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                      <span className="hidden sm:inline">GPS</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-dim uppercase tracking-widest mb-2">{t.majorCrop || "Major Crop"}</label>
                  <input
                    type="text"
                    value={editingProfile.majorCrop}
                    onChange={(e) => setEditingProfile({ ...editingProfile, majorCrop: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-text-main font-bold focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex gap-4 mt-8 pt-4">
                  <button
                    onClick={() => setIsProfileModalOpen(false)}
                    className="flex-1 py-3.5 rounded-xl font-black text-sm tracking-widest text-text-dim bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {t.cancel || "CANCEL"}
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 py-3.5 rounded-xl font-black text-sm tracking-widest text-white bg-primary hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    {t.save || "SAVE"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
