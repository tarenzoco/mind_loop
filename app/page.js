"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeBackground from "@/components/ThemeBackground";

// 🌈 Theme gradient map
const themeGradients = {
  "Rain Zen": "linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #0ea5a9 100%)",
  "Ocean Flow": "linear-gradient(135deg, #012a4a 0%, #0366a6 40%, #40c9ff 100%)",
  "Forest Serenity": "linear-gradient(135deg, #072521 0%, #0f9d58 50%, #c7f9d4 100%)",
  "Focus Energy": "linear-gradient(135deg, #2b1055 0%, #7b2ff7 45%, #ff7eb3 100%)",
  "Deep Space": "linear-gradient(135deg, #020111 0%, #2b5876 50%, #0f0c29 100%)",
};

export default function Home() {
  const [activeTheme, setActiveTheme] = useState("Rain Zen");
  const [showThemes, setShowThemes] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [affirmCount, setAffirmCount] = useState(3);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakIndex, setSpeakIndex] = useState(null);
  const [voiceLabel, setVoiceLabel] = useState("");

  const synthRef = useRef(typeof window !== "undefined" ? window.speechSynthesis : null);
  const utterRef = useRef(null);
  const voiceNamePreferred = "Microsoft Aria Online (Natural) - English (United States)";

  // 🧠 Affirmation presets
  const presets = [
    { label: "🧘 Calm", prompt: "peace and calm" },
    { label: "💪 Confidence", prompt: "confidence and self-belief" },
    { label: "🌞 Morning Boost", prompt: "morning motivation" },
    { label: "🌙 Night Peace", prompt: "relaxation before sleep" },
  ];

  // 🔹 Clean affirmations
  const cleanExtract = (text) =>
    String(text || "")
      .split(/\n+/)
      .map((a) =>
        a
          .replace(/^[\d\.\-\•\s]+/, "")
          .replace(/\*+|["“”]/g, "")
          .trim()
      )
      .filter(
        (a) =>
          a &&
          !a.toLowerCase().includes("here are") &&
          !a.toLowerCase().includes("affirmations for") &&
          a.length > 3
      );

  // 🔹 Stop speaking
  const stopSpeaking = () => {
    try {
      if (utterRef.current) utterRef.current.onend = null;
      if (synthRef.current) synthRef.current.cancel();
    } catch (e) {}
    setIsSpeaking(false);
    setSpeakIndex(null);
  };

  // 🔹 Speak all affirmations
  const speakAffirmations = () => {
    if (!synthRef.current || result.length === 0) return;
    stopSpeaking();

    const voices = synthRef.current.getVoices();
    const selectedVoice =
      voices.find((v) => v.name === voiceNamePreferred) ||
      voices.find((v) => v.name.toLowerCase().includes("aria")) ||
      voices.find((v) => v.name.toLowerCase().includes("female")) ||
      voices.find((v) => v.lang && v.lang.startsWith("en")) ||
      voices[0];

    setVoiceLabel(selectedVoice?.name || "Default voice");
    setIsSpeaking(true);
    setSpeakIndex(0);

    let idx = 0;
    let isCancelled = false;

    const speakNext = () => {
      if (isCancelled || idx >= result.length) {
        setIsSpeaking(false);
        setSpeakIndex(null);
        return;
      }

      const prefix =
        idx === 0 ? "First affirmation:" :
        idx === 1 ? "Second affirmation:" :
        `${idx + 1}th affirmation:`;

      const utter = new SpeechSynthesisUtterance(`${prefix} ${result[idx]}`);
      utterRef.current = utter;
      if (selectedVoice) utter.voice = selectedVoice;
      utter.rate = 1;
      utter.pitch = 1.05;
      utter.volume = 1;

      utter.onend = () => {
        idx += 1;
        setSpeakIndex(idx < result.length ? idx : null);
        setTimeout(() => speakNext(), 600);
      };

      utter.onerror = () => {
        isCancelled = true;
        setIsSpeaking(false);
        setSpeakIndex(null);
      };

      synthRef.current.speak(utter);
    };

    speakNext();
  };

  // 🔹 Speak one
  const speakSingleAffirmation = (text, index) => {
    if (!text || !synthRef.current) return;
    stopSpeaking();

    const voices = synthRef.current.getVoices();
    const selectedVoice =
      voices.find((v) => v.name === voiceNamePreferred) ||
      voices.find((v) => v.name.toLowerCase().includes("aria")) ||
      voices.find((v) => v.name.toLowerCase().includes("female")) ||
      voices.find((v) => v.lang && v.lang.startsWith("en")) ||
      voices[0];

    const utter = new SpeechSynthesisUtterance(text);
    if (selectedVoice) utter.voice = selectedVoice;
    utter.rate = 1;
    utter.pitch = 1.05;
    utter.volume = 1;

    setSpeakIndex(index);
    setIsSpeaking(true);

    utter.onend = () => {
      setIsSpeaking(false);
      setSpeakIndex(null);
    };

    synthRef.current.speak(utter);
  };

  // 🔹 Generate affirmations
  const generateAffirmations = async (inputPrompt) => {
    const usePrompt = (inputPrompt || prompt || "").trim();
    if (!usePrompt) return alert("Enter a theme first!");
    setLoading(true);
    setResult([]);
    stopSpeaking();

    try {
      const res = await fetch("/api/affirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Write exactly ${affirmCount} short, unique, positive affirmations about ${usePrompt}. 
Return them each on a separate line.`,
        }),
      });

      const data = await res.json();
      let affirmations = [];
      if (Array.isArray(data.affirmations)) affirmations = data.affirmations;
      else if (typeof data.affirmations === "string") affirmations = cleanExtract(data.affirmations);
      setResult(affirmations.slice(0, affirmCount));
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Voice load
  useEffect(() => {
    if (!synthRef.current) return;
    const populate = () => {
      const v = synthRef.current.getVoices();
      if (v && v.length) {
        const selected = v.find((x) => x.name === voiceNamePreferred) || v[0];
        setVoiceLabel(selected?.name || "");
      }
    };
    populate();
    window.speechSynthesis?.addEventListener?.("voiceschanged", populate);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", populate);
  }, []);

  const speakingBadge = () => {
    if (!isSpeaking) return null;
    const total = result.length || affirmCount;
    const current = speakIndex !== null ? speakIndex + 1 : 1;
    return `${current} / ${total}`;
  };

  // 🌅 Main Render
  return (
    <main className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/* 🌌 Dynamic Background */}
      <ThemeBackground theme={activeTheme} />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg p-8 rounded-2xl shadow-[0_10px_30px_rgba(2,6,23,0.7)] border border-gray-800 backdrop-blur-sm bg-[#0b1220]/40"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6 relative">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            🧠 Mind Loop
          </h1>

          <div className="flex items-center gap-3">
            {/* 🎨 Theme Button */}
            <div
              className="relative group"
              onMouseEnter={() => setShowThemes(true)}
              onMouseLeave={() => setShowThemes(false)}
            >
              <button
                onClick={() => setShowThemes(!showThemes)}
                className="p-2 rounded-lg bg-gray-800/60 hover:bg-blue-700 text-gray-100 transition"
                title="Themes"
              >
                🎨
              </button>

              <AnimatePresence>
                {showThemes && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 bg-[#0b1220] border border-gray-700 rounded-xl shadow-lg z-50 w-44"
                  >
                    {Object.keys(themeGradients).map((theme) => (
                      <div
                        key={theme}
                        onClick={() => {
                          setActiveTheme(theme);
                          setShowThemes(false);
                        }}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-600/30 transition ${
                          activeTheme === theme
                            ? "text-blue-400 font-semibold"
                            : "text-gray-200"
                        }`}
                      >
                        {theme}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 🔊 Speaking Status */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${
            isSpeaking
              ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
              : "bg-gray-800 text-gray-200"
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full ${
              isSpeaking ? "animate-pulse bg-white" : "bg-gray-400"
            }`}
          />
          <div className="min-w-[80px]">
            {isSpeaking ? `Speaking ${speakingBadge()}` : "Ready"}
          </div>
        </div>

        {/* PRESETS */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setPrompt(p.prompt);
                generateAffirmations(p.prompt);
              }}
              className="px-3 py-2 rounded-lg bg-[#111827] hover:bg-blue-700 text-sm text-gray-200 transition"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* INPUT + CONTROLS */}
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="Enter a theme (e.g., focus, peace, success)"
          className="w-full rounded-xl p-4 bg-[#0b1220] border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex items-center gap-3 mt-4">
          <div className="flex gap-2">
            {[1, 3, 5].map((n) => (
              <button
                key={n}
                onClick={() => setAffirmCount(n)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  affirmCount === n
                    ? "bg-blue-600 text-white"
                    : "bg-[#0b1220] text-gray-300"
                }`}
              >
                {n}×
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <div className="flex gap-2">
            <button
              onClick={() => generateAffirmations()}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold shadow-md"
            >
              {loading ? "Generating..." : "Generate"}
            </button>

            <button
              onClick={isSpeaking ? stopSpeaking : speakAffirmations}
              disabled={result.length === 0}
              className={`px-4 py-2 rounded-xl font-semibold text-white shadow-md transition ${
                isSpeaking
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isSpeaking ? "⛔ Stop" : "🔊 Speak"}
            </button>
          </div>
        </div>

        {/* OUTPUT */}
        <div className="mt-6 bg-gradient-to-br from-[#071023]/40 to-[#071018]/30 p-5 rounded-xl border border-gray-800 text-gray-100 min-h-[140px]">
          {result.length === 0 ? (
            <div className="text-gray-400">
              ✨ Your affirmations will appear here...
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-gray-100 leading-relaxed">
              {result.map((r, i) => {
                const isActive = isSpeaking && speakIndex === i;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => speakSingleAffirmation(r, i)}
                    className={`mb-3 p-2 rounded-lg cursor-pointer select-none transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600/30 to-purple-600/30 shadow-[0_0_20px_rgba(59,130,246,0.25)] scale-[1.02]"
                        : "hover:bg-[#1e1e1e]/50"
                    }`}
                  >
                    <span
                      className={`font-semibold mr-2 ${
                        isActive ? "text-blue-400" : "text-blue-300"
                      }`}
                    >
                      {i + 1}.
                    </span>
                    <span
                      className={`${
                        isActive ? "text-white font-medium" : "text-gray-100"
                      }`}
                    >
                      {r}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-5 text-xs text-gray-500 text-center">
          <span>
            Polished UI — premium feel. Next up: Background Audio Layer.
          </span>
        </div>
      </motion.div>
    </main>
  );
}
