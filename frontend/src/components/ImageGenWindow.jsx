import React, { useState } from 'react';
import { 
  Sparkles, Download, Share2, Image as ImageIcon, 
  Trash2, Sliders, RefreshCw, ZoomIn, EyeOff, LayoutTemplate
} from 'lucide-react';
import axios from 'axios';

export default function ImageGenWindow() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('Realistic');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImg, setGeneratedImg] = useState(null);
  
  // Keep local history of generations
  const [history, setHistory] = useState([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      // Hit FastAPI backend
      const response = await axios.post('/api/ai/image', {
        prompt,
        aspect_ratio: aspectRatio,
        style,
        negative_prompt: negativePrompt
      });

      if (response.data.success) {
        const imgData = response.data.image;
        setGeneratedImg(imgData);
        
        // Add to history
        const newGen = {
          id: Date.now(),
          prompt,
          style,
          aspectRatio,
          url: imgData
        };
        setHistory((prev) => [newGen, ...prev]);
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Image generation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imgUrl) => {
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `devora-ai-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteHistoryItem = (id) => {
    setHistory((prev) => prev.filter(item => item.id !== id));
  };

  const aspectRatios = [
    { label: 'Square 1:1', value: '1:1' },
    { label: 'Landscape 16:9', value: '16:9' },
    { label: 'Portrait 9:16', value: '9:16' },
    { label: 'Standard 4:3', value: '4:3' }
  ];

  const stylePresets = [
    { name: 'Realistic', label: '📸 Photorealistic' },
    { name: 'Anime', label: '🎨 Anime Art' },
    { name: '3D', label: '🧸 3D Render' },
    { name: 'Cartoon', label: '✏️ Vector Cartoon' },
    { name: 'Cyberpunk', label: '🌃 Cyberpunk' },
    { name: 'Watercolor', label: '🌊 Watercolor' }
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#05070f]">
      
      {/* Control panel (Left) */}
      <div className="w-full md:w-96 border-b md:border-b-0 md:border-r border-brand-border p-5 md:p-6 overflow-y-auto flex flex-col gap-6 shrink-0 bg-brand-dark/20">
        
        {/* Title */}
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="text-brand-secondary" size={18} />
            Creative Canvas
          </h2>
          <p className="text-xs text-brand-muted mt-1 leading-relaxed">
            Translate thoughts into highly stylized illustrations using Stable Diffusion.
          </p>
        </div>

        {/* Text Prompt */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Image Prompt</label>
          <textarea
            placeholder="A mystical neon-lit forest with glowing butterflies and stone ruins..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            rows={4}
            className="w-full p-3 rounded-xl bg-brand-dark/50 border border-brand-border focus:border-brand-primary text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors resize-none disabled:opacity-50"
          />
        </div>

        {/* Negative Prompt */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
            <EyeOff size={11} /> Negative Prompt
          </label>
          <input
            type="text"
            placeholder="blurry, deformed limbs, text, watermark..."
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 rounded-xl bg-brand-dark/50 border border-brand-border focus:border-brand-primary text-xs text-gray-200 placeholder-gray-600 outline-none transition-colors disabled:opacity-50"
          />
        </div>

        {/* Style Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
            <Sliders size={11} /> Style Presets
          </label>
          <div className="grid grid-cols-2 gap-2">
            {stylePresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setStyle(preset.name)}
                disabled={isLoading}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-all active:scale-[0.98] ${style === preset.name ? 'bg-brand-secondary/15 border-brand-secondary text-brand-secondary' : 'bg-white/5 border-brand-border text-gray-400 hover:text-white'}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
            <LayoutTemplate size={11} /> Aspect Ratio
          </label>
          <div className="grid grid-cols-2 gap-2">
            {aspectRatios.map((ratio) => (
              <button
                key={ratio.value}
                onClick={() => setAspectRatio(ratio.value)}
                disabled={isLoading}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${aspectRatio === ratio.value ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'bg-white/5 border-brand-border text-gray-400 hover:text-white'}`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trigger Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full py-3 px-4 mt-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 disabled:opacity-30 text-white font-bold flex items-center justify-center gap-2 shadow-glow-secondary active:scale-[0.98] transition-all disabled:pointer-events-none"
        >
          {isLoading ? (
            <>
              <RefreshCw className="animate-spin" size={18} />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Image
            </>
          )}
        </button>
      </div>

      {/* Main Canvas Display Area (Right) */}
      <div className="flex-1 p-5 md:p-8 flex flex-col gap-6 overflow-y-auto">
        <div className="flex-1 flex items-center justify-center border border-dashed border-brand-border rounded-3xl bg-brand-dark/10 p-4 relative min-h-[300px] md:min-h-0">
          
          {isLoading ? (
            /* Generating loading animation */
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20 border-t-brand-primary animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-brand-secondary/20 border-b-brand-secondary animate-spin" style={{ animationDirection: 'reverse' }}></div>
              </div>
              <p className="text-sm font-semibold text-white animate-pulse">Rendering canvas vectors...</p>
            </div>
          ) : generatedImg ? (
            /* Render generated image with actions */
            <div className="relative group max-w-full max-h-[500px] rounded-2xl overflow-hidden border border-brand-border shadow-glow-primary">
              <img src={generatedImg} alt="Generated AI Output" className="max-w-full max-h-[500px] object-contain rounded-2xl" />
              
              {/* Image Actions bar on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 backdrop-blur-xs">
                <button
                  onClick={() => handleDownload(generatedImg)}
                  className="p-3 bg-white hover:bg-gray-100 text-brand-dark rounded-full shadow transition-transform active:scale-90"
                  title="Download Image"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedImg);
                    alert('Base64 image copied to clipboard!');
                  }}
                  className="p-3 bg-white hover:bg-gray-100 text-brand-dark rounded-full shadow transition-transform active:scale-90"
                  title="Copy Image Data"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          ) : (
            /* Empty Canvas State */
            <div className="text-center max-w-sm flex flex-col items-center">
              <div className="p-4 rounded-2xl bg-white/5 border border-brand-border text-brand-muted mb-4">
                <ImageIcon size={32} />
              </div>
              <p className="text-sm font-bold text-white mb-1">Interactive Image Canvas</p>
              <p className="text-xs text-brand-muted leading-relaxed">
                Write a descriptive prompt in the left panel and click generate to render artwork.
              </p>
            </div>
          )}
        </div>

        {/* Gallery History List */}
        {history.length > 0 && (
          <div className="border-t border-brand-border pt-5">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              Recent Art Generations ({history.length})
            </h3>
            
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {history.map((item) => (
                <div key={item.id} className="relative group aspect-square rounded-xl overflow-hidden border border-brand-border bg-brand-dark/40 shadow-sm hover:border-brand-primary/30 transition-all">
                  <img src={item.url} alt="History thumb" className="w-full h-full object-cover" />
                  
                  {/* Overlay buttons */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDownload(item.url)}
                      className="p-1.5 bg-white text-brand-dark rounded-lg hover:scale-105 active:scale-95 transition-transform"
                      title="Download"
                    >
                      <Download size={13} />
                    </button>
                    <button
                      onClick={() => setGeneratedImg(item.url)}
                      className="p-1.5 bg-white text-brand-dark rounded-lg hover:scale-105 active:scale-95 transition-transform"
                      title="View full"
                    >
                      <ZoomIn size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteHistoryItem(item.id)}
                      className="p-1.5 bg-red-500 text-white rounded-lg hover:scale-105 active:scale-95 transition-transform"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
