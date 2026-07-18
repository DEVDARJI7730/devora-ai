import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Send, Paperclip, Mic, MicOff, AlertCircle, RefreshCw, 
  Copy, Check, StopCircle, ArrowDown, FileText, Image as ImageIcon,
  Code, Play, Terminal, HelpCircle, FileSpreadsheet, FileCode
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import hljs from 'highlight.js';

export default function ChatWindow() {
  const { activeChat, sendMessage, isGenerating, stopGenerating } = useChatStore();
  const { user } = useAuthStore();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  
  // File attachments state
  const [attachedFile, setAttachedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto Scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isGenerating]);

  // Monitor scroll height to display "scroll to bottom" button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 300);
  };

  // Web Speech STT setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => setIsListening(true);
        rec.onresult = (e) => {
          const transcript = e.results[0][0].transcript;
          if (transcript) {
            setInputText((prev) => prev + " " + transcript);
          }
        };
        rec.onerror = (err) => {
          console.error('Speech recognition error:', err);
          setIsListening(false);
        };
        rec.onend = () => setIsListening(false);
        recognitionRef.current = rec;
      }
    }
  }, []);

  const handleToggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition API is not supported in this browser. Try Chrome/Edge!');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // File Upload trigger
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await uploadAttachedFile(e.target.files[0]);
    }
  };

  const uploadAttachedFile = async (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Hit Express upload API
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setAttachedFile(res.data);
      }
    } catch (err) {
      console.error('File upload failed:', err);
      alert('Failed to upload file. Max size 10MB.');
    } finally {
      setIsUploading(false);
    }
  };

  // Drag and Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadAttachedFile(e.dataTransfer.files[0]);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && !attachedFile) return;
    
    // Package attachment
    const attachmentPayload = attachedFile ? {
      type: attachedFile.type.startsWith('image/') ? 'image' : 'file',
      name: attachedFile.name,
      size: attachedFile.size,
      url: attachedFile.url,
      preview: attachedFile.preview
    } : null;

    setAttachedFile(null);
    setInputText('');
    
    await sendMessage(inputText, attachmentPayload);
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(''), 2000);
  };

  const handleQuickPrompt = (promptText) => {
    setInputText(promptText);
  };

  // Format File Size
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Code Block Custom Renderer
  const renderCodeBlock = (code, language) => {
    const blockId = Math.random().toString(36).substring(7);
    return (
      <div className="relative border border-brand-border rounded-xl my-4 overflow-hidden bg-brand-dark/90">
        <div className="flex items-center justify-between px-4 py-2 border-b border-brand-border bg-white/5 text-xs text-gray-400">
          <span className="font-mono flex items-center gap-1.5 uppercase font-semibold">
            <Code size={13} className="text-brand-primary" />
            {language || 'code'}
          </span>
          <button 
            onClick={() => handleCopyCode(code, blockId)}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            {copiedCodeId === blockId ? (
              <>
                <Check size={12} className="text-brand-secondary" />
                Copied
              </>
            ) : (
              <>
                <Copy size={12} />
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto font-mono text-sm leading-relaxed text-gray-200">
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full bg-[#05070f] relative overflow-hidden"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      {/* Messages Canvas */}
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6"
      >
        {!activeChat || activeChat.messages.length === 0 ? (
          /* Empty Welcoming Screen */
          <div className="max-w-3xl mx-auto pt-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-white text-3xl font-extrabold shadow-glow-primary mb-6 pulse-glow">
              D
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2 font-sans">
              Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">Devora AI</span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base max-w-lg mb-10 leading-relaxed">
              Your multimodal productivity workspace. Ask questions, analyze documents, write programs, or draw conceptual art instantly.
            </p>

            {/* Quick Helper Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
              <QuickPromptCard 
                icon={<Code size={18} className="text-brand-primary" />}
                title="Write a Python Script"
                subtitle="Generate a modular class for data science"
                prompt="Write a production-grade Python script to parse a JSON dataset and plot the results."
                onClick={handleQuickPrompt}
              />
              <QuickPromptCard 
                icon={<FileSpreadsheet size={18} className="text-brand-secondary" />}
                title="Spreadsheet Analysis"
                subtitle="Calculate values from project data"
                prompt="Summarize the core concepts of building an agile project costs spreadsheet with fields for tasks, developers, and hourly rates."
                onClick={handleQuickPrompt}
              />
              <QuickPromptCard 
                icon={<Terminal size={18} className="text-brand-primary" />}
                title="Debug Code Block"
                subtitle="Find syntax errors or optimize speed"
                prompt="Optimize this JavaScript filter loop for large array memory efficiency:\n```javascript\nconst results = items.filter(i => i.active).map(i => i.value);\n```"
                onClick={handleQuickPrompt}
              />
              <QuickPromptCard 
                icon={<HelpCircle size={18} className="text-brand-secondary" />}
                title="Explain Complex Math"
                subtitle="Solve equations or physics concepts"
                prompt="Explain the difference between discrete cosine transforms and fourier transforms in simple terms."
                onClick={handleQuickPrompt}
              />
            </div>
          </div>
        ) : (
          /* Render Active Message list */
          <div className="max-w-3xl mx-auto space-y-6">
            {activeChat.messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-4 p-4 rounded-2xl transition-all border ${msg.sender === 'user' ? 'bg-white/5 border-white/5 ml-12' : 'glass-panel border-brand-border mr-12'}`}
              >
                {/* Profile Circle */}
                <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center font-bold text-sm ${msg.sender === 'user' ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/20' : 'bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-glow-primary'}`}>
                  {msg.sender === 'user' ? (user?.fullName.charAt(0) || 'U') : 'D'}
                </div>

                {/* Content Box */}
                <div className="flex-1 overflow-hidden space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                    <span>{msg.sender === 'user' ? 'You' : 'Devora AI'}</span>
                    {msg.mode && <span>Mode: {msg.mode}</span>}
                  </div>

                  {/* Attachment Preview (if User message has files) */}
                  {msg.attachment && (
                    <div className="p-3 border border-brand-border bg-brand-dark/40 rounded-xl max-w-sm flex items-center gap-3">
                      {msg.attachment.type === 'image' ? (
                        <div className="relative group rounded-lg overflow-hidden border border-brand-border shrink-0 w-16 h-16">
                          <img src={msg.attachment.url} alt="Attachment" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="p-2 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-lg shrink-0">
                          <FileText size={18} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{msg.attachment.name || 'Image Snapshot'}</p>
                        {msg.attachment.size && <p className="text-[10px] text-gray-500 mt-0.5">{formatBytes(msg.attachment.size)}</p>}
                      </div>
                    </div>
                  )}

                  {/* Render Markdown Text */}
                  <div className="text-gray-200 text-sm leading-relaxed prose prose-invert max-w-none">
                    {msg.text ? (
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const codeContent = String(children).replace(/\n$/, '');
                            return !inline ? (
                              renderCodeBlock(codeContent, match ? match[1] : '')
                            ) : (
                              <code className="bg-brand-dark/60 text-brand-primary border border-brand-border px-1.5 py-0.5 rounded font-mono text-xs" {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      /* If AI is still streaming, display thinking dots */
                      <div className="flex items-center gap-1 py-2">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Bottom Control Actions */}
      <div className="p-4 md:p-6 bg-gradient-to-t from-[#05070f] via-[#05070f]/90 to-transparent relative shrink-0">
        <div className="max-w-3xl mx-auto">
          {/* Scroll Down Trigger */}
          {showScrollBtn && (
            <button 
              onClick={scrollToBottom}
              className="absolute -top-12 left-1/2 -translate-x-1/2 p-2 rounded-full border border-brand-border bg-brand-dark hover:bg-white/5 text-gray-400 hover:text-white transition-all shadow-lg active:scale-95"
            >
              <ArrowDown size={16} />
            </button>
          )}

          {/* Drag Overlay HUD */}
          {dragActive && (
            <div className="absolute inset-0 m-4 rounded-2xl border-2 border-dashed border-brand-primary bg-brand-primary/5 flex items-center justify-center gap-3 backdrop-blur-sm z-10 transition-colors pointer-events-none">
              <Paperclip size={24} className="text-brand-primary animate-bounce" />
              <span className="text-brand-primary font-bold text-sm">Drop your document or image here to attach</span>
            </div>
          )}

          {/* Attached File Preview Card */}
          {attachedFile && (
            <div className="mb-3 p-3 bg-brand-dark/85 border border-brand-primary/20 rounded-xl flex items-center justify-between gap-3 max-w-md shadow-glow-primary">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {attachedFile.type.startsWith('image/') ? (
                  <img src={attachedFile.preview} alt="Thumb" className="w-10 h-10 object-cover rounded-lg border border-brand-border shrink-0" />
                ) : (
                  <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg shrink-0">
                    <FileText size={16} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{attachedFile.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{formatBytes(attachedFile.size)}</p>
                </div>
              </div>
              <button 
                onClick={() => setAttachedFile(null)}
                className="p-1 rounded bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              >
                ✕
              </button>
            </div>
          )}

          {/* Active Input Container */}
          <div className="relative rounded-2xl bg-brand-dark/45 border border-brand-border focus-within:border-brand-primary transition-all p-2 flex flex-col gap-2">
            
            {/* Form row */}
            <div className="flex items-center gap-1.5">
              {/* Attach File Button */}
              <button 
                disabled={isGenerating || isUploading}
                onClick={triggerFileSelect}
                className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all active:scale-95 disabled:opacity-50"
                title="Attach Document or Image"
              >
                <Paperclip size={18} />
              </button>
              <input 
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.csv,.pdf,.docx,.doc,.xlsx,.xls,image/*"
              />

              {/* Text Input area */}
              <input 
                type="text" 
                placeholder={isUploading ? "Uploading file..." : "Ask Devora AI a question..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleSend()}
                disabled={isGenerating || isUploading}
                className="flex-1 bg-transparent text-sm text-gray-100 py-3 px-2 outline-none border-none placeholder-gray-500 disabled:opacity-50"
              />

              {/* Speech Microphone button */}
              <button 
                onClick={handleToggleMic}
                disabled={isGenerating}
                className={`p-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                title={isListening ? "Listening..." : "Dictate text"}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              {/* Action Submit or Abort Button */}
              {isGenerating ? (
                <button 
                  onClick={stopGenerating}
                  className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all active:scale-95 flex items-center justify-center"
                  title="Stop Generating"
                >
                  <StopCircle size={18} />
                </button>
              ) : (
                <button 
                  onClick={handleSend}
                  disabled={(!inputText.trim() && !attachedFile) || isUploading}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 disabled:opacity-30 text-white shadow-glow-primary transition-all active:scale-[0.97]"
                >
                  <Send size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickPromptCard({ icon, title, subtitle, prompt, onClick }) {
  return (
    <button 
      onClick={() => onClick(prompt)}
      className="p-4 rounded-2xl glass-card hover:bg-white/5 hover:border-brand-primary/20 text-left transition-all border border-brand-border flex items-start gap-4 focus:outline-none group active:scale-[0.98]"
    >
      <div className="p-2.5 bg-white/5 rounded-xl shrink-0 group-hover:bg-brand-primary/10 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-white mb-0.5">{title}</p>
        <p className="text-[10px] text-brand-muted leading-tight">{subtitle}</p>
      </div>
    </button>
  );
}
