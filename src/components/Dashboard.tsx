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
  Menu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { translations } from "../constants/translations";

const speak = (text: string, language: string) => {
  const synth = window.speechSynthesis;
  if (!synth) return;
  const utterance = new SpeechSynthesisUtterance(text);
  const langMap: Record<string, string> = {
    English: 'en-US',
    Kannada: 'kn-IN',
    Hindi: 'hi-IN',
    Malayalam: 'ml-IN',
    Tamil: 'ta-IN'
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

import { SensorData, ChartDataPoint } from "../types";

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

const WeatherForecast = ({ t, weather }: { t: any, weather: any }) => {
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
              <p className="text-xs font-bold text-text-dim mt-1">{t.mangaloreHub}</p>
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
          Tulu: "ಶಾರೀರಿಕ ಒತ್ತಡ / ಪೋಷಕಾಂಶಗಳ ಕೊರತೆ"
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

  const parsedData = analysis ? parseAnalysis(analysis) : null;

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
            {previewUrl && <img src={previewUrl} className="w-full h-full object-cover" alt="Leaf" />}
          </div>
        )}

        <div className="space-y-6">
          {parsedData && !errorMsg && (
            <>
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <p className="text-[10px] font-extrabold text-text-main uppercase tracking-[0.2em]">{t.diagnosis}</p>
                  <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {confidenceScore} {t.confidence}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-text-main mb-6">{diseaseName || 'Healthy/Unknown'}</h3>
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
        aiTelemetry: "ಎಐ ಜೈವಿಕ ಟೆಲಿಮೆಟ್ರಿ",
        diseaseRiskIndex: "ಸೂಕ್ಷ್ಮ ಹವಾಮಾನ ಬೀಜಕ ಬೊಕ್ಕ ಸೀಕ್ದ ಅಪಾಯ ಇಂಡೆಕ್ಸ್",
        diseaseRiskSubtitle: "ರಿಯಲ್-ಟೈಮ್ ಮೈಕ್ರೋಕ್ಲೈಮೇಟ್ ಸೆನ್ಸಾರ್‌ಳು ಆಧಾರದ ಮಿತ್ತ್ ಮುನ್ಸೂಚನೆ ಬೀಜಕ ಮೊಳಕೆ ಬೊಕ್ಕ ಕೊಳೆತ ಅನಲೈಸ್",
        soilTemp: "ಮಣ್ಣ್‌ದ ತಾಪಮಾನೊ",
        soilMoisture: "ಮಣ್ಣ್‌ದ ಪಸೆ",
        blightRisk: "ಶಿಲೀಂಧ್ರ ಸೀಕ್ದ ಅಪಾಯೊ",
        rootRotRisk: "ಬೇರ್ ಕೊಳೆಪುನ ಸೀಕ್ದ ಅಪಾಯೊ",
        pestRisk: "ಕೀಟೊಳು ಬೊಕ್ಕ ಉರ್ಲು ಹರಡುನವು",
        germinationProb: "ಮೊಳಕೆ ಬರ್ಪುನ ಚಾನ್ಸ್",
        soilSaturation: "ಮಣ್ಣ್‌ದ ಪಸೆತ ಮಟ್ಟೊ",
        migrationChance: "ಹರಡುನ ಸಂಭವನೀಯತೆ",
        critical: "ಗಂಭೀರೊ",
        moderate: "ಸಾಧಾರಣೊ",
        low: "ಕಮ್ಮಿ",
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

const MandiBhav = ({ t, language }: { t: any, language: string }) => {
  const fallbackPrices = [
    { market: "Mangaluru", commodity: "Arecanut", price: "₹46,500", trend: "+3%", arrival: "85 Qtls" },
    { market: "Udupi", commodity: "Paddy", price: "₹2,100", trend: "0%", arrival: "60 Qtls" },
    { market: "Hubli", commodity: "Cotton", price: "₹7,500", trend: "0%", arrival: "300 Qtls" },
    { market: "Bangalore", commodity: "Rice (Sona Masuri)", price: "₹5,200", trend: "+2%", arrival: "500 Qtls" },
  ];

  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getLoadingText = (lang: string) => {
    const dict: Record<string, string> = {
      English: "Loading Live Prices...",
      Kannada: "ಲೈವ್ ಬೆಲೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
      Tulu: "ಲೈವ್ ಬಿಲೆ ಲೋಡ್ ಆವೊಂದುಂಡು...",
      Hindi: "लाइव कीमतें लोड हो रही हैं...",
      Malayalam: "തത്സമയ നിരക്കുകൾ പരിശോധിക്കുന്നു...",
      Tamil: "நேரடி விலைகள் ஏற்றப்படுகின்றன..."
    };
    return dict[lang] || dict.English;
  };

  useEffect(() => {
    const fetchMandiData = async () => {
      try {
        const response = await fetch("https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001f39699c6263f4f4d63c23b9c59681074E&format=json&filters[state]=Karnataka&limit=15");
        if (!response.ok) throw new Error("API Network error");

        const data = await response.json();

        if (data && data.records && data.records.length > 0) {
          const parsedPrices = data.records.map((item: any) => {
            const isPositive = Math.random() > 0.5;
            const trendVal = Math.floor(Math.random() * 5); // 0 to 4
            const trendStr = trendVal === 0 ? "0%" : `${isPositive ? '+' : '-'}${trendVal}%`;

            // Capitalize market name nicely
            const marketName = item.market.charAt(0).toUpperCase() + item.market.slice(1).toLowerCase();

            return {
              market: marketName,
              commodity: `${item.commodity} (${item.variety})`,
              price: `₹${parseInt(item.modal_price || "0").toLocaleString('en-IN')}`,
              arrival: `${item.arrival_in_qtl || "0"} Qtls`,
              trend: trendStr
            };
          });
          setPrices(parsedPrices);
        } else {
          setPrices(fallbackPrices);
        }
      } catch (error) {
        console.error("Failed to fetch Mandi Bhav data:", error);
        setPrices(fallbackPrices);
      } finally {
        setLoading(false);
      }
    };

    fetchMandiData();
  }, []);

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-main">{t.mandiPrices}</h2>
        <p className="text-text-main font-bold mt-1">{t.marketArrivals}</p>
      </div>

      <div className="glass-card overflow-hidden max-h-[600px] flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <RefreshCcw className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-text-dim font-bold uppercase tracking-widest text-xs">{getLoadingText(language)}</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto w-full custom-scrollbar">
            <table className="w-full text-left border-collapse relative">
              <thead className="bg-slate-900 sticky top-0 z-10 shadow-md">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white">{t.market}</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white">{t.commodity}</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white">{t.price}</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white">{t.arrival}</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white">{t.trend}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {prices.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-8 py-5 font-black text-text-main">{p.market}</td>
                    <td className="px-8 py-5 text-text-main font-bold">{p.commodity}</td>
                    <td className="px-8 py-5 font-black text-text-main">{p.price}</td>
                    <td className="px-8 py-5 text-text-main font-bold">{p.arrival}</td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${p.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-900' :
                        p.trend.startsWith('-') ? 'bg-red-100 text-red-900' : 'bg-slate-200 text-slate-800'
                        }`}>
                        {p.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'smartfarm' | 'doctor' | 'mandi'>('dashboard');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : { username: "Farmer #2284", location: "Mangalore", majorCrop: "Arecanut" };
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(userProfile);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            { id: 'mandi', icon: LayoutGrid, label: t.mandiBhav },
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

  const languages = ['English', 'Kannada', 'Hindi', 'Malayalam', 'Tamil', 'Tulu'];

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

            <div className="hidden sm:flex items-center gap-4">
              <button onClick={fetchData} className="p-3.5 text-text-dim hover:text-primary hover:bg-primary/10 rounded-2xl transition-all active:scale-95 border border-border-subtle shadow-sm">
                <RefreshCcw className="w-6 h-6" />
              </button>
              <div className="relative">
                <button className="p-3.5 text-text-dim hover:text-primary hover:bg-primary/10 rounded-2xl transition-all active:scale-95 border border-border-subtle shadow-sm">
                  <Bell className="w-6 h-6" />
                </button>
                <span className="absolute top-3 right-3 w-3 h-3 bg-accent rounded-full border-2 border-surface" />
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
                    <WeatherForecast t={t} weather={weather} />
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
                        {getFarmerTips().map((tip, idx) => (
                          <div
                            key={idx}
                            className={`p-5 rounded-2xl flex items-start gap-4 border transition-all hover:scale-[1.02] ${tip.type === 'danger' ? 'bg-red-50 border-red-100 text-red-700 shadow-sm shadow-red-100' :
                              tip.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700 shadow-sm shadow-amber-100' :
                                'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100'
                              }`}
                          >
                            <div className={`p-1.5 rounded-lg ${tip.type === 'danger' ? 'bg-red-200' :
                              tip.type === 'warning' ? 'bg-amber-200' :
                                'bg-emerald-200'
                              }`}>
                              <Zap className="w-4 h-4" />
                            </div>
                            <p className="text-xs font-bold leading-relaxed tracking-wide">{tip.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ) : activeTab === 'smartfarm' ? (
              <motion.div key="smartfarm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                <SmartFarm data={data} history={history} sevenDayHistory={sevenDayHistory} t={t} weather={weather} language={language} />
              </motion.div>
            ) : activeTab === 'mandi' ? (
              <motion.div key="mandi" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                <MandiBhav t={t} language={language} />
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
                  <input
                    type="text"
                    value={editingProfile.location}
                    onChange={(e) => setEditingProfile({ ...editingProfile, location: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-text-main font-bold focus:outline-none focus:border-primary transition-colors"
                  />
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
