import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Shield, Cpu, MessageSquare, ArrowRight, Check, Zap, 
  HelpCircle, ChevronDown, Github, Globe, Star, Image, Mic
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [activeFaq, setActiveFaq] = useState(null);

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      icon: <MessageSquare className="text-brand-primary" size={24} />,
      title: "Real-time AI Reasoning",
      desc: "Live streamed markdown responses powered by high-performance Large Language Models."
    },
    {
      icon: <Image className="text-brand-secondary" size={24} />,
      title: "Stable Diffusion Studio",
      desc: "Generate stunning art illustrations inside an aspect-ratio adjustable visual canvas."
    },
    {
      icon: <Mic className="text-brand-primary" size={24} />,
      title: "Speech & TTS bridges",
      desc: "Microphone dictate capabilities with clean text-to-speech audio reader support."
    },
    {
      icon: <Shield className="text-brand-secondary" size={24} />,
      title: "Enterprise Grade Security",
      desc: "Rate limited endpoints, CORS setups, Helmet headers, and secure JWT verification."
    },
    {
      icon: <Cpu className="text-brand-primary" size={24} />,
      title: "Zustand State Store",
      desc: "Ultra-fast global caching of session tokens, chat history list details, and models."
    },
    {
      icon: <Sparkles className="text-brand-secondary" size={24} />,
      title: "Productivity Tool Hubs",
      desc: "Custom templates: check grammar, convert languages, write SQL statements, structure resumes."
    }
  ];

  const pricingTiers = [
    {
      name: "Starter Guest Tier",
      price: "$0",
      period: "forever free",
      features: [
        "Access to Gemini 2.5 Flash API",
        "Up to 20 images generated / daily",
        "Full AI productivity tools list",
        "Standard local chat memory",
        "Community forum updates"
      ],
      cta: "Try Out Live",
      popular: false
    },
    {
      name: "Devora Professional",
      price: "$20",
      period: "per user / month",
      features: [
        "Access to Live OpenAI GPT-4o models",
        "Unlimited high-resolution Stable Diffusion art",
        "100MB Document / PDF OCR uploads",
        "Saved history sessions with Atlas sync",
        "Priority API query queue processing"
      ],
      cta: "Go Unlimited",
      popular: true
    }
  ];

  const faqs = [
    {
      q: "What is Devora AI platform?",
      a: "Devora AI is a production-grade personal assistant application that leverages Express backends, MongoDB databases, and Python FastAPI servers to stream intelligent text completions, compile code, execute file intelligence, and render graphics from prompts."
    },
    {
      q: "Do I need paid API keys to test the platform?",
      a: "No! Devora AI is configured to run smoothly in fallback 'simulation mode' or hook into free API endpoints (such as Google Gemini Free tier and Pollinations AI) to guarantee zero setup cost."
    },
    {
      q: "Is my personal chat database secure?",
      a: "Absolutely. All session tokens are encrypted using JSON Web Tokens (JWT) and cookies storage, with password hashing handled on the database via bcrypt. API queries are protected by rate limiting filters."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#05070f] relative overflow-hidden text-gray-100 selection:bg-brand-primary/30 selection:text-white">
      
      {/* Background Neon Pulsing Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[120px] pulse-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary/5 rounded-full blur-[120px] pulse-glow" style={{ animationDelay: '2s' }}></div>

      {/* Header Navbar */}
      <header className="glass-panel border-b border-brand-border h-16 w-full flex items-center justify-between px-6 md:px-12 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center font-extrabold text-white shadow-glow-primary">
            D
          </div>
          <span className="text-lg font-bold text-white">
            Devora<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary font-extrabold">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <button 
            onClick={handleStart}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold text-sm shadow-glow-primary hover:opacity-90 active:scale-95 transition-all"
          >
            Launch Platform
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center justify-center text-center relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-primary/35 bg-brand-primary/5 text-xs text-brand-primary font-semibold mb-6 animate-pulse">
          <Sparkles size={12} />
          Now Powered by Gemini 2.5 Flash API
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl font-sans">
          The Enterprise Workspace for <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">Intelligent AI</span> Assistants
        </h1>
        
        <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mb-8 leading-relaxed">
          Devora AI compiles text reasoning, vector art rendering, file analysis, and custom productivity templates into a unified, secure dashboard environment.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <button 
            onClick={handleStart}
            className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold shadow-glow-primary hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 transition-all"
          >
            Launch Devora AI
            <ArrowRight size={16} />
          </button>
          <a 
            href="#features"
            className="w-full sm:w-auto py-3 px-6 rounded-xl border border-brand-border bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-sm transition-all"
          >
            Explore Features
          </a>
        </div>

        {/* Mockup Dashboard Preview Container */}
        <div className="w-full rounded-2xl border border-brand-border p-3 glass-card shadow-glow-primary float-animation">
          <div className="w-full aspect-[16/9] bg-[#0b0e17] rounded-xl overflow-hidden border border-brand-border/60 flex items-center justify-center relative">
            {/* Visual simulation overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-dark/95 z-10 pointer-events-none"></div>
            <div className="p-6 text-left absolute top-8 left-8 space-y-4 max-w-sm">
              <div className="w-8 h-8 rounded bg-brand-primary flex items-center justify-center font-bold text-xs text-white">D</div>
              <h3 className="text-sm font-bold text-white">Chat Workspace Loaded</h3>
              <p className="text-xs text-gray-500 leading-normal">
                Connecting users to live backend routers... History synchronizing on MongoDB database cluster successfully.
              </p>
            </div>
            
            <span className="text-xs font-mono px-3.5 py-2 rounded-xl bg-white/5 border border-brand-border font-bold text-brand-secondary flex items-center gap-2 relative z-20">
              <Zap size={12} className="animate-bounce" />
              Live Dashboard Ready
            </span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 md:px-12 border-t border-brand-border bg-brand-dark/10 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Comprehensive Multimodal Architecture
          </h2>
          <p className="text-xs text-brand-muted mt-2">
            A production-ready project structured with clear boundaries for frontends, databases, and Python workers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div key={idx} className="p-6 rounded-2xl glass-card border border-brand-border hover:border-brand-primary/20 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 group-hover:bg-brand-primary/10 transition-colors">
                {feat.icon}
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-xs text-brand-muted leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 md:px-12 border-t border-brand-border max-w-5xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Flexible Subscription Options
          </h2>
          <p className="text-xs text-brand-muted mt-2">
            Sign in as Guest for instant mock simulations or load environment keys to connect unlimited live completions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {pricingTiers.map((tier, idx) => (
            <div key={idx} className={`p-6 md:p-8 rounded-2xl flex flex-col justify-between border relative ${tier.popular ? 'bg-brand-primary/5 border-brand-primary shadow-glow-primary' : 'glass-card border-brand-border'}`}>
              {tier.popular && (
                <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider">
                  Popular Choice
                </span>
              )}
              <div>
                <h3 className="text-base font-bold text-white">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mt-4 mb-2">
                  <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                  <span className="text-xs text-brand-muted">/ {tier.period}</span>
                </div>
                <ul className="mt-6 space-y-3.5">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-3 text-xs text-gray-300">
                      <Check size={14} className="text-brand-secondary shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={handleStart}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs mt-8 transition-all active:scale-95 ${tier.popular ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-glow-primary' : 'bg-white/5 border border-brand-border text-white hover:bg-white/10'}`}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 md:px-12 border-t border-brand-border max-w-4xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-xl border border-brand-border bg-brand-dark/25 overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle size={15} className="text-brand-primary" />
                  {faq.q}
                </span>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 pt-1 border-t border-brand-border/40 text-xs sm:text-sm text-gray-400 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-brand-border p-8 bg-brand-dark/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-muted">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Devora AI</span>
            <span>© 2026 - Production Ready AI Architecture</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white flex items-center gap-1.5 transition-colors">
              <Globe size={13} />
              Website
            </a>
            <a href="#" className="hover:text-white flex items-center gap-1.5 transition-colors">
              <Github size={13} />
              Repository
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
