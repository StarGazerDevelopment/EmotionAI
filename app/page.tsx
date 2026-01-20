"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Camera, Brain, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-dark text-white overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          EmotionAI
        </div>
        <Link 
          href="/playground"
          className="px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors"
        >
          Launch App
        </Link>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-block mb-4 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300">
            Powered by Llama-4 Vision & ResNet50
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
            See the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Unseen.</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Enterprise-grade emotion recognition and face detection. 
            Analyze human expression with unprecedented accuracy in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/playground">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-full font-bold text-lg flex items-center gap-2 shadow-lg shadow-primary/25"
              >
                Try Playground <ArrowRight size={20} />
              </motion.button>
            </Link>
            <a 
              href="https://github.com/StarGazerDevelopment/EmotionAI" 
              target="_blank"
              className="px-8 py-4 rounded-full font-bold text-lg border border-white/10 hover:bg-white/5 transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-6xl w-full px-4">
          {[
            { icon: Brain, title: "Dual AI Models", desc: "Running state-of-the-art Detection & Emotion models concurrently." },
            { icon: Zap, title: "Real-time Analysis", desc: "Experimental live video processing with sub-second latency." },
            { icon: Camera, title: "Visual Intelligence", desc: "Advanced computer vision that understands context and expression." }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors"
            >
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
