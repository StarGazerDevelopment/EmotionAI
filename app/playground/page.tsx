"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { Client } from "@gradio/client";
import { Loader2, Camera, Upload, X, Video, VideoOff } from "lucide-react";
import Link from "next/link";

export default function Playground() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [mode, setMode] = useState<"upload" | "camera" | "live">("upload");
  const webcamRef = useRef<Webcam>(null);
  const [liveActive, setLiveActive] = useState(false);
  
  // Clients
  const [emotionClient, setEmotionClient] = useState<any>(null);
  const [detectClient, setDetectClient] = useState<any>(null);

  useEffect(() => {
    const initClients = async () => {
      try {
        const eClient = await client("E1011au/EmotionAI");
        const dClient = await client("E1011au/FaceDetectAI");
        setEmotionClient(eClient);
        setDetectClient(dClient);
      } catch (err) {
        console.error("Failed to connect to HF Spaces", err);
      }
    };
    initClients();
  }, []);

  const processImage = async (imgData: string) => {
    if (!emotionClient || !detectClient) return;
    setLoading(true);
    setResult(null);

    try {
      // Convert base64 to blob
      const res = await fetch(imgData);
      const blob = await res.blob();

      // Parallel requests
      const [emotionRes, detectRes] = await Promise.all([
        emotionClient.predict("/predict", { pil_image: blob }), 
        detectClient.predict("/predict", { pil_image: blob })
      ]);

      // Parse results
      // Emotion API returns Label text: "Smiling (98.5%)"
      // Detect API returns Image with box drawn (url)
      
      setResult({
        emotion: emotionRes.data[0], // Adjust based on actual API return structure
        detectImage: detectRes.data[0].url // Adjust based on actual API return structure
      });
    } catch (err) {
      console.error(err);
      alert("Error processing image. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      setMode("upload"); // Switch to view mode
      processImage(imageSrc);
    }
  }, [webcamRef, emotionClient, detectClient]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        processImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Live Mode Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === "live" && liveActive && emotionClient) {
      interval = setInterval(async () => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            // Only doing Emotion for live to keep it fast(er)
            try {
              const res = await fetch(imageSrc);
              const blob = await res.blob();
              const emotionRes = await emotionClient.predict("/predict", { pil_image: blob });
              setResult({ emotion: emotionRes.data[0], isLive: true });
            } catch (e) {
              console.log("Live frame skip");
            }
          }
        }
      }, 1000); // 1 FPS
    }
    return () => clearInterval(interval);
  }, [mode, liveActive, emotionClient]);

  return (
    <div className="min-h-screen bg-dark text-white p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
        <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          EmotionAI <span className="text-xs text-gray-500 font-normal ml-2">PLAYGROUND</span>
        </Link>
        <div className="flex gap-2">
           <button 
             onClick={() => { setMode("upload"); setLiveActive(false); setImage(null); setResult(null); }}
             className={`p-2 rounded-lg transition-colors ${mode === "upload" ? "bg-white/10" : "hover:bg-white/5"}`}
           >
             <Upload size={20} />
           </button>
           <button 
             onClick={() => { setMode("camera"); setLiveActive(false); setImage(null); setResult(null); }}
             className={`p-2 rounded-lg transition-colors ${mode === "camera" ? "bg-white/10" : "hover:bg-white/5"}`}
           >
             <Camera size={20} />
           </button>
           <button 
             onClick={() => { setMode("live"); setLiveActive(true); setImage(null); setResult(null); }}
             className={`p-2 rounded-lg transition-colors ${mode === "live" ? "bg-red-500/20 text-red-400" : "hover:bg-white/5"}`}
           >
             <Video size={20} />
           </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden min-h-[600px] relative flex flex-col items-center justify-center backdrop-blur-sm shadow-2xl">
          
          {/* Viewport */}
          <div className="relative w-full h-full flex-grow flex items-center justify-center p-4">
            
            {/* Initial State */}
            {!image && mode === "upload" && (
              <div className="text-center p-10 border-2 border-dashed border-white/10 rounded-2xl">
                <Upload className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Upload an image to analyze</p>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleUpload}
                  className="hidden" 
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  className="px-6 py-2 bg-primary hover:bg-primary/80 rounded-full cursor-pointer transition-colors font-medium"
                >
                  Choose File
                </label>
              </div>
            )}

            {/* Camera / Live Mode */}
            {(mode === "camera" || mode === "live") && (
              <div className="relative w-full max-w-lg aspect-[3/4] md:aspect-video bg-black rounded-2xl overflow-hidden">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                />
                {mode === "camera" && (
                  <button 
                    onClick={capture}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-300 shadow-lg hover:scale-105 transition-transform"
                  />
                )}
                {mode === "live" && (
                   <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/80 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                     <div className="w-2 h-2 bg-white rounded-full" /> LIVE
                   </div>
                )}
                
                {/* Live Overlay */}
                {mode === "live" && result && (
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                     <div className="text-2xl font-bold text-yellow-400 text-center">
                       {result.emotion}
                     </div>
                  </div>
                )}
              </div>
            )}

            {/* Result View */}
            {image && (
              <div className="relative w-full max-w-2xl">
                <img 
                  src={result?.detectImage || image} 
                  alt="Analyzed" 
                  className="w-full rounded-lg shadow-lg border border-white/20"
                />
                
                {/* Close Button */}
                <button 
                  onClick={() => { setImage(null); setResult(null); }}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full backdrop-blur-md transition-colors"
                >
                  <X size={20} />
                </button>

                {/* Loading Overlay */}
                {loading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  </div>
                )}

                {/* Emotion Overlay */}
                {result && !loading && (
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl"
                   >
                     <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-wider">Detected Emotion</p>
                          <h3 className="text-2xl font-bold text-white">{result.emotion}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-xs uppercase tracking-wider">Face Tracking</p>
                          <h3 className="text-lg font-medium text-green-400">Active</h3>
                        </div>
                     </div>
                   </motion.div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
